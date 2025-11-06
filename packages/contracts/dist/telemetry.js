"use strict";
// LightningFlow AI Telemetry Schema
// Generated from contracts/telemetry.yaml
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultSamplingConfig = exports.defaultTelemetryConfig = exports.SpanEventAttributes = exports.SpanEvents = exports.ResourceAttributes = exports.MetricAttributes = exports.SpanAttributes = exports.Metrics = exports.Spans = void 0;
exports.createSpanAttributes = createSpanAttributes;
exports.createMetricAttributes = createMetricAttributes;
exports.createResourceAttributes = createResourceAttributes;
// Span names
exports.Spans = {
    // API Spans
    ApiRequest: 'api.request',
    ApiAuth: 'api.auth',
    // Payment Spans
    PaymentCreate: 'payment.create',
    PaymentProcess: 'payment.process',
    PaymentWebhook: 'payment.webhook',
    // AI Agent Spans
    AiAgentTask: 'ai_agent.task',
    AiAgentResearch: 'ai_agent.research',
    AiAgentContent: 'ai_agent.content',
    // Database Spans
    DbQuery: 'db.query',
    DbTransaction: 'db.transaction',
    // Cache Spans
    CacheOperation: 'cache.operation',
    // External Service Spans
    ExternalLnbits: 'external.lnbits',
    ExternalOpenai: 'external.openai',
    // Background Job Spans
    JobProcess: 'job.process',
    JobSchedule: 'job.schedule'
};
// Metric names
exports.Metrics = {
    // API Metrics
    ApiRequestsTotal: 'api.requests.total',
    ApiRequestDuration: 'api.request.duration',
    ApiActiveConnections: 'api.active_connections',
    // Payment Metrics
    PaymentsTotal: 'payments.total',
    PaymentsAmount: 'payments.amount',
    PaymentsDuration: 'payments.duration',
    PaymentsFees: 'payments.fees',
    // AI Agent Metrics
    AiAgentTasksTotal: 'ai_agent.tasks.total',
    AiAgentTasksDuration: 'ai_agent.tasks.duration',
    AiAgentTokensUsed: 'ai_agent.tokens.used',
    AiAgentCost: 'ai_agent.cost',
    // Database Metrics
    DbConnectionsActive: 'db.connections.active',
    DbQueriesTotal: 'db.queries.total',
    DbQueryDuration: 'db.query.duration',
    // Cache Metrics
    CacheOperationsTotal: 'cache.operations.total',
    CacheOperationDuration: 'cache.operation.duration',
    CacheMemoryUsage: 'cache.memory.usage',
    // System Metrics
    SystemCpuUsage: 'system.cpu.usage',
    SystemMemoryUsage: 'system.memory.usage',
    SystemDiskUsage: 'system.disk.usage',
    // Business Metrics
    UsersActive: 'users.active',
    UsersNew: 'users.new',
    RevenueDaily: 'revenue.daily'
};
// Span attribute names
exports.SpanAttributes = {
    // HTTP attributes
    HttpMethod: 'http.method',
    HttpRoute: 'http.route',
    HttpStatusCode: 'http.status_code',
    HttpUserAgent: 'http.user_agent',
    HttpRequestBodySize: 'http.request.body.size',
    HttpResponseBodySize: 'http.response.body.size',
    // User attributes
    UserId: 'user.id',
    TenantId: 'tenant.id',
    RequestId: 'request.id',
    ApiVersion: 'api.version',
    // Authentication attributes
    AuthMethod: 'auth.method',
    AuthSuccess: 'auth.success',
    AuthProvider: 'auth.provider',
    AuthTokenType: 'auth.token_type',
    AuthExpiresIn: 'auth.expires_in',
    // Payment attributes
    PaymentId: 'payment.id',
    PaymentAmountSats: 'payment.amount_sats',
    PaymentStatus: 'payment.status',
    PaymentDescription: 'payment.description',
    PaymentRecipient: 'payment.recipient',
    PaymentMetadata: 'payment.metadata',
    PaymentRouteHops: 'payment.route_hops',
    PaymentFeesSats: 'payment.fees_sats',
    PaymentHash: 'payment.payment_hash',
    PaymentDurationMs: 'payment.duration_ms',
    // Lightning Network attributes
    LnNodeId: 'ln.node_id',
    // Webhook attributes
    WebhookSource: 'webhook.source',
    WebhookEventType: 'webhook.event_type',
    WebhookStatus: 'webhook.status',
    WebhookSignatureValid: 'webhook.signature_valid',
    WebhookRetryCount: 'webhook.retry_count',
    WebhookProcessingTimeMs: 'webhook.processing_time_ms',
    // AI Agent attributes
    AgentId: 'agent.id',
    AgentTaskId: 'agent.task_id',
    AgentTaskType: 'agent.task_type',
    AgentStatus: 'agent.status',
    AgentModel: 'agent.model',
    AgentTokensUsed: 'agent.tokens_used',
    AgentDurationMs: 'agent.duration_ms',
    AgentCostSats: 'agent.cost_sats',
    // Research attributes
    ResearchQuery: 'research.query',
    ResearchSourcesCount: 'research.sources_count',
    ResearchDepth: 'research.depth',
    ResearchLanguage: 'research.language',
    ResearchQualityScore: 'research.quality_score',
    // Content attributes
    ContentType: 'content.type',
    ContentLength: 'content.length',
    ContentLanguage: 'content.language',
    ContentTone: 'content.tone',
    ContentPlatform: 'content.platform',
    ContentGenerationTimeMs: 'content.generation_time_ms',
    // Database attributes
    DbSystem: 'db.system',
    DbOperation: 'db.operation',
    DbSqlTable: 'db.sql.table',
    DbResponseStatus: 'db.response.status',
    DbSqlStatement: 'db.sql.statement',
    DbRowsAffected: 'db.rows_affected',
    DbDurationMs: 'db.duration_ms',
    DbConnectionId: 'db.connection_id',
    DbTransactionId: 'db.transaction.id',
    DbTransactionStatus: 'db.transaction.status',
    DbTransactionDurationMs: 'db.transaction.duration_ms',
    DbTransactionOperationsCount: 'db.transaction.operations_count',
    DbTransactionIsolationLevel: 'db.transaction.isolation_level',
    // Cache attributes
    CacheSystem: 'cache.system',
    CacheOperation: 'cache.operation',
    CacheKey: 'cache.key',
    CacheHit: 'cache.hit',
    CacheTtl: 'cache.ttl',
    CacheSizeBytes: 'cache.size_bytes',
    CacheDurationMs: 'cache.duration_ms',
    CacheClusterNode: 'cache.cluster_node',
    // External service attributes
    ExternalService: 'external.service',
    ExternalOperation: 'external.operation',
    ExternalModel: 'external.model',
    ExternalDurationMs: 'external.duration_ms',
    ExternalRetryCount: 'external.retry_count',
    ExternalRateLimitRemaining: 'external.rate_limit_remaining',
    ExternalTokensUsed: 'external.tokens_used',
    ExternalCostUsd: 'external.cost_usd',
    // Job attributes
    JobId: 'job.id',
    JobType: 'job.type',
    JobStatus: 'job.status',
    JobQueue: 'job.queue',
    JobAttempts: 'job.attempts',
    JobDurationMs: 'job.duration_ms',
    JobPriority: 'job.priority',
    JobScheduledAt: 'job.scheduled_at',
    JobScheduleType: 'job.schedule_type',
    JobRecurrence: 'job.recurrence',
    // System attributes
    SystemNode: 'system.node',
    SystemProcess: 'system.process',
    SystemMountPoint: 'system.mount_point',
    // Business attributes
    UserSubscriptionTier: 'user.subscription_tier',
    RevenueSource: 'revenue.source'
};
// Metric attribute names
exports.MetricAttributes = {
    // HTTP attributes
    HttpMethod: 'http.method',
    HttpRoute: 'http.route',
    HttpStatusCode: 'http.status_code',
    ApiVersion: 'api.version',
    // Payment attributes
    PaymentStatus: 'payment.status',
    PaymentAmountRange: 'payment.amount_range',
    UserSubscriptionTier: 'user.subscription_tier',
    LnNodeId: 'ln.node_id',
    // AI Agent attributes
    AgentId: 'agent.id',
    AgentTaskType: 'agent.task_type',
    AgentStatus: 'agent.status',
    AgentModel: 'agent.model',
    TokenType: 'token.type',
    // Database attributes
    DbSystem: 'db.system',
    DbOperation: 'db.operation',
    DbSqlTable: 'db.sql.table',
    DbPool: 'db.pool',
    // Cache attributes
    CacheSystem: 'cache.system',
    CacheOperation: 'cache.operation',
    CacheHit: 'cache.hit',
    CacheClusterNode: 'cache.cluster_node',
    // System attributes
    SystemNode: 'system.node',
    SystemProcess: 'system.process',
    SystemMountPoint: 'system.mount_point',
    // Business attributes
    UserSubscriptionTier: 'user.subscription_tier',
    UserSource: 'user.source',
    RevenueSource: 'revenue.source',
    UserTenantId: 'user.tenant_id'
};
// Resource attributes
exports.ResourceAttributes = {
    ServiceName: 'service.name',
    ServiceVersion: 'service.version',
    ServiceNamespace: 'service.namespace',
    DeploymentEnvironment: 'deployment.environment',
    DeploymentRegion: 'deployment.region',
    DeploymentDatacenter: 'deployment.datacenter',
    DeploymentCluster: 'deployment.cluster',
    RuntimeName: 'runtime.name',
    RuntimeVersion: 'runtime.version',
    RuntimeArch: 'runtime.arch',
    ContainerName: 'container.name',
    ContainerImage: 'container.image',
    ContainerTag: 'container.tag'
};
// Span event names
exports.SpanEvents = {
    RequestStarted: 'request.started',
    RequestCompleted: 'request.completed',
    RequestFailed: 'request.failed'
};
// Span event attribute names
exports.SpanEventAttributes = {
    Timestamp: 'timestamp',
    DurationMs: 'duration_ms',
    ErrorCode: 'error.code',
    ErrorMessage: 'error.message'
};
// Default telemetry configuration
exports.defaultTelemetryConfig = {
    service: {
        name: 'lightningflow-ai',
        version: '1.0.0',
        namespace: 'lightningflow'
    },
    deployment: {
        environment: 'int',
        region: 'us-east-1',
        datacenter: 'aws',
        cluster: 'development'
    },
    runtime: {
        name: 'nodejs',
        version: '18.x',
        arch: 'x86_64'
    },
    container: {
        name: 'lightningflow-api',
        image: 'lightningflow/ai:latest',
        tag: 'v1.0.0'
    }
};
// Utility functions for span creation
function createSpanAttributes(attributes) {
    const result = {};
    for (const [key, value] of Object.entries(attributes)) {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            result[key] = value;
        }
        else if (value !== null && value !== undefined) {
            result[key] = String(value);
        }
    }
    return result;
}
// Utility functions for metric creation
function createMetricAttributes(attributes) {
    const result = {};
    for (const [key, value] of Object.entries(attributes)) {
        if (value !== null && value !== undefined) {
            result[key] = String(value);
        }
    }
    return result;
}
// Utility functions for resource attributes
function createResourceAttributes(config) {
    return {
        [exports.ResourceAttributes.ServiceName]: config.service.name,
        [exports.ResourceAttributes.ServiceVersion]: config.service.version,
        [exports.ResourceAttributes.ServiceNamespace]: config.service.namespace,
        [exports.ResourceAttributes.DeploymentEnvironment]: config.deployment.environment,
        [exports.ResourceAttributes.DeploymentRegion]: config.deployment.region || '',
        [exports.ResourceAttributes.DeploymentDatacenter]: config.deployment.datacenter || '',
        [exports.ResourceAttributes.DeploymentCluster]: config.deployment.cluster || '',
        [exports.ResourceAttributes.RuntimeName]: config.runtime.name,
        [exports.ResourceAttributes.RuntimeVersion]: config.runtime.version,
        [exports.ResourceAttributes.RuntimeArch]: config.runtime.arch || '',
        [exports.ResourceAttributes.ContainerName]: config.container.name || '',
        [exports.ResourceAttributes.ContainerImage]: config.container.image || '',
        [exports.ResourceAttributes.ContainerTag]: config.container.tag || ''
    };
}
exports.defaultSamplingConfig = {
    rates: {
        api: 0.1, // 10% of API requests
        payments: 1.0, // 100% of payment operations
        ai_agents: 0.5, // 50% of AI agent tasks
        background: 0.01 // 1% of background jobs
    },
    rules: [
        { condition: "http.route == '/healthz'", rate: 0.0 },
        { condition: "http.status_code >= 500", rate: 1.0 },
        { condition: "payment.amount_sats > 1000000", rate: 1.0 },
        { condition: "agent.task_type == 'research'", rate: 0.2 }
    ]
};
//# sourceMappingURL=telemetry.js.map