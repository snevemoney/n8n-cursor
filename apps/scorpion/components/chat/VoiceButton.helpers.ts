/**
 * VoiceButton Helper Functions
 * Power of 10 Rule 3: All functions ≤ 60 lines
 */

// Conditional logging - only in development
const isDev = process.env.NODE_ENV === 'development';
const log = isDev ? console.log : () => {};
const logError = console.error; // Always log errors

const AUDIO_SAMPLE_RATE = 24000;

/**
 * Request microphone permission and get stream
 * Power of 10 Rule 3: ≤ 60 lines
 */
export async function requestMicrophonePermission(): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('Microphone access not available');
  }

  // Check permission state
  let permissionState: PermissionState | null = null;
  try {
    if (navigator.permissions?.query) {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      permissionState = result.state;
      if (permissionState === 'denied') {
        throw new Error('Microphone permission denied. Please enable it in browser settings.');
      }
    }
  } catch (permErr) {
    log('[Voice] Permission API not available');
  }

  // Get microphone stream - try with specific constraints first, fallback to basic if needed
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        channelCount: 1,
        sampleRate: AUDIO_SAMPLE_RATE,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      }
    });
    log('[Voice] ✅ Got stream with specific audio constraints');
    return stream;
  } catch (constraintErr) {
    log('[Voice] ⚠️ Specific constraints failed, trying with basic audio...');
    // Fallback to basic audio constraints
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    log('[Voice] ✅ Got stream with basic audio constraints');
    return stream;
  }
}

/**
 * Verify audio track is active
 * Power of 10 Rule 3: ≤ 60 lines
 */
export function verifyAudioTrack(stream: MediaStream): void {
  log('[Voice] ✅ Microphone permission granted');
  log('[Voice] Stream details:', {
    id: stream.id,
    active: stream.active,
    tracks: stream.getTracks().map(t => ({
      kind: t.kind,
      label: t.label,
      enabled: t.enabled,
      readyState: t.readyState,
      muted: t.muted,
      settings: t.getSettings(),
    }))
  });
  
  // Verify audio track is active
  const audioTracks = stream.getAudioTracks();
  if (audioTracks.length === 0) {
    throw new Error('No audio tracks found in stream');
  }
  
  // Power of 10 Rule 7: Guard against undefined
  const audioTrack = audioTracks[0];
  if (!audioTrack) {
    throw new Error('Audio track not found');
  }
  if (audioTrack.readyState !== 'live') {
    throw new Error(`Audio track not live, state: ${audioTrack.readyState}`);
  }
  
  log('[Voice] ✅ Audio track verified:', {
    label: audioTrack.label,
    enabled: audioTrack.enabled,
    muted: audioTrack.muted,
    readyState: audioTrack.readyState,
  });
}

/**
 * Create session ID
 * Power of 10 Rule 3: ≤ 60 lines
 */
export function createSessionId(): string {
  const sessionId = `voice-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  log('[Voice] Session ID:', sessionId);
  return sessionId;
}

/**
 * Select supported MIME type for MediaRecorder
 * Power of 10 Rule 3: ≤ 60 lines
 */
export function selectMimeType(): string {
  const supportedTypes = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ];
  
  for (const mimeType of supportedTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      log('[Voice] Using MIME type:', mimeType);
      return mimeType;
    }
  }
  
  return 'audio/webm;codecs=opus'; // Default fallback
}

/**
 * Format error message for user display
 * Power of 10 Rule 3: ≤ 60 lines
 */
export function formatError(err: unknown): string {
  if (err instanceof DOMException) {
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      return 'Microphone permission denied. Please click "Allow" in the browser permission popup, or enable microphone access in browser settings and refresh the page.';
    } else if (err.name === 'NotFoundError') {
      return 'No microphone found. Please connect a microphone and try again.';
    } else if (err.name === 'NotReadableError') {
      return 'Microphone is being used by another application. Please close other apps using the microphone.';
    } else if (err.name === 'OverconstrainedError') {
      return 'Microphone constraints not supported. Trying with default settings...';
    } else {
      return `Microphone error: ${err.name} - ${err.message || 'Unknown error'}`;
    }
  } else if (err instanceof Error) {
    return err.message || 'Unknown error occurred';
  } else {
    return `Unknown error: ${String(err)}`;
  }
}

/**
 * Wait for SSE connection to open
 * Power of 10 Rule 3: ≤ 60 lines
 */
export function waitForSSEOpen(eventSource: EventSource, timeoutMs: number = 5000): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('SSE connection timeout'));
    }, timeoutMs);
    
    eventSource.addEventListener('open', () => {
      clearTimeout(timeout);
      log('[Voice] ✅ SSE connection opened');
      resolve();
    });
    
    eventSource.addEventListener('error', (err) => {
      clearTimeout(timeout);
      logError('[Voice] SSE connection error:', err);
      reject(new Error('SSE connection failed'));
    });
  });
}

/**
 * Create SSE URL for voice session
 * Power of 10 Rule 3: ≤ 60 lines
 */
export function createSSEUrl(
  sessionId: string, 
  profile: string, 
  conversationId?: string
): string {
  const params = new URLSearchParams({
    sessionId,
    profile,
  });
  if (conversationId) {
    params.append('conversationId', conversationId);
  }
  return `/api/voice/session?${params.toString()}`;
}

