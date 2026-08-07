/**
 * Creative-engineering outcome registration for the hive loop.
 * CE = business ledger; Scorpion = ops/knowledge ledger; both when spanning.
 */

export type HiveRegisterTarget = 'ce' | 'scorpion' | 'both';

export interface HiveMissionOutcome {
  missionId: string;
  summary: string;
  target: HiveRegisterTarget;
  sourceTopicId?: number;
  agentId?: string;
  refs?: Record<string, string>;
  createdAt?: string;
}

export interface HiveRegisterResult {
  ok: boolean;
  scorpionLogged: boolean;
  ceQueued: boolean;
  message: string;
}

const scorpionOutcomes: HiveMissionOutcome[] = [];

export function getRecentScorpionOutcomes(limit = 20): HiveMissionOutcome[] {
  return scorpionOutcomes.slice(-limit).reverse();
}

/**
 * Register a completed (or checkpoint) mission.
 * Scorpion stores locally; CE is queued for the operator/machine bridge.
 */
export function registerHiveOutcome(outcome: HiveMissionOutcome): HiveRegisterResult {
  const createdAt = outcome.createdAt ?? new Date().toISOString();
  const row = { ...outcome, createdAt };

  let scorpionLogged = false;
  let ceQueued = false;

  if (row.target === 'scorpion' || row.target === 'both') {
    scorpionOutcomes.push(row);
    if (scorpionOutcomes.length > 500) {
      scorpionOutcomes.splice(0, scorpionOutcomes.length - 500);
    }
    scorpionLogged = true;
  }

  if (row.target === 'ce' || row.target === 'both') {
    // CE write goes through machine bridge / philanthropic tool — mark queued.
    ceQueued = true;
  }

  return {
    ok: true,
    scorpionLogged,
    ceQueued,
    message: `Registered mission ${row.missionId} → ${row.target}`,
  };
}
