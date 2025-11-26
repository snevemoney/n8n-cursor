# AI/ML Stack

Four-tier ML architecture for Scorpion, providing progressive enhancement from simple pre-trained APIs to custom deep learning models.

## Architecture

### Tier 1: Pre-trained APIs (Fastest)
- **OpenAI GPT-4/o3** - Text generation
- **Ollama** - Local LLMs (Qwen, LLaMA)
- **Whisper** - Speech-to-text
- **CLIP** - Vision models (image classification, embeddings)

### Tier 2: SQL-ML (Simple Predictions)
- **PostgresML** - ML directly in PostgreSQL
- **MindsDB** - ML in SQL database
- **DuckDB ML** - In-process analytics
- **scikit-learn** - Via Python subprocess

### Tier 3: AutoML (Custom Models, No Deep ML)
- **AutoGluon** - Automated ML
- **H2O AutoML** - Enterprise AutoML
- **PyCaret** - Low-code ML

### Tier 4: Custom Training (Unique Intelligence)
- **PyTorch** - Deep learning framework
- **TensorFlow** - Production ML
- **JAX** - High-performance ML

## Usage

### API Endpoint

```typescript
POST /api/ml
{
  "task": "text-generation",
  "input": "Hello, world!",
  "options": {
    "tier": "tier1",
    "model": "scorpion:latest",
    "temperature": 0.7
  }
}
```

### Programmatic Usage

```typescript
import { processMLRequest } from '@/lib/ai-ml/orchestrator';

const result = await processMLRequest({
  task: 'speech-to-text',
  input: audioBuffer,
  options: {
    priority: 'speed'
  }
});
```

## Decision Tree

The orchestrator automatically selects the appropriate tier:

1. **Tier 1** - Pre-trained APIs for standard tasks (text, speech, vision)
2. **Tier 2** - SQL-ML for tabular predictions and time-series
3. **Tier 3** - AutoML for custom models without deep ML expertise
4. **Tier 4** - Custom training for unique Scorpion-specific problems

## Setup

### Tier 1 (Pre-trained APIs)
- OpenAI: Set `OPENAI_API_KEY`
- Ollama: Install and run `ollama serve`
- Whisper: Uses OpenAI API or local Ollama model

### Tier 2 (SQL-ML)
- PostgresML: `CREATE EXTENSION pgml;` in PostgreSQL
- MindsDB: `docker run -p 47334:47334 mindsdb/mindsdb`

### Tier 3 (AutoML)
- AutoGluon: Install Python package
- H2O: Install H2O AutoML
- PyCaret: Install PyCaret

### Tier 4 (Custom Training)
- PyTorch: Install PyTorch
- TensorFlow: Install TensorFlow
- JAX: Install JAX

## Database Schema

The ML stack uses the following tables:
- `ml_models` - Model registry
- `ml_training_data` - Training datasets
- `ml_predictions` - Prediction cache
- `ml_transcriptions` - Audio transcriptions
- `ml_request_logs` - Request logging

Run migration: `tsx scripts/migrate-cost-tracking.ts`

