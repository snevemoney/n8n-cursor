#!/usr/bin/env node
import { Worker } from 'bullmq';
import Redis from 'ioredis';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import crypto from 'crypto';
// Load environment variables
dotenv.config();
// Redis connection
const redisConfig = {
    host: process.env['REDIS_HOST'] || 'localhost',
    port: parseInt(process.env['REDIS_PORT'] || '6379', 10),
    maxRetriesPerRequest: 3,
};
if (process.env['REDIS_PASSWORD']) {
    redisConfig.password = process.env['REDIS_PASSWORD'];
}
const redis = new Redis(redisConfig);
// n8n configuration
const N8N_URL = process.env['N8N_URL'] || 'http://localhost:5678';
const N8N_WEBHOOK_SECRET = process.env['N8N_WEBHOOK_SECRET'] || 'default-secret';
// Create HMAC signature for n8n webhooks
function createSignature(payload, secret) {
    return crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
}
// Send webhook to n8n
async function sendN8nWebhook(endpoint, data, workflowRunId) {
    const payload = JSON.stringify(data);
    const signature = createSignature(payload, N8N_WEBHOOK_SECRET);
    const response = await fetch(`${N8N_URL}/webhook/${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Workflow-Signature': signature,
            'X-Workflow-Run-ID': workflowRunId,
        },
        body: payload,
    });
    if (!response.ok) {
        throw new Error(`n8n webhook failed: ${response.status} ${response.statusText}`);
    }
}
// Process different workflow types
async function processWorkflow(job) {
    const { workflowRunId, service } = job.data;
    console.log(`Processing workflow ${workflowRunId} for service: ${service}`);
    try {
        // Update status to processing
        await redis.hset(`workflow:${workflowRunId}`, {
            status: 'processing',
            progress: 10,
        });
        let result;
        switch (service) {
            case 'ai-saas':
                result = await processAISaaSWorkflow(job.data);
                break;
            case 'research':
                result = await processResearchWorkflow(job.data);
                break;
            case 'content':
                result = await processContentWorkflow(job.data);
                break;
            case 'support':
                result = await processSupportWorkflow(job.data);
                break;
            case 'analytics':
                result = await processAnalyticsWorkflow(job.data);
                break;
            default:
                throw new Error(`Unknown service: ${service}`);
        }
        // Update progress
        await redis.hset(`workflow:${workflowRunId}`, {
            status: 'completed',
            progress: 100,
            result: JSON.stringify(result),
            completedAt: new Date().toISOString(),
        });
        // Trigger n8n auxiliary workflows
        await triggerAuxiliaryWorkflows(workflowRunId, service, result);
        return result;
    }
    catch (error) {
        console.error(`Error processing workflow ${workflowRunId}:`, error);
        // Update status to failed
        await redis.hset(`workflow:${workflowRunId}`, {
            status: 'failed',
            error: error.message,
            completedAt: new Date().toISOString(),
        });
        throw error;
    }
}
// AI SaaS workflow processing
async function processAISaaSWorkflow(data) {
    const { workflowRunId, features, aiConfig } = data;
    console.log(`Processing AI SaaS workflow: ${workflowRunId}`);
    // Simulate AI processing
    const result = {
        type: 'ai-saas',
        features: features,
        model: aiConfig.model,
        generatedContent: {
            title: `AI SaaS Solution for ${features.join(', ')}`,
            description: `Automated solution generated using ${aiConfig.model}`,
            recommendations: [
                'Implement feature A',
                'Optimize feature B',
                'Scale feature C'
            ],
            estimatedValue: '$10,000 - $50,000',
        },
        metadata: {
            processingTime: '2.5s',
            tokensUsed: 1500,
            confidence: 0.95,
        },
    };
    // Update progress
    await redis.hset(`workflow:${workflowRunId}`, { progress: 50 });
    return result;
}
// Research workflow processing
async function processResearchWorkflow(data) {
    const { workflowRunId, subService, aiConfig } = data;
    console.log(`Processing research workflow: ${workflowRunId}`);
    const result = {
        type: 'research',
        subService: subService,
        model: aiConfig.model,
        researchResults: {
            topic: subService || 'General Research',
            findings: [
                'Key finding 1: Market trend analysis',
                'Key finding 2: Competitive landscape',
                'Key finding 3: Opportunity assessment',
            ],
            sources: [
                'Source 1: Industry report 2024',
                'Source 2: Market analysis data',
                'Source 3: Expert interviews',
            ],
            recommendations: [
                'Focus on emerging markets',
                'Leverage AI capabilities',
                'Build strategic partnerships',
            ],
        },
        metadata: {
            processingTime: '5.2s',
            tokensUsed: 2800,
            confidence: 0.88,
        },
    };
    // Update progress
    await redis.hset(`workflow:${workflowRunId}`, { progress: 60 });
    return result;
}
// Content workflow processing
async function processContentWorkflow(data) {
    const { workflowRunId, contentType, platforms, aiConfig } = data;
    console.log(`Processing content workflow: ${workflowRunId}`);
    const result = {
        type: 'content',
        contentType: contentType,
        platforms: platforms,
        model: aiConfig.model,
        content: {
            title: `Generated ${contentType} Content`,
            body: `This is AI-generated content for ${contentType} optimized for ${platforms.join(', ')} platforms.`,
            tags: ['ai-generated', contentType, ...platforms],
            seoOptimized: true,
            wordCount: 500,
        },
        distribution: {
            platforms: platforms.map(platform => ({
                platform,
                status: 'ready',
                scheduledFor: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
            })),
        },
        metadata: {
            processingTime: '3.8s',
            tokensUsed: 1200,
            confidence: 0.92,
        },
    };
    // Update progress
    await redis.hset(`workflow:${workflowRunId}`, { progress: 70 });
    return result;
}
// Support workflow processing
async function processSupportWorkflow(data) {
    const { workflowRunId, aiConfig } = data;
    console.log(`Processing support workflow: ${workflowRunId}`);
    const result = {
        type: 'support',
        model: aiConfig.model,
        supportResponse: {
            priority: 'medium',
            category: 'technical',
            response: 'AI-generated support response based on the inquiry.',
            suggestedActions: [
                'Check system status',
                'Review documentation',
                'Contact technical team if needed',
            ],
            escalationRequired: false,
        },
        metadata: {
            processingTime: '1.5s',
            tokensUsed: 800,
            confidence: 0.85,
        },
    };
    // Update progress
    await redis.hset(`workflow:${workflowRunId}`, { progress: 80 });
    return result;
}
// Analytics workflow processing
async function processAnalyticsWorkflow(data) {
    const { workflowRunId, aiConfig } = data;
    console.log(`Processing analytics workflow: ${workflowRunId}`);
    const result = {
        type: 'analytics',
        model: aiConfig.model,
        analytics: {
            metrics: {
                totalRequests: 1250,
                successRate: 0.96,
                averageResponseTime: '2.3s',
                errorRate: 0.04,
            },
            insights: [
                'Performance is within acceptable limits',
                'Error rate has decreased by 15% this week',
                'Peak usage occurs between 2-4 PM',
            ],
            recommendations: [
                'Consider scaling resources during peak hours',
                'Monitor error patterns for optimization',
                'Implement caching for frequently requested data',
            ],
        },
        metadata: {
            processingTime: '4.1s',
            tokensUsed: 2000,
            confidence: 0.90,
        },
    };
    // Update progress
    await redis.hset(`workflow:${workflowRunId}`, { progress: 90 });
    return result;
}
// Trigger auxiliary n8n workflows
async function triggerAuxiliaryWorkflows(workflowRunId, service, result) {
    try {
        // Send notification webhook
        await sendN8nWebhook('aux-notify', {
            workflowRunId,
            action: 'workflow_completed',
            data: {
                service,
                status: 'completed',
                result: result,
                timestamp: new Date().toISOString(),
            },
        }, workflowRunId);
        // Send analytics webhook
        await sendN8nWebhook('aux-analytics', {
            workflowRunId,
            action: 'track_completion',
            data: {
                service,
                processingTime: result.metadata?.processingTime,
                tokensUsed: result.metadata?.tokensUsed,
                confidence: result.metadata?.confidence,
            },
        }, workflowRunId);
        // Send CRM webhook if applicable
        if (service === 'ai-saas' || service === 'research') {
            await sendN8nWebhook('aux-crm', {
                workflowRunId,
                action: 'update_lead',
                data: {
                    service,
                    value: result.generatedContent?.estimatedValue || result.researchResults?.recommendations?.length || 0,
                    status: 'qualified',
                },
            }, workflowRunId);
        }
        console.log(`Auxiliary workflows triggered for ${workflowRunId}`);
    }
    catch (error) {
        console.error(`Error triggering auxiliary workflows for ${workflowRunId}:`, error);
        // Don't fail the main workflow if auxiliary workflows fail
    }
}
// Create and start the worker
const workflowWorker = new Worker('workflow-jobs', async (job) => {
    console.log(`Processing job ${job.id} of type: ${job.name}`);
    return await processWorkflow(job);
}, {
    connection: redis,
    concurrency: 5, // Process up to 5 jobs concurrently
    removeOnComplete: { count: 100 }, // Keep last 100 completed jobs
    removeOnFail: { count: 50 }, // Keep last 50 failed jobs
});
// Event listeners
workflowWorker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed successfully`);
});
workflowWorker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err.message);
});
workflowWorker.on('error', (err) => {
    console.error('Worker error:', err);
});
// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down workflow worker...');
    await workflowWorker.close();
    await redis.disconnect();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('Shutting down workflow worker...');
    await workflowWorker.close();
    await redis.disconnect();
    process.exit(0);
});
console.log('🔄 Workflow worker started and waiting for jobs...');
//# sourceMappingURL=workflow-worker.js.map