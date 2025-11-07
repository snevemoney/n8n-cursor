import { z } from 'zod';

export const name = 'notifications.post';
export const label = 'Post Notification';
export const description = 'Create an in-app notification';

export const schema = z.object({
  message: z.string().min(1),
  severity: z.enum(['info', 'warn', 'error', 'critical']).default('info'),
  actionUrl: z.string().optional(),
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    const response = await fetch('http://localhost:3003/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'info',
        title: 'Chat Notification',
        message: args.message,
        priority: args.severity === 'critical' || args.severity === 'error' ? 'high' : 'normal',
        requiresApproval: args.severity === 'critical',
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Notifications API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      ok: true,
      notificationId: data.id || `notif-${Date.now()}`,
      message: 'Notification created',
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message,
    };
  }
}

