import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase: SupabaseClient | null =
  url && key && !url.includes('placeholder') && !key.includes('placeholder') 
    ? createClient(url, key) 
    : null;

export function assertSupabase(): SupabaseClient {
  if (!supabase) {
    console.warn("⚠️ Supabase not configured — using mock client.");

    // Return a mock client that matches Supabase's interface
    return {
      from: (table: string) => ({
        select: async (query?: string) => ({ data: [], error: null }),
        insert: async (values: any) => ({ data: null, error: null }),
        update: async (values: any) => ({ data: null, error: null }),
        delete: async () => ({ data: null, error: null }),
        upsert: async (values: any) => ({ data: null, error: null }),
        eq: (column: string, value: any) => ({
          select: async (query?: string) => ({ data: [], error: null }),
          update: async (values: any) => ({ data: null, error: null }),
          delete: async () => ({ data: null, error: null }),
          single: async () => ({ data: null, error: null }),
          limit: (count: number) => ({
            select: async (query?: string) => ({ data: [], error: null }),
            single: async () => ({ data: null, error: null })
          })
        }),
        order: (column: string, options?: any) => ({
          select: async (query?: string) => ({ data: [], error: null }),
          limit: (count: number) => ({
            select: async (query?: string) => ({ data: [], error: null })
          })
        }),
        limit: (count: number) => ({
          select: async (query?: string) => ({ data: [], error: null }),
          single: async () => ({ data: null, error: null })
        }),
        single: async () => ({ data: null, error: null })
      }),
      rpc: async (fn: string, args?: any) => ({ data: null, error: null }),
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null })
      }
    } as unknown as SupabaseClient;
  }

  return supabase;
}

// Client-side Supabase (uses anon key)
export function createSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !anonKey || url.includes('placeholder') || anonKey.includes('placeholder')) {
    console.warn('Supabase client not configured - using mock mode');
    return null;
  }
  
  return createClient(url, anonKey);
} 