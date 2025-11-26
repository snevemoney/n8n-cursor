/**
 * Voice Mode - Utility Functions
 * 
 * Power of 10 Rule 3: Helper functions ≤ 60 lines
 */

import type { VoiceFrame } from './types';

/**
 * Invariant helper for safety checks
 * Power of 10 Rule 6: Use assertions for safety
 */
export function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Invariant violation: ${message}`);
  }
}

/**
 * Create a frame with proper typing
 */
export function createFrame<T extends VoiceFrame['type']>(
  type: T,
  sessionId: string,
  data: VoiceFrame['data']
): VoiceFrame {
  return {
    type,
    timestamp: Date.now(),
    sessionId,
    data,
  } as VoiceFrame;
}

/**
 * Check if frame is a specific type
 */
export function isFrameType<T extends VoiceFrame['type']>(
  frame: VoiceFrame,
  type: T
): frame is Extract<VoiceFrame, { type: T }> {
  return frame.type === type;
}

/**
 * Validate frame structure
 */
export function validateFrame(frame: unknown): frame is VoiceFrame {
  if (!frame || typeof frame !== 'object') {
    return false;
  }
  
  const f = frame as Record<string, unknown>;
  
  if (typeof f['type'] !== 'string' || typeof f['timestamp'] !== 'number' || typeof f['sessionId'] !== 'string') {
    return false;
  }
  
  if (f['data'] === undefined || f['data'] === null) {
    return false;
  }
  
  return true;
}

