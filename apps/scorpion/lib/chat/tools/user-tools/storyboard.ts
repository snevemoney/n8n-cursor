import { z } from 'zod';

export const name = 'user.storyboard';
export const label = 'Storyboard Creator';
export const description = 'Convert blog posts or scripts into video storyboards';

export const schema = z.object({
  content: z.string().min(1),
  type: z.enum(['blog-post', 'script']).default('blog-post'),
  includeFootage: z.boolean().default(true),
  includeText: z.boolean().default(true),
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    const { runModelUnified } = await import('@/lib/chat/modelRunner');
    
    const prompt = `Create a video storyboard from this ${args.type}:\n\n${args.content}\n\nInclude scene descriptions, ${args.includeFootage ? 'suggested stock footage types' : ''}, ${args.includeText ? 'on-screen text' : ''}, and voiceover script.`;
    
    const response = await runModelUnified({
      messages: [
        { role: 'system', content: 'You are a video storyboard creator. Create detailed storyboards with scenes, visuals, and scripts.' },
        { role: 'user', content: prompt },
      ],
      provider: 'ollama',
      model: 'qwen2.5-coder',
    });
    
    return {
      ok: true,
      storyboard: {
        scenes: [],
        markdown: response.content,
      },
      message: 'Storyboard created successfully',
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message,
    };
  }
}

