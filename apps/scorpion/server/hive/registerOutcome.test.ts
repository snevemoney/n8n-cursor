import { describe, expect, it } from 'vitest';
import {
  getRecentScorpionOutcomes,
  registerHiveOutcome,
} from './registerOutcome';

describe('registerHiveOutcome', () => {
  it('logs to scorpion ledger', () => {
    const r = registerHiveOutcome({
      missionId: `test-${Date.now()}`,
      summary: 'phase test',
      target: 'scorpion',
      agentId: 'bigboss',
    });
    expect(r.ok).toBe(true);
    expect(r.scorpionLogged).toBe(true);
    expect(r.ceQueued).toBe(false);
    const recent = getRecentScorpionOutcomes(5);
    expect(recent.some((o) => o.summary === 'phase test')).toBe(true);
  });

  it('queues CE for both', () => {
    const r = registerHiveOutcome({
      missionId: `both-${Date.now()}`,
      summary: 'span',
      target: 'both',
    });
    expect(r.scorpionLogged).toBe(true);
    expect(r.ceQueued).toBe(true);
  });
});
