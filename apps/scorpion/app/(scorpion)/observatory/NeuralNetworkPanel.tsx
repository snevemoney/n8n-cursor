'use client';

/**
 * Neural Network Visualization Panel
 * Shows network architecture, training progress, and real-time predictions
 */

import { useState, useEffect } from 'react';
import type { TrainingMetrics } from '@/lib/ml/neural-network';
import type { AnomalyPrediction } from '@/lib/ml/anomaly-detector';

export interface NeuralNetworkPanelProps {
  isVisible: boolean;
  onToggle: (visible: boolean) => void;
}

interface NetworkStatus {
  isTrained: boolean;
  isTraining: boolean;
  lastTrainingTime: number;
  trainingHistory: TrainingMetrics[];
}

interface NetworkArchitecture {
  inputSize: number;
  hiddenLayers: number[];
  outputSize: number;
  dropoutRates?: number[];
  totalParameters: number;
  summary?: string;
}

interface ModelInfo {
  name: string;
  version: string;
  summary: string;
  mcDropoutSamples: number;
  mcDropoutEnabled: boolean;
}

interface NormalizationInfo {
  hasStats: boolean;
  summary: string;
  sampleCount: number;
  featureCount: number;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    modelLoaded: boolean;
    modelTrained: boolean;
    normalizationLoaded: boolean;
    predictWorking: boolean;
  };
}

export function NeuralNetworkPanel({ isVisible, onToggle }: NeuralNetworkPanelProps) {
  const [status, setStatus] = useState<NetworkStatus | null>(null);
  const [architecture, setArchitecture] = useState<NetworkArchitecture | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [normalization, setNormalization] = useState<NormalizationInfo | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [prediction, setPrediction] = useState<AnomalyPrediction | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState<TrainingMetrics | null>(null);
  const [autoTrainEnabled, setAutoTrainEnabled] = useState(false);

  // Fetch network status (now includes modelInfo and normalization)
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/ml/status');
        if (response.ok) {
          const data = await response.json();
          setStatus(data.status);
          setArchitecture(data.architecture);
          setModelInfo(data.modelInfo);
          setNormalization(data.normalization);
        }
      } catch (error) {
        console.error('[NeuralNetwork] Failed to fetch status:', error);
      }
    };

    if (isVisible) {
      fetchStatus();
      const interval = setInterval(fetchStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  // Fetch health status
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch('/api/ml/health');
        if (response.ok) {
          const data = await response.json();
          setHealth({
            status: data.status,
            checks: data.checks,
          });
        }
      } catch (error) {
        console.error('[NeuralNetwork] Failed to fetch health:', error);
      }
    };

    if (isVisible) {
      fetchHealth();
      const interval = setInterval(fetchHealth, 10000); // Check every 10s
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  // Fetch real-time predictions
  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const response = await fetch('/api/ml/predict');
        if (response.ok) {
          const data = await response.json();
          setPrediction(data.prediction);
        }
      } catch (error) {
        console.error('[NeuralNetwork] Failed to fetch prediction:', error);
      }
    };

    if (isVisible && status?.isTrained) {
      fetchPrediction();
      const interval = setInterval(fetchPrediction, 3000);
      return () => clearInterval(interval);
    }
  }, [isVisible, status]);

  const handleTrain = async () => {
    setIsTraining(true);
    try {
      const response = await fetch('/api/ml/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ epochs: 50, batchSize: 32 }),
      });

      if (response.ok) {
        // Training started, poll for progress
        console.log('[NeuralNetwork] Training started');
      }
    } catch (error) {
      console.error('[NeuralNetwork] Failed to start training:', error);
    } finally {
      setIsTraining(false);
    }
  };

  const handleReset = async () => {
    try {
      await fetch('/api/ml/reset', { method: 'POST' });
      console.log('[NeuralNetwork] Network reset');
    } catch (error) {
      console.error('[NeuralNetwork] Failed to reset:', error);
    }
  };

  const handleAutoTrainToggle = async () => {
    try {
      const response = await fetch('/api/ml/auto-train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !autoTrainEnabled }),
      });

      if (response.ok) {
        const data = await response.json();
        setAutoTrainEnabled(data.enabled);
        console.log('[NeuralNetwork] Auto-train:', data.enabled ? 'enabled' : 'disabled');
      }
    } catch (error) {
      console.error('[NeuralNetwork] Failed to toggle auto-train:', error);
    }
  };

  if (!isVisible) return null;

  // Show help guide if network isn't trained
  const showHelpGuide = !status?.isTrained && !status?.isTraining;

  return (
    <div className="absolute bottom-0 left-0 right-0 h-96 bg-gray-900 border-t border-gray-800 z-30 overflow-y-auto">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">🧠 Neural Network</h3>

            {/* Health Badge */}
            {health && (
              <span
                className={`px-2 py-1 text-xs rounded border ${
                  health.status === 'healthy'
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : health.status === 'degraded'
                    ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                }`}
                title={`Model: ${health.checks.modelLoaded ? '✓' : '✗'} | Trained: ${health.checks.modelTrained ? '✓' : '✗'} | Normalization: ${health.checks.normalizationLoaded ? '✓' : '✗'} | Predict: ${health.checks.predictWorking ? '✓' : '✗'}`}
              >
                {health.status === 'healthy' && '✅ Healthy'}
                {health.status === 'degraded' && '⚠️ Needs Training'}
                {health.status === 'unhealthy' && '❌ Unhealthy'}
              </span>
            )}

            {status?.isTrained && (
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/30">
                Trained
              </span>
            )}
            {status?.isTraining && (
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/30 animate-pulse">
                Training...
              </span>
            )}
          </div>
          <button
            onClick={() => onToggle(false)}
            className="text-gray-400 hover:text-white"
          >
            ×
          </button>
        </div>

        {/* Help Guide (shown when not trained) */}
        {showHelpGuide && (
          <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-400 mb-2">🎓 How to Use the Neural Network</h4>
            <ol className="text-xs text-gray-300 space-y-2 list-decimal list-inside">
              <li>
                <strong>Train the network</strong> - Click the "Train" button below to train on your telemetry data.
                The network will learn patterns from events like errors, queue depth, and agent performance.
              </li>
              <li>
                <strong>Wait for training</strong> - Training takes 30-60 seconds. You'll see progress in the middle panel.
              </li>
              <li>
                <strong>Monitor predictions</strong> - Once trained, the network will predict anomalies in real-time based on current system behavior.
              </li>
            </ol>
            <p className="text-xs text-gray-400 mt-3">
              💡 The network analyzes {architecture?.inputSize || 11} features: error rate, backpressure, queue depth, agent success rate, HTTP errors, temporal trends, and more.
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          {/* Architecture Visualization */}
          <div className="col-span-1 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-sm font-semibold mb-3">Architecture</h4>
            {architecture ? (
              <div className="space-y-3">
                <NetworkArchitectureViz architecture={architecture} />
                <div className="pt-3 border-t border-gray-700 text-xs text-gray-400 space-y-1">
                  <div>Input: {architecture.inputSize} features</div>
                  <div>Hidden: {architecture.hiddenLayers.join(' → ')}</div>
                  <div>Output: {architecture.outputSize} classes</div>
                  {architecture.dropoutRates && architecture.dropoutRates.some(r => r > 0) && (
                    <div>Dropout: [{architecture.dropoutRates.join(', ')}]</div>
                  )}
                  <div className="mt-2">
                    Total Parameters: <span className="text-white">{architecture.totalParameters.toLocaleString()}</span>
                  </div>
                  {modelInfo && (
                    <div className="mt-2 pt-2 border-t border-gray-700">
                      <div className="text-gray-500 mb-1">Model: {modelInfo.name}</div>
                      <div className="text-gray-500">Version: {modelInfo.version}</div>
                      {modelInfo.mcDropoutEnabled && (
                        <div className="text-blue-400 mt-1">
                          ✓ MC Dropout ({modelInfo.mcDropoutSamples} samples)
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm">No network loaded</div>
            )}
          </div>

          {/* Training Progress */}
          <div className="col-span-1 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-sm font-semibold mb-3">Training Progress</h4>
            {status?.trainingHistory && status.trainingHistory.length > 0 ? (
              <div className="space-y-3">
                <TrainingProgressChart history={status.trainingHistory} />
                <div className="text-xs text-gray-400">
                  <div>
                    Last Training: <span className="text-white">{new Date(status.lastTrainingTime).toLocaleTimeString()}</span>
                  </div>
                  <div>
                    Epochs: <span className="text-white">{status.trainingHistory.length}</span>
                  </div>
                  <div>
                    Final Accuracy: <span className="text-white">{(status.trainingHistory[status.trainingHistory.length - 1]?.accuracy * 100 || 0).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm">No training history</div>
            )}
            <div className="mt-4 space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={handleTrain}
                  disabled={isTraining || status?.isTraining}
                  className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:text-gray-500 rounded text-sm transition-colors"
                >
                  {isTraining || status?.isTraining ? 'Training...' : 'Train'}
                </button>
                <button
                  onClick={handleReset}
                  disabled={isTraining || status?.isTraining}
                  className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 disabled:bg-gray-700 disabled:text-gray-500 border border-red-500/30 rounded text-sm transition-colors"
                >
                  Reset
                </button>
              </div>
              <button
                onClick={handleAutoTrainToggle}
                disabled={isTraining || status?.isTraining}
                className={`w-full px-3 py-2 rounded text-sm transition-colors ${
                  autoTrainEnabled
                    ? 'bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                {autoTrainEnabled ? '✓ Auto-Train: ON' : 'Auto-Train: OFF'}
              </button>
            </div>
          </div>

          {/* Real-Time Predictions */}
          <div className="col-span-1 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-sm font-semibold mb-3">Live Prediction</h4>
            {prediction && status?.isTrained ? (
              <div className="space-y-3">
                <AnomalyScoreViz prediction={prediction} />
                <div className="text-xs text-gray-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={prediction.isAnomaly ? 'text-red-400 font-semibold' : 'text-green-400'}>
                      {prediction.isAnomaly ? '⚠ Anomaly' : '✓ Normal'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Anomaly Score:</span>
                    <span className="text-white">{(prediction.score * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Confidence:</span>
                    <span className="text-white">{(prediction.confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-700">
                  <div className="text-xs text-gray-500 mb-2">Top Features:</div>
                  <FeatureImportanceViz features={prediction.features} />
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm">
                {status?.isTrained ? 'Loading predictions...' : 'Train network to see predictions'}
              </div>
            )}
          </div>
        </div>

        {/* Normalization Info (NEW) */}
        {normalization && (
          <div className="mt-4 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-sm font-semibold mb-2">📏 Normalization Statistics</h4>
            {normalization.hasStats ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-xs text-gray-400 space-y-1">
                  <div>
                    Status: <span className="text-green-400">✓ Loaded</span>
                  </div>
                  <div>
                    Samples: <span className="text-white">{normalization.sampleCount.toLocaleString()}</span>
                  </div>
                  <div>
                    Features: <span className="text-white">{normalization.featureCount}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  <div className="font-mono whitespace-pre-wrap max-h-20 overflow-y-auto">
                    {normalization.summary}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-500">{normalization.summary}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Network Architecture Visualization
 */
function NetworkArchitectureViz({ architecture }: { architecture: NetworkArchitecture }) {
  const layers = [architecture.inputSize, ...architecture.hiddenLayers, architecture.outputSize];

  return (
    <div className="flex items-center justify-between gap-2 h-32">
      {layers.map((size, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="text-xs text-gray-500">
            {i === 0 ? 'Input' : i === layers.length - 1 ? 'Output' : `H${i}`}
          </div>
          <div
            className="w-full bg-gradient-to-b from-blue-500/30 to-teal-500/30 border border-blue-500/50 rounded"
            style={{ height: `${Math.min((size / Math.max(...layers)) * 100, 100)}%` }}
          >
            <div className="text-xs text-center text-white/70 py-1">{size}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Training Progress Chart (simplified)
 */
function TrainingProgressChart({ history }: { history: TrainingMetrics[] }) {
  const maxLoss = Math.max(...history.map(h => h.loss));
  const lastMetrics = history[history.length - 1];

  return (
    <div className="space-y-2">
      <div className="flex items-end h-20 gap-1">
        {history.slice(-20).map((metric, i) => {
          const height = ((maxLoss - metric.loss) / maxLoss) * 100;
          return (
            <div
              key={i}
              className="flex-1 bg-blue-500/50 rounded-t"
              style={{ height: `${height}%` }}
              title={`Epoch ${metric.epoch}: Loss ${metric.loss.toFixed(4)}, Acc ${(metric.accuracy * 100).toFixed(2)}%`}
            />
          );
        })}
      </div>
      <div className="text-xs text-gray-500">
        Loss trend (last 20 epochs)
      </div>
    </div>
  );
}

/**
 * Anomaly Score Visualization
 */
function AnomalyScoreViz({ prediction }: { prediction: AnomalyPrediction }) {
  const score = prediction.score;
  const isAnomaly = prediction.isAnomaly;

  return (
    <div className="space-y-2">
      <div className="relative h-8 bg-gray-700 rounded overflow-hidden">
        <div
          className={`absolute left-0 top-0 bottom-0 transition-all duration-500 ${
            isAnomaly ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-green-500 to-teal-500'
          }`}
          style={{ width: `${score * 100}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-semibold text-white drop-shadow">
            {(score * 100).toFixed(1)}%
          </span>
        </div>
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>Normal</span>
        <span>Anomaly</span>
      </div>
    </div>
  );
}

/**
 * Feature Importance Visualization
 */
function FeatureImportanceViz({ features }: { features: any }) {
  const featureList = [
    { name: 'Error Rate', value: features.errorRate },
    { name: 'Backpressure', value: features.backpressureRatio / 10 }, // Normalize
    { name: 'Queue Depth', value: Math.min(features.queueDepth / 100, 1) }, // Normalize
  ];

  return (
    <div className="space-y-1">
      {featureList.map((feat, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-24 truncate">{feat.name}</span>
          <div className="flex-1 h-2 bg-gray-700 rounded overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-teal-500"
              style={{ width: `${Math.min(feat.value * 100, 100)}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 w-12 text-right">
            {(feat.value * 100).toFixed(0)}%
          </span>
        </div>
      ))}
    </div>
  );
}
