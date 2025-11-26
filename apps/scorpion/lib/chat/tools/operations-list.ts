import { z } from 'zod';

export const name = 'operations.list';
export const label = 'List Operations';
export const description = 'List recent operations including workflow executions and agent runs';

export const schema = z.object({
  limit: z.number().optional().default(50).describe('Maximum number of operations to return'),
  status: z.enum(['running', 'completed', 'failed', 'pending']).optional().describe('Filter by status'),
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    const response = await fetch('http://localhost:3003/api/operations');
    if (!response.ok) {
      throw new Error(`Failed to fetch operations: ${response.statusText}`);
    }
    
    const data = await response.json();
    const operations = data.operations || data.data?.operations || [];
    
    let filtered = operations;
    if (args.status) {
      filtered = operations.filter((op: any) => op.status === args.status);
    }
    
    // Sort by timestamp (most recent first)
    filtered.sort((a: any, b: any) => 
      new Date(b.timestamp || b.createdAt).getTime() - new Date(a.timestamp || a.createdAt).getTime()
    );
    
    // Apply limit
    filtered = filtered.slice(0, args.limit);
    
    return {
      ok: true,
      operations: filtered.map((op: any) => ({
        id: op.id,
        type: op.type,
        status: op.status,
        timestamp: op.timestamp || op.createdAt,
        duration: op.duration,
        result: op.result,
      })),
      total: operations.length,
      returned: filtered.length,
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message || 'Failed to list operations',
    };
  }
}

