import { z } from 'zod';

export const name = 'user.design';
export const label = 'Design Helper';
export const description = 'Generate layout ideas, copy, and design specs for social posts and banners';

export const schema = z.object({
  type: z.enum(['social-post', 'banner', 'slide-cover']).default('social-post'),
  topic: z.string().min(1),
  style: z.string().optional(),
  dimensions: z.object({ width: z.number(), height: z.number() }).optional(),
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    const { runModelUnified } = await import('@/lib/chat/modelRunner');
    
    const prompt = `Generate design ideas for a ${args.type} about "${args.topic}". Include layout suggestions, copy, fonts, colors, and spacing recommendations.`;
    
    const response = await runModelUnified({
      messages: [
        { role: 'system', content: 'You are a design assistant. Provide creative design suggestions with specific recommendations.' },
        { role: 'user', content: prompt },
      ],
      provider: 'ollama',
      model: 'qwen2.5-coder',
    });
    
    return {
      ok: true,
      design: {
        type: args.type,
        topic: args.topic,
        suggestions: response.content,
        fonts: [],
        colors: [],
        spacing: {},
      },
      message: 'Design suggestions generated',
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message,
    };
  }
}

