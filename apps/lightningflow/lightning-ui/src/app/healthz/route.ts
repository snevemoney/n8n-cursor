import { NextResponse } from "next/server";

/**
 * Health Check Endpoint
 * Used by Docker healthchecks, load balancers, and monitoring systems
 * Returns minimal response without dependencies to ensure fast response
 */
export async function GET() {
  try {
    // Basic health check - no external dependencies
    const healthData = {
      ok: true,
      service: "lightningflow-ui",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || "unknown",
      environment: process.env.NODE_ENV || "development"
    };

    return NextResponse.json(healthData, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    // If anything goes wrong, return unhealthy
    return NextResponse.json(
      { 
        ok: false, 
        error: "Health check failed",
        timestamp: new Date().toISOString()
      }, 
      { status: 503 }
    );
  }
}
