import { ScratchpadEntry } from '../types/tooling';
import { KnowledgeHit } from '../types/events';

export type SummarizerContext = {
  conversationId: string;
  messages: Array<{ role:'user'|'assistant'|'system'; content:string }>;
  sources: KnowledgeHit[]; // <— inject here
};

export function buildSummarizerContext(
  conversationId: string,
  history: SummarizerContext['messages'],
  scratchpadEntries: ScratchpadEntry[],
): SummarizerContext {
  // collect sources from any research.run results
  const sources: KnowledgeHit[] = [];

  for (const e of scratchpadEntries) {
    if (e.tool === 'research.run' && e.result.ok) {
      const arr = (e.result.data?.sources ?? []) as KnowledgeHit[];
      for (const s of arr) sources.push(s);
    }
  }

  return { conversationId, messages: history, sources };
}

