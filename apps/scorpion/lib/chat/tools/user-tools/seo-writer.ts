import { z } from 'zod';

export const name = 'user.seo';
export const label = 'SEO Content Writer';
export const description = 'Generate SEO-optimized articles and landing page copy';

export const schema = z.object({
  topic: z.string().min(1),
  keywords: z.array(z.string()).default([]), // Will be extracted from topic if not provided
  type: z.enum(['article', 'landing-page']).default('article'),
  length: z.enum(['short', 'medium', 'long']).default('medium'),
}).transform((data) => {
  // If keywords not provided, extract from topic
  if (data.keywords.length === 0 && data.topic) {
    // Simple keyword extraction: use topic words as keywords
    data.keywords = data.topic.split(/\s+/).filter(w => w.length > 3).slice(0, 5);
  }
  return data;
}).refine(data => data.keywords.length > 0, {
  message: "Keywords array must contain at least one keyword.",
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    const { runModelUnified } = await import('@/lib/chat/modelRunner');
    
    const prompt = `Write SEO-optimized ${args.type} content about "${args.topic}" using keywords: ${args.keywords.join(', ')}. Include headings, meta description, and internal link suggestions. Target ${args.length} length.`;
    
    const response = await runModelUnified({
      messages: [
        { role: 'system', content: 'You are an SEO content writer. Create optimized content with proper structure and keyword usage.' },
        { role: 'user', content: prompt },
      ],
      provider: 'ollama',
      model: 'qwen2.5-coder',
    });
    
    return {
      ok: true,
      content: response.content,
      metaDescription: '',
      headings: [],
      internalLinks: [],
      message: 'SEO content generated successfully',
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message,
    };
  }
}

