import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { withErrorHandling } from '@/lib/api-error-handler';

export const dynamic = 'force-dynamic';

/**
 * Resolve prompt file path correctly regardless of cwd
 */
function getPromptPath(filename: string): string {
  const cwd = process.cwd();
  
  // If we're already in apps/scorpion, use relative path
  if (cwd.endsWith('apps/scorpion') || cwd.includes('/apps/scorpion/')) {
    const relativePath = join(cwd, 'lib/prompts', filename);
    if (existsSync(relativePath)) {
      return relativePath;
    }
  }
  
  // Try project root path
  const rootPath = join(cwd, 'apps/scorpion/lib/prompts', filename);
  if (existsSync(rootPath)) {
    return rootPath;
  }
  
  // Fallback: remove duplicate apps/scorpion if present
  const cleanCwd = cwd.replace(/\/apps\/scorpion.*$/, '');
  const fallbackPath = join(cleanCwd, 'apps/scorpion/lib/prompts', filename);
  
  return fallbackPath;
}

/**
 * Validate filename to prevent directory traversal
 */
function validateFilename(filename: string): boolean {
  // Only allow alphanumeric, dots, hyphens, and underscores
  // Must end with .txt
  const validPattern = /^[a-zA-Z0-9._-]+\.txt$/;
  return validPattern.test(filename);
}

/**
 * GET /api/prompts/[filename] - Read a prompt file
 */
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { filename: string } }
) => {
  const filename = params.filename;
  
  if (!validateFilename(filename)) {
    return NextResponse.json(
      { error: 'Invalid filename' },
      { status: 400 }
    );
  }

  try {
    const promptPath = getPromptPath(filename);
    
    if (!existsSync(promptPath)) {
      return NextResponse.json(
        { error: 'Prompt file not found' },
        { status: 404 }
      );
    }

    const content = readFileSync(promptPath, 'utf-8');
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('[Prompts API] Error reading prompt file:', error);
    return NextResponse.json(
      { error: 'Failed to read prompt file', message: error.message },
      { status: 500 }
    );
  }
});

/**
 * POST /api/prompts/[filename] - Update a prompt file
 */
export const POST = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { filename: string } }
) => {
  const filename = params.filename;
  
  if (!validateFilename(filename)) {
    return NextResponse.json(
      { error: 'Invalid filename' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { content } = body;

    if (typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content must be a string' },
        { status: 400 }
      );
    }

    if (!content.trim()) {
      return NextResponse.json(
        { error: 'Content cannot be empty' },
        { status: 400 }
      );
    }

    const promptPath = getPromptPath(filename);
    
    // Ensure the directory exists
    const pathParts = promptPath.split('/');
    pathParts.pop(); // Remove filename
    const dirPath = pathParts.join('/');
    
    if (!existsSync(dirPath)) {
      return NextResponse.json(
        { error: 'Prompt directory not found' },
        { status: 404 }
      );
    }

    // Write the file
    writeFileSync(promptPath, content, 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Prompt file updated successfully',
      filename,
    });
  } catch (error: any) {
    console.error('[Prompts API] Error writing prompt file:', error);
    return NextResponse.json(
      { error: 'Failed to write prompt file', message: error.message },
      { status: 500 }
    );
  }
});

