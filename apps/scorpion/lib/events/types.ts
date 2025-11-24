/**
 * Scorpion Event System
 * Event-driven architecture foundation for cloud-native patterns
 * 
 * Based on Cloud Digital Leader principles:
 * - Pub/Sub pattern for decoupled services
 * - Event-driven functions (FaaS-style)
 * - Observable and auditable system
 */

export type EventType =
  // Agent Events
  | 'agent.run.started'
  | 'agent.run.completed'
  | 'agent.run.failed'
  | 'agent.run.cancelled'

  // Workflow Events
  | 'workflow.started'
  | 'workflow.completed'
  | 'workflow.failed'
  | 'workflow.cancelled'

  // Tool Events
  | 'tool.request'
  | 'tool.requested'
  | 'tool.response'
  | 'tool.result'
  | 'tool.failed'
  | 'tool.timeout'

  // System Events
  | 'system.alert'
  | 'system.warning'
  | 'system.error'
  | 'system.health.check'

  // Data Events
  | 'data.ingested'
  | 'data.processed'
  | 'data.stored'
  | 'data.deleted'

  // Cost Events
  | 'cost.threshold.warning'
  | 'cost.threshold.exceeded'
  | 'cost.resource.created'
  | 'cost.resource.destroyed'

  // User Events
  | 'user.action'
  | 'user.login'
  | 'user.logout'
  | 'user.permission.changed';

export type EventSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface BaseEvent {
  id: string;
  type: EventType;
  severity: EventSeverity;
  timestamp: string;
  source: string; // Service/component that emitted the event
  environment: 'dev' | 'staging' | 'prod';
  metadata?: Record<string, unknown>;
}

// Agent Events
export interface AgentRunStartedEvent extends BaseEvent {
  type: 'agent.run.started';
  data: {
    agentId: string;
    agentName: string;
    workflowId?: string;
    userId?: string;
    input?: Record<string, unknown>;
  };
}

export interface AgentRunCompletedEvent extends BaseEvent {
  type: 'agent.run.completed';
  data: {
    agentId: string;
    agentName: string;
    workflowId?: string;
    duration: number; // milliseconds
    success: boolean;
    output?: Record<string, unknown>;
  };
}

export interface AgentRunFailedEvent extends BaseEvent {
  type: 'agent.run.failed';
  data: {
    agentId: string;
    agentName: string;
    workflowId?: string;
    error: string;
    errorCode?: string;
    stackTrace?: string;
  };
}

// Workflow Events
export interface WorkflowStartedEvent extends BaseEvent {
  type: 'workflow.started';
  data: {
    workflowId: string;
    workflowName: string;
    trigger: string; // webhook, schedule, manual, etc.
    userId?: string;
  };
}

export interface WorkflowFailedEvent extends BaseEvent {
  type: 'workflow.failed';
  data: {
    workflowId: string;
    workflowName: string;
    nodeId?: string;
    nodeName?: string;
    error: string;
    errorCode?: string;
    retryCount?: number;
  };
}

// Tool Events
export interface ToolRequestEvent extends BaseEvent {
  type: 'tool.request';
  data: {
    tool: string;
    toolName: string;
    agentId?: string;
    workflowId?: string;
    params: Record<string, unknown>;
    requestId: string;
  };
}

export interface ToolRequestedEvent extends BaseEvent {
  type: 'tool.requested';
  data: {
    tool: string;
    callId: string;
    args: Record<string, unknown>;
    conversationId?: string;
    planStep?: boolean;
  };
}

export interface ToolResponseEvent extends BaseEvent {
  type: 'tool.response';
  data: {
    tool: string;
    toolName: string;
    requestId: string;
    success: boolean;
    duration: number; // milliseconds
    response?: Record<string, unknown>;
    error?: string;
  };
}

export interface ToolResultEvent extends BaseEvent {
  type: 'tool.result';
  data: {
    tool: string;
    callId: string;
    success: boolean;
    duration: number;
    error?: string;
    conversationId?: string;
    planStep?: boolean;
  };
}

// System Events
export interface SystemAlertEvent extends BaseEvent {
  type: 'system.alert';
  data: {
    component: string;
    message: string;
    metric?: string;
    value?: number;
    threshold?: number;
  };
}

export interface SystemErrorEvent extends BaseEvent {
  type: 'system.error';
  data: {
    component: string;
    error: string;
    errorCode?: string;
    stackTrace?: string;
    context?: Record<string, unknown>;
  };
}

// Cost Events
export interface CostThresholdWarningEvent extends BaseEvent {
  type: 'cost.threshold.warning';
  data: {
    product: string;
    environment: string;
    currentSpend: number;
    budget: number;
    percentage: number; // 0-100
  };
}

export interface CostResourceCreatedEvent extends BaseEvent {
  type: 'cost.resource.created';
  data: {
    resourceId: string;
    resourceType: string;
    product: string;
    environment: string;
    estimatedCost?: number;
  };
}

// Union type for all events
export type ScorpionEvent =
  | AgentRunStartedEvent
  | AgentRunCompletedEvent
  | AgentRunFailedEvent
  | WorkflowStartedEvent
  | WorkflowFailedEvent
  | ToolRequestEvent
  | ToolRequestedEvent
  | ToolResponseEvent
  | ToolResultEvent
  | SystemAlertEvent
  | SystemErrorEvent
  | CostThresholdWarningEvent
  | CostResourceCreatedEvent;

// Event metadata for tracking
export interface EventMetadata {
  correlationId?: string; // Links related events
  parentEventId?: string; // For event chains
  userId?: string;
  sessionId?: string;
  requestId?: string;
  tags?: Record<string, string>; // For filtering/grouping
}

// Event with full metadata
export type EnrichedEvent = ScorpionEvent & {
  metadata: EventMetadata;
};

