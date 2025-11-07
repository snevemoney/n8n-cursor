/**
 * API endpoint to serve research screenshots
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    const screenshotPath = path.join(process.cwd(), 'data/research-screenshots', filename);

    // Check if file exists
    try {
      await fs.access(screenshotPath);
    } catch {
      return new NextResponse('Screenshot not found', { status: 404 });
    }

    // Read and return file
    const fileBuffer = await fs.readFile(screenshotPath);
    
    return new NextResponse(fileBuffer, {
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

