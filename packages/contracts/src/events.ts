// LightningFlow AI Event Schema
// Generated from contracts/events.yaml

import { ajv, validateOrThrow } from './validator';

// Event types
export type EventType = 
  | 'user.created' | 'user.updated' | 'user.subscription.changed'
  | 'payment.created' | 'payment.status.changed' | 'payment.completed'
  | 'lnbits.webhook.received'
  | 'agent.task.started' | 'agent.task.completed'
  | 'system.health.check' | 'system.maintenance.scheduled'
  | 'feature.flag.changed';

export type WebhookEventType = 'payment_received' | 'payment_sent' | 'invoice_created' | 'invoice_paid';
export type AgentType = 'research' | 'content' | 'automation' | 'analysis';
export type AgentStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
export type SubscriptionTier = 'free' | 'pro' | 'enterprise';
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

// Base event interface
export interface BaseEvent {
  event_id: string;
  event_type: EventType;
  version: string;
  timestamp: string;
  source: string;
  correlation_id?: string;
  user_id?: string;
  tenant_id?: string;
}

// User Events
export interface UserCreatedEvent extends BaseEvent {
  event_type: 'user.created';
  user_id: string;
  email: string;
  full_name?: string;
  subscription_tier: SubscriptionTier;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface UserUpdatedEvent extends BaseEvent {
  event_type: 'user.updated';
  user_id: string;
  updated_at: string;
  changes: {
    full_name?: string;
    avatar_url?: string;
    timezone?: string;
    theme?: 'light' | 'dark' | 'auto';
  };
  previous_values?: Record<string, any>;
}

export interface UserSubscriptionChangedEvent extends BaseEvent {
  event_type: 'user.subscription.changed';
  user_id: string;
  old_tier: SubscriptionTier;
  new_tier: SubscriptionTier;
  changed_at: string;
  billing_cycle?: 'monthly' | 'yearly';
  stripe_customer_id?: string;
}

// Payment Events
export interface PaymentCreatedEvent extends BaseEvent {
  event_type: 'payment.created';
  payment_id: string;
  user_id: string;
  amount_sats: number;
  description: string;
  recipient?: string;
  status: PaymentStatus;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface PaymentStatusChangedEvent extends BaseEvent {
  event_type: 'payment.status.changed';
  payment_id: string;
  user_id: string;
  old_status: PaymentStatus;
  new_status: PaymentStatus;
  changed_at: string;
  payment_hash?: string;
  failure_reason?: string;
  completed_at?: string;
}

export interface PaymentCompletedEvent extends BaseEvent {
  event_type: 'payment.completed';
  payment_id: string;
  user_id: string;
  amount_sats: number;
  payment_hash: string;
  completed_at: string;
  description?: string;
  recipient?: string;
  fees_sats?: number;
}

// Lightning Network Events
export interface LNbitsWebhookReceivedEvent extends BaseEvent {
  event_type: 'lnbits.webhook.received';
  type: WebhookEventType;
  data: {
    payment_hash: string;
    amount: number;
    description?: string;
    timestamp: string;
    wallet_id: string;
    user_id: string;
  };
  received_at: string;
  source_ip?: string;
}

// AI Agent Events
export interface AgentTaskStartedEvent extends BaseEvent {
  event_type: 'agent.task.started';
  task_id: string;
  agent_id: AgentType;
  user_id: string;
  task_type: string;
  parameters: Record<string, any>;
  started_at: string;
  estimated_duration_seconds?: number;
}

export interface AgentTaskCompletedEvent extends BaseEvent {
  event_type: 'agent.task.completed';
  task_id: string;
  agent_id: AgentType;
  user_id: string;
  status: AgentStatus;
  completed_at: string;
  duration_seconds: number;
  result_summary?: string;
  error_message?: string;
  output_size_bytes?: number;
}

// System Events
export interface SystemHealthCheckEvent extends BaseEvent {
  event_type: 'system.health.check';
  check_id: string;
  status: HealthStatus;
  checked_at: string;
  services: Record<string, {
    status: HealthStatus;
    response_time_ms: number;
    error_message?: string;
  }>;
  overall_response_time_ms: number;
  environment: 'int' | 'staging' | 'prod';
}

export interface SystemMaintenanceScheduledEvent extends BaseEvent {
  event_type: 'system.maintenance.scheduled';
  maintenance_id: string;
  scheduled_at: string;
  duration_minutes: number;
  affected_services: string[];
  description: string;
  notification_sent: boolean;
}

// Feature Flag Events
export interface FeatureFlagChangedEvent extends BaseEvent {
  event_type: 'feature.flag.changed';
  flag_name: string;
  old_value: boolean | string | number;
  new_value: boolean | string | number;
  changed_at: string;
  changed_by: string;
  environment: 'int' | 'staging' | 'prod';
  reason?: string;
}

// Union type for all events
export type LightningFlowEvent = 
  | UserCreatedEvent
  | UserUpdatedEvent
  | UserSubscriptionChangedEvent
  | PaymentCreatedEvent
  | PaymentStatusChangedEvent
  | PaymentCompletedEvent
  | LNbitsWebhookReceivedEvent
  | AgentTaskStartedEvent
  | AgentTaskCompletedEvent
  | SystemHealthCheckEvent
  | SystemMaintenanceScheduledEvent
  | FeatureFlagChangedEvent;

// Event schemas for validation
export const eventSchemas: Record<EventType, any> = {
  'user.created': {
    type: 'object',
    required: ['event_id', 'event_type', 'version', 'timestamp', 'source', 'user_id', 'email', 'subscription_tier', 'created_at'],
    properties: {
      event_id: { type: 'string', format: 'uuid-v4' },
      event_type: { const: 'user.created' },
      version: { type: 'string' },
      timestamp: { type: 'string', format: 'date-time-utc' },
      source: { type: 'string' },
      correlation_id: { type: 'string', format: 'uuid-v4' },
      user_id: { type: 'string', format: 'uuid-v4' },
      tenant_id: { type: 'string', format: 'uuid-v4' },
      email: { type: 'string', format: 'email' },
      full_name: { type: 'string' },
      subscription_tier: { type: 'string', enum: ['free', 'pro', 'enterprise'] },
      created_at: { type: 'string', format: 'date-time-utc' },
      metadata: { type: 'object', additionalProperties: true }
    }
  },
  'user.updated': {
    type: 'object',
    required: ['event_id', 'event_type', 'version', 'timestamp', 'source', 'user_id', 'updated_at', 'changes'],
    properties: {
      event_id: { type: 'string', format: 'uuid-v4' },
      event_type: { const: 'user.updated' },
      version: { type: 'string' },
      timestamp: { type: 'string', format: 'date-time-utc' },
      source: { type: 'string' },
      correlation_id: { type: 'string', format: 'uuid-v4' },
      user_id: { type: 'string', format: 'uuid-v4' },
      tenant_id: { type: 'string', format: 'uuid-v4' },
      updated_at: { type: 'string', format: 'date-time-utc' },
      changes: {
        type: 'object',
        properties: {
          full_name: { type: 'string' },
          avatar_url: { type: 'string', format: 'uri' },
          timezone: { type: 'string' },
          theme: { type: 'string', enum: ['light', 'dark', 'auto'] }
        }
      },
      previous_values: { type: 'object', additionalProperties: true }
    }
  },
  'user.subscription.changed': {
    type: 'object',
    required: ['event_id', 'event_type', 'version', 'timestamp', 'source', 'user_id', 'old_tier', 'new_tier', 'changed_at'],
    properties: {
      event_id: { type: 'string', format: 'uuid-v4' },
      event_type: { const: 'user.subscription.changed' },
      version: { type: 'string' },
      timestamp: { type: 'string', format: 'date-time-utc' },
      source: { type: 'string' },
      correlation_id: { type: 'string', format: 'uuid-v4' },
      user_id: { type: 'string', format: 'uuid-v4' },
      tenant_id: { type: 'string', format: 'uuid-v4' },
      old_tier: { type: 'string', enum: ['free', 'pro', 'enterprise'] },
      new_tier: { type: 'string', enum: ['free', 'pro', 'enterprise'] },
      changed_at: { type: 'string', format: 'date-time-utc' },
      billing_cycle: { type: 'string', enum: ['monthly', 'yearly'] },
      stripe_customer_id: { type: 'string' }
    }
  },
  'payment.created': {
    type: 'object',
    required: ['event_id', 'event_type', 'version', 'timestamp', 'source', 'payment_id', 'user_id', 'amount_sats', 'description', 'created_at'],
    properties: {
      event_id: { type: 'string', format: 'uuid-v4' },
      event_type: { const: 'payment.created' },
      version: { type: 'string' },
      timestamp: { type: 'string', format: 'date-time-utc' },
      source: { type: 'string' },
      correlation_id: { type: 'string', format: 'uuid-v4' },
      user_id: { type: 'string', format: 'uuid-v4' },
      tenant_id: { type: 'string', format: 'uuid-v4' },
      payment_id: { type: 'string', format: 'uuid-v4' },
      amount_sats: { type: 'integer', minimum: 1, currency: 'sats' },
      description: { type: 'string' },
      recipient: { type: 'string' },
      status: { type: 'string', enum: ['pending', 'completed', 'failed', 'cancelled'] },
      created_at: { type: 'string', format: 'date-time-utc' },
      metadata: { type: 'object', additionalProperties: true }
    }
  },
  'payment.status.changed': {
    type: 'object',
    required: ['event_id', 'event_type', 'version', 'timestamp', 'source', 'payment_id', 'old_status', 'new_status', 'changed_at'],
    properties: {
      event_id: { type: 'string', format: 'uuid-v4' },
      event_type: { const: 'payment.status.changed' },
      version: { type: 'string' },
      timestamp: { type: 'string', format: 'date-time-utc' },
      source: { type: 'string' },
      correlation_id: { type: 'string', format: 'uuid-v4' },
      user_id: { type: 'string', format: 'uuid-v4' },
      tenant_id: { type: 'string', format: 'uuid-v4' },
      payment_id: { type: 'string', format: 'uuid-v4' },
      old_status: { type: 'string', enum: ['pending', 'completed', 'failed', 'cancelled'] },
      new_status: { type: 'string', enum: ['pending', 'completed', 'failed', 'cancelled'] },
      changed_at: { type: 'string', format: 'date-time-utc' },
      payment_hash: { type: 'string' },
      failure_reason: { type: 'string' },
      completed_at: { type: 'string', format: 'date-time-utc' }
    }
  },
  'payment.completed': {
    type: 'object',
    required: ['event_id', 'event_type', 'version', 'timestamp', 'source', 'payment_id', 'user_id', 'amount_sats', 'payment_hash', 'completed_at'],
    properties: {
      event_id: { type: 'string', format: 'uuid-v4' },
      event_type: { const: 'payment.completed' },
      version: { type: 'string' },
      timestamp: { type: 'string', format: 'date-time-utc' },
      source: { type: 'string' },
      correlation_id: { type: 'string', format: 'uuid-v4' },
      user_id: { type: 'string', format: 'uuid-v4' },
      tenant_id: { type: 'string', format: 'uuid-v4' },
      payment_id: { type: 'string', format: 'uuid-v4' },
      amount_sats: { type: 'integer', minimum: 1, currency: 'sats' },
      payment_hash: { type: 'string' },
      completed_at: { type: 'string', format: 'date-time-utc' },
      description: { type: 'string' },
      recipient: { type: 'string' },
      fees_sats: { type: 'integer', minimum: 0, currency: 'sats' }
    }
  },
  'lnbits.webhook.received': {
    type: 'object',
    required: ['event_id', 'event_type', 'version', 'timestamp', 'source', 'type', 'data', 'received_at'],
    properties: {
      event_id: { type: 'string', format: 'uuid-v4' },
      event_type: { const: 'lnbits.webhook.received' },
      version: { type: 'string' },
      timestamp: { type: 'string', format: 'date-time-utc' },
      source: { type: 'string' },
      correlation_id: { type: 'string', format: 'uuid-v4' },
      user_id: { type: 'string', format: 'uuid-v4' },
      tenant_id: { type: 'string', format: 'uuid-v4' },
      type: { type: 'string', enum: ['payment_received', 'payment_sent', 'invoice_created', 'invoice_paid'] },
      data: {
        type: 'object',
        required: ['payment_hash', 'amount', 'timestamp', 'wallet_id', 'user_id'],
        properties: {
          payment_hash: { type: 'string' },
          amount: { type: 'integer', minimum: 1, currency: 'sats' },
          description: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time-utc' },
          wallet_id: { type: 'string' },
          user_id: { type: 'string' }
        }
      },
      received_at: { type: 'string', format: 'date-time-utc' },
      source_ip: { type: 'string', format: 'ipv4' }
    }
  },
  'agent.task.started': {
    type: 'object',
    required: ['event_id', 'event_type', 'version', 'timestamp', 'source', 'task_id', 'agent_id', 'user_id', 'task_type', 'started_at'],
    properties: {
      event_id: { type: 'string', format: 'uuid-v4' },
      event_type: { const: 'agent.task.started' },
      version: { type: 'string' },
      timestamp: { type: 'string', format: 'date-time-utc' },
      source: { type: 'string' },
      correlation_id: { type: 'string', format: 'uuid-v4' },
      user_id: { type: 'string', format: 'uuid-v4' },
      tenant_id: { type: 'string', format: 'uuid-v4' },
      task_id: { type: 'string', format: 'uuid-v4' },
      agent_id: { type: 'string', enum: ['research', 'content', 'automation', 'analysis'] },
      task_type: { type: 'string' },
      parameters: { type: 'object', additionalProperties: true },
      started_at: { type: 'string', format: 'date-time-utc' },
      estimated_duration_seconds: { type: 'integer', minimum: 1 }
    }
  },
  'agent.task.completed': {
    type: 'object',
    required: ['event_id', 'event_type', 'version', 'timestamp', 'source', 'task_id', 'agent_id', 'user_id', 'status', 'completed_at'],
    properties: {
      event_id: { type: 'string', format: 'uuid-v4' },
      event_type: { const: 'agent.task.completed' },
      version: { type: 'string' },
      timestamp: { type: 'string', format: 'date-time-utc' },
      source: { type: 'string' },
      correlation_id: { type: 'string', format: 'uuid-v4' },
      user_id: { type: 'string', format: 'uuid-v4' },
      tenant_id: { type: 'string', format: 'uuid-v4' },
      task_id: { type: 'string', format: 'uuid-v4' },
      agent_id: { type: 'string', enum: ['research', 'content', 'automation', 'analysis'] },
      status: { type: 'string', enum: ['pending', 'running', 'completed', 'failed', 'cancelled'] },
      completed_at: { type: 'string', format: 'date-time-utc' },
      duration_seconds: { type: 'integer', minimum: 0 },
      result_summary: { type: 'string' },
      error_message: { type: 'string' },
      output_size_bytes: { type: 'integer', minimum: 0 }
    }
  },
  'system.health.check': {
    type: 'object',
    required: ['event_id', 'event_type', 'version', 'timestamp', 'source', 'check_id', 'status', 'checked_at'],
    properties: {
      event_id: { type: 'string', format: 'uuid-v4' },
      event_type: { const: 'system.health.check' },
      version: { type: 'string' },
      timestamp: { type: 'string', format: 'date-time-utc' },
      source: { type: 'string' },
      correlation_id: { type: 'string', format: 'uuid-v4' },
      user_id: { type: 'string', format: 'uuid-v4' },
      tenant_id: { type: 'string', format: 'uuid-v4' },
      check_id: { type: 'string', format: 'uuid-v4' },
      status: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'] },
      checked_at: { type: 'string', format: 'date-time-utc' },
      services: {
        type: 'object',
        additionalProperties: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'] },
            response_time_ms: { type: 'number', minimum: 0 },
            error_message: { type: 'string' }
          }
        }
      },
      overall_response_time_ms: { type: 'number', minimum: 0 },
      environment: { type: 'string', enum: ['int', 'staging', 'prod'] }
    }
  },
  'system.maintenance.scheduled': {
    type: 'object',
    required: ['event_id', 'event_type', 'version', 'timestamp', 'source', 'maintenance_id', 'scheduled_at', 'duration_minutes', 'affected_services'],
    properties: {
      event_id: { type: 'string', format: 'uuid-v4' },
      event_type: { const: 'system.maintenance.scheduled' },
      version: { type: 'string' },
      timestamp: { type: 'string', format: 'date-time-utc' },
      source: { type: 'string' },
      correlation_id: { type: 'string', format: 'uuid-v4' },
      user_id: { type: 'string', format: 'uuid-v4' },
      tenant_id: { type: 'string', format: 'uuid-v4' },
      maintenance_id: { type: 'string', format: 'uuid-v4' },
      scheduled_at: { type: 'string', format: 'date-time-utc' },
      duration_minutes: { type: 'integer', minimum: 1 },
      affected_services: { type: 'array', items: { type: 'string' } },
      description: { type: 'string' },
      notification_sent: { type: 'boolean' }
    }
  },
  'feature.flag.changed': {
    type: 'object',
    required: ['event_id', 'event_type', 'version', 'timestamp', 'source', 'flag_name', 'old_value', 'new_value', 'changed_at', 'changed_by'],
    properties: {
      event_id: { type: 'string', format: 'uuid-v4' },
      event_type: { const: 'feature.flag.changed' },
      version: { type: 'string' },
      timestamp: { type: 'string', format: 'date-time-utc' },
      source: { type: 'string' },
      correlation_id: { type: 'string', format: 'uuid-v4' },
      user_id: { type: 'string', format: 'uuid-v4' },
      tenant_id: { type: 'string', format: 'uuid-v4' },
      flag_name: { type: 'string', pattern: '^[A-Z_]+$' },
      old_value: { oneOf: [{ type: 'boolean' }, { type: 'string' }, { type: 'number' }] },
      new_value: { oneOf: [{ type: 'boolean' }, { type: 'string' }, { type: 'number' }] },
      changed_at: { type: 'string', format: 'date-time-utc' },
      changed_by: { type: 'string', format: 'uuid-v4' },
      environment: { type: 'string', enum: ['int', 'staging', 'prod'] },
      reason: { type: 'string' }
    }
  }
};

// Event validation class
export class EventValidator {
  private validators: Map<EventType, any> = new Map();

  constructor() {
    // Initialize validators for each event type
    for (const [eventType, schema] of Object.entries(eventSchemas)) {
      this.validators.set(eventType as EventType, ajv.compile(schema));
    }
  }

  validate(event: any): { valid: boolean; errors?: any[] } {
    const eventType = event.event_type as EventType;
    const validator = this.validators.get(eventType);

    if (!validator) {
      return {
        valid: false,
        errors: [{ message: `Unknown event type: ${eventType}` }]
      };
    }

    const valid = validator(event);
    return {
      valid,
      errors: valid ? undefined : validator.errors
    };
  }

  validateOrThrow(event: any): LightningFlowEvent {
    const result = this.validate(event);
    if (!result.valid) {
      throw new Error(`Event validation failed: ${JSON.stringify(result.errors)}`);
    }
    return event as LightningFlowEvent;
  }
}

// Event factory functions
export function createUserCreatedEvent(
  user_id: string,
  email: string,
  subscription_tier: SubscriptionTier = 'free',
  full_name?: string,
  metadata?: Record<string, any>
): UserCreatedEvent {
  return {
    event_id: crypto.randomUUID(),
    event_type: 'user.created',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    source: 'lightningflow-api',
    user_id,
    email,
    full_name,
    subscription_tier,
    created_at: new Date().toISOString(),
    metadata
  };
}

export function createPaymentCreatedEvent(
  payment_id: string,
  user_id: string,
  amount_sats: number,
  description: string,
  recipient?: string,
  metadata?: Record<string, any>
): PaymentCreatedEvent {
  return {
    event_id: crypto.randomUUID(),
    event_type: 'payment.created',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    source: 'lightningflow-api',
    payment_id,
    user_id,
    amount_sats,
    description,
    recipient,
    status: 'pending',
    created_at: new Date().toISOString(),
    metadata
  };
}

export function createPaymentCompletedEvent(
  payment_id: string,
  user_id: string,
  amount_sats: number,
  payment_hash: string,
  description?: string,
  recipient?: string,
  fees_sats?: number
): PaymentCompletedEvent {
  return {
    event_id: crypto.randomUUID(),
    event_type: 'payment.completed',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    source: 'lightningflow-api',
    payment_id,
    user_id,
    amount_sats,
    payment_hash,
    completed_at: new Date().toISOString(),
    description,
    recipient,
    fees_sats
  };
}

export function createAgentTaskStartedEvent(
  task_id: string,
  agent_id: AgentType,
  user_id: string,
  task_type: string,
  parameters: Record<string, any>,
  estimated_duration_seconds?: number
): AgentTaskStartedEvent {
  return {
    event_id: crypto.randomUUID(),
    event_type: 'agent.task.started',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    source: 'lightningflow-api',
    task_id,
    agent_id,
    user_id,
    task_type,
    parameters,
    started_at: new Date().toISOString(),
    estimated_duration_seconds
  };
}

export function createAgentTaskCompletedEvent(
  task_id: string,
  agent_id: AgentType,
  user_id: string,
  status: AgentStatus,
  duration_seconds: number,
  result_summary?: string,
  error_message?: string,
  output_size_bytes?: number
): AgentTaskCompletedEvent {
  return {
    event_id: crypto.randomUUID(),
    event_type: 'agent.task.completed',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    source: 'lightningflow-api',
    task_id,
    agent_id,
    user_id,
    status,
    completed_at: new Date().toISOString(),
    duration_seconds,
    result_summary,
    error_message,
    output_size_bytes
  };
}

// Default event validator instance
export const eventValidator = new EventValidator();

// Utility functions
export function validateEvent(event: any): { valid: boolean; errors?: any[] } {
  return eventValidator.validate(event);
}

export function validateEventOrThrow(event: any): LightningFlowEvent {
  return eventValidator.validateOrThrow(event);
}

export function isEventType(eventType: string): eventType is EventType {
  return eventType in eventSchemas;
}

export function getEventSchema(eventType: EventType): any {
  return eventSchemas[eventType];
}

export function listEventTypes(): EventType[] {
  return Object.keys(eventSchemas) as EventType[];
}








