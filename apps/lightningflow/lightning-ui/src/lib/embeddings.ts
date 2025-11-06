import { createClient } from '@/lib/supabase/server';
import { OpenAI } from 'openai';

// Create OpenAI client when needed to avoid build-time issues
function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

export interface EmbeddingResult {
  id: string;
  content: string;
  title: string | null;
  summary: string | null;
  metadata: any;
  similarity: number;
}

export interface DocumentToEmbed {
  content: string;
  title?: string;
  summary?: string;
  metadata?: Record<string, any>;
}

/**
 * Generate embeddings for text using OpenAI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const openai = getOpenAIClient();
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.replace(/\n/g, ' ').trim()
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

/**
 * Store document with embedding in Supabase
 */
export async function storeEmbedding(doc: DocumentToEmbed): Promise<string> {
  const supabase = createClient();
  const embedding = await generateEmbedding(doc.content);

  const { data, error } = await supabase
    .from('loop_embeddings')
    .insert({
      content: doc.content,
      title: doc.title || null,
      summary: doc.summary || null,
      metadata: doc.metadata || {},
      embedding
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error storing embedding:', error);
    throw new Error('Failed to store embedding');
  }

  return data.id;
}

/**
 * Search for similar documents using vector similarity
 */
export async function searchSimilar(
  query: string, 
  limit: number = 5,
  threshold: number = 0.75
): Promise<EmbeddingResult[]> {
  const supabase = createClient();
  const queryEmbedding = await generateEmbedding(query);

  const { data, error } = await supabase.rpc('match_loop_embeddings', {
    query_embedding: queryEmbedding,
    match_threshold: threshold,
    match_count: limit
  });

  if (error) {
    console.error('Error searching embeddings:', error);
    throw new Error('Failed to search embeddings');
  }

  return data || [];
}

/**
 * Extract title and summary from markdown content
 */
export function parseMarkdown(content: string): { title?: string; summary?: string } {
  // Extract title from first heading
  const titleMatch = content.match(/^# (.+)/m);
  const title = titleMatch?.[1]?.trim();

  // Extract summary from first paragraph after title
  const lines = content.split('\n');
  let summaryLine = '';
  let foundTitle = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('#')) {
      foundTitle = true;
      continue;
    }
    
    if (foundTitle && trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('```')) {
      summaryLine = trimmed;
      break;
    }
  }

  return {
    title,
    summary: summaryLine || undefined
  };
}

/**
 * Chunk large documents for better embedding performance
 */
export function chunkDocument(content: string, maxChunkSize: number = 1000): string[] {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if (currentChunk.length + trimmed.length > maxChunkSize && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = trimmed;
    } else {
      currentChunk += (currentChunk ? '. ' : '') + trimmed;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Store multiple documents with chunking
 */
export async function storeDocumentWithChunking(
  content: string,
  metadata: Record<string, any> = {},
  maxChunkSize: number = 1000
): Promise<string[]> {
  const { title, summary } = parseMarkdown(content);
  const chunks = chunkDocument(content, maxChunkSize);
  const ids: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunkMetadata = {
      ...metadata,
      chunk_index: i,
      total_chunks: chunks.length,
      is_first_chunk: i === 0
    };

    const id = await storeEmbedding({
      content: chunks[i],
      title: i === 0 ? title : undefined, // Only store title in first chunk
      summary: i === 0 ? summary : undefined, // Only store summary in first chunk
      metadata: chunkMetadata
    });

    ids.push(id);
  }

  return ids;
} 