import { z } from 'zod';

// Event schema for LFA → n8n communication
export const Event = z.object({
  id: z.string().uuid(),
  type: z.enum([
    'user.created',
    'user.updated',
    'user.deleted',
    'payment.succeeded',
    'payment.refunded',
    'payment.failed',
    'lnbits.invoice_settled',
    'lnbits.invoice_expired',
    'portfolio.rebalanced',
    'portfolio.threshold_breached',
    'content.generated',
    'content.published',
    'content.moderated',
    'agent.triggered',
    'agent.completed',
    'agent.failed',
    'webhook.received',
    'subscription.created',
    'subscription.updated',
    'subscription.cancelled'
  ]),
  occurred_at: z.string().datetime(),
  data: z.record(z.any()),
  source: z.literal('lfa'),
  version: z.literal('1'),
  correlation_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  business_node_id: z.string().uuid().optional()
});

export type Event = z.infer<typeof Event>;

// Event metadata for tracking
export const EventMetadata = z.object({
  event_id: z.string().uuid(),
  workflow_id: z.string().optional(),
  execution_id: z.string().optional(),
  delivered_at: z.string().datetime().optional(),
  delivery_attempts: z.number().int().min(0).default(0),
  last_delivery_error: z.string().optional()
});

export type EventMetadata = z.infer<typeof EventMetadata>;

// Event delivery status
export const EventDeliveryStatus = z.enum([
  'pending',
  'delivering',
  'delivered',
  'failed',
  'dead_letter'
]);

export type EventDeliveryStatus = z.infer<typeof EventDeliveryStatus>;

// Specific event data schemas
export const UserEventData = z.object({
  user_id: z.string().uuid(),
  email: z.string().email(),
  business_name: z.string().optional(),
  lightning_node_id: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export const PaymentEventData = z.object({
  payment_id: z.string().uuid(),
  amount_sats: z.number().int().positive(),
  currency: z.string(),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']),
  lightning_invoice: z.string().optional(),
  user_id: z.string().uuid(),
  business_node_id: z.string().uuid().optional()
});

export const LNbitsEventData = z.object({
  payment_hash: z.string(),
  amount_sats: z.number().int().positive(),
  invoice_id: z.string(),
  user_id: z.string().uuid().optional(),
  business_node_id: z.string().uuid().optional(),
  settled_at: z.string().datetime()
});

export const PortfolioEventData = z.object({
  portfolio_id: z.string().uuid(),
  user_id: z.string().uuid(),
  total_value_sats: z.number().int().positive(),
  change_percentage: z.number(),
  rebalanced_at: z.string().datetime(),
  rules_applied: z.array(z.string())
});

export const ContentEventData = z.object({
  content_id: z.string().uuid(),
  type: z.enum(['article', 'video', 'social', 'email']),
  title: z.string(),
  user_id: z.string().uuid(),
  business_node_id: z.string().uuid().optional(),
  generated_at: z.string().datetime(),
  ai_agent_id: z.string().uuid().optional()
});

// Event factory functions
export const createEvent = <T extends Event['type']>(
  type: T,
  data: any,
  options?: {
    correlation_id?: string;
    user_id?: string;
    business_node_id?: string;
  }
): Event => ({
  id: crypto.randomUUID(),
  type,
  occurred_at: new Date().toISOString(),
  data,
  source: 'lfa',
  version: '1',
  correlation_id: options?.correlation_id,
  user_id: options?.user_id,
  business_node_id: options?.business_node_id
});

// Event validation helpers
export const isValidEvent = (data: unknown): data is Event => {
  try {
    Event.parse(data);
    return true;
  } catch {
    return false;
  }
};

export const getEventType = (event: Event): Event['type'] => event.type;

export const isUserEvent = (event: Event): boolean => 
  event.type.startsWith('user.');

export const isPaymentEvent = (event: Event): boolean => 
  event.type.startsWith('payment.') || event.type.startsWith('lnbits.');

export const isPortfolioEvent = (event: Event): boolean => 
  event.type.startsWith('portfolio.');

export const isContentEvent = (event: Event): boolean => 
  event.type.startsWith('content.');
