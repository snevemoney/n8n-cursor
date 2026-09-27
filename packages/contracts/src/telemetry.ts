// LightningFlow AI Telemetry Schema
// Generated from contracts/telemetry.yaml by packages/contracts/scripts/generate-telemetry.js
// Do not edit by hand.

export const Spans = {
  ApiRequest: 'api.request',
  ApiMiddleware: 'api.middleware',
  WorkflowExecute: 'workflow.execute',
  WorkflowStep: 'workflow.step',
  AgentExecute: 'agent.execute',
  AgentHealthCheck: 'agent.health_check',
  WebhookProcess: 'webhook.process',
  WebhookValidate: 'webhook.validate',
  DatabaseQuery: 'database.query',
  DatabaseTransaction: 'database.transaction',
  ExternalService: 'external.service',
  BitcoinTransaction: 'bitcoin.transaction',
  LightningPayment: 'lightning.payment',
  LightningChannel: 'lightning.channel',
  SystemStartup: 'system.startup',
  SystemShutdown: 'system.shutdown',
} as const;

export type SpanName = typeof Spans[keyof typeof Spans];

export const Metrics = {
  ApiRequestsTotal: 'api.requests.total',
  ApiRequestDurationMs: 'api.request.duration.ms',
  ApiRequestSizeBytes: 'api.request.size.bytes',
  ApiResponseSizeBytes: 'api.response.size.bytes',
  WorkflowExecutionsTotal: 'workflow.executions.total',
  WorkflowExecutionDurationMs: 'workflow.execution.duration.ms',
  WorkflowStepsTotal: 'workflow.steps.total',
  WorkflowStepDurationMs: 'workflow.step.duration.ms',
  WorkflowQueueSize: 'workflow.queue.size',
  WorkflowQueueWaiting: 'workflow.queue.waiting',
  WorkflowActiveCount: 'workflow.active.count',
  AgentExecutionsTotal: 'agent.executions.total',
  AgentExecutionDurationMs: 'agent.execution.duration.ms',
  AgentActiveCount: 'agent.active.count',
  AgentHealthStatus: 'agent.health.status',
  WebhookEventsTotal: 'webhook.events.total',
  WebhookProcessingDurationMs: 'webhook.processing.duration.ms',
  WebhookRetriesTotal: 'webhook.retries.total',
  DatabaseConnectionsActive: 'database.connections.active',
  DatabaseConnectionsIdle: 'database.connections.idle',
  DatabaseQueriesTotal: 'database.queries.total',
  DatabaseQueryDurationMs: 'database.query.duration.ms',
  DatabaseTransactionsTotal: 'database.transactions.total',
  DatabaseTransactionDurationMs: 'database.transaction.duration.ms',
  ExternalServiceCallsTotal: 'external.service.calls.total',
  ExternalServiceDurationMs: 'external.service.duration.ms',
  ExternalServiceRetriesTotal: 'external.service.retries.total',
  BitcoinTransactionsTotal: 'bitcoin.transactions.total',
  BitcoinTransactionDurationMs: 'bitcoin.transaction.duration.ms',
  LightningPaymentsTotal: 'lightning.payments.total',
  LightningPaymentDurationMs: 'lightning.payment.duration.ms',
  LightningPaymentAmountSats: 'lightning.payment.amount.sats',
  LightningChannelsTotal: 'lightning.channels.total',
  LightningChannelCapacitySats: 'lightning.channel.capacity.sats',
  SystemCpuUsagePercent: 'system.cpu.usage.percent',
  SystemMemoryUsageBytes: 'system.memory.usage.bytes',
  SystemDiskUsageBytes: 'system.disk.usage.bytes',
  SystemUptimeSeconds: 'system.uptime.seconds',
  BusinessUsersActive: 'business.users.active',
  BusinessAgentsActive: 'business.agents.active',
  BusinessPaymentsTotal: 'business.payments.total',
  BusinessPaymentVolumeSats: 'business.payment.volume.sats',
} as const;

export type MetricName = typeof Metrics[keyof typeof Metrics];

export type MetricType = 'counter' | 'histogram' | 'gauge';

export interface SpanAttributes {
  'http.method'?: string;
  'http.url'?: string;
  'http.status_code'?: string;
  'http.user_agent'?: string;
  'http.request_id'?: string;
  'http.route'?: string;
  'http.client_ip'?: string;
  'user.id'?: string;
  'tenant.id'?: string;
  'request.size'?: string;
  'response.size'?: string;
  'middleware.name'?: string;
  'middleware.duration_ms'?: string;
  'middleware.status'?: string;
  'workflow.id'?: string;
  'workflow.run_id'?: string;
  'workflow.tenant_id'?: string;
  'execution.status'?: string;
  'execution.duration_ms'?: string;
  'execution.progress_percent'?: string;
  'execution.current_step'?: string;
  'execution.error_message'?: string;
  'execution.retry_count'?: string;
  'step.id'?: string;
  'step.name'?: string;
  'step.status'?: string;
  'step.duration_ms'?: string;
  'step.progress_percent'?: string;
  'step.error_message'?: string;
  'step.retry_count'?: string;
  'agent.id'?: string;
  'agent.name'?: string;
  'agent.type'?: string;
  'execution.id'?: string;
  'execution.result_size'?: string;
  'health.status'?: string;
  'health.duration_ms'?: string;
  'health.error_message'?: string;
  'health.metrics'?: string;
  'webhook.type'?: string;
  'webhook.event'?: string;
  'webhook.source'?: string;
  'processing.status'?: string;
  'processing.duration_ms'?: string;
  'processing.retry_count'?: string;
  'processing.error_message'?: string;
  'webhook.payload_size'?: string;
  'validation.status'?: string;
  'validation.duration_ms'?: string;
  'validation.error_message'?: string;
  'validation.signature_valid'?: string;
  'db.system'?: string;
  'db.operation'?: string;
  'db.sql.table'?: string;
  'query.status'?: string;
  'query.duration_ms'?: string;
  'query.rows_affected'?: string;
  'query.rows_returned'?: string;
  'query.error_message'?: string;
  'db.connection_pool.size'?: string;
  'transaction.status'?: string;
  'transaction.duration_ms'?: string;
  'transaction.operations_count'?: string;
  'transaction.error_message'?: string;
  'service.name'?: string;
  'service.operation'?: string;
  'service.duration_ms'?: string;
  'service.retry_count'?: string;
  'service.error_message'?: string;
  'service.response_size'?: string;
  'bitcoin.operation'?: string;
  'transaction.amount_sats'?: string;
  'transaction.fee_sats'?: string;
  'lightning.operation'?: string;
  'payment.status'?: string;
  'payment.duration_ms'?: string;
  'payment.amount_sats'?: string;
  'payment.fee_sats'?: string;
  'payment.error_message'?: string;
  'payment.invoice_hash'?: string;
  'channel.status'?: string;
  'channel.duration_ms'?: string;
  'channel.capacity_sats'?: string;
  'channel.error_message'?: string;
  'system.component'?: string;
  'startup.status'?: string;
  'startup.duration_ms'?: string;
  'startup.error_message'?: string;
  'shutdown.status'?: string;
  'shutdown.duration_ms'?: string;
  'shutdown.error_message'?: string;
}

export interface MetricLabels {
  method?: string;
  route?: string;
  status_code?: string;
  user_agent?: string;
  workflow_id?: string;
  tenant_id?: string;
  status?: string;
  step_id?: string;
  queue_name?: string;
  agent_id?: string;
  agent_name?: string;
  agent_type?: string;
  webhook_type?: string;
  event_type?: string;
  retry_count?: string;
  db_system?: string;
  pool_name?: string;
  operation?: string;
  table?: string;
  service_name?: string;
  component?: string;
  type?: string;
  mount_point?: string;
  period?: string;
  payment_type?: string;
}

export type LogLevel =
  | 'trace'
  | 'debug'
  | 'info'
  | 'warn'
  | 'error'
  | 'fatal';

export interface LogFields {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  request_id: string;
  user_id?: string;
  tenant_id?: string;
  workflow_id?: string;
  workflow_run_id?: string;
  step_id?: string;
  agent_id?: string;
  execution_id?: string;
  webhook_type?: string;
  error_code?: string;
  duration_ms?: string;
  status_code?: string;
}
