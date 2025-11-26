#!/usr/bin/env tsx
/**
 * Create planned migration jobs for future modernization efforts
 * Run with: pnpm tsx scripts/create-planned-migrations.ts
 */

import { getMigrationService } from '../lib/migration/migrationService';

async function createPlannedMigrations() {
  const service = getMigrationService();

  console.log('Creating planned migration jobs...\n');

  // 1. Legacy Executor Extraction
  const legacyExecutorJobId = await service.createJob({
    name: 'Legacy Executor Extraction',
    description: 'Extract legacy executor loop from processStreamStart.ts into a dedicated module',
    sourceSystem: 'local',
    targetSystem: 'scorpion_cloud',
    tasks: [
      {
        kind: 'file_split',
        name: 'Extract Legacy Executor',
        description: 'Move legacy executor loop to helpers/legacyExecutor.ts',
        details: {
          sourceFile: 'app/api/chat/stream/processStreamStart.ts',
          targetFiles: [
            {
              path: 'app/api/chat/stream/helpers/legacyExecutor.ts',
              description: 'Legacy executor loop implementation',
            },
          ],
        },
      },
    ],
    config: {
      priority: 'medium',
      estimatedTime: '2-4 hours',
    },
  });

  console.log(`✅ Created: Legacy Executor Extraction (${legacyExecutorJobId})`);

  // 2. RAG/Knowledge Integration Extraction
  const ragIntegrationJobId = await service.createJob({
    name: 'RAG/Knowledge Integration Extraction',
    description: 'Extract RAG and knowledge base integration logic into dedicated modules',
    sourceSystem: 'local',
    targetSystem: 'scorpion_cloud',
    tasks: [
      {
        kind: 'file_split',
        name: 'Extract RAG Resolution',
        description: 'Move RAG/knowledge resolution logic to helpers/resolveKnowledgeForQuery.ts',
        details: {
          sourceFile: 'app/api/chat/stream/processStreamStart.ts',
          targetFiles: [
            {
              path: 'app/api/chat/stream/helpers/resolveKnowledgeForQuery.ts',
              description: 'RAG and knowledge base query resolution',
            },
          ],
        },
      },
    ],
    config: {
      priority: 'medium',
      estimatedTime: '2-3 hours',
    },
  });

  console.log(`✅ Created: RAG/Knowledge Integration Extraction (${ragIntegrationJobId})`);

  // 3. TypeScript Hygiene Pass
  const tsHygieneJobId = await service.createJob({
    name: 'TypeScript Hygiene v1',
    description: 'Fix remaining TypeScript warnings and strict mode issues across the codebase',
    sourceSystem: 'local',
    targetSystem: 'scorpion_cloud',
    tasks: [
      {
        kind: 'code_refactor',
        name: 'Fix TypeScript Strict Mode Issues',
        description: 'Address null/undefined checks, unused variables, and type safety improvements',
        details: {
          targetFiles: [
            'packages/shared-config/src/env.ts',
            'lib/**/*.ts',
            'app/**/*.ts',
          ],
          focusAreas: [
            'Null/undefined safety',
            'Unused imports/variables',
            'Type narrowing',
            'Index signature access',
          ],
        },
      },
    ],
    config: {
      priority: 'low',
      estimatedTime: '4-6 hours',
    },
  });

  console.log(`✅ Created: TypeScript Hygiene v1 (${tsHygieneJobId})\n`);

  console.log('All planned migration jobs created successfully!');
  console.log('\nView them at: /admin/ops (Migrations tab)');
}

createPlannedMigrations().catch((error) => {
  console.error('Failed to create migration jobs:', error);
  process.exit(1);
});

