import { NextResponse } from 'next/server';
import { getMCPn8nClient } from '@/lib/mcp-n8n-client';

/**
 * GET /api/workflows-simple - Get ONLY n8n workflows (no filesystem merge)
 */
export async function GET() {
  try {
    console.log('🦂 Simple workflows endpoint - Starting...');
    
    const mcpClient = getMCPn8nClient();
    console.log('🦂 n8n client created');
    
    const n8nWorkflows = await mcpClient.listWorkflows();
    console.log(`🦂 Got ${n8nWorkflows.length} workflows from n8n`);
    
    return NextResponse.json({
      success: true,
      count: n8nWorkflows.length,
      workflows: n8nWorkflows.slice(0, 10).map(w => ({
        id: w.id,
        name: w.name,
        active: w.active || false
      }))
    });
  } catch (error: any) {
    console.error('❌ Error in simple workflows:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 5)
    }, { status: 500 });
  }
}


