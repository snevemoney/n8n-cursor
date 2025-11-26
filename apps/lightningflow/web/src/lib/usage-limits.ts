import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Subscription tier token limits per month
const TIER_LIMITS = {
  free: 100_000,
  basic: 500_000,
  pro: 2_000_000,
  enterprise: 10_000_000,
};

// Cost calculation constants (in tokens)
const MODEL_COSTS = {
  'gpt-3.5-turbo': {
    input: 0.0015, // per 1K tokens
    output: 0.002, // per 1K tokens
  },
  'gpt-4': {
    input: 0.03, // per 1K tokens
    output: 0.06, // per 1K tokens
  },
  'gpt-4-turbo': {
    input: 0.01, // per 1K tokens
    output: 0.03, // per 1K tokens
  },
};

/**
 * Checks if a user has exceeded their token limit
 */
export async function userLimitExceeded(userId: string, tier: keyof typeof TIER_LIMITS = 'free'): Promise<boolean> {
  const userQuota = await getUserQuota(userId);
  const limit = TIER_LIMITS[tier] || TIER_LIMITS.free;
  
  return userQuota.tokens_used >= limit;
}

/**
 * Gets user's current usage quota information
 */
export async function getUserQuota(userId: string) {
  // Get the current billing cycle
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  // Query the usage_logs table for this month's usage
  const { data, error } = await supabase
    .from('usage_logs')
    .select('prompt_tokens, completion_tokens')
    .eq('user_id', userId)
    .gte('created_at', startOfMonth.toISOString())
    .lte('created_at', endOfMonth.toISOString());
  
  if (error) {
    console.error('Error fetching user quota:', error);
    throw new Error('Failed to fetch usage data');
  }
  
  // Calculate total tokens used
  const tokensUsed = data.reduce(
    (total, log) => total + (log.prompt_tokens || 0) + (log.completion_tokens || 0),
    0
  );
  
  // Get user's subscription tier
  const { data: userData, error: userError } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single();
  
  if (userError) {
    console.error('Error fetching user tier:', userError);
    throw new Error('Failed to fetch user data');
  }
  
  const tier = userData?.subscription_tier || 'free';
  const tokenLimit = TIER_LIMITS[tier as keyof typeof TIER_LIMITS] || TIER_LIMITS.free;
  
  return {
    tokens_used: tokensUsed,
    token_limit: tokenLimit,
    subscription_tier: tier,
    reset_date: endOfMonth.toISOString(),
  };
}

/**
 * Updates user quota after an API call
 */
export async function updateUserQuota(
  userId: string,
  promptTokens: number,
  completionTokens: number,
  model: string
) {
  const modelCost = MODEL_COSTS[model as keyof typeof MODEL_COSTS] || MODEL_COSTS['gpt-3.5-turbo'];
  
  // Calculate costs in USD
  const promptCost = (promptTokens / 1000) * modelCost.input;
  const completionCost = (completionTokens / 1000) * modelCost.output;
  const totalCost = promptCost + completionCost;
  
  // Insert usage record
  const { error } = await supabase
    .from('usage_logs')
    .insert({
      user_id: userId,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      model: model,
      cost_usd: totalCost,
    });
  
  if (error) {
    console.error('Error updating user quota:', error);
    throw new Error('Failed to update usage data');
  }
  
  return {
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    total_tokens: promptTokens + completionTokens,
    cost_usd: totalCost,
  };
}

/**
 * Gets user's cost breakdown for the current billing period
 */
export async function getUserCostBreakdown(userId: string) {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  const { data, error } = await supabase
    .from('usage_logs')
    .select('model, prompt_tokens, completion_tokens, cost_usd, created_at')
    .eq('user_id', userId)
    .gte('created_at', startOfMonth.toISOString())
    .lte('created_at', endOfMonth.toISOString())
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching cost breakdown:', error);
    throw new Error('Failed to fetch cost data');
  }
  
  // Calculate totals
  const totalTokens = data.reduce(
    (sum, log) => sum + (log.prompt_tokens || 0) + (log.completion_tokens || 0),
    0
  );
  
  const totalCost = data.reduce(
    (sum, log) => sum + (log.cost_usd || 0),
    0
  );
  
  // Group by model
  const modelBreakdown = data.reduce((acc, log) => {
    const model = log.model || 'unknown';
    if (!acc[model]) {
      acc[model] = {
        tokens: 0,
        cost: 0,
        count: 0,
      };
    }
    
    acc[model].tokens += (log.prompt_tokens || 0) + (log.completion_tokens || 0);
    acc[model].cost += log.cost_usd || 0;
    acc[model].count += 1;
    
    return acc;
  }, {} as Record<string, { tokens: number; cost: number; count: number }>);
  
  return {
    total_tokens: totalTokens,
    total_cost_usd: totalCost,
    model_breakdown: modelBreakdown,
    log_entries: data.length,
    period: {
      start: startOfMonth.toISOString(),
      end: endOfMonth.toISOString(),
    },
  };
} 