#!/usr/bin/env node
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { z } from 'zod';
import crypto from 'crypto';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env['PORT'] || 3001;

// Redis connection
const redisConfig: any = {
  host: process.env['REDIS_HOST'] || 'localhost',
  port: parseInt(process.env['REDIS_PORT'] || '6379', 10),
  maxRetriesPerRequest: 3,
};

if (process.env['REDIS_PASSWORD']) {
  redisConfig.password = process.env['REDIS_PASSWORD'];
}

const redis = new Redis(redisConfig);

// BullMQ queue for workflow processing
const workflowQueue = new Queue('workflow-jobs', { connection: redis });

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Request validation schemas
const WorkflowRequestSchema = z.object({
  service: z.enum(['ai-saas', 'research', 'content', 'support', 'analytics']),
  sub_service: z.string().optional(),
  user_id: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  service_tier: z.enum(['basic', 'pro', 'enterprise']).default('basic'),
  features: z.array(z.string()).default([]),
  content_type: z.string().optional(),
  platforms: z.array(z.string()).default([]),
  model: z.string().default('gpt-4'),
  temperature: z.number().min(0).max(2).default(0.7),
  max_tokens: z.number().min(1).max(4000).default(2000),
  data: z.record(z.any()).optional(),
});

// HMAC signature verification for n8n webhooks
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    redis: redis.status === 'ready' ? 'connected' : 'disconnected'
  });
});

// Main workflow execution endpoint
app.post('/api/workflows/0/run', async (req, res) => {
  try {
    // Validate request
    const validatedData = WorkflowRequestSchema.parse(req.body);
    
    // Generate unique workflow run ID
    const workflowRunId = `wf0_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    
    // Create job payload
    const jobPayload = {
      workflowRunId,
      userId: validatedData.user_id || 'anonymous',
      service: validatedData.service,
      subService: validatedData.sub_service,
      priority: validatedData.priority,
      serviceTier: validatedData.service_tier,
      features: validatedData.features,
      contentType: validatedData.content_type,
      platforms: validatedData.platforms,
      aiConfig: {
        model: validatedData.model,
        temperature: validatedData.temperature,
        maxTokens: validatedData.max_tokens,
      },
      data: validatedData.data,
      timestamp: new Date().toISOString(),
      clientIp: req.ip || req.connection.remoteAddress,
    };

    // Add job to queue with priority
    const jobOptions = {
      priority: validatedData.priority === 'urgent' ? 1 : 
                validatedData.priority === 'high' ? 2 :
                validatedData.priority === 'normal' ? 3 : 4,
      delay: 0,
      attempts: 3,
      backoff: {
        type: 'exponential' as const,
        delay: 2000,
      },
    };

    const job = await workflowQueue.add('process-workflow', jobPayload, jobOptions);

    // Store initial status in Redis
    await redis.hset(`workflow:${workflowRunId}`, {
      status: 'queued',
      progress: 0,
      jobId: job.id,
      createdAt: new Date().toISOString(),
    });

    return res.json({
      success: true,
      workflowRunId,
      status: 'queued',
      estimatedCompletion: new Date(Date.now() + 30000).toISOString(), // 30 seconds estimate
    });

  } catch (error) {
    console.error('Error processing workflow request:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors,
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Workflow status endpoint
app.get('/api/workflows/0/status/:workflowRunId', async (req, res) => {
  try {
    const { workflowRunId } = req.params;
    
    // Get status from Redis
    const status = await redis.hgetall(`workflow:${workflowRunId}`);
    
    if (!status || Object.keys(status).length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Workflow run not found',
      });
    }

    return res.json({
      success: true,
      workflowRunId,
      status: status['status'] || 'unknown',
      progress: parseInt(status['progress'] || '0'),
      result: status['result'] ? JSON.parse(status['result']) : null,
      error: status['error'] || null,
      createdAt: status['createdAt'],
      completedAt: status['completedAt'],
    });

  } catch (error) {
    console.error('Error getting workflow status:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// n8n webhook endpoint for auxiliary processing
app.post('/api/aux/*', async (req, res) => {
  try {
    const signature = req.headers['x-workflow-signature'] as string;
    const secret = process.env['N8N_WEBHOOK_SECRET'] || 'default-secret';
    
    // Verify signature
    if (!verifySignature(JSON.stringify(req.body), signature, secret)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid signature',
      });
    }

    const path = req.path.replace('/api/aux/', '');
    const { workflowRunId, action, data } = req.body;

    // Process auxiliary action
    switch (path) {
      case 'notify':
        await handleNotification(workflowRunId, action, data);
        break;
      case 'crm':
        await handleCRMUpdate(workflowRunId, action, data);
        break;
      case 'analytics':
        await handleAnalytics(workflowRunId, action, data);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Unknown auxiliary action',
        });
    }

    return res.json({
      success: true,
      message: 'Auxiliary action processed',
    });

  } catch (error) {
    console.error('Error processing auxiliary action:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Auxiliary action handlers
async function handleNotification(workflowRunId: string, action: string, data: any) {
  console.log(`Notification for ${workflowRunId}: ${action}`, data);
  // Store notification in Redis for tracking
  await redis.lpush(`notifications:${workflowRunId}`, JSON.stringify({
    action,
    data,
    timestamp: new Date().toISOString(),
  }));
}

async function handleCRMUpdate(workflowRunId: string, action: string, data: any) {
  console.log(`CRM update for ${workflowRunId}: ${action}`, data);
  // Store CRM update in Redis for tracking
  await redis.lpush(`crm:${workflowRunId}`, JSON.stringify({
    action,
    data,
    timestamp: new Date().toISOString(),
  }));
}

async function handleAnalytics(workflowRunId: string, action: string, data: any) {
  console.log(`Analytics for ${workflowRunId}: ${action}`, data);
  // Store analytics in Redis for tracking
  await redis.lpush(`analytics:${workflowRunId}`, JSON.stringify({
    action,
    data,
    timestamp: new Date().toISOString(),
  }));
}

// Error handling middleware
app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// Start server
async function startServer() {
  try {
    // Connect to Redis
    await redis.connect();
    console.log('✅ Connected to Redis');

    // Start Express server
    app.listen(PORT, () => {
      const host = process.env['HOST'] || 'localhost';
      console.log(`🚀 n8n-cursor backend running on port ${PORT}`);
      console.log(`📊 Health check: http://${host}:${PORT}/health`);
      console.log(`🔄 Workflow endpoint: http://${host}:${PORT}/api/workflows/0/run`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await redis.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await redis.disconnect();
  process.exit(0);
});

startServer();
