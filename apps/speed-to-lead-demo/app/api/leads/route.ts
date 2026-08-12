import { NextRequest, NextResponse } from 'next/server';
import { getLeads, saveLead } from '@/app/lib/store';
import { qualifyLead } from '@/app/lib/qualify';
import { Lead } from '@/app/lib/types';

export async function GET() {
  const leads = await getLeads();
  return NextResponse.json(leads);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.honeypot) {
    return NextResponse.json({ ok: true });
  }

  const { name, email, phone, goal, urgency, source } = body;

  if (!name || !email) {
    return NextResponse.json(
      { error: 'Name and email are required' },
      { status: 400 }
    );
  }

  const { temperature, aiSuggestedTag } = qualifyLead({ phone, goal, urgency });

  const lead: Lead = {
    id: `lead-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    email,
    phone: phone || '',
    goal: goal || '',
    urgency: urgency || 'medium',
    source: source || 'direct',
    status: 'new',
    temperature,
    createdAt: new Date().toISOString(),
    aiSuggestedTag,
  };

  await saveLead(lead);

  return NextResponse.json(lead, { status: 201 });
}
