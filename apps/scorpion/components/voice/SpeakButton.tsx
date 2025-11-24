'use client';

/**
 * Speak Button Component
 * Power of 10 Rule 3: Functions ≤ 60 lines, Rule 1: No recursion
 */

import { useState, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface SpeakButtonProps {
  text: string;
  className?: string;
}

// Power of 10 Rule 2: Bounded retries
const MAX_RETRIES = 3;

/**
 * Speak Button - Power of 10 Rule 3: ≤ 60 lines
 */
export function SpeakButton({ text, className = '' }: SpeakButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const speakText = useCallback(async () => {
    if (!text || text.trim().length === 0) {
      setError('No text to speak');
      return;
    }

    setIsSpeaking(true);
    setError(null);

    // Power of 10 Rule 2: Bounded retries
    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        const response = await fetch('/api/voice/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();
        if (result.ok) {
          setIsSpeaking(false);
          return; // Success
        } else {
          throw new Error(result.error || 'Failed to speak');
        }
      } catch (err) {
        retries++;
        if (retries >= MAX_RETRIES) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to speak text';
          setError(errorMessage);
          setIsSpeaking(false);
          return;
        }
        // Wait before retry (bounded delay)
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }
    }
  }, [text]);

  return (
    <button
      onClick={speakText}
      disabled={isSpeaking || !text || text.trim().length === 0}
      className={`
        flex items-center gap-1 px-2 py-1 rounded text-xs
        transition-colors
        ${isSpeaking 
          ? 'bg-cyan-500/20 text-cyan-400 cursor-wait' 
          : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
        }
        ${error ? 'ring-1 ring-red-500/50' : ''}
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      title={error || (isSpeaking ? 'Speaking...' : 'Read aloud')}
    >
      {isSpeaking ? (
        <VolumeX className="h-3 w-3 animate-pulse" />
      ) : (
        <Volume2 className="h-3 w-3" />
      )}
      <span>{isSpeaking ? 'Speaking...' : 'Read'}</span>
    </button>
  );
}

