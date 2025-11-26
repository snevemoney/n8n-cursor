/**
 * ML Query Handler
 * Handles user questions about system health, anomalies, and ML model confidence
 * by calling existing ML API endpoints
 *
 * CONTRACT:
 * - Expects GET /api/ml/status to return MlStatusResponse shape
 * - Expects GET /api/ml/predict?withUncertainty=true to return MlPredictResponse shape
 * - If these API contracts change, update type definitions and mapping logic below
 *
 * INTEGRATION:
 * - Called as early short-circuit in processStreamStart.ts before main routing
 * - Uses detectMlQueryIntent() to identify ML-related questions
 * - Closes stream after responding (no planner/tools invoked)
 */

import type { ReadableStreamDefaultController } from 'stream/web';
import type { StreamState } from '../phases';

const ML_BASE_URL =
  process.env['APP_BASE_URL'] ||
  process.env['NEXT_PUBLIC_APP_URL'] ||
  'http://127.0.0.1:3000';

type MlIntent = 'health' | 'anomalies' | 'confidence';

interface MlStatusResponse {
  ok: boolean;
  status?: {
    isTrained: boolean;
    isTraining: boolean;
    lastTrainingTime?: number | null;
  };
  architecture?: {
    summary?: string;
  };
  modelInfo?: {
    name?: string;
    version?: string;
    mcDropoutEnabled?: boolean;
    mcDropoutSamples?: number;
  };
  normalization?: {
    hasStats?: boolean;
    sampleCount?: number;
    featureCount?: number;
  };
}

interface MlPredictResponse {
  ok: boolean;
  prediction?: {
    isAnomaly: boolean;
    score: number;
    confidence: number;
    timestamp: number;
  };
  mcDropout?: {
    enabled?: boolean;
    samples?: number;
  };
}

/**
 * Lightweight intent detector for ML-related questions
 * Guards against false positives by requiring ML context keywords
 */
export function detectMlQueryIntent(message: string): MlIntent | null {
  const text = message.toLowerCase();

  // Require ML context to avoid catching unrelated queries
  const hasMLContext =
    text.includes('system') ||
    text.includes('detector') ||
    text.includes('model') ||
    text.includes('anomal') ||
    text.includes('ml') ||
    text.includes('prediction') ||
    text.includes('confidence') ||
    text.includes('alert');

  // Health / status of the system
  if (
    (text.includes('system') && (text.includes('healthy') || text.includes('health'))) ||
    text.includes('system ok') ||
    text.includes('health status') ||
    text.includes('overall status') ||
    (text.includes('everything') && (text.includes('ok') || text.includes('okay')))
  ) {
    const intent = 'health';
    console.log('[ML Intent] Matched intent=%s for message=%o', intent, message.substring(0, 50));
    return intent;
  }

  // Anomaly-specific questions (require explicit anomaly mention or alert context)
  if (
    text.includes('anomaly') ||
    text.includes('anomalies') ||
    (hasMLContext && (text.includes('weird events') || text.includes('strange activity'))) ||
    text.includes('any alerts') ||
    (hasMLContext && text.includes('any issues'))
  ) {
    const intent = 'anomalies';
    console.log('[ML Intent] Matched intent=%s for message=%o', intent, message.substring(0, 50));
    return intent;
  }

  // Confidence / uncertainty questions (require ML context)
  if (
    hasMLContext &&
    (text.includes('confidence') ||
      text.includes('uncertainty') ||
      text.includes('how sure') ||
      text.includes('how certain'))
  ) {
    const intent = 'confidence';
    console.log('[ML Intent] Matched intent=%s for message=%o', intent, message.substring(0, 50));
    return intent;
  }

  return null;
}

/**
 * Handle ML queries by calling the existing ML HTTP API
 * Returns true if handled (stream closed), false if caller should fall through
 */
export async function tryHandleMlQueryIntent(params: {
  intent: MlIntent;
  userMessage: string;
  send: (event: { type: string; data: Record<string, unknown> }) => void;
  streamState: StreamState;
  controller: ReadableStreamDefaultController<Uint8Array>;
  messageId: string;
}): Promise<boolean> {
  const { intent, send, streamState, controller, messageId } = params;

  try {
    // Let the client know we're doing an ML health check
    send({
      type: 'status',
      data: {
        phase: 'ml_query',
        message:
          intent === 'health'
            ? 'Checking system health with the anomaly detector...'
            : intent === 'anomalies'
            ? 'Checking for recent anomalies...'
            : 'Checking model confidence and uncertainty...',
      },
    });

    // 1) Get current status
    const statusRes = await fetch(`${ML_BASE_URL}/api/ml/status`, {
      method: 'GET',
    });

    // Guard: Check if status API is healthy
    if (!statusRes.ok) {
      console.error('[ML Query] Status API returned non-OK:', statusRes.status);
      throw new Error(`ML status API returned ${statusRes.status}`);
    }

    const statusJson = (await statusRes.json()) as MlStatusResponse;

    // Guard: Check if response has expected shape
    if (!statusJson || !statusJson.ok) {
      console.error('[ML Query] Status API returned ok=false:', statusJson);
      throw new Error('ML status API returned ok=false');
    }

    // 2) Optionally get prediction for anomalies/health
    let predictJson: MlPredictResponse | null = null;
    if (intent === 'anomalies' || intent === 'health' || intent === 'confidence') {
      const predRes = await fetch(
        `${ML_BASE_URL}/api/ml/predict?withUncertainty=true`,
        { method: 'GET' }
      );

      // Guard: Prediction API may fail if not trained, handle gracefully
      if (!predRes.ok) {
        console.warn('[ML Query] Predict API returned non-OK:', predRes.status);
        // Continue without prediction data - we'll show "not trained" message
      } else {
        predictJson = (await predRes.json()) as MlPredictResponse;
        if (!predictJson || !predictJson.ok) {
          console.warn('[ML Query] Predict API returned ok=false');
          predictJson = null; // Treat as unavailable
        }
      }
    }

    const isTrained = statusJson.status?.isTrained ?? false;

    // Debug logging
    console.log('[ML Query] intent=%s trained=%s', intent, isTrained);
    const isTraining = statusJson.status?.isTraining ?? false;
    const modelName = statusJson.modelInfo?.name ?? 'anomaly_detector';
    const modelVersion = statusJson.modelInfo?.version ?? 'unknown';
    const mcEnabled = statusJson.modelInfo?.mcDropoutEnabled ?? false;
    const mcSamples = statusJson.modelInfo?.mcDropoutSamples ?? 1;
    const hasNorm = statusJson.normalization?.hasStats ?? false;
    const sampleCount = statusJson.normalization?.sampleCount ?? 0;

    // Prediction info (if available)
    const isAnomaly = predictJson?.prediction?.isAnomaly ?? false;
    const anomalyScore = predictJson?.prediction?.score ?? null;
    const confidence = predictJson?.prediction?.confidence ?? null;
    const mcMeta = predictJson?.mcDropout;

    // Build human-readable answer based on intent
    let answer = '';

    if (!isTrained) {
      answer =
        'The anomaly detector is not fully trained yet. You should run a training job before relying on it for decisions.';
    } else if (intent === 'health') {
      answer = [
        `Here's the current system health based on the anomaly detector (${modelName} v${modelVersion}):`,
        '',
        isAnomaly
          ? `• ⚠️ The latest reading looks **anomalous**.`
          : `• ✅ The latest reading looks **normal**.`,
        anomalyScore !== null
          ? `• Raw anomaly score: **${anomalyScore.toFixed(3)}**`
          : '',
        confidence !== null
          ? `• Confidence in this judgment: **${(confidence * 100).toFixed(1)}%**`
          : '',
        '',
        `Model details:`,
        `• Architecture: ${statusJson.architecture?.summary ?? 'unknown'}`,
        `• MC Dropout: ${
          mcEnabled
            ? `enabled (${mcSamples} samples)`
            : 'disabled (single deterministic pass)'
        }`,
        `• Normalization stats: ${
          hasNorm
            ? `loaded with ~${sampleCount.toLocaleString()} samples`
            : 'not available – training may not have completed'
        }`,
      ]
        .filter(Boolean)
        .join('\n');
    } else if (intent === 'anomalies') {
      answer = [
        `Here's what the anomaly detector sees right now:`,
        '',
        isAnomaly
          ? `• ⚠️ The latest state is flagged as **anomalous**.`
          : `• ✅ The latest state is **not flagged as anomalous**.`,
        anomalyScore !== null
          ? `• Anomaly score: **${anomalyScore.toFixed(3)}**`
          : '',
        confidence !== null
          ? `• Confidence: **${(confidence * 100).toFixed(1)}%**`
          : '',
        '',
        `This is based on model **${modelName} v${modelVersion}**${
          mcEnabled ? ` using MC Dropout (${mcSamples} samples).` : '.'
        }`,
      ]
        .filter(Boolean)
        .join('\n');
    } else {
      // intent === 'confidence'
      const effectiveSamples = mcMeta?.samples ?? mcSamples;
      answer = [
        `Here's how confident the anomaly detector feels right now:`,
        '',
        confidence !== null
          ? `• Confidence in the latest prediction: **${(confidence * 100).toFixed(
              1
            )}%**`
          : `• Confidence could not be computed (no recent prediction available).`,
        mcEnabled
          ? `• MC Dropout is **enabled** with **${effectiveSamples}** samples, so this confidence estimate accounts for model uncertainty.`
          : `• MC Dropout is **disabled**, so this confidence is based on a single deterministic forward pass.`,
        '',
        `Model: ${modelName} v${modelVersion}`,
      ]
        .filter(Boolean)
        .join('\n');
    }

    // Stream as a single assistant message
    send({
      type: 'message',
      data: {
        id: messageId,
        role: 'assistant',
        content: answer,
      },
    });
    send({ type: 'done', data: { messageId } });
    streamState.closed = true;
    controller.close();
    return true;
  } catch (error) {
    console.error('[Chat Stream] Error handling ML query intent:', error);
    send({
      type: 'message',
      data: {
        id: messageId,
        role: 'assistant',
        content:
          'I tried to query the anomaly detector, but something went wrong. Please check the ML API logs.',
      },
    });
    send({ type: 'done', data: { messageId } });
    streamState.closed = true;
    controller.close();
    return true;
  }
}
