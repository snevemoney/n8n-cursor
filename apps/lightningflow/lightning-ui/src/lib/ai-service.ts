// AI service that connects to OpenAI API
import axios from 'axios';

export interface LLMUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface LLMResponse {
  text: string;
  model: string;
  usage: LLMUsage;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMRequest {
  model: string;
  messages: LLMMessage[];
  temperature?: number;
  max_tokens?: number;
}

/**
 * Call OpenAI API directly or through our proxy based on environment
 */
export async function callLanguageModel(request: LLMRequest): Promise<LLMResponse> {
  // If OPENAI_API_KEY is available (server-side), use it directly
  // Otherwise use our own proxy endpoint (client-side)
  const apiKey = process.env.OPENAI_API_KEY;
  const isServerSide = typeof window === 'undefined';
  
  try {
    let response;
    
    if (isServerSide && apiKey) {
      // Direct call to OpenAI (server-side)
      response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: request.model,
          messages: request.messages,
          temperature: request.temperature ?? 0.7,
          max_tokens: request.max_tokens ?? 1000
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          }
        }
      );
      
      return {
        text: response.data.choices[0].message.content,
        model: request.model,
        usage: {
          prompt_tokens: response.data.usage.prompt_tokens,
          completion_tokens: response.data.usage.completion_tokens,
          total_tokens: response.data.usage.total_tokens
        }
      };
    } else {
      // Call through our proxy (client-side)
      response = await axios.post('/api/proxy/openai', {
        model: request.model,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.max_tokens ?? 1000
      });
      
      return {
        text: response.data.choices[0].message.content,
        model: request.model,
        usage: {
          prompt_tokens: response.data.usage.prompt_tokens,
          completion_tokens: response.data.usage.completion_tokens,
          total_tokens: response.data.usage.total_tokens
        }
      };
    }
  } catch (error) {
    console.error('Error calling language model:', error);
    throw error;
  }
}
