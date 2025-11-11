import { z } from 'zod';

export const name = 'user.marketing';
export const label = 'Marketing Copywriter';
export const description = 'Create high-conversion marketing copy with A/B variants';

export const schema = z.object({
  productBrief: z.string().min(1),
  type: z.enum(['ad', 'product-description', 'email-sequence']).default('ad'),
  variants: z.number().min(1).max(5).default(2),
  tone: z.enum(['professional', 'casual', 'urgent', 'friendly']).default('professional'),
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    const { runModelUnified } = await import('@/lib/chat/modelRunner');
    
    const prompt = `Create ${args.variants} variants of ${args.type} copy based on this product brief: "${args.productBrief}". Use a ${args.tone} tone. Make it persuasive and conversion-focused.`;
    
    const response = await runModelUnified({
      messages: [
        { role: 'system', content: 'You are a marketing copywriter. Create persuasive, conversion-focused copy with multiple variants.' },
        { role: 'user', content: prompt },
      ],
      provider: 'ollama',
      model: 'qwen2.5-coder',
    });
    
    return {
      ok: true,
      variants: [],
      copy: response.content,
      tone: args.tone,
      message: `${args.variants} variants generated successfully`,
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message,
    };
  }
}

