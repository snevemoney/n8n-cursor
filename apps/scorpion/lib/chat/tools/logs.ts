import { z } from 'zod';

export const name = 'logs.tail';
export const label = 'Tail System Logs';
export const description = 'Get recent system logs from a time window';

export const schema = z.object({
  window: z.number().min(60000).max(3600000).default(300000), // 5 min default, max 1 hour
  level: z.enum(['info', 'warn', 'error', 'critical']).optional(),
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    const response = await fetch(`http://localhost:3003/api/logs`);
    
    if (!response.ok) {
      throw new Error(`Logs API returned ${response.status}`);
    }
    
    const data = await response.json();
    const logs = data.logs || [];
    
    // Filter by time window
    const cutoff = Date.now() - args.window;
    let filtered = logs.filter((log: any) => {
      const ts = new Date(log.timestamp).getTime();
      return ts >= cutoff;
    });
    
    // Filter by level if specified
    if (args.level) {
      filtered = filtered.filter((log: any) => log.level === args.level);
    }
    
    return {
      ok: true,
      logs: filtered.slice(-100), // Last 100 logs
      count: filtered.length,
      window: args.window,
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message,
      logs: [],
    };
  }
}

