import { z } from 'zod';

export const name = 'user.simplify';
export const label = 'Text Simplifier';
export const description = 'Rewrite complex text into clearer versions at different reading levels';

export const schema = z.object({
  text: z.string().min(1),
  level: z.enum(['middle-school', 'high-school', 'professional']).default('professional'),
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    const { runModelUnified } = await import('@/lib/chat/modelRunner');
    
    const levelDesc = args.level === 'middle-school' ? 'middle school level (ages 11-14)' 
      : args.level === 'high-school' ? 'high school level (ages 14-18)'
      : 'professional level (clear and concise for educated adults)';
    
    const prompt = `Rewrite the following text at ${levelDesc} reading level.

Provide your response in the following JSON format:
{
  "simplifiedText": "The simplified version of the text",
  "changes": [
    {
      "original": "original phrase or sentence",
      "simplified": "simplified version",
      "reason": "Brief explanation of why this change was made"
    }
  ]
}

Text to simplify:
${args.text}`;
    
    const systemPrompt = 'You are a text simplifier. Rewrite text at the requested reading level while preserving the core meaning. Always respond in valid JSON format.';
    
    const response = await runModelUnified(
      systemPrompt,
      prompt,
      {
        provider: 'ollama',
        model: 'scorpion:latest', // Use available model
        temperature: 0.3, // Lower temperature for more consistent simplification
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
          // Fallback: extract changes from text using pattern matching
          parsedResponse = {
            simplifiedText: response,
            changes: [],
          };
        }
      } else {
        // Fallback: use response as simplified text
        parsedResponse = {
          simplifiedText: response,
          changes: [],
        };
      }
    }
    
    // Ensure changes array exists and is properly formatted
    const changes = Array.isArray(parsedResponse.changes)
      ? parsedResponse.changes.map((c: any) => ({
          original: c.original || '',
          simplified: c.simplified || '',
          reason: c.reason || 'Simplified for clarity',
        }))
      : [];
    
    return {
      ok: true,
      original: args.text,
      simplified: parsedResponse.simplifiedText || response,
      level: args.level,
      changes: changes,
      message: `Text simplified to ${args.level} level${changes.length > 0 ? ` with ${changes.length} change(s)` : ''}`,
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message,
    };
  }
}

