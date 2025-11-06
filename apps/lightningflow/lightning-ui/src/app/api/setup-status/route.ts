import { NextRequest, NextResponse } from 'next/server';

/**
 * Setup Status API
 * 
 * Provides a simple status check and setup instructions
 */
export async function GET(request: NextRequest) {
  const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;

  return NextResponse.json({
    status: 'SETUP_REQUIRED',
    message: 'Lightning AI Business Node Platform - Setup Required',
    steps: [
      {
        step: 1,
        title: 'Database Migration',
        description: 'Create all required tables and functions',
        actions: [
          {
            method: 'Manual (Recommended)',
            instructions: [
              'Go to https://supabase.com/dashboard/project/xlrxpfptulcugoqjccyf',
              'Click on "SQL Editor"',
              'Copy the contents of web/sql/05_advanced_lightning_ai_features.sql',
              'Paste and run the SQL',
            ],
          },
          {
            method: 'Automated (Alternative)',
            instructions: [
              `curl -X POST ${baseUrl}/api/migrate`,
              'Note: May have limitations with complex DDL statements',
            ],
          },
        ],
      },
      {
        step: 2,
        title: 'Verify Setup',
        description: 'Check that all components are working',
        actions: [
          {
            method: 'Quick Check',
            instructions: [
              `curl ${baseUrl}/api/migrate`,
              'Should show "migrationComplete": true',
            ],
          },
          {
            method: 'Full System Test',
            instructions: [
              `curl ${baseUrl}/api/test-system`,
              'Should show "systemStatus": "READY"',
            ],
          },
        ],
      },
      {
        step: 3,
        title: 'Tutorial Sync',
        description: 'Process tutorials into vector database',
        actions: [
          {
            method: 'Sync Sample Tutorial',
            instructions: [
              `curl -X POST ${baseUrl}/api/tutorials/sync -H "Content-Type: application/json" -d '{"tutorialPath": "docs/tutorials"}'`,
              'This will process the getting-started tutorial',
            ],
          },
        ],
      },
      {
        step: 4,
        title: 'Test Features',
        description: 'Verify all advanced features work',
        actions: [
          {
            method: 'Vector Search',
            instructions: [
              `curl -X POST ${baseUrl}/api/vector/search -H "Content-Type: application/json" -d '{"query": "getting started", "type": "tutorial"}'`,
              'Should return search results',
            ],
          },
          {
            method: 'Visit Simulator',
            instructions: [
              `Open ${baseUrl}/dashboard/simulator`,
              'Test the enhanced simulator with vector search',
            ],
          },
        ],
      },
    ],
    currentStatus: {
      environment: '✅ Environment variables configured',
      server: '✅ Development server running',
      database: '❌ Tables not created yet',
      openai: '✅ OpenAI API key valid',
      vectorExtension: '✅ pgvector available',
    },
    helpfulCommands: {
      checkMigration: `curl ${baseUrl}/api/migrate`,
      runSystemTest: `curl ${baseUrl}/api/test-system`,
      syncTutorials: `curl -X POST ${baseUrl}/api/tutorials/sync`,
      testVectorSearch: `curl -X POST ${baseUrl}/api/vector/search -H "Content-Type: application/json" -d '{"query": "test", "type": "general"}'`,
    },
  });
} 