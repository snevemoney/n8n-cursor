// Power of 10 Rule 4: Extract error handling to focused function
import type { StreamState } from '../phases';
import { failChatJob, createChatJob } from '@/server/runtime/chatIntegration';

/**
 * Handle stream errors: clean up error messages and send to client
 * Power of 10 Rule 4: Small function (<60 lines)
 */
export function handleStreamError(
  error: unknown,
  req: { signal: AbortSignal },
  streamState: StreamState,
  safeSend: (event: { type: string; data: Record<string, unknown> }) => void,
  chatJob: ReturnType<typeof createChatJob> | null
): void {
  // Don't log error if it was due to client disconnection
  const err = error as { message?: string; name?: string };
  if (err.message === 'Client disconnected' || req.signal.aborted || streamState.aborted) {
    console.log('[Chat Stream] Stream aborted by client');
    return;
  }
  
  console.error('[Chat Stream] Fatal error in stream start:', error);
  console.error('[Chat Stream] Error name:', err?.name);
  console.error('[Chat Stream] Error message:', err?.message);
  console.error('[Chat Stream] Stack:', (error as { stack?: string })?.stack);
  
  // Try to send error event to client
  try {
    safeSend({
      type: 'error',
      data: {
        message: `Stream error: ${err?.message || String(error)}`,
        phase: 'error',
      },
    });
  } catch (sendError) {
    console.error('[Chat Stream] Failed to send error event:', sendError);
  }
  
  // Clean up error message - remove stack traces and format nicely
  let cleanMessage = err.message || 'Unknown error occurred';
  
  // Remove stack trace if present
  if (cleanMessage.includes('at runOllama') || cleanMessage.includes('at process')) {
    const lines = cleanMessage.split('\n');
    cleanMessage = lines.filter((line: string) => 
      !line.includes('at ') && 
      !line.includes('webpack-internal') &&
      !line.includes('node:internal')
    ).join('\n');
  }
  
  // Remove duplicate troubleshooting sections
  if (cleanMessage.includes('Troubleshooting:')) {
    const parts = cleanMessage.split('Troubleshooting:');
    cleanMessage = parts[0] + '\n\n**Troubleshooting:**\n' + parts.slice(1).join('\n');
    // Remove duplicates
    const troubleshootingMatch = cleanMessage.match(/\*\*Troubleshooting:\*\*[\s\S]*?(?=\n\n|\n$|$)/);
    if (troubleshootingMatch) {
      const troubleshooting = troubleshootingMatch[0];
      cleanMessage = cleanMessage.replace(/\*\*Troubleshooting:\*\*[\s\S]*?(?=\n\n|\n$|$)/g, '');
      cleanMessage = cleanMessage.trim() + '\n\n' + troubleshooting;
    }
  }
  
  try {
  safeSend({ 
    type: 'error', 
    data: { 
      message: cleanMessage,
    } 
  });
    
    // Send done event so client knows stream is complete
    safeSend({
      type: 'done',
      data: {},
    });
  } catch (sendError) {
    console.error('[Chat Stream] Failed to send error/done events:', sendError);
  }
  
  // Mark Job as failed
  if (chatJob) {
    try {
    const errorForJob = error instanceof Error ? error : new Error(String(error));
    failChatJob(chatJob.id, errorForJob);
    } catch (jobError) {
      console.error('[Chat Stream] Failed to mark job as failed:', jobError);
    }
  }
}

