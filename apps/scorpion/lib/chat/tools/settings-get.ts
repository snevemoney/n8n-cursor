import { z } from 'zod';

export const name = 'settings.get';
export const label = 'Get Settings';
export const description = 'Get current system settings';

export const schema = z.object({});

export async function handler(args: z.infer<typeof schema>) {
  try {
    const response = await fetch('http://localhost:3003/api/settings');
    if (!response.ok) {
      throw new Error(`Failed to fetch settings: ${response.statusText}`);
    }
    
    const data = await response.json();
    const settings = data.settings || data.data || data;
    
    return {
      ok: true,
      settings: settings,
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message || 'Failed to get settings',
    };
  }
}

