/**
 * Integration test for /api/llm/providers endpoint
 * Verifies the route returns correct structure and handles errors gracefully
 */

import { describe, it, expect } from 'vitest';

describe('GET /api/llm/providers', () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
  const endpoint = `${API_URL}/api/llm/providers`;

  it('should return 200 OK', async () => {
    const response = await fetch(endpoint);
    expect(response.status).toBe(200);
  });

  it('should return JSON with success field', async () => {
    const response = await fetch(endpoint);
    const data = await response.json();
    
    expect(data).toHaveProperty('success');
    expect(typeof data.success).toBe('boolean');
  });

  it('should return provider status data when successful', async () => {
    const response = await fetch(endpoint);
    const data = await response.json();
    
    if (data.success) {
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('selected');
      expect(data.data).toHaveProperty('all');
      expect(data.data).toHaveProperty('recommendation');
      expect(Array.isArray(data.data.all)).toBe(true);
    }
  });

  it('should handle errors gracefully', async () => {
    // Even if providers fail, the route should return a response
    const response = await fetch(endpoint);
    const data = await response.json();
    
    // Should always return a response (either success or error)
    expect(data).toBeDefined();
    expect(typeof data).toBe('object');
  });

  it('should return valid provider types', async () => {
    const response = await fetch(endpoint);
    const data = await response.json();
    
    if (data.success && data.data?.all) {
      const validProviders = ['ollama', 'vllm', 'openai', 'llamacpp'];
      data.data.all.forEach((provider: any) => {
        expect(validProviders).toContain(provider.provider);
        expect(typeof provider.available).toBe('boolean');
        expect(typeof provider.healthy).toBe('boolean');
        expect(typeof provider.priority).toBe('number');
      });
    }
  });
});

