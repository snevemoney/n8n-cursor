import { z } from 'zod';
import { getOpenAIService, isOpenAIAvailable } from '@scorpion/core/llm';

export const name = 'user.image';
export const label = 'Image Generator';
export const description = 'Generate images from text prompts with style and aspect ratio controls';

export const schema = z.object({
  prompt: z.string().min(1),
  style: z.enum(['realistic', 'illustration', 'logo', 'poster', 'social-post']).default('realistic'),
  aspectRatio: z.enum(['1:1', '16:9', '9:16', '4:3', '3:4']).default('1:1'),
  useCase: z.enum(['logo', 'poster', 'social-post', 'general']).default('general'),
});

// Map aspect ratios to DALL-E sizes
const aspectRatioToSize: Record<string, '1024x1024' | '1792x1024' | '1024x1792'> = {
  '1:1': '1024x1024',
  '16:9': '1792x1024',
  '9:16': '1024x1792',
  '4:3': '1792x1024',
  '3:4': '1024x1792',
};

// Map styles to DALL-E styles
const styleToDALLE: Record<string, 'vivid' | 'natural'> = {
  realistic: 'natural',
  illustration: 'vivid',
  logo: 'vivid',
  poster: 'vivid',
  'social-post': 'vivid',
};

export async function handler(args: z.infer<typeof schema>) {
  try {
    // Check if OpenAI is available (hybrid approach)
    if (!isOpenAIAvailable()) {
      return {
        ok: false,
        error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.',
        message: 'OpenAI DALL-E API is required for image generation.',
      };
    }

    const openai = getOpenAIService();

    // Enhance prompt based on style and use case
    let enhancedPrompt = args.prompt;
    
    const stylePrompts: Record<string, string> = {
      realistic: 'photorealistic, high quality, detailed',
      illustration: 'illustration style, artistic, colorful',
      logo: 'minimalist logo design, clean, professional',
      poster: 'poster design, eye-catching, bold typography',
      'social-post': 'social media post design, engaging, modern',
    };

    if (stylePrompts[args.style]) {
      enhancedPrompt = `${enhancedPrompt}, ${stylePrompts[args.style]}`;
    }

    // Generate image using DALL-E 3
    const imageResponse = await openai.createImage({
      prompt: enhancedPrompt,
      model: 'dall-e-3',
      size: aspectRatioToSize[args.aspectRatio] || '1024x1024',
      quality: args.useCase === 'logo' ? 'standard' : 'hd',
      style: styleToDALLE[args.style] || 'natural',
      response_format: 'b64_json', // Get base64 for embedding
      n: 1,
    });

    const imageData = imageResponse.data[0];
    
    if (!imageData) {
      throw new Error('No image generated');
    }

    return {
      ok: true,
      prompt: args.prompt,
      enhancedPrompt: imageData.revised_prompt || enhancedPrompt,
      style: args.style,
      aspectRatio: args.aspectRatio,
      imageUrl: imageData.url || null,
      base64: imageData.b64_json || null,
      message: 'Image generated successfully.',
      metadata: {
        model: 'dall-e-3',
        size: aspectRatioToSize[args.aspectRatio] || '1024x1024',
        quality: args.useCase === 'logo' ? 'standard' : 'hd',
        style: styleToDALLE[args.style] || 'natural',
      },
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message,
    };
  }
}

