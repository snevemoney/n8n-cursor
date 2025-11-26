# 🎬 FFmpeg Integration Plan for Scorpion (8GB RAM)

## Executive Summary

**Recommendation**: **Hybrid Architecture** - Use local ffmpeg for lightweight operations, external APIs for heavy processing.

**Memory Budget**:
- Services: ~3GB (worker 1.5GB, Redis 512MB, n8n 1GB)
- Available: ~5GB for system + ffmpeg
- **ffmpeg worker limit: 1-2GB max**

---

## 🎯 Where FFmpeg Fits

### 1. **Media Processing Worker** (New Component)
**Location**: `apps/scorpion/lib/workers/media-worker.ts`

**Purpose**: Background processing for media operations
- Queue-based processing (BullMQ)
- Memory-efficient streaming
- Automatic cleanup

**Memory Strategy**:
- Process one job at a time (concurrency: 1)
- Stream processing (don't load entire file into memory)
- Use temp files with automatic cleanup
- Limit video resolution/bitrate for processing

### 2. **API Routes** (Existing Structure)
**Location**: `apps/scorpion/app/api/media/`

**Routes**:
- `POST /api/media/transcribe` - Audio/video transcription
- `POST /api/media/clip` - Video clip extraction
- `POST /api/media/edit` - Media editing operations
- `POST /api/media/process` - Generic processing endpoint

### 3. **User Tools** (Already Defined, Need Implementation)
**Location**: `apps/scorpion/lib/chat/tools/user-tools/`

**Tools to Implement**:
- ✅ `user.transcribe` - Currently TODO
- ✅ `user.video-clip` - Currently TODO  
- ✅ `user.media-edit` - Currently TODO

### 4. **n8n Workflows** (Integration Point)
**Location**: `workflows/shared/`

**Existing**: Already using external ffmpeg API (`fal-ai/ffmpeg-api`)
**Enhancement**: Add local ffmpeg option for simple operations

---

## 🏗️ Architecture

### Option A: Local FFmpeg Worker (Recommended for Simple Ops)

```
┌─────────────────┐
│  User Tool      │
│  (API Route)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Media Queue    │ ◄─── Redis (512MB)
│  (BullMQ)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  FFmpeg Worker  │ ◄─── 1-2GB RAM limit
│  (Concurrency:1)│     Stream processing
└────────┬────────┘     Auto cleanup
         │
         ▼
┌─────────────────┐
│  Temp Storage   │ ◄─── /tmp (64MB tmpfs)
│  (Streaming)    │
└─────────────────┘
```

**Memory Usage**:
- Worker: 1-2GB (single job)
- Temp files: 64MB tmpfs
- Redis queue: 512MB (shared)
- **Total: ~2.5GB peak**

### Option B: External API (For Heavy Operations)

```
┌─────────────────┐
│  User Tool      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Decision Logic │ ◄─── Route based on:
│  (Local vs API) │     - File size
└────────┬────────┘     - Operation complexity
         │               - Current memory usage
    ┌────┴────┐
    │        │
    ▼        ▼
┌────────┐ ┌──────────────┐
│ Local  │ │ External API│
│ FFmpeg │ │ (fal.ai)    │
└────────┘ └──────────────┘
```

**Decision Criteria**:
- **Local**: < 100MB files, simple operations (trim, merge, convert)
- **External**: > 100MB files, complex operations (effects, filters, encoding)

---

## 💾 Memory Optimization Strategies

### 1. **Streaming Processing**
```typescript
// Don't load entire file into memory
const inputStream = fs.createReadStream(inputPath);
const outputStream = fs.createWriteStream(outputPath);

// Use ffmpeg streaming
ffmpeg(inputStream)
  .output(outputStream)
  .on('end', () => cleanup())
```

### 2. **Single Job Processing**
```typescript
const mediaWorker = new Worker('media-jobs', processMedia, {
  concurrency: 1, // Only one job at a time
  limiter: {
    max: 1,
    duration: 1000
  }
});
```

### 3. **Memory Limits**
```typescript
// Set ffmpeg memory limits
process.env.FFMPEG_MEMORY_LIMIT = '1g';
process.env.NODE_OPTIONS = '--max-old-space-size=1024';
```

### 4. **Automatic Cleanup**
```typescript
// Cleanup temp files after processing
const tempDir = path.join(os.tmpdir(), 'scorpion-media');
// Auto-cleanup after 1 hour
setTimeout(() => cleanupTempFiles(), 3600000);
```

### 5. **Resolution/Quality Limits**
```typescript
// Limit processing resolution for memory efficiency
const MAX_RESOLUTION = '1080p'; // Don't process 4K locally
const MAX_BITRATE = '5M'; // Limit bitrate
```

---

## 📦 Implementation Plan

### Phase 1: Basic Infrastructure (Week 1)

1. **Create Media Worker**
   ```bash
   apps/scorpion/lib/workers/media-worker.ts
   ```
   - BullMQ worker setup
   - Basic ffmpeg wrapper
   - Memory monitoring

2. **Create API Routes**
   ```bash
   apps/scorpion/app/api/media/
   ├── transcribe/route.ts
   ├── clip/route.ts
   └── edit/route.ts
   ```

3. **Add Docker Support**
   ```dockerfile
   # Add to Dockerfile
   RUN apt-get update && apt-get install -y ffmpeg
   ```

### Phase 2: Implement User Tools (Week 2)

1. **Implement `user.transcribe`**
   - Use `whisper.cpp` or external API
   - Stream audio processing
   - Return transcription + summary

2. **Implement `user.video-clip`**
   - Analyze video (use external API for analysis)
   - Extract clips locally (lightweight)
   - Return clips + timecodes

3. **Implement `user.media-edit`**
   - Simple edits locally (trim, merge)
   - Complex edits via external API
   - Return edited media

### Phase 3: Integration & Optimization (Week 3)

1. **n8n Workflow Integration**
   - Add local ffmpeg option to existing workflows
   - Create new media processing workflows
   - Monitor memory usage

2. **Monitoring & Alerts**
   - Memory usage tracking
   - Queue depth monitoring
   - Auto-fallback to external API if memory high

---

## 🔧 Technical Details

### Dependencies

```json
{
  "fluent-ffmpeg": "^2.1.2",
  "bullmq": "^5.0.0",
  "ioredis": "^5.3.2"
}
```

### Worker Configuration

```typescript
const mediaWorker = new Worker('media-jobs', async (job) => {
  const { operation, inputPath, outputPath, options } = job.data;
  
  // Memory check
  const memUsage = process.memoryUsage();
  if (memUsage.heapUsed > 1.5 * 1024 * 1024 * 1024) { // 1.5GB
    throw new Error('Memory limit exceeded, use external API');
  }
  
  // Process with streaming
  return await processMedia(operation, inputPath, outputPath, options);
}, {
  concurrency: 1,
  limiter: { max: 1, duration: 1000 },
  removeOnComplete: { count: 10 },
  removeOnFail: { count: 5 }
});
```

### Memory Monitoring

```typescript
function checkMemoryUsage(): boolean {
  const usage = process.memoryUsage();
  const heapUsedMB = usage.heapUsed / 1024 / 1024;
  const heapTotalMB = usage.heapTotal / 1024 / 1024;
  
  // Alert if > 80% of 2GB limit
  if (heapUsedMB > 1600) {
    console.warn(`High memory usage: ${heapUsedMB.toFixed(2)}MB`);
    return false; // Reject new jobs
  }
  
  return true;
}
```

---

## 📊 Resource Allocation

### Current System (8GB Total)

| Component | Memory | Notes |
|-----------|--------|-------|
| System | ~1GB | OS, base services |
| Worker | 1.5GB | Existing worker |
| Redis | 512MB | Queue storage |
| n8n | 1GB | Workflow engine |
| **Available** | **~4GB** | For ffmpeg + buffer |

### With FFmpeg Worker

| Component | Memory | Notes |
|-----------|--------|-------|
| System | ~1GB | OS, base services |
| Worker | 1.5GB | Existing worker |
| **FFmpeg Worker** | **1-2GB** | **Media processing** |
| Redis | 512MB | Queue storage |
| n8n | 1GB | Workflow engine |
| **Buffer** | **~1.5GB** | Safety margin |

**Recommendation**: Start with 1GB limit, increase to 2GB if needed.

---

## 🚨 Fallback Strategy

### Auto-Fallback Logic

```typescript
async function processMediaWithFallback(operation: MediaOperation) {
  // Check if should use local or external
  const shouldUseLocal = 
    operation.fileSize < 100 * 1024 * 1024 && // < 100MB
    operation.complexity === 'simple' &&
    checkMemoryUsage();
  
  if (shouldUseLocal) {
    try {
      return await processLocally(operation);
    } catch (error) {
      if (error.message.includes('memory')) {
        console.warn('Memory limit hit, falling back to external API');
        return await processExternally(operation);
      }
      throw error;
    }
  } else {
    return await processExternally(operation);
  }
}
```

---

## ✅ Success Criteria

1. **Memory**: Never exceed 7GB total usage
2. **Performance**: Process < 100MB files in < 30 seconds
3. **Reliability**: Auto-fallback to external API on memory issues
4. **Monitoring**: Track memory usage, queue depth, processing times

---

## 📝 Next Steps

1. **Review this plan** - Confirm approach
2. **Set up infrastructure** - Create worker, API routes
3. **Implement Phase 1** - Basic ffmpeg integration
4. **Test memory usage** - Verify 8GB constraints
5. **Implement user tools** - Complete the three TODO tools
6. **Monitor & optimize** - Fine-tune based on usage

---

## 🔗 Related Files

- `apps/scorpion/lib/chat/tools/user-tools/transcribe.ts` - TODO implementation
- `apps/scorpion/lib/chat/tools/user-tools/video-clip.ts` - TODO implementation
- `apps/scorpion/lib/chat/tools/user-tools/media-editor.ts` - TODO implementation
- `workflows/shared/___create_viral_ads_with_nanobanana___seedance__publish_on_socials_via_upload_post___vide.json` - Existing ffmpeg workflow
- `apps/n8n-cursor/backend/src/workers/workflow-worker.ts` - Worker pattern reference

