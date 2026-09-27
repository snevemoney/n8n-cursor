// LightningFlow AI Event Schema
// Generated from contracts/events.yaml by packages/contracts/scripts/generate-events.js
// Do not edit by hand.

export type EventType =
  | 'lnbits.payment.received'
  | 'lnbits.payment.sent'
  | 'lnbits.invoice.created'
  | 'lnbits.invoice.paid'
  | 'lightning.channel.opened'
  | 'lightning.channel.closed'
  | 'workflow.run.created'
  | 'workflow.run.started'
  | 'workflow.run.progress'
  | 'workflow.run.completed'
  | 'workflow.run.failed'
  | 'agent.executed'
  | 'agent.status.changed'
  | 'system.alert'
  | 'system.health.check';

export interface BaseEvent {
  eventId: string;
  eventType: string;
  version: string;
  timestamp: string;
  source: string;
  correlationId?: string;
}

export interface LNbitsPaymentReceived extends BaseEvent {
  eventType: 'lnbits.payment.received';
  data: {
    paymentHash: string;
    amount: number;
    currency: 'sats';
    description: string;
    payer?: string;
    invoice?: string;
    preimage?: string;
  };
}

export interface LNbitsPaymentSent extends BaseEvent {
  eventType: 'lnbits.payment.sent';
  data: {
    paymentHash: string;
    amount: number;
    currency: 'sats';
    description: string;
    payee: string;
    invoice?: string;
    fee?: number;
  };
}

export interface LNbitsInvoiceCreated extends BaseEvent {
  eventType: 'lnbits.invoice.created';
  data: {
    invoiceId: string;
    invoice: string;
    amount: number;
    currency: 'sats';
    description: string;
    expiresAt: string;
    webhookUrl?: string;
  };
}

export interface LNbitsInvoicePaid extends BaseEvent {
  eventType: 'lnbits.invoice.paid';
  data: {
    invoiceId: string;
    paymentHash: string;
    amount: number;
    currency: 'sats';
    paidAt: string;
    preimage?: string;
  };
}

export interface LightningChannelOpened extends BaseEvent {
  eventType: 'lightning.channel.opened';
  data: {
    channelId: string;
    nodeId: string;
    capacity: number;
    localBalance: number;
    remoteBalance: number;
    feeRate?: number;
  };
}

export interface LightningChannelClosed extends BaseEvent {
  eventType: 'lightning.channel.closed';
  data: {
    channelId: string;
    nodeId: string;
    reason: 'cooperative' | 'force' | 'breach' | 'unknown';
    finalBalance?: number;
    closedAt: string;
  };
}

export interface WorkflowRunCreated extends BaseEvent {
  eventType: 'workflow.run.created';
  data: {
    workflowRunId: string;
    workflowId: string;
    tenantId: string;
    status: 'created' | 'queued' | 'running' | 'completed' | 'failed';
    payload: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  };
}

export interface WorkflowRunStarted extends BaseEvent {
  eventType: 'workflow.run.started';
  data: {
    workflowRunId: string;
    workflowId: string;
    tenantId: string;
    status: 'running';
  };
}

export interface WorkflowRunProgress extends BaseEvent {
  eventType: 'workflow.run.progress';
  data: {
    workflowRunId: string;
    workflowId: string;
    tenantId: string;
    progress: number;
    currentStep: string;
    stepProgress?: number;
  };
}

export interface WorkflowRunCompleted extends BaseEvent {
  eventType: 'workflow.run.completed';
  data: {
    workflowRunId: string;
    workflowId: string;
    tenantId: string;
    status: 'completed';
    duration: number;
    result?: Record<string, unknown>;
  };
}

export interface WorkflowRunFailed extends BaseEvent {
  eventType: 'workflow.run.failed';
  data: {
    workflowRunId: string;
    workflowId: string;
    tenantId: string;
    status: 'failed';
    error: {
      code: string;
      message: string;
      step?: string;
      stack?: string;
    };
    duration: number;
  };
}

export interface AgentExecuted extends BaseEvent {
  eventType: 'agent.executed';
  data: {
    agentId: string;
    agentName: string;
    agentType: 'bitcoin' | 'lightning' | 'trading' | 'analytics' | 'webhook';
    executionId: string;
    status: 'success' | 'error' | 'timeout';
    executionTime: number;
    result?: Record<string, unknown>;
    error?: {
      message?: string;
      code?: string;
      stack?: string;
    };
  };
}

export interface AgentStatusChanged extends BaseEvent {
  eventType: 'agent.status.changed';
  data: {
    agentId: string;
    agentName: string;
    oldStatus: 'active' | 'inactive' | 'error';
    newStatus: 'active' | 'inactive' | 'error';
    reason?: string;
  };
}

export interface SystemAlert extends BaseEvent {
  eventType: 'system.alert';
  data: {
    alertType: 'error' | 'warning' | 'info';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    service: string;
    metrics?: Record<string, unknown>;
  };
}

export interface SystemHealthCheck extends BaseEvent {
  eventType: 'system.health.check';
  data: {
    status: 'healthy' | 'unhealthy';
    services: {
      database: 'healthy' | 'unhealthy';
      redis: 'healthy' | 'unhealthy';
      external: 'healthy' | 'unhealthy';
    };
    metrics: {
      cpu: number;
      memory: number;
      disk: number;
    };
  };
}

export type LightningFlowEvent =
  | LNbitsPaymentReceived
  | LNbitsPaymentSent
  | LNbitsInvoiceCreated
  | LNbitsInvoicePaid
  | LightningChannelOpened
  | LightningChannelClosed
  | WorkflowRunCreated
  | WorkflowRunStarted
  | WorkflowRunProgress
  | WorkflowRunCompleted
  | WorkflowRunFailed
  | AgentExecuted
  | AgentStatusChanged
  | SystemAlert
  | SystemHealthCheck;
