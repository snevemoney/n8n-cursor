/**
 * Screen recording utilities for tutorial generator tool
 */

export interface RecordingOptions {
  audio?: boolean;
  video?: boolean;
  screen?: boolean;
  browserTab?: boolean;
}

export interface RecordingState {
  isRecording: boolean;
  stream: MediaStream | null;
  recorder: MediaRecorder | null;
  chunks: Blob[];
}

/**
 * Start screen recording
 */
export async function startScreenRecording(options: RecordingOptions = {}): Promise<RecordingState> {
  const { audio = true, video = true, screen = true, browserTab = false } = options;
  
  try {
    let stream: MediaStream;
    
    if (screen || browserTab) {
      // Request screen capture
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: browserTab ? 'browser' : 'screen',
        } as any,
        audio: audio,
      });
    } else {
      // Request camera/microphone
      stream = await navigator.mediaDevices.getUserMedia({
        video: video,
        audio: audio,
      });
    }
    
    const recorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
    });
    
    const chunks: Blob[] = [];
    
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };
    
    recorder.start();
    
    return {
      isRecording: true,
      stream,
      recorder,
      chunks,
    };
  } catch (error: any) {
    throw new Error(`Failed to start recording: ${error.message}`);
  }
}

/**
 * Stop screen recording and get blob
 */
export async function stopScreenRecording(state: RecordingState): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (!state.recorder || !state.isRecording) {
      reject(new Error('No active recording'));
      return;
    }
    
    state.recorder.onstop = () => {
      const blob = new Blob(state.chunks, { type: 'video/webm' });
      
      // Stop all tracks
      state.stream?.getTracks().forEach(track => track.stop());
      
      resolve(blob);
    };
    
    state.recorder.stop();
    state.isRecording = false;
  });
}

/**
 * Capture screenshot from video stream
 */
export async function captureScreenshot(stream: MediaStream): Promise<Blob> {
  const video = document.createElement('video');
  video.srcObject = stream;
  video.play();
  
  return new Promise((resolve, reject) => {
    video.onloadedmetadata = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      ctx.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      }, 'image/png');
    };
    
    video.onerror = reject;
  });
}

/**
 * Convert blob to base64
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

