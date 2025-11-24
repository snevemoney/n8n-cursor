// apps/scorpion/lib/chat/councilCaucus.ts
// Bidirectional telepathic communication system for council members

import { readFileSync } from 'fs';
import { runModelUnified, parseModelJSON } from './modelRunner';
import type { Plan } from './types';

interface CouncilMember {
  id: string;
  name: string;
  role: string;
  weight: number;
}

interface CaucusMessage {
  from: string;
  fromId: string;
  fromRole: string;
  message: string;
  timestamp: number;
  round: number;
}

interface CaucusRound {
  round: number;
  messages: CaucusMessage[];
  context: string; // Accumulated context from previous rounds
}

/**
 * Run council caucus - bidirectional telepathic communication
 * Members can see and respond to each other's thoughts before voting
 */
export async function runCouncilCaucus(
  plan: Plan,
  councilMembers: CouncilMember[],
  modelConfig: { provider: string; model: string; maxTokens?: number; temperature?: number },
  onEvent: (event: { type: string; data: any }) => void,
  maxRounds: number = 2 // Default 2 rounds of discussion
): Promise<CaucusRound[]> {
  console.log('[Council Caucus] Starting telepathic communication phase...');
  
  const rounds: CaucusRound[] = [];
  let accumulatedContext = '';
  
  // Stream: Caucus begins
  onEvent({
    type: 'council_caucus_start',
    data: {
      message: 'Council caucus beginning - members are connecting telepathically...',
      memberCount: councilMembers.length,
      maxRounds,
    },
  });
  
  // Round 1: Initial thoughts - all members share their initial analysis
  onEvent({
    type: 'council_caucus_round',
    data: {
      round: 1,
      message: 'Round 1: Members sharing initial thoughts...',
    },
  });
  
  const round1Messages: CaucusMessage[] = [];
  
  // All members share initial thoughts in parallel
  const initialThoughts = await Promise.all(
    councilMembers.map(async (member) => {
      const personality = getMemberPersonality(member.name, member.role);
      
      const caucusPrompt = `You are ${member.name}, ${member.role} (Weight: ${member.weight}x).

${personality}

**COUNCIL CAUCUS - ROUND 1: INITIAL THOUGHTS**

You are participating in a telepathic council caucus. All council members can hear each other's thoughts in real-time.

**The Plan Under Review:**
${JSON.stringify(plan, null, 2)}

**Your Task:**
Share your initial thoughts about this plan. Be concise but insightful. Other members will hear this and may respond.

**Format your response as:**
{
  "thought": "Your initial analysis and concerns about the plan",
  "keyPoints": ["point1", "point2", "point3"],
  "concerns": ["concern1", "concern2"] or [],
  "suggestions": ["suggestion1", "suggestion2"] or []
}

Respond with ONLY valid JSON.`;

      try {
        const response = await runModelUnified(
          caucusPrompt,
          '',
          {
            provider: modelConfig.provider as any,
            model: modelConfig.model,
            maxTokens: modelConfig.maxTokens || 400,
            temperature: 0.2, // Lower temp for more focused thoughts
          }
        );
        
        const parsed = parseModelJSON(response);
        const thought = typeof parsed === 'string' ? parsed : parsed.thought || response;
        const keyPoints = parsed.keyPoints || [];
        const concerns = parsed.concerns || [];
        const suggestions = parsed.suggestions || [];
        
        const message: CaucusMessage = {
          from: member.name,
          fromId: member.id,
          fromRole: member.role,
          message: thought,
          timestamp: Date.now(),
          round: 1,
        };
        
        // Stream: Member shares thought
        onEvent({
          type: 'council_caucus_message',
          data: {
            ...message,
            keyPoints,
            concerns,
            suggestions,
          },
        });
        
        return message;
      } catch (error: any) {
        console.warn(`[Council Caucus] ${member.name} failed to share initial thought:`, error.message);
        return {
          from: member.name,
          fromId: member.id,
          fromRole: member.role,
          message: `${member.name} is analyzing...`,
          timestamp: Date.now(),
          round: 1,
        };
      }
    })
  );
  
  round1Messages.push(...initialThoughts);
  accumulatedContext += `\n\n=== ROUND 1: INITIAL THOUGHTS ===\n${round1Messages.map(m => `${m.from} (${m.fromRole}): ${m.message}`).join('\n\n')}`;
  
  rounds.push({
    round: 1,
    messages: round1Messages,
    context: accumulatedContext,
  });
  
  // Round 2+: Response and discussion
  for (let round = 2; round <= maxRounds; round++) {
    onEvent({
      type: 'council_caucus_round',
      data: {
        round,
        message: `Round ${round}: Members responding to each other...`,
      },
    });
    
    const roundMessages: CaucusMessage[] = [];
    
    // Each member can respond to what others said
    const responses = await Promise.all(
      councilMembers.map(async (member) => {
        const personality = getMemberPersonality(member.name, member.role);
        
        // Get messages from other members (not self)
        const otherMessages = round1Messages.filter(m => m.fromId !== member.id);
        const previousRoundMessages = rounds[round - 2]?.messages || [];
        const allPreviousMessages = [...round1Messages, ...previousRoundMessages].filter(m => m.fromId !== member.id);
        
        const caucusPrompt = `You are ${member.name}, ${member.role} (Weight: ${member.weight}x).

${personality}

**COUNCIL CAUCUS - ROUND ${round}: RESPONSE & DISCUSSION**

You have heard the thoughts of your fellow council members. Now respond to their points, ask questions, or build on their ideas.

**Previous Round Thoughts:**
${allPreviousMessages.map(m => `${m.from} (${m.fromRole}): ${m.message}`).join('\n\n')}

**The Plan Under Review:**
${JSON.stringify(plan, null, 2)}

**Your Task:**
Respond to what others have said. You can:
- Agree or disagree with specific points
- Ask clarifying questions
- Build on others' ideas
- Raise new concerns
- Suggest improvements

**Format your response as:**
{
  "response": "Your response to the discussion",
  "respondingTo": ["member1", "member2"] or [],
  "agreement": "What you agree with",
  "disagreement": "What you disagree with" or null,
  "newPoints": ["point1", "point2"] or []
}

Respond with ONLY valid JSON.`;

        try {
          const response = await runModelUnified(
            caucusPrompt,
            '',
            {
              provider: modelConfig.provider as any,
              model: modelConfig.model,
              maxTokens: modelConfig.maxTokens || 300,
              temperature: 0.25, // Slightly higher for discussion
            }
          );
          
          const parsed = parseModelJSON(response);
          const responseText = typeof parsed === 'string' ? parsed : parsed.response || response;
          const respondingTo = parsed.respondingTo || [];
          const agreement = parsed.agreement || '';
          const disagreement = parsed.disagreement || '';
          const newPoints = parsed.newPoints || [];
          
          const message: CaucusMessage = {
            from: member.name,
            fromId: member.id,
            fromRole: member.role,
            message: responseText,
            timestamp: Date.now(),
            round,
          };
          
          // Stream: Member responds
          onEvent({
            type: 'council_caucus_message',
            data: {
              ...message,
              respondingTo,
              agreement,
              disagreement,
              newPoints,
            },
          });
          
          return message;
        } catch (error: any) {
          console.warn(`[Council Caucus] ${member.name} failed to respond:`, error.message);
          return {
            from: member.name,
            fromId: member.id,
            fromRole: member.role,
            message: `${member.name} is considering the discussion...`,
            timestamp: Date.now(),
            round,
          };
        }
      })
    );
    
    roundMessages.push(...responses);
    accumulatedContext += `\n\n=== ROUND ${round}: DISCUSSION ===\n${roundMessages.map(m => `${m.from} (${m.fromRole}): ${m.message}`).join('\n\n')}`;
    
    rounds.push({
      round,
      messages: roundMessages,
      context: accumulatedContext,
    });
  }
  
  // Stream: Caucus complete
  onEvent({
    type: 'council_caucus_complete',
    data: {
      message: 'Council caucus complete - members have shared thoughts and discussed',
      totalRounds: rounds.length,
      totalMessages: rounds.reduce((sum, r) => sum + r.messages.length, 0),
      context: accumulatedContext,
    },
  });
  
  return rounds;
}

/**
 * Get member personality for caucus
 */
function getMemberPersonality(name: string, role: string): string {
  const personalities: Record<string, string> = {
    'Architectus': `You are Architectus, the master strategist. You think in systems, patterns, and long-term implications. Your analysis is methodical and architectural - you see the blueprint before the building. You speak with precision, using technical metaphors and structural thinking.`,
    'Analytica': `You are Analytica, the intelligence gatherer. You see connections others miss, patterns in chaos, knowledge where others see noise. You're obsessed with sources, evidence, and the quality of information.`,
    'Pragmaton': `You are Pragmaton, the field operative. You've seen plans fail in execution. You think in terms of what actually works, not what looks good on paper. You're brutally honest about feasibility.`,
    'Satori': `You are Satori, the ethical compass. You see the human impact, the alignment issues, the hidden consequences. You think about intent, safety, and long-term effects on people.`,
    'Nexus': `You are Nexus, the connector. You see how systems interact, where integrations break, and how data flows. You think in APIs, contracts, and handshakes.`,
    'Sentinel': `You are Sentinel, the guardian. You see threats everywhere - and you're usually right. You think in attack vectors, performance bottlenecks, and failure modes.`,
    'Catalyst': `You are Catalyst, the innovator. You see possibilities where others see problems. You think in terms of disruption, innovation, and creative solutions.`,
    'Oracle': `You are Oracle, the data seer. You see trends, metrics, and signals in the noise. You think in numbers, patterns, and probabilities.`,
    'Mentor': `You are Mentor, the LLM training master. You understand model architectures, training strategies, fine-tuning techniques, and evaluation metrics.`,
  };
  
  return personalities[name] || `You are ${name}, ${role}. You bring expertise and intelligence to every analysis.`;
}

