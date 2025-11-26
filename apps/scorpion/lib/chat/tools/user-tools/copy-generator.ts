import { z } from 'zod';

export const name = 'user.copy';
export const label = 'Copy Generator';
export const description = 'Generate ad, product, and email copy variations';

export const schema = z.object({
  offer: z.string().min(1),
  targetAudience: z.string().optional(),
  type: z.enum(['headline', 'tagline', 'product-blurb', 'email-intro']).default('headline'),
  variations: z.number().min(1).max(10).default(3),
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    const { runModelUnified } = await import('@/lib/chat/modelRunner');
    
    const prompt = `Generate ${args.variations} variations of ${args.type} copy for this offer: "${args.offer}"${args.targetAudience ? ` targeting ${args.targetAudience}` : ''}.`;
    
    const response = await runModelUnified({
      messages: [
        { role: 'system', content: 'You are a copywriter. Generate multiple compelling variations of copy.' },
        { role: 'user', content: prompt },
      ],
      provider: 'ollama',
      model: 'qwen2.5-coder',
    });
    
    return {
      ok: true,
      variations: [],
      copy: response.content,
      type: args.type,
      message: `${args.variations} ${args.type} variations generated`,
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message,
    };
  }
}

