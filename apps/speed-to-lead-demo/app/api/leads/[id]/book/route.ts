import { NextRequest, NextResponse } from 'next/server';
import { updateLead } from '@/app/lib/store';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { slotId, slotDatetime, slotLabel } = await req.json();

  if (!slotId || !slotDatetime) {
    return NextResponse.json(
      { error: 'slotId and slotDatetime required' },
      { status: 400 }
    );
  }

  const updated = await updateLead(params.id, {
    status: 'booked',
    bookedAt: new Date().toISOString(),
    bookedSlot: slotLabel || slotDatetime,
  });

  if (!updated) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }

  return NextResponse.json(updated);
}
