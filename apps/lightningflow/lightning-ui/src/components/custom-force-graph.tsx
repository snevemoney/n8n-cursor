"use client";

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import dynamic from 'next/dynamic';

// Define the props interface for our force graph components
interface ForceGraphProps {
  graphData: {
    nodes: any[];
    links: any[];
  };
  nodeId?: string;
  nodeLabel?: string | ((node: any) => string);
  nodeColor?: string | ((node: any) => string);
  nodeRelSize?: number;
  nodeVal?: number | string | ((node: any) => number);
  linkColor?: string | ((link: any) => string);
  linkWidth?: number | string | ((link: any) => number);
  linkDirectionalParticles?: number;
  linkDirectionalParticleSpeed?: number;
  linkDirectionalParticleWidth?: number;
  linkDirectionalParticleColor?: string | ((link: any) => string);
  onNodeClick?: (node: any) => void;
  onNodeHover?: (node: any) => void;
  warmupTicks?: number;
  cooldownTicks?: number;
  cooldownTime?: number;
  backgroundColor?: string;
  width?: number;
  height?: number;
}

// Create a wrapper component for 2D force graph
const ForceGraph2DComponent = forwardRef<any, ForceGraphProps>((props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    zoom: (scale?: number) => graphRef.current?.zoom(scale),
    zoomToFit: (duration?: number, padding?: number) => graphRef.current?.zoomToFit(duration, padding),
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    // Dynamically import force-graph
    import('force-graph').then((ForceGraphModule) => {
      const ForceGraph = ForceGraphModule.default;
      
      if (graphRef.current) {
        // Clean up existing graph
        graphRef.current._destructor?.();
      }

      // Create new graph instance
      const graph = new ForceGraph(containerRef.current!);
      graphRef.current = graph;

      // Set dimensions
      if (props.width && props.height) {
        graph.width(props.width).height(props.height);
      } else {
        // Auto-resize to container
        const resizeObserver = new ResizeObserver(() => {
          if (containerRef.current) {
            const { width, height } = containerRef.current.getBoundingClientRect();
            graph.width(width).height(height);
          }
        });
        if (containerRef.current) {
          resizeObserver.observe(containerRef.current);
        }
      }

      // Apply all the props
      if (props.graphData) graph.graphData(props.graphData);
      if (props.nodeId) graph.nodeId(props.nodeId);
      if (props.nodeLabel) graph.nodeLabel(props.nodeLabel);
      if (props.nodeColor) graph.nodeColor(props.nodeColor);
      if (props.nodeRelSize) graph.nodeRelSize(props.nodeRelSize);
      if (props.nodeVal) graph.nodeVal(props.nodeVal);
      if (props.linkColor) graph.linkColor(props.linkColor);
      if (props.linkWidth) graph.linkWidth(props.linkWidth);
      if (props.linkDirectionalParticles) graph.linkDirectionalParticles(props.linkDirectionalParticles);
      if (props.linkDirectionalParticleSpeed) graph.linkDirectionalParticleSpeed(props.linkDirectionalParticleSpeed);
      if (props.linkDirectionalParticleWidth) graph.linkDirectionalParticleWidth(props.linkDirectionalParticleWidth);
      if (props.linkDirectionalParticleColor) graph.linkDirectionalParticleColor(props.linkDirectionalParticleColor);
      if (props.onNodeClick) graph.onNodeClick(props.onNodeClick);
      if (props.onNodeHover) graph.onNodeHover(props.onNodeHover);
      if (props.warmupTicks) graph.warmupTicks(props.warmupTicks);
      if (props.cooldownTicks) graph.cooldownTicks(props.cooldownTicks);
      if (props.cooldownTime) graph.cooldownTime(props.cooldownTime);
      if (props.backgroundColor) graph.backgroundColor(props.backgroundColor);
    });

    return () => {
      if (graphRef.current) {
        graphRef.current._destructor?.();
      }
    };
  }, []);

  // Update graph when props change
  useEffect(() => {
    if (!graphRef.current) return;
    
    if (props.graphData) graphRef.current.graphData(props.graphData);
  }, [props.graphData]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
});

ForceGraph2DComponent.displayName = 'ForceGraph2DComponent';

// Create a wrapper component for 3D force graph
const ForceGraph3DComponent = forwardRef<any, ForceGraphProps>((props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    zoom: (scale?: number) => graphRef.current?.zoom(scale),
    zoomToFit: (duration?: number, padding?: number) => graphRef.current?.zoomToFit(duration, padding),
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    // Dynamically import 3d-force-graph
    import('3d-force-graph').then((ForceGraph3DModule) => {
      const ForceGraph3D = ForceGraph3DModule.default;
      
      if (graphRef.current) {
        // Clean up existing graph
        graphRef.current._destructor?.();
      }

      // Create new graph instance
      const graph = new ForceGraph3D(containerRef.current!);
      graphRef.current = graph;

      // Apply all the props (similar to 2D but with 3D-specific methods)
      if (props.graphData) graph.graphData(props.graphData);
      if (props.nodeId) graph.nodeId(props.nodeId);
      if (props.nodeLabel) graph.nodeLabel(props.nodeLabel);
      if (props.nodeColor) graph.nodeColor(props.nodeColor);
      if (props.nodeRelSize) graph.nodeRelSize(props.nodeRelSize);
      if (props.nodeVal) graph.nodeVal(props.nodeVal);
      if (props.linkColor) graph.linkColor(props.linkColor);
      if (props.linkWidth) graph.linkWidth(props.linkWidth);
      if (props.onNodeClick) graph.onNodeClick(props.onNodeClick);
      if (props.onNodeHover) graph.onNodeHover(props.onNodeHover);
      if (props.warmupTicks) graph.warmupTicks(props.warmupTicks);
      if (props.cooldownTicks) graph.cooldownTicks(props.cooldownTicks);
      if (props.cooldownTime) graph.cooldownTime(props.cooldownTime);
      if (props.backgroundColor) graph.backgroundColor(props.backgroundColor);
    });

    return () => {
      if (graphRef.current) {
        graphRef.current._destructor?.();
      }
    };
  }, []);

  // Update graph when props change
  useEffect(() => {
    if (!graphRef.current) return;
    
    if (props.graphData) graphRef.current.graphData(props.graphData);
  }, [props.graphData]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
});

ForceGraph3DComponent.displayName = 'ForceGraph3DComponent';

// Export dynamic versions that only load on client
export const ForceGraph2D = dynamic(
  () => Promise.resolve(ForceGraph2DComponent),
  { ssr: false }
);

export const ForceGraph3D = dynamic(
  () => Promise.resolve(ForceGraph3DComponent),
  { ssr: false }
);

// This ensures that when components are imported from here,
// they won't cause AFRAME reference errors during SSR
export const SafeForceGraph = {
  ForceGraph2D,
  ForceGraph3D
}; 