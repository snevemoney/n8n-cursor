import { z } from 'zod';

// Command schema for n8n → LFA communication
export const Command = z.object({
  idempotencyKey: z.string(),
  action: z.enum([
    'credit.apply',
    'credit.revoke',
    'invoice.create',
    'invoice.cancel',
    'portfolio.rebalance',
    'portfolio.alert',
    'notify.send',
    'notify.broadcast',
    'content.enqueue',
    'content.publish',
    'content.moderate',
    'user.update',
    'user.suspend',
    'user.activate',
    'subscription.create',
    'subscription.update',
    'subscription.cancel',
    'webhook.retry',
    'agent.trigger',
    'agent.stop'
  ]),
  payload: z.record(z.any()),
  source: z.literal('n8n'),
  workflow_id: z.string().optional(),
  execution_id: z.string().optional(),
  correlation_id: z.string().uuid().optional(),
  timestamp: z.string().datetime(),
  version: z.literal('1')
});

export type Command = z.infer<typeof Command>;

// Command result schema
export const CommandResult = z.object({
  success: z.boolean(),
  command_id: z.string().uuid(),
  result: z.record(z.any()).optional(),
  error: z.string().optional(),
  executed_at: z.string().datetime(),
  execution_time_ms: z.number().int().positive()
});

export type CommandResult = z.infer<typeof CommandResult>;

// Specific command payload schemas
export const CreditCommandPayload = z.object({
  user_id: z.string().uuid(),
  amount_sats: z.number().int(),
  reason: z.string(),
  expires_at: z.string().datetime().optional(),
  metadata: z.record(z.any()).optional()
});

export const InvoiceCommandPayload = z.object({
  user_id: z.string().uuid(),
  amount_sats: z.number().int().positive(),
  description: z.string(),
  expires_in_minutes: z.number().int().positive().default(60),
  metadata: z.record(z.any()).optional()
});

export const PortfolioCommandPayload = z.object({
  user_id: z.string().uuid(),
  portfolio_id: z.string().uuid().optional(),
  rules: z.array(z.object({
    asset: z.string(),
    target_percentage: z.number().min(0).max(100),
    threshold: z.number().min(0).max(100)
  })),
  rebalance_now: z.boolean().default(false)
});

export const NotifyCommandPayload = z.object({
  user_id: z.string().uuid().optional(),
  business_node_id: z.string().uuid().optional(),
  channel: z.enum(['email', 'push', 'sms', 'slack', 'discord']),
  template: z.string(),
  data: z.record(z.any()),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal')
});

export const ContentCommandPayload = z.object({
  user_id: z.string().uuid(),
  business_node_id: z.string().uuid().optional(),
  type: z.enum(['article', 'video', 'social', 'email']),
  title: z.string(),
  prompt: z.string(),
  ai_agent_id: z.string().uuid().optional(),
  metadata: z.record(z.any()).optional()
});

export const UserCommandPayload = z.object({
  user_id: z.string().uuid(),
  updates: z.record(z.any()),
  reason: z.string().optional()
});

export const SubscriptionCommandPayload = z.object({
  user_id: z.string().uuid(),
  plan_id: z.string().uuid(),
  status: z.enum(['active', 'suspended', 'cancelled']),
  metadata: z.record(z.any()).optional()
});

export const WebhookCommandPayload = z.object({
  webhook_id: z.string().uuid(),
  retry_count: z.number().int().min(0),
  max_retries: z.number().int().positive().default(3)
});

export const AgentCommandPayload = z.object({
  agent_id: z.string().uuid(),
  user_id: z.string().uuid(),
  action: z.enum(['start', 'stop', 'pause', 'resume']),
  parameters: z.record(z.any()).optional()
});

// Command factory functions
export const createCommand = <T extends Command['action']>(
  action: T,
  payload: any,
  options?: {
    workflow_id?: string;
    execution_id?: string;
    correlation_id?: string;
  }
): Command => ({
  idempotencyKey: crypto.randomUUID(),
  action,
  payload,
  source: 'n8n',
  workflow_id: options?.workflow_id,
  execution_id: options?.execution_id,
  correlation_id: options?.correlation_id,
  timestamp: new Date().toISOString(),
  version: '1'
});

// Command validation helpers
export const isValidCommand = (data: unknown): data is Command => {
  try {
    Command.parse(data);
    return true;
  } catch {
    return false;
  }
};

export const getCommandAction = (command: Command): Command['action'] => command.action;

export const isCreditCommand = (command: Command): boolean => 
  command.action.startsWith('credit.');

export const isInvoiceCommand = (command: Command): boolean => 
  command.action.startsWith('invoice.');

export const isPortfolioCommand = (command: Command): boolean => 
  command.action.startsWith('portfolio.');

export const isNotifyCommand = (command: Command): boolean => 
  command.action.startsWith('notify.');

export const isContentCommand = (command: Command): boolean => 
  command.action.startsWith('content.');

export const isUserCommand = (command: Command): boolean => 
  command.action.startsWith('user.');

export const isSubscriptionCommand = (command: Command): boolean => 
  command.action.startsWith('subscription.');

export const isWebhookCommand = (command: Command): boolean => 
  command.action.startsWith('webhook.');

export const isAgentCommand = (command: Command): boolean => 
  command.action.startsWith('agent.');

// Idempotency helpers
export const generateIdempotencyKey = (workflow_id: string, execution_id: string, action: string): string => {
  return `${workflow_id}:${execution_id}:${action}:${Date.now()}`;
};

export const parseIdempotencyKey = (key: string): {
  workflow_id: string;
  execution_id: string;
  action: string;
  timestamp: number;
} => {
  const parts = key.split(':');
  return {
    workflow_id: parts[0],
    execution_id: parts[1],
    action: parts[2],
    timestamp: parseInt(parts[3])
  };
};
