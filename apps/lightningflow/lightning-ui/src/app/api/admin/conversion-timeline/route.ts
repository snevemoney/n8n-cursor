import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get data for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Create timeline with daily buckets
    const timeline: any[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      timeline.push({
        date: dateStr,
        sent: 0,
        opened: 0,
        clicked: 0,
        converted: 0,
      });
    }

    // Get email events
    const { data: events, error: eventsError } = await supabase
      .from('email_events')
      .select('type, timestamp')
      .gte('timestamp', thirtyDaysAgo.toISOString());

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }

    // Get conversions (new paid subscriptions)
    const { data: conversions, error: convError } = await supabase
      .from('workspaces')
      .select('created_at, plan')
      .neq('plan', 'free')
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (convError) {
      console.error('Error fetching conversions:', convError);
    }

    // Process events into timeline
    events?.forEach(event => {
      const eventDate = new Date(event.timestamp).toISOString().split('T')[0];
      const timelineItem = timeline.find(item => item.date === eventDate);
      
      if (timelineItem) {
        if (event.type === 'open') {
          timelineItem.opened++;
        } else if (event.type === 'click') {
          timelineItem.clicked++;
        }
        // Count sent as unique emails per day (approximation)
        timelineItem.sent++;
      }
    });

    // Process conversions into timeline
    conversions?.forEach(conversion => {
      const conversionDate = new Date(conversion.created_at).toISOString().split('T')[0];
      const timelineItem = timeline.find(item => item.date === conversionDate);
      
      if (timelineItem) {
        timelineItem.converted++;
      }
    });

    return NextResponse.json({ timeline });
  } catch (error) {
    console.error('Conversion timeline API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 