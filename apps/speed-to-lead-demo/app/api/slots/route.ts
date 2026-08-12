import { NextResponse } from 'next/server';
import { getFixtureSlots } from '@/app/lib/slots';

export async function GET() {
  const slots = getFixtureSlots();
  return NextResponse.json(slots);
}
