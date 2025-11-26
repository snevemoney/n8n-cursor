import { z } from 'zod';

export const name = 'user.translate';
export const label = 'Translation Tool';
export const description = 'Translate text or documents between multiple languages with auto-detection';

export const schema = z.object({
  text: z.string().optional(),
  file: z.string().optional(), // Base64 encoded file or file path
  sourceLang: z.string().optional(), // Auto-detect if not provided
  targetLang: z.string().min(1).default('en'), // Default to English
  fileType: z.enum(['text', 'pdf', 'docx', 'txt']).optional(),
}).refine(data => data.text || data.file, {
  message: "Either 'text' or 'file' must be provided.",
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    const { runModelUnified } = await import('@/lib/chat/modelRunner');
    
    // Get text content (for now, only text is supported - file handling can be added later)
    const textToTranslate = args.text || '';
    if (!textToTranslate) {
      return {
        ok: false,
        error: 'Text content is required for translation',
      };
    }
    
    // Build translation prompt
    let translationPrompt: string;
    if (args.sourceLang) {
      translationPrompt = `Translate the following text from ${args.sourceLang} to ${args.targetLang}. Provide only the translated text without any explanations or additional text:\n\n${textToTranslate}`;
    } else {
      // Auto-detect language
      translationPrompt = `Detect the language of the following text, then translate it to ${args.targetLang}. First, identify the source language, then provide the translation. Format your response as:\n\nSource Language: [detected language]\nTranslation: [translated text]\n\nText to translate:\n\n${textToTranslate}`;
    }
    
    const systemPrompt = 'You are a professional translator. Provide accurate translations that preserve the meaning, tone, and style of the original text.';
    
    const response = await runModelUnified(
      systemPrompt,
      translationPrompt,
      {
        provider: 'ollama',
        model: 'scorpion:latest', // Use available model
        temperature: 0.3, // Lower temperature for more consistent translations
      }
    );
    
    // Parse response to extract source language and translation
    let sourceLang = args.sourceLang || 'auto-detected';
    let translated = response;
    
    if (!args.sourceLang) {
      // Try to extract source language from response
      const sourceLangMatch = response.match(/Source Language:\s*(.+)/i);
      if (sourceLangMatch) {
        sourceLang = sourceLangMatch[1].trim();
      }
      
      // Extract translation (everything after "Translation:")
      const translationMatch = response.match(/Translation:\s*([\s\S]+)/i);
      if (translationMatch) {
        translated = translationMatch[1].trim();
      }
    }
    
    return {
      ok: true,
      translated: translated,
      sourceLang: sourceLang,
      targetLang: args.targetLang,
      original: textToTranslate,
      message: 'Translation completed',
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message,
    };
  }
}

