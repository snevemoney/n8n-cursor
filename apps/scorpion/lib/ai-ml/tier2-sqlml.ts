// Tier 2: SQL-ML Integration
// PostgresML, MindsDB, DuckDB ML, and scikit-learn via Python

import { query } from '@/lib/db/client';

export interface SQLMLRequest {
  task: 'predict' | 'train' | 'forecast';
  modelName: string;
  input: Record<string, unknown> | Array<Record<string, unknown>>;
  options?: {
    algorithm?: 'linear_regression' | 'logistic_regression' | 'random_forest' | 'xgboost';
    targetColumn?: string;
    features?: string[];
  };
}

export interface SQLMLResponse {
  prediction?: unknown;
  predictions?: unknown[];
  modelId?: string;
  accuracy?: number;
  latency: number;
}

/**
 * Check if PostgresML extension is available
 */
export async function checkPostgresML(): Promise<boolean> {
  try {
    const result = await query(
      `SELECT EXISTS(
        SELECT 1 FROM pg_extension WHERE extname = 'pgml'
      ) as available`
    );
    return result.rows[0]?.available === true;
  } catch {
    return false;
  }
}

/**
 * Train a model using PostgresML
 */
export async function trainPostgresMLModel(
  request: SQLMLRequest
): Promise<SQLMLResponse> {
  const hasPostgresML = await checkPostgresML();
  if (!hasPostgresML) {
    throw new Error('PostgresML extension not available. Install with: CREATE EXTENSION pgml;');
  }

  if (!request.options?.targetColumn) {
    throw new Error('targetColumn is required for training');
  }

  const algorithm = request.options.algorithm || 'linear_regression';
  const tableName = `ml_training_data_${request.modelName.replace(/[^a-z0-9]/gi, '_')}`;

  // Create training table if it doesn't exist
  // In production, you'd have a proper schema for this
  const startTime = Date.now();

  // Example: Train a model using PostgresML
  // This is a simplified version - full implementation would:
  // 1. Create/use training table
  // 2. Insert training data
  // 3. Call pgml.train() function
  // 4. Store model metadata

  const trainQuery = `
    SELECT pgml.train(
      project_name => $1,
      task => 'regression',
      relation_name => $2,
      y_column_name => $3,
      algorithm => $4
    ) as model_id
  `;

  try {
    const result = await query(trainQuery, [
      request.modelName,
      tableName,
      request.options.targetColumn,
      algorithm,
    ]);

    return {
      modelId: result.rows[0]?.model_id,
      latency: Date.now() - startTime,
    };
  } catch (error: any) {
    throw new Error(`PostgresML training failed: ${error.message}`);
  }
}

/**
 * Make prediction using PostgresML
 */
export async function predictWithPostgresML(
  request: SQLMLRequest
): Promise<SQLMLResponse> {
  const hasPostgresML = await checkPostgresML();
  if (!hasPostgresML) {
    throw new Error('PostgresML extension not available');
  }

  const startTime = Date.now();

  // Get model
  const modelQuery = `
    SELECT id, algorithm, created_at
    FROM pgml.models
    WHERE project_name = $1
    ORDER BY created_at DESC
    LIMIT 1
  `;

  const modelResult = await query(modelQuery, [request.modelName]);
  if (modelResult.rows.length === 0) {
    throw new Error(`Model ${request.modelName} not found`);
  }

  const modelId = modelResult.rows[0].id;

  // Make prediction
  const predictQuery = `
    SELECT pgml.predict($1, $2::jsonb) as prediction
  `;

  const predictResult = await query(predictQuery, [
    request.modelName,
    JSON.stringify(request.input),
  ]);

  return {
    prediction: predictResult.rows[0]?.prediction,
    latency: Date.now() - startTime,
  };
}

/**
 * Check if MindsDB is available
 */
export async function checkMindsDB(): Promise<boolean> {
  const mindsdbUrl = process.env.MINDSDB_URL || 'http://localhost:47334';
  try {
    const response = await fetch(`${mindsdbUrl}/api/util/health`, {
      signal: AbortSignal.timeout(2000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Train a model using MindsDB
 */
export async function trainMindsDBModel(
  request: SQLMLRequest
): Promise<SQLMLResponse> {
  const hasMindsDB = await checkMindsDB();
  if (!hasMindsDB) {
    throw new Error('MindsDB not available. Start with: docker run -p 47334:47334 mindsdb/mindsdb');
  }

  const mindsdbUrl = process.env.MINDSDB_URL || 'http://localhost:47334';
  const startTime = Date.now();

  if (!request.options?.targetColumn) {
    throw new Error('targetColumn is required for training');
  }

  // Create model in MindsDB
  const createModelQuery = `
    CREATE MODEL ${request.modelName}
    FROM (
      SELECT * FROM your_table
    )
    PREDICT ${request.options.targetColumn}
    USING engine = '${request.options.algorithm || 'lightwood'}'
  `;

  const response = await fetch(`${mindsdbUrl}/api/sql/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: createModelQuery,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`MindsDB training failed: ${JSON.stringify(error)}`);
  }

  return {
    modelId: request.modelName,
    latency: Date.now() - startTime,
  };
}

/**
 * Make prediction using MindsDB
 */
export async function predictWithMindsDB(
  request: SQLMLRequest
): Promise<SQLMLResponse> {
  const mindsdbUrl = process.env.MINDSDB_URL || 'http://localhost:47334';
  const startTime = Date.now();

  const predictQuery = `
    SELECT ${request.options?.targetColumn || 'prediction'}
    FROM ${request.modelName}
    WHERE ${Object.entries(request.input as Record<string, unknown>)
      .map(([key, value]) => `${key} = '${value}'`)
      .join(' AND ')}
  `;

  const response = await fetch(`${mindsdbUrl}/api/sql/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: predictQuery }),
  });

  if (!response.ok) {
    throw new Error(`MindsDB prediction failed: ${response.status}`);
  }

  const result = await response.json();
  
  return {
    prediction: result.data?.[0],
    latency: Date.now() - startTime,
  };
}

/**
 * Run scikit-learn model via Python subprocess
 * For simple tabular predictions
 */
export async function runScikitLearn(
  request: SQLMLRequest
): Promise<SQLMLResponse> {
  // This would execute a Python script that uses scikit-learn
  // For now, return a placeholder
  // In production, you'd:
  // 1. Serialize input to JSON
  // 2. Call Python script via subprocess
  // 3. Parse JSON output
  // 4. Return predictions

  throw new Error('scikit-learn integration not yet implemented. Use PostgresML or MindsDB instead.');
}

