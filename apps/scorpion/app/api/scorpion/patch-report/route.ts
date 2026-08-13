// apps/scorpion/app/api/scorpion/patch-report/route.ts

import { NextResponse } from 'next/server';
import { analyzeSignalsIntoPatchReport } from '@/server/orchestrator/selfImprovement';

export const dynamic = 'force-dynamic';

export async function GET() {
  const report = analyzeSignalsIntoPatchReport(20); // look at last ~20 missions
  return NextResponse.json(report);
}

