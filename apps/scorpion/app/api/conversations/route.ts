import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode, validateRequest } from '@/lib/api-error-handler';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

/**
 * POST /api/conversations - Save conversation to shared storage
 * GET /api/conversations - List all conversations
 */

// Store conversations in a shared location
// Use workspace root (go up 2 levels from apps/scorpion to monorepo root)
const WORKSPACE_ROOT = path.resolve(process.cwd(), '../..');
const CONVERSATIONS_DIR = path.join(WORKSPACE_ROOT, '.scorpion', 'conversations');
const CONVERSATIONS_FILE = path.join(CONVERSATIONS_DIR, 'conversations.json');

// Ensure directory exists
async function ensureDirectory() {
  try {
    await fs.mkdir(CONVERSATIONS_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

// Load conversations from file
async function loadConversations(): Promise<any[]> {
  try {
    await ensureDirectory();
    const content = await fs.readFile(CONVERSATIONS_FILE, 'utf-8');
    const data = JSON.parse(content);
    return data.conversations || [];
  } catch (error) {
    // File doesn't exist yet, return empty array
    return [];
  }
}

// Save conversations to file
async function saveConversations(conversations: any[]): Promise<void> {
  await ensureDirectory();
  await fs.writeFile(
    CONVERSATIONS_FILE,
    JSON.stringify({ conversations, lastUpdated: Date.now() }, null, 2),
    'utf-8'
  );
}

const conversationSchema = z.object({
  conversation: z.object({
    id: z.string().min(1)
  }),
  messages: z.array(z.any()).optional()
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const validation = await validateRequest(request, conversationSchema);
  if (!validation.success) {
    return validation.error;
  }
  
  const { conversation, messages } = validation.data;
  
  // Load existing conversations
  const conversations = await loadConversations();
  
  // Update or add conversation
  const conversationData = {
    ...conversation,
    messages: messages || [],
    syncedAt: Date.now(),
  };
  
  const index = conversations.findIndex((c: any) => c.id === conversation.id);
  if (index >= 0) {
    conversations[index] = conversationData;
  } else {
    conversations.unshift(conversationData);
  }
  
  // Keep last 100 conversations
  const trimmed = conversations.slice(0, 100);
  
  // Save to file
  await saveConversations(trimmed);
  
  return createSuccessResponse({
    conversationId: conversation.id,
    syncedAt: Date.now(),
  });
});

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  const conversations = await loadConversations();
  
  if (id) {
    // Get specific conversation
    const conversation = conversations.find((c: any) => c.id === id);
    if (!conversation) {
      return createErrorResponse(
        ApiErrorCode.NOT_FOUND,
        'Conversation not found',
        { conversationId: id },
        404
      );
    }
    
    return createSuccessResponse(conversation);
  }
  
  // List all conversations (exclude messages from list)
  const conversationList = conversations
    .map(({ messages, ...conv }) => conv)
    .sort((a: any, b: any) => (b.updatedAt || 0) - (a.updatedAt || 0));
  
  return createSuccessResponse({
    conversations: conversationList,
    total: conversationList.length,
  });
});

export const DELETE = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return createErrorResponse(
      ApiErrorCode.MISSING_PARAMETER,
      'Missing conversation id',
      undefined,
      400
    );
  }
  
  const conversations = await loadConversations();
  const filtered = conversations.filter((c: any) => c.id !== id);
  await saveConversations(filtered);
  
  return createSuccessResponse({
    deleted: id,
  });
});

