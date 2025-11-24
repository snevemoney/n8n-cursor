// apps/scorpion/server/council/aiFoundationsCouncil.test.ts
// Run with: tsx apps/scorpion/server/council/aiFoundationsCouncil.test.ts
// Or: node --loader ts-node/esm apps/scorpion/server/council/aiFoundationsCouncil.test.ts

import fs from 'fs';
import path from 'path';
import { AIFoundationsCouncilMember } from './aiFoundationsCouncil';
import { CouncilInput } from '../types/council';

interface SampleCase {
  id: string;
  description: string;
  goalDescription: string;
  planSummary: string;
  draftAnswer?: string;
  expectedIssueTags: string[];
}

function loadSamples(): SampleCase[] {
  // Try multiple possible paths
  const possiblePaths = [
    path.join(process.cwd(), 'server', 'council', 'aiFoundationsSamples.json'),
    path.join(process.cwd(), 'apps', 'scorpion', 'server', 'council', 'aiFoundationsSamples.json'),
    path.join(__dirname, 'aiFoundationsSamples.json'),
  ];

  for (const p of possiblePaths) {
    try {
      const raw = fs.readFileSync(p, 'utf8');
      return JSON.parse(raw);
    } catch (e) {
      // Try next path
    }
  }

  throw new Error(`Could not find aiFoundationsSamples.json. Tried: ${possiblePaths.join(', ')}`);
}

async function run() {
  const samples = loadSamples();
  let failed = 0;
  let passed = 0;

  console.log(`\n🧪 Testing AI Foundations Council with ${samples.length} samples...\n`);

  for (const sample of samples) {
    const input: CouncilInput = {
      goalDescription: sample.goalDescription,
      planSummary: sample.planSummary,
      draftAnswer: sample.draftAnswer,
      domainTags: [],
    };

    const res = AIFoundationsCouncilMember.run(input);

    const actualTags = [...new Set(res.issues.map((i) => i.tag))];

    const missingExpected = sample.expectedIssueTags.filter(
      (tag) => !actualTags.includes(tag),
    );
    const unexpected = actualTags.filter(
      (tag) => !sample.expectedIssueTags.includes(tag),
    );

    if (missingExpected.length || unexpected.length) {
      failed++;
      console.error(`❌ [${sample.id}] ${sample.description}`);
      if (missingExpected.length) {
        console.error(`   Missing expected tags: ${missingExpected.join(', ')}`);
      }
      if (unexpected.length) {
        console.error(`   Unexpected tags: ${unexpected.join(', ')}`);
      }
      console.error(`   Actual issues:`, res.issues.map(i => `[${i.tag}] ${i.message}`));
      console.error('');
    } else {
      passed++;
      console.log(`✅ [${sample.id}] ${sample.description}`);
    }
  }

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

  if (failed) {
    console.error(`❌ ${failed} sample(s) failed.`);
    process.exit(1);
  } else {
    console.log('✅ All AI Foundations samples passed.');
  }
}

run().catch((err) => {
  console.error('Test run error:', err);
  process.exit(1);
});

