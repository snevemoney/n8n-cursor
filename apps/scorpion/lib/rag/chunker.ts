/**
 * Semantic Chunker
 * Intelligent document chunking that respects semantic boundaries
 *
 * Features:
 * - Code-aware chunking (respects functions, classes, scopes)
 * - Markdown-aware chunking (respects sections, headings)
 * - Configurable chunk size and overlap
 * - Metadata extraction (line numbers, language, file type)
 */

import type { ChunkConfig } from './config';
import { CODE_CHUNK_CONFIG, DOC_CHUNK_CONFIG } from './config';

/**
 * Document chunk with metadata
 */
export interface DocumentChunk {
  content: string;
  index: number;              // Chunk index in document
  source: string;             // File path
  metadata: {
    lineStart?: number;
    lineEnd?: number;
    chunkType: 'code' | 'doc' | 'text';
    language?: string;
    boundary?: string;        // 'function', 'class', 'section', etc.
    [key: string]: any;
  };
}

/**
 * Detect file type from extension
 */
function detectFileType(filePath: string): 'code' | 'doc' | 'text' {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';

  const codeExts = [
    'ts', 'tsx', 'js', 'jsx', 'py', 'go', 'rs', 'java', 'cpp', 'c', 'h',
    'cs', 'rb', 'php', 'swift', 'kt', 'scala', 'clj', 'ex', 'exs',
  ];

  const docExts = ['md', 'txt', 'rst', 'org', 'adoc'];

  if (codeExts.includes(ext)) return 'code';
  if (docExts.includes(ext)) return 'doc';
  return 'text';
}

/**
 * Detect programming language from file extension
 */
function detectLanguage(filePath: string): string | undefined {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';

  const langMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    py: 'python',
    go: 'go',
    rs: 'rust',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    cs: 'csharp',
    rb: 'ruby',
    php: 'php',
    swift: 'swift',
    kt: 'kotlin',
    scala: 'scala',
  };

  return langMap[ext];
}

/**
 * Split text into lines with line numbers
 */
interface Line {
  content: string;
  number: number;
}

function splitLines(text: string): Line[] {
  return text.split('\n').map((content, idx) => ({
    content,
    number: idx + 1,
  }));
}

/**
 * Find function/class boundaries in code
 */
interface CodeBoundary {
  type: 'function' | 'class' | 'interface' | 'block';
  startLine: number;
  endLine: number;
  name?: string;
}

function findCodeBoundaries(lines: Line[], language: string): CodeBoundary[] {
  const boundaries: CodeBoundary[] = [];

  // TypeScript/JavaScript patterns
  if (language === 'typescript' || language === 'javascript') {
    let braceStack: number[] = [];
    let currentBoundary: Partial<CodeBoundary> | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].content.trim();
      const lineNum = lines[i].number;

      // Detect function/class start
      if (/^(export\s+)?(async\s+)?function\s+\w+/.test(line)) {
        currentBoundary = {
          type: 'function',
          startLine: lineNum,
          name: line.match(/function\s+(\w+)/)?.[1],
        };
      } else if (/^(export\s+)?(abstract\s+)?class\s+\w+/.test(line)) {
        currentBoundary = {
          type: 'class',
          startLine: lineNum,
          name: line.match(/class\s+(\w+)/)?.[1],
        };
      } else if (/^(export\s+)?interface\s+\w+/.test(line)) {
        currentBoundary = {
          type: 'interface',
          startLine: lineNum,
          name: line.match(/interface\s+(\w+)/)?.[1],
        };
      }

      // Track braces
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;

      if (openBraces > 0 && currentBoundary) {
        braceStack.push(lineNum);
      }

      if (closeBraces > 0 && braceStack.length > 0) {
        braceStack.pop();
        if (braceStack.length === 0 && currentBoundary) {
          // Boundary complete
          boundaries.push({
            ...currentBoundary as CodeBoundary,
            endLine: lineNum,
          });
          currentBoundary = null;
        }
      }
    }
  }

  // Python patterns
  if (language === 'python') {
    let currentIndent = 0;
    let currentBoundary: Partial<CodeBoundary> | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].content;
      const lineNum = lines[i].number;
      const indent = line.search(/\S/);

      if (indent === -1) continue;  // Empty line

      // Detect function/class start
      if (/^\s*def\s+\w+/.test(line)) {
        if (currentBoundary) {
          boundaries.push({ ...currentBoundary as CodeBoundary, endLine: lineNum - 1 });
        }
        currentBoundary = {
          type: 'function',
          startLine: lineNum,
          name: line.match(/def\s+(\w+)/)?.[1],
        };
        currentIndent = indent;
      } else if (/^\s*class\s+\w+/.test(line)) {
        if (currentBoundary) {
          boundaries.push({ ...currentBoundary as CodeBoundary, endLine: lineNum - 1 });
        }
        currentBoundary = {
          type: 'class',
          startLine: lineNum,
          name: line.match(/class\s+(\w+)/)?.[1],
        };
        currentIndent = indent;
      } else if (currentBoundary && indent <= currentIndent && i > 0) {
        // Dedent detected - end current boundary
        boundaries.push({ ...currentBoundary as CodeBoundary, endLine: lineNum - 1 });
        currentBoundary = null;
      }
    }

    // Close final boundary
    if (currentBoundary) {
      boundaries.push({ ...currentBoundary as CodeBoundary, endLine: lines.length });
    }
  }

  return boundaries;
}

/**
 * Find markdown section boundaries
 */
interface SectionBoundary {
  level: number;
  startLine: number;
  endLine: number;
  title: string;
}

function findMarkdownSections(lines: Line[]): SectionBoundary[] {
  const sections: SectionBoundary[] = [];
  let currentSection: Partial<SectionBoundary> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].content.trim();
    const lineNum = lines[i].number;

    // Detect heading
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const title = headingMatch[2];

      // Close previous section
      if (currentSection) {
        sections.push({ ...currentSection as SectionBoundary, endLine: lineNum - 1 });
      }

      // Start new section
      currentSection = {
        level,
        startLine: lineNum,
        title,
      };
    }
  }

  // Close final section
  if (currentSection) {
    sections.push({ ...currentSection as SectionBoundary, endLine: lines.length });
  }

  return sections;
}

/**
 * Chunk code document
 */
function chunkCode(
  text: string,
  source: string,
  config: ChunkConfig
): DocumentChunk[] {
  const lines = splitLines(text);
  const language = detectLanguage(source) || 'unknown';
  const chunks: DocumentChunk[] = [];

  if (config.respectBoundaries) {
    // Chunk by function/class boundaries
    const boundaries = findCodeBoundaries(lines, language);

    if (boundaries.length > 0) {
      for (const boundary of boundaries) {
        const startIdx = boundary.startLine - 1;
        const endIdx = boundary.endLine;
        const content = lines.slice(startIdx, endIdx).map(l => l.content).join('\n');

        if (content.length >= config.minChunkSize) {
          chunks.push({
            content,
            index: chunks.length,
            source,
            metadata: {
              lineStart: boundary.startLine,
              lineEnd: boundary.endLine,
              chunkType: 'code',
              language,
              boundary: boundary.type,
            },
          });
        }
      }
    }

    // If no boundaries found or chunks too small, fall back to sliding window
    if (chunks.length === 0) {
      return chunkBySlidingWindow(lines, source, config, 'code', language);
    }

    return chunks;
  }

  // Sliding window chunking
  return chunkBySlidingWindow(lines, source, config, 'code', language);
}

/**
 * Chunk markdown document
 */
function chunkMarkdown(
  text: string,
  source: string,
  config: ChunkConfig
): DocumentChunk[] {
  const lines = splitLines(text);
  const chunks: DocumentChunk[] = [];

  if (config.respectBoundaries) {
    // Chunk by section boundaries
    const sections = findMarkdownSections(lines);

    if (sections.length > 0) {
      for (const section of sections) {
        const startIdx = section.startLine - 1;
        const endIdx = section.endLine;
        const content = lines.slice(startIdx, endIdx).map(l => l.content).join('\n');

        if (content.length >= config.minChunkSize) {
          chunks.push({
            content,
            index: chunks.length,
            source,
            metadata: {
              lineStart: section.startLine,
              lineEnd: section.endLine,
              chunkType: 'doc',
              boundary: `section-${section.level}`,
            },
          });
        }
      }
    }

    // If sections too large, split them further
    const largeSections = chunks.filter(c => c.content.length > config.maxChunkSize);
    if (largeSections.length > 0) {
      const finalChunks: DocumentChunk[] = [];
      for (const chunk of chunks) {
        if (chunk.content.length > config.maxChunkSize) {
          const subLines = splitLines(chunk.content);
          const subChunks = chunkBySlidingWindow(
            subLines,
            source,
            config,
            'doc'
          );
          finalChunks.push(...subChunks);
        } else {
          finalChunks.push(chunk);
        }
      }
      return finalChunks.map((c, idx) => ({ ...c, index: idx }));
    }

    return chunks;
  }

  // Sliding window chunking
  return chunkBySlidingWindow(lines, source, config, 'doc');
}

/**
 * Sliding window chunking (fallback)
 */
function chunkBySlidingWindow(
  lines: Line[],
  source: string,
  config: ChunkConfig,
  chunkType: 'code' | 'doc' | 'text',
  language?: string
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  let currentChunk: string[] = [];
  let currentLineStart = lines[0]?.number || 1;
  let currentLength = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    currentChunk.push(line.content);
    currentLength += line.content.length;

    // Check if chunk is large enough
    if (currentLength >= config.maxChunkSize) {
      chunks.push({
        content: currentChunk.join('\n'),
        index: chunks.length,
        source,
        metadata: {
          lineStart: currentLineStart,
          lineEnd: line.number,
          chunkType,
          language,
        },
      });

      // Slide window with overlap
      const overlapLines = Math.floor(config.overlap / 50);  // Assume ~50 chars per line
      currentChunk = currentChunk.slice(-overlapLines);
      currentLineStart = lines[i - overlapLines + 1]?.number || line.number;
      currentLength = currentChunk.join('\n').length;
    }
  }

  // Add final chunk
  if (currentChunk.length > 0 && currentLength >= config.minChunkSize) {
    chunks.push({
      content: currentChunk.join('\n'),
      index: chunks.length,
      source,
      metadata: {
        lineStart: currentLineStart,
        lineEnd: lines[lines.length - 1].number,
        chunkType,
        language,
      },
    });
  }

  return chunks;
}

/**
 * Main chunking function
 */
export function chunkDocument(
  text: string,
  source: string,
  config?: ChunkConfig
): DocumentChunk[] {
  const fileType = detectFileType(source);

  // Select config based on file type
  const chunkConfig = config || (fileType === 'code' ? CODE_CHUNK_CONFIG : DOC_CHUNK_CONFIG);

  if (fileType === 'code') {
    return chunkCode(text, source, chunkConfig);
  } else if (fileType === 'doc') {
    return chunkMarkdown(text, source, chunkConfig);
  } else {
    // Plain text - use sliding window
    const lines = splitLines(text);
    return chunkBySlidingWindow(lines, source, chunkConfig, 'text');
  }
}

/**
 * Batch chunk multiple documents
 */
export function chunkDocuments(
  documents: Array<{ text: string; source: string }>,
  config?: ChunkConfig
): DocumentChunk[] {
  return documents.flatMap(doc => chunkDocument(doc.text, doc.source, config));
}
