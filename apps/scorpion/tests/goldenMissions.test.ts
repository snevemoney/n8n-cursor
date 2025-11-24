// apps/scorpion/tests/goldenMissions.test.ts
// If you're not using vitest/jest, you can turn this into a simple node script.

import fs from 'fs';
import path from 'path';
import { runScorpionBrain } from '../server/orchestrator';
import { ScorpionContextSnapshot } from '../server/types/strategy';

interface GoldenMission {
  id: string;
  description: string;
  inputMessages: { role: 'user' | 'assistant' | 'system'; content: string }[];
  mustInclude: string[];
  mustNotInclude: string[];
}

const GOLDEN_PATH = path.join(
  process.cwd(),
  'apps',
  'scorpion',
  'tests',
  'golden-missions.json',
);

const missions: GoldenMission[] = JSON.parse(
  fs.readFileSync(GOLDEN_PATH, 'utf8'),
);

async function runGoldenMission(mission: GoldenMission) {
  const snapshot: ScorpionContextSnapshot = {
    userId: 'evens',
    timestamp: new Date().toISOString(),
    messages: mission.inputMessages,
    currentPhase: 'PLAN',
    planSummary: '',
    toolsUsed: [],
  };

  const brain = await runScorpionBrain(snapshot);

  const syntheticResponse = [
    brain.nba?.title ?? '',
    brain.nba?.description ?? '',
    brain.nba?.rationale ?? '',
  ].join('\n');

  for (const must of mission.mustInclude) {
    if (!syntheticResponse.toLowerCase().includes(must.toLowerCase())) {
      throw new Error(
        `Golden mission "${mission.id}" failed: expected to include "${must}".`,
      );
    }
  }

  for (const forbidden of mission.mustNotInclude) {
    if (syntheticResponse.toLowerCase().includes(forbidden.toLowerCase())) {
      throw new Error(
        `Golden mission "${mission.id}" failed: must NOT include "${forbidden}".`,
      );
    }
  }
}

(async () => {
  for (const mission of missions) {
    await runGoldenMission(mission);
    console.log(`✅ Golden mission passed: ${mission.id}`);
  }
  console.log('✅ All golden missions passed!');
})().catch((err) => {
  console.error('❌ Golden missions failed:', err);
  process.exit(1);
});

