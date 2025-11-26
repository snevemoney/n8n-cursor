/**
 * Event Handlers
 * Enhanced handlers with LLM summarization and auto-mission creation
 * These demonstrate the event-driven architecture pattern
 */

import { getEventBus } from './event-bus';
import type { EnrichedEvent } from './types';
import { getCostTracker } from '../cost/tracker';
import { getNotificationManager } from '../notification-manager';
import { runModelUnified } from '../chat/modelRunner';

/**
 * Initialize default event handlers
 */
export function initializeEventHandlers() {
  const bus = getEventBus();

  // Handle workflow failures - auto-summarize and create mission
  bus.subscribe('workflow.failed', async (event: EnrichedEvent) => {
    if (event.type === 'workflow.failed') {
      const workflowName = event.data.workflowName || 'Unknown Workflow';
      const error = event.data.error || event.data.reason || 'Unknown error';
      const workflowId = event.data.workflowId || 'unknown';
      
      console.log('[EventHandler] Workflow failed:', workflowName);
      
      try {
        // Auto-summarize error using LLM
        const summaryPrompt = `Summarize this workflow failure in 2-3 sentences. Focus on what went wrong and why.

Workflow: ${workflowName}
Workflow ID: ${workflowId}
Error: ${error}

Provide a clear, actionable summary:`;

        const errorSummary = await runModelUnified(
          'You are a technical assistant that summarizes errors clearly and concisely.',
          summaryPrompt,
          {
            provider: 'ollama',
            model: process.env.OLLAMA_MODEL || 'llama3.1:8b',
            maxTokens: 200,
            temperature: 0.3,
          }
        ).catch((err) => {
          console.warn('[EventHandler] LLM summarization failed:', err);
          return `Workflow "${workflowName}" failed: ${error}`;
        });

        console.log('[EventHandler] Error summary:', errorSummary);

        // Send notification
        const notificationManager = getNotificationManager();
        notificationManager.notify(
          'warning',
          'high',
          `Workflow Failed: ${workflowName}`,
          errorSummary,
          false
        );

        // Log for future mission creation
        // TODO: Create mission to fix the issue (requires mission creation API)
        console.log('[EventHandler] Mission creation pending for workflow:', workflowId);
      } catch (handlerError) {
        console.error('[EventHandler] Failed to handle workflow failure:', handlerError);
        // Fallback: just log the error
        const notificationManager = getNotificationManager();
        notificationManager.notify(
          'error',
          'high',
          `Workflow Failed: ${workflowName}`,
          `Error: ${error}`,
          false
        );
      }
    }
  });

  // Handle agent run completions - track metrics
  bus.subscribe('agent.run.completed', async (event: EnrichedEvent) => {
    if (event.type === 'agent.run.completed') {
      // Track cost if applicable
      if (event.data.duration) {
        // Estimate cost based on duration and resources used
        // This is a placeholder - real implementation would track actual costs
      }
    }
  });

  // Handle tool requests - track API usage for cost
  bus.subscribe('tool.requested', async (event: EnrichedEvent) => {
    if (event.type === 'tool.requested') {
      // Track external API calls for cost monitoring
      const tool = event.data.tool;
      
      // If it's an external API (OpenAI, etc.), record usage
      if (tool && (tool.includes('openai') || tool.includes('anthropic') || tool.includes('llm'))) {
        // Record API call for cost tracking
        try {
          const costTracker = getCostTracker();
          // Create a resource for LLM API calls if it doesn't exist
          await costTracker.registerResource({
            product: 'scorpion-core',
            environment: 'dev',
            service: 'llm-api',
            resourceType: 'api-call',
            resourceId: `llm-api-${tool}`,
            resourceName: `LLM API: ${tool}`,
            provider: tool.includes('openai') ? 'openai' : tool.includes('anthropic') ? 'anthropic' : 'unknown',
            estimatedMonthlyCost: 0, // Will be updated based on actual usage
          });
        } catch (error) {
          console.warn('[EventHandler] Failed to register LLM resource:', error);
        }
      }
    }
  });
  
  // Handle tool results - record usage for cost tracking
  bus.subscribe('tool.result', async (event: EnrichedEvent) => {
    if (event.type === 'tool.result' && event.data.success) {
      const tool = event.data.tool;
      const duration = event.data.duration || 0;
      const tokens = event.data.tokens || 0; // LLM tokens if available
      
      // If it's an external API, record usage
      if (tool && (tool.includes('openai') || tool.includes('anthropic') || tool.includes('llm'))) {
        try {
          const costTracker = getCostTracker();
          
          // Calculate cost based on tokens (more accurate than duration)
          // Rough estimates: OpenAI GPT-4 ~$0.03/1K input tokens, $0.06/1K output tokens
          // For simplicity, use average of $0.045/1K tokens
          let estimatedCost = 0;
          if (tokens > 0) {
            estimatedCost = (tokens / 1000) * 0.045;
          } else {
            // Fallback to duration-based estimate if tokens not available
            estimatedCost = (duration / 60000) * 0.01;
          }
          
          // Use the resource ID that was registered in tool.requested handler
          const resourceId = `llm-api-${tool}`;
          
          await costTracker.recordUsage(resourceId, {
            apiCalls: 1,
            llmTokens: tokens || 0,
            cost: estimatedCost,
            periodStart: new Date(Date.now() - duration),
            periodEnd: new Date(),
            periodType: 'hourly',
          });
        } catch (error) {
          console.warn('[EventHandler] Failed to record tool usage:', error);
        }
      }
    }
  });

  // Handle cost threshold warnings
  bus.subscribe('cost.threshold.warning', async (event: EnrichedEvent) => {
    if (event.type === 'cost.threshold.warning') {
      const product = event.data.product || 'Unknown';
      const environment = event.data.environment || 'Unknown';
      const currentSpend = event.data.actualSpend || event.data.currentSpend || 0;
      const budget = event.data.monthlyBudget || event.data.budget || 0;
      const percentage = event.data.percentageUsed || event.data.percentage || 0;
      const status = event.data.status || 'warning';
      
      const message = `${product} (${environment}): $${currentSpend.toFixed(2)} / $${budget.toFixed(2)} (${percentage.toFixed(1)}%)`;
      
      console.warn(`[CostAlert] ${message}`);
      
      // Send notification
      const notificationManager = getNotificationManager();
      notificationManager.notify(
        status === 'exceeded' ? 'error' : 'warning',
        status === 'exceeded' ? 'critical' : 'high',
        `Cost ${status === 'exceeded' ? 'Exceeded' : 'Warning'}: ${product}`,
        message,
        false
      );
    }
  });

  // Handle system errors - log and alert
  bus.subscribe('system.error', async (event: EnrichedEvent) => {
    if (event.type === 'system.error') {
      const component = event.data.component || 'Unknown';
      const error = event.data.error || 'Unknown error';
      const stackTrace = event.data.stackTrace;
      const severity = event.severity || 'error';
      
      console.error(
        `[SystemError] ${component}: ${error}`,
        stackTrace
      );
      
      // Send notification for critical errors
      if (severity === 'critical' || severity === 'error') {
        const notificationManager = getNotificationManager();
        notificationManager.notify(
          'error',
          severity === 'critical' ? 'critical' : 'high',
          `System Error: ${component}`,
          error,
          false
        );
      }
      
      // TODO: Send to error tracking service (Sentry, etc.)
    }
  });
  
  // Handle agent run failures - summarize and notify
  bus.subscribe('agent.run.failed', async (event: EnrichedEvent) => {
    if (event.type === 'agent.run.failed') {
      const agentName = event.data.agentName || 'Unknown Agent';
      const error = event.data.error || 'Unknown error';
      
      console.error(`[EventHandler] Agent run failed: ${agentName} - ${error}`);
      
      // Send notification
      const notificationManager = getNotificationManager();
      notificationManager.notify(
        'error',
        'medium',
        `Agent Failed: ${agentName}`,
        error,
        false
      );
    }
  });

  // Log all events in development
  if (process.env.NODE_ENV === 'development') {
    bus.subscribeAll((event: EnrichedEvent) => {
      console.debug(`[EventBus] ${event.type}`, {
        severity: event.severity,
        source: event.source,
        environment: event.environment,
      });
    });
  }
}

