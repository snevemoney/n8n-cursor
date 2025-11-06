/**
 * Agent types
 */

import { ExtractedKnowledge } from '../knowledge/types';

export interface BuildRequest {
  target: string; // e.g., "business owners"
  features: string[]; // e.g., ["chatbot", "multi-tenant"]
  requirements: string;
}

export interface BuildPlan {
  name: string;
  description: string;
  architecture: {
    patterns: ExtractedKnowledge[];
    reasoning: string;
  };
  features: {
    knowledge: ExtractedKnowledge[];
    implementation: string;
  }[];
  codeStructure: {
    files: string[];
    dependencies: string[];
  };
  researchNeeded: string[]; // Things to research via browser
}

