import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

interface AdminUser {
  id: string;
  email: string;
  is_admin: boolean;
  user_metadata?: any;
}

/**
 * Get Supabase client for server-side admin operations
 */
async function getSupabaseAdmin() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {}
      }
    }
  );
}

/**
 * Check if current user is admin
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const supabase = await getSupabaseAdmin();
    
    // Get current user
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return false;
    }

    // Check if user is sneve1 (dev admin) or has admin flag
    if (user.email === 'sneve1@example.com') {
      return true;
    }

    // Check admin flag in user metadata or profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    return profile?.is_admin === true;

  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Get current admin user or null
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  try {
    const supabase = await getSupabaseAdmin();
    
    // Get current user
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }

    // Check if user is admin
    const adminStatus = await isAdmin();
    if (!adminStatus) {
      return null;
    }

    return {
      id: user.id,
      email: user.email!,
      is_admin: true,
      user_metadata: user.user_metadata
    };

  } catch (error) {
    console.error('Error getting admin user:', error);
    return null;
  }
}

/**
 * Require admin authentication - throws error if not admin
 */
export async function requireAdminAuth(): Promise<AdminUser> {
  const adminUser = await getAdminUser();
  
  if (!adminUser) {
    // If in development mode and user is sneve1, allow bypass
    if (process.env.NODE_ENV === 'development' && 
        process.env.DEV_ADMIN_BYPASS === 'true') {
      console.warn('⚠️ DEV MODE: Admin bypass enabled');
      return {
        id: 'dev-admin',
        email: 'sneve1@example.com',
        is_admin: true
      };
    }
    
    // Redirect to login for browser/server-rendered requests.
    // next/navigation redirect() already applies basePath.
    redirect('/login?redirect=/admin');
    
    // Throw error for API requests
    throw new Error('Admin authentication required');
  }

  return adminUser;
}

/**
 * Admin middleware for API routes
 */
export async function withAdminAuth<T>(
  handler: (user: AdminUser) => Promise<T>
): Promise<T> {
  const adminUser = await requireAdminAuth();
  return handler(adminUser);
}

/**
 * Check if user has specific admin permissions
 */
export async function hasAdminPermission(permission: string): Promise<boolean> {
  const adminUser = await getAdminUser();
  
  if (!adminUser) {
    return false;
  }

  // For now, all admins have all permissions
  // In the future, you could implement role-based permissions
  return true;
}

/**
 * Get admin dashboard capabilities
 */
export async function getAdminCapabilities(): Promise<{
  systemAudit: boolean;
  userManagement: boolean;
  botTesting: boolean;
  analytics: boolean;
  aiAgents: boolean;
}> {
  const isAdminUser = await isAdmin();
  
  return {
    systemAudit: isAdminUser,
    userManagement: isAdminUser,
    botTesting: isAdminUser,
    analytics: isAdminUser,
    aiAgents: isAdminUser
  };
}

/**
 * Log admin action for audit trail
 */
export async function logAdminAction(
  action: string, 
  details?: Record<string, any>
): Promise<void> {
  try {
    const adminUser = await getAdminUser();
    
    if (!adminUser) {
      return;
    }

    const supabase = await getSupabaseAdmin();
    
    await supabase
      .from('admin_audit_log')
      .insert({
        user_id: adminUser.id,
        user_email: adminUser.email,
        action,
        details: details || {},
        timestamp: new Date().toISOString(),
        ip_address: 'server-side', // Could be enhanced to capture real IP
        user_agent: 'admin-interface'
      });

  } catch (error) {
    console.error('Failed to log admin action:', error);
    // Don't throw - logging failure shouldn't break the operation
  }
} 