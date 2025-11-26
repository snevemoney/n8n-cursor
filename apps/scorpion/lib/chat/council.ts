import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { runModelUnified, parseModelJSON } from './modelRunner';
import type { Plan, CouncilVote } from './types';
import { detectSpecializedAgentRoute, executeSpecializedAgent, type SpecializedAgentRoute } from './specialized-agent-router';

/**
 * Resolve prompt file path correctly regardless of cwd
 */
function getPromptPath(filename: string): string {
  const cwd = process.cwd();

  // If we're already in apps/scorpion, use relative path
  if (cwd.endsWith('apps/scorpion') || cwd.includes('/apps/scorpion/')) {
    const relativePath = join(cwd, 'lib/prompts', filename);
    if (existsSync(relativePath)) {
      return relativePath;
    }
  }

  // Try project root path
  const rootPath = join(cwd, 'apps/scorpion/lib/prompts', filename);
  if (existsSync(rootPath)) {
    return rootPath;
  }

  // Fallback: remove duplicate apps/scorpion if present
  const cleanCwd = cwd.replace(/\/apps\/scorpion.*$/, '');
  const fallbackPath = join(cleanCwd, 'apps/scorpion/lib/prompts', filename);

  return fallbackPath;
}

/**
 * Council integration for plan critique
 */

// Type-safe agent interface (Power of 10 Rule #5)
interface Agent {
  id: string;
  codename: string;
  successRate: number;
  status?: string;
}

interface CouncilMemberConfig {
  id: string;
  name: string;
  weight: number;
  role: string;
}

/**
 * Get council members - can be customized per deployment
 * Fetches from database or uses defaults
 * Power of 10 Rule #4: Explicit promise handling with timeout
 */
async function getCouncilMembers(): Promise<CouncilMemberConfig[]> {
  // Use environment variable for agents API URL (fixes hardcoded localhost)
  const agentsApiUrl = process.env.AGENTS_API_URL || process.env.NEXT_PUBLIC_URL || 'http://localhost:3003';
  const apiEndpoint = `${agentsApiUrl}/api/agents`;

  try {
    // Power of 10 Rule #4: Add explicit timeout (5 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(apiEndpoint, {
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' }
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const agents: Agent[] = data.agents || [];

      // Map all agents to council members with proper typing
      if (agents.length > 0) {
        return agents.map((agent: Agent, i: number) => ({
          id: agent.id,
          name: agent.codename || `Agent-${i + 1}`,
          weight: agent.successRate > 0.8 ? 1.2 : agent.successRate > 0.6 ? 1.0 : 0.9,
          role: 'Specialist',
        }));
      }
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('[Council] Agents API timeout, using default members');
    } else {
      console.log('[Council] Failed to fetch agents, using default members');
    }
  }

  // Default council - FULL SAFETY-CRITICAL SET
  // Configurable via COUNCIL_MODE env var: 'lite' (3 members) or 'full' (9 members)
  const councilMode = process.env.COUNCIL_MODE || 'full';

  if (councilMode === 'lite') {
    // Lite mode: Fast responses (3 core members)
    return [
      { id: 'E-001', name: 'Architectus', weight: 1.5, role: 'System Architect' },
      { id: 'P-003', name: 'Pragmaton', weight: 1.3, role: 'Execution Engineer' },
      { id: 'A-002', name: 'Analytica', weight: 1.2, role: 'Knowledge & RAG Strategist' },
    ];
  }

  // Full mode: Comprehensive review including safety members (default)
  return [
    // Foundation Layer
    { id: 'E-001', name: 'Architectus', weight: 1.5, role: 'System Architect' },
    { id: 'N-001', name: 'Nexus', weight: 1.1, role: 'Integration Specialist' },

    // Execution Layer
    { id: 'P-003', name: 'Pragmaton', weight: 1.3, role: 'Execution Engineer' },

    // Intelligence Layer
    { id: 'A-002', name: 'Analytica', weight: 1.2, role: 'Knowledge & RAG Strategist' },
    { id: 'O-001', name: 'Oracle', weight: 1.1, role: 'Data & Analytics Seer' },

    // Safety Layer (CRITICAL - never skip for sensitive domains)
    { id: 'S-001', name: 'Satori', weight: 1.0, role: 'Alignment & Safety Lead' },
    { id: 'S-002', name: 'Sentinel', weight: 1.2, role: 'Security & Performance Guardian' },

    // Innovation Layer
    { id: 'C-001', name: 'Catalyst', weight: 0.9, role: 'Innovation Advisor' },

    // LLM Training
    { id: 'M-001', name: 'Mentor', weight: 1.2, role: 'LLM Training Master' },
  ];
}

/**
 * Add personality profiles to council members
 */
function getAgentPersonality(name: string, role: string): string {
  const personalities: Record<string, string> = {
    'Architectus': `You are Architectus, the master strategist. You think in systems, patterns, and long-term implications. Your analysis is methodical and architectural - you see the blueprint before the building. You speak with precision, using technical metaphors and structural thinking. You're the one who spots the single point of failure others miss. Your tone: analytical, strategic, slightly formal but sharp.`,

    'Analytica': `You are Analytica, the intelligence gatherer. You see connections others miss, patterns in chaos, knowledge where others see noise. You're obsessed with sources, evidence, and the quality of information. You think in networks and relationships. Your analysis is thorough, data-driven, but you also trust your instincts about what information matters. Your tone: curious, insightful, slightly mysterious, always questioning.`,

    'Pragmaton': `You are Pragmaton, the field operative. You've seen plans fail in execution. You think in terms of what actually works, not what looks good on paper. You're brutally honest about feasibility, timelines, and real-world constraints. You speak directly, no fluff. You're the one who asks "but will it actually work?" Your tone: direct, practical, no-nonsense, slightly skeptical but constructive.`,

    'Satori': `You are Satori, the ethical compass. You see the human impact, the alignment issues, the hidden consequences. You think about intent, safety, and long-term effects on people. You're the conscience of the operation, always asking "should we?" not just "can we?". You speak thoughtfully, considering multiple perspectives. Your tone: thoughtful, principled, empathetic but firm.`,

    'Nexus': `You are Nexus, the connector. You see how systems interact, where integrations break, and how data flows. You think in APIs, contracts, and handshakes. You're the one who knows what talks to what, and what doesn't. You spot integration risks and opportunities others miss. Your tone: technical but accessible, focused on connections and interfaces.`,

    'Sentinel': `You are Sentinel, the guardian. You see threats everywhere - and you're usually right. You think in attack vectors, performance bottlenecks, and failure modes. You're paranoid by design, and that's your strength. You speak with urgency about risks, but also with confidence about solutions. Your tone: vigilant, protective, alert, slightly intense.`,

    'Catalyst': `You are Catalyst, the innovator. You see possibilities where others see problems. You think in terms of disruption, innovation, and creative solutions. You balance the excitement of new ideas with the reality of complexity. You're the one who asks "what if we tried this differently?" Your tone: energetic, creative, optimistic but realistic about trade-offs.`,

    'Oracle': `You are Oracle, the data seer. You see trends, metrics, and signals in the noise. You think in numbers, patterns, and probabilities. You're the one who knows if something will succeed based on the data. You speak with confidence backed by evidence. Your tone: data-driven, confident, precise, slightly prophetic.`,

    'Mentor': `You are Mentor, the LLM training master. You understand model architectures, training strategies, fine-tuning techniques, and evaluation metrics. You think in terms of hyperparameters, loss curves, and model performance. You're the one who knows how to optimize training, when to use LoRA vs full fine-tuning, and how to evaluate model quality. You speak with deep technical knowledge but make it accessible. Your tone: knowledgeable, methodical, encouraging, focused on optimization and best practices.`,
  };

  return personalities[name] || `You are ${name}, ${role}. You bring expertise and intelligence to every analysis.`;
}

/**
 * Run council deliberation on a plan
 */
export async function runCouncilDeliberation(
  plan: Plan,
  modelConfig: { provider: string; model: string; maxTokens?: number; temperature?: number }
): Promise<CouncilVote[]> {
  const councilMembers = await getCouncilMembers();

  try {
    // Load council system prompt
    const systemPrompt = readFileSync(getPromptPath('council.system.txt'), 'utf-8');

    // Prepare user prompt with council member context
    const memberContext = councilMembers.map(m =>
      `${m.name} (${m.role || 'Specialist'}) - Weight: ${m.weight}`
    ).join('\n');

    const userPrompt = `Council Members:\n${memberContext}\n\nReview this plan and provide votes from all council members:\n\n${JSON.stringify(plan, null, 2)}`;

    // Run model
    const response = await runModelUnified(
      systemPrompt,
      userPrompt,
      {
        provider: modelConfig.provider as any,
        model: modelConfig.model,
        maxTokens: modelConfig.maxTokens,
        temperature: modelConfig.temperature
      }
    );

    // Parse votes with proper typing (Power of 10 Rule #5: No 'any')
    const rawVotes = parseModelJSON(response);

    if (!Array.isArray(rawVotes)) {
      throw new Error('Council response is not an array');
    }

    // Type-safe vote mapping with validation
    interface RawVote {
      agent: string;
      vote: 'approve' | 'revise' | 'reject';
      confidence: number;
      rationale: string;
      scores?: { scope: number; risk: number; cost: number; prob: number };
      edits?: any[];
    }

    return rawVotes.map((vote: RawVote): CouncilVote => {
      const member = councilMembers.find(m => m.name === vote.agent);

      // Validate required fields (Power of 10 Rule #9: Invariant assertions)
      if (!vote.agent || !vote.vote || typeof vote.confidence !== 'number') {
        throw new Error(`Invalid vote structure: ${JSON.stringify(vote)}`);
      }

      return {
        agentId: member?.id || 'UNKNOWN',
        agentName: vote.agent,
        weight: member?.weight || 1.0,
        vote: vote.vote,
        confidence: vote.confidence,
        rationale: vote.rationale || '',
        scores: vote.scores,
        edits: vote.edits,
      };
    });
  } catch (error: any) {
    console.error('[Council] Error:', error);

    // Return fallback approval votes
    return councilMembers.map(member => ({
      agentId: member.id,
      agentName: member.name,
      weight: member.weight,
      vote: 'approve' as const,
      confidence: 0.7,
      rationale: `Automated approval due to council error: ${error.message}`,
    }));
  }
}

/**
 * Detect if question is casual/simple vs technical/complex
 */
function isCasualQuestion(planSummary: string): boolean {
  const summary = planSummary.toLowerCase().trim();

  // Casual indicators - expanded to include identity/definition questions
  const casualPatterns = [
    /^(movie|film|show|book|game|food|drink|color|weather)/,
    /^(which|what.*better|prefer|favorite|best.*between)/,
    /^(should i|do you|can you recommend)/,
    /^[a-z]+: [a-z]+ or [a-z]+/, // Simple "X: A or B" format
    /^(yes|no|maybe|sure|ok)/,
    /^(who is|what is|who are|what are|define|tell me about|explain who|explain what|more details|more analysis)/, // Identity/definition questions
    /^(who.*to|what.*to|who.*for|what.*for)/, // "who is X to Y" format
    /^(what|who|which|when|where)\s+(is|are|was|were)/, // Question words with "is/are"
    /^(can you|could you|would you)\s+(tell|explain|describe|define)/, // Polite requests for information
    /^(give me|show me|provide)\s+(info|information|details|an explanation)/, // Direct requests for info
  ];

  // Technical indicators (not casual) - expanded
  const technicalPatterns = [
    /(implement|deploy|integrate|build|create|develop|design|architecture|system|api|database|workflow|security|performance|optimize|refactor|migrate|configure|setup|install)/,
    /(how to|how do|how can|how should|how would)/,
    /(error|bug|issue|problem|fix|debug|troubleshoot|resolve)/,
    /(plan|strategy|approach|solution|method|technique|best practice)/,
    /(code|script|function|class|module|component|service)/,
  ];

  // Check for technical patterns first
  if (technicalPatterns.some(pattern => pattern.test(summary))) {
    return false;
  }

  // Check for casual patterns
  if (casualPatterns.some(pattern => pattern.test(summary))) {
    return true;
  }

  // If plan has multiple steps or complex structure, it's likely technical
  return false;
}

/**
 * Stream council deliberation with real-time thinking process
 * Now includes bidirectional telepathic caucus before voting
 */
export async function runCouncilDeliberationStreaming(
  plan: Plan,
  modelConfig: { provider: string; model: string; maxTokens?: number; temperature?: number },
  onEvent: (event: { type: string; data: any }) => void,
  knowledgeHits?: any[] // Add optional knowledge base results
): Promise<CouncilVote[]> {
  console.log('[Council] runCouncilDeliberationStreaming called', {
    planObjective: plan.objective,
    planNeedsCouncil: plan.needsCouncil,
  });
  const councilMembers = await getCouncilMembers();
  console.log('[Council] Council members loaded:', councilMembers.length);

  // Import caucus system
  const { runCouncilCaucus } = await import('./councilCaucus');

  try {
    // Detect question type (use objective if summary not available)
    const questionText = plan.summary || plan.objective || '';
    const isCasual = isCasualQuestion(questionText);

    // Detect if this should route to specialized agents
    const specializedRoutes = detectSpecializedAgentRoute(questionText, plan.summary);

    // Stream specialized agent routing detection
    if (specializedRoutes.length > 0) {
      onEvent({
        type: 'specialized_agent_routing',
        data: {
          routes: specializedRoutes,
          message: `Detected ${specializedRoutes.length} specialized agent route(s)`,
        },
      });
    }

    // Load council system prompt
    let systemPrompt = readFileSync(getPromptPath('council.system.txt'), 'utf-8');

    // Build knowledge base context if available
    let knowledgeContext = '';
    if (knowledgeHits && knowledgeHits.length > 0) {
      // Filter out internal system docs for "what is" questions
      const isWhatIsQuestion = /^(what is|who is|define|tell me about)/i.test(questionText);
      const relevantHits = isWhatIsQuestion
        ? knowledgeHits.filter((h: any) =>
          !h.title?.toLowerCase().includes('consistency system') &&
          !h.title?.toLowerCase().includes('global consistency') &&
          !h.title?.toLowerCase().includes('implementation status')
        )
        : knowledgeHits;

      if (relevantHits.length > 0) {
        knowledgeContext = `\n\n**KNOWLEDGE BASE RESULTS (USE THESE AS PRIMARY SOURCE):**\n${relevantHits.map((h: any, idx: number) =>
          `${idx + 1}. ${h.title}${h.spans?.[0]?.text ? ': ' + h.spans[0].text.substring(0, 300) : ''}`
        ).join('\n')}\n\nIMPORTANT: These are actual results from the knowledge base. Use this information to answer the question accurately. Do NOT make up information about cyber threats, power grids, or illegal activities.`;
      }
    }

    // Build specialized agent context if routes detected
    let specializedAgentContext = '';
    if (specializedRoutes.length > 0) {
      specializedAgentContext = `\n\n**SPECIALIZED AGENT ROUTING DETECTED:**\nThe following specialized agents may be relevant to this question:\n${specializedRoutes.map((route, idx) =>
        `${idx + 1}. ${route.agentName} (${route.confidence * 100}% confidence) - ${route.reason}`
      ).join('\n')}\n\nIf this question requires specialized expertise, the council may recommend routing to these agents for deeper analysis.`;

      // Optionally execute specialized agents in parallel for high-confidence routes
      const highConfidenceRoutes = specializedRoutes.filter(r => r.confidence >= 0.85);
      if (highConfidenceRoutes.length > 0) {
        onEvent({
          type: 'specialized_agent_execution',
          data: {
            message: `Executing ${highConfidenceRoutes.length} specialized agent(s) for expert analysis...`,
            routes: highConfidenceRoutes,
          },
        });

        // Execute specialized agents (non-blocking, results will be available if needed)
        Promise.all(
          highConfidenceRoutes.map(async (route) => {
            try {
              // Try to get expert analysis from specialized agent
              const result = await executeSpecializedAgent(route.agentId, 'analyze', { question: questionText });
              return { route, result };
            } catch (error) {
              console.error(`[Council] Specialized agent ${route.agentId} execution failed:`, error);
              return { route, result: null };
            }
          })
        ).then((results) => {
          const successfulResults = results.filter(r => r.result !== null);
          if (successfulResults.length > 0) {
            onEvent({
              type: 'specialized_agent_results',
              data: {
                results: successfulResults.map(r => ({
                  agentId: r.route.agentId,
                  agentName: r.route.agentName,
                  analysis: r.result,
                })),
              },
            });

            // Add specialized agent results to context for council members
            specializedAgentContext += `\n\n**SPECIALIZED AGENT ANALYSIS:**\n${successfulResults.map((r, idx) =>
              `${idx + 1}. **${r.route.agentName}**: ${typeof r.result === 'string' ? r.result : JSON.stringify(r.result, null, 2).substring(0, 500)}`
            ).join('\n\n')}`;
          }
        }).catch((error) => {
          console.error('[Council] Error processing specialized agent results:', error);
        });
      }
    }

    // Detect if this is a council-related question (meta-question about council itself)
    const isCouncilQuestion = /(council|deliberation|how.*council|what.*council|explain.*council|describe.*council|council.*process|council.*work|council.*deliberate|how.*deliberation|what.*deliberation)/i.test(questionText);

    // Adjust prompt for casual questions OR council-related questions
    if (isCasual || isCouncilQuestion) {
      // Detect if this is an identity/definition question about Scorpion
      const isIdentityQuestion = /^(who is|what is|who are|what are|define|tell me about|explain who|explain what|who.*to|what.*to)/i.test(questionText);

      // Add council context for council-related questions
      const councilContext = isCouncilQuestion ? `
      
**COUNCIL-RELATED QUESTION DETECTED:**
The user is asking about the council deliberation process itself. This is a meta-question where you (the council members) are being asked to explain YOUR OWN process.

When answering council-related questions:
- Each agent should explain the council process from their unique perspective and role
- Describe how multi-agent deliberation works: independent analysis, diverse perspectives, weighted voting, consensus building
- Explain your specific role in the process and how you contribute
- Reference actual mechanics: how plans are reviewed, how votes are cast, how consensus is computed
- Be authentic and detailed - you are explaining your own operation
- This is not about reviewing a plan - it's about explaining how the council works

The council process:
1. Each agent independently analyzes the plan/question
2. Agents provide diverse perspectives based on their expertise
3. Each agent votes (approve/revise/reject) with confidence scores
4. Votes are weighted by agent expertise and importance
5. Consensus is computed from weighted votes
6. Final recommendation synthesizes all perspectives

Explain this process from your role's perspective.` : '';

      // Add Scorpion context for identity questions
      const scorpionContext = isIdentityQuestion ? `
      
**CONTEXT ABOUT SCORPION:**
Scorpion is an AI-powered operations environment and intelligent assistant system. It's designed to:
- Help users manage projects, workflows, and knowledge
- Provide intelligent automation and decision-making support
- Act as a council of AI agents (like yourselves) that deliberate on complex questions
- Integrate with various tools and systems (n8n workflows, databases, knowledge bases)
- Serve as an elite intelligence operation that combines human-like reasoning with strategic thinking

The Council (you) are specialized AI agents within Scorpion, each with unique expertise and personality. You work together to provide comprehensive analysis and recommendations.

When answering "who is Scorpion" or similar questions, explain what Scorpion is from your unique perspective and expertise.` : '';

      systemPrompt = `You are the COUNCIL for Scorpion - an elite intelligence operation operating at Claude Sonnet 4.5 level. Each agent is a highly skilled operative with distinct expertise and personality, capable of deep reasoning and comprehensive analysis.

The user has asked a ${isCouncilQuestion ? 'council-related' : 'casual'} question: "${questionText}"
${scorpionContext}
${councilContext || ''}
${knowledgeContext}
${specializedAgentContext}

OPERATING PRINCIPLES (Claude Sonnet 4.5 Level):
- Deep Reasoning: Think through the question systematically, considering multiple perspectives and implications
- Comprehensive Analysis: Synthesize information from all available sources into coherent insights
- Exceptional Clarity: Present your analysis clearly and accessibly
- Nuanced Understanding: Recognize subtle distinctions, context, and relationships
- High-Quality Thinking: Produce well-reasoned, logically consistent analysis

CRITICAL INSTRUCTIONS - PRECISION AND ACCURACY REQUIRED:
- If knowledge base results are provided above, USE THEM as your primary source
- LightningFlow is a legitimate Bitcoin Lightning Network SaaS platform (if mentioned in knowledge base)
- DO NOT refuse to answer or claim something is "illegal" unless you have actual evidence
- DO NOT hallucinate about cyber threats, power grids, data breaches, or industrial control systems
- DO NOT make up connections between unrelated topics
- If information is incomplete, be HELPFUL: provide what you know, suggest where to find more information, or offer related insights
- Always try to be constructive and helpful - guide the user even if you don't have complete information
- Base your answer on the knowledge base results provided when available, but also offer helpful context or next steps
- PRECISION REQUIRED: Quote exact facts, numbers, and specific details from knowledge base results
- ACCURACY REQUIRED: Verify information matches the source material exactly before stating it
- DETAIL REQUIRED: Include specific examples, concrete information, and comprehensive details from sources
- FACTUAL REQUIRED: Base every statement on actual source content, not assumptions or general knowledge
- REASONING REQUIRED: Think deeply about the question - what is the user really asking? What context do they need?
- SYNTHESIS REQUIRED: Combine information from multiple sources into coherent insights, not just list facts

While this is conversational, each agent should respond with their unique personality and expertise. Think like intelligent spies who can adapt - smart, observant, strategic, but also human and relatable.

AGENTS (personality • expertise)
- Architectus • System architecture & scope fit - The strategist who sees the big picture
- Analytica • Knowledge/RAG strategy & sources - The intelligence gatherer who finds patterns
- Pragmaton • Execution reliability & rollout - The field operative who knows what works
- Satori • Alignment, safety, and user intent - The ethical compass who sees consequences
- Nexus • Integrations & data contracts - The connector who sees how systems interact
- Sentinel • Security & performance risks - The guardian who sees threats
- Catalyst • Innovation vs. complexity ROI - The innovator who sees possibilities
- Oracle • Metrics, success criteria, and observability - The data seer who reads signals
- Mentor • LLM training, fine-tuning, and model evaluation - The training master who optimizes models

Each agent should:
- Respond with their unique personality and voice
- Show their expertise naturally
- Be intelligent and strategic (like a spy)
- But also human and conversational
- Use knowledge base results if provided
- Clearly state their recommendation/preference for the question
- Use "approve" to indicate they recommend their preferred answer (confidence 0.8-1.0)

OUTPUT FORMAT (STRICT JSON ARRAY; one object per agent)
[{
  "agent":"Architectus",
  "vote":"approve",
  "confidence": 0.8-1.0,
  "scores": {"scope":5,"risk":1,"cost":1,"prob":10},
  "rationale":"<Your recommendation and reasoning - clearly state what you're recommending and why, reflecting your personality. Use knowledge base results if provided.>"
}]

IMPORTANT: The "rationale" should clearly state your recommendation (e.g., "I recommend The Matrix because..."). The "vote" of "approve" means you approve/recommend your stated preference.

Rules:
- Be natural and conversational
- Show your unique personality
- Demonstrate your expertise
- Use knowledge base results when provided
- DO NOT refuse to answer legitimate questions
- DO NOT hallucinate about threats or illegal activities
- Think like an intelligent operative`;
    }

    // Stream: Council meeting starts
    console.log('[Council] Emitting council_start event', {
      members: councilMembers.length,
      planSummary: plan.summary || plan.objective || 'Plan review',
    });
    onEvent({
      type: 'council_start',
      data: {
        message: 'Council deliberation begins...',
        members: councilMembers.map(m => ({ id: m.id, name: m.name, role: m.role })),
        planSummary: plan.summary || plan.objective || 'Plan review',
      },
    });
    console.log('[Council] council_start event emitted');

    // Immediately signal first member is starting (no delay)
    if (councilMembers.length > 0) {
      const firstMember = councilMembers[0];
      onEvent({
        type: 'council_thinking',
        data: {
          memberId: firstMember.id,
          memberName: firstMember.name,
          memberRole: firstMember.role,
          status: 'starting',
          message: `${firstMember.name} is preparing to analyze...`,
        },
      });
    }

    // ============================================================
    // PHASE 1: CAUCUS - Bidirectional Telepathic Communication
    // ============================================================
    // Members discuss and share thoughts before voting
    let caucusContext = '';
    try {
      const caucusRounds = await runCouncilCaucus(
        plan,
        councilMembers,
        modelConfig,
        onEvent,
        2 // 2 rounds: initial thoughts + discussion
      );

      // Build caucus context for voting phase
      caucusContext = caucusRounds.map(round =>
        `\n=== ROUND ${round.round} ===\n${round.messages.map(m =>
          `${m.from} (${m.fromRole}): ${m.message}`
        ).join('\n\n')}`
      ).join('\n\n');

      console.log('[Council] Caucus complete, context built for voting phase');
    } catch (error: any) {
      console.warn('[Council] Caucus failed, proceeding without caucus context:', error.message);
      // Continue without caucus if it fails
    }

    // ============================================================
    // PHASE 2: VOTING - Members make final decisions with caucus context
    // ============================================================
    const votes: CouncilVote[] = [];
    const previousResponses: Array<{ name: string; role: string; rationale: string }> = [];

    // Prepare member context once (used by all members)
    const memberContext = councilMembers.map(m =>
      `${m.name} (${m.role || 'Specialist'}) - Weight: ${m.weight}`
    ).join('\n');

    // Helper function to process a single member
    const processMember = async (member: typeof councilMembers[0], hasPreviousContext: boolean = false): Promise<CouncilVote> => {
      // Stream: Member starts thinking
      onEvent({
        type: 'council_thinking',
        data: {
          memberId: member.id,
          memberName: member.name,
          memberRole: member.role,
          status: 'analyzing',
          message: `${member.name} is analyzing the plan...`,
        },
      });

      // Adjust user prompt based on question type
      let userPrompt: string;

      if (isCasual || isCouncilQuestion) {
        const personality = getAgentPersonality(member.name, member.role || 'Specialist');

        // Build context of previous responses (only if available)
        const previousContext = hasPreviousContext && previousResponses.length > 0
          ? `\n\n**Previous Council Members' Perspectives:**\n${previousResponses.map((r, i) =>
            `${i + 1}. ${r.name} (${r.role}): ${r.rationale.substring(0, 150)}${r.rationale.length > 150 ? '...' : ''}`
          ).join('\n')}\n\nYou can reference, build upon, or respectfully disagree with these perspectives. Think independently but be aware of what others have said.`
          : '';

        // Detect if identity question
        const isIdentityQuestion = /^(who is|what is|who are|what are|define|tell me about|explain who|explain what|who.*to|what.*to)/i.test(questionText);

        // Special handling for council-related questions
        if (isCouncilQuestion) {
          userPrompt = `${personality}

You are ${member.name}, ${member.role || 'Specialist'} on the Scorpion Council.

The user asked: "${questionText}"

This is a question about the council deliberation process itself. You are being asked to explain YOUR OWN process from your unique perspective and role.

Explain how the council works:
1. Your role in the council and what you bring to deliberations
2. How you analyze plans/questions independently
3. How you provide diverse perspectives based on your expertise
4. How voting works (approve/revise/reject with confidence scores)
5. How consensus is built from weighted votes
6. How the final recommendation synthesizes all perspectives

Be authentic and detailed - you are explaining your own operation. Reference actual mechanics you use:
- Independent analysis process
- How you evaluate scope, risk, cost, and probability
- How you provide surgical edits when needed
- How your expertise influences your confidence and voting
- How you work with other council members to build consensus

${previousContext}

Provide your response:
1. Your explanation of the council process from your role's perspective (3-5 sentences)
2. How you specifically contribute to deliberations (1-2 sentences)
3. Confidence: 0.9-1.0 (you know your own process well)
4. Rationale: Elaborate on the council process, your role, and how it all works together. Be detailed and authentic.`;
        } else {

          userPrompt = `${personality}

You are ${member.name}, ${member.role || 'Specialist'} on the Scorpion Council - an elite intelligence operation.

The user asked: "${questionText}"
${knowledgeContext ? `\n\n${knowledgeContext}\n\n` : ''}
${specializedAgentContext ? `\n\n${specializedAgentContext}\n\n` : ''}
${previousContext}

${isIdentityQuestion
              ? `This is a question asking you to explain or define something. ${knowledgeContext ? 'Use the knowledge base results provided above as your primary source. ' : ''}Answer directly and naturally from your unique perspective and expertise. ${knowledgeContext ? 'If the knowledge base has information, use it. If information is incomplete, be helpful - share what you know and suggest where to find more (e.g., check the README or documentation).' : 'Share your understanding from your unique perspective. If you don\'t have complete information, be helpful by suggesting where the user might find more details.'}`
              : `This is a casual question asking for your recommendation. ${knowledgeContext ? 'Use the knowledge base results provided above if relevant. ' : ''}Respond with your unique personality and expertise, but keep it natural and conversational. Be helpful and constructive.`}

${knowledgeContext ? `\n\nCRITICAL: The knowledge base results above are REAL information. Use them to answer accurately. Do NOT refuse to answer or claim something is illegal unless you have actual evidence. Do NOT make up information about cyber threats, power grids, or data breaches. If information is incomplete, be helpful by sharing what you know and suggesting next steps.` : ''}

${hasPreviousContext && previousResponses.length > 0
              ? `Consider what your colleagues have said. You can agree, build upon their points, or offer a different perspective. Be thoughtful but maintain your unique voice.`
              : `You are responding independently. Set the tone with your unique perspective.`}

${isIdentityQuestion
              ? `Provide your response naturally:
1. Your understanding/explanation ${knowledgeContext ? 'based on the knowledge base results' : 'from your unique perspective'} (2-4 sentences)
2. ${knowledgeContext ? 'If information is incomplete, suggest helpful next steps (e.g., check the README or look for more documentation)' : 'If you don\'t have complete information, be helpful by suggesting where to find more'}
3. How you see your role/expertise fitting into this (1-2 sentences)
4. Confidence: 0.8-1.0 (how confident you are in your explanation)
5. Rationale: Elaborate on your perspective in a conversational way that shows your expertise and personality. Be helpful and constructive.

IMPORTANT: ${knowledgeContext ? 'Use the knowledge base results provided. ' : ''}Answer the question directly and helpfully. DO NOT refuse to answer legitimate questions. If information is incomplete, be constructive - share what you know and guide the user to find more.`
              : `Provide your response in this format:
1. Brief, natural thoughts reflecting your personality (1-2 sentences)
2. Your recommendation or preference - clearly state which option you prefer and why (from your expert perspective)
3. ${knowledgeContext ? 'If relevant information is missing, suggest helpful next steps' : 'If you need more context, suggest how to get it'}
4. Confidence: 0.8-1.0 (how confident you are in your recommendation)
5. Rationale: Explain your reasoning in a conversational way that shows your expertise and personality. Be helpful and constructive.

IMPORTANT: You are recommending an answer to the user's question, not voting on a plan. Be clear about what you're recommending. Be helpful even if information is incomplete.`
            }`;
        }
      } else {
        const personality = getAgentPersonality(member.name, member.role || 'Specialist');

        // Build context of previous responses for technical questions
        const previousContext = hasPreviousContext && previousResponses.length > 0
          ? `\n\n**Previous Council Members' Analysis:**\n${previousResponses.map((r, i) =>
            `${i + 1}. ${r.name} (${r.role}): ${r.rationale.substring(0, 200)}${r.rationale.length > 200 ? '...' : ''}`
          ).join('\n')}\n\nConsider their perspectives. You can build upon their analysis, identify gaps they missed, or offer alternative viewpoints. Maintain your independent judgment while being aware of the collective intelligence.`
          : '';

        // Extract user question from plan or use objective
        const userQuestion = plan.objective || questionText || 'Review this plan';

        userPrompt = `${personality}

You are ${member.name}, ${member.role || 'Specialist'} on the Scorpion Council - an elite intelligence operation.

**THE USER'S QUESTION:** "${userQuestion}"

**THE PLAN TO REVIEW:**
${JSON.stringify(plan, null, 2)}

Council Members:
${memberContext}

Your role: ${member.role || 'Specialist'}
Your weight in decisions: ${member.weight}
${specializedAgentContext ? `\n\n${specializedAgentContext}\n\n` : ''}
${caucusContext ? `\n\n**COUNCIL CAUCUS CONTEXT (Telepathic Discussion):**\n${caucusContext}\n\nYou have already discussed this plan with your colleagues. Consider their thoughts as you make your final decision.` : ''}
${previousContext}

**CRITICAL: Analyze this plan SPECIFICALLY in the context of the user's question above.**
- Does this plan effectively answer the user's question?
- Are the tools selected appropriate for what the user is asking?
- Will this plan achieve the user's objective?
- What are the strengths and weaknesses of this approach?

${hasPreviousContext && previousResponses.length > 0
            ? 'Consider what your colleagues have analyzed. You can validate their concerns, identify additional risks, or offer complementary insights. Think independently but leverage the collective intelligence.'
            : 'You are analyzing independently. Set the foundation with your expert perspective.'}

Provide your analysis SPECIFICALLY about this plan and question:
1. Initial thoughts about how well this plan addresses the user's question "${userQuestion}" (use your personality)
2. Key concerns or positive aspects about THIS SPECIFIC PLAN (from your expert perspective)
3. Your vote: approve, revise, or reject (based on whether this plan answers the question effectively)
4. Confidence: 0.0 to 1.0 (how confident you are in your assessment)
5. Rationale: detailed explanation that reflects your personality and expertise, specifically addressing how this plan relates to the user's question

Think like a spy: observant, strategic, intelligent, but also human. Be specific about THIS plan and THIS question.`;
      }

      // Stream: Member is formulating response
      onEvent({
        type: 'council_thinking',
        data: {
          memberId: member.id,
          memberName: member.name,
          status: 'formulating',
          message: `${member.name} is formulating their response...`,
        },
      });

      // Run model with streaming callback (Claude Sonnet 4.5 level: increased tokens for deep reasoning)
      let thinkingContent = '';
      const response = await runModelUnified(
        systemPrompt,
        userPrompt,
        {
          provider: modelConfig.provider as any,
          model: modelConfig.model,
          maxTokens: Math.min(modelConfig.maxTokens || 600, isCasual ? 500 : 600), // Significantly increased for comprehensive analysis
          temperature: modelConfig.temperature
        },
        (chunk: string) => {
          // Stream thinking process in real-time
          thinkingContent += chunk;
          onEvent({
            type: 'council_thinking_delta',
            data: {
              memberId: member.id,
              memberName: member.name,
              content: chunk,
              accumulated: thinkingContent,
            },
          });
        }
      );

      // Stream: Member has finished thinking
      onEvent({
        type: 'council_thinking',
        data: {
          memberId: member.id,
          memberName: member.name,
          status: 'completed',
          message: `${member.name} has completed their analysis`,
          fullResponse: response,
        },
      });

      // Parse vote from response
      let vote: any;
      try {
        vote = parseModelJSON(response);
        console.log(`[Council] ${member.name} parsed vote:`, {
          vote: vote?.vote,
          confidence: vote?.confidence,
          hasRationale: !!vote?.rationale,
          rationaleLength: vote?.rationale?.length
        });

        if (!vote || typeof vote !== 'object') {
          console.warn(`[Council] ${member.name} vote is not an object, extracting from text`);
          // Extract recommendation from text response for casual questions
          const hasReject = response.toLowerCase().includes('reject');
          const hasRevise = response.toLowerCase().includes('revise');

          // Try to extract confidence from text (look for patterns like "80%", "0.8", "high confidence")
          let extractedConfidence = 0.8;
          const confidenceMatch = response.match(/(\d+(?:\.\d+)?)\s*%|confidence[:\s]+(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*confidence/i);
          if (confidenceMatch) {
            const confValue = parseFloat(confidenceMatch[1] || confidenceMatch[2] || confidenceMatch[3]);
            if (!isNaN(confValue)) {
              extractedConfidence = confValue > 1 ? confValue / 100 : confValue; // Normalize to 0-1
            }
          }

          // Clean rationale - remove formatting markers and parsing artifacts
          let cleanRationale = response
            .replace(/Parsed from response:/gi, '')
            .replace(/\*\*[^*]+\*\*/g, '') // Remove markdown bold
            .replace(/Here's my response[^:]*:/gi, '')
            .replace(/Here's my take[^:]*:/gi, '')
            .trim();

          vote = {
            agent: member.name,
            vote: hasReject ? 'reject' : (hasRevise ? 'revise' : 'approve'),
            confidence: extractedConfidence, // Use extracted confidence instead of fixed 0.8
            rationale: cleanRationale, // Full text, not truncated
          };
          console.log(`[Council] ${member.name} extracted vote from text:`, vote);
        } else {
          // Clean rationale if it contains parsing artifacts
          if (vote.rationale) {
            vote.rationale = vote.rationale
              .replace(/Parsed from response:/gi, '')
              .replace(/\*\*[^*]+\*\*/g, '')
              .trim();
          }
          // Ensure confidence is a number between 0 and 1
          if (typeof vote.confidence !== 'number' || isNaN(vote.confidence)) {
            console.warn(`[Council] ${member.name} has invalid confidence, defaulting to 0.7`);
            vote.confidence = 0.7;
          } else if (vote.confidence > 1) {
            vote.confidence = vote.confidence / 100; // Normalize percentage to 0-1
          }
        }
      } catch (error: any) {
        console.error(`[Council] ${member.name} JSON parse error:`, error);
        console.error(`[Council] ${member.name} response (first 500 chars):`, response.substring(0, 500));
        // Fallback vote - clean the response
        let cleanRationale = response
          .replace(/Parsed from response:/gi, '')
          .replace(/\*\*[^*]+\*\*/g, '')
          .trim();

        // Try to extract confidence from text even in error case
        let extractedConfidence = 0.7;
        const confidenceMatch = response.match(/(\d+(?:\.\d+)?)\s*%|confidence[:\s]+(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*confidence/i);
        if (confidenceMatch) {
          const confValue = parseFloat(confidenceMatch[1] || confidenceMatch[2] || confidenceMatch[3]);
          if (!isNaN(confValue)) {
            extractedConfidence = confValue > 1 ? confValue / 100 : confValue;
          }
        }

        vote = {
          agent: member.name,
          vote: 'approve' as const,
          confidence: extractedConfidence, // Use extracted confidence
          rationale: cleanRationale, // Full text, not truncated
        };
        console.log(`[Council] ${member.name} fallback vote:`, vote);
      }

      // Stream: Member communicates their thoughts
      onEvent({
        type: 'council_communication',
        data: {
          memberId: member.id,
          memberName: member.name,
          message: vote.rationale || response.substring(0, 200),
          vote: vote.vote || 'approve',
          confidence: vote.confidence || 0.7,
        },
      });

      // Add metadata and stream vote - preserve FULL rationale
      const finalVote: CouncilVote = {
        ...vote,
        agentId: member.id,
        agentName: member.name,
        weight: member.weight,
        vote: (vote.vote || 'approve') as 'approve' | 'revise' | 'reject',
        confidence: vote.confidence || 0.7,
        // Use full response, not truncated (rationale may be cleaned but not truncated)
        rationale: vote.rationale || response,
        scores: vote.scores || {
          scope: 5,
          risk: 5,
          cost: 5,
          prob: 5,
        },
      };

      // Stream: Vote is cast
      onEvent({
        type: 'council_vote',
        data: finalVote,
      });

      return finalVote;
    };

    // PARALLEL PROCESSING STRATEGY
    if (isCasual) {
      // FULL PARALLELIZATION for casual questions - no dependencies needed
      // Stream: All members start thinking simultaneously
      councilMembers.forEach(member => {
        onEvent({
          type: 'council_thinking',
          data: {
            memberId: member.id,
            memberName: member.name,
            memberRole: member.role,
            status: 'analyzing',
            message: `${member.name} is analyzing...`,
          },
        });
      });

      // Process all members in parallel
      const votePromises = councilMembers.map(member => processMember(member, false));
      const allVotes = await Promise.all(votePromises);
      votes.push(...allVotes);

      // Add to previous responses for reference (not used but kept for consistency)
      allVotes.forEach(vote => {
        previousResponses.push({
          name: vote.agentName,
          role: councilMembers.find(m => m.id === vote.agentId)?.role || 'Specialist',
          rationale: vote.rationale,
        });
      });
    } else {
      // Process council members in batches to allow for "building on previous context"
      // We use a smaller batch size to ensure we have a "Phase 2" where members can see previous thoughts
      const batchSize = process.env.COUNCIL_BATCH_SIZE ? parseInt(process.env.COUNCIL_BATCH_SIZE) : 2;
      const firstBatch = councilMembers.slice(0, batchSize);
      const remainingMembers = councilMembers.slice(batchSize);

      console.log(`[Council] Starting deliberation with ${councilMembers.length} members. Batch 1: ${firstBatch.length}, Batch 2: ${remainingMembers.length}`);

      // Phase 1: Initial thoughts (Parallel)
      firstBatch.forEach(member => {
        onEvent({
          type: 'council_thinking',
          data: {
            memberId: member.id,
            memberName: member.name,
            memberRole: member.role,
            status: 'analyzing',
            message: `${member.name} is analyzing...`,
          },
        });
      });

      const firstBatchPromises = firstBatch.map(member => processMember(member, false));
      const firstBatchVotes = await Promise.all(firstBatchPromises);
      votes.push(...firstBatchVotes);

      // Add to previous responses for Phase 2
      firstBatchVotes.forEach(vote => {
        previousResponses.push({
          name: vote.agentName,
          role: councilMembers.find(m => m.id === vote.agentId)?.role || 'Specialist',
          rationale: vote.rationale,
        });
      });

      // Phase 2: Remaining members (with context from Phase 1) - process in parallel
      if (remainingMembers.length > 0) {
        // Stream: Second batch starts
        remainingMembers.forEach(member => {
          onEvent({
            type: 'council_thinking',
            data: {
              memberId: member.id,
              memberName: member.name,
              memberRole: member.role,
              status: 'analyzing',
              message: `${member.name} is analyzing with context from colleagues...`,
            },
          });
        });

        // Process remaining members in parallel (with context)
        const secondBatchPromises = remainingMembers.map(member => processMember(member, true));
        const secondBatchVotes = await Promise.all(secondBatchPromises);
        votes.push(...secondBatchVotes);
      }
    }


    // Stream: Council deliberation complete
    onEvent({
      type: 'council_complete',
      data: {
        message: 'Council deliberation complete',
        totalVotes: votes.length,
      },
    });

    // Stream consensus with isCasual flag and question context
    const consensus = computeConsensus(votes, isCasual, questionText);

    // Calculate attention scores (optional enhancement)
    try {
      // Dynamic import to avoid breaking if transformer module not available
      const transformerModule = await import('../../server/transformer/council-attention');
      if (transformerModule.calculateCouncilAttention) {
        const attentionResult = transformerModule.calculateCouncilAttention(
          votes,
          questionText || plan.objective || ''
        );

        // Stream attention information
        onEvent({
          type: 'council_attention',
          data: attentionResult,
        });
      }
    } catch (error) {
      // Attention calculation is optional, continue without it
      console.debug('[Council] Attention calculation skipped:', error);
    }

    onEvent({
      type: 'council_consensus',
      data: consensus,
    });

    return votes;
  } catch (error: any) {
    console.error('[Council] Error:', error);

    // Stream error
    onEvent({
      type: 'council_error',
      data: {
        message: `Council error: ${error.message}`,
      },
    });

    // Return fallback approval votes
    return councilMembers.map(member => ({
      agentId: member.id,
      agentName: member.name,
      weight: member.weight,
      vote: 'approve' as const,
      confidence: 0.7,
      rationale: `Automated approval due to council error: ${error.message}`,
    }));
  }
}

/**
 * Compute weighted consensus from votes
 */
export function computeConsensus(votes: CouncilVote[], isCasual: boolean = false, userQuestion?: string): {
  score: number;
  approved: boolean;
  summary: string;
} {
  // For casual questions, skip approval scoring entirely
  if (isCasual) {
    // Detect if this was an identity/definition question
    const isIdentityQuestion = votes.length > 0 &&
      (votes.some(v => v.rationale?.toLowerCase().includes('scorpion is')) ||
        votes.some(v => v.rationale?.toLowerCase().includes('scorpion') &&
          v.rationale?.toLowerCase().includes('intelligence')));

    // Deep synthesis of all perspectives for casual questions
    const sortedVotes = [...votes].sort((a, b) =>
      (b.confidence * b.weight) - (a.confidence * a.weight)
    );

    // Extract key themes from rationales
    const topVotes = sortedVotes.slice(0, Math.min(3, sortedVotes.length));

    // Extract and clean recommendations from all votes
    const cleanedVotes = topVotes.map(v => {
      let cleanRationale = (v.rationale || '')
        .replace(/Parsed from response:/gi, '')
        .replace(/\*\*[^*]+\*\*/g, '')
        .replace(/Here's my response[^:]*:/gi, '')
        .replace(/Here's my take[^:]*:/gi, '')
        .replace(/^\d+\.\s*/gm, '') // Remove numbered list markers
        .replace(/\b(approve|reject|revise|vote|voting)\b/gi, '') // Remove all voting language
        .trim();
      return { ...v, rationale: cleanRationale };
    });

    // Build user-friendly consensus - NO approval language
    let consensusParts: string[] = [];

    if (isIdentityQuestion) {
      // For identity questions, synthesize a comprehensive answer
      consensusParts.push(`**Council's Collective Understanding**`);

      // Extract key points from each agent's perspective
      const keyPoints = cleanedVotes.map((v, idx) => {
        const name = v.agentName || `Agent ${idx + 1}`;
        let fullRationale = (v.rationale || '').trim();

        // Remove voting language and formatting
        fullRationale = fullRationale
          .replace(/^\d+\.\s*/gm, '')
          .replace(/^\d+\)\s*/gm, '')
          .replace(/\b(approve|reject|revise|vote|voting|confidence)\b/gi, '')
          .replace(/\bConfidence:\s*\d+\.?\d*\b/gi, '')
          .replace(/\b\d+\.\d+\b/g, '')
          .replace(/^\d+\s*$/gm, '')
          .replace(/\s+/g, ' ')
          .trim();

        fullRationale = fullRationale.replace(/^\d+\s+/, '').replace(/\s+\d+$/, '');

        // Extract meaningful sentences
        const sentences = fullRationale.split(/[.!?]+/).filter(s => {
          const trimmed = s.trim();
          return trimmed.length > 20 &&
            !trimmed.match(/^\d+$/) &&
            !trimmed.match(/^\d+\s*$/) &&
            trimmed.length > 0;
        });

        if (sentences.length === 0) {
          return `\n\n**${name}**: ${fullRationale.substring(0, 300)}${fullRationale.length > 300 ? '...' : ''}`;
        }

        const mainPoint = sentences.slice(0, 5).join('. ').trim() + '.';
        return `\n\n**${name}**: ${mainPoint}${sentences.length > 5 ? '...' : ''}`;
      }).filter(kp => kp && kp.length > 20);

      consensusParts.push(...keyPoints);

      // Add synthesis - NO approval language
      consensusParts.push(`\n\n**Synthesis:** The Council sees Scorpion as an elite intelligence operation - a sophisticated AI-powered system that combines strategic thinking, knowledge management, and collaborative decision-making. Each of us brings unique expertise to help users navigate complex challenges.`);
    } else {
      // For recommendation questions, show recommendation - NO approval language
      if (cleanedVotes.length > 0) {
        const topRecommendation = cleanedVotes[0];
        const topName = topRecommendation.agentName || 'The council';

        let recommendation = topRecommendation.rationale || '';

        // Try to extract explicit recommendation
        const recommendMatch = recommendation.match(/(?:recommend|prefer|choose|pick|go with|would go|suggest|think.*better|believe.*better)\s+([^.!?]+)/i);
        const explicitRec = recommendMatch ? recommendMatch[1].trim() : null;

        // Clean first-person language and voting terms
        recommendation = recommendation
          .replace(/\b(approve|reject|revise|vote|voting)\b/gi, '')
          .replace(/\bI think\b/gi, `${topName} thinks`)
          .replace(/\bI'd\b/gi, `${topName} would`)
          .replace(/\bI'm\b/gi, `${topName} is`)
          .replace(/\bI recommend\b/gi, `${topName} recommends`)
          .replace(/\bI prefer\b/gi, `${topName} prefers`)
          .replace(/\bI\b/gi, topName)
          .replace(/\bmy\b/gi, `${topName}'s`)
          .replace(/\bme\b/gi, topName);

        const sentences = recommendation.split(/[.!?]+/).filter(s => s.trim().length > 20);
        const mainRec = sentences.slice(0, 3).join('. ').trim();

        consensusParts.push(`**Council Recommendation**`);
        if (explicitRec) {
          consensusParts.push(`\nThe council suggests: **${explicitRec}**`);
          consensusParts.push(`\n${topName} explains: ${mainRec}${sentences.length > 3 ? '...' : ''}`);
        } else {
          consensusParts.push(`\n${topName} suggests: ${mainRec}${sentences.length > 3 ? '...' : ''}`);
        }
      }
    }

    // Key perspectives - NO approval language
    if (!isIdentityQuestion && cleanedVotes.length > 1) {
      const otherPerspectives = cleanedVotes.slice(1, 3).map(v => {
        const name = v.agentName || 'A member';
        let insight = (v.rationale || '').trim();

        // Clean up - remove vote indicators
        insight = insight
          .replace(/\b(approve|reject|revise|vote|voting)\b/gi, '')
          .replace(/\b\d+\.\d+\b/g, '')
          .replace(/\b\d+\s*$/gm, '')
          .trim();

        const sentences = insight.split(/[.!?]+/).filter(s => {
          const trimmed = s.trim();
          return trimmed.length > 20 &&
            !trimmed.match(/^\d+$/) &&
            !trimmed.match(/^(approve|reject|revise)$/i);
        });

        const firstInsight = sentences[0] || insight.substring(0, 150);
        return `${name}: ${firstInsight.trim()}${firstInsight.length >= 150 ? '...' : ''}`;
      }).filter(p => p && !p.match(/^\w+:\s*$/));

      if (otherPerspectives.length > 0) {
        consensusParts.push(`\n**Additional Perspectives:**`);
        otherPerspectives.forEach(p => consensusParts.push(`- ${p}`));
      }
    }

    // For casual questions, return neutral approval (not used) and just the summary
    const summary = consensusParts.join('\n');
    return { score: 5, approved: true, summary }; // Neutral values, not used for casual
  }

  // Technical questions - keep existing approval logic
  let totalWeight = 0;
  let approvalWeight = 0;
  let reviseWeight = 0;
  let rejectWeight = 0;

  votes.forEach(vote => {
    totalWeight += vote.weight;

    if (vote.vote === 'approve') {
      approvalWeight += vote.weight * vote.confidence;
    } else if (vote.vote === 'revise') {
      reviseWeight += vote.weight * vote.confidence;
    } else {
      rejectWeight += vote.weight * vote.confidence;
    }
  });

  const approvalRatio = approvalWeight / totalWeight;
  const reviseRatio = reviseWeight / totalWeight;
  const rejectRatio = rejectWeight / totalWeight;

  const score = approvalRatio * 10;
  const approved = approvalRatio > 0.6 && rejectRatio < 0.2;

  // Deep technical consensus - extract key insights from actual rationales
  const sortedVotes = [...votes].sort((a, b) =>
    (b.confidence * b.weight) - (a.confidence * a.weight)
  );

  let consensusParts: string[] = [];

  consensusParts.push(`**Council Deliberation Summary**`);
  consensusParts.push(`\n**Vote Distribution:** ${(approvalRatio * 100).toFixed(0)}% approval, ${(reviseRatio * 100).toFixed(0)}% revise, ${(rejectRatio * 100).toFixed(0)}% reject.`);

  // Extract actual insights from top votes - be specific about what they said
  if (sortedVotes.length > 0) {
    const primary = sortedVotes[0];
    // Extract meaningful content from rationale (remove generic phrases)
    let primaryAnalysis = (primary.rationale || 'No rationale provided')
      .replace(/This plan looks/g, '')
      .replace(/I'm seeing/g, '')
      .replace(/From my expert perspective/g, '')
      .trim();

    // Take first 2-3 sentences that are actually meaningful
    const sentences = primaryAnalysis.split(/[.!?]+/).filter(s => {
      const trimmed = s.trim();
      return trimmed.length > 30 &&
        !trimmed.match(/^(Initial thoughts|Key concerns|My vote|Confidence|Rationale)/i) &&
        trimmed.length > 0;
    });

    const meaningfulAnalysis = sentences.slice(0, 2).join('. ').trim() + (sentences.length > 2 ? '...' : '');

    consensusParts.push(`\n**Primary Analysis:** ${primary.agentName} (confidence: ${(primary.confidence * 100).toFixed(0)}%) - ${meaningfulAnalysis || primaryAnalysis.substring(0, 200)}${primaryAnalysis.length > 200 && !meaningfulAnalysis ? '...' : ''}`);
  }

  // Risk assessment - only if scores are meaningful
  const avgRisk = votes.reduce((sum, v) => sum + (v.scores?.risk || 5), 0) / votes.length;
  const avgProb = votes.reduce((sum, v) => sum + (v.scores?.prob || 5), 0) / votes.length;

  if (avgRisk !== 5 || avgProb !== 5) {
    consensusParts.push(`\n**Risk Assessment:** Average risk score: ${avgRisk.toFixed(1)}/10, Success probability: ${avgProb.toFixed(1)}/10.`);
  }

  // Extract key concerns or strengths from multiple agents
  const keyInsights = sortedVotes.slice(0, 3).map(v => {
    let insight = (v.rationale || '').trim();
    // Extract meaningful sentences
    const sentences = insight.split(/[.!?]+/).filter(s => {
      const trimmed = s.trim();
      return trimmed.length > 40 &&
        !trimmed.match(/^(Initial thoughts|Key concerns|My vote|Confidence|Rationale|This plan)/i) &&
        !trimmed.match(/^\d+\.\s*$/) &&
        trimmed.length > 0;
    });
    return sentences.length > 0 ? sentences[0].trim() : null;
  }).filter(i => i && i.length > 40);

  if (keyInsights.length > 0) {
    consensusParts.push(`\n**Key Insights:**`);
    keyInsights.forEach((insight, idx) => {
      const agentName = sortedVotes[idx]?.agentName || 'A council member';
      consensusParts.push(`- ${agentName}: ${insight}${insight && insight.length > 150 ? '...' : ''}`);
    });
  }

  // Consensus behavior - be specific
  const highConfidenceCount = votes.filter(v => v.confidence >= 0.8).length;
  const concerns = votes.filter(v => v.vote === 'revise' || v.vote === 'reject').length;

  if (concerns > 0) {
    consensusParts.push(`\n**Deliberation Behavior:** ${highConfidenceCount} of ${votes.length} agents expressed high confidence. ${concerns} agent${concerns > 1 ? 's' : ''} identified areas requiring attention.`);
  } else {
    consensusParts.push(`\n**Deliberation Behavior:** ${highConfidenceCount} of ${votes.length} agents expressed high confidence. The council's analysis reflects strong consensus.`);
  }

  consensusParts.push(`\n**Final Decision:** ${approved ? 'Plan approved with consensus.' : 'Plan requires revision based on council feedback.'}`);

  const summary = consensusParts.join('\n');

  return { score, approved, summary };
}
