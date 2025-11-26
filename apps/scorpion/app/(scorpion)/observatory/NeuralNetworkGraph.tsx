'use client';

/**
 * Dynamic Interactive Neural Network Graph Visualization
 * Features: Pan, Zoom, Click nodes, Live activations, Animated training
 */

import { useEffect, useRef, useState, useCallback } from 'react';

interface Neuron {
  id: string;
  layer: number;
  index: number;
  x: number;
  y: number;
  activation: number;
  bias: number;
}

interface Connection {
  from: string;
  to: string;
  weight: number;
  gradient?: number;
}

interface NetworkVisualizationData {
  neurons: Neuron[];
  connections: Connection[];
  inputLabels: string[];
  outputLabels: string[];
}

export interface NeuralNetworkGraphProps {
  architecture: {
    inputSize: number;
    hiddenLayers: number[];
    outputSize: number;
  };
  activations?: number[][];
  weights?: any;
  isTraining?: boolean;
  trainingProgress?: {
    epoch: number;
    loss: number;
    accuracy: number;
  };
}

export function NeuralNetworkGraph({
  architecture,
  activations,
  weights,
  isTraining,
  trainingProgress,
}: NeuralNetworkGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [networkData, setNetworkData] = useState<NetworkVisualizationData | null>(null);
  const animationFrameRef = useRef<number>();

  // Camera/viewport state
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNeuron, setSelectedNeuron] = useState<Neuron | null>(null);
  const [hoveredNeuron, setHoveredNeuron] = useState<Neuron | null>(null);

  // Initialize network structure
  useEffect(() => {
    const layers = [architecture.inputSize, ...architecture.hiddenLayers, architecture.outputSize];
    const neurons: Neuron[] = [];
    const connections: Connection[] = [];

    const width = 1200;
    const height = 600;
    const layerSpacing = width / (layers.length + 1);
    const padding = 60;

    // Create neurons
    layers.forEach((size, layerIdx) => {
      const verticalSpacing = (height - 2 * padding) / (size + 1);

      for (let i = 0; i < size; i++) {
        const x = layerSpacing * (layerIdx + 1);
        const y = padding + verticalSpacing * (i + 1);

        neurons.push({
          id: `L${layerIdx}-N${i}`,
          layer: layerIdx,
          index: i,
          x,
          y,
          activation: Math.random() * 0.5 + 0.3, // Initial random activation
          bias: Math.random() * 0.2 - 0.1,
        });
      }
    });

    // Create connections
    for (let layerIdx = 0; layerIdx < layers.length - 1; layerIdx++) {
      const currentLayerNeurons = neurons.filter(n => n.layer === layerIdx);
      const nextLayerNeurons = neurons.filter(n => n.layer === layerIdx + 1);

      currentLayerNeurons.forEach(fromNeuron => {
        nextLayerNeurons.forEach(toNeuron => {
          connections.push({
            from: fromNeuron.id,
            to: toNeuron.id,
            weight: Math.random() * 2 - 1,
          });
        });
      });
    }

    const inputLabels = [
      'Error\nRate',
      'Back\npressure',
      'Queue\nDepth',
      'Agent\nSuccess',
      'Agent\nErrors',
      'HTTP\nErrors',
      'Job\nFails',
      'Time\nOfDay',
      'Event\nRate',
    ].slice(0, architecture.inputSize);

    const outputLabels = ['Normal', 'Anomaly'];

    setNetworkData({
      neurons,
      connections,
      inputLabels,
      outputLabels,
    });
  }, [architecture]);

  // Update activations when they change
  useEffect(() => {
    if (!networkData || !activations) return;

    const updatedNeurons = [...networkData.neurons];

    activations.forEach((layerActivations, layerIdx) => {
      layerActivations.forEach((activation, neuronIdx) => {
        const neuronIndex = updatedNeurons.findIndex(
          n => n.layer === layerIdx && n.index === neuronIdx
        );
        if (neuronIndex !== -1) {
          updatedNeurons[neuronIndex].activation = activation;
        }
      });
    });

    setNetworkData({
      ...networkData,
      neurons: updatedNeurons,
    });
  }, [activations]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on a neuron
    if (networkData) {
      const clicked = networkData.neurons.find(neuron => {
        const screenX = (neuron.x + camera.x) * camera.zoom;
        const screenY = (neuron.y + camera.y) * camera.zoom;
        const radius = (15 + Math.abs(neuron.activation) * 8) * camera.zoom;
        const dx = x - screenX;
        const dy = y - screenY;
        return Math.sqrt(dx * dx + dy * dy) < radius;
      });

      if (clicked) {
        setSelectedNeuron(clicked);
        return;
      }
    }

    // Start dragging
    setIsDragging(true);
    setDragStart({ x: e.clientX - camera.x, y: e.clientY - camera.y });
  }, [camera, networkData]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update hovered neuron
    if (networkData && !isDragging) {
      const hovered = networkData.neurons.find(neuron => {
        const screenX = (neuron.x + camera.x) * camera.zoom;
        const screenY = (neuron.y + camera.y) * camera.zoom;
        const radius = (15 + Math.abs(neuron.activation) * 8) * camera.zoom;
        const dx = x - screenX;
        const dy = y - screenY;
        return Math.sqrt(dx * dx + dy * dy) < radius;
      });

      setHoveredNeuron(hovered || null);

      // Change cursor
      if (canvasRef.current) {
        canvasRef.current.style.cursor = hovered ? 'pointer' : isDragging ? 'grabbing' : 'grab';
      }
    }

    if (isDragging) {
      setCamera({
        ...camera,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [camera, dragStart, isDragging, networkData]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newZoom = Math.min(Math.max(0.5, camera.zoom + delta), 3);

    setCamera({
      ...camera,
      zoom: newZoom,
    });
  }, [camera]);

  // Render loop
  useEffect(() => {
    if (!canvasRef.current || !networkData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const container = containerRef.current;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply camera transform
      ctx.save();
      ctx.translate(camera.x * camera.zoom, camera.y * camera.zoom);
      ctx.scale(camera.zoom, camera.zoom);

      // Draw connections
      networkData.connections.forEach(conn => {
        const fromNeuron = networkData.neurons.find(n => n.id === conn.from);
        const toNeuron = networkData.neurons.find(n => n.id === conn.to);

        if (fromNeuron && toNeuron) {
          const weightStrength = Math.abs(conn.weight);
          const opacity = Math.min(weightStrength * 0.5 + 0.1, 0.8);
          const hue = conn.weight > 0 ? 200 : 0;

          ctx.strokeStyle = `hsla(${hue}, 70%, 50%, ${opacity})`;
          ctx.lineWidth = Math.min(weightStrength * 2, 4);

          ctx.beginPath();
          ctx.moveTo(fromNeuron.x, fromNeuron.y);
          ctx.lineTo(toNeuron.x, toNeuron.y);
          ctx.stroke();

          // Animated gradient flow during training
          if (isTraining && conn.gradient) {
            const gradient = ctx.createLinearGradient(
              fromNeuron.x,
              fromNeuron.y,
              toNeuron.x,
              toNeuron.y
            );
            const offset = (Date.now() % 1000) / 1000;
            gradient.addColorStop(offset, 'rgba(100, 200, 255, 0.8)');
            gradient.addColorStop((offset + 0.3) % 1, 'rgba(100, 200, 255, 0)');
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(fromNeuron.x, fromNeuron.y);
            ctx.lineTo(toNeuron.x, toNeuron.y);
            ctx.stroke();
          }
        }
      });

      // Draw neurons
      networkData.neurons.forEach(neuron => {
        const activation = Math.abs(neuron.activation);
        const radius = 15 + activation * 8;
        const isSelected = selectedNeuron?.id === neuron.id;
        const isHovered = hoveredNeuron?.id === neuron.id;

        // Outer glow
        if (activation > 0.1 || isSelected || isHovered) {
          const gradient = ctx.createRadialGradient(
            neuron.x,
            neuron.y,
            0,
            neuron.x,
            neuron.y,
            radius * (isSelected ? 2.5 : 1.8)
          );
          gradient.addColorStop(0, `rgba(100, 200, 255, ${(activation * 0.8) + (isSelected ? 0.4 : 0)})`);
          gradient.addColorStop(1, 'rgba(100, 200, 255, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(neuron.x, neuron.y, radius * (isSelected ? 2.5 : 1.8), 0, Math.PI * 2);
          ctx.fill();
        }

        // Neuron body
        const hue = neuron.activation > 0 ? 200 : 120;
        const lightness = 30 + activation * 50;
        ctx.fillStyle = `hsl(${hue}, 70%, ${lightness}%)`;
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Border
        ctx.strokeStyle = isSelected
          ? 'rgba(255, 255, 100, 1)'
          : isHovered
          ? 'rgba(255, 255, 255, 0.8)'
          : `hsl(${hue}, 70%, ${50 + activation * 40}%)`;
        ctx.lineWidth = isSelected ? 4 : isHovered ? 3 : 2;
        ctx.stroke();

        // Activation value text
        if (activation > 0.1 || isSelected || isHovered) {
          ctx.fillStyle = 'white';
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(activation.toFixed(2), neuron.x, neuron.y);
        }
      });

      // Draw input labels
      networkData.inputLabels.forEach((label, i) => {
        const neuron = networkData.neurons.find(n => n.layer === 0 && n.index === i);
        if (neuron) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';
          const lines = label.split('\n');
          lines.forEach((line, lineIdx) => {
            ctx.fillText(line, neuron.x - 30, neuron.y + (lineIdx - 0.5) * 14);
          });
        }
      });

      // Draw output labels
      networkData.outputLabels.forEach((label, i) => {
        const lastLayer = Math.max(...networkData.neurons.map(n => n.layer));
        const neuron = networkData.neurons.find(n => n.layer === lastLayer && n.index === i);
        if (neuron) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.font = 'bold 14px sans-serif';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, neuron.x + 30, neuron.y);

          const activation = neuron.activation;
          if (activation > 0) {
            ctx.fillStyle = 'rgba(100, 200, 255, 0.9)';
            ctx.font = '12px monospace';
            ctx.fillText(`${(activation * 100).toFixed(1)}%`, neuron.x + 30, neuron.y + 18);
          }
        }
      });

      ctx.restore();

      // Draw UI overlay (not affected by camera)
      if (isTraining && trainingProgress) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(10, 10, 200, 70);

        ctx.fillStyle = 'rgba(100, 200, 255, 1)';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('🧠 TRAINING...', 20, 30);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = '11px monospace';
        ctx.fillText(`Epoch: ${trainingProgress.epoch}`, 20, 50);
        ctx.fillText(`Loss: ${trainingProgress.loss.toFixed(4)}`, 20, 65);
      }

      // Draw zoom level
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '11px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`Zoom: ${(camera.zoom * 100).toFixed(0)}%`, canvas.width - 10, canvas.height - 10);

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [networkData, camera, isTraining, trainingProgress, selectedNeuron, hoveredNeuron]);

  // Reset camera
  const handleResetCamera = () => {
    setCamera({ x: 0, y: 0, zoom: 1 });
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      />

      {/* Info overlay */}
      <div className="absolute top-2 right-2 text-xs text-gray-400 bg-black/50 px-2 py-1 rounded">
        {networkData && (
          <>
            {networkData.neurons.length} neurons · {networkData.connections.length} connections
          </>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-2 left-2 flex gap-2">
        <button
          onClick={handleResetCamera}
          className="px-2 py-1 bg-gray-800/80 hover:bg-gray-700 border border-gray-600 rounded text-xs text-white"
        >
          Reset View
        </button>
      </div>

      {/* Selected neuron info */}
      {selectedNeuron && (
        <div className="absolute top-2 left-2 bg-black/80 border border-blue-500/50 rounded-lg p-3 text-xs text-white min-w-[200px]">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-sm">Neuron Details</h4>
            <button
              onClick={() => setSelectedNeuron(null)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">ID:</span>
              <span className="font-mono">{selectedNeuron.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Layer:</span>
              <span>
                {selectedNeuron.layer === 0
                  ? 'Input'
                  : selectedNeuron.layer === Math.max(...(networkData?.neurons.map(n => n.layer) || []))
                  ? 'Output'
                  : `Hidden ${selectedNeuron.layer}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Activation:</span>
              <span className="font-mono text-green-400">
                {selectedNeuron.activation.toFixed(4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Bias:</span>
              <span className="font-mono">{selectedNeuron.bias.toFixed(4)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-black/50 px-2 py-1 rounded">
        Drag to pan · Scroll to zoom · Click neurons for details
      </div>
    </div>
  );
}
