"use strict";
// LightningFlow AI Event Schema
// Generated from contracts/events.yaml
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventValidator = exports.EventValidator = exports.eventSchemas = void 0;
exports.createUserCreatedEvent = createUserCreatedEvent;
exports.createPaymentCreatedEvent = createPaymentCreatedEvent;
exports.createPaymentCompletedEvent = createPaymentCompletedEvent;
exports.createAgentTaskStartedEvent = createAgentTaskStartedEvent;
exports.createAgentTaskCompletedEvent = createAgentTaskCompletedEvent;
exports.validateEvent = validateEvent;
exports.validateEventOrThrow = validateEventOrThrow;
exports.isEventType = isEventType;
exports.getEventSchema = getEventSchema;
exports.listEventTypes = listEventTypes;
const validator_1 = require("./validator");
// Event schemas for validation
exports.eventSchemas = {
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
class EventValidator {
    constructor() {
        this.validators = new Map();
        // Initialize validators for each event type
        for (const [eventType, schema] of Object.entries(exports.eventSchemas)) {
            this.validators.set(eventType, validator_1.ajv.compile(schema));
        }
    }
    validate(event) {
        const eventType = event.event_type;
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
    validateOrThrow(event) {
        const result = this.validate(event);
        if (!result.valid) {
            throw new Error(`Event validation failed: ${JSON.stringify(result.errors)}`);
        }
        return event;
    }
}
exports.EventValidator = EventValidator;
// Event factory functions
function createUserCreatedEvent(user_id, email, subscription_tier = 'free', full_name, metadata) {
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
function createPaymentCreatedEvent(payment_id, user_id, amount_sats, description, recipient, metadata) {
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
function createPaymentCompletedEvent(payment_id, user_id, amount_sats, payment_hash, description, recipient, fees_sats) {
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
function createAgentTaskStartedEvent(task_id, agent_id, user_id, task_type, parameters, estimated_duration_seconds) {
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
function createAgentTaskCompletedEvent(task_id, agent_id, user_id, status, duration_seconds, result_summary, error_message, output_size_bytes) {
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
exports.eventValidator = new EventValidator();
// Utility functions
function validateEvent(event) {
    return exports.eventValidator.validate(event);
}
function validateEventOrThrow(event) {
    return exports.eventValidator.validateOrThrow(event);
}
function isEventType(eventType) {
    return eventType in exports.eventSchemas;
}
function getEventSchema(eventType) {
    return exports.eventSchemas[eventType];
}
function listEventTypes() {
    return Object.keys(exports.eventSchemas);
}
//# sourceMappingURL=events.js.map