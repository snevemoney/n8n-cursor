// Governance Client
// Frontend helper for checking access before sensitive actions

export interface GovernanceCheckResult {
  allowed: boolean;
  result: 'allowed' | 'denied';
  message?: string;
}

/**
 * Check if an action is allowed on an asset
 * Returns { allowed: true } if access is granted, { allowed: false } if denied
 */
export async function checkAccess(params: {
  action: 'read' | 'write' | 'delete' | 'export' | 'share' | 'admin';
  assetId?: string;
  resourceType?: string;
  resourceId?: string;
  userId?: string | null;
  tenantId?: string | null;
}): Promise<GovernanceCheckResult> {
  try {
    const response = await fetch('/api/governance/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: params.action,
        assetId: params.assetId,
        resourceType: params.resourceType,
        resourceId: params.resourceId,
        context: {
          userId: params.userId || null,
          tenantId: params.tenantId || null,
          ip: typeof window !== 'undefined' ? window.location.hostname : undefined,
          userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
        },
      }),
    });

    if (!response.ok) {
      // If governance service is unavailable, allow by default (backward compatibility)
      console.warn('[Governance] Check failed, allowing by default:', response.statusText);
      return { allowed: true, result: 'allowed' };
    }

    const result = await response.json();
    const data = result.data || result;
    
    return {
      allowed: data.allowed === true,
      result: data.result || (data.allowed ? 'allowed' : 'denied'),
      message: data.message,
    };
  } catch (error) {
    // If governance check fails, allow by default (backward compatibility)
    console.warn('[Governance] Check error, allowing by default:', error);
    return { allowed: true, result: 'allowed' };
  }
}

