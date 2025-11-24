/**
 * Events API
 * Query events from the event bus
 * 
 * GET /api/events?type=workflow.failed&severity=error&limit=100
 */

import { NextRequest, NextResponse } from 'next/server';
import { getEventBus } from '@/lib/events/event-bus';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    
    const filters = {
      type: searchParams.get('type') || undefined,
      severity: searchParams.get('severity') || undefined,
      source: searchParams.get('source') || undefined,
      environment: searchParams.get('environment') || undefined,
      startTime: searchParams.get('startTime') || undefined,
      endTime: searchParams.get('endTime') || undefined,
      limit: searchParams.get('limit') 
        ? parseInt(searchParams.get('limit')!, 10) 
        : 100,
    };

    const bus = getEventBus();
    const events = await bus.queryEvents(filters);

    return NextResponse.json({
      events,
      count: events.length,
      filters,
    });
  } catch (error) {
    console.error('[Events API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to query events', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

