'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { 
  requestMicrophonePermission, 
  verifyAudioTrack, 
  createSessionId, 
  selectMimeType, 
  formatError,
  waitForSSEOpen,
  createSSEUrl
} from './VoiceButton.helpers';

interface VoiceButtonProps {
  onTextReceived?: (text: string) => void;
  onTranscriptionReceived?: (text: string) => void;
  conversationId?: string;
  profile?: 'local' | 'hybrid' | 'cloud';
}

// Constants - extracted for better performance
const LIVE_TRANSCRIPTION_INTERVAL = 2000; // 2 seconds
// const SOUND_THRESHOLD = 5; // Reserved for future VAD UI indicators
const VAD_FFT_SIZE = 512;
const VAD_SMOOTHING = 0.8;
const AUDIO_SAMPLE_RATE = 24000;
const MIN_AUDIO_SIZE = 50; // Minimum audio chunk size to process (bytes) - lowered for better detection
const MAX_RETRIES = 3; // Power of 10 Rule 2: Bounded retries

// Conditional logging - only in development
const isDev = process.env.NODE_ENV === 'development';
const log = isDev ? console.log : () => {};
const logError = console.error; // Always log errors

/**
 * Voice State Machine - Power of 10 Rule 1: No recursion, explicit state
 */
export type VoiceState = 'idle' | 'connecting' | 'active' | 'stopping' | 'error';

/**
 * Optimized Voice Button Component
 * Handles voice input/output for chat with performance optimizations
 * Power of 10 Rule 3: Functions ≤ 60 lines, Rule 1: No recursion
 */
export function VoiceButton({ 
  onTextReceived, 
  onTranscriptionReceived, 
  conversationId, 
  profile = 'local' 
}: VoiceButtonProps) {
  // State machine - Power of 10 Rule 6: Smallest scope, explicit state
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [error, setError] = useState<string | null>(null);
  
  // State ref for closures - Power of 10 Rule 1: No recursion, explicit state access
  const voiceStateRef = useRef<VoiceState>(voiceState);
  voiceStateRef.current = voiceState;
  
  // Refs for stable references
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const isStoppingRef = useRef(false);
  const audioCheckRef = useRef<number | null>(null);
  const lastTranscriptionTimeRef = useRef(0);
  const vadAudioContextRef = useRef<AudioContext | null>(null);
  const audioChunksRef = useRef<Blob[]>([]); // Persist audio chunks across intervals
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const manualDataRequestRef = useRef<NodeJS.Timeout | null>(null);
  

  // Helper: Cleanup media recorder
  const cleanupMediaRecorder = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        logError('[Voice] Error stopping recorder:', e);
      }
    }
  }, []);

  // Helper: Cleanup audio contexts
  const cleanupAudioContexts = useCallback(() => {
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(logError);
      audioContextRef.current = null;
    }
    if (vadAudioContextRef.current) {
      vadAudioContextRef.current.close().catch(logError);
      vadAudioContextRef.current = null;
    }
  }, []);

  // Helper: Cleanup intervals
  const cleanupIntervals = useCallback(() => {
    if (audioCheckRef.current !== null) {
      cancelAnimationFrame(audioCheckRef.current);
      audioCheckRef.current = null;
    }
    if (healthCheckIntervalRef.current) {
      clearInterval(healthCheckIntervalRef.current);
      healthCheckIntervalRef.current = null;
    }
    if (manualDataRequestRef.current) {
      clearInterval(manualDataRequestRef.current);
      manualDataRequestRef.current = null;
    }
  }, []);

  // Optimized cleanup function - Power of 10 Rule 3: ≤ 60 lines
  // State machine transition: active|connecting -> stopping -> idle|error
  const stopVoiceSession = useCallback(() => {
    // Guard: only allow stop from active or connecting states
    // Power of 10 Rule 4: Assertions - validate state before transition
    if (voiceState !== 'active' && voiceState !== 'connecting') {
      // Only warn if not in idle (idle is expected during cleanup/unmount)
      if (voiceState !== 'idle') {
        log('[Voice] ⚠️ Stop called from invalid state:', voiceState);
      }
      return;
    }
    
    setVoiceState('stopping');
    isStoppingRef.current = true;
    cleanupIntervals();
    cleanupMediaRecorder();
    
    // Stop all tracks - Power of 10 Rule 7: Always handle resources
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      mediaStreamRef.current = null;
    }
    
    cleanupAudioContexts();
    
    // Close SSE connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    // Reset refs
    sessionIdRef.current = null;
    lastTranscriptionTimeRef.current = 0;
    audioChunksRef.current = [];
    isStoppingRef.current = false;
    
    // Transition to idle
    setVoiceState('idle');
    setError(null);
  }, [voiceState, cleanupIntervals, cleanupMediaRecorder, cleanupAudioContexts]);

  // Helper: Prepare FormData for audio upload
  const prepareAudioFormData = useCallback((audioBlob: Blob, sessionId: string): FormData => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');
    formData.append('sessionId', sessionId);
    formData.append('type', 'user.audio');
    return formData;
  }, []);

  // Optimized audio sending - Power of 10 Rule 3: ≤ 60 lines, Rule 2: Bounded retries
  const sendAudioToServer = useCallback(async (audioBlob: Blob, sessionId: string) => {
    if (audioBlob.size < MIN_AUDIO_SIZE) {
      log('[Voice] ⚠️ Audio too small, skipping:', audioBlob.size, 'bytes');
      return;
    }
    
    // Power of 10 Rule 2: Bounded retries
    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        log('[Voice] 📤 Preparing to send audio:', {
          blobSize: audioBlob.size,
          blobType: audioBlob.type,
          sessionId,
          attempt: retries + 1
        });
        
        const arrayBuffer = await audioBlob.arrayBuffer();
        if (arrayBuffer.byteLength === 0) {
          log('[Voice] ⚠️ ArrayBuffer is empty, skipping');
          return;
        }
        
        const formData = prepareAudioFormData(audioBlob, sessionId);
        const startTime = Date.now();
        
        const response = await fetch('/api/voice/session', {
          method: 'POST',
          body: formData,
        });

        const duration = Date.now() - startTime;
        log('[Voice] Response received:', {
          status: response.status,
          duration: duration + 'ms'
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        
        await response.json();
        log('[Voice] ✅ Audio sent successfully');
        return; // Success, exit retry loop
      } catch (err) {
        retries++;
        if (retries >= MAX_RETRIES) {
          logError('[Voice] ❌ Error sending audio after', MAX_RETRIES, 'retries:', err);
          const errorMessage = err instanceof Error ? err.message : 'Failed to send audio';
          setError(errorMessage);
          setVoiceState('error'); // Power of 10 Rule 7: Handle errors explicitly
          throw err;
        }
        log('[Voice] ⚠️ Retry', retries, 'of', MAX_RETRIES);
        // Wait before retry (bounded delay)
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }
    }
  }, [prepareAudioFormData]);

  // Optimized audio playback
  const playAudio = useCallback(async (audioBase64: string, audioContext: AudioContext) => {
    try {
      const binaryString = atob(audioBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    } catch (err) {
      logError('[Voice] Error playing audio:', err);
    }
  }, []);

  // Optimized VAD check with requestAnimationFrame
  const setupVAD = useCallback((stream: MediaStream) => {
    const audioContext = new AudioContext();
    vadAudioContextRef.current = audioContext;
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = VAD_FFT_SIZE;
    analyser.smoothingTimeConstant = VAD_SMOOTHING;
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let isRunning = true;
    
    const checkAudio = () => {
      if (!isRunning || !mediaStreamRef.current || isStoppingRef.current) {
        return;
      }
      
      analyser.getByteFrequencyData(dataArray);
      
      // Optimized calculation - single pass
      let sum = 0;
      let peak = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const value = dataArray[i];
        if (value !== undefined) {
          sum += value;
          if (value > peak) peak = value;
        }
      }
      
      // VAD detection - can be used for UI indicators if needed
      // Note: voiceState already tracks active/listening state
      // const average = dataArray.length > 0 ? sum / dataArray.length : 0;
      // const isSpeaking = average > SOUND_THRESHOLD || peak > SOUND_THRESHOLD * 3;
      
      if (isRunning && !isStoppingRef.current) {
        audioCheckRef.current = requestAnimationFrame(checkAudio);
      }
    };
    
    checkAudio();
    
    return () => {
      isRunning = false;
      if (audioCheckRef.current !== null) {
        cancelAnimationFrame(audioCheckRef.current);
      }
    };
  }, []);

  // Helper: Setup SSE event handlers - Power of 10 Rule 1: State machine transitions
  const setupSSEEventHandlers = useCallback((
    eventSource: EventSource,
    audioContext: AudioContext,
    onStateChange: (newState: VoiceState) => void
  ) => {
    eventSource.addEventListener('frame', (event) => {
      try {
        const frame = JSON.parse(event.data);
        log('[Voice] Received frame:', frame.type);
        
        if (frame.type === 'user.text') {
          const text = (frame.data as { text: string }).text;
          log('[Voice] 📝 Transcribed:', text);
          onTranscriptionReceived?.(text);
        } else if (frame.type === 'assistant.text') {
          const text = (frame.data as { text: string }).text;
          log('[Voice] 💬 Assistant:', text);
          onTextReceived?.(text);
        } else if (frame.type === 'assistant.audio') {
          const audioData = (frame.data as { audio: string }).audio;
          log('[Voice] 🔊 Playing audio');
          playAudio(audioData, audioContext);
        } else if (frame.type === 'system.end') {
          log('[Voice] System end');
          onStateChange('idle');
          stopVoiceSession();
        }
      } catch (err) {
        logError('[Voice] Error processing frame:', err);
      }
    });

    eventSource.addEventListener('error', (err) => {
      logError('[Voice] SSE error:', err);
      setError('Connection error');
      onStateChange('error');
      stopVoiceSession();
    });
  }, [onTranscriptionReceived, onTextReceived, playAudio, stopVoiceSession]);

  // Helper: Setup MediaRecorder data handler - Power of 10 Rule 5: Assertions
  const setupMediaRecorderDataHandler = useCallback((
    mediaRecorder: MediaRecorder,
    selectedMimeType: string,
    getCurrentState: () => VoiceState
  ) => {
    mediaRecorder.ondataavailable = async (event) => {
      // Power of 10 Rule 5: Assertion - only process in active state
      const currentState = getCurrentState();
      if (currentState !== 'active') {
        log('[Voice] ⚠️ Dropping chunk - not in active state:', currentState);
        return;
      }
      
      log('[Voice] 📦 ondataavailable fired, size:', event.data.size, 'bytes, state:', mediaRecorder.state);
      
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
        log('[Voice] Audio chunk collected, total chunks:', audioChunksRef.current.length);
      } else {
        log('[Voice] ⚠️ Empty data chunk received');
      }
      
      const now = Date.now();
      if (now - lastTranscriptionTimeRef.current >= LIVE_TRANSCRIPTION_INTERVAL) {
        if (audioChunksRef.current.length === 0) {
          log('[Voice] ⚠️ No audio chunks to send');
          return;
        }
        
        lastTranscriptionTimeRef.current = now;
        const audioBlob = new Blob(audioChunksRef.current, { type: selectedMimeType });
        audioChunksRef.current = [];
        
        if (audioBlob.size < MIN_AUDIO_SIZE || isStoppingRef.current) {
          return;
        }
        
        const currentSessionId = sessionIdRef.current;
        if (!currentSessionId || !eventSourceRef.current || eventSourceRef.current.readyState !== EventSource.OPEN) {
          return;
        }
        
        try {
          await sendAudioToServer(audioBlob, currentSessionId);
        } catch (err) {
          logError('[Voice] ❌ Error sending audio:', err);
          setError(err instanceof Error ? err.message : 'Failed to send audio');
          setVoiceState('error');
        }
      }
    };
  }, [sendAudioToServer]);

  // Helper: Setup MediaRecorder event handlers
  const setupMediaRecorderEventHandlers = useCallback((mediaRecorder: MediaRecorder) => {
    mediaRecorder.onerror = (event) => {
      logError('[Voice] ❌ MediaRecorder error:', event);
      setError('Recording error occurred');
    };

    mediaRecorder.onstart = () => {
      log('[Voice] ✅ MediaRecorder started successfully');
    };

    mediaRecorder.onstop = () => {
      if (!isStoppingRef.current) {
        log('[Voice] MediaRecorder stopped');
        // State machine handles processing state via voiceState
      }
    };
  }, []);

  // Helper: Setup manual data request interval
  const setupManualDataRequest = useCallback(() => {
    manualDataRequestRef.current = setInterval(() => {
      if (isStoppingRef.current) {
        if (manualDataRequestRef.current) {
          clearInterval(manualDataRequestRef.current);
          manualDataRequestRef.current = null;
        }
        return;
      }
      
      const recorder = mediaRecorderRef.current;
      if (recorder?.state === 'recording') {
        try {
          recorder.requestData();
          log('[Voice] 🔄 Manually requested data from MediaRecorder');
        } catch (err) {
          logError('[Voice] Error requesting data:', err);
        }
      }
    }, LIVE_TRANSCRIPTION_INTERVAL);
  }, []);

  // Helper: Setup health check interval
  const setupHealthCheck = useCallback(() => {
    healthCheckIntervalRef.current = setInterval(() => {
      if (isStoppingRef.current) {
        if (manualDataRequestRef.current) {
          clearInterval(manualDataRequestRef.current);
          manualDataRequestRef.current = null;
        }
        if (healthCheckIntervalRef.current) {
          clearInterval(healthCheckIntervalRef.current);
          healthCheckIntervalRef.current = null;
        }
        return;
      }
      
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== 'recording') {
        logError('[Voice] ❌ MediaRecorder not recording! State:', recorder.state);
        setError('Recording stopped unexpectedly');
        if (manualDataRequestRef.current) {
          clearInterval(manualDataRequestRef.current);
          manualDataRequestRef.current = null;
        }
        if (healthCheckIntervalRef.current) {
          clearInterval(healthCheckIntervalRef.current);
          healthCheckIntervalRef.current = null;
        }
      }
    }, 5000);
  }, []);

  // Helper: Start MediaRecorder with intervals - Power of 10 Rule 3: ≤ 60 lines
  const startMediaRecorderWithIntervals = useCallback((mediaRecorder: MediaRecorder) => {
    log('[Voice] Starting MediaRecorder with interval:', LIVE_TRANSCRIPTION_INTERVAL, 'ms');
    mediaRecorder.start(LIVE_TRANSCRIPTION_INTERVAL);
    log('[Voice] ✅ MediaRecorder.start() called, state:', mediaRecorder.state);
    
    setTimeout(() => {
      if (mediaRecorder.state === 'recording') {
        log('[Voice] ✅ MediaRecorder confirmed recording');
      } else {
        logError('[Voice] ❌ MediaRecorder not recording! State:', mediaRecorder.state);
        setError('Failed to start recording');
      }
    }, 100);
    
    setupManualDataRequest();
    setupHealthCheck();
  }, [setupManualDataRequest, setupHealthCheck]);

  // Optimized start function - Power of 10 Rule 3: ≤ 60 lines, Rule 1: State machine
  const startVoiceSession = useCallback(async () => {
    // Power of 10 Rule 5: Assertion - guard against invalid transitions
    // Only allow start from idle or error states
    if (voiceState !== 'idle' && voiceState !== 'error') {
      log('[Voice] ⚠️ Start called from invalid state:', voiceState);
      return;
    }
    
    try {
      setVoiceState('connecting');
      setError(null);
      log('[Voice] Starting voice session');

      const stream = await requestMicrophonePermission();
      verifyAudioTrack(stream);
      mediaStreamRef.current = stream;

      const audioContext = new AudioContext({ sampleRate: AUDIO_SAMPLE_RATE });
      audioContextRef.current = audioContext;

      const sessionId = createSessionId();
      sessionIdRef.current = sessionId;

      const sseUrl = createSSEUrl(sessionId, profile, conversationId);
      log('[Voice] Connecting to SSE:', sseUrl);
      const eventSource = new EventSource(sseUrl);
      eventSourceRef.current = eventSource;

      await waitForSSEOpen(eventSource);
      setupSSEEventHandlers(eventSource, audioContext, setVoiceState);

      log('[Voice] Setting up MediaRecorder...');
      const selectedMimeType = selectMimeType();
      const mediaRecorder = new MediaRecorder(stream, { mimeType: selectedMimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Pass state getter to data handler - use ref to get current state
      setupMediaRecorderDataHandler(mediaRecorder, selectedMimeType, () => voiceStateRef.current);
      setupMediaRecorderEventHandlers(mediaRecorder);
      startMediaRecorderWithIntervals(mediaRecorder);
      setupVAD(stream);
      
      // Transition to active after successful setup
      setVoiceState('active');
    } catch (err) {
      logError('[Voice] ❌ Error starting session:', err);
      const errorMessage = formatError(err);
      setError(errorMessage);
      setVoiceState('error');
      // Cleanup on error
      stopVoiceSession();
      setTimeout(() => setError(null), 10000);
    }
  }, [
    voiceState,
    profile, 
    conversationId, 
    setupSSEEventHandlers, 
    setupMediaRecorderDataHandler, 
    setupMediaRecorderEventHandlers, 
    startMediaRecorderWithIntervals, 
    setupVAD, 
    stopVoiceSession
  ]);

  // Toggle handler - Power of 10 Rule 1: State machine transitions
  const handleToggle = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Guard against spam - Power of 10 Rule 2: Bounded behavior
    if (voiceState === 'connecting' || voiceState === 'stopping') {
      log('[Voice] ⚠️ Ignoring toggle - in transition state:', voiceState);
      return;
    }
    
    if (voiceState === 'active') {
      stopVoiceSession();
    } else if (voiceState === 'idle' || voiceState === 'error') {
      await startVoiceSession();
    }
  }, [voiceState, startVoiceSession, stopVoiceSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopVoiceSession();
    };
  }, [stopVoiceSession]);

  // Derive UI state from voiceState - Power of 10 Rule 6: Smallest scope
  const isDisabled = voiceState === 'connecting' || voiceState === 'stopping';
  const isActive = voiceState === 'active';
  const isConnecting = voiceState === 'connecting';
  const hasError = voiceState === 'error';
  
  // Status text for UX - Power of 10 Rule 3: Small function
  const getStatusText = (): string => {
    switch (voiceState) {
      case 'idle': return 'Idle';
      case 'connecting': return 'Connecting...';
      case 'active': return 'Listening...';
      case 'stopping': return 'Stopping...';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };
  
  const getTitle = (): string => {
    switch (voiceState) {
      case 'idle': return 'Start voice mode';
      case 'connecting': return 'Connecting...';
      case 'active': return 'Stop voice mode';
      case 'stopping': return 'Stopping...';
      case 'error': return `Error: ${error || 'Unknown error'}. Click to retry.`;
      default: return 'Voice mode';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        data-voice-button="true"
        onClick={handleToggle}
        type="button"
        disabled={isDisabled}
        className={`
          relative flex items-center justify-center w-10 h-10 rounded-lg
          transition-all duration-200
          ${isActive 
            ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' 
            : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
          }
          ${isActive ? 'ring-2 ring-emerald-400/50 animate-pulse' : ''}
          ${hasError ? 'ring-2 ring-red-500/50' : ''}
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        title={getTitle()}
        aria-label={getTitle()}
      >
        {isActive ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        {hasError && (
          <span 
            className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" 
            title={error || 'Error'} 
          />
        )}
        {isConnecting && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
          </span>
        )}
      </button>
      {/* Status text for UX polish */}
      {voiceState !== 'idle' && (
        <span className="text-xs text-white/60">
          {getStatusText()}
        </span>
      )}
    </div>
  );
}
