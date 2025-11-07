import { NextResponse } from 'next/server';
import { getSystemAutomation } from '@/lib/system-automation';
import { getMCPn8nClient } from '@/lib/mcp-n8n-client';

/**
 * GET /api/operations - Get active and recent operations
 */
export async function GET() {
  try {
    const systemAutomation = getSystemAutomation();
    const n8nClient = getMCPn8nClient();
    
    // Get recent errors and system status
    const errors = systemAutomation.getErrors();
    const recentErrors = errors.slice(-20);
    
    // Get n8n workflow executions (recent operations)
    let recentExecutions: any[] = [];
    try {
      const executions = await n8nClient.listExecutions({ limit: 50 });
      recentExecutions = executions.map((exec: any) => ({
        id: exec.id,
        workflowId: exec.workflowId,
        workflowName: exec.workflowName || `Workflow ${exec.workflowId}`,
        status: exec.finished ? (exec.stoppedAt ? 'completed' : 'running') : 'failed',
        startedAt: exec.startedAt,
        stoppedAt: exec.stoppedAt,
        mode: exec.mode,
        location: 'n8n Cloud', // Could be enriched with actual location
        type: 'workflow'
      }));
    } catch (e) {
      console.warn('Could not fetch n8n executions:', e);
    }
    
    // Combine all operations
    const operations = [
      ...recentExecutions,
      ...recentErrors.map(e => ({
        id: `error-${Date.parse(e.timestamp)}`,
        workflowName: e.source,
        status: 'failed',
        startedAt: e.timestamp,
        stoppedAt: e.timestamp,
        mode: 'automatic',
        location: 'System',
        type: 'system',
        error: e.message
      }))
    ].sort((a, b) => 
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
    
    // Calculate stats
    const stats = {
      total: operations.length,
      running: operations.filter(o => o.status === 'running').length,
      completed: operations.filter(o => o.status === 'completed').length,
      failed: operations.filter(o => o.status === 'failed').length,
      byType: {
        workflow: operations.filter(o => o.type === 'workflow').length,
        system: operations.filter(o => o.type === 'system').length
      },
      byLocation: operations.reduce((acc: any, op) => {
        acc[op.location] = (acc[op.location] || 0) + 1;
        return acc;
      }, {})
    };
    
    // Top 50 recent operations
    const recentOperations = operations.slice(0, 50);
    
    return NextResponse.json({
      stats,
      operations: recentOperations,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Error getting operations:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get operations' },
      { status: 500 }
    );
  }
}

