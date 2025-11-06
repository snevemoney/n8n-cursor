import { describe, it, expect, vi, beforeEach } from 'vitest';
import { callLanguageModel } from '../ai-service';

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn()
  }
}));

import axios from 'axios';
const mockedAxios = vi.mocked(axios);

describe('callLanguageModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up environment for server-side testing
    process.env.OPENAI_API_KEY = 'test-key';
  });

  it('calls OpenAI API directly when server-side with API key', async () => {
    const mockResponse = {
      data: {
        choices: [{
          message: {
            content: 'Test response'
          }
        }],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30
        }
      }
    };

    mockedAxios.post.mockResolvedValue(mockResponse);

    const result = await callLanguageModel({
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'test message' }],
    });

    expect(result).toEqual({
      text: 'Test response',
      model: 'gpt-4',
      usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      expect.objectContaining({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'test message' }]
      }),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-key'
        })
      })
    );
  });

  it('handles API errors gracefully', async () => {
    mockedAxios.post.mockRejectedValue(new Error('API Error'));

    await expect(callLanguageModel({
      model: 'gpt-4',
      messages: [],
    })).rejects.toThrow('API Error');
  });
});
