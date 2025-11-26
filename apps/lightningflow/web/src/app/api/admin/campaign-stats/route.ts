import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get email events for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: events, error: eventsError } = await supabase
      .from('email_events')
      .select('type, email, workspace_id')
      .gte('timestamp', thirtyDaysAgo.toISOString());

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }

    // Get subscription counts for conversions
    const { data: subscriptions, error: subsError } = await supabase
      .from('workspaces')
      .select('id, plan')
      .neq('plan', 'free')
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (subsError) {
      console.error('Error fetching subscriptions:', subsError);
    }

    // Calculate stats
    const uniqueEmails = new Set();
    const opens = new Set();
    const clicks = new Set();

    events?.forEach(event => {
      uniqueEmails.add(event.email);
      if (event.type === 'open') {
        opens.add(event.email);
      } else if (event.type === 'click') {
        clicks.add(event.email);
      }
    });

    const sent = uniqueEmails.size || 1; // Avoid division by zero
    const opened = opens.size;
    const clicked = clicks.size;
    const converted = subscriptions?.length || 0;

    const stats = {
      sent,
      opened,
      clicked,
      converted,
      openRate: (opened / sent) * 100,
      clickRate: (clicked / sent) * 100,
      conversionRate: (converted / sent) * 100,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Campaign stats API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 