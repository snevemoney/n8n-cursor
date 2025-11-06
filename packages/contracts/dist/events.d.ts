export type EventType = 'user.created' | 'user.updated' | 'user.subscription.changed' | 'payment.created' | 'payment.status.changed' | 'payment.completed' | 'lnbits.webhook.received' | 'agent.task.started' | 'agent.task.completed' | 'system.health.check' | 'system.maintenance.scheduled' | 'feature.flag.changed';
export type WebhookEventType = 'payment_received' | 'payment_sent' | 'invoice_created' | 'invoice_paid';
export type AgentType = 'research' | 'content' | 'automation' | 'analysis';
export type AgentStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
export type SubscriptionTier = 'free' | 'pro' | 'enterprise';
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';
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
export type LightningFlowEvent = UserCreatedEvent | UserUpdatedEvent | UserSubscriptionChangedEvent | PaymentCreatedEvent | PaymentStatusChangedEvent | PaymentCompletedEvent | LNbitsWebhookReceivedEvent | AgentTaskStartedEvent | AgentTaskCompletedEvent | SystemHealthCheckEvent | SystemMaintenanceScheduledEvent | FeatureFlagChangedEvent;
export declare const eventSchemas: Record<EventType, any>;
export declare class EventValidator {
    private validators;
    constructor();
    validate(event: any): {
        valid: boolean;
        errors?: any[];
    };
    validateOrThrow(event: any): LightningFlowEvent;
}
export declare function createUserCreatedEvent(user_id: string, email: string, subscription_tier?: SubscriptionTier, full_name?: string, metadata?: Record<string, any>): UserCreatedEvent;
export declare function createPaymentCreatedEvent(payment_id: string, user_id: string, amount_sats: number, description: string, recipient?: string, metadata?: Record<string, any>): PaymentCreatedEvent;
export declare function createPaymentCompletedEvent(payment_id: string, user_id: string, amount_sats: number, payment_hash: string, description?: string, recipient?: string, fees_sats?: number): PaymentCompletedEvent;
export declare function createAgentTaskStartedEvent(task_id: string, agent_id: AgentType, user_id: string, task_type: string, parameters: Record<string, any>, estimated_duration_seconds?: number): AgentTaskStartedEvent;
export declare function createAgentTaskCompletedEvent(task_id: string, agent_id: AgentType, user_id: string, status: AgentStatus, duration_seconds: number, result_summary?: string, error_message?: string, output_size_bytes?: number): AgentTaskCompletedEvent;
export declare const eventValidator: EventValidator;
export declare function validateEvent(event: any): {
    valid: boolean;
    errors?: any[];
};
export declare function validateEventOrThrow(event: any): LightningFlowEvent;
export declare function isEventType(eventType: string): eventType is EventType;
export declare function getEventSchema(eventType: EventType): any;
export declare function listEventTypes(): EventType[];
//# sourceMappingURL=events.d.ts.map