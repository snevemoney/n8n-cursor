import { NextResponse } from 'next/server';
import { createSuccessResponse } from '@/lib/api-error-handler';

export async function GET() {
  return createSuccessResponse({
    // Standardize on N8N_API_URL (N8N_BASE_URL kept for backward compatibility)
    N8N_API_URL: process.env['N8N_API_URL'] || process.env['N8N_BASE_URL'] || 'not set',
    N8N_BASE_URL_DEPRECATED: process.env['N8N_BASE_URL'] || 'not set (use N8N_API_URL instead)',
    N8N_API_KEY_LENGTH: process.env['N8N_API_KEY']?.length || 0,
    HAS_API_KEY: !!process.env['N8N_API_KEY'],
    ALL_N8N_VARS: Object.keys(process.env).filter(k => k.includes('N8N'))
  });
}

