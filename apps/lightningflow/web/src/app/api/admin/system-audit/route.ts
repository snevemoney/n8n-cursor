import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/admin';
import { SystemIntrospector } from '../../../../../scripts/audit/full-introspect';

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    await requireAdminAuth();

    // Run system audit
    const introspector = new SystemIntrospector();
    const report = await introspector.runFullAudit();

    return NextResponse.json({
      success: true,
      report,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('System audit failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    await requireAdminAuth();

    const body = await request.json();
    const { action } = body;

    if (action === 'run-audit') {
      const introspector = new SystemIntrospector();
      const report = await introspector.runFullAudit();

      return NextResponse.json({
        success: true,
        report,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('System audit action failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 