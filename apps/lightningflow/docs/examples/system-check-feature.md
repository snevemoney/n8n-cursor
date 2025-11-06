# System Check Feature Example

This document shows how the existing system check functionality should be restructured to follow the codebase principles.

## Current Structure

Currently, system check code is organized like this:

```
web/src/app/api/system-check/route.ts
web/src/lib/system-check.ts
web/src/app/settings/system-health/page.tsx
```

## Proposed Structure Following Principles

Based on our codebase principles, especially "Feature-First, Not Tech-First" and "File Paths Mirror Flows", here's the new structure:

```
features/
  system-check/
    api/
      route.ts                      # Main API endpoint
      [feature]/
        route.ts                    # Feature-specific checks
    components/
      SystemHealthDashboard.tsx     # Main dashboard component
      SystemHealthCard.tsx          # Status card component
      TestResultsList.tsx           # Results list component
    hooks/
      useSystemCheck.ts             # Hook for running checks
      useSystemCheckResults.ts      # Hook for fetching results
    lib/
      runners/
        node-check.ts               # Node connectivity checker
        invoice-check.ts            # Invoice flow checker
        payment-check.ts            # Payment flow checker
      types.ts                      # Type definitions
      utils.ts                      # Utility functions
    test/
      unit/                         # Unit tests
      integration/                  # Integration tests
    index.ts                        # Public API for this feature
```

## Implementation Example

### 1. Feature Entry Point (index.ts)

```typescript
// features/system-check/index.ts

// Public API
export { SystemHealthDashboard } from './components/SystemHealthDashboard';
export { useSystemCheck, useSystemCheckResults } from './hooks';
export type { SystemCheckResult, SystemCheckStatus } from './lib/types';

// Internal API (not exported at feature level)
// Other components will import directly from their location if needed
```

### 2. Hook Example (useSystemCheck.ts)

```typescript
// features/system-check/hooks/useSystemCheck.ts

import { useState } from 'react';
import type { SystemCheckResult } from '../lib/types';

export function useSystemCheck() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<SystemCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runCheck = async (features: string[] = ['all']) => {
    setIsRunning(true);
    setError(null);
    
    try {
      const response = await fetch('/api/system-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-system-check-key': localStorage.getItem('system_check_key') || ''
        },
        body: JSON.stringify({ tests: features })
      });

      if (!response.ok) {
        throw new Error(`Error running system check: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsRunning(false);
    }
  };

  return { runCheck, isRunning, result, error };
}
```

### 3. API Example (Route Handler)

```typescript
// features/system-check/api/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { runNodeCheck } from '../lib/runners/node-check';
import { runInvoiceCheck } from '../lib/runners/invoice-check';
import { runPaymentCheck } from '../lib/runners/payment-check';
import { getSupabaseAdmin } from '@/lib/supabase';
import { storeCheckResult } from '../lib/utils';
import { SYSTEM_CHECK_KEY } from '@/lib/env-config';

/**
 * POST /api/system-check
 * Runs system health checks based on requested features
 */
export async function POST(req: NextRequest) {
  try {
    // Validate security key
    const providedKey = req.headers.get('x-system-check-key');
    if (!providedKey || providedKey !== SYSTEM_CHECK_KEY) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized access' 
      }, { status: 401 });
    }
    
    // Parse request body
    const body = await req.json();
    const { tests = ['node', 'database', 'invoice', 'lnurl', 'webhook'] } = body;
    
    const results: Record<string, any> = {};
    const supabaseAdmin = getSupabaseAdmin();
    
    // Run requested checks
    if (tests.includes('node')) {
      results.node = await runNodeCheck(supabaseAdmin);
    }
    
    if (tests.includes('invoice')) {
      results.invoice = await runInvoiceCheck(supabaseAdmin, req.nextUrl.origin);
    }
    
    // Calculate overall status
    const overallStatus = Object.values(results).every(r => r.status === 'ok') ? 'ok' :
                         Object.values(results).some(r => r.status === 'error') ? 'error' : 'warning';
    
    // Final result object
    const checkResult = {
      timestamp: new Date().toISOString(),
      status: overallStatus,
      results
    };
    
    // Store result in database
    await storeCheckResult(supabaseAdmin, checkResult);
    
    return NextResponse.json(checkResult);
  } catch (error: any) {
    console.error('Error running system health check:', error);
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: 'error',
      message: `System check failed: ${error.message}`
    }, { status: 500 });
  }
}
```

### 4. Feature-Specific Check Example

```typescript
// features/system-check/api/payment-links/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { SYSTEM_CHECK_KEY } from '@/lib/env-config';

/**
 * POST /api/system-check/payment-links
 * Checks payment links functionality
 */
export async function POST(req: NextRequest) {
  try {
    // Validate security key
    const providedKey = req.headers.get('x-system-check-key');
    if (!providedKey || providedKey !== SYSTEM_CHECK_KEY) {
      return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 401 });
    }
    
    // Run payment links specific checks
    const supabaseAdmin = getSupabaseAdmin();
    
    // 1. Check if we can query payment links
    const { data: links, error: linksError } = await supabaseAdmin
      .from('payment_links')
      .select('count', { count: 'exact', head: true });
      
    if (linksError) {
      return NextResponse.json({
        status: 'error',
        message: `Failed to query payment links: ${linksError.message}`
      });
    }
    
    // 2. Create a test payment link
    const testLink = {
      name: `Test Link ${new Date().toISOString()}`,
      amount_sats: 100,
      description: 'System check test payment link',
      user_id: '00000000-0000-0000-0000-000000000000', // System user
      tenant_id: process.env.DEFAULT_TENANT_ID,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      metadata: { system_check: true }
    };
    
    const { data: createdLink, error: createError } = await supabaseAdmin
      .from('payment_links')
      .insert(testLink)
      .select()
      .single();
      
    if (createError) {
      return NextResponse.json({
        status: 'error',
        message: `Failed to create test payment link: ${createError.message}`
      });
    }
    
    // 3. Generate LNURL for the link
    const lnurlResponse = await fetch(`${req.nextUrl.origin}/api/lnurl-pay/create?link_id=${createdLink.id}`);
    
    if (!lnurlResponse.ok) {
      return NextResponse.json({
        status: 'error',
        message: `Failed to generate LNURL for payment link: ${await lnurlResponse.text()}`
      });
    }
    
    const lnurlData = await lnurlResponse.json();
    
    return NextResponse.json({
      status: 'ok',
      link_id: createdLink.id,
      lnurl: lnurlData.lnurl
    });
  } catch (error: any) {
    console.error('Error checking payment links:', error);
    return NextResponse.json({
      status: 'error',
      message: `Payment links check failed: ${error.message}`
    }, { status: 500 });
  }
}
```

## Page Component Example

```tsx
// app/settings/system-health/page.tsx

import { SystemHealthDashboard } from '@/features/system-check';

export default function SystemHealthPage() {
  return <SystemHealthDashboard />;
}
```

This structure makes the system check feature self-contained, testable, and organized according to the feature-first principle while still fitting into the overall application architecture. 