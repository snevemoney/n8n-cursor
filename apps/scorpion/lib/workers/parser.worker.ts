/**
 * Web Worker for heavy parsing tasks (HAR files, large logs)
 * Keeps main thread responsive
 */

// Web Worker context
const ctx: Worker = self as any;

interface ParseTask {
  id: string;
  type: 'har' | 'logs' | 'json';
  data: string;
}

interface ParseResult {
  id: string;
  success: boolean;
  result?: any;
  error?: string;
}

ctx.addEventListener('message', (event: MessageEvent<ParseTask>) => {
  const task = event.data;
  
  try {
    let result: any;
    
    switch (task.type) {
      case 'har':
        result = parseHAR(task.data);
        break;
      case 'logs':
        result = parseLogs(task.data);
        break;
      case 'json':
        result = JSON.parse(task.data);
        break;
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
    
    const response: ParseResult = {
      id: task.id,
      success: true,
      result,
    };
    
    ctx.postMessage(response);
  } catch (error: any) {
    const response: ParseResult = {
      id: task.id,
      success: false,
      error: error.message,
    };
    
    ctx.postMessage(response);
  }
});

/**
 * Parse HAR (HTTP Archive) file
 */
function parseHAR(data: string): any {
  const har = JSON.parse(data);
  
  if (!har.log || !har.log.entries) {
    throw new Error('Invalid HAR format');
  }
  
  // Extract relevant data
  return {
    entries: har.log.entries.map((entry: any) => ({
      url: entry.request.url,
      method: entry.request.method,
      status: entry.response.status,
      time: entry.time,
      startedDateTime: entry.startedDateTime,
    })),
    totalTime: har.log.entries.reduce((sum: number, e: any) => sum + e.time, 0),
  };
}

/**
 * Parse large log file (newline-delimited)
 */
function parseLogs(data: string): any[] {
  const lines = data.split('\n');
  
  return lines
    .filter(line => line.trim())
    .map((line, index) => {
      try {
        return JSON.parse(line);
      } catch {
        return { raw: line, index };
      }
    });
}

export {};

