/**
 * Ollama Auto-Start Utility
 * Automatically starts Ollama if it's not running
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface OllamaStatus {
  running: boolean;
  pid?: number;
  started?: boolean;
}

// Track if we've already started Ollama in this process
let ollamaProcess: ReturnType<typeof spawn> | null = null;
let ollamaStartAttempted = false;

/**
 * Check if Ollama is running by checking the port
 */
async function isOllamaRunning(ollamaUrl: string = 'http://localhost:11434'): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
    
    const response = await fetch(`${ollamaUrl}/api/tags`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Check if Ollama process is running by checking for the process
 */
async function isOllamaProcessRunning(): Promise<boolean> {
  try {
    const platform = process.platform;
    
    if (platform === 'darwin' || platform === 'linux') {
      // Check for ollama process
      const { stdout } = await execAsync('pgrep -f "ollama serve" || true');
      return stdout.trim().length > 0;
    } else if (platform === 'win32') {
      // Windows: check for ollama.exe
      const { stdout } = await execAsync('tasklist /FI "IMAGENAME eq ollama.exe" 2>NUL | find /I /N "ollama.exe"');
      return stdout.trim().length > 0;
    }
    
    return false;
  } catch {
    return false;
  }
}

/**
 * Start Ollama server automatically
 */
async function startOllamaServer(): Promise<{ success: boolean; error?: string }> {
  // Don't attempt to start if we've already tried
  if (ollamaStartAttempted && ollamaProcess) {
    return { success: true };
  }
  
  ollamaStartAttempted = true;
  
  try {
    const platform = process.platform;
    
    // Check if ollama command exists
    try {
      if (platform === 'win32') {
        await execAsync('where ollama');
      } else {
        await execAsync('which ollama');
      }
    } catch {
      return {
        success: false,
        error: 'Ollama is not installed. Please install it from https://ollama.ai'
      };
    }
    
    // Check if it's already running
    const isRunning = await isOllamaRunning();
    if (isRunning) {
      return { success: true };
    }
    
    // Check if process is running but not responding
    const processRunning = await isOllamaProcessRunning();
    if (processRunning) {
      // Process exists but not responding - wait a bit and check again
      await new Promise(resolve => setTimeout(resolve, 2000));
      const stillRunning = await isOllamaRunning();
      if (stillRunning) {
        return { success: true };
      }
    }
    
    // Start Ollama server
    console.log('🔄 Starting Ollama server automatically...');
    
    if (platform === 'win32') {
      // Windows: start in background
      spawn('ollama', ['serve'], {
        detached: true,
        stdio: 'ignore',
        shell: true
      }).unref();
    } else {
      // Unix-like: start in background
      ollamaProcess = spawn('ollama', ['serve'], {
        detached: true,
        stdio: 'ignore'
      });
      ollamaProcess.unref();
    }
    
    // Wait for Ollama to start (max 10 seconds)
    const maxWait = 10000;
    const checkInterval = 500;
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWait) {
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      const running = await isOllamaRunning();
      if (running) {
        console.log('✅ Ollama server started successfully');
        return { success: true };
      }
    }
    
    // If we get here, Ollama didn't start in time
    return {
      success: false,
      error: 'Ollama server did not start within 10 seconds. Please start it manually: `ollama serve`'
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to start Ollama: ${error.message}`
    };
  }
}

/**
 * Ensure Ollama is running - checks and starts if needed
 */
export async function ensureOllamaRunning(ollamaUrl: string = 'http://localhost:11434'): Promise<OllamaStatus> {
  // Quick check first
  const isRunning = await isOllamaRunning(ollamaUrl);
  if (isRunning) {
    return { running: true };
  }
  
  // Try to start it
  const startResult = await startOllamaServer();
  if (startResult.success) {
    // Verify it's actually running now
    const nowRunning = await isOllamaRunning(ollamaUrl);
    return {
      running: nowRunning,
      started: !isRunning && nowRunning
    };
  }
  
  return {
    running: false
  };
}

/**
 * Get Ollama status without attempting to start
 */
export async function getOllamaStatus(ollamaUrl: string = 'http://localhost:11434'): Promise<OllamaStatus> {
  const running = await isOllamaRunning(ollamaUrl);
  return { running };
}

