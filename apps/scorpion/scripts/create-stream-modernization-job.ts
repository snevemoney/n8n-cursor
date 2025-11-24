#!/usr/bin/env tsx
/**
 * Create Migration Job for Stream API Modernization
 * Tracks the file split refactoring as a formal modernization task
 */

import { getMigrationService } from '../lib/migration/migrationService';

async function createJob() {
  const service = getMigrationService();
  
  const jobId = await service.createJob({
    name: 'Scorpion Stream API Modernization v1',
    description: 'Split processStreamStart.ts (5887 lines) into smaller helper modules to fix TypeScript parser limitations and comply with Power of 10 Rule 4 (Small Functions)',
    sourceSystem: 'codebase',
    targetSystem: 'modernized',
    tasks: [
      {
        kind: 'file_split',
        name: 'Split processStreamStart.ts into logical modules',
        description: 'Extract large function into smaller, focused modules',
        details: {
          sourceFile: 'app/api/chat/stream/processStreamStart.ts',
          targetFiles: [
            {
              path: 'app/api/chat/stream/helpers/streamInitialization.ts',
              description: 'Stream setup, connection events, abort listeners',
            },
            {
              path: 'app/api/chat/stream/helpers/intentHandlers.ts',
              description: 'Identity and small_talk intent handlers',
            },
            {
              path: 'app/api/chat/stream/helpers/userToolHandler.ts',
              description: 'User tool detection and execution',
            },
            {
              path: 'app/api/chat/stream/helpers/preflightChecks.ts',
              description: 'Safety guard, tool router, budget governor, dispatcher',
            },
            {
              path: 'app/api/chat/stream/helpers/planningPhase.ts',
              description: 'Plan creation, validation, and enforcement',
            },
            {
              path: 'app/api/chat/stream/helpers/knowledgeSearch.ts',
              description: 'Knowledge base search and RAG retrieval',
            },
            {
              path: 'app/api/chat/stream/helpers/summarizerPhase.ts',
              description: 'Summarizer logic and final answer streaming',
            },
            {
              path: 'app/api/chat/stream/helpers/streamCleanup.ts',
              description: 'Error handling, cleanup, and protocol serialization',
            },
          ],
          preserveImports: true,
          extractHelpers: true,
        },
      },
    ],
    config: {
      reason: 'TypeScript parser limitation with 6k+ line files',
      goal: 'All functions < 60 lines (Power of 10 Rule 4)',
      expectedOutcome: 'TypeScript parser errors resolved, code more maintainable',
    },
  });

  console.log('✅ Migration job created:', jobId);
  console.log('   Run with: POST /api/migration/jobs/' + jobId + '/run');
  
  return jobId;
}

if (require.main === module) {
  createJob().catch(console.error);
}

export { createJob };

