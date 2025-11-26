import { z } from 'zod';

export const name = 'user.grammar';
export const label = 'Grammar Checker';
export const description = 'Check grammar, spelling, style, and tone with inline corrections';

export const schema = z.object({
  text: z.string().min(1),
  checkStyle: z.boolean().default(true),
  checkTone: z.boolean().default(true),
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    const { runModelUnified } = await import('@/lib/chat/modelRunner');
    
    const checkTypes = [];
    if (args.checkStyle) checkTypes.push('style');
    if (args.checkTone) checkTypes.push('tone');
    
    const checkTypesText = checkTypes.length > 0 
      ? `, ${checkTypes.join(' and ')}` 
      : '';
    
    const prompt = `Check the following text for grammar, spelling${checkTypesText} errors. 

Provide your response in the following JSON format:
{
  "correctedText": "The corrected version of the text",
  "suggestions": [
    {
      "original": "text that needs correction",
      "corrected": "corrected text",
      "type": "grammar|spelling|style|tone",
      "explanation": "Brief explanation of the issue"
    }
  ]
}

Text to check:
${args.text}`;
    
    const systemPrompt = 'You are a grammar and style checker. Provide corrections with clear explanations. Always respond in valid JSON format.';
    
    const response = await runModelUnified(
      systemPrompt,
      prompt,
      {
        provider: 'ollama',
        model: 'scorpion:latest', // Use available model
        temperature: 0.2, // Lower temperature for more consistent grammar checking
      }
    );
    
    // Parse JSON from response
    let parsedResponse: any;
    try {
      // Try to parse JSON directly
      parsedResponse = JSON.parse(response.trim());
    } catch {
      // Try to extract JSON from markdown code block
      const codeBlockMatch = response.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
      if (codeBlockMatch) {
        try {
          parsedResponse = JSON.parse(codeBlockMatch[1].trim());
        } catch {
          // Fallback: extract suggestions from text
          parsedResponse = {
            correctedText: response,
            suggestions: [],
          };
        }
      } else {
        // Fallback: use response as corrected text
        parsedResponse = {
          correctedText: response,
          suggestions: [],
        };
      }
    }
    
    // Ensure suggestions array exists and is properly formatted
    const suggestions = Array.isArray(parsedResponse.suggestions) 
      ? parsedResponse.suggestions.map((s: any) => ({
          original: s.original || '',
          corrected: s.corrected || '',
          type: s.type || 'grammar',
          explanation: s.explanation || '',
        }))
      : [];
    
    return {
      ok: true,
      original: args.text,
      corrected: parsedResponse.correctedText || response,
      suggestions: suggestions,
      message: `Grammar check completed${suggestions.length > 0 ? ` with ${suggestions.length} suggestion(s)` : ''}`,
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message,
    };
  }
}

