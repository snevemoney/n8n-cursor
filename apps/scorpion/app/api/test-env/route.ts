import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    N8N_BASE_URL: process.env.N8N_BASE_URL || 'not set',
    N8N_API_KEY_LENGTH: process.env.N8N_API_KEY?.length || 0,
    HAS_API_KEY: !!process.env.N8N_API_KEY,
    ALL_N8N_VARS: Object.keys(process.env).filter(k => k.includes('N8N'))
  });
}

