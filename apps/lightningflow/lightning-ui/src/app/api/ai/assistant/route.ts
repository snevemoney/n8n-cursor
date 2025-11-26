import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Safe Supabase client creation with fallbacks
const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
    console.warn('Supabase not configured - using mock mode');
    return null;
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

const supabase = createSupabaseClient();

// Safe OpenAI client creation with fallbacks
const createOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey || apiKey.includes('placeholder')) {
    console.warn('OpenAI not configured - using mock mode');
    return null;
  }
  
  return new OpenAI({ apiKey });
};

const openai = createOpenAIClient();

export async function POST(request: NextRequest) {
  try {
    // Return mock response if services not configured
    if (!supabase || !openai) {
      const body = await request.json();
      const { message } = body;

      return NextResponse.json({
        success: true,
        message: `Mock AI Assistant: I understand you said "${message}". This is a mock response since AI services are not configured.`,
        suggestions: [
          {
            action: 'check_node_status',
            description: 'Check your Lightning node status',
            confidence: 0.8,
            impact: 'medium'
          }
        ],
        context_used: ['mock_context'],
        session_id: 'mock-session-id',
        mode: 'mock'
      });
    }

    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Create AI completion
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful Lightning Network assistant.'
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    const response = completion.choices[0]?.message?.content || 'No response generated';

    return NextResponse.json({ 
      success: true, 
      message: response,
      suggestions: [],
      context_used: [],
      session_id: 'session-' + Date.now()
    });

  } catch (error) {
    console.error('AI Assistant error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Return mock user tools for now
    const mockTools = [
      {
        id: 'tool_1',
        name: 'Invoice Generator',
        description: 'Create professional invoices for your business',
        type: 'invoice_builder',
        config: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: userId || 'demo_user',
        industry: 'general',
        public: false
      },
      {
        id: 'tool_2', 
        name: 'Payment Tracker',
        description: 'Track incoming and outgoing payments',
        type: 'tracker',
        config: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: userId || 'demo_user',
        industry: 'general',
        public: true
      }
    ];

    return NextResponse.json({ 
      success: true,
      message: 'AI Assistant API is running',
      tools: mockTools,
      userId: userId || 'demo_user',
      endpoints: ['POST /api/ai/assistant'],
      mode: supabase ? 'production' : 'mock'
    });
  } catch (error) {
    console.error('AI Assistant GET error:', error);
    return NextResponse.json(
      { error: 'Failed to load user tools' },
      { status: 500 }
    );
  }
} 