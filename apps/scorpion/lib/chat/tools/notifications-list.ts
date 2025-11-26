import { z } from 'zod';

export const name = 'notifications.list';
export const label = 'List Notifications';
export const description = 'List recent notifications with optional filtering by level';

export const schema = z.object({
  limit: z.number().optional().default(50).describe('Maximum number of notifications to return'),
  level: z.enum(['info', 'warning', 'error', 'success']).optional().describe('Filter by notification level'),
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    const response = await fetch('http://localhost:3003/api/notifications');
    if (!response.ok) {
      throw new Error(`Failed to fetch notifications: ${response.statusText}`);
    }
    
    const data = await response.json();
    const notifications = data.notifications || data.data?.notifications || [];
    
    let filtered = notifications;
    if (args.level) {
      filtered = notifications.filter((notif: any) => notif.level === args.level);
    }
    
    // Sort by timestamp (most recent first)
    filtered.sort((a: any, b: any) => 
      new Date(b.timestamp || b.createdAt).getTime() - new Date(a.timestamp || a.createdAt).getTime()
    );
    
    // Apply limit
    filtered = filtered.slice(0, args.limit);
    
    return {
      ok: true,
      notifications: filtered.map((notif: any) => ({
        id: notif.id,
        message: notif.message,
        level: notif.level,
        timestamp: notif.timestamp || notif.createdAt,
        read: notif.read || false,
      })),
      total: notifications.length,
      returned: filtered.length,
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message || 'Failed to list notifications',
    };
  }
}

