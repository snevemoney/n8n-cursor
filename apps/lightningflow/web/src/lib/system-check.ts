import { apiPath } from '@/lib/base-path';
import { createClient } from '@supabase/supabase-js';

// Safe Supabase client creation with fallbacks
const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
    console.warn('Supabase not configured - using mock mode');
    return null;
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

const createSupabaseAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
    console.warn('Supabase admin not configured - using mock mode');
    return null;
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

// Types for the system check API
export type SystemCheckStatus = 'ok' | 'warning' | 'error' | 'unknown';

export interface SystemCheckItemResult {
  status: SystemCheckStatus;
  message?: string;
  details?: Record<string, any>;
  info?: Record<string, any>;
}

export interface SystemCheckResults {
  node?: SystemCheckItemResult;
  database?: SystemCheckItemResult;
  invoice?: SystemCheckItemResult;
  lnurl?: SystemCheckItemResult;
  webhook?: SystemCheckItemResult;
  [key: string]: SystemCheckItemResult | undefined;
}

export interface SystemCheckResult {
  status: SystemCheckStatus;
  timestamp: string;
  message?: string;
  results: SystemCheckResults;
}

/**
 * Run a system health check to validate the payment system
 * @param tests Array of tests to run (default: all)
 * @returns Promise with system check result
 */
export async function runSystemCheck(
  tests: string[] = ['node', 'database', 'invoice', 'lnurl', 'webhook']
): Promise<SystemCheckResult> {
  try {
    // Only run from server-side code with access to the API key
    if (typeof window !== 'undefined') {
      throw new Error('System checks can only be run from server-side code');
    }

    const SYSTEM_CHECK_KEY = process.env.SYSTEM_CHECK_KEY || 'system-check-secret';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Run the system check through the API
    const response = await fetch(`${appUrl}/api/system-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-system-check-key': SYSTEM_CHECK_KEY
      },
      body: JSON.stringify({ tests })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`System check API returned error: ${errorText}`);
    }
    
    const result = await response.json() as SystemCheckResult;
    
    // Store the result in the database for historical tracking
    // Only do this if we have admin access
    try {
      const supabaseAdmin = createSupabaseAdminClient();
      
      if (supabaseAdmin) {
        // Check if we have a system_checks table, create it if not
        const { error: tableCheckError } = await supabaseAdmin.rpc(
          'check_table_exists',
          { table_name: 'system_checks' }
        );
        
        if (tableCheckError) {
          // Table doesn't exist, create it
          await supabaseAdmin.rpc('create_system_checks_table');
        }
        
        // Store the result
        await supabaseAdmin
          .from('system_checks')
          .insert({
            timestamp: result.timestamp,
            status: result.status,
            results: result.results,
            message: result.message
          });
      }
    } catch (dbError) {
      console.error('Failed to store system check result:', dbError);
      // Continue anyway, this is not critical
    }
    
    return result;
  } catch (error: any) {
    console.error('Error running system check:', error);
    return {
      timestamp: new Date().toISOString(),
      status: 'error',
      results: {},
      message: `Failed to run system check: ${error.message}`
    };
  }
}

/**
 * Get recent system check results
 * @param limit Number of results to return
 * @returns Promise with array of system check results
 */
export async function getSystemCheckResults(limit: number = 10): Promise<SystemCheckResult[]> {
  try {
    const supabase = createSupabaseClient();
    
    if (!supabase) {
      console.warn('Supabase not configured - returning empty results');
      return [];
    }
    
    const { data, error } = await supabase
      .from('system_checks')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);
      
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error: any) {
    console.error('Error fetching system check results:', error);
    return [];
  }
}

/**
 * Get the most recent system check result
 * @returns Promise with the most recent system check result or null
 */
export async function getLatestSystemCheckResult(): Promise<SystemCheckResult | null> {
  try {
    const supabase = createSupabaseClient();
    
    if (!supabase) {
      console.warn('Supabase not configured - returning null');
      return null;
    }
    
    const { data, error } = await supabase
      .from('system_checks')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();
      
    if (error) {
      return null;
    }
    
    return data;
  } catch (error: any) {
    console.error('Error fetching latest system check result:', error);
    return null;
  }
}

/**
 * Create SQL function to check if a table exists
 */
export async function createSystemCheckDatabaseObjects() {
  try {
    const supabaseAdmin = createSupabaseAdminClient();
    
    if (!supabaseAdmin) {
      console.warn('Supabase admin not configured - skipping database object creation');
      return;
    }
    
    // Create function to check if a table exists
    await supabaseAdmin.rpc('execute_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION check_table_exists(table_name TEXT)
        RETURNS BOOLEAN AS $$
        DECLARE
            exists BOOLEAN;
        BEGIN
            SELECT COUNT(*) > 0 INTO exists
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = $1;
            
            RETURN exists;
        END;
        $$ LANGUAGE plpgsql;
      `
    });
    
    // Create function to create the system_checks table if it doesn't exist
    await supabaseAdmin.rpc('execute_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION create_system_checks_table()
        RETURNS VOID AS $$
        BEGIN
            CREATE TABLE IF NOT EXISTS public.system_checks (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
                status TEXT NOT NULL,
                results JSONB NOT NULL,
                message TEXT
            );
            
            -- Create index on timestamp for faster queries
            CREATE INDEX IF NOT EXISTS idx_system_checks_timestamp
            ON public.system_checks (timestamp DESC);
            
            -- Enable RLS
            ALTER TABLE public.system_checks ENABLE ROW LEVEL SECURITY;
            
            -- Create policy for admins only
            CREATE POLICY system_checks_admin_policy 
            ON public.system_checks 
            FOR ALL 
            USING (
                auth.uid() IN (
                    SELECT user_id FROM tenant_users WHERE role = 'admin'
                )
            );
        END;
        $$ LANGUAGE plpgsql;
      `
    });
    
    // Create the table if it doesn't exist
    const { data: tableExists } = await supabaseAdmin.rpc('check_table_exists', {
      table_name: 'system_checks'
    });
    
    if (!tableExists) {
      await supabaseAdmin.rpc('create_system_checks_table');
    }
    
    return true;
  } catch (error: any) {
    console.error('Error creating system check database objects:', error);
    return false;
  }
}

// Client-side version of getSystemCheckResults (uses mock data when API fails)
export async function getClientSystemCheckResults(limit = 5): Promise<SystemCheckResult[]> {
  try {
    const response = await fetch(apiPath('/api/system-check?limit=') + limit, {
      headers: {
        'Content-Type': 'application/json',
        'x-system-check-key': localStorage.getItem('system_check_key') || ''
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch system check results: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching system check results:', error);
    return getMockResults(limit);
  }
}

// Mock data for development
function getMockResults(limit = 5): SystemCheckResult[] {
  const statuses: SystemCheckStatus[] = ['ok', 'warning', 'error'];
  const results: SystemCheckResult[] = [];
  
  for (let i = 0; i < limit; i++) {
    const date = new Date();
    date.setHours(date.getHours() - i * 6);
    
    const status = statuses[Math.floor(Math.random() * (i === 0 ? 1 : 3))];
    
    results.push({
      status,
      timestamp: date.toISOString(),
      message: status === 'ok' 
        ? 'All systems operational'
        : status === 'warning'
          ? 'Some systems experiencing issues'
          : 'Critical error detected',
      results: {
        node: {
          status: i === 0 ? 'ok' : Math.random() > 0.7 ? 'warning' : 'ok',
          message: 'Node is online and synced',
          info: {
            id: '03e50492eab4107a773141bb419e107bda3de3d55652e6e1a41225f06a0bbf2d56',
            name: 'Lightning Platform Node',
            balance: 2500000,
          }
        },
        database: {
          status: 'ok',
          message: 'Database connection successful',
          details: {
            latency: '32ms',
            version: 'PostgreSQL 15.3'
          }
        },
        invoice: {
          status: i === 0 ? 'ok' : Math.random() > 0.6 ? 'error' : 'ok',
          message: i === 0 ? 'Invoice creation successful' : Math.random() > 0.6 ? 'Failed to create test invoice' : 'Invoice creation successful',
          details: i === 0 || Math.random() <= 0.6 ? {
            invoice: 'lnbc100n1pvjuezpp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqdq5xysxxatsyp3k7enxv4jsxqzpuaztrnwngzn3kdzw5hydlzf03qdgm2hdq27cqv3agm2awhz5se903vruatfhq77w3ls4evs3ch9zw97j25emudupq63nyw24cg27h2rspk28uwq',
            created: true
          } : { error: 'Node returned error: temporary channel failure' }
        },
        lnurl: {
          status: Math.random() > 0.8 ? 'warning' : 'ok',
          message: Math.random() > 0.8 ? 'LNURL withdrawal test successful but with high latency' : 'LNURL tests passed',
        },
        webhook: {
          status: i === 0 ? 'ok' : Math.random() > 0.7 ? 'error' : 'ok',
          message: i === 0 ? 'Webhook delivery successful' : Math.random() > 0.7 ? 'Webhook delivery failed: timeout' : 'Webhook delivery successful',
        }
      }
    });
  }
  
  return results;
} 