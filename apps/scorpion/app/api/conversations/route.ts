import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/conversations - Save conversation to database
 * GET /api/conversations - List all conversations
 */

// Temporary in-memory storage (replace with database)
const conversationsStore = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const { conversation, messages } = await request.json();
    
    if (!conversation || !conversation.id) {
      return NextResponse.json(
        { error: 'Missing conversation or conversation.id' },
        { status: 400 }
      );
    }
    
    // Store conversation
    conversationsStore.set(conversation.id, {
      ...conversation,
      messages: messages || [],
      syncedAt: Date.now(),
    });
    
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
    
    if (id) {
      // Get specific conversation
      const conversation = conversationsStore.get(id);
      if (!conversation) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(conversation);
    }
    
    // List all conversations
    const conversations = Array.from(conversationsStore.values())
      .map(({ messages, ...conv }) => conv) // Exclude messages from list
      .sort((a, b) => b.updatedAt - a.updatedAt);
    
    return NextResponse.json({
      conversations,
      total: conversations.length,
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
    
    conversationsStore.delete(id);
    
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

