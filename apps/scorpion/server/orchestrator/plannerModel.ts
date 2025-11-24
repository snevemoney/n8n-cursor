import { runPreflight } from '../system/preflight';

export async function pickPlannerModel() {
  const pf = await runPreflight();

  if (pf.openaiOk) return { provider: 'openai', model: process.env.OPENAI_PLANNER_MODEL ?? 'gpt-4o-mini' };
  if (pf.ollamaOk) return { provider: 'ollama', model: 'llama3.1:8b' }; // ensure exists in preflight if you want

  throw new Error('Planner unavailable: no LLM backend ready');
}

