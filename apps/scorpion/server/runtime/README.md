# Scorpion Runtime Layer

This module implements a Job-based runtime layer for Scorpion, enabling:
- **Job Model**: Everything Scorpion does becomes a trackable Job
- **Cooperative Scheduler**: Jobs run in small steps (fiber-like) without blocking
- **Agent & Session Model**: Persistent agent instances and conversation sessions
- **Mission Control**: UI to monitor and debug running jobs

## Architecture

### Core Components

1. **Job Types** (`jobTypes.ts`)
   - `JobStatus`: pending | running | paused | completed | failed
   - `JobType`: chat | research | n8n_import | rag_update | maintenance
   - `JobPhase`: PLAN | COUNCIL | TOOL_SELECT | KNOWLEDGE | USER_TOOLS | EXECUTE
   - `Job`: Complete job interface with context and logs

2. **Job Store** (`jobStore.ts`)
   - In-memory Map-based store (can be swapped with DB later)
   - Functions: `createJob`, `getJob`, `updateJob`, `appendJobLog`, `listJobs`

3. **Job Runner** (`jobRunner.ts`)
   - `runJobTick(jobId)`: Advances a job one step
   - `runJobUntilComplete(jobId, options)`: Runs job with time budget
   - Cooperative execution: each tick yields control

4. **Phase Adapters** (`../orchestrator/jobPhases.ts`)
   - `runPlanPhaseStep(job)`: Generate execution plan
   - `runCouncilPhaseStep(job)`: Expert review
   - `runToolSelectPhaseStep(job)`: Select tools
   - `runKnowledgePhaseStep(job)`: Search knowledge base
   - `runUserToolsPhaseStep(job)`: Enumerate user tools
   - `runExecutePhaseStep(job)`: Execute tools (multi-step example)

5. **Agent & Session** (`agentTypes.ts`, `agentStore.ts`)
   - `AgentInstance`: Persistent AI agent with tools and memory
   - `Session`: Conversation/mission linked to an agent
   - Functions: `createAgent`, `getOrCreateDefaultAgent`, `createSession`, etc.

6. **Chat Integration** (`chatIntegration.ts`)
   - Helpers to integrate Jobs with existing chat flow
   - `createChatJob()`, `logJobPhase()`, `completeChatJob()`, etc.

## Usage

### Creating a Job

```typescript
import { createJob } from '@/server/runtime/jobStore';

const job = createJob('chat', {
  sessionId: 'session-123',
  agentId: 'agent-456',
  input: 'What is Scorpion?',
});
```

### Running a Job

```typescript
import { runJobTick, runJobUntilComplete } from '@/server/runtime/jobRunner';

// Run one step
const updated = await runJobTick(job.id);

// Run until complete (with time budget)
const completed = await runJobUntilComplete(job.id, {
  maxTicks: 100,
  timeBudgetMs: 5000,
  onTick: (job) => {
    console.log(`Phase: ${job.currentPhase}, Step: ${job.phaseStep}`);
  },
});
```

### Integrating with Chat

```typescript
import { createChatJob, logJobPhase, completeChatJob } from '@/server/runtime/chatIntegration';

// At start of chat request
const job = createChatJob(conversationId, userMessage, messages);

// During processing
logJobPhase(job.id, 'PLAN', 'Generating plan...');
// ... run your existing orchestrator ...

// At end
completeChatJob(job.id, finalAnswer);
```

### Viewing Jobs

Access the Mission Control UI at `/system/jobs` to see:
- All active jobs
- Job status, phase, and step
- Full context and logs
- Real-time updates (refreshes every 3 seconds)

Or use the API:

```typescript
// GET /api/dev/jobs
// Query params: ?type=chat&status=running&sessionId=xxx
const response = await fetch('/api/dev/jobs?status=running');
const { jobs, stats } = await response.json();
```

## Phase Execution Model

Each phase can be:
1. **All in one shot** (current implementation)
   - Phase runs completely and returns `{ done: true }`
   - Simple and safe, doesn't break existing behavior

2. **Multi-step** (future enhancement)
   - Phase uses `job.phaseStep` to track internal progress
   - Returns `{ done: false }` to continue, `{ done: true }` when complete
   - Example: `runExecutePhaseStep` already demonstrates this pattern

## Migration Path

The runtime layer is designed to be **non-breaking**:

1. **Phase 1** (Current): Integration helpers
   - Use `createChatJob()` at start of chat
   - Use `logJobPhase()` to track progress
   - Existing orchestrator continues to work unchanged

2. **Phase 2** (Future): Gradual migration
   - Replace one phase at a time with job runner
   - Test each phase independently
   - Keep fallback to existing orchestrator

3. **Phase 3** (Future): Full runtime
   - All phases go through job runner
   - Jobs can be paused/resumed
   - Background jobs for long-running tasks

## Next Steps

1. **Refine Phase Adapters**: Make them call actual orchestrator functions
2. **Add DB Persistence**: Swap in-memory store with Supabase/Postgres
3. **Multi-step Phases**: Break down PLAN and EXECUTE into smaller steps
4. **Background Jobs**: Use for n8n imports, RAG updates, research tasks
5. **Evaluation Harness**: Use Jobs to track test scenarios
6. **Tool Policy Layer**: Add capability/safety metadata to tools

## Files

- `jobTypes.ts` - Core type definitions
- `jobStore.ts` - In-memory job storage
- `jobRunner.ts` - Cooperative scheduler
- `agentTypes.ts` - Agent and Session types
- `agentStore.ts` - Agent and Session storage
- `chatIntegration.ts` - Chat flow integration helpers
- `../orchestrator/jobPhases.ts` - Phase adapter functions
- `../../app/api/dev/jobs/route.ts` - API endpoint
- `../../app/(scorpion)/system/jobs/page.tsx` - Mission Control UI

