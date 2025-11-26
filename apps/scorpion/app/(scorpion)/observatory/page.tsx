'use client';

/**
 * Observatory / Brain Page
 * Power of 10 Rule 3: Functions ≤ 60 lines, Rule 1: No recursion
 */

import { useState, useEffect, useCallback } from 'react';
import type { BrainGraph } from '@/server/observatory/types';
import { BrainGraphView } from './BrainGraphView';
import { NodeInspector } from './NodeInspector';
import { LayerFilter } from './LayerFilter';
import { TransformerLens } from './TransformerLens';
import { NeuralNetworkPanel } from './NeuralNetworkPanel';
import { NeuralNetworkGraph } from './NeuralNetworkGraph';

// Power of 10 Rule 2: Bounded polling
const POLL_INTERVAL_MS = 30000; // 30 seconds
const MAX_POLLS = 100; // Max 100 polls = ~50 minutes

/**
 * Observatory Page Component
 * Power of 10 Rule 3: ≤ 60 lines
 */
export default function ObservatoryPage() {
  const [graph, setGraph] = useState<BrainGraph | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [layerFilters, setLayerFilters] = useState<Record<string, boolean>>({
    llm: true,
    agents: true,
    experts: true, // MoE experts
    tools: true,
    rag: true,
    data: true,
    workflows: true,
    safety: true,
    telemetry: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [showLeftSidebar, setShowLeftSidebar] = useState(false);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [transformerLensEnabled, setTransformerLensEnabled] = useState(false);
  const [showNeuralNetworkPanel, setShowNeuralNetworkPanel] = useState(true); // Auto-open neural network panel
  const [showNeuralNetworkGraph, setShowNeuralNetworkGraph] = useState(false); // Toggle for live NN graph

  // Fetch brain graph - Power of 10 Rule 2: Bounded retries
  const fetchBrainGraph = useCallback(async () => {
    try {
      const response = await fetch('/api/observatory/brain');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      if (data.ok && data.data) {
        setGraph(data.data);
        setError(null);
      } else {
        throw new Error(data.error || 'Failed to load brain graph');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error('[Observatory] Error fetching brain graph:', errorMessage);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchBrainGraph();
  }, [fetchBrainGraph]);

  // Bounded polling - Power of 10 Rule 2: Bounded loops
  useEffect(() => {
    if (pollCount >= MAX_POLLS) {
      return; // Stop polling after max
    }
    
    const interval = setInterval(() => {
      setPollCount(prev => {
        if (prev >= MAX_POLLS) {
          clearInterval(interval);
          return prev;
        }
        fetchBrainGraph();
        return prev + 1;
      });
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fetchBrainGraph, pollCount]);

  const selectedNode = graph?.nodes.find(n => n.id === selectedNodeId) || null;

  return (
    <div className="relative h-screen bg-gray-900 text-white">
      {/* Center - Dual Graph View */}
      <div className="absolute inset-0 p-4 overflow-auto">
        {showNeuralNetworkGraph ? (
          // Live Neural Network Graph
          <div className="h-full flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">🧠 Live Neural Network</h2>
              <button
                onClick={() => setShowNeuralNetworkGraph(false)}
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-sm"
              >
                ← Back to Brain Map
              </button>
            </div>
            <div className="flex-1 bg-gray-800 rounded-lg p-4">
              <NeuralNetworkGraph
                architecture={{
                  inputSize: 11,
                  hiddenLayers: [64, 32, 16],
                  outputSize: 2,
                }}
                isTraining={false}
              />
            </div>
          </div>
        ) : (
          // Brain Map View
          <>
            {error ? (
              <div className="text-red-400">Error: {error}</div>
            ) : graph ? (
              <BrainGraphView
                graph={graph}
                layerFilters={layerFilters}
                selectedNodeId={selectedNodeId}
                onNodeClick={setSelectedNodeId}
                transformerLens={transformerLensEnabled}
              />
            ) : (
              <div>Loading brain graph...</div>
            )}
          </>
        )}
      </div>

      {/* Toggle Buttons */}
      <button
        onClick={() => setShowLeftSidebar(!showLeftSidebar)}
        className="absolute top-4 left-4 z-30 px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md text-sm transition-colors"
      >
        {showLeftSidebar ? '←' : '☰'}
      </button>
      <button
        onClick={() => setShowRightSidebar(!showRightSidebar)}
        className="absolute top-4 right-4 z-30 px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md text-sm transition-colors"
      >
        {showRightSidebar ? '→' : 'ℹ'}
      </button>
      <div className="absolute bottom-4 right-4 z-30 flex gap-2">
        <button
          onClick={() => setShowNeuralNetworkGraph(!showNeuralNetworkGraph)}
          className="px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md text-sm transition-colors group"
          title="Toggle Live Neural Network Graph"
        >
          {showNeuralNetworkGraph ? '🗺️' : '🔬'}
          <span className="absolute bottom-full right-12 mb-2 px-3 py-2 bg-purple-500 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {showNeuralNetworkGraph ? 'Show Brain Map' : 'Show Live Neural Network'}
          </span>
        </button>
        <button
          onClick={() => setShowNeuralNetworkPanel(!showNeuralNetworkPanel)}
          className="px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md text-sm transition-colors group"
          title={showNeuralNetworkPanel ? 'Hide Neural Network' : 'Show Neural Network - AI-powered anomaly detection'}
        >
          {showNeuralNetworkPanel ? '↓' : '🧠'}
          {!showNeuralNetworkPanel && (
            <span className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-blue-500 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Neural Network Controls
            </span>
          )}
        </button>
      </div>

      {/* Left Sidebar - Layers & Filters (Overlay) */}
      {showLeftSidebar && (
        <div className="absolute left-0 top-0 bottom-0 w-64 bg-gray-900 border-r border-gray-800 p-4 overflow-y-auto z-20 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Scorpion Brain</h2>
            <button
              onClick={() => setShowLeftSidebar(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
          <LayerFilter
            filters={layerFilters}
            onFilterChange={setLayerFilters}
          />
          <div className="mt-6 pt-6 border-t border-gray-700">
            <TransformerLens 
              enabled={transformerLensEnabled}
              onToggle={setTransformerLensEnabled} 
            />
          </div>
        </div>
      )}

      {/* Right - Node Inspector (Overlay) */}
      {showRightSidebar && (
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gray-900 border-l border-gray-800 p-4 overflow-y-auto z-20 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {selectedNode ? 'Node Details' : 'Info'}
            </h3>
            <button
              onClick={() => setShowRightSidebar(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
        <NodeInspector node={selectedNode} />
          
          {/* Attention Weight Legend */}
          {!selectedNode && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h4 className="text-sm font-semibold mb-3">Attention Weights</h4>
              <p className="text-xs text-white/60 mb-3">
                Connection thickness and opacity indicate attention weights (0-100%).
                Higher attention = stronger relationship.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-1 bg-gradient-to-r from-blue-400 to-teal-400 opacity-90" />
                  <span className="text-white/70">High (80-100%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-gradient-to-r from-orange-400 to-red-400 opacity-70" />
                  <span className="text-white/70">Medium (50-80%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-1 bg-gradient-to-r from-gray-400 to-gray-500 opacity-50" />
                  <span className="text-white/70">Low (0-50%)</span>
                </div>
              </div>
              <p className="text-xs text-white/50 mt-4">
                Hover over connections to see exact attention values.
              </p>
            </div>
          )}
      </div>
      )}

      {/* Bottom - Neural Network Panel */}
      <NeuralNetworkPanel
        isVisible={showNeuralNetworkPanel}
        onToggle={setShowNeuralNetworkPanel}
      />
    </div>
  );
}

