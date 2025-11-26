/**
 * API endpoint to serve research screenshots
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

/**
 * Validate filename to prevent directory traversal attacks
 */
function validateFilename(filename: string): boolean {
  // Only allow alphanumeric, dots, hyphens, underscores
  // Must end with .png, .jpg, .jpeg, .gif, .webp
  const validPattern = /^[a-zA-Z0-9._-]+\.(png|jpg|jpeg|gif|webp)$/;
  return validPattern.test(filename);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;

    // Validate filename to prevent directory traversal
    if (!validateFilename(filename)) {
      return new NextResponse('Invalid filename', { status: 400 });
    }

    const rootDir = path.resolve(process.cwd(), 'data/research-screenshots');
    const screenshotPath = path.resolve(rootDir, filename);

    // Verify the resolved path is still within the screenshots directory
    if (!screenshotPath.startsWith(rootDir)) {
      return new NextResponse('Invalid path', { status: 400 });
    }

    // Check if file exists
    try {
      await fs.access(screenshotPath);
    } catch {
      return new NextResponse('Screenshot not found', { status: 404 });
    }

    // Read and return file
    const fileBuffer = await fs.readFile(screenshotPath);
    
    // Convert Buffer to Uint8Array for NextResponse (which accepts BodyInit)
    const uint8Array = new Uint8Array(fileBuffer);
    
    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600'
      }
    });

  } catch (error: any) {
    console.error('Failed to serve screenshot:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

