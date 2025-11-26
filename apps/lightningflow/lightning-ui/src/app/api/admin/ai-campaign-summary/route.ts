import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

// Remove module-level OpenAI initialization to prevent build-time errors

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get campaign performance data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [eventsRes, conversionsRes] = await Promise.all([
      supabase
        .from('email_events')
        .select('type, email, timestamp')
        .gte('timestamp', thirtyDaysAgo.toISOString()),
      supabase
        .from('workspaces')
        .select('created_at, plan')
        .neq('plan', 'free')
        .gte('created_at', thirtyDaysAgo.toISOString())
    ]);

    if (eventsRes.error || conversionsRes.error) {
      return NextResponse.json({ error: 'Failed to fetch campaign data' }, { status: 500 });
    }

    // Calculate metrics
    const events = eventsRes.data || [];
    const conversions = conversionsRes.data || [];
    
    const uniqueEmails = new Set(events.map(e => e.email));
    const opens = events.filter(e => e.type === 'open').length;
    const clicks = events.filter(e => e.type === 'click').length;
    
    const metrics = {
      totalSent: uniqueEmails.size,
      totalOpens: opens,
      totalClicks: clicks,
      totalConversions: conversions.length,
      openRate: uniqueEmails.size > 0 ? (opens / uniqueEmails.size * 100).toFixed(1) : '0',
      clickRate: uniqueEmails.size > 0 ? (clicks / uniqueEmails.size * 100).toFixed(1) : '0',
      conversionRate: uniqueEmails.size > 0 ? (conversions.length / uniqueEmails.size * 100).toFixed(1) : '0',
      recentTrend: events.length > 0 ? 'increasing' : 'low_activity'
    };

    // Generate AI analysis if OpenAI is available
    let analysis = 'AI analysis temporarily unavailable';
    
    // Initialize OpenAI client at runtime when environment variables are available
    if (process.env.OPENAI_API_KEY) {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const prompt = `
      Analyze this email campaign performance data for a Lightning AI SaaS platform:

      📊 Campaign Metrics (Last 30 Days):
      - Emails Sent: ${metrics.totalSent}
      - Opens: ${metrics.totalOpens} (${metrics.openRate}% open rate)
      - Clicks: ${metrics.totalClicks} (${metrics.clickRate}% click rate)
      - Conversions: ${metrics.totalConversions} (${metrics.conversionRate}% conversion rate)
      - Activity Trend: ${metrics.recentTrend}

      Please provide:
      1. Overall performance assessment (Good/Average/Needs Improvement)
      2. Key insights about what's working/not working
      3. 3 specific actionable recommendations to improve conversion rates
      4. Suggested A/B tests or optimizations
      5. Benchmark comparison (typical SaaS email metrics)

      Keep the analysis concise, actionable, and focused on improving upgrade conversion rates for this Lightning platform.
      `;

      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        });

        analysis = completion.choices[0].message.content || 'AI analysis failed to generate';
      } catch (aiError) {
        console.error('OpenAI API error:', aiError);
        analysis = 'AI analysis temporarily unavailable due to API error';
      }
    }

    return NextResponse.json({
      metrics,
      analysis,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI campaign summary error:', error);
    return NextResponse.json({ error: 'Failed to generate AI summary' }, { status: 500 });
  }
} 