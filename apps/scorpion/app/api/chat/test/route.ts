import { NextRequest } from 'next/server';
import { runModelUnified } from '@/lib/chat/modelRunner';
import { createSuccessResponse, createErrorResponse, ApiErrorCode, withErrorHandling } from '@/lib/api-error-handler';
import { getRecommendedModelForRAM } from '@/lib/utils/modelSelector';

export const dynamic = 'force-dynamic';

/**
 * GET /api/chat/test
 * 
 * Test endpoint to verify LLM connection works
 */
export const GET = withErrorHandling(async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const model = searchParams.get('model') || process.env['OLLAMA_MODEL'] || getRecommendedModelForRAM();
  const provider = searchParams.get('provider') || 'ollama';
  
  console.log(`[Chat Test] Testing ${provider} with model ${model}`);
  
  const startTime = Date.now();
  const response = await runModelUnified(
    'You are a helpful assistant.',
    'Say hello in one sentence.',
    { provider: provider as any, model }
  );
  const duration = Date.now() - startTime;
  
  return createSuccessResponse({
    response,
    model,
    provider,
    duration: `${duration}ms`
  });
});

