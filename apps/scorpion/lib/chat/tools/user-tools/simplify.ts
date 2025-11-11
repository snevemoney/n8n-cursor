import { z } from 'zod';

export const name = 'user.simplify';
export const label = 'Text Simplifier';
export const description = 'Rewrite complex text into clearer versions at different reading levels';

export const schema = z.object({
  text: z.string().min(1),
  level: z.enum(['middle-school', 'high-school', 'professional']).default('professional'),
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    const { runModelUnified } = await import('@/lib/chat/modelRunner');
    
    const levelDesc = args.level === 'middle-school' ? 'middle school level' 
      : args.level === 'high-school' ? 'high school level'
      : 'professional level';
    
    const prompt = `Rewrite the following text at ${levelDesc} reading level. Highlight what was simplified and why:\n\n${args.text}`;
    
    const response = await runModelUnified({
      messages: [
        { role: 'system', content: 'You are a text simplifier. Rewrite text at the requested reading level and explain changes.' },
        { role: 'user', content: prompt },
      ],
      provider: 'ollama',
      model: 'qwen2.5-coder',
    });
    
    return {
      ok: true,
      original: args.text,
      simplified: response.content,
      level: args.level,
      changes: [], // TODO: Extract changes from response
      message: 'Text simplified successfully',
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message,
    };
  }
}

