import { z } from 'zod';

export const name = 'llm.evaluate';
export const label = 'Evaluate Models';
export const description = 'Compare and evaluate multiple models on a prompt or test cases';

export const schema = z.object({
  prompt: z.string().min(1).describe('Prompt to test'),
  models: z.array(z.string()).min(1).max(5).describe('Model names to compare'),
  systemPrompt: z.string().optional().describe('Optional system prompt'),
  testCases: z.array(z.object({
    input: z.string(),
    expected: z.string().optional(),
  })).optional().describe('Optional test cases for evaluation'),
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'}/api/llm/models/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: args.prompt,
        models: args.models.map(name => ({ name, provider: 'ollama' })),
        systemPrompt: args.systemPrompt,
        testCases: args.testCases,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Evaluation failed');
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.message || 'Evaluation failed');
    }

    const result = data.data;
    const successful = result.comparisons.filter((c: any) => c.success);
    
    return {
      ok: true,
      summary: {
        total: result.comparisons.length,
        successful: successful.length,
        failed: result.comparisons.length - successful.length,
      },
      results: successful.map((c: any) => ({
        model: c.model,
        response: c.response?.substring(0, 200) + (c.response?.length > 200 ? '...' : ''),
        duration: `${c.duration}ms`,
      })),
      similarityScores: result.similarityScores,
      message: `Evaluated ${result.comparisons.length} models. ${successful.length} succeeded.`,
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message,
    };
  }
}

