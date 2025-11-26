export type Preflight = {
  plannerReady: boolean;
  ollamaOk: boolean;
  openaiOk: boolean;
  missing: string[];
};

export async function runPreflight(): Promise<Preflight> {
  const missing: string[] = [];
  let openaiOk = !!process.env.OPENAI_API_KEY;
  let ollamaOk = false;

  try {
    const res = await fetch('http://localhost:11434/api/tags', { method: 'GET' });
    ollamaOk = res.ok;
  } catch { /* noop */ }

  if (!openaiOk && !ollamaOk) missing.push('No LLM backend available');

  return {
    plannerReady: openaiOk || ollamaOk,
    ollamaOk,
    openaiOk,
    missing
  };
}

