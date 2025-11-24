import { z } from 'zod';
import { createWorker } from 'tesseract.js';

export const name = 'ocr.extract';
export const label = 'Extract Text from Image (OCR)';
export const description = 'Perform OCR (Optical Character Recognition) on an image to extract text. Use this when you need to read text from JPEG, PNG, or other image files.';

export const schema = z.object({
  imageId: z.string().optional().describe('ID of the image in the knowledge base to extract text from'),
  imageUrl: z.string().optional().describe('URL or data URL of the image to extract text from'),
  imageData: z.string().optional().describe('Base64 encoded image data'),
  language: z.string().default('eng').describe('Language for OCR (e.g., "eng", "fra", "spa")'),
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    let imageBuffer: Buffer | null = null;
    
    // Get image data from various sources
    if (args.imageId) {
      // Fetch from knowledge base
      const { getRAGStore } = await import('@/lib/shared-stores');
      const store = await getRAGStore();
      const allKnowledge = store.getAllKnowledge();
      const imageKnowledge = allKnowledge.find(k => k.id === args.imageId && k.category === 'media');
      
      if (!imageKnowledge) {
        return {
          ok: false,
          error: `Image with ID ${args.imageId} not found in knowledge base`,
          text: '',
        };
      }
      
      // Extract image data from contentUrl (data URL)
      if (imageKnowledge.contentUrl && imageKnowledge.contentUrl.startsWith('data:')) {
        const base64Match = imageKnowledge.contentUrl.match(/data:image\/[^;]+;base64,(.+)/);
        if (base64Match) {
          imageBuffer = Buffer.from(base64Match[1], 'base64');
        }
      }
      
      if (!imageBuffer) {
        return {
          ok: false,
          error: `Could not extract image data from knowledge base entry ${args.imageId}`,
          text: '',
        };
      }
    } else if (args.imageUrl) {
      // Fetch from URL
      if (args.imageUrl.startsWith('data:')) {
        // Data URL
        const base64Match = args.imageUrl.match(/data:image\/[^;]+;base64,(.+)/);
        if (base64Match) {
          imageBuffer = Buffer.from(base64Match[1], 'base64');
        }
      } else {
        // HTTP URL
        const response = await fetch(args.imageUrl);
        const arrayBuffer = await response.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuffer);
      }
    } else if (args.imageData) {
      // Direct base64 data
      imageBuffer = Buffer.from(args.imageData, 'base64');
    } else {
      return {
        ok: false,
        error: 'Must provide either imageId, imageUrl, or imageData',
        text: '',
      };
    }
    
    if (!imageBuffer) {
      return {
        ok: false,
        error: 'Failed to load image data',
        text: '',
      };
    }
    
    // Perform OCR
    console.log(`🔍 Performing OCR on image (language: ${args.language})...`);
    const worker = await createWorker(args.language);
    const { data: { text, confidence } } = await worker.recognize(imageBuffer);
    await worker.terminate();
    
    const extractedText = text.trim();
    
    if (extractedText.length > 0) {
      console.log(`✅ OCR extracted ${extractedText.length} characters (confidence: ${confidence.toFixed(1)}%)`);
      return {
        ok: true,
        text: extractedText,
        confidence: confidence,
        characterCount: extractedText.length,
        imageId: args.imageId || 'unknown', // Include imageId in result
      };
    } else {
      console.log(`⚠️ OCR found no text in image`);
      return {
        ok: true,
        text: '',
        confidence: 0,
        characterCount: 0,
        imageId: args.imageId || 'unknown', // Include imageId even if no text
        warning: 'No text detected in image',
      };
    }
  } catch (error: any) {
    console.error('[ocr.extract] Error:', error);
    return {
      ok: false,
      error: error.message || 'OCR extraction failed',
      text: '',
    };
  }
}

