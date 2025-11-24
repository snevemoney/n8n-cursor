import type { ScorpionIntent } from './types';

/**
 * Classify user message intent
 * 
 * This determines what kind of request the user is making, which then
 * gates which tools and planning strategies are used.
 */
export function classifyIntent(message: string): ScorpionIntent {
  if (!message || typeof message !== 'string') {
    return 'general_question';
  }
  
  const lower = message.toLowerCase().trim();
  
  // IDENTITY QUESTIONS: Questions about Scorpion's identity (handle directly, skip tools)
  // Check these FIRST before project_help patterns to avoid tool usage
  // Match identity questions anywhere in the message (not just at the end)
  // NOTE: "What is Scorpion?" is treated as project_help to allow code.readFile for detailed answers
  // Only very specific identity questions use identity intent (who are you, what are you)
  const IDENTITY_PAT = /\b(who\s+are\s+you|what\s+are\s+you)\b[\s\?]*$/i;
  
  if (IDENTITY_PAT.test(lower)) {
    return 'identity'; // Dedicated identity intent - answer as Scorpion, not generic knowledge
  }
  
  // SMALL_TALK: Greetings, casual conversation, personal introductions
  const smallTalkPatterns = [
    /^(hi|hello|hey|yo|greetings|good morning|good afternoon|good evening)$/i,
    /^(hi|hello|hey|yo)\s*[!.,]*$/i,
    /^(thanks|thank you|thx|ty)\s*[!.,]*$/i,
    /^(how are you|how's it going|what's up|sup)\s*[?.,]*$/i,
    /^(nice to meet you|pleasure|good to see you)\s*[!.,]*$/i,
    // Personal introductions and identity statements
    /^(i am|i'm|my name is|call me)\s+/i,
    /(i am|i'm)\s+(your|the)\s+(master|owner|user|boss)/i,
    /(do you|can you|will you)\s+remember\s+(my\s+)?name/i,
    /(what is|what's)\s+my\s+name/i,
  ];
  
  for (const pattern of smallTalkPatterns) {
    if (pattern.test(lower)) {
      return 'small_talk';
    }
  }
  
  // SYSTEM_DEBUG: Questions about Scorpion's behavior itself
  const systemDebugPatterns = [
    /why (are you|do you|is scorpion|does scorpion)/i,
    /(you are not|you're not|you don't|you can't)/i,
    /(bug in scorpion|scorpion is broken|scorpion bug|scorpion error)/i,
    /(fix scorpion|scorpion fix|why is scorpion doing)/i,
    /(your answer|your response|you always|you keep)/i,
    /(did you use|which tools|what tools|did you call|which ones did you)/i,
    /(how did you|what did you use to|how do you)/i,
    // System health and status checks
    /(system health|health check|check system health|test system health|system.*health)/i,
    /(tail.*logs|show.*logs|check.*logs|recent.*logs)/i,
  ];
  
  for (const pattern of systemDebugPatterns) {
    if (pattern.test(lower)) {
      return 'system_debug';
    }
  }
  
  // RESEARCH: Web research queries that need research.run tool
  // Match explicit research requests (not project/code research)
  const webResearchPatterns = [
    /^(research|search|find|look up|look for)\s+(latest|current|recent|today's|this week's|new)/i, // "research latest bitcoin"
    /^(research|search|find|look up)\s+(?!scorpion|lightning|workflow|code|repo|codebase)/i, // "research X" but not "research scorpion"
    /(latest|current|recent|today's|breaking)\s+(news|article|information|update|trend)/i,
    /(what.*happening|what.*going on|tell me about.*latest|get.*latest)/i,
    /(bitcoin|ethereum|crypto|stock|market|finance|economy|political|sports).*\b(news|price|trend|update|latest)/i,
    /(give.*top.*with.*links|top.*news|top.*stories|top.*articles)/i,
  ];

  for (const pattern of webResearchPatterns) {
    if (pattern.test(lower)) {
      return 'web_research'; // Dedicated intent for web research
    }
  }
  
  // OPERATIONAL: System operations, files, workflows, agents, knowledge base queries
  const operationalPatterns = [
    /(show.*recent|recent.*files|last.*uploaded|uploaded.*files|accessed.*files)/i,
    /(list.*files|get.*files|what.*files|which.*files)/i,
    /(show.*workflows|list.*workflows|get.*workflows|workflow.*list)/i,
    /(show.*agents|list.*agents|get.*agents|agent.*list)/i,
    /(show.*knowledge|list.*knowledge|get.*knowledge|knowledge.*list)/i,
    /(show.*stats|get.*stats|statistics|system.*stats)/i,
    /(show.*operations|list.*operations|get.*operations|operation.*list)/i,
    /(project.*status|system.*status|check.*status)/i,
    /(show.*settings|get.*settings|system.*settings)/i,
    /(show.*notifications|list.*notifications|get.*notifications)/i,
  ];
  
  for (const pattern of operationalPatterns) {
    if (pattern.test(lower)) {
      return 'project_help'; // Use project_help to allow operational tools
    }
  }
  
  // PROJECT_HELP: Questions about Scorpion, codebase, workflows, repo
  // NOTE: "what is scorpion" is handled here to allow code.readFile for detailed answers via summarizer
  const projectHelpPatterns = [
    /(scorpion|lightningflow|lightning flow|n8n|workflow|codebase|repository|repo)/i,
    /(how does scorpion|how scorpion works|scorpion's|scorpion architecture)/i,
    /(explain.*scorpion|tell me.*scorpion|what is scorpion|what is.*scorpion)/i, // Include "what is scorpion" here for detailed answers
    /(scorpion.*workflow|scorpion.*agent|scorpion.*system)/i,
    /(code.*scorpion|scorpion.*code|scorpion.*implementation)/i,
    /(project.*structure|analyze.*project|project.*analysis)/i,
    /(read.*code|read.*file|show.*code|code.*file)/i,
    /(chat.*ui|frontend.*backend|api.*route|message.*flow|request.*flow)/i,
    /(when i send|how does.*message.*work|what.*steps.*from.*to)/i,
    /(explain.*architecture|architecture.*explain|how.*architecture|architecture.*work|system.*architecture|code.*architecture)/i,
    // Pattern/documentation queries - ensure they're classified as project_help
    /(macro.*micro.*pattern|macro.*pattern|micro.*pattern|pattern.*macro|pattern.*micro|design.*pattern|architectural.*pattern)/i,
    /(documentation|guide|doc|readme|performance.*optimization|orchestrator|workflow.*overview)/i,
  ];
  
  // Also check for pattern queries with word boundaries (handles "macro and micro patterns")
  const hasMacro = /\bmacro\b/i.test(lower);
  const hasMicro = /\bmicro\b/i.test(lower);
  const hasPattern = /\bpattern/i.test(lower);
  const isPatternQuery = hasMacro && hasMicro && hasPattern;
  
  // But exclude if it's clearly general knowledge
  const isGeneralKnowledge = /^(what is|what are|who is|who are|tell me about|explain)\s+(2\+2|math|science|history|geography|weather|time|date)/i.test(lower);
  
  // Check pattern query first (before general knowledge check)
  if (isPatternQuery) {
    return 'project_help';
  }
  
  if (!isGeneralKnowledge) {
    for (const pattern of projectHelpPatterns) {
      if (pattern.test(lower)) {
        return 'project_help';
      }
    }
  }
  
  // GENERAL_QUESTION: Everything else
  return 'general_question';
}

/**
 * Get available tools based on intent
 * 
 * FRONTIER MODEL APPROACH: Like GPT-4/Claude, tools are available and the model decides when to use them.
 * Only strict exceptions: identity and small_talk get no tools (by design).
 * Everything else gets full tool access - let the model be intelligent about tool selection.
 */
export function getToolsForIntent(intent: ScorpionIntent, userMessage?: string): string[] {
  // Special case: Tool testing requests get ALL tools regardless of intent
  if (userMessage && /(test.*all.*tool|test.*your.*tool|test.*every.*tool|test.*each.*tool|verify.*all.*tool|check.*all.*tool)/i.test(userMessage.toLowerCase())) {
    // Return all available tools - we'll get them from the registry
    return []; // Empty array signals "all tools" - will be handled in route
  }
  
  switch (intent) {
    case 'identity':
      // NO tools for identity questions - answer directly as Scorpion
      return [];

    case 'small_talk':
      // NO tools for small talk - just respond conversationally
      return [];

    // FRONTIER MODEL APPROACH: All other intents get full tool access
    // Let the model decide which tools to use based on the task
    case 'general_question':
    case 'project_help':
    case 'system_debug':
    case 'web_research':
    default:
      // Return empty array to signal "all tools available"
      // The route will handle this by providing all tools from registry
      return []; // Empty = all tools available (frontier model approach)
  }
}

/**
 * Check if a tool is allowed for the given intent
 * 
 * FRONTIER MODEL APPROACH: Only block tools for identity and small_talk.
 * All other intents allow all tools - let the model decide.
 */
export function isToolAllowedForIntent(tool: string, intent: ScorpionIntent, userMessage?: string): boolean {
  // Special case: Tool testing requests allow ALL tools
  if (userMessage && /(test.*all.*tool|test.*your.*tool|test.*every.*tool|test.*each.*tool|verify.*all.*tool|check.*all.*tool)/i.test(userMessage.toLowerCase())) {
    return true;
  }
  
  // Only block tools for identity and small_talk
  if (intent === 'identity' || intent === 'small_talk') {
    return false;
  }
  
  // All other intents: allow all tools (frontier model approach)
  return true;
}

/**
 * Determine if knowledge base should be used based on intent
 * Only use KB for project_help and system_debug intents
 * Identity questions should NOT use KB - answer directly
 * Web research should use research.run tool, not KB
 */
export function shouldUseKnowledgeBase(intent: ScorpionIntent): boolean {
  return intent === 'project_help' || intent === 'system_debug';
}

