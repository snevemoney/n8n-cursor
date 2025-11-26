import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { OpenAI } from 'openai';

interface LiquidityRecommendationRequest {
  userStats: {
    status: string;
    inbound_sats?: number;
    outbound_sats?: number;
    total_channels?: number;
    recent_forwards?: number;
  };
  goal: 'boost_earnings' | 'balance_channels' | 'increase_capacity';
  budget_preference: 'free' | 'low' | 'moderate' | 'high';
}

interface AIRecommendation {
  provider: string;
  reasoning: string;
  confidence: number;
  estimated_cost_sats: number;
  expected_boost: string;
}

const PROVIDER_DATA = {
  'Magma': {
    typical_cost_sats: 2000,
    speed_hours: 0.5,
    difficulty: 'easy',
    best_for: 'quick_start'
  },
  'Amboss Liquidity Marketplace': {
    typical_cost_sats: 3000,
    speed_hours: 12,
    difficulty: 'medium',
    best_for: 'competitive_rates'
  },
  'LightningNetwork+': {
    typical_cost_sats: 0,
    speed_hours: 72,
    difficulty: 'medium',
    best_for: 'budget_conscious'
  }
};

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: LiquidityRecommendationRequest = await request.json();
    const { userStats, goal, budget_preference } = body;

    // Get OpenAI API key from environment
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 });
    }

    const openai = new OpenAI({ apiKey: openaiKey });

    // Create prompt for AI analysis
    const prompt = `
You are a Lightning Network liquidity expert helping users choose the best liquidity provider.

User's current stats:
- Status: ${userStats.status}
- Inbound liquidity: ${userStats.inbound_sats || 0} sats
- Outbound liquidity: ${userStats.outbound_sats || 0} sats
- Total channels: ${userStats.total_channels || 0}
- Recent forwards: ${userStats.recent_forwards || 0}

User's goal: ${goal}
Budget preference: ${budget_preference}

Available providers:
1. Magma - Instant, easy, ~2000 sats cost
2. Amboss Liquidity Marketplace - 1-24h, competitive rates, ~3000 sats
3. LightningNetwork+ - Free but slower (1-7 days)

Based on this data, recommend the SINGLE best provider and explain why in 1-2 sentences.
Also estimate the expected earnings boost as a percentage or description.

Respond in this exact JSON format:
{
  "provider": "exact provider name from the list",
  "reasoning": "brief explanation why this is best for their situation",
  "confidence": 0.85,
  "estimated_cost_sats": 2000,
  "expected_boost": "2-3x current earnings"
}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 300
    });

    const aiResponseText = response.choices[0]?.message?.content;
    if (!aiResponseText) {
      throw new Error('No AI response received');
    }

    // Parse AI response
    let recommendation: AIRecommendation;
    try {
      recommendation = JSON.parse(aiResponseText);
    } catch (parseError) {
      // Fallback recommendation if AI response is malformed
      recommendation = {
        provider: budget_preference === 'free' ? 'LightningNetwork+' : 'Magma',
        reasoning: budget_preference === 'free' 
          ? 'Free option best fits your budget preference' 
          : 'Quick and easy setup for immediate earnings boost',
        confidence: 0.7,
        estimated_cost_sats: budget_preference === 'free' ? 0 : 2000,
        expected_boost: '1.5-2x current earnings'
      };
    }

    // Validate recommendation
    if (!PROVIDER_DATA[recommendation.provider as keyof typeof PROVIDER_DATA]) {
      recommendation.provider = 'Magma'; // Default fallback
    }

    // Log the recommendation for analytics
    try {
      await supabase.from('ai_recommendations').insert({
        user_id: user.id,
        recommendation_type: 'liquidity_provider',
        input_data: body,
        ai_response: recommendation,
        confidence: recommendation.confidence
      });
    } catch (logError) {
      console.error('Failed to log recommendation:', logError);
      // Don't fail the request if logging fails
    }

    return NextResponse.json(recommendation);

  } catch (error) {
    console.error('Error generating liquidity recommendation:', error);
    
    // Return a sensible fallback recommendation
    const fallbackRecommendation: AIRecommendation = {
      provider: 'Magma',
      reasoning: 'Quick and reliable option for most users getting started with liquidity.',
      confidence: 0.6,
      estimated_cost_sats: 2000,
      expected_boost: '1.5-2x current earnings'
    };

    return NextResponse.json(fallbackRecommendation);
  }
} 