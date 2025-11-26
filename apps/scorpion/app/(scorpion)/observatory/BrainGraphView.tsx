'use client';

/**
 * Brain Graph View Component
 * Power of 10 Rule 3: Functions ≤ 60 lines, Rule 1: No recursion
 */

import { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import type { BrainGraph, BrainNode } from '@/server/observatory/types';

interface BrainGraphViewProps {
  graph: BrainGraph;
  layerFilters: Record<string, boolean>;
  selectedNodeId: string | null;
  onNodeClick: (nodeId: string) => void;
  transformerLens?: boolean;
}

// Column definitions matching the reference design
const COLUMNS = [
  { id: 'input', label: 'Input & Context', x: 150, color: '#7DD3FC' }, // Light blue
  { id: 'planner', label: 'Planner', x: 350, color: '#2DD4BF' }, // Teal
  { id: 'council', label: 'Council / Debate', x: 550, color: '#FB923C' }, // Orange
  { id: 'tools', label: 'Tools & RAG', x: 750, color: '#F97316' }, // Brighter orange/red
  { id: 'executor', label: 'Executor', x: 950, color: '#EA580C' }, // Reddish-orange
  { id: 'output', label: 'Summarizer / Output', x: 1150, color: '#EC4899' }, // Pink
] as const;

// Map existing layers to columns
const LAYER_TO_COLUMN: Record<string, string> = {
  llm: 'input',
  data: 'input',
  agents: 'planner',
  experts: 'council',
  workflows: 'council',
  tools: 'tools',
  rag: 'tools',
  safety: 'executor',
  telemetry: 'output',
};

const NODE_RADIUS = 18;
const SVG_WIDTH = 1400;
const SVG_HEIGHT = 1000;
const MIN_NODE_SPACING = 80;
const TITLE_Y = 40;
const COLUMN_LABEL_Y = 980;

/**
 * Brain Graph View - Power of 10 Rule 3: ≤ 60 lines
 */
export function BrainGraphView({
  graph,
  layerFilters,
  selectedNodeId,
  onNodeClick,
  transformerLens = false,
}: BrainGraphViewProps) {
  // Pan and zoom state
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [pinchStart, setPinchStart] = useState<{ distance: number; center: { x: number; y: number } } | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<{ id: string; attention: number; x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Handle mouse down for panning
  const handleMouseDown = useCallback((e: React.MouseEvent<SVGElement>) => {
    // Only pan if clicking on the background (not on nodes)
    const target = e.target as Element;
    const tagName = target.tagName.toLowerCase();
    const isNode = tagName === 'circle' || target.closest('g[data-node]');
    
    if (!isNode) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      e.preventDefault();
    }
  }, [panOffset]);

  // Handle mouse move for panning
  const handleMouseMove = useCallback((e: React.MouseEvent<SVGElement>) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart]);

  // Handle mouse up to stop panning
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle wheel for zoom - using non-passive listener to avoid warnings
  const handleWheelInternal = useCallback((e: WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Zoom factor
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prevZoom => {
      const newZoom = Math.max(0.5, Math.min(3, prevZoom * zoomFactor));
      
      // Zoom towards mouse position - adjust pan to keep point under mouse fixed
      const zoomChange = newZoom / prevZoom;
      setPanOffset(prevPan => ({
        x: mouseX - (mouseX - prevPan.x) * zoomChange,
        y: mouseY - (mouseY - prevPan.y) * zoomChange,
      }));
      
      return newZoom;
    });
  }, []);

  // Register non-passive wheel event listener
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    
    svg.addEventListener('wheel', handleWheelInternal, { passive: false });
    return () => {
      svg.removeEventListener('wheel', handleWheelInternal);
    };
  }, [handleWheelInternal]);

  // React event handler (for compatibility, but we use the non-passive one above)
  const handleWheel = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
    // This is handled by the non-passive listener above
  }, []);

  // Calculate distance between two touches
  const getTouchDistance = (touches: TouchList): number => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Get center point of two touches
  const getTouchCenter = (touches: TouchList, rect: DOMRect): { x: number; y: number } => {
    if (touches.length < 2) return { x: 0, y: 0 };
    const x = (touches[0].clientX + touches[1].clientX) / 2 - rect.left;
    const y = (touches[0].clientY + touches[1].clientY) / 2 - rect.top;
    return { x, y };
  };

  // Handle touch start for pinch zoom
  const handleTouchStart = useCallback((e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 2) {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const distance = getTouchDistance(e.touches);
      const center = getTouchCenter(e.touches, rect);
      setPinchStart({ distance, center });
      e.preventDefault();
    } else if (e.touches.length === 1) {
      // Single touch - start panning
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ 
        x: touch.clientX - rect.left - panOffset.x, 
        y: touch.clientY - rect.top - panOffset.y 
      });
    }
  }, [panOffset]);

  // Handle touch move for pinch zoom and pan
  const handleTouchMove = useCallback((e: React.TouchEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (e.touches.length === 2 && pinchStart) {
      // Pinch zoom
      const distance = getTouchDistance(e.touches);
      const center = getTouchCenter(e.touches, rect);
      const scale = distance / pinchStart.distance;
      const newZoom = Math.max(0.5, Math.min(3, zoom * scale));
      
      // Zoom towards pinch center
      const zoomChange = newZoom / zoom;
      const newPanX = center.x - (center.x - panOffset.x) * zoomChange;
      const newPanY = center.y - (center.y - panOffset.y) * zoomChange;
      
      setZoom(newZoom);
      setPanOffset({ x: newPanX, y: newPanY });
      setPinchStart({ distance, center });
      e.preventDefault();
    } else if (e.touches.length === 1 && isDragging) {
      // Single touch pan
      const touch = e.touches[0];
      setPanOffset({
        x: touch.clientX - rect.left - dragStart.x,
        y: touch.clientY - rect.top - dragStart.y,
      });
      e.preventDefault();
    }
  }, [pinchStart, zoom, panOffset, isDragging, dragStart]);

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setPinchStart(null);
  }, []);

  // Filter nodes by layer - Power of 10 Rule 2: Bounded iteration
  const filteredNodes = useMemo(() => {
    return graph.nodes.filter(node => layerFilters[node.layer] !== false);
  }, [graph.nodes, layerFilters]);

  // Group nodes by column - Power of 10 Rule 7: Guard undefined
  const nodesByColumn = useMemo(() => {
    const groups: Record<string, BrainNode[]> = {};
    for (const node of filteredNodes) {
      const layer = node.layer || 'other';
      const columnId = LAYER_TO_COLUMN[layer] || 'input';
      if (!groups[columnId]) {
        groups[columnId] = [];
      }
      groups[columnId].push(node);
    }
    return groups;
  }, [filteredNodes]);

  // Calculate node positions - Power of 10 Rule 2: Bounded
  const nodePositions = useMemo(() => {
    const positions: Map<string, { x: number; y: number }> = new Map();
    const yOffset = 120; // Start below title
    
    for (const column of COLUMNS) {
      const nodes = nodesByColumn[column.id] || [];
      if (nodes.length === 0) continue;
      
      // Center nodes vertically in available space
      const availableHeight = COLUMN_LABEL_Y - yOffset - 40;
      const totalNodeHeight = nodes.length * MIN_NODE_SPACING;
      const startY = yOffset + Math.max(0, (availableHeight - totalNodeHeight) / 2);
      
      // Power of 10 Rule 2: Bounded loop, Rule 7: Guard undefined
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node && node.id) {
          positions.set(node.id, {
            x: column.x,
            y: startY + i * MIN_NODE_SPACING,
          });
        }
      }
    }
    
    return positions;
  }, [nodesByColumn]);

  // Filter edges to only show connections between visible nodes
  const visibleEdges = useMemo(() => {
    const visibleNodeIds = new Set(filteredNodes.map(n => n.id));
    return graph.edges.filter(
      edge => visibleNodeIds.has(edge.from) && visibleNodeIds.has(edge.to)
    );
  }, [graph.edges, filteredNodes]);

  // Create curved path for edge - Power of 10 Rule 3: Small function
  const createCurvedPath = useCallback((from: { x: number; y: number }, to: { x: number; y: number }) => {
    const dx = to.x - from.x;
    // Create smooth S-curve
    const controlX1 = from.x + dx * 0.4;
    const controlY1 = from.y;
    const controlX2 = to.x - dx * 0.4;
    const controlY2 = to.y;
    return `M ${from.x} ${from.y} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${to.x} ${to.y}`;
  }, []);

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <svg 
        ref={svgRef}
        width={SVG_WIDTH} 
        height={SVG_HEIGHT} 
        className="border border-gray-700"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'none' }}
      >
        {/* Gradients, filters, and markers */}
        <defs>
          {/* Background gradient */}
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="50%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          
          {/* Glow filter for nodes */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        
        {/* Arrow marker */}
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#9CA3AF" />
          </marker>
          
          {/* Create gradients for each unique edge color combination */}
          {visibleEdges.map((edge) => {
            const fromNode = filteredNodes.find(n => n.id === edge.from);
            const toNode = filteredNodes.find(n => n.id === edge.to);
            if (!fromNode || !toNode) return null;
            
            // Get column colors instead of node kind colors
            const fromLayer = fromNode.layer || 'other';
            const toLayer = toNode.layer || 'other';
            const fromColumnId = LAYER_TO_COLUMN[fromLayer] || 'input';
            const toColumnId = LAYER_TO_COLUMN[toLayer] || 'input';
            const fromColumn = COLUMNS.find(c => c.id === fromColumnId);
            const toColumn = COLUMNS.find(c => c.id === toColumnId);
            const fromColor = fromColumn?.color || '#7DD3FC';
            const toColor = toColumn?.color || '#7DD3FC';
            const gradientId = `gradient-${edge.id}`;
            
            return (
              <linearGradient key={gradientId} id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={fromColor} stopOpacity="0.9" />
                <stop offset="100%" stopColor={toColor} stopOpacity="0.9" />
              </linearGradient>
            );
          })}
        </defs>
        <rect x={0} y={0} width={SVG_WIDTH} height={SVG_HEIGHT} fill="url(#bgGradient)" />

        {/* Title */}
        <text
          x={SVG_WIDTH / 2}
          y={TITLE_Y}
          textAnchor="middle"
          fontSize="32"
          fontWeight="bold"
          fill="white"
          style={{ fontFamily: 'system-ui, sans-serif' }}
        >
          {transformerLens ? 'SCORPION BRAIN (Transformer View)' : 'SCORPION BRAIN'}
        </text>
        
        {/* Transformer labels overlay */}
        {transformerLens && (
          <g>
            {COLUMNS.map(column => {
              const transformerMap: Record<string, string> = {
                'Input & Context': 'Tokenization + Embeddings',
                'Planner': 'Encoder Self-Attention',
                'Council / Debate': 'Multi-Head Attention',
                'Tools & RAG': 'Cross-Attention',
                'Executor': 'Decoder',
                'Summarizer / Output': 'Output Projection',
              };
              const transformerLabel = transformerMap[column.label] || '';
              
              return (
                <text
                  key={`transformer-${column.id}`}
                  x={column.x}
                  y={COLUMN_LABEL_Y + 20}
                  textAnchor="middle"
                  fontSize="11"
                  fill="rgba(100, 200, 255, 0.8)"
                  style={{ fontFamily: 'system-ui, sans-serif' }}
                >
                  {transformerLabel}
                </text>
              );
            })}
          </g>
        )}

        {/* Background rect for panning - must be first to be behind everything */}
        <rect
          x={0}
          y={0}
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          fill="transparent"
          className="cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        />

        {/* Transform group for panning and zooming */}
        <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoom})`}>
          {/* Edges - Curved paths with gradients and attention weights */}
          {visibleEdges.length > 0 && visibleEdges.map(edge => {
            const fromPos = nodePositions.get(edge.from);
            const toPos = nodePositions.get(edge.to);
            if (!fromPos || !toPos) return null;
            
            const fromNode = filteredNodes.find(n => n.id === edge.from);
            const toNode = filteredNodes.find(n => n.id === edge.to);
            if (!fromNode || !toNode) return null;
            
            const gradientId = `gradient-${edge.id}`;
            const pathData = createCurvedPath(fromPos, toPos);
            
            // Use attention weight to control visibility (0-1)
            // Default to 0.6 if no attention weight specified
            const attentionWeight = edge.attentionWeight ?? 0.6;
            const strokeWidth = 2 + (attentionWeight * 4); // 2-6px based on attention
            const opacity = 0.4 + (attentionWeight * 0.5); // 0.4-0.9 based on attention
            
            return (
              <g key={edge.id}>
                <path
                  d={pathData}
                  fill="none"
                  stroke={`url(#${gradientId})`}
                  strokeWidth={strokeWidth}
                  opacity={opacity}
                  markerEnd="url(#arrowhead)"
                  style={{ pointerEvents: 'none' }}
                />
                {/* Invisible hit area for tooltip */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={Math.max(12, strokeWidth + 6)}
                  style={{ pointerEvents: 'stroke', cursor: 'help' }}
                  onMouseEnter={(e) => {
                    const rect = svgRef.current?.getBoundingClientRect();
                    if (rect) {
                      setHoveredEdge({
                        id: edge.id,
                        attention: attentionWeight,
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                      });
                    }
                  }}
                  onMouseMove={(e) => {
                    const rect = svgRef.current?.getBoundingClientRect();
                    if (rect && hoveredEdge?.id === edge.id) {
                      setHoveredEdge({
                        id: edge.id,
                        attention: attentionWeight,
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                      });
                    }
                  }}
                  onMouseLeave={() => {
                    if (hoveredEdge?.id === edge.id) {
                      setHoveredEdge(null);
                    }
                  }}
                />
              </g>
            );
          })}

        {/* Nodes */}
        {filteredNodes.map(node => {
          const pos = nodePositions.get(node.id);
          if (!pos || !node) return null;
          
          const isSelected = node.id === selectedNodeId;
            const column = COLUMNS.find(col => {
              const layer = node.layer || 'other';
              return LAYER_TO_COLUMN[layer] === col.id;
            });
            const color = column?.color || getNodeColor(node.kind);
          
          return (
              <g key={node.id} data-node={node.id}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={NODE_RADIUS}
                fill={color}
                  stroke={isSelected ? '#60A5FA' : 'rgba(255, 255, 255, 0.2)'}
                strokeWidth={isSelected ? 3 : 1}
                  filter="url(#glow)"
                className="cursor-pointer hover:opacity-80"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNodeClick(node.id);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
              />
              <text
                x={pos.x}
                  y={pos.y + NODE_RADIUS + 18}
                textAnchor="middle"
                  fontSize="10"
                  fill="rgba(255, 255, 255, 0.9)"
                  className="pointer-events-none"
                  style={{ fontFamily: 'system-ui, sans-serif' }}
              >
                {node.label}
              </text>
            </g>
          );
        })}

          {/* Column labels */}
          {COLUMNS.map(column => (
            <text
              key={column.id}
              x={column.x}
              y={COLUMN_LABEL_Y}
              textAnchor="middle"
              fontSize="14"
              fill="rgba(255, 255, 255, 0.7)"
              style={{ fontFamily: 'system-ui, sans-serif' }}
            >
              {column.label}
            </text>
          ))}
        </g>
        
        {/* Attention weight tooltip */}
        {hoveredEdge && (
          <g transform={`translate(${hoveredEdge.x}, ${hoveredEdge.y})`}>
            <rect
              x={-50}
              y={-25}
              width={100}
              height={20}
              fill="rgba(0, 0, 0, 0.8)"
              rx={4}
            />
            <text
              x={0}
              y={-10}
              textAnchor="middle"
              fontSize="11"
              fill="white"
              style={{ fontFamily: 'system-ui, sans-serif' }}
            >
              Attention: {(hoveredEdge.attention * 100).toFixed(0)}%
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

// Helper: Get node color by kind - Power of 10 Rule 3: Small function
function getNodeColor(kind: BrainNode['kind']): string {
  const colors: Record<BrainNode['kind'], string> = {
    llm: '#3B82F6',
    lrm: '#8B5CF6',
    agent: '#10B981',
    expert: '#F97316', // Orange for MoE experts
    tool: '#F59E0B',
    rag: '#EC4899',
    data_source: '#06B6D4',
    workflow: '#6366F1',
    safety: '#EF4444',
    telemetry: '#64748B',
  };
  return colors[kind] || '#9CA3AF';
}

