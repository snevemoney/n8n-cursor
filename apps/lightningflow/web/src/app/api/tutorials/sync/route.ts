import { NextRequest, NextResponse } from 'next/server';
import { assertSupabase } from '@/lib/supabase-server';
import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkHtml from 'remark-html';

// Safe OpenAI client creation with fallbacks
const createOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey || apiKey.includes('placeholder')) {
    console.warn('OpenAI not configured - using mock mode');
    return null;
  }
  
  return new OpenAI({ apiKey });
};

const openai = createOpenAIClient();

interface TutorialMetadata {
  title: string;
  summary?: string;
  category: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  estimatedReadTime?: number;
  videoUrl?: string;
  videoDuration?: number;
  tooltipMarkers?: Array<{ time: number; text: string }>;
  prerequisites?: string[];
}

/**
 * Auto-sync Tutorials to Vector Database
 * 
 * This endpoint:
 * 1. Scans tutorial markdown files
 * 2. Extracts frontmatter metadata
 * 3. Chunks content for optimal embedding
 * 4. Generates embeddings using OpenAI
 * 5. Upserts to Supabase with vector storage
 */
export async function POST(request: NextRequest) {
  try {
    // Return mock response if services not configured
    if (!openai) {
      return NextResponse.json({
        success: true,
        processed: 0,
        errors: 0,
        tutorials: [],
        errorDetails: [],
        message: 'Tutorial sync skipped - services not configured',
        mode: 'mock'
      });
    }

    const { tutorialPath, forceUpdate = false } = await request.json();

    // Security check - only allow specific paths
    const allowedPaths = [
      'docs/tutorials',
      'web/src/content/tutorials',
      'web/docs/lightning',
    ];

    if (tutorialPath && !allowedPaths.some(allowed => tutorialPath.includes(allowed))) {
      return NextResponse.json(
        { error: 'Unauthorized tutorial path' },
        { status: 403 }
      );
    }

    const tutorialsDir = tutorialPath || path.join(process.cwd(), 'docs', 'tutorials');
    const processedTutorials: any[] = [];
    const errors: any[] = [];

    try {
      await fs.access(tutorialsDir);
    } catch (error) {
      return NextResponse.json(
        { error: `Tutorial directory not found: ${tutorialsDir}` },
        { status: 404 }
      );
    }

    // Recursively find all markdown files
    const markdownFiles = await findMarkdownFiles(tutorialsDir);

    for (const filePath of markdownFiles) {
      try {
        const tutorial = await processTutorialFile(filePath, forceUpdate);
        if (tutorial) {
          processedTutorials.push(tutorial);
        }
      } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
        errors.push({
          file: filePath,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedTutorials.length,
      errors: errors.length,
      tutorials: processedTutorials,
      errorDetails: errors,
    });

  } catch (error) {
    console.error('Tutorial sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error during tutorial sync' },
      { status: 500 }
    );
  }
}

/**
 * Process a single tutorial markdown file
 */
async function processTutorialFile(filePath: string, forceUpdate: boolean) {
  // Skip if services not configured
  if (!openai) {
    console.log('Skipping tutorial processing - services not configured');
    return null;
  }

  const content = await fs.readFile(filePath, 'utf-8');
  const { data: frontmatter, content: markdownContent } = matter(content);
  
  // Generate slug from filename
  const filename = path.basename(filePath, '.md');
  const slug = filename.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // Extract metadata
  const metadata: TutorialMetadata = {
    title: frontmatter.title || filename.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    summary: frontmatter.summary || frontmatter.description,
    category: frontmatter.category || 'lightning',
    difficulty: frontmatter.difficulty || 'beginner',
    tags: frontmatter.tags || [],
    estimatedReadTime: frontmatter.estimatedReadTime || estimateReadTime(markdownContent),
    videoUrl: frontmatter.videoUrl,
    videoDuration: frontmatter.videoDuration,
    tooltipMarkers: frontmatter.tooltipMarkers,
    prerequisites: frontmatter.prerequisites || [],
  };

  // Check if tutorial already exists
  const { data: existingTutorial } = await assertSupabase()
    .from('tutorials')
    .select('id, updated_at')
    .eq('slug', slug)
    .single();

  // Skip if exists and not forcing update
  if (existingTutorial && !forceUpdate) {
    console.log(`Skipping existing tutorial: ${slug}`);
    return null;
  }

  // Upsert tutorial
  const { data: tutorial, error: tutorialError } = await assertSupabase()
    .from('tutorials')
    .upsert({
      id: existingTutorial?.id,
      slug,
      title: metadata.title,
      summary: metadata.summary,
      content: markdownContent,
      content_type: 'markdown',
      category: metadata.category,
      difficulty: metadata.difficulty,
      tags: metadata.tags,
      estimated_read_time: metadata.estimatedReadTime,
      video_url: metadata.videoUrl,
      video_duration: metadata.videoDuration,
      tooltip_markers: metadata.tooltipMarkers,
      prerequisites: metadata.prerequisites,
      is_published: true,
      tenant_id: null, // Global tutorials
    }, { onConflict: 'slug' })
    .select('id')
    .single();

  if (tutorialError) {
    throw new Error(`Failed to upsert tutorial: ${tutorialError.message}`);
  }

  if (!tutorial) {
    throw new Error('Tutorial upsert returned no data');
  }

  // Process embeddings
  await processEmbeddings(tutorial.id, markdownContent, metadata);

  return {
    id: tutorial.id,
    slug,
    title: metadata.title,
    category: metadata.category,
    chunks: await getChunkCount(markdownContent),
  };
}

/**
 * Generate and store embeddings for tutorial content
 */
async function processEmbeddings(tutorialId: string, content: string, metadata: TutorialMetadata) {
  // Skip if services not configured
  if (!openai) {
    console.log('Skipping embedding processing - services not configured');
    return;
  }

  // Delete existing embeddings
  await assertSupabase()
    .from('tutorial_embeddings')
    .delete()
    .eq('tutorial_id', tutorialId);

  // Chunk content for better embeddings
  const chunks = chunkContent(content, 1000, 200); // 1000 chars with 200 char overlap

  const embeddingPromises = chunks.map(async (chunk, index) => {
    try {
      // Generate embedding
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: chunk.text,
      });

      const embedding = embeddingResponse.data[0].embedding;

      // Store embedding
      return assertSupabase()
        .from('tutorial_embeddings')
        .insert({
          tutorial_id: tutorialId,
          content_chunk: chunk.text,
          chunk_index: index,
          embedding: embedding,
          metadata: {
            section: chunk.section,
            subsection: chunk.subsection,
            category: metadata.category,
            difficulty: metadata.difficulty,
            wordCount: chunk.text.split(' ').length,
          },
        });
    } catch (error) {
      console.error(`Failed to process chunk ${index}:`, error);
      throw error;
    }
  });

  // Wait for all embeddings to complete
  await Promise.all(embeddingPromises);
}

/**
 * Chunk content into smaller pieces for better embeddings
 */
function chunkContent(content: string, maxChunkSize: number, overlap: number) {
  const chunks: Array<{ text: string; section?: string; subsection?: string }> = [];
  
  // Split by sections first (markdown headers)
  const sections = content.split(/^##?\s+/m);
  let currentSection = '';
  
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    
    if (i === 0) {
      // First section (before any headers)
      currentSection = 'Introduction';
    } else {
      // Extract section title from first line
      const lines = section.split('\n');
      currentSection = lines[0]?.trim() || `Section ${i}`;
    }
    
    const sectionContent = i === 0 ? section : section.substring(section.indexOf('\n') + 1);
    
    // Further chunk if section is too large
    if (sectionContent.length > maxChunkSize) {
      const subChunks = createOverlappingChunks(sectionContent, maxChunkSize, overlap);
      subChunks.forEach((chunk, subIndex) => {
        chunks.push({
          text: chunk,
          section: currentSection,
          subsection: subIndex > 0 ? `Part ${subIndex + 1}` : undefined,
        });
      });
    } else if (sectionContent.trim()) {
      chunks.push({
        text: sectionContent.trim(),
        section: currentSection,
      });
    }
  }
  
  return chunks;
}

/**
 * Create overlapping chunks from text
 */
function createOverlappingChunks(text: string, maxSize: number, overlap: number): string[] {
  const chunks: string[] = [];
  let start = 0;
  
  while (start < text.length) {
    let end = start + maxSize;
    
    // Try to break at word boundary
    if (end < text.length) {
      const lastSpace = text.lastIndexOf(' ', end);
      if (lastSpace > start + maxSize * 0.5) {
        end = lastSpace;
      }
    }
    
    chunks.push(text.substring(start, end).trim());
    start = end - overlap;
    
    if (start >= text.length) break;
  }
  
  return chunks;
}

/**
 * Recursively find all markdown files in directory
 */
async function findMarkdownFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        const subFiles = await findMarkdownFiles(fullPath);
        files.push(...subFiles);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }
  
  return files;
}

/**
 * Estimate reading time in minutes
 */
function estimateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Get chunk count for content
 */
async function getChunkCount(content: string): Promise<number> {
  return chunkContent(content, 1000, 200).length;
}

/**
 * Manual trigger endpoint for single tutorial
 */
export async function PUT(request: NextRequest) {
  try {
    // Return mock response if services not configured
    if (!openai) {
      return NextResponse.json({
        success: true,
        tutorial: {
          id: 'mock-tutorial-id',
          slug: 'mock-tutorial',
          title: 'Mock Tutorial',
          chunks: 0,
        },
        message: 'Tutorial sync skipped - services not configured',
        mode: 'mock'
      });
    }

    const { slug, content, metadata } = await request.json();
    
    if (!slug || !content) {
      return NextResponse.json(
        { error: 'Slug and content are required' },
        { status: 400 }
      );
    }

    // Upsert tutorial
    const { data: tutorial, error: tutorialError } = await assertSupabase()
      .from('tutorials')
      .upsert({
        slug,
        title: metadata.title,
        summary: metadata.summary,
        content,
        content_type: 'markdown',
        category: metadata.category || 'lightning',
        difficulty: metadata.difficulty || 'beginner',
        tags: metadata.tags || [],
        estimated_read_time: metadata.estimatedReadTime || estimateReadTime(content),
        video_url: metadata.videoUrl,
        video_duration: metadata.videoDuration,
        tooltip_markers: metadata.tooltipMarkers,
        prerequisites: metadata.prerequisites || [],
        is_published: true,
        tenant_id: null,
      }, { onConflict: 'slug' })
      .select('id')
      .single();

    if (tutorialError) {
      throw new Error(`Failed to upsert tutorial: ${tutorialError.message}`);
    }

    // Process embeddings
    await processEmbeddings(tutorial.id, content, metadata);

    return NextResponse.json({
      success: true,
      tutorial: {
        id: tutorial.id,
        slug,
        title: metadata.title,
        chunks: await getChunkCount(content),
      },
    });

  } catch (error) {
    console.error('Manual tutorial sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync tutorial' },
      { status: 500 }
    );
  }
} 