/**
 * Environment Variable Validation
 * Validates required and optional environment variables at startup
 */

interface EnvVarConfig {
  name: string;
  required: boolean;
  description: string;
  defaultValue?: string;
  validator?: (value: string) => boolean | string;
}

const envVarConfigs: EnvVarConfig[] = [
  // Optional external services (all data stored locally by default)
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    required: false,
    description: 'Supabase project URL (optional - not used, all data stored locally)',
    validator: (value) => {
      try {
        const url = new URL(value);
        return url.protocol === 'https:' || url.protocol === 'http:';
      } catch {
        return 'Must be a valid URL';
      }
    }
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: false,
    description: 'Supabase anonymous key (optional - not used)',
    validator: (value) => value.length > 20 || 'Must be at least 20 characters'
  },
  {
    name: 'SUPABASE_SERVICE_ROLE',
    required: false,
    description: 'Supabase service role key (optional - not used)',
    validator: (value) => value.length > 20 || 'Must be at least 20 characters'
  },
  
  // Optional but recommended
  {
    name: 'OLLAMA_URL',
    required: false,
    description: 'Ollama service URL - LOCAL service (defaults to http://localhost:11434). Install Ollama locally: https://ollama.ai',
    defaultValue: 'http://localhost:11434',
    validator: (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return 'Must be a valid URL';
      }
    }
  },
  {
    name: 'SCORPION_MODEL_SOURCE',
    required: false,
    description: 'Model source: ollama (local) or openai (cloud fallback). Defaults to ollama.',
    defaultValue: 'ollama',
    validator: (value) => {
      const valid = ['ollama', 'openai'];
      return valid.includes(value) || `Must be one of: ${valid.join(', ')}`;
    }
  },
  {
    name: 'N8N_API_URL',
    required: false,
    description: 'n8n API URL (for workflow integration)',
    validator: (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return 'Must be a valid URL';
      }
    }
  },
  {
    name: 'N8N_BASE_URL',
    required: false,
    description: 'n8n base URL (alternative to N8N_API_URL)',
    validator: (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return 'Must be a valid URL';
      }
    }
  },
  {
    name: 'N8N_API_KEY',
    required: false,
    description: 'n8n API key (for authenticated requests)',
  },
  {
    name: 'OPENAI_API_KEY',
    required: false,
    description: 'OpenAI API key (for OpenAI model fallback)',
  },
  {
    name: 'REDIS_URL',
    required: false,
    description: 'Redis connection URL (optional - uses in-memory cache by default, all data stored locally)',
    validator: (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return 'Must be a valid URL';
      }
    }
  },
  {
    name: 'JWT_SECRET',
    required: true,
    description: 'HS256 secret for Scorpion operator JWTs. Privileged /api returns 503 until set.',
    validator: (value) => value.length >= 16 || 'Must be at least 16 characters',
  },
  {
    name: 'SCORPION_API_KEY',
    required: true,
    description: 'Scorpion API key for privileged /api access (Authorization: Bearer or X-API-Key)',
    validator: (value) => value.length >= 16 || 'Must be at least 16 characters',
  },
  {
    name: 'SCORPION_OPERATOR_PASSWORD',
    required: true,
    description: 'Operator password for POST /api/security/auth/login. Login returns 503 until set.',
    validator: (value) => value.length >= 8 || 'Must be at least 8 characters',
  },
  {
    name: 'SCORPION_SSD_PATH',
    required: false,
    description: 'Manual override for SSD path (if auto-detection fails). Example: /Volumes/SSD',
    validator: (value) => {
      // Basic path validation
      if (value.length < 1) {
        return 'Path must not be empty';
      }
      if (!value.startsWith('/')) {
        return 'Path must be absolute (start with /)';
      }
      return true;
    }
  },
  {
    name: 'SCORPION_STORAGE_AUTO_DETECT',
    required: false,
    description: 'Enable automatic storage detection (default: true). Set to false to disable auto-detection.',
    defaultValue: 'true',
    validator: (value) => {
      const valid = ['true', 'false', '1', '0'];
      return valid.includes(value.toLowerCase()) || 'Must be true/false or 1/0';
    }
  },
  // Voice Mode Configuration
  {
    name: 'WHISPER_URL',
    required: false,
    description: 'Whisper STT service URL (for voice mode local profile)',
    defaultValue: 'http://localhost:8000',
    validator: (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return 'Must be a valid URL';
      }
    }
  },
  {
    name: 'TTS_URL',
    required: false,
    description: 'TTS service URL (for voice mode local profile)',
    defaultValue: 'http://localhost:5000',
    validator: (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return 'Must be a valid URL';
      }
    }
  },
  {
    name: 'TTS_PROVIDER',
    required: false,
    description: 'TTS provider for hybrid profile (kokoro, openai, elevenlabs)',
    defaultValue: 'kokoro',
  },
  {
    name: 'TTS_VOICE',
    required: false,
    description: 'TTS voice name/ID',
    defaultValue: 'default',
  },
  {
    name: 'CHAT_API_URL',
    required: false,
    description: 'Chat API endpoint URL (for voice mode)',
    defaultValue: 'http://localhost:3003/api/chat/stream',
    validator: (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return 'Must be a valid URL';
      }
    }
  },
];

interface ValidationResult {
  valid: boolean;
  missing: string[];
  invalid: Array<{ name: string; error: string }>;
  warnings: Array<{ name: string; message: string }>;
}

/**
 * Validate all environment variables
 */
export function validateEnvironment(): ValidationResult {
  const missing: string[] = [];
  const invalid: Array<{ name: string; error: string }> = [];
  const warnings: Array<{ name: string; message: string }> = [];

  for (const config of envVarConfigs) {
    const value = process.env[config.name];
    
    // Check if required variable is missing
    if (config.required && !value) {
      missing.push(config.name);
      continue;
    }
    
    // Skip validation if variable is not set and not required
    if (!value) {
      if (config.defaultValue) {
        warnings.push({
          name: config.name,
          message: `Using default value: ${config.defaultValue}`
        });
      }
      continue;
    }
    
    // Run validator if provided
    if (config.validator) {
      const result = config.validator(value);
      if (result !== true) {
        invalid.push({
          name: config.name,
          error: typeof result === 'string' ? result : 'Invalid value'
        });
      }
    }
  }

  // Check for N8N URL inconsistency
  const n8nApiUrl = process.env['N8N_API_URL'];
  const n8nBaseUrl = process.env['N8N_BASE_URL'];
  if (n8nApiUrl && n8nBaseUrl) {
    warnings.push({
      name: 'N8N_URL',
      message: 'Both N8N_API_URL and N8N_BASE_URL are set. Consider using only N8N_API_URL.'
    });
  }

  return {
    valid: missing.length === 0 && invalid.length === 0,
    missing,
    invalid,
    warnings
  };
}

/**
 * Validate and log results (for startup)
 */
export function validateAndLog(): boolean {
  const result = validateEnvironment();
  
  if (result.valid && result.warnings.length === 0) {
    console.log('✅ Environment variables validated');
    return true;
  }
  
  if (result.missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    result.missing.forEach(name => {
      const config = envVarConfigs.find(c => c.name === name);
      console.error(`   - ${name}: ${config?.description || 'Required'}`);
    });
  }
  
  if (result.invalid.length > 0) {
    console.error('❌ Invalid environment variables:');
    result.invalid.forEach(({ name, error }) => {
      console.error(`   - ${name}: ${error}`);
    });
  }
  
  if (result.warnings.length > 0) {
    console.warn('⚠️  Environment variable warnings:');
    result.warnings.forEach(({ name, message }) => {
      console.warn(`   - ${name}: ${message}`);
    });
  }
  
  return result.valid;
}

/**
 * Get documentation for environment variables
 */
export function getEnvVarDocs(): string {
  const required = envVarConfigs.filter(c => c.required);
  const optional = envVarConfigs.filter(c => !c.required);
  
  let docs = '# Environment Variables\n\n';
  
  docs += '## Required Variables\n\n';
  required.forEach(config => {
    docs += `### ${config.name}\n`;
    docs += `- **Required**: Yes\n`;
    docs += `- **Description**: ${config.description}\n`;
    if (config.validator) {
      docs += `- **Validation**: Custom validator\n`;
    }
    docs += '\n';
  });
  
  docs += '## Optional Variables\n\n';
  optional.forEach(config => {
    docs += `### ${config.name}\n`;
    docs += `- **Required**: No\n`;
    docs += `- **Description**: ${config.description}\n`;
    if (config.defaultValue) {
      docs += `- **Default**: ${config.defaultValue}\n`;
    }
    if (config.validator) {
      docs += `- **Validation**: Custom validator\n`;
    }
    docs += '\n';
  });
  
  return docs;
}

