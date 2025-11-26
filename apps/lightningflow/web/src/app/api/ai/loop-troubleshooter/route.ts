import { NextRequest, NextResponse } from 'next/server';
import { searchSimilar } from '@/lib/embeddings';
import { createClient } from '@/lib/supabase/server';
import { OpenAI } from 'openai';
import { logger } from '@/lib/logger';

// Remove module-level OpenAI initialization to prevent build-time errors

interface TroubleshootRequest {
  user_id?: string;
  channel_id?: string;
  error_log: string;
  error_code?: string;
  context?: {
    amount_sats?: number;
    max_routing_fee?: number;
    hops_attempted?: number;
    duration_minutes?: number;
  };
}

interface TutorialLink {
  title: string;
  url: string;
  description: string;
  relevance_score: number;
  timestamp?: number; // For direct video timestamp links
}

interface TroubleshootResponse {
  success: boolean;
  explanation?: string;
  suggestions?: string[];
  cli_commands?: string[];
  relevant_docs?: Array<{
    title: string;
    content: string;
    similarity: number;
    embedding_id?: string; // For feedback tracking
    source?: string;
  }>;
  tutorial_links?: TutorialLink[];
  confidence?: number;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<TroubleshootResponse>> {
  try {
    const body: TroubleshootRequest = await request.json();
    
    if (!body.error_log?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Error log is required'
      }, { status: 400 });
    }

    // Initialize OpenAI client at runtime when environment variables are available
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'AI troubleshooting service temporarily unavailable'
      }, { status: 503 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const errorLog = body.error_log.trim();
    
    logger.logAPI('info', 'Loop troubleshooting requested', {
      method: 'POST',
      path: '/api/ai/loop-troubleshooter',
      statusCode: 200
    }, {
      actionType: 'troubleshoot',
      provider: 'openai',
      errorLog: body.error_log.substring(0, 100) // First 100 chars for logging
    });

    // 1. Search for relevant documentation using vector similarity
    const relevantDocs = await searchSimilar(errorLog, 5, 0.6); // Increased to 5 docs, lowered threshold
    
    // 2. Detect specific error patterns and suggest tutorials
    const tutorialLinks = detectErrorPatternsAndSuggestTutorials(errorLog, body.error_code);
    
    // 3. Build context from relevant documentation
    const contextText = relevantDocs
      .map((doc, index) => `## Document ${index + 1}: ${doc.title || 'Untitled'}\n${doc.content}`)
      .join('\n\n---\n\n');

    // 4. Create enhanced troubleshooting prompt
    const systemPrompt = `You are an expert Lightning Network troubleshooter with access to documentation and tutorials. A user encountered an error and needs help understanding what went wrong and how to fix it.

Your response should be:
- Clear and practical
- Include specific CLI commands when helpful
- Explain WHY the error happened in simple terms
- Provide step-by-step solutions
- Reference relevant tutorials when appropriate
- Be encouraging but honest about limitations

Use the provided documentation context to give accurate, up-to-date advice.`;

    const userPrompt = `I got this error from a Lightning Loop operation:

ERROR LOG:
${errorLog}

${body.error_code ? `ERROR CODE: ${body.error_code}` : ''}

${body.context ? `CONTEXT:
- Amount: ${body.context.amount_sats} sats
- Max routing fee: ${body.context.max_routing_fee} sats
- Hops attempted: ${body.context.hops_attempted}
- Duration: ${body.context.duration_minutes} minutes` : ''}

RELEVANT DOCUMENTATION:
${contextText}

${tutorialLinks.length > 0 ? `
SUGGESTED TUTORIALS:
${tutorialLinks.map(t => `- ${t.title}: ${t.description}`).join('\n')}
` : ''}

Please explain:
1. What this error means in simple terms
2. Why it happened (root cause analysis)
3. How to fix it step-by-step (include CLI commands if helpful)
4. How to prevent it in the future
5. Which tutorial would be most helpful for understanding this concept

Focus on education and helping the user understand the underlying concepts.`;

    // 5. Get AI explanation
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2, // Low temperature for consistent, factual responses
      max_tokens: 1200 // Increased for more detailed explanations
    });

    const explanation = completion.choices[0].message.content || 'Unable to generate explanation';
    
    // 6. Extract suggestions and CLI commands from the response
    const suggestions = extractSuggestions(explanation);
    const cliCommands = extractCliCommands(explanation);
    
    // 7. Store the troubleshooting session if user_id provided
    if (body.user_id) {
      const supabase = createClient();
      
      await supabase.from('loop_logs').insert({
        user_id: body.user_id,
        channel_id: body.channel_id,
        error_code: body.error_code,
        raw_log: errorLog,
        explanation,
        status: 'explained',
        tutorial_suggestions: tutorialLinks.map(t => t.url)
      });
    }

    // 8. Calculate confidence based on similarity scores and context
    const avgSimilarity = relevantDocs.length > 0 
      ? relevantDocs.reduce((sum, doc) => sum + doc.similarity, 0) / relevantDocs.length
      : 0;
    const confidence = Math.min(0.95, avgSimilarity + 0.15); // Boost confidence slightly

    logger.logAPI('info', 'Loop troubleshooting completed', {
      method: 'POST',
      path: '/api/ai/loop-troubleshooter',
      statusCode: 200
    }, {
      actionType: 'troubleshoot',
      provider: 'openai',
      docs_found: relevantDocs.length,
      confidence,
      suggestions_count: suggestions.length,
      cli_commands_count: cliCommands.length,
      tutorial_links_count: tutorialLinks.length
    });

    return NextResponse.json({
      success: true,
      explanation,
      suggestions,
      cli_commands: cliCommands,
      relevant_docs: relevantDocs.map(doc => ({
        title: doc.title || 'Untitled',
        content: doc.content.slice(0, 300) + '...', // Increased preview length
        similarity: Math.round(doc.similarity * 100) / 100,
        embedding_id: doc.id || `emb_${doc.title?.toLowerCase().replace(/\s+/g, '_')}`,
        source: '/docs/troubleshooting' // Default source since it's not in EmbeddingResult
      })),
      tutorial_links: tutorialLinks,
      confidence: Math.round(confidence * 100) / 100
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.logAPI('error', 'Loop troubleshooting failed', {
      method: 'POST',
      path: '/api/ai/loop-troubleshooter',
      statusCode: 500
    }, {
      actionType: 'troubleshoot',
      provider: 'openai',
      error: errorMessage
    });

    return NextResponse.json({
      success: false,
      error: 'Troubleshooting failed'
    }, { status: 500 });
  }
}

/**
 * Detect specific error patterns and suggest relevant tutorials
 */
function detectErrorPatternsAndSuggestTutorials(errorLog: string, errorCode?: string): TutorialLink[] {
  const tutorials: TutorialLink[] = [];
  const lowercaseLog = errorLog.toLowerCase();

  // Inbound liquidity / Loop Out issues
  if (lowercaseLog.includes('insufficient local balance') || 
      lowercaseLog.includes('not enough inbound liquidity') ||
      lowercaseLog.includes('no route') ||
      errorCode?.includes('INSUFFICIENT_BALANCE')) {
    tutorials.push({
      title: 'Loop Out Operations',
      url: '/learn/lightning/loop-out',
      description: 'Learn how to create inbound liquidity using submarine swaps',
      relevance_score: 0.95,
      timestamp: 60 // Jump to inbound liquidity explanation
    });
  }

  // Fee estimation issues
  if (lowercaseLog.includes('fee rate') || 
      lowercaseLog.includes('mempool') ||
      lowercaseLog.includes('fee too low') ||
      lowercaseLog.includes('insufficient fee')) {
    tutorials.push({
      title: 'Error Troubleshooting',
      url: '/learn/lightning/troubleshooting',
      description: 'Understanding fee estimation and common payment failures',
      relevance_score: 0.90,
      timestamp: 270 // Jump to fee estimation section
    });
  }

  // HTLC / Payment routing issues
  if (lowercaseLog.includes('htlc') || 
      lowercaseLog.includes('payment failed') ||
      lowercaseLog.includes('timeout') ||
      lowercaseLog.includes('no path')) {
    tutorials.push({
      title: 'Lightning Network Basics',
      url: '/learn/lightning/basics',
      description: 'Understanding payment routing and HTLCs',
      relevance_score: 0.85,
      timestamp: 180 // Jump to HTLC explanation
    });
  }

  // Channel management issues
  if (lowercaseLog.includes('channel') && 
      (lowercaseLog.includes('force close') || lowercaseLog.includes('unresponsive'))) {
    tutorials.push({
      title: 'Error Troubleshooting',
      url: '/learn/lightning/troubleshooting',
      description: 'Handling unresponsive channels and force closures',
      relevance_score: 0.88,
      timestamp: 180 // Jump to force closure section
    });
  }

  // General concepts for beginners
  if (tutorials.length === 0 || lowercaseLog.includes('what does this mean')) {
    tutorials.push({
      title: 'Lightning Network Basics',
      url: '/learn/lightning/basics',
      description: 'Start here to understand fundamental Lightning concepts',
      relevance_score: 0.70
    });
  }

  // Sort by relevance and return top 3
  return tutorials
    .sort((a, b) => b.relevance_score - a.relevance_score)
    .slice(0, 3);
}

/**
 * Extract bullet-point suggestions from AI response
 */
function extractSuggestions(text: string): string[] {
  const suggestions: string[] = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.match(/^\d+\./)) {
      const suggestion = trimmed.replace(/^[-•\d.]\s*/, '').trim();
      if (suggestion && suggestion.length > 10) {
        suggestions.push(suggestion);
      }
    }
  }
  
  return suggestions.slice(0, 8); // Max 8 suggestions
}

/**
 * Extract CLI commands from AI response
 */
function extractCliCommands(text: string): string[] {
  const commands: string[] = [];
  const codeBlocks = text.match(/```(?:bash|shell)?\n([\s\S]*?)```/g);
  
  if (codeBlocks) {
    for (const block of codeBlocks) {
      const command = block.replace(/```(?:bash|shell)?\n/, '').replace(/```$/, '').trim();
      if (command && command.length > 5) {
        commands.push(command);
      }
    }
  }
  
  // Also look for inline commands
  const inlineCommands = text.match(/`[^`]+`/g);
  if (inlineCommands) {
    for (const cmd of inlineCommands) {
      const command = cmd.replace(/`/g, '').trim();
      if (command.includes('loop') || command.includes('lncli') || command.includes('bitcoin-cli')) {
        commands.push(command);
      }
    }
  }
  
  return commands.slice(0, 5); // Max 5 commands
} 