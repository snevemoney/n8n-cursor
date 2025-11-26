// AI/ML Stack Type Definitions
// Four-tier ML architecture for Scorpion

export type MLTier = 'tier1' | 'tier2' | 'tier3' | 'tier4';

export interface MLRequest {
  task: MLTask;
  input: unknown;
  options?: MLOptions;
}

export type MLTask =
  | 'text-generation'
  | 'text-embedding'
  | 'speech-to-text'
  | 'text-to-speech'
  | 'image-classification'
  | 'image-embedding'
  | 'tabular-prediction'
  | 'time-series-forecast'
  | 'custom-training'
  | 'model-fine-tuning';

export interface MLOptions {
  tier?: MLTier;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
  priority?: 'speed' | 'accuracy' | 'cost';
}

export interface MLResponse {
  result: unknown;
  tier: MLTier;
  model: string;
  latency: number;
  tokens?: number;
  cost?: number;
}

// Tier 1: Pre-trained APIs
export interface Tier1Provider {
  name: 'openai' | 'ollama' | 'whisper' | 'clip';
  enabled: boolean;
  models: string[];
}

// Tier 2: SQL-ML
export interface Tier2Provider {
  name: 'postgresml' | 'mindsdb' | 'duckdb-ml' | 'scikit-learn';
  enabled: boolean;
  connectionString?: string;
}

// Tier 3: AutoML
export interface Tier3Provider {
  name: 'autogluon' | 'h2o' | 'pycaret';
  enabled: boolean;
  pythonPath?: string;
}

// Tier 4: Custom Training
export interface Tier4Provider {
  name: 'pytorch' | 'tensorflow' | 'custom';
  enabled: boolean;
  framework: 'pytorch' | 'tensorflow' | 'jax';
}

