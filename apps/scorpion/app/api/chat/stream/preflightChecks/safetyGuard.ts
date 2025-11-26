// Phase 2.1: Extract Safety Guard from processStreamStart.ts
// Power of 10 Rule 4: Focused module for safety validation

import type { ScorpionIntent } from '@/lib/chat/types';
import { runPromptWithKillSwitch, SafetyGuardSchema } from '@scorpion/core';
import { getHelperConfig, getHelperDefaults } from '@/lib/chat/helper-config';

export interface SafetyCheckResult {
  allowed: boolean;
  blocked: boolean;
  safeAlternative?: string;
  reason?: string;
}

export interface SafetyGuardParams {
  userMessage: string;
  intent: ScorpionIntent;
  lightweightMode: boolean;
  clientMode: string;
  modelConfig: {
    provider: string;
    model: string;
    maxTokens: number;
    temperature: number;
  };
  runModelForPrompt: (systemPrompt: string, userPrompt: string, config: any) => Promise<any>;
}

/**
 * Run safety guard check on user message
 * Power of 10 Rule 4: Single responsibility - safety validation
 *
 * @returns SafetyCheckResult with allowed/blocked status
 */
export async function runSafetyGuard(params: SafetyGuardParams): Promise<SafetyCheckResult> {
  const {
    userMessage,
    intent,
    lightweightMode,
    clientMode,
    modelConfig,
    runModelForPrompt,
  } = params;

  // Get intent-aware helper configuration
  const helperConfig = getHelperConfig(intent, lightweightMode);
  const helperDefaults = getHelperDefaults();

  // Check if safety guard is enabled
  const safetyGuardEnabled = helperConfig.useSafetyGuard && process.env['SCORPION_ENABLE_SAFETY_GUARD'] !== '0';

  console.log('[Safety Guard] System status:', {
    enabled: safetyGuardEnabled,
    envFlag: process.env['SCORPION_ENABLE_SAFETY_GUARD'],
    configFlag: helperConfig.useSafetyGuard,
    system: safetyGuardEnabled ? 'ACTIVE' : 'DISABLED',
  });

  // If disabled, return default (allowed)
  if (!safetyGuardEnabled || helperConfig.useSafetyGuard === false) {
    console.log(`[Helper Config] Skipping safety-guard for intent: ${intent}`);
    return {
      allowed: helperDefaults.safetyGuard?.allowed ?? true,
      blocked: false,
    };
  }

  // Run safety guard check
  try {
    // JARVIS MODE: Single-user system - use standard safety guard prompt
    // No need to customize based on clientMode since we're always owner
    const rawResponse = await runPromptWithKillSwitch(
      'safety-guard.system.txt',
      { question: userMessage, draft: '', clientMode },
      SafetyGuardSchema,
      modelConfig,
      runModelForPrompt
    );

    let safetyCheck: any;

    // If kill-switch activated (rawResponse is null), use safe defaults immediately
    if (rawResponse) {
      safetyCheck = rawResponse;
    } else {
      // Kill-switch activated - use safe defaults (non-blocking)
      console.warn('[Chat Stream] Safety guard kill-switch activated, using safe defaults');
      safetyCheck = helperDefaults.safetyGuard;
    }

    // Return result
    return {
      allowed: safetyCheck?.allowed ?? true,
      blocked: !safetyCheck?.allowed,
      safeAlternative: safetyCheck?.safeAlternative,
      reason: safetyCheck?.reason,
    };
  } catch (error: any) {
    // Network/model errors - use safe defaults immediately (non-blocking)
    console.warn('[Chat Stream] Safety guard failed, using defaults:', error.message);
    return {
      allowed: helperDefaults.safetyGuard?.allowed ?? true,
      blocked: false,
      reason: 'Safety guard error - defaulting to allowed',
    };
  }
}
