import { NextRequest } from 'next/server';
import { runModelUnified } from '@/lib/chat/modelRunner';

/**
 * GET /api/chat/test
 * 
 * Test endpoint to verify LLM connection works
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const model = searchParams.get('model') || 'llama3.2:3b-instruct-q4_K_M';
    const provider = searchParams.get('provider') || 'ollama';
    
    console.log(`[Chat Test] Testing ${provider} with model ${model}`);
    
    const startTime = Date.now();
    const response = await runModelUnified(
      'You are a helpful assistant.',
      'Say hello in one sentence.',
      { provider: provider as any, model }
    );
    const duration = Date.now() - startTime;
    
    return NextResponse.json({ 
      success: true, 
      response,
      model,
      provider,
      duration: `${duration}ms`
    });
  } catch (error: any) {
    console.error('[Chat Test] Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

