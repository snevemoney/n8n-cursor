import { NextResponse } from 'next/server';

/**
 * GET /healthz
 * 
 * Lightweight health check endpoint for Kubernetes/Docker readiness probes.
 * This endpoint should:
 * - Respond quickly (<100ms)
 * - Not check external dependencies (that's what /api/health is for)
 * - Return 200 OK when the service is ready to accept traffic
 * - Return 503 Service Unavailable if the service is not ready
 */
export async function GET() {
  try {
    // Basic check: Is the Node.js process healthy?
    // This is intentionally lightweight - no external calls
    
    const healthData = {
      ok: true,
      service: 'scorpion',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || 'unknown',
      environment: process.env.NODE_ENV || 'development',
    };

    return NextResponse.json(healthData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: any) {
    // If anything goes wrong, return unhealthy
    return NextResponse.json(
      {
        ok: false,
        error: 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  }
}

