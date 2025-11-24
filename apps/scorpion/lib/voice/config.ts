/**
 * Voice Mode - Runtime Configuration
 * 
 * Power of 10 Rule 5: Typed configuration
 */

import type { RuntimeConfig, RuntimeProfile } from './types';

/**
 * Create default runtime config based on profile
 */
export function createRuntimeConfig(profile: RuntimeProfile = 'local'): RuntimeConfig {
  const config: RuntimeConfig = {
    profile,
  };
  
  if (profile === 'local') {
    config.stt = {
      provider: 'whisper',
      endpoint: process.env['WHISPER_URL'] || 'http://localhost:8000',
    };
    
    config.llm = {
      provider: 'ollama',
      model: process.env['OLLAMA_MODEL'] || 'llama3.1:8b',
      endpoint: process.env['OLLAMA_URL'] || 'http://localhost:11434',
    };
    
    config.tts = {
      provider: 'kokoro',
      endpoint: process.env['TTS_URL'] || 'http://localhost:5000',
      voice: process.env['TTS_VOICE'] || 'default',
    };
  } else if (profile === 'hybrid') {
    config.stt = {
      provider: 'whisper',
      endpoint: process.env['WHISPER_URL'] || 'http://localhost:8000',
    };
    
    config.llm = {
      provider: 'ollama',
      model: process.env['OLLAMA_MODEL'] || 'llama3.1:8b',
      endpoint: process.env['OLLAMA_URL'] || 'http://localhost:11434',
    };
    
    config.tts = {
      provider: process.env['TTS_PROVIDER'] === 'openai' ? 'openai' : 'kokoro',
      endpoint: process.env['TTS_URL'] || 'http://localhost:5000',
      apiKey: process.env['OPENAI_API_KEY'],
      voice: process.env['TTS_VOICE'] || 'default',
    };
  } else {
    // cloud profile
    config.stt = {
      provider: 'openai',
      apiKey: process.env['OPENAI_API_KEY'],
    };
    
    config.llm = {
      provider: 'openai',
      model: process.env['OPENAI_MODEL'] || 'gpt-4',
      apiKey: process.env['OPENAI_API_KEY'],
    };
    
    config.tts = {
      provider: 'openai',
      apiKey: process.env['OPENAI_API_KEY'],
      voice: process.env['TTS_VOICE'] || 'alloy',
    };
  }
  
  return config;
}

/**
 * Validate runtime config
 */
export function validateRuntimeConfig(config: unknown): config is RuntimeConfig {
  if (!config || typeof config !== 'object') {
    return false;
  }
  
  const c = config as Record<string, unknown>;
  
  if (c['profile'] !== 'cloud' && c['profile'] !== 'hybrid' && c['profile'] !== 'local') {
    return false;
  }
  
  return true;
}

