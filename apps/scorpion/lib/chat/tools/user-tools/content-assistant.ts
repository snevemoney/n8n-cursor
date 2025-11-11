import { z } from 'zod';

export const name = 'user.content';
export const label = 'Content Assistant';
export const description = 'AI assistant for answering questions, drafting content, debugging code, and explaining concepts';

export const schema = z.object({
  query: z.string().min(1),
  mode: z.enum(['fast', 'detailed', 'expert']).default('detailed'),
  context: z.string().optional(),
  type: z.enum(['question', 'draft', 'debug', 'explain']).default('question'),
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    // Use existing chat API or model runner
    const { runModelUnified } = await import('@/lib/chat/modelRunner');
    
    const systemPrompt = args.mode === 'fast' 
      ? 'Provide a concise, quick answer.'
      : args.mode === 'detailed'
      ? 'Provide a detailed explanation with examples.'
      : 'Provide an expert-level analysis with deep insights.';
    
    const prompt = args.context 
      ? `Context: ${args.context}\n\n${args.query}`
      : args.query;
    
    const response = await runModelUnified({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      provider: 'ollama', // Use default provider
      model: 'qwen2.5-coder', // Use default model
    });
    
    return {
      ok: true,
      response: response.content,
      mode: args.mode,
      message: 'Content generated successfully',
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message,
    };
  }
}

