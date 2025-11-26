import { z } from 'zod';

export const name = 'user.workflow';
export const label = 'Workflow Automation';
export const description = 'Create n8n workflows from natural language descriptions';

export const schema = z.object({
  description: z.string().min(1),
  apps: z.array(z.string()).optional(),
  test: z.boolean().default(false),
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    // Use n8n MCP tools if available, otherwise use existing workflow tool
    const { runModelUnified } = await import('@/lib/chat/modelRunner');
    
    const prompt = `Create an n8n workflow JSON based on this description: "${args.description}". ${args.apps ? `Use these apps: ${args.apps.join(', ')}` : ''}`;
    
    const response = await runModelUnified({
      messages: [
        { role: 'system', content: 'You are an n8n workflow generator. Create valid n8n workflow JSON from descriptions.' },
        { role: 'user', content: prompt },
      ],
      provider: 'ollama',
      model: 'qwen2.5-coder',
    });
    
    return {
      ok: true,
      workflow: {
        description: args.description,
        json: response.content, // TODO: Parse and validate JSON
        testable: args.test,
      },
      message: 'Workflow generated. Review and test before deploying.',
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message,
    };
  }
}

