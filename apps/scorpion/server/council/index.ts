// apps/scorpion/server/council/index.ts

import { CouncilInput, CouncilMember, CouncilIssue, CouncilResult } from '../types/council';
import { EthicsCouncilMember } from './ethicsCouncil';
import { HumanContextCouncilMember } from './humanContextCouncil';
import { AIFoundationsCouncilMember } from './aiFoundationsCouncil';
import { GenerativeModelsCouncil } from './genModelsCouncil';
import { PromptQualityCouncil } from './promptQualityCouncil';
import { DataOpsCouncilMember } from './dataOpsCouncil';
import { DataAnalyticsCouncilMember } from './dataAnalyticsCouncil';
import { BiasCouncilMember } from './biasCouncil';
import { SecurityCouncilMember } from './securityCouncil';
import { PerformanceCouncilMember } from './performanceCouncil';
import { SimplicityCouncilMember } from './SimplicityCouncilMember';
import { ToolSanityCouncilMember } from './ToolSanityCouncilMember';
// Custom council members (user's original council)
import { ArchitectusCouncilMember } from './architectusCouncil';
import { AnalyticaCouncilMember } from './analyticaCouncil';
import { PragmatonCouncilMember } from './pragmatonCouncil';
import { SatoriCouncilMember } from './satoriCouncil';
import { NexusCouncilMember } from './nexusCouncil';
import { SentinelCouncilMember } from './sentinelCouncil';
import { CatalystCouncilMember } from './catalystCouncil';
import { OracleCouncilMember } from './oracleCouncil';
import { MentorCouncilMember } from './mentorCouncil';
import { storeCouncilResult } from './councilStorage';

/**
 * SCORPION COUNCIL - Architecturally Organized
 * 
 * Organized by architectural layers (as designed by Architectus):
 * 
 * ┌─────────────────────────────────────────────────────────────┐
 * │ LAYER 1: FOUNDATION (System Architecture & Design)          │
 * │ - Architectus (1.5x) - System Architect & Design Lead        │
 * │ - Nexus (1.1x) - Integration & API Contracts               │
 * │ - Simplicity Councillor - Code Clarity & Maintainability    │
 * │ - Tool Sanity Councillor - Tool Selection & Usage           │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * ┌─────────────────────────────────────────────────────────────┐
 * │ LAYER 2: EXECUTION (Implementation & Operations)          │
 * │ - Pragmaton (1.3x) - Execution Engineer & Workflow Lead    │
 * │ - DataOps Councillor - Data Operations & Pipelines          │
 * │ - Performance Councillor - Performance Optimization          │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * ┌─────────────────────────────────────────────────────────────┐
 * │ LAYER 3: INTELLIGENCE (Knowledge & Data)                   │
 * │ - Analytica (1.2x) - Knowledge & RAG Strategist Lead        │
 * │ - Oracle (1.1x) - Data & Analytics Seer                    │
 * │ - Data Analytics Councillor - Analytics Methodology        │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * ┌─────────────────────────────────────────────────────────────┐
 * │ LAYER 4: AI/ML (Models & Training)                         │
 * │ - Mentor (1.2x) - LLM Training & Evaluation Master Lead    │
 * │ - AI Foundations Councillor - AI Best Practices            │
 * │ - Generative Models Councillor - Model Architecture        │
 * │ - Prompt Quality Councillor - Prompt Engineering           │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * ┌─────────────────────────────────────────────────────────────┐
 * │ LAYER 5: SAFETY (Security, Ethics, Alignment)             │
 * │ - Satori (1.0x) - Alignment & Safety Lead                  │
 * │ - Sentinel (1.2x) - Security & Performance Guardian        │
 * │ - Security Councillor - Security Analysis                  │
 * │ - Ethics Councillor - Ethics & Bias Detection              │
 * │ - Bias Detection Councillor - Bias Mitigation             │
 * │ - Human Context Councillor - Human Sensitivity             │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * ┌─────────────────────────────────────────────────────────────┐
 * │ LAYER 6: INNOVATION (Future & Optimization)                │
 * │ - Catalyst (0.9x) - Innovation Advisor                     │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * Execution Order: Foundation → Execution → Intelligence → AI/ML → Safety → Innovation
 * This ensures architectural concerns are addressed before implementation details.
 */
export const MEMBERS: CouncilMember[] = [
  // ============================================================
  // LAYER 1: FOUNDATION (System Architecture & Design)
  // ============================================================
  ArchitectusCouncilMember,      // 1.5x - System Architect (Lead)
  NexusCouncilMember,             // 1.1x - Integration Specialist
  new SimplicityCouncilMember(), // Code Clarity
  new ToolSanityCouncilMember(), // Tool Selection
  
  // ============================================================
  // LAYER 2: EXECUTION (Implementation & Operations)
  // ============================================================
  PragmatonCouncilMember,         // 1.3x - Execution Engineer (Lead)
  DataOpsCouncilMember,           // Data Operations
  PerformanceCouncilMember,       // Performance Optimization
  
  // ============================================================
  // LAYER 3: INTELLIGENCE (Knowledge & Data)
  // ============================================================
  AnalyticaCouncilMember,         // 1.2x - Knowledge & RAG Strategist (Lead)
  OracleCouncilMember,            // 1.1x - Data & Analytics Seer
  DataAnalyticsCouncilMember,     // Analytics Methodology
  
  // ============================================================
  // LAYER 4: AI/ML (Models & Training)
  // ============================================================
  MentorCouncilMember,            // 1.2x - LLM Training Master (Lead)
  AIFoundationsCouncilMember,     // AI Best Practices
  GenerativeModelsCouncil,        // Model Architecture
  PromptQualityCouncil,           // Prompt Engineering
  
  // ============================================================
  // LAYER 5: SAFETY (Security, Ethics, Alignment)
  // ============================================================
  SatoriCouncilMember,            // 1.0x - Alignment & Safety (Lead)
  SentinelCouncilMember,          // 1.2x - Security & Performance Guardian
  SecurityCouncilMember,          // Security Analysis
  EthicsCouncilMember,            // Ethics & Bias Detection
  BiasCouncilMember,              // Bias Mitigation
  HumanContextCouncilMember,      // Human Sensitivity
  
  // ============================================================
  // LAYER 6: INNOVATION (Future & Optimization)
  // ============================================================
  CatalystCouncilMember,          // 0.9x - Innovation Advisor
];

/**
 * Power of 10 Rule 3: Helper to process a single council member
 */
async function processCouncilMember(
  member: CouncilMember,
  input: CouncilInput,
  state: {
    approved: boolean;
    planSummary: string;
    answer: string | undefined;
    allIssues: CouncilIssue[];
    warnings: string[];
    councillorOutputs: CouncilResult['councillorOutputs'];
  }
): Promise<void> {
    try {
      const output = await Promise.resolve(member.run(input));

      if (!output.approved) {
      state.approved = false;
      }

      if (output.revisedPlanSummary) {
      state.planSummary = output.revisedPlanSummary;
      }

      if (typeof output.revisedAnswer === 'string') {
      state.answer = output.revisedAnswer;
      }

      if (output.issues.length) {
      state.allIssues.push(...output.issues);
      }

      if (output.warnings) {
      state.warnings.push(...output.warnings);
      }

    state.councillorOutputs.push({
        councillorId: member.id,
        councillorName: member.name || member.id,
        issues: output.issues,
        approved: output.approved,
      });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn(`[Council] ${member.id} failed:`, errorMessage);
      // Continue with other councillors even if one fails
    }
  }

/**
 * Power of 10 Rule 3: Helper to build council result
 */
function buildCouncilResult(
  input: CouncilInput,
  state: {
    approved: boolean;
    planSummary: string;
    answer: string | undefined;
    allIssues: CouncilIssue[];
    warnings: string[];
    councillorOutputs: CouncilResult['councillorOutputs'];
  }
): CouncilResult {
  return {
    approved: state.approved,
    allIssues: state.allIssues,
    revisedPlanSummary: state.planSummary === input.planSummary ? undefined : state.planSummary,
    revisedAnswer: state.answer === input.draftAnswer ? undefined : state.answer,
    warnings: state.warnings,
    councillorOutputs: state.councillorOutputs,
  };
}

/**
 * Run all council members and merge their outputs.
 * Power of 10 Rule 3: Refactored to use focused helper functions (< 60 lines)
 */
export async function runCouncil(input: CouncilInput): Promise<CouncilResult> {
  const state = {
    approved: true,
    planSummary: input.planSummary,
    answer: input.draftAnswer,
    allIssues: [] as CouncilIssue[],
    warnings: [] as string[],
    councillorOutputs: [] as CouncilResult['councillorOutputs'],
  };

  // Process all council members
  for (const member of MEMBERS) {
    await processCouncilMember(member, input, state);
  }

  // Build result
  const result = buildCouncilResult(input, state);

  // Store result asynchronously (fire-and-forget with explicit void)
  // Power of 10 Rule 4: Explicit void prefix for ignored promises
  if (input.userId || input.conversationId || input.missionId) {
    void storeCouncilResult(result, {
      userId: input.userId,
      conversationId: input.conversationId,
      missionId: input.missionId,
    }).catch((err) => {
      console.warn('[Council] Failed to store result:', err.message);
    });
  }

  return result;
}

/**
 * Extract domain tags from goal and plan text
 */
export function extractDomainTags(goalDescription: string, planSummary: string): string[] {
  const combined = `${goalDescription} ${planSummary}`.toLowerCase();
  const tags: string[] = [];

  const domainPatterns: Record<string, string[]> = {
    hiring: ['hire', 'recruit', 'resume', 'candidate', 'interview', 'job'],
    loans: ['loan', 'credit', 'lending', 'approve', 'deny', 'borrow'],
    justice: ['sentencing', 'reoffending', 'risk assessment', 'criminal', 'justice'],
    healthcare: ['health', 'medical', 'triage', 'diagnosis', 'treatment'],
    finance: ['finance', 'trading', 'portfolio', 'investment', 'bitcoin', 'crypto'],
    ai: ['ai', 'model', 'training', 'llm', 'agent', 'workflow'],
  };

  for (const [domain, keywords] of Object.entries(domainPatterns)) {
    if (keywords.some((keyword) => combined.includes(keyword))) {
      tags.push(domain);
    }
  }

  return tags;
}

