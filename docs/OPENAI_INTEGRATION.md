# 🚀 OpenAI API Integration - Hybrid Approach

## Overview

Scorpion now has **comprehensive OpenAI API integration** while maintaining a **hybrid approach**:
- **Fast & Local**: Ollama for quick responses, local processing
- **Smart & Advanced**: OpenAI for advanced features (function calling, vision, audio, embeddings)

## ✅ What's Integrated

### 1. **Core OpenAI Service** (`packages/scorpion-core/src/llm/openai-service.ts`)
- Full OpenAI API coverage (Chat, Assistants, Embeddings, Audio, Images, Files, Batch, Fine-tuning)
- Smart retry logic and error handling
- Singleton pattern for efficient usage

### 2. **Completed User Tools**
- ✅ **`user.transcribe`** - Audio/video transcription using OpenAI Whisper
- ✅ **`user.image`** - Image generation using OpenAI DALL-E 3

### 3. **Hybrid RAG Embeddings**
- Ollama embeddings (default, fast, local)
- OpenAI embeddings (optional, better quality) - Enable with `USE_OPENAI_EMBEDDINGS=true`

### 4. **Function Calling Integration**
- Bridge between OpenAI function calling and Scorpion's existing tool system
- Converts tool specs to OpenAI function definitions
- Executes tools seamlessly

### 5. **API Routes**
- `/api/openai/embeddings` - Generate embeddings
- `/api/openai/audio/transcribe` - Transcribe audio
- `/api/openai/images/generate` - Generate images

## 🔧 Configuration

### Environment Variables

```bash
# Required for OpenAI features
OPENAI_API_KEY=sk-...

# Optional: Enable OpenAI embeddings for RAG (default: Ollama)
USE_OPENAI_EMBEDDINGS=true

# Optional: Enable OpenAI function calling (default: true if API key set)
USE_OPENAI_FUNCTION_CALLING=true
```

## 📖 Usage Examples

### 1. Using OpenAI Service Directly

```typescript
import { getOpenAIService, isOpenAIAvailable } from '@scorpion/core/llm';

if (isOpenAIAvailable()) {
  const openai = getOpenAIService();
  
  // Chat completion
  const response = await openai.chatCompletion({
    messages: [{ role: 'user', content: 'Hello!' }],
    model: 'gpt-4o-mini',
  });
  
  // Embeddings
  const embedding = await openai.embedText('Hello world');
  
  // Image generation
  const image = await openai.createImage({
    prompt: 'A beautiful sunset',
    model: 'dall-e-3',
  });
}
```

### 2. Hybrid Embeddings in RAG

```typescript
// RAG store automatically uses OpenAI embeddings if:
// 1. USE_OPENAI_EMBEDDINGS=true
// 2. OPENAI_API_KEY is set
// Otherwise falls back to Ollama (default)

const store = await getRAGStore();
await store.addKnowledge(knowledge); // Uses best available embedding method
```

### 3. Function Calling with Existing Tools

```typescript
import { getOpenAIFunctions, executeToolCall } from '@/lib/chat/openai-function-calling';
import { getOpenAIService } from '@scorpion/core/llm';

// Get OpenAI function definitions from Scorpion tools
const functions = getOpenAIFunctions();

// Use with OpenAI chat completion
const openai = getOpenAIService();
const response = await openai.chatWithFunctions(
  [{ role: 'user', content: 'Search the knowledge base for workflows' }],
  functions,
  { model: 'gpt-4o' }
);

// Execute tool calls
if (response.choices[0].message.tool_calls) {
  for (const toolCall of response.choices[0].message.tool_calls) {
    const result = await executeToolCall(
      toolCall.function.name,
      JSON.parse(toolCall.function.arguments)
    );
  }
}
```

### 4. Using Completed User Tools

```typescript
// Transcription
import { handler as transcribeHandler } from '@/lib/chat/tools/user-tools/transcribe';

const result = await transcribeHandler({
  file: base64AudioFile,
  includeSummary: true,
  includeActions: true,
});

// Image Generation
import { handler as imageGenHandler } from '@/lib/chat/tools/user-tools/image-gen';

const result = await imageGenHandler({
  prompt: 'A futuristic cityscape',
  style: 'realistic',
  aspectRatio: '16:9',
  useCase: 'social-post',
});
```

## 🎯 Hybrid Strategy

### When to Use Ollama (Default)
- ✅ Fast, local responses
- ✅ No API costs
- ✅ Privacy-sensitive operations
- ✅ Simple chat completions
- ✅ Basic embeddings (default)

### When to Use OpenAI
- ✅ Function calling (structured tool use)
- ✅ Advanced embeddings (better quality)
- ✅ Audio transcription (Whisper)
- ✅ Image generation (DALL-E)
- ✅ Vision API (image understanding)
- ✅ Assistants API (persistent conversations)
- ✅ JSON mode (structured outputs)

## 🔄 Integration Points

### Existing Systems Enhanced
1. **RAG Store** - Optional OpenAI embeddings
2. **Chat Tools** - Function calling support
3. **User Tools** - Completed TODOs with OpenAI
4. **Agents** - Can use OpenAI for advanced features

### New Capabilities
1. **Audio Transcription** - Complete implementation
2. **Image Generation** - Complete implementation
3. **Function Calling** - Bridge to existing tools
4. **API Routes** - Direct access to OpenAI features

## 🚦 Smart Routing

The system automatically routes requests:
- **Ollama**: Default for speed and local processing
- **OpenAI**: Used when:
  - Feature requires OpenAI (transcription, images, vision)
  - `USE_OPENAI_EMBEDDINGS=true` for embeddings
  - Function calling is enabled
  - Explicitly requested

## 📊 Performance Considerations

- **Ollama**: ~50-200ms (local, no network)
- **OpenAI**: ~500-2000ms (network, better quality)
- **Hybrid**: Best of both worlds

## 🔐 Security

- API keys stored in environment variables
- No keys exposed in client code
- All OpenAI calls server-side only

## 🎓 Next Steps

1. **Assistants API** - Persistent agent conversations (TODO)
2. **Settings UI** - Configure OpenAI options (TODO)
3. **Vision API** - Image understanding integration
4. **Batch API** - Bulk processing for workflows

## 📚 References

- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Scorpion Core LLM](../packages/scorpion-core/src/llm/)
- [Chat Tools](../apps/scorpion/lib/chat/tools/)

