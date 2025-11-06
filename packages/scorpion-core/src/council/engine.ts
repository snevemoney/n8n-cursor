/**
 * Council Engine - Orchestrates multi-agent deliberation
 */

import { runModel } from '../llm/modelAdapter';
import { computeConsensus } from './consensus';
import { councilMembers } from './members';
import { OntologyStore } from '../ontology/store';
import { formatForCouncil } from '../ontology/resolver';

export interface CouncilMember {
  name: string;
  role: string;
  specialty: string;
  weight: number;
  goal: string;
}

export interface CouncilResponse {
  members: Array<CouncilMember & { reply: string }>;
  consensus: {
    score: number;
    summary: string;
  };
}

/**
 * Run a council meeting on a topic
 */
export async function runCouncil(
  topic: string,
  ontologyStore?: OntologyStore
): Promise<CouncilResponse> {
  // Get relevant entities from ontology
  let ontologyContext = '';
  if (ontologyStore) {
    try {
      const relevantEntities = await ontologyStore.search({
        query: topic,
        limit: 5
      });
      
      if (relevantEntities.length > 0) {
        ontologyContext = relevantEntities
          .map(e => formatForCouncil(e))
          .join('\n\n');
      }
    } catch (error) {
      console.warn('Failed to get ontology context for council:', error);
    }
  }

  const results = await Promise.all(
    councilMembers.map(async (m) => {
      const prompt = `
You are ${m.name}, ${m.role} on the Scorpion Council.

Specialty: ${m.specialty}

Your mission: ${m.goal}

${ontologyContext ? `Relevant Context from Scorpion's Knowledge:\n${ontologyContext}\n\n` : ''}

Topic to evaluate: "${topic}"

Instructions:
1. Give a short analysis (max 150 words).
2. Say what to do next (plan or decision).
3. Give a confidence score 0–10, format: "CONFIDENCE: X"
      `.trim();

      const reply = await runModel({ prompt });
      
      return { ...m, reply: reply.content };
    })
  );

  const consensus = computeConsensus(results);

  return { members: results, consensus };
}

