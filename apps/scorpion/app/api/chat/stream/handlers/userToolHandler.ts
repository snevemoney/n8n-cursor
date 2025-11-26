// Power of 10 Rule 4: Extract user tool handling to focused function
import type { ReadableStreamDefaultController } from 'stream/web';
import { detectUserTool, executeTool } from '@/lib/chat/tools';
import type { Message } from '@/lib/chat/types';
import { v4 as uuidv4 } from 'uuid';
import { emitEvent } from '@/lib/events/event-bus';

export interface UserToolResult {
  handled: boolean;
  toolName?: string;
  toolResult?: unknown;
}

/**
 * Handle user tool command (slash command or natural language)
 * Power of 10 Rule 4: Small function (<60 lines) - orchestrates helpers
 */
export async function handleUserTool(
  userMessage: string,
  conversationId: string | undefined,
  _messages: Message[],
  send: (event: { type: string; data: Record<string, unknown> }) => void,
  controller: ReadableStreamDefaultController<Uint8Array>,
  messageId: string
): Promise<UserToolResult> {
  let detectedTool = null;
  try {
    detectedTool = detectUserTool(userMessage);
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('[Chat Stream] Error detecting user tool:', err?.message);
    // Continue with normal flow if detection fails
    return { handled: false };
  }

  if (!detectedTool) {
    return { handled: false };
  }

  // PROACTIVE VALIDATION: Validate detectedTool structure before destructuring
  if (!detectedTool || typeof detectedTool !== 'object' || !detectedTool.tool) {
    console.error('[Chat Stream] Invalid detectedTool structure:', detectedTool);
    send({
      type: 'error',
      data: {
        message: 'Invalid tool detection result',
        phase: 'validation',
      },
    });
    controller.close();
    return { handled: true }; // Handled (error case)
  }

  const { tool: userTool, argsText } = detectedTool;

  // PROACTIVE VALIDATION: Validate userTool properties before use
  if (!userTool || typeof userTool !== 'object') {
    console.error('[Chat Stream] Invalid userTool:', userTool);
    send({
      type: 'error',
      data: {
        message: 'Invalid tool configuration',
        phase: 'validation',
      },
    });
    controller.close();
    return { handled: true }; // Handled (error case)
  }

  const toolName = userTool.name || 'unknown';
  const toolLabel = userTool.label || toolName;

  // This is a user tool - execute directly without planner
  console.log('[Chat Stream] User tool detected:', toolName);

  send({ type: 'status', data: { message: `Executing ${toolLabel}...`, phase: 'executing' } });
  send({ type: 'progress', data: { phase: 'executing', progress: 10, message: `Executing ${toolLabel}...` } });

  let toolArgs: any = {};

  // Try to parse JSON if provided, otherwise use as text input
  if (argsText) {
    try {
      toolArgs = JSON.parse(argsText);
    } catch {
      // Not JSON, treat as text input
      // Map common fields based on tool schema
      if (userTool.schema && typeof userTool.schema === 'object' && 'parse' in userTool.schema) {
        const schemaShape = (userTool.schema as any)._def || {};
        // Try to infer field names
        if (schemaShape.shape) {
          const fields = Object.keys(schemaShape.shape);
          const fieldDefs = schemaShape.shape;

          // Check for common text input fields first (in priority order)
          const commonTextFields = ['text', 'query', 'content', 'prompt', 'input', 'message', 'question', 'description', 'topic', 'offer', 'productBrief'];
          const foundField = commonTextFields.find(f => fields.includes(f));

          if (foundField) {
            toolArgs[foundField] = argsText;
          } else {
            // For tools with required fields, try to infer from field names
            // Check if there's a field that looks like it should contain the text
            const textLikeFields = fields.filter(f => {
              const fLower = f.toLowerCase();
              return ['text', 'query', 'content', 'input', 'prompt', 'message', 'question', 'description', 'topic', 'offer', 'brief', 'subject', 'title'].some(pattern => fLower.includes(pattern));
            });
            if (textLikeFields.length > 0) {
              // Prefer required fields over optional ones
              const requiredField = textLikeFields.find(f => {
                const fieldDef = fieldDefs[f];
                return fieldDef && fieldDef._def?.typeName === 'ZodString' && !fieldDef._def?.typeName?.includes('Optional');
              });
              // Power of 10 Rule 7: Guard undefined - ensure field exists before using as index
              const fieldName = requiredField || textLikeFields[0];
              if (fieldName) {
                toolArgs[fieldName] = argsText;
              }
            } else {
              // Default: use first required string field, or first optional string field, or just 'text'
              const firstRequiredStringField = fields.find(f => {
                const fieldDef = fieldDefs[f];
                return fieldDef && fieldDef._def?.typeName === 'ZodString' && !fieldDef._def?.typeName?.includes('Optional');
              });
              const firstOptionalStringField = fields.find(f => {
                const fieldDef = fieldDefs[f];
                return fieldDef && (
                  fieldDef._def?.typeName === 'ZodOptional' ||
                  (fieldDef._def?.typeName === 'ZodString' && fieldDef._def?.checks?.some((c: any) => c.kind === 'min' && c.value === 0))
                );
              });
              if (firstRequiredStringField) {
                toolArgs[firstRequiredStringField] = argsText;
              } else if (firstOptionalStringField) {
                toolArgs[firstOptionalStringField] = argsText;
              } else {
                toolArgs.text = argsText;
              }
            }
          }
        } else {
          toolArgs.text = argsText;
        }
      } else {
        toolArgs.text = argsText;
      }
    }
  }

  // Special handling for array fields: if tool has a 'commands' field and we have text input,
  // wrap the text in an array
  if (argsText && !toolArgs.commands && userTool.schema) {
    const schemaShape = (userTool.schema as any)._def || {};
    if (schemaShape.shape && schemaShape.shape.commands) {
      const commandsDef = schemaShape.shape.commands;
      // Check if commands is an array type (handle ZodDefault wrapping)
      const innerDef = commandsDef._def?.innerType?._def || commandsDef._def;
      if (innerDef?.typeName === 'ZodArray' || commandsDef._def?.typeName === 'ZodArray') {
        // If we have text input but no commands, wrap text in array
        if (toolArgs.text || toolArgs.query || toolArgs.content) {
          const textValue = toolArgs.text || toolArgs.query || toolArgs.content;
          toolArgs.commands = [textValue];
          // Remove the text field to avoid conflicts
          delete toolArgs.text;
          delete toolArgs.query;
          delete toolArgs.content;
        }
      }
    }
  }

  // Validate required fields before executing
  if (userTool.schema && typeof userTool.schema === 'object' && 'parse' in userTool.schema) {
    try {
      // Try to parse/validate - this will throw if required fields are missing
      userTool.schema.parse(toolArgs);
    } catch (validationError: any) {
      // Extract missing required fields
      const missingFields: string[] = [];
      if (validationError.errors) {
        // Power of 10 Rule 2: Bounded loop
        const MAX_ERRORS = 1000;
        const errorsToCheck = validationError.errors.slice(0, MAX_ERRORS);
        for (let i = 0; i < errorsToCheck.length; i++) {
          const err = errorsToCheck[i];
          if (!err || typeof err !== 'object') continue;
          const errorObj = err as Record<string, unknown>;
          if (errorObj.code === 'invalid_type' && errorObj.received === 'undefined') {
            const path = errorObj.path;
            if (Array.isArray(path)) {
              missingFields.push(path.join('.'));
            }
          }
        }
      }

      if (missingFields.length > 0) {
        const toolNameSafe = toolName || 'unknown';
        const slashCmd = userMessage.startsWith('/') ? userMessage.split(' ')[0] : `/${toolNameSafe.replace('user.', '')}`;
        const errorMessage = `Missing required ${missingFields.length === 1 ? 'field' : 'fields'}: ${missingFields.join(', ')}.\n\nUsage: ${slashCmd} <${missingFields[0]}>\nExample: ${slashCmd} your description here`;

        send({
          type: 'error',
          data: {
            message: errorMessage,
            phase: 'validation',
          },
        });

        send({
          type: 'tool',
          data: {
            tool: toolNameSafe,
            callId: uuidv4(),
            args: toolArgs,
            status: 'error',
            error: errorMessage,
          },
        });

        // Send final message
        send({
          type: 'message',
          data: {
            id: messageId,
            role: 'assistant',
            content: `**Error executing ${toolLabel}**\n\n${errorMessage}`,
          },
        });

        controller.close();
        return { handled: true };
      }
    }
  }

  const callId = uuidv4();

  // Send tool start event
  send({
    type: 'tool',
    data: {
      tool: userTool.name,
      callId,
      args: toolArgs,
      status: 'running',
    },
  });

  send({ type: 'progress', data: { phase: 'executing', progress: 30, message: `Running ${toolLabel}...` } });

  // For research.run, send immediate status update
  if (toolName === 'research.run') {
    send({
      type: 'status',
      data: {
        message: 'Starting web research... This typically takes 20-40 seconds.',
        phase: 'executing'
      }
    });
    send({
      type: 'progress',
      data: {
        phase: 'executing',
        progress: 40,
        message: 'Research in progress...'
      }
    });
  }

  try {
    // PROACTIVE VALIDATION: Validate tool name before execution
    if (!toolName || typeof toolName !== 'string' || toolName.trim().length === 0) {
      throw new Error('Invalid tool name');
    }

    // Emit tool.request event (was tool.requested)
    const toolStartTime = Date.now();
    const requestId = uuidv4();

    await emitEvent({
      id: uuidv4(),
      type: 'tool.request',
      severity: 'info',
      timestamp: new Date().toISOString(),
      source: 'chat-stream',
      environment: 'dev',
      data: {
        tool: toolName,
        toolName: toolName,
        requestId,
        params: toolArgs,
      },
      metadata: {
        conversationId,
        callId,
      }
    });

    // Execute user tool
    const result = await executeTool(toolName, toolArgs);

    // PROACTIVE VALIDATION: Validate result structure
    if (!result || typeof result !== 'object') {
      throw new Error('Tool execution returned invalid result');
    }

    send({ type: 'progress', data: { phase: 'executing', progress: 90, message: `${toolLabel} completed` } });

    // Send tool completion event
    send({
      type: 'tool',
      data: {
        tool: toolName,
        callId,
        args: toolArgs,
        status: 'completed',
        result,
      },
    });

    // Emit tool.response event (was tool.result)
    const toolDuration = Date.now() - toolStartTime;
    await emitEvent({
      id: uuidv4(),
      type: 'tool.response',
      severity: 'info',
      timestamp: new Date().toISOString(),
      source: 'chat-stream',
      environment: 'dev',
      data: {
        tool: toolName,
        toolName: toolName,
        requestId,
        success: true,
        duration: toolDuration,
        response: result as Record<string, unknown>,
      },
      metadata: {
        conversationId,
        callId,
      }
    });

    // Send final message with result
    const resultData = (result as any).data || (result as any).content || result;
    const resultContent = typeof resultData === 'string'
      ? resultData
      : JSON.stringify(resultData, null, 2);

    send({
      type: 'message',
      data: {
        id: messageId,
        role: 'assistant',
        content: `**${toolLabel} Result:**\n\n\`\`\`\n${resultContent}\n\`\`\``,
      },
    });

    controller.close();
    return { handled: true, toolName, toolResult: result };

  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error(`[Chat Stream] Error executing user tool ${toolName}:`, err);

    send({
      type: 'tool',
      data: {
        tool: toolName,
        callId,
        args: toolArgs,
        status: 'error',
        error: err?.message || 'Unknown error',
      },
    });

    send({
      type: 'error',
      data: {
        message: `Failed to execute ${toolLabel}: ${err?.message || 'Unknown error'}`,
        phase: 'executing',
      },
    });

    // Send error message
    send({
      type: 'message',
      data: {
        id: messageId,
        role: 'assistant',
        content: `**Error executing ${toolLabel}**\n\n${err?.message || 'Unknown error'}`,
      },
    });

    controller.close();
    return { handled: true };
  }
}
