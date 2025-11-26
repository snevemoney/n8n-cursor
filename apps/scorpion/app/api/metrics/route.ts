/**
 * Prometheus Metrics Endpoint
 * GET /api/metrics - Returns metrics in Prometheus format
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMetricsCollector } from '@/lib/monitoring/metrics';

/**
 * GET /api/metrics - Prometheus metrics endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const metrics = getMetricsCollector();
    const prometheusFormat = metrics.getPrometheusFormat();
    
    return new NextResponse(prometheusFormat, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4',
      },
    });
  } catch (error: any) {
    console.error('[Metrics] Failed to export metrics:', error);
    return NextResponse.json(
      { error: 'Failed to export metrics' },
      { status: 500 }
    );
  }
}
