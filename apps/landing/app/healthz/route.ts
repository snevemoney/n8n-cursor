import { NextResponse } from "next/server";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({ 
    ok: true, 
    ts: Date.now(), 
    app: "landing",
    environment: "development"
  });
}