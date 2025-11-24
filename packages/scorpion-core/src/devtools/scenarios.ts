/**
 * Test scenario for tool matrix
 */
export interface Scenario {
  id: string;
  label: string;
  plannerPrompt: string;
  intentHint?: string;
  forcedSteps?: Array<{ tool: string; args: any }>;
  expectTools: string[];
  gatedByEnv?: string;
}

/**
 * Get all test scenarios
 */
export function getScenarios(): Scenario[] {
  return [
    {
      id: 'latest-news',
      label: 'Latest news (Bitcoin/global)',
      plannerPrompt: "What's the latest news today? Summarize key stories.",
      expectTools: ['research.run'],
      forcedSteps: [
        {
          tool: 'research.run',
          args: {
            query: 'latest technology and bitcoin news past 24h',
            depth: 'medium',
            maxSites: 5,
          },
        },
      ],
    },
    {
      id: 'explain-workflow',
      label: 'Explain my ElevenLabs workflow on n8ncloud.tech',
      plannerPrompt: 'Explain my ElevenLabs workflow on n8ncloud.tech like I\'m new.',
      expectTools: ['workflows.list', 'workflows.get', 'project.analyze'],
      forcedSteps: [
        {
          tool: 'workflows.list',
          args: { activeOnly: false },
        },
        {
          tool: 'workflows.get',
          args: { workflowId: 'elevenlabs' },
        },
      ],
    },
    {
      id: 'pull-file-rag',
      label: 'Pull my last uploaded file and add it to RAG',
      plannerPrompt: 'Pull my last uploaded file and add it to RAG',
      expectTools: ['files.recent', 'knowledge.get', 'ocr.extract', 'knowledge.list'],
      forcedSteps: [
        {
          tool: 'files.recent',
          args: { limit: 5 },
        },
        {
          tool: 'knowledge.list',
          args: { limit: 10 },
        },
      ],
    },
    {
      id: 'list-side-hustles',
      label: 'List all my side-hustles',
      plannerPrompt: 'List all my side-hustles',
      expectTools: ['ontology.search', 'knowledge.list'],
      forcedSteps: [
        {
          tool: 'ontology.search',
          args: { query: 'side-hustle' },
        },
      ],
    },
    {
      id: 'system-health',
      label: 'How healthy is the system right now?',
      plannerPrompt: 'How healthy is the system right now?',
      expectTools: ['system.health', 'project.status', 'stats.get'],
      forcedSteps: [
        {
          tool: 'system.health',
          args: {},
        },
        {
          tool: 'project.status',
          args: {},
        },
        {
          tool: 'stats.get',
          args: {},
        },
      ],
    },
    {
      id: 'recent-operations',
      label: 'Show me recent operations',
      plannerPrompt: 'Show me recent operations',
      expectTools: ['operations.list'],
      forcedSteps: [
        {
          tool: 'operations.list',
          args: { limit: 20 },
        },
      ],
    },
    {
      id: 'skim-orchestrator',
      label: 'Skim the orchestrator route',
      plannerPrompt: 'Skim the orchestrator route',
      expectTools: ['code.readFile'],
      forcedSteps: [
        {
          tool: 'code.readFile',
          args: {
            path: 'apps/scorpion/app/api/chat/stream/route.ts',
            maxLines: 400,
          },
        },
      ],
    },
    {
      id: 'project-overview',
      label: 'High-level project overview',
      plannerPrompt: 'Give me a high-level project overview',
      expectTools: ['project.analyze'],
      forcedSteps: [
        {
          tool: 'project.analyze',
          args: { scope: 'apps/scorpion' },
        },
      ],
    },
    {
      id: 'check-logs',
      label: 'Check recent API logs',
      plannerPrompt: 'Check recent API logs',
      expectTools: ['logs.tail'],
      forcedSteps: [
        {
          tool: 'logs.tail',
          args: { service: 'api', lines: 50 },
        },
      ],
    },
    {
      id: 'list-agents',
      label: 'List my agents and inspect one',
      plannerPrompt: 'List my agents and inspect one',
      expectTools: ['agents.list', 'agents.get'],
      forcedSteps: [
        {
          tool: 'agents.list',
          args: {},
        },
        {
          tool: 'agents.get',
          args: { agentId: 'council' },
        },
      ],
    },
    {
      id: 'deploy-agent',
      label: 'Try deploying a sample agent (dry run)',
      plannerPrompt: 'Try deploying a sample agent in dry run mode',
      expectTools: ['agent.deploy'],
      gatedByEnv: 'ALLOW_DEPLOY_TESTS',
      forcedSteps: [
        {
          tool: 'agent.deploy',
          args: {
            agentId: 'sample',
            config: { dryRun: true },
          },
        },
      ],
    },
    {
      id: 'notify-diagnostics',
      label: 'Notify me that diagnostics ran',
      plannerPrompt: 'Notify me that diagnostics ran',
      expectTools: ['notifications.post', 'notifications.list'],
      forcedSteps: [
        {
          tool: 'notifications.post',
          args: {
            message: 'Tool Matrix completed',
            level: 'info',
          },
        },
        {
          tool: 'notifications.list',
          args: { limit: 10 },
        },
      ],
    },
    {
      id: 'list-knowledge',
      label: 'List knowledge items',
      plannerPrompt: 'List knowledge items',
      expectTools: ['knowledge.list'],
      forcedSteps: [
        {
          tool: 'knowledge.list',
          args: { limit: 10 },
        },
      ],
    },
    {
      id: 'settings-snapshot',
      label: 'Settings snapshot',
      plannerPrompt: 'Show me current settings',
      expectTools: ['settings.get'],
      forcedSteps: [
        {
          tool: 'settings.get',
          args: {},
        },
      ],
    },
    {
      id: 'compare-models',
      label: 'Compare LLM models (safe)',
      plannerPrompt: 'Compare LLM models',
      expectTools: ['llm.models.compare'],
      forcedSteps: [
        {
          tool: 'llm.models.compare',
          args: { modelIds: [] },
        },
      ],
    },
    {
      id: 'list-experiments',
      label: 'List LLM experiments',
      plannerPrompt: 'List LLM experiments',
      expectTools: ['llm.experiments.list'],
      forcedSteps: [
        {
          tool: 'llm.experiments.list',
          args: { limit: 10 },
        },
      ],
    },
    {
      id: 'evaluate-prompt',
      label: 'Evaluate a tiny prompt (if enabled)',
      plannerPrompt: 'Evaluate a tiny prompt',
      expectTools: ['llm.evaluate'],
      gatedByEnv: 'ALLOW_LLM_EVAL',
      forcedSteps: [
        {
          tool: 'llm.evaluate',
          args: {
            config: {
              task: 'tiny-smoke',
              dataset: ['2+2=4'],
            },
          },
        },
      ],
    },
    {
      id: 'start-research',
      label: 'Start a research job',
      plannerPrompt: 'Start a research job about impact of halving on bitcoin fees',
      expectTools: ['research.start'],
      forcedSteps: [
        {
          tool: 'research.start',
          args: {
            query: 'impact of halving on bitcoin fees',
            depth: 1,
            maxSites: 3,
          },
        },
      ],
    },
    {
      id: 'trigger-workflow',
      label: 'Trigger a workflow (if exists)',
      plannerPrompt: 'Trigger a workflow',
      expectTools: ['workflows.trigger'],
      forcedSteps: [
        {
          tool: 'workflows.trigger',
          args: {
            workflowId: 'hello-world',
            payload: { ping: true },
          },
        },
      ],
    },
    {
      id: 'backup-create',
      label: 'Backup (destructive, gated)',
      plannerPrompt: 'Create a backup',
      expectTools: ['backup.create'],
      gatedByEnv: 'ALLOW_DESTRUCTIVE_TESTS',
      forcedSteps: [
        {
          tool: 'backup.create',
          args: {
            name: 'tool-matrix-smoke',
          },
        },
      ],
    },
    {
      id: 'kb-search-side-hustles',
      label: 'What docs mention my side-hustles?',
      plannerPrompt: 'Find docs that mention my side-hustles and summarize.',
      expectTools: ['kb.search'],
      forcedSteps: [
        {
          tool: 'kb.search',
          args: { query: 'side-hustle OR "side hustle"' },
        },
      ],
    },
    {
      id: 'kb-read-one',
      label: 'Open the top knowledge item',
      plannerPrompt: 'Open the most relevant knowledge item you just found.',
      expectTools: ['knowledge.list', 'knowledge.get'],
      forcedSteps: [
        {
          tool: 'knowledge.list',
          args: { limit: 5 },
        },
        {
          tool: 'knowledge.get',
          args: { id: 'placeholder-kb-id' }, // Runner should substitute first item ID
        },
      ],
    },
    {
      id: 'image-ocr',
      label: 'Read text from my last image',
      plannerPrompt: 'What does my last uploaded image say?',
      expectTools: ['files.recent', 'ocr.extract'],
      forcedSteps: [
        {
          tool: 'files.recent',
          args: { limit: 10 },
        },
        {
          tool: 'ocr.extract',
          args: { imageId: 'placeholder-image-id' }, // Runner should substitute if image found
        },
      ],
    },
    {
      id: 'llm-train-smoke',
      label: 'Run a tiny training smoke test',
      plannerPrompt: 'Do a tiny safe training run to verify the trainer.',
      expectTools: ['llm.train'],
      gatedByEnv: 'ALLOW_LLM_TRAIN',
      forcedSteps: [
        {
          tool: 'llm.train',
          args: {
            config: {
              dataset: ['Hello => Hi'],
              steps: 1,
              dryRun: true,
            },
          },
        },
      ],
    },
  ];
}

