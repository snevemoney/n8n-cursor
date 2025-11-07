import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ 
    ok: true, 
    ts: Date.now(), 
    app: "ops",
    environment: "development"
  });
}