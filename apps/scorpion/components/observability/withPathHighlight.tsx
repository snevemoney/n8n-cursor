'use client';

import { ComponentType, useState } from 'react';

/**
 * HOC to add path highlighting to DAG/Flow components
 * Computes upstream/downstream paths on hover
 */

interface HighlightState {
  focusNodeId: string | null;
  highlightPath: Set<string>;
}

export interface PathHighlightProps {
  highlightPath?: Set<string>;
  focusNodeId?: string;
  onNodeHover?: (nodeId: string | null) => void;
}

export function withPathHighlight<P extends object>(
  WrappedComponent: ComponentType<P & PathHighlightProps>
) {
  return function PathHighlightWrapper(props: P) {
    const [state, setState] = useState<HighlightState>({
      focusNodeId: null,
      highlightPath: new Set(),
    });
    
    const handleNodeHover = (nodeId: string | null) => {
      if (!nodeId) {
        setState({ focusNodeId: null, highlightPath: new Set() });
        return;
      }
      
      // TODO: Compute actual upstream/downstream path
      // For now, just highlight the node itself
      const path = new Set([nodeId]);
      
      setState({
        focusNodeId: nodeId,
        highlightPath: path,
      });
    };
    
    return (
      <WrappedComponent
        {...props}
        highlightPath={state.highlightPath}
        focusNodeId={state.focusNodeId}
        onNodeHover={handleNodeHover}
      />
    );
  };
}

/**
 * Utility to compute path from edges
 */
export function computePath(
  nodeId: string,
  edges: Array<{ source: string; target: string }>,
  direction: 'upstream' | 'downstream' | 'both' = 'both'
): Set<string> {
  const path = new Set<string>([nodeId]);
  
  const traverse = (currentId: string, dir: 'up' | 'down') => {
    const relevantEdges = dir === 'up'
      ? edges.filter(e => e.target === currentId)
      : edges.filter(e => e.source === currentId);
    
    relevantEdges.forEach(edge => {
      const nextId = dir === 'up' ? edge.source : edge.target;
      if (!path.has(nextId)) {
        path.add(nextId);
        traverse(nextId, dir);
      }
    });
  };
  
  if (direction === 'upstream' || direction === 'both') {
    traverse(nodeId, 'up');
  }
  
  if (direction === 'downstream' || direction === 'both') {
    traverse(nodeId, 'down');
  }
  
  return path;
}

