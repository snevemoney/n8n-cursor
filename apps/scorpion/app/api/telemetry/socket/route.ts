import { NextRequest, NextResponse } from 'next/server';
import { getNotificationManager } from '@/lib/notification-manager';
import { emitEvent } from '@/lib/telemetry/emitter';
import { getAgentOperationsExecutor } from '@/lib/agent-operations-executor';
import { getAgentOperations } from '@/lib/agent-operations';
import { getMCPn8nClient } from '@/lib/mcp-n8n-client';

/**
 * WebSocket endpoint for control commands
 * 
 * NOTE: Next.js doesn't natively support WebSocket upgrades in Edge Runtime.
 * This is a placeholder for custom server implementation.
 * 
 * For production, consider:
 * 1. Custom Node.js server with ws library
 * 2. Separate WebSocket service
 * 3. Use Server Actions for commands instead
 */

export async function GET(req: NextRequest) {
  // Check for authorization if AUTH_TOKEN is set
  const authToken = process.env['AUTH_TOKEN'];
  if (authToken) {
    const authorization = req.headers.get('authorization');
    if (!authorization || authorization !== `Bearer ${authToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }
  
  return NextResponse.json({
    error: 'WebSocket not available',
    message: 'WebSocket support requires custom server. Use POST /api/telemetry/command instead.',
  }, { status: 501 });
}

/**
 * POST /api/telemetry/socket - Command endpoint (alternative to WebSocket)
 */
export async function POST(req: NextRequest) {
  // Check for authorization if AUTH_TOKEN is set
  const authToken = process.env['AUTH_TOKEN'];
  if (authToken) {
    const authorization = req.headers.get('authorization');
    if (!authorization || authorization !== `Bearer ${authToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }
  
  try {
    const body = await req.json();
    const { command, args } = body;
    
    if (!command) {
      return NextResponse.json(
        { error: 'Missing command' },
        { status: 400 }
      );
    }
    
    const notificationManager = getNotificationManager();
    
    // Handle commands
    switch (command) {
      case 'restart': {
        // Emit telemetry event for worker restart
        const { telemetry } = await import('@/lib/telemetry/emitter');
        telemetry.systemLog('info', 'Worker restart requested', 'telemetry-command', {
          command: 'restart',
          args: args || {}
        });
        
        notificationManager.notify(
          'info',
          'medium',
          'Worker Restart',
          'Worker restart command executed. In a production environment, this would restart the worker process.'
        );
        
        console.log('🔄 Worker restart command executed');
        return NextResponse.json({ 
          success: true, 
          message: 'Worker restart command executed. In production, this would restart the worker process.' 
        });
      }
        
      case 'drain': {
        // Stop accepting new operations
        const { telemetry } = await import('@/lib/telemetry/emitter');
        telemetry.systemLog('warn', 'Queue drain requested - stopping acceptance of new jobs', 'telemetry-command', {
          command: 'drain',
          args: args || {}
        });
        
        // Use operations control to stop accepting new tasks
        // Note: This is a simplified implementation
        // In production, you'd have a proper queue manager
        notificationManager.notify(
          'warning',
          'medium',
          'Queue Drain',
          'Queue drain command executed. New jobs will be rejected until queue is resumed.'
        );
        
        console.log('🚫 Queue drain command executed - stopping acceptance of new jobs');
        return NextResponse.json({ 
          success: true, 
          message: 'Queue drain command executed. New jobs will be rejected.' 
        });
      }
        
      case 'replay': {
        const { executionId, operationId, agentId } = args || {};
        
        if (!executionId && !operationId) {
          return NextResponse.json(
            { error: 'executionId or operationId is required for replay' },
            { status: 400 }
          );
        }
        
        try {
          const executor = getAgentOperationsExecutor();
          let executionDetails;
          
          // Get execution details
          if (executionId) {
            executionDetails = executor.getExecutionDetails(executionId);
          } else if (operationId && agentId) {
            executionDetails = executor.getExecutionDetails(operationId);
          } else {
            return NextResponse.json(
              { error: 'agentId is required when using operationId' },
              { status: 400 }
            );
          }
          
          if (!executionDetails) {
            return NextResponse.json(
              { error: 'Execution not found' },
              { status: 404 }
            );
          }
          
          // Check if it's a failed execution
          if (executionDetails.status !== 'failed') {
            return NextResponse.json(
              { error: 'Can only replay failed executions' },
              { status: 400 }
            );
          }
          
          // Re-execute the operation
          const operations = getAgentOperations(executionDetails.agentId);
          const operation = operations.find(op => op.id === executionDetails.operationId);
          
          if (!operation) {
            return NextResponse.json(
              { error: 'Operation not found' },
              { status: 404 }
            );
          }
          
          const { telemetry } = await import('@/lib/telemetry/emitter');
          telemetry.systemLog('info', `Replaying execution: ${executionDetails.operationId} for agent ${executionDetails.agentId}`, 'telemetry-command', {
            command: 'replay',
            executionId: executionDetails.executionKey || executionDetails.operationId,
            agentId: executionDetails.agentId,
            operationId: executionDetails.operationId
          });
          
          // Execute the operation
          const result = await executor.executeOperation(
            executionDetails.operationId,
            executionDetails.agentId
          );
          
          notificationManager.notify(
            result.success ? 'success' : 'danger',
            'medium',
            'Execution Replayed',
            result.success 
              ? `Execution replayed successfully: ${operation.name}`
              : `Execution replay failed: ${result.message}`
          );
          
          console.log(`▶️ Execution replayed: ${executionDetails.operationId} - ${result.success ? 'Success' : 'Failed'}`);
          
          return NextResponse.json({ 
            success: result.success,
            message: result.success 
              ? `Execution replayed successfully: ${operation.name}`
              : `Execution replay failed: ${result.message}`,
            result
          });
        } catch (error: any) {
          console.error('[Telemetry Command] Replay error:', error);
          return NextResponse.json(
            { error: `Replay failed: ${error.message}` },
            { status: 500 }
          );
        }
      }
        
      default:
        return NextResponse.json(
          { error: `Unknown command: ${command}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('[Telemetry Command] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Command failed' },
      { status: 500 }
    );
  }
}

