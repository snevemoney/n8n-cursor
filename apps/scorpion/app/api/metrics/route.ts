import { NextResponse } from 'next/server';
import { getMetricsCollector } from '@/lib/metrics';

/**
 * GET /api/metrics - Prometheus metrics endpoint
 * Exposes all Scorpion metrics in Prometheus format
 */
export async function GET() {
  try {
    const collector = getMetricsCollector();
    const metrics = collector.exportPrometheus();

    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to export metrics', message: error.message },
      { status: 500 }
    );
  }
}

