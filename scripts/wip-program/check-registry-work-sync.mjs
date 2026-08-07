#!/usr/bin/env node
/**
 * Phase 19: ensure repo-registry exports parse and side_wip defaults stay NO_PATH.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const src = readFileSync(
  join(root, 'packages/shared-config/src/repo-registry.ts'),
  'utf8',
);

const sideBlocks = [...src.matchAll(/lane:\s*'side_wip'[\s\S]*?pathVerdict:\s*'([^']+)'/g)];
let ok = true;
for (const m of sideBlocks) {
  if (m[1] !== 'NO_PATH') {
    console.error('side_wip entry has pathVerdict', m[1], '(expected NO_PATH)');
    ok = false;
  }
}
if (!src.includes("lane: 'parked'") && !src.includes('lane: "parked"')) {
  console.error('missing parked LightningFlow lane');
  ok = false;
}
console.log(ok ? 'REGISTRY_SYNC_OK' : 'REGISTRY_SYNC_FAIL');
process.exit(ok ? 0 : 1);
