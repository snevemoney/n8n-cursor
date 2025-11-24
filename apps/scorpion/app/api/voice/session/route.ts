/**
 * Voice Session API Endpoint
 * 
 * GET /api/voice/session - SSE stream for voice session
 * POST /api/voice/session - Send audio data to voice session
 */

import { NextRequest } from 'next/server';
import { runVoiceSession, createRuntimeConfig, type VoiceFrame } from '@/lib/voice';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Store active sessions
const activeSessions = new Map<string, {
  transport: {
    onAudioInput?: (audio: ArrayBuffer) => Promise<void>;
    onAudioOutput?: (audio: ArrayBuffer) => Promise<void>;
    onTextInput?: (text: string) => Promise<void>;
    onTextOutput?: (text: string) => Promise<void>;
    onError?: (error: Error) => void;
    onEnd?: () => void;
  };
  config: ReturnType<typeof createRuntimeConfig>;
  conversationId?: string;
}>();

export async function GET(req: NextRequest) {
  try {
    console.log('[Voice API] GET request received');
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const profile = (searchParams.get('profile') || 'local') as 'local' | 'hybrid' | 'cloud';
    const conversationId = searchParams.get('conversationId') || undefined;
    
    console.log('[Voice API] Session params:', { sessionId, profile, conversationId });
    
    if (!sessionId) {
      console.error('[Voice API] Missing sessionId');
      return new Response(
        JSON.stringify({ error: 'Missing sessionId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('[Voice API] Creating runtime config for profile:', profile);
    const config = createRuntimeConfig(profile);
    console.log('[Voice API] Config created:', { 
      profile: config.profile, 
      hasStt: !!config.stt, 
      hasLlm: !!config.llm,
      hasTts: !!config.tts 
    });
    
    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let closed = false;
        
        const transport = {
          onAudioInput: undefined as ((audio: ArrayBuffer) => Promise<void>) | undefined,
          onAudioOutput: async (audio: ArrayBuffer) => {
            if (closed) return;
            // Convert ArrayBuffer to base64 for JSON transmission
            const base64 = Buffer.from(audio).toString('base64');
            const frame = {
              type: 'assistant.audio' as const,
              timestamp: Date.now(),
              sessionId,
              data: { audio: base64, sampleRate: 24000, format: 'wav' as const },
            } as VoiceFrame;
            controller.enqueue(encoder.encode(`event: frame\ndata: ${JSON.stringify(frame)}\n\n`));
          },
          onTextInput: async (text: string) => {
            if (closed) return;
            console.log('[Voice API] 📝 Sending transcribed user.text frame to client:', text);
            const frame: VoiceFrame = {
              type: 'user.text',
              timestamp: Date.now(),
              sessionId,
              data: { text },
            };
            const message = `event: frame\ndata: ${JSON.stringify(frame)}\n\n`;
            controller.enqueue(encoder.encode(message));
            console.log('[Voice API] ✅ Transcribed text sent to client via SSE');
          },
          onTextOutput: async (text: string) => {
            if (closed) return;
            const frame: VoiceFrame = {
              type: 'assistant.text',
              timestamp: Date.now(),
              sessionId,
              data: { text },
            };
            controller.enqueue(encoder.encode(`event: frame\ndata: ${JSON.stringify(frame)}\n\n`));
          },
          onError: (error: Error) => {
            if (closed) return;
            controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`));
          },
          onEnd: () => {
            if (closed) return;
            const frame: VoiceFrame = {
              type: 'system.end',
              timestamp: Date.now(),
              sessionId,
              data: { reason: 'user_quit' },
            };
            controller.enqueue(encoder.encode(`event: frame\ndata: ${JSON.stringify(frame)}\n\n`));
            controller.close();
            closed = true;
            activeSessions.delete(sessionId);
          },
        };
        
        // Start voice session FIRST (this sets up onAudioInput handler)
        console.log('[Voice API] Starting voice session...');
        runVoiceSession(sessionId, transport, config, conversationId).catch((error: unknown) => {
          console.error('[Voice API] Error in runVoiceSession:', error);
          if (!closed) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: errorMessage })}\n\n`));
            controller.close();
            closed = true;
            activeSessions.delete(sessionId);
          }
        });
        
        // Store session AFTER runVoiceSession sets up handlers
        console.log('[Voice API] Storing session:', sessionId);
        activeSessions.set(sessionId, { transport, config, conversationId });
        console.log('[Voice API] Active sessions count:', activeSessions.size);
        console.log('[Voice API] onAudioInput handler set:', !!transport.onAudioInput);
        
        // Handle client disconnect
        req.signal.addEventListener('abort', () => {
          if (!closed) {
            controller.close();
            closed = true;
            activeSessions.delete(sessionId);
          }
        });
      },
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('[Voice API] POST request received');
    const contentType = req.headers.get('content-type') || '';
    
    let sessionId: string | null = null;
    let audioBuffer: ArrayBuffer | null = null;
    
    // Handle FormData (optimized binary upload) - check FIRST before parsing JSON
    if (contentType.includes('multipart/form-data')) {
      console.log('[Voice API] Processing FormData upload');
      const formData = await req.formData();
      const audioFile = formData.get('audio') as File | null;
      sessionId = formData.get('sessionId') as string | null;
      const typeFromForm = formData.get('type') as string | null;
      
      console.log('[Voice API] FormData fields:', { 
        hasAudio: !!audioFile, 
        audioSize: audioFile?.size,
        sessionId,
        type: typeFromForm 
      });
      
      if (audioFile && sessionId && typeFromForm === 'user.audio') {
        audioBuffer = await audioFile.arrayBuffer();
        console.log('[Voice API] Audio buffer from FormData, size:', audioBuffer.byteLength);
      } else {
        return new Response(
          JSON.stringify({ error: 'Missing audio file, sessionId, or invalid type' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } 
    // Handle JSON (legacy support)
    else if (contentType.includes('application/json')) {
      console.log('[Voice API] Processing JSON upload');
      const body = await req.json();
      const { audio, type } = body;
      sessionId = body.sessionId;
      
      console.log('[Voice API] JSON body:', { 
        sessionId, 
        type, 
        hasAudio: !!audio, 
        audioLength: Array.isArray(audio) ? audio.length : 'not array' 
      });
      
      if (type === 'user.audio' && audio && Array.isArray(audio)) {
        audioBuffer = new Uint8Array(audio).buffer;
        console.log('[Voice API] Audio buffer from JSON, size:', audioBuffer.byteLength);
      }
    } else {
      return new Response(
        JSON.stringify({ error: 'Unsupported content type. Use multipart/form-data or application/json' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (!sessionId || typeof sessionId !== 'string') {
      console.error('[Voice API] Invalid sessionId:', sessionId);
      return new Response(
        JSON.stringify({ error: 'Invalid sessionId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (!audioBuffer || audioBuffer.byteLength === 0) {
      console.error('[Voice API] Invalid or empty audio buffer');
      return new Response(
        JSON.stringify({ error: 'Invalid or empty audio data' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('[Voice API] Looking up session:', sessionId);
    console.log('[Voice API] Active sessions:', Array.from(activeSessions.keys()));
    const session = activeSessions.get(sessionId);
    if (!session) {
      console.error('[Voice API] Session not found:', sessionId);
      return new Response(
        JSON.stringify({ error: 'Session not found. Make sure SSE connection is established first.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('[Voice API] Session found, processing audio...');
    if (session.transport.onAudioInput) {
      console.log('[Voice API] ✅ Calling onAudioInput handler, audio size:', audioBuffer.byteLength);
      try {
        await session.transport.onAudioInput(audioBuffer);
        console.log('[Voice API] ✅ onAudioInput handler completed successfully');
      } catch (err) {
        console.error('[Voice API] ❌ Error in onAudioInput handler:', err);
        throw err;
      }
    } else {
      console.error('[Voice API] ❌ onAudioInput handler not set! Session may not be initialized yet.');
      return new Response(
        JSON.stringify({ error: 'Session not ready. Please wait a moment and try again.' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Voice API] POST error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

