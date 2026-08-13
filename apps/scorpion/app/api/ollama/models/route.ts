import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ollama/models
 * 
 * Lists available Ollama models. Returns graceful error responses when Ollama is unavailable.
 * The UI should handle these errors and show fallback options.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    // Use environment variable if available, otherwise use query param or default
    const ollamaUrl = searchParams.get('url') || process.env['OLLAMA_URL'] || 'http://localhost:11434';
    const timeoutMs = parseInt(process.env['OLLAMA_TIMEOUT_MS'] || '10000', 10);

    // Validate URL format
    try {
      new URL(ollamaUrl);
    } catch {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid Ollama URL',
          message: `Invalid Ollama URL format: ${ollamaUrl}`,
          available: false,
          models: []
        },
        { status: 400 }
      );
    }

    // Proxy request to Ollama to list models with configurable timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    let response: Response;
    try {
      response = await fetch(`${ollamaUrl}/api/tags`, {
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      // Handle timeout
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { 
            success: false,
            error: 'Request timeout',
            message: `Failed to connect to Ollama at ${ollamaUrl} within ${timeoutMs / 1000} seconds`,
            details: 'Ollama may not be running or is not accessible. Make sure Ollama is running: `ollama serve`',
            available: false,
            models: [],
            fallbackAvailable: !!process.env['OPENAI_API_KEY']
          },
          { status: 200 } // Return 200 so UI can handle gracefully
        );
      }

      // Handle connection errors
      const errorMsg = fetchError.message || fetchError.toString() || '';
      const isConnectionError = 
        errorMsg.includes('ECONNREFUSED') || 
        errorMsg.includes('fetch failed') ||
        errorMsg.includes('Failed to fetch') ||
        errorMsg.includes('NetworkError') ||
        errorMsg.includes('ERR_CONNECTION_REFUSED') ||
        fetchError.code === 'ECONNREFUSED' ||
        fetchError.cause?.code === 'ECONNREFUSED';

      if (isConnectionError) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Connection refused',
            message: `Cannot connect to Ollama at ${ollamaUrl}`,
            details: 'Ollama may not be running. Start it with: `ollama serve`',
            available: false,
            models: [],
            fallbackAvailable: !!process.env['OPENAI_API_KEY']
          },
          { status: 200 } // Return 200 so UI can handle gracefully
        );
      }

      throw fetchError;
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      return NextResponse.json(
        { 
          success: false,
          error: `Ollama API error: ${response.status}`,
          message: errorText || `Ollama returned status ${response.status}`,
          status: response.status,
          available: false,
          models: [],
          fallbackAvailable: !!process.env['OPENAI_API_KEY']
        },
        { status: 200 } // Return 200 so UI can handle gracefully
      );
    }

    // Parse JSON response with error handling
    let data: any;
    try {
      const responseText = await response.text();
      if (!responseText || responseText.trim() === '') {
        throw new Error('Empty response from Ollama');
      }
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Ollama response:', parseError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid response format',
          message: 'Ollama returned invalid JSON response',
          details: parseError instanceof Error ? parseError.message : 'Unknown parsing error',
          available: false,
          models: [],
          fallbackAvailable: !!process.env['OPENAI_API_KEY']
        },
        { status: 200 } // Return 200 so UI can handle gracefully
      );
    }

    return NextResponse.json({
      success: true,
      available: true,
      models: Array.isArray(data.models) ? data.models : [],
      source: 'ollama'
    });
  } catch (error) {
    // Enhanced error logging for debugging
    console.error('[Ollama Models API] Error:', error);
    if (error instanceof Error) {
      console.error('[Ollama Models API] Error name:', error.name);
      console.error('[Ollama Models API] Error message:', error.message);
      console.error('[Ollama Models API] Error stack:', error.stack);
      if (error.cause) {
        console.error('[Ollama Models API] Error cause:', error.cause);
      }
    } else {
      console.error('[Ollama Models API] Non-Error object:', typeof error, error);
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to connect to Ollama';
    
    // Always return 200 with error details so UI can handle gracefully
    // This prevents Next.js from returning a 500 error
    try {
      return NextResponse.json(
        { 
          success: false,
          error: 'Internal server error',
          message: errorMessage,
          details: process.env['NODE_ENV'] === 'development' 
            ? (error instanceof Error ? error.stack : String(error))
            : 'An unexpected error occurred while fetching models from Ollama',
          available: false,
          models: [],
          fallbackAvailable: !!process.env['OPENAI_API_KEY']
        },
        { status: 200 } // Return 200 so UI can handle gracefully
      );
    } catch (responseError) {
      // If even creating the response fails, log it but don't throw
      console.error('[Ollama Models API] Failed to create error response:', responseError);
      // Return a minimal safe response
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Internal server error',
          message: 'Failed to process request',
          available: false,
          models: [],
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
}

