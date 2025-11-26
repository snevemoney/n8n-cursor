import { NextResponse } from "next/server";

/**
 * API Health Check Endpoint
 * Used by Docker healthchecks, load balancers, and monitoring systems
 * Returns minimal response without external dependencies
 */
export async function GET() {
  try {
    // Basic health check - no external dependencies
    const healthData = {
      ok: true,
      service: "lightningflow-api",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.API_VERSION || "unknown",
      environment: process.env.NODE_ENV || "development",
      // Optional: Add basic dependency checks
      dependencies: {
        // Add database, Redis, or other critical dependencies here
        // database: await checkDatabase(),
        // redis: await checkRedis(),
      }
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
        error: "API health check failed",
        timestamp: new Date().toISOString()
      }, 
      { status: 503 }
    );
  }
}
