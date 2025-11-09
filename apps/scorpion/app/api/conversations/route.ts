import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

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

export async function POST(request: NextRequest) {
  try {
    const { conversation, messages } = await request.json();
    
    if (!conversation || !conversation.id) {
      return NextResponse.json(
        { error: 'Missing conversation or conversation.id' },
        { status: 400 }
      );
    }
    
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
    
    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      syncedAt: Date.now(),
    });
  } catch (error: any) {
    console.error('[Conversations API] Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    const conversations = await loadConversations();
    
    if (id) {
      // Get specific conversation
      const conversation = conversations.find((c: any) => c.id === id);
      if (!conversation) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(conversation);
    }
    
    // List all conversations (exclude messages from list)
    const conversationList = conversations
      .map(({ messages, ...conv }) => conv)
      .sort((a: any, b: any) => (b.updatedAt || 0) - (a.updatedAt || 0));
    
    return NextResponse.json({
      conversations: conversationList,
      total: conversationList.length,
    });
  } catch (error: any) {
    console.error('[Conversations API] Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing conversation id' },
        { status: 400 }
      );
    }
    
    const conversations = await loadConversations();
    const filtered = conversations.filter((c: any) => c.id !== id);
    await saveConversations(filtered);
    
    return NextResponse.json({
      success: true,
      deleted: id,
    });
  } catch (error: any) {
    console.error('[Conversations API] Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

