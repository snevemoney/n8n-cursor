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

    if (!userId) {
      return NextResponse.json({ 
        success: false,
        error: 'Missing userId parameter' 
      }, { status: 400 });
    }

    // Return mock tools for demo
    const mockTools = [
      {
        id: 'demo-tool-1',
        type: 'payment_link',
        name: 'Demo Payment Link',
        description: 'A sample payment link for testing',
        config: {
          amount_sats: 10000,
          description: 'Demo payment'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: userId,
        industry: 'general',
        public: false
      }
    ];

    return NextResponse.json({ 
      success: true,
      tools: mockTools,
      message: 'Tools loaded successfully',
      mode: supabase ? 'production' : 'mock'
    });
  } catch (error) {
    console.error('Error loading tools:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to load tools',
      tools: []
    }, { status: 500 });
  }
} 