# Voice Mode - Scorpion Voice Interface

## Overview

Voice Mode adds a voice interface to Scorpion following the Pipecat pattern: a simple, inspectable pipeline that processes audio through Speech-to-Text (STT), chat, and Text-to-Speech (TTS) stages.

## Architecture

### Pipeline Flow

```
Mic Audio → STT → User Text → Chat → Assistant Text → TTS → Speaker Audio
```

### Components

1. **Frame Types**: Typed data structures for each stage
   - `user.audio` - Raw audio input
   - `user.text` - Transcribed user speech
   - `assistant.text` - Generated response text
   - `assistant.audio` - Synthesized speech output

2. **Processors**: Small, pure functions (≤ 60 lines each)
   - `sttProcessor` - Converts audio to text
   - `chatProcessor` - Calls Scorpion chat orchestrator
   - `ttsProcessor` - Converts text to audio

3. **Session Management**: Handles interruptions and lifecycle
   - Only one active LLM generation per session
   - New speech cancels previous generation
   - Clean shutdown on "quit" or "exit"

## Runtime Profiles

### Local Profile

All processing happens locally:
- **STT**: Local Whisper service (default: `http://localhost:8000`)
- **LLM**: Ollama (default: `http://localhost:11434`)
- **TTS**: Kokoro or Piper (default: `http://localhost:5000`)

### Hybrid Profile

Mix of local and cloud:
- **STT**: Local Whisper
- **LLM**: Local Ollama
- **TTS**: Cloud (OpenAI) or local

### Cloud Profile

All processing in cloud:
- **STT**: OpenAI Whisper API
- **LLM**: OpenAI GPT-4
- **TTS**: OpenAI TTS API

## Setup

### Prerequisites

For **local** profile:

1. **Whisper STT Service**:
   ```bash
   # Run Whisper API server
   # Example: https://github.com/openai/whisper
   docker run -p 8000:8000 whisper-api
   ```

2. **Ollama** (already configured):
   ```bash
   ollama serve
   ```

3. **TTS Service** (Kokoro or Piper):
   ```bash
   # Example with Kokoro
   # See: https://github.com/hexgrad/kokoro
   python kokoro-server.py --port 5000
   ```

### Environment Variables

```bash
# Local profile (default)
WHISPER_URL=http://localhost:8000
OLLAMA_URL=http://localhost:11434
TTS_URL=http://localhost:5000
TTS_VOICE=default

# Hybrid profile
TTS_PROVIDER=openai
OPENAI_API_KEY=your-key-here

# Cloud profile
OPENAI_API_KEY=your-key-here
OPENAI_MODEL=gpt-4
```

## Usage

### Basic Example

```typescript
import { runVoiceSession, createRuntimeConfig } from '@/lib/voice';

const config = createRuntimeConfig('local');
const sessionId = 'session-123';

const transport = {
  onAudioInput: async (audio: ArrayBuffer) => {
    // Handle incoming audio
  },
  onAudioOutput: async (audio: ArrayBuffer) => {
    // Play audio to speakers
  },
  onTextInput: async (text: string) => {
    console.log('User said:', text);
  },
  onTextOutput: async (text: string) => {
    console.log('Assistant said:', text);
  },
  onError: (error: Error) => {
    console.error('Error:', error);
  },
  onEnd: () => {
    console.log('Session ended');
  },
};

await runVoiceSession(sessionId, transport, config);
```

### With Web Audio API

```typescript
import { runVoiceSession, createRuntimeConfig } from '@/lib/voice';

// Get microphone input
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const audioContext = new AudioContext();
const source = audioContext.createMediaStreamSource(stream);

// Setup audio processing
const processor = audioContext.createScriptProcessor(4096, 1, 1);
processor.onaudioprocess = (e) => {
  const audioData = e.inputBuffer.getChannelData(0);
  const buffer = new ArrayBuffer(audioData.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < audioData.length; i++) {
    view.setInt16(i * 2, audioData[i] * 0x7FFF, true);
  }
  transport.onAudioInput?.(buffer);
};

source.connect(processor);
processor.connect(audioContext.destination);

// Setup output
const outputContext = new AudioContext();
const playAudio = (audioBuffer: ArrayBuffer) => {
  outputContext.decodeAudioData(audioBuffer).then((buffer) => {
    const source = outputContext.createBufferSource();
    source.buffer = buffer;
    source.connect(outputContext.destination);
    source.start();
  });
};

const transport = {
  onAudioInput: async (audio: ArrayBuffer) => {
    // Process input
  },
  onAudioOutput: async (audio: ArrayBuffer) => {
    playAudio(audio);
  },
  // ... other handlers
};

const config = createRuntimeConfig('local');
await runVoiceSession('session-123', transport, config);
```

## API Endpoint

### POST /api/voice/session

Create a new voice session:

```typescript
// Request
{
  sessionId: string;
  profile?: 'local' | 'hybrid' | 'cloud';
  conversationId?: string;
}

// Response (SSE stream)
event: frame
data: {
  type: 'user.audio' | 'user.text' | 'assistant.text' | 'assistant.audio' | 'system.end';
  timestamp: number;
  sessionId: string;
  data: unknown;
}
```

## Power of 10 Compliance

All code follows Power of 10 safety guidelines:

- ✅ **No unbounded loops**: All loops have explicit `MAX_ITERATIONS`
- ✅ **Functions ≤ 60 lines**: All processors are small and focused
- ✅ **No recursion**: Iterative processing only
- ✅ **Type safety**: All frames and contexts are fully typed
- ✅ **Invariant checks**: Safety assertions at critical points
- ✅ **Error handling**: Proper error types and guards

## Interruption Handling

Voice sessions handle interruptions gracefully:

1. **User speaks while assistant is generating**:
   - Current generation is aborted
   - New STT processing starts immediately
   - Previous TTS is cancelled

2. **User says "quit" or "exit"**:
   - Session ends cleanly
   - All resources are released
   - `onEnd` callback is fired

3. **Error occurs**:
   - Error is passed to `onError` handler
   - Session can continue or be terminated
   - No silent failures

## Testing

### Test with Text Input

```typescript
const transport = {
  onTextInput: async (text: string) => {
    console.log('Input:', text);
  },
  onTextOutput: async (text: string) => {
    console.log('Output:', text);
  },
  // ... minimal handlers
};

await runVoiceSession('test-123', transport, createRuntimeConfig('local'));

// Simulate text input
transport.onTextInput?.('Hello, how are you?');
```

### Test with Audio File

```typescript
// Load audio file
const audioFile = await fetch('/test-audio.wav');
const audioBuffer = await audioFile.arrayBuffer();

const transport = {
  onAudioInput: async (audio: ArrayBuffer) => {
    // Process audio
  },
  // ... handlers
};

await runVoiceSession('test-123', transport, createRuntimeConfig('local'));
transport.onAudioInput?.(audioBuffer);
```

## Troubleshooting

### STT Not Working

1. Check Whisper service is running:
   ```bash
   curl http://localhost:8000/health
   ```

2. Verify audio format (should be WAV, 16kHz, mono)

3. Check environment variables:
   ```bash
   echo $WHISPER_URL
   ```

### TTS Not Working

1. Check TTS service is running:
   ```bash
   curl http://localhost:5000/health
   ```

2. For Kokoro, ensure model files are available

3. For cloud TTS, verify API keys:
   ```bash
   echo $OPENAI_API_KEY
   ```

### Chat Not Responding

1. Verify Ollama is running:
   ```bash
   curl http://localhost:11434/api/tags
   ```

2. Check model is available:
   ```bash
   ollama list
   ```

3. Test chat endpoint directly:
   ```bash
   curl -X POST http://localhost:3003/api/chat/stream \
     -H "Content-Type: application/json" \
     -d '{"messages": [{"role": "user", "content": "test"}]}'
   ```

## Future Enhancements

- [ ] WebSocket transport for real-time streaming
- [ ] VAD (Voice Activity Detection) for automatic turn-taking
- [ ] Streaming TTS for lower latency
- [ ] Multi-language support
- [ ] Custom wake words
- [ ] Conversation history management
- [ ] Audio effects and filters

