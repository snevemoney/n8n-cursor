import { NextRequest, NextResponse } from 'next/server';
import { N8nClient } from '@/lib/n8n-client';
import { readFileSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing n8n client...');
    console.log('🔑 N8N_API_KEY exists:', !!process.env['N8N_API_KEY']);
    console.log('🔑 N8N_API_KEY length:', process.env['N8N_API_KEY']?.length || 0);
    console.log('🌐 N8N_API_URL:', process.env['N8N_API_URL']);
    
    // Try reading directly from .env.local to see if it's a Next.js issue
    try {
      const envPath = join(process.cwd(), '.env.local');
      const envContent = readFileSync(envPath, 'utf-8');
      const apiKeyMatch = envContent.match(/^N8N_API_KEY=(.+)$/m);
      if (apiKeyMatch) {
        const fileApiKey = apiKeyMatch[1].trim();
        console.log('📄 API Key from file:', fileApiKey.length, 'chars');
        console.log('📄 First 30 chars from file:', fileApiKey.substring(0, 30));
      }
    } catch (e) {
      console.log('⚠️ Could not read .env.local file:', e);
    }
    
    const client = new N8nClient();
    console.log('🔍 Client created, baseUrl:', (client as any).baseUrl);
    console.log('🔍 Client has apiKey:', !!(client as any).apiKey);
    
    const workflows = await client.listWorkflows();
    
    return NextResponse.json({
      success: true,
      count: workflows.length,
      sample: workflows.slice(0, 3).map(w => ({ id: w.id, name: w.name }))
    });
  } catch (error: any) {
    console.error('❌ Test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      env: {
        hasApiKey: !!process.env['N8N_API_KEY'],
        apiKeyLength: process.env['N8N_API_KEY']?.length || 0,
        apiUrl: process.env['N8N_API_URL']
      }
    }, { status: 500 });
  }
}

