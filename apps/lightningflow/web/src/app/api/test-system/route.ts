import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      server: 'online',
      admin: 'available',
      version: '1.0.0'
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: 'System check failed'
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'System check completed'
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      status: 'error', 
      error: 'System check failed'
    }, { status: 500 });
  }
} 