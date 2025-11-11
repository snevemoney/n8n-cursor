import { z } from 'zod';

export const name = 'user.grammar';
export const label = 'Grammar Checker';
export const description = 'Check grammar, spelling, style, and tone with inline corrections';

export const schema = z.object({
  text: z.string().min(1),
  checkStyle: z.boolean().default(true),
  checkTone: z.boolean().default(true),
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    const { runModelUnified } = await import('@/lib/chat/modelRunner');
    
    const prompt = `Check the following text for grammar, spelling, style, and tone errors. Provide inline corrections with explanations:\n\n${args.text}`;
    
    const response = await runModelUnified({
      messages: [
        { role: 'system', content: 'You are a grammar and style checker. Provide corrections with explanations.' },
        { role: 'user', content: prompt },
      ],
      provider: 'ollama',
      model: 'qwen2.5-coder',
    });
    
    return {
      ok: true,
      original: args.text,
      corrected: response.content,
      suggestions: [], // TODO: Parse suggestions from response
      message: 'Grammar check completed',
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message,
    };
  }
}

