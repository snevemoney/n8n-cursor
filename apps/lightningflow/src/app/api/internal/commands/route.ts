import { NextRequest, NextResponse } from 'next/server';
import { Command, CommandResult, isValidCommand } from '@shared/types';

// In-memory idempotency store (replace with Redis in production)
const idempotencyStore = new Map<string, CommandResult>();

interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    roles: string[];
  };
}

/**
 * POST /api/internal/commands
 * Execute commands from n8n with idempotency and RBAC
 */
export async function POST(request: AuthenticatedRequest): Promise<NextResponse> {
  const startTime = Date.now();
  
  try {
    // Verify service token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = await verifyServiceToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid service token' },
        { status: 401 }
      );
    }

    // Check RBAC permission
    if (!user.roles.includes('workflow:execute')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse and validate command
    const body = await request.json();
    if (!isValidCommand(body)) {
      return NextResponse.json(
        { error: 'Invalid command format' },
        { status: 400 }
      );
    }

    const command: Command = body;

    // Check idempotency
    const existingResult = idempotencyStore.get(command.idempotencyKey);
    if (existingResult) {
      console.log(`[CommandAPI] Returning cached result for ${command.idempotencyKey}`);
      return NextResponse.json(existingResult);
    }

    // Execute command
    const result = await executeCommand(command, user);
    const executionTime = Date.now() - startTime;

    const commandResult: CommandResult = {
      success: result.success,
      command_id: crypto.randomUUID(),
      result: result.data,
      error: result.error,
      executed_at: new Date().toISOString(),
      execution_time_ms: executionTime
    };

    // Store result for idempotency
    idempotencyStore.set(command.idempotencyKey, commandResult);

    // Clean up old entries (keep last 1000)
    if (idempotencyStore.size > 1000) {
      const keys = Array.from(idempotencyStore.keys());
      keys.slice(0, 100).forEach(key => idempotencyStore.delete(key));
    }

    return NextResponse.json(commandResult);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[CommandAPI] Error:', error);
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * GET /api/internal/commands/health
 * Health check endpoint
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    idempotency_cache_size: idempotencyStore.size
  });
}

/**
 * Verify service token and return user info
 */
async function verifyServiceToken(token: string): Promise<{
  id: string;
  email: string;
  roles: string[];
} | null> {
  // In production, verify against your auth service
  // For now, check against environment variable
  const expectedToken = process.env.LFA_SERVICE_TOKEN;
  
  if (token === expectedToken) {
    return {
      id: 'service-account',
      email: 'n8n@lfa.example.com',
      roles: ['workflow:execute', 'service:read']
    };
  }
  
  return null;
}

/**
 * Execute a command based on its action
 */
async function executeCommand(command: Command, user: any): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    switch (command.action) {
      case 'credit.apply':
        return await handleCreditApply(command);
      
      case 'invoice.create':
        return await handleInvoiceCreate(command);
      
      case 'notify.send':
        return await handleNotifySend(command);
      
      case 'content.enqueue':
        return await handleContentEnqueue(command);
      
      case 'portfolio.rebalance':
        return await handlePortfolioRebalance(command);
      
      case 'user.update':
        return await handleUserUpdate(command);
      
      default:
        return {
          success: false,
          error: `Unsupported action: ${command.action}`
        };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Command execution failed'
    };
  }
}

// Command handlers
async function handleCreditApply(command: Command) {
  const { user_id, amount_sats, reason } = command.payload;
  
  // Implement credit application logic
  console.log(`[CommandAPI] Applying credit: ${amount_sats} sats to user ${user_id} for ${reason}`);
  
  return {
    success: true,
    data: {
      credit_id: crypto.randomUUID(),
      user_id,
      amount_sats,
      applied_at: new Date().toISOString()
    }
  };
}

async function handleInvoiceCreate(command: Command) {
  const { user_id, amount_sats, description } = command.payload;
  
  // Implement invoice creation logic
  console.log(`[CommandAPI] Creating invoice: ${amount_sats} sats for user ${user_id}`);
  
  return {
    success: true,
    data: {
      invoice_id: crypto.randomUUID(),
      payment_request: 'lnbc...', // Generate Lightning invoice
      amount_sats,
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
    }
  };
}

async function handleNotifySend(command: Command) {
  const { user_id, channel, template, data } = command.payload;
  
  // Implement notification logic
  console.log(`[CommandAPI] Sending ${channel} notification to user ${user_id}`);
  
  return {
    success: true,
    data: {
      notification_id: crypto.randomUUID(),
      channel,
      sent_at: new Date().toISOString()
    }
  };
}

async function handleContentEnqueue(command: Command) {
  const { user_id, type, title, prompt } = command.payload;
  
  // Implement content enqueue logic
  console.log(`[CommandAPI] Enqueuing ${type} content for user ${user_id}`);
  
  return {
    success: true,
    data: {
      content_id: crypto.randomUUID(),
      type,
      title,
      status: 'queued',
      queued_at: new Date().toISOString()
    }
  };
}

async function handlePortfolioRebalance(command: Command) {
  const { user_id, rules } = command.payload;
  
  // Implement portfolio rebalancing logic
  console.log(`[CommandAPI] Rebalancing portfolio for user ${user_id}`);
  
  return {
    success: true,
    data: {
      rebalance_id: crypto.randomUUID(),
      user_id,
      rules_applied: rules.length,
      rebalanced_at: new Date().toISOString()
    }
  };
}

async function handleUserUpdate(command: Command) {
  const { user_id, updates } = command.payload;
  
  // Implement user update logic
  console.log(`[CommandAPI] Updating user ${user_id}`);
  
  return {
    success: true,
    data: {
      user_id,
      updated_at: new Date().toISOString(),
      changes: Object.keys(updates)
    }
  };
}
