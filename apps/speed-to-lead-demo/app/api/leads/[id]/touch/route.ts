import { NextRequest, NextResponse } from 'next/server';
import { updateLead } from '@/app/lib/store';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const updated = await updateLead(params.id, {
    status: 'touched',
    touchedAt: new Date().toISOString(),
  });

  if (!updated) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }

  return NextResponse.json(updated);
}
