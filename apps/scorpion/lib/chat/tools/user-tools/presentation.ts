import { z } from 'zod';

export const name = 'user.presentation';
export const label = 'Presentation Generator';
export const description = 'Generate slide deck structure from outline or prompt';

export const schema = z.object({
  topic: z.string().min(1),
  outline: z.string().optional(),
  slides: z.number().min(1).max(50).default(10),
  includeNotes: z.boolean().default(true),
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    const { runModelUnified } = await import('@/lib/chat/modelRunner');
    
    const prompt = `Create a ${args.slides}-slide presentation about "${args.topic}"${args.outline ? ` based on this outline: ${args.outline}` : ''}. Include slide titles, bullet points, and ${args.includeNotes ? 'speaker notes' : ''}.`;
    
    const response = await runModelUnified({
      messages: [
        { role: 'system', content: 'You are a presentation generator. Create structured slide decks with titles, content, and notes.' },
        { role: 'user', content: prompt },
      ],
      provider: 'ollama',
      model: 'qwen2.5-coder',
    });
    
    return {
      ok: true,
      presentation: {
        topic: args.topic,
        slides: [],
        markdown: response.content,
        json: {}, // TODO: Parse into structured JSON
      },
      message: 'Presentation generated successfully',
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message,
    };
  }
}

