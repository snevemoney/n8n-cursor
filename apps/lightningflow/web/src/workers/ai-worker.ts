import { Worker, Job } from 'bullmq';
import { createClient } from '@supabase/supabase-js';
import { LLMResponse, callLanguageModel } from '../lib/ai-service';
import dotenv from 'dotenv';

// Load environment variables if running directly
if (require.main === module) {
  dotenv.config({ path: '.env.local' });
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing required environment variables for Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Set up the Redis connection
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD
};

// Define job types and payloads
interface AIAnalysisJob {
  userId: string;
  analysisType: 'node-performance' | 'channel-strategy' | 'routing-optimization' | 'fee-optimization';
  parameters: Record<string, any>;
  requestId: string;
}

interface ContentGenerationJob {
  userId: string;
  contentType: 'invoice-description' | 'payment-link' | 'channel-name';
  parameters: Record<string, any>;
  requestId: string;
}

interface SummaryGenerationJob {
  userId: string;
  summaryType: 'monthly-earnings' | 'channel-status' | 'transactions';
  timeRange: { start: string; end: string };
  parameters: Record<string, any>;
  requestId: string;
}

type AIJobPayload = AIAnalysisJob | ContentGenerationJob | SummaryGenerationJob;

// Worker to process AI jobs
const aiWorker = new Worker(
  'ai-jobs',
  async (job: Job<AIJobPayload>) => {
    console.log(`Processing AI job: ${job.id} of type: ${job.name}`);
    
    try {
      const { userId } = job.data;
      
      // Update job status
      await supabase
        .from('ai_job_status')
        .update({ status: 'processing', progress: 10 })
        .eq('request_id', job.data.requestId)
        .eq('user_id', userId);
      
      // Different processing based on job type
      let result: LLMResponse;
      
      if ('analysisType' in job.data) {
        // Node performance analysis
        result = await processAnalysisJob(job.data);
      } else if ('contentType' in job.data) {
        // Content generation
        result = await processContentGeneration(job.data);
      } else if ('summaryType' in job.data) {
        // Summary generation
        result = await processSummaryGeneration(job.data);
      } else {
        throw new Error('Unknown job type');
      }
      
      // Store result in database
      await supabase
        .from('ai_job_results')
        .insert({
          user_id: userId,
          request_id: job.data.requestId,
          result: result.text,
          model: result.model,
          tokens_used: result.usage.total_tokens,
          prompt_tokens: result.usage.prompt_tokens,
          completion_tokens: result.usage.completion_tokens
        });
      
      // Update job status to completed
      await supabase
        .from('ai_job_status')
        .update({ 
          status: 'completed', 
          progress: 100,
          completed_at: new Date().toISOString()
        })
        .eq('request_id', job.data.requestId)
        .eq('user_id', userId);
      
      // Return the result
      return {
        success: true,
        requestId: job.data.requestId,
        tokens: result.usage.total_tokens
      };
    } catch (error) {
      console.error(`Error processing AI job ${job.id}:`, error);
      
      // Update job status to failed
      await supabase
        .from('ai_job_status')
        .update({ 
          status: 'failed', 
          error_message: (error as Error).message,
          completed_at: new Date().toISOString()
        })
        .eq('request_id', job.data.requestId)
        .eq('user_id', job.data.userId);
      
      throw error;
    }
  },
  { connection }
);

// Process different types of analysis jobs
async function processAnalysisJob(job: AIAnalysisJob): Promise<LLMResponse> {
  const { userId, analysisType, parameters } = job;
  
  // Get node data from database
  const [
    { data: channels },
    { data: forwardingEvents },
    { data: profile }
  ] = await Promise.all([
    supabase
      .from('channels')
      .select('*')
      .eq('user_id', userId),
    supabase
      .from('forwarding_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
  ]);
  
  // Construct a prompt based on the analysis type
  let prompt = '';
  let systemPrompt = '';
  
  switch (analysisType) {
    case 'node-performance':
      systemPrompt = 'You are an expert Lightning Network node analyzer. Provide detailed performance analysis based on channel data and forwarding events.';
      prompt = `Analyze this Lightning node's performance and provide actionable insights:
- Node Data: ${JSON.stringify(profile)}
- Channels (${channels?.length || 0}): ${JSON.stringify(channels)}
- Recent Forwarding Events (${forwardingEvents?.length || 0}): ${JSON.stringify(forwardingEvents)}

Provide insights on:
1. Overall node performance metrics
2. Channel efficiency and utilization
3. Routing revenue and patterns
4. Liquidity distribution
5. At least 3 actionable recommendations to improve performance
${parameters.focusArea ? `Focus especially on: ${parameters.focusArea}` : ''}`;
      break;
      
    case 'channel-strategy':
      systemPrompt = 'You are an expert Lightning Network channel strategist. Recommend optimal channel allocations and partners based on node data.';
      prompt = `Recommend an optimal channel strategy for this Lightning node:
- Node Data: ${JSON.stringify(profile)}
- Current Channels (${channels?.length || 0}): ${JSON.stringify(channels)}
- Recent Forwarding Events (${forwardingEvents?.length || 0}): ${JSON.stringify(forwardingEvents)}

Provide recommendations on:
1. Optimal channel sizes and counts
2. Which channels to keep, modify, or close
3. New channel partners to consider
4. Liquidity allocation strategy
5. Specific pubkeys to connect to (if available from forwarding data)
${parameters.availableFunds ? `Available funds for new channels: ${parameters.availableFunds} sats` : ''}`;
      break;
      
    case 'routing-optimization':
      systemPrompt = 'You are an expert Lightning Network routing optimizer. Provide detailed fee and routing optimization recommendations.';
      prompt = `Optimize this node's routing effectiveness:
- Node Data: ${JSON.stringify(profile)}
- Channels (${channels?.length || 0}): ${JSON.stringify(channels)}
- Recent Forwarding Events (${forwardingEvents?.length || 0}): ${JSON.stringify(forwardingEvents)}

Provide recommendations on:
1. Fee strategy for each channel (base fee and fee rate)
2. Optimal channel rebalancing targets
3. Routing patterns to optimize for
4. Specialized channel configurations for different payment types
5. Expected impact on routing income`;
      break;
      
    case 'fee-optimization':
      systemPrompt = 'You are an expert Lightning Network fee optimizer. Provide detailed fee recommendations to maximize revenue without reducing routing volume.';
      prompt = `Optimize this node's fee structure:
- Node Data: ${JSON.stringify(profile)}
- Channels (${channels?.length || 0}): ${JSON.stringify(channels)}
- Recent Forwarding Events (${forwardingEvents?.length || 0}): ${JSON.stringify(forwardingEvents)}

Provide a detailed fee optimization strategy:
1. Recommended base fee and fee rate for each channel
2. Expected impact on routing volume and revenue
3. Competitive analysis vs. similar nodes
4. Fee adjustment schedule recommendation
5. Channel-specific fee strategies based on capacity and position`;
      break;
  }
  
  // Call OpenAI for analysis
  return await callLanguageModel({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    temperature: 0.1,
    max_tokens: 2000
  });
}

// Process content generation jobs
async function processContentGeneration(job: ContentGenerationJob): Promise<LLMResponse> {
  const { userId, contentType, parameters } = job;
  
  let systemPrompt = '';
  let prompt = '';
  
  switch (contentType) {
    case 'invoice-description':
      systemPrompt = 'You are a professional copy writer specialized in crafting clear, concise invoice descriptions for Bitcoin Lightning payments.';
      prompt = `Create a professional invoice description for this payment:
- Amount: ${parameters.amount} sats (${(parameters.amount / 100000000).toFixed(8)} BTC)
- Purpose: ${parameters.purpose || 'Payment'}
- Customer: ${parameters.customer || 'Anonymous'}
- Product/Service: ${parameters.product || 'Service'}

Requirements:
- Clear and concise (max 100 characters)
- Professional tone
- Include key details (amount, product/service)
- No sensitive information
- If applicable, include order/reference number: ${parameters.reference || 'N/A'}`;
      break;
      
    case 'payment-link':
      systemPrompt = 'You are a marketing specialist who creates effective payment link titles and descriptions for online businesses accepting Bitcoin.';
      prompt = `Create a payment link title and description for:
- Business: ${parameters.business || 'Business'}
- Product/Service: ${parameters.product || 'Product/Service'}
- Amount: ${parameters.amount ? `${parameters.amount} sats (fixed)` : 'Customer specified (variable)'}
- Purpose: ${parameters.purpose || 'Purchase'}

Create:
1. A short title (max 40 characters)
2. A detailed description (max 200 characters)
3. Suggested success message after payment
4. SEO tags (comma separated)`;
      break;
      
    case 'channel-name':
      systemPrompt = 'You are an expert in Lightning Network node operation who creates memorable and strategic channel aliases.';
      prompt = `Suggest a channel alias/name:
- Remote Node: ${parameters.remoteNode || 'Unknown'}
- Remote Node Pubkey: ${parameters.remotePubkey || 'Unknown'}
- Channel Capacity: ${parameters.capacity || 'Unknown'} sats
- Channel Purpose: ${parameters.purpose || 'General routing'}

Requirements:
- Short and memorable (max 32 characters)
- Indicate purpose or relationship when possible
- Could include capacity reference
- Avoid sensitive information
- Professional but can be creative`;
      break;
  }
  
  // Call OpenAI for content generation
  return await callLanguageModel({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 500
  });
}

// Process summary generation jobs
async function processSummaryGeneration(job: SummaryGenerationJob): Promise<LLMResponse> {
  const { userId, summaryType, timeRange, parameters } = job;
  
  // Get data based on summary type
  let data: any = {};
  let systemPrompt = '';
  let prompt = '';
  
  switch (summaryType) {
    case 'monthly-earnings':
      // Fetch earnings data
      const { data: forwardingEvents } = await supabase
        .from('forwarding_events')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', timeRange.start)
        .lte('created_at', timeRange.end);
      
      const { data: invoices } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', userId)
        .eq('settled', true)
        .gte('settled_at', timeRange.start)
        .lte('settled_at', timeRange.end);
      
      data = { forwardingEvents, invoices };
      
      systemPrompt = 'You are a financial analyst specializing in Lightning Network node operation and revenue analysis.';
      prompt = `Generate a monthly earnings summary for this Lightning node:
- Time Period: ${new Date(timeRange.start).toLocaleDateString()} to ${new Date(timeRange.end).toLocaleDateString()}
- Forwarding Events: ${forwardingEvents?.length || 0}
- Settled Invoices: ${invoices?.length || 0}
- Forwarding Data: ${JSON.stringify(forwardingEvents)}
- Invoice Data: ${JSON.stringify(invoices)}

Include in your summary:
1. Total earnings breakdown (forwarding fees vs direct payments)
2. Daily/weekly earnings trends
3. Top performing channels
4. Fee rate effectiveness
5. Comparison to previous period (if available)
6. Projected earnings for next month
7. Recommendations to increase revenue`;
      break;
      
    case 'channel-status':
      // Fetch channel data
      const { data: channels } = await supabase
        .from('channels')
        .select('*')
        .eq('user_id', userId);
      
      data = { channels };
      
      systemPrompt = 'You are a Lightning Network channel analyst providing clear status reports on node channel health and performance.';
      prompt = `Generate a detailed channel status report:
- Channels (${channels?.length || 0}): ${JSON.stringify(channels)}
- Time Period of Analysis: ${new Date(timeRange.start).toLocaleDateString()} to ${new Date(timeRange.end).toLocaleDateString()}

Include in your report:
1. Overall channel health assessment
2. Channel balances and liquidity distribution
3. Active vs inactive channels
4. Channel capacity utilization
5. Potential issues requiring attention
6. Rebalancing recommendations
7. Channel age and stability metrics`;
      break;
      
    case 'transactions':
      // Fetch transaction data
      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', timeRange.start)
        .lte('created_at', timeRange.end);
      
      const { data: settledInvoices } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', userId)
        .eq('settled', true)
        .gte('settled_at', timeRange.start)
        .lte('settled_at', timeRange.end);
      
      data = { payments, settledInvoices };
      
      systemPrompt = 'You are a financial transaction analyst providing clear summaries of Bitcoin Lightning Network payment activity.';
      prompt = `Generate a transaction activity summary:
- Time Period: ${new Date(timeRange.start).toLocaleDateString()} to ${new Date(timeRange.end).toLocaleDateString()}
- Outgoing Payments: ${payments?.length || 0}
- Incoming Payments: ${settledInvoices?.length || 0}
- Payment Data: ${JSON.stringify(payments)}
- Invoice Data: ${JSON.stringify(settledInvoices)}

Include in your summary:
1. Transaction volume overview (count and total value)
2. Incoming vs outgoing payment balance
3. Largest transactions and patterns
4. Temporal patterns (days/times of highest activity)
5. Payment categories or purposes (if detectable)
6. Fee expenditure analysis
7. Unusual activity or anomalies`;
      break;
  }
  
  // Call OpenAI for summary generation
  return await callLanguageModel({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3,
    max_tokens: 1500
  });
}

// Set up event listeners for the worker
aiWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

aiWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed with error: ${err.message}`);
});

console.log('AI worker started and waiting for jobs...');

// Export the worker for external use
export default aiWorker; 