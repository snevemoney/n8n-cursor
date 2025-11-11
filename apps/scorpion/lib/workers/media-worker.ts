/**
 * Media Processing Worker
 * Handles media processing with SSD-aware optimizations
 */

import { getMediaTempDir, getMediaProcessingConcurrency, getMediaProcessingMaxFileSize } from '../storage/performance-optimizer';
import { isUsingSSD } from '../storage/storage-config';

export interface MediaJob {
  id: string;
  operation: 'transcribe' | 'clip' | 'edit' | 'convert' | 'process';
  inputPath: string;
  outputPath?: string;
  options?: Record<string, any>;
}

export interface MediaJobResult {
  id: string;
  success: boolean;
  outputPath?: string;
  error?: string;
  duration: number;
}

let workerInitialized = false;
const jobQueue: MediaJob[] = [];
const activeJobs = new Map<string, Promise<MediaJobResult>>();
let maxConcurrency = 1;

/**
 * Initialize media worker
 */
export async function initializeMediaWorker(): Promise<void> {
  if (workerInitialized) {
    return;
  }

  maxConcurrency = await getMediaProcessingConcurrency();
  workerInitialized = true;
  
  const usingSSD = await isUsingSSD();
  console.log(`🎬 Media worker initialized: ${maxConcurrency} concurrent jobs (${usingSSD ? 'SSD' : 'HDD'} mode)`);
}

/**
 * Process a media job
 */
async function processMediaJob(job: MediaJob): Promise<MediaJobResult> {
  const startTime = Date.now();
  
  try {
    // Get temp directory (SSD if available)
    const tempDir = await getMediaTempDir();
    const maxFileSize = await getMediaProcessingMaxFileSize();
    
    // Check file size
    const fs = await import('fs/promises');
    const stats = await fs.stat(job.inputPath);
    if (stats.size > maxFileSize) {
      throw new Error(`File size ${stats.size} exceeds maximum ${maxFileSize} bytes for local processing`);
    }

    // Process based on operation type
    let outputPath: string;
    
    switch (job.operation) {
      case 'transcribe':
        outputPath = await processTranscribe(job, tempDir);
        break;
      case 'clip':
        outputPath = await processClip(job, tempDir);
        break;
      case 'edit':
        outputPath = await processEdit(job, tempDir);
        break;
      case 'convert':
        outputPath = await processConvert(job, tempDir);
        break;
      default:
        throw new Error(`Unknown operation: ${job.operation}`);
    }

    const duration = Date.now() - startTime;
    return {
      id: job.id,
      success: true,
      outputPath,
      duration,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    return {
      id: job.id,
      success: false,
      error: error.message || 'Unknown error',
      duration,
    };
  }
}

/**
 * Process transcription (placeholder - to be implemented with Whisper)
 */
async function processTranscribe(job: MediaJob, tempDir: string): Promise<string> {
  // TODO: Implement with Whisper or external API
  throw new Error('Transcription not yet implemented');
}

/**
 * Process video clipping (placeholder - to be implemented with FFmpeg)
 */
async function processClip(job: MediaJob, tempDir: string): Promise<string> {
  // TODO: Implement with FFmpeg
  throw new Error('Video clipping not yet implemented');
}

/**
 * Process media editing (placeholder - to be implemented with FFmpeg)
 */
async function processEdit(job: MediaJob, tempDir: string): Promise<string> {
  // TODO: Implement with FFmpeg
  throw new Error('Media editing not yet implemented');
}

/**
 * Process format conversion (placeholder - to be implemented with FFmpeg)
 */
async function processConvert(job: MediaJob, tempDir: string): Promise<string> {
  // TODO: Implement with FFmpeg
  throw new Error('Format conversion not yet implemented');
}

/**
 * Queue a media job for processing
 */
export async function queueMediaJob(job: MediaJob): Promise<Promise<MediaJobResult>> {
  await initializeMediaWorker();

  // Check if we can process immediately
  if (activeJobs.size < maxConcurrency) {
    const promise = processMediaJob(job);
    activeJobs.set(job.id, promise);
    
    promise.finally(() => {
      activeJobs.delete(job.id);
      // Process next job in queue
      processNextJob();
    });
    
    return promise;
  }

  // Queue the job
  jobQueue.push(job);
  
  // Return a promise that resolves when the job is processed
  return new Promise((resolve) => {
    const checkQueue = setInterval(() => {
      const queuedJob = jobQueue.find(j => j.id === job.id);
      if (!queuedJob) {
        // Job was picked up
        clearInterval(checkQueue);
        const activePromise = activeJobs.get(job.id);
        if (activePromise) {
          activePromise.then(resolve);
        }
      }
    }, 100);
  });
}

/**
 * Process next job in queue
 */
async function processNextJob(): Promise<void> {
  if (jobQueue.length === 0 || activeJobs.size >= maxConcurrency) {
    return;
  }

  const job = jobQueue.shift();
  if (!job) {
    return;
  }

  const promise = processMediaJob(job);
  activeJobs.set(job.id, promise);
  
  promise.finally(() => {
    activeJobs.delete(job.id);
    processNextJob();
  });
}

/**
 * Get worker status
 */
export async function getWorkerStatus(): Promise<{
  initialized: boolean;
  maxConcurrency: number;
  activeJobs: number;
  queuedJobs: number;
  usingSSD: boolean;
}> {
  await initializeMediaWorker();
  
  return {
    initialized: workerInitialized,
    maxConcurrency,
    activeJobs: activeJobs.size,
    queuedJobs: jobQueue.length,
    usingSSD: await isUsingSSD(),
  };
}

