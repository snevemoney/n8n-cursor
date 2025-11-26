/**
 * Edge Router
 * Routes requests to optimal edge nodes based on geographic location
 */

import { getEdgeRegistry } from './registry';
import type { EdgeNode, EdgeRequest, EdgeResponse, Region } from './types';

export type RoutingStrategy = 'nearest' | 'lowest-latency' | 'highest-capacity' | 'round-robin';

export class EdgeRouter {
  /**
   * Route request to optimal edge node
   */
  async route(
    request: EdgeRequest,
    strategy: RoutingStrategy = 'nearest'
  ): Promise<EdgeNode | null> {
    const registry = getEdgeRegistry();

    // Determine target region
    const targetRegion = this.determineRegion(request);

    // Get nodes in target region
    let nodes = await registry.getNodesByRegion(targetRegion, true);

    // If no nodes in target region, try fallback regions
    if (nodes.length === 0) {
      const fallbackRegions = this.getFallbackRegions(targetRegion);
      for (const region of fallbackRegions) {
        nodes = await registry.getNodesByRegion(region, true);
        if (nodes.length > 0) break;
      }
    }

    // If still no nodes, get all active nodes
    if (nodes.length === 0) {
      nodes = await registry.getAllNodes();
    }

    if (nodes.length === 0) {
      return null;
    }

    // Select node based on strategy
    return this.selectNode(nodes, strategy, request);
  }

  /**
   * Determine target region from request
   */
  private determineRegion(request: EdgeRequest): Region {
    // Use explicit region if provided
    if (request.clientRegion) {
      return request.clientRegion;
    }

    // Try to infer from client IP (simplified - in production use GeoIP service)
    if (request.clientIP) {
      return this.inferRegionFromIP(request.clientIP);
    }

    // Default to local
    return 'local';
  }

  /**
   * Infer region from IP address (simplified)
   */
  private inferRegionFromIP(ip: string): Region {
    // Simplified region inference
    // In production, use a GeoIP service like MaxMind or Cloudflare
    if (ip.startsWith('127.') || ip === '::1') {
      return 'local';
    }

    // Default to us-east for now
    // TODO: Integrate with GeoIP service
    return 'us-east';
  }

  /**
   * Get fallback regions for a primary region
   */
  private getFallbackRegions(region: Region): Region[] {
    const fallbackMap: Record<Region, Region[]> = {
      'us-east': ['us-west', 'eu-west', 'local'],
      'us-west': ['us-east', 'ap-northeast', 'local'],
      'eu-west': ['eu-central', 'us-east', 'local'],
      'eu-central': ['eu-west', 'us-east', 'local'],
      'ap-south': ['ap-northeast', 'us-west', 'local'],
      'ap-northeast': ['ap-south', 'us-west', 'local'],
      'local': ['us-east', 'eu-west'],
    };

    return fallbackMap[region] || ['us-east', 'local'];
  }

  /**
   * Select node based on strategy
   */
  private selectNode(
    nodes: EdgeNode[],
    strategy: RoutingStrategy,
    request: EdgeRequest
  ): EdgeNode {
    switch (strategy) {
      case 'nearest':
        // Prefer nodes with lowest latency
        return nodes.reduce((best, current) => {
          const bestLatency = best.latency || Infinity;
          const currentLatency = current.latency || Infinity;
          return currentLatency < bestLatency ? current : best;
        });

      case 'lowest-latency':
        // Same as nearest, but more explicit
        return nodes.reduce((best, current) => {
          const bestLatency = best.latency || Infinity;
          const currentLatency = current.latency || Infinity;
          return currentLatency < bestLatency ? current : best;
        });

      case 'highest-capacity':
        // Prefer nodes with highest capacity
        return nodes.reduce((best, current) => {
          const bestCapacity = best.capacity || 0;
          const currentCapacity = current.capacity || 0;
          return currentCapacity > bestCapacity ? current : best;
        });

      case 'round-robin':
        // Simple round-robin (could be improved with state)
        return nodes[Math.floor(Math.random() * nodes.length)];

      default:
        return nodes[0];
    }
  }

  /**
   * Get optimal region for a client
   */
  async getOptimalRegion(clientIP?: string, clientRegion?: Region): Promise<Region> {
    if (clientRegion) {
      return clientRegion;
    }

    if (clientIP) {
      return this.inferRegionFromIP(clientIP);
    }

    return 'local';
  }
}

// Singleton instance
let edgeRouterInstance: EdgeRouter | null = null;

export function getEdgeRouter(): EdgeRouter {
  if (!edgeRouterInstance) {
    edgeRouterInstance = new EdgeRouter();
  }
  return edgeRouterInstance;
}

