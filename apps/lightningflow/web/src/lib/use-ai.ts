import { apiPath } from '@/lib/base-path';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface Message {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface UseAIOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  onError?: (error: Error) => void;
  onTokenUsage?: (usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number }) => void;
}

export function useAI(options: UseAIOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // Default options
  const {
    model = 'gpt-3.5-turbo',
    temperature = 0.7,
    max_tokens = 1000,
    onError,
    onTokenUsage,
  } = options;

  // Function to generate a response from the OpenAI API
  const generateResponse = useCallback(
    async (messages: Message[]): Promise<Message> => {
      // Create a new abort controller for this request
      const controller = new AbortController();
      setAbortController(controller);
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(apiPath('/api/proxy/openai'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages,
            temperature,
            max_tokens,
          }),
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          // Handle rate limits or quota exceeded
          if (response.status === 429) {
            toast.error('AI usage limit exceeded', {
              description: 'You have reached your monthly AI usage limit.'
            });
          }
          
          throw new Error(data.error || 'Unknown error occurred');
        }

        // Track token usage
        if (onTokenUsage && data.usage) {
          onTokenUsage(data.usage);
        }

        // Return the response
        return {
          role: 'assistant',
          content: data.choices[0].message.content,
        };
      } catch (err: any) {
        const error = new Error(err.message || 'Failed to generate AI response');
        setError(error);
        
        if (onError) {
          onError(error);
        }
        
        throw error;
      } finally {
        setIsLoading(false);
        setAbortController(null);
      }
    },
    [model, temperature, max_tokens, onError, onTokenUsage]
  );

  // Function to cancel ongoing requests
  const cancelRequest = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setIsLoading(false);
    }
  }, [abortController]);

  // Helper function to create a system prompt
  const createSystemPrompt = useCallback((content: string): Message => {
    return {
      role: 'system',
      content,
    };
  }, []);

  return {
    generateResponse,
    cancelRequest,
    createSystemPrompt,
    isLoading,
    error,
  };
} 