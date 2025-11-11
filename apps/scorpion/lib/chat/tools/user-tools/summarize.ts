import { z } from 'zod';

export const name = 'user.summarize';
export const label = 'Document Summarizer';
export const description = 'Summarize notes, docs, or project pages into bullet points and action items';

export const schema = z.object({
  content: z.string().optional(),
  file: z.string().optional(),
  includeActions: z.boolean().default(true),
  includeTimeline: z.boolean().default(false),
  format: z.enum(['bullet', 'structured', 'timeline']).default('bullet'),
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    const { runModelUnified } = await import('@/lib/chat/modelRunner');
    
    const prompt = `Summarize the following content into clear bullet points${args.includeActions ? ' and extract action items' : ''}${args.includeTimeline ? ' with a timeline' : ''}:\n\n${args.content || 'No content provided'}`;
    
    const response = await runModelUnified({
      messages: [
        { role: 'system', content: 'You are a document summarizer. Extract key points, action items, and timelines.' },
        { role: 'user', content: prompt },
      ],
      provider: 'ollama',
      model: 'qwen2.5-coder',
    });
    
    return {
      ok: true,
      summary: response.content,
      format: args.format,
      message: 'Document summarized successfully',
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message,
    };
  }
}

