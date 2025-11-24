/**
 * Edge Node Registry
 * Manages edge nodes across multiple regions
 */

import { query } from '../db/client';
import { randomUUID } from 'crypto';
import { emitEvent } from '../events/event-bus';
import type { EdgeNode, Region } from './types';

export class EdgeRegistry {
  /**
   * Register an edge node
   */
  async registerNode(node: Omit<EdgeNode, 'id' | 'lastHealthCheck'>): Promise<string> {
    const id = randomUUID();
    const now = new Date().toISOString();

    try {
      if (!process.env.DATABASE_URL) {
        await emitEvent({
          id: randomUUID(),
          type: 'edge.node.registered',
          severity: 'info',
          timestamp: now,
          source: 'edge-registry',
          environment: 'dev',
          data: {
            nodeId: id,
            region: node.region,
            host: node.host,
            port: node.port,
          },
        });
        return id;
      }

      const insertQuery = `
        INSERT INTO edge_nodes (
          id, region, host, port, protocol, status, latency, capacity, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (region, host, port) 
        DO UPDATE SET
          status = EXCLUDED.status,
          latency = EXCLUDED.latency,
          capacity = EXCLUDED.capacity,
          metadata = EXCLUDED.metadata,
          last_health_check = NOW()
        RETURNING id::text
      `;

      const result = await query<{ id: string }>(insertQuery, [
        id,
        node.region,
        node.host,
        node.port,
        node.protocol,
        node.status || 'active',
        node.latency || null,
        node.capacity || null,
        JSON.stringify(node.metadata || {}),
      ]);

      const nodeId = result.rows[0]?.id || id;

      await emitEvent({
        id: randomUUID(),
        type: 'edge.node.registered',
        severity: 'info',
        timestamp: now,
        source: 'edge-registry',
        environment: 'dev',
        data: {
          nodeId,
          region: node.region,
          host: node.host,
          port: node.port,
        },
      });

      return nodeId;
    } catch (error) {
      console.error('[EdgeRegistry] Failed to register node:', error);
      return id;
    }
  }

  /**
   * Get nodes by region
   */
  async getNodesByRegion(region: Region, activeOnly: boolean = true): Promise<EdgeNode[]> {
    try {
      if (!process.env.DATABASE_URL) {
        return [];
      }

      const conditions: string[] = ['region = $1'];
      const params: any[] = [region];

      if (activeOnly) {
        conditions.push("status = 'active'");
      }

      const selectQuery = `
        SELECT 
          id, region, host, port, protocol, status, latency, capacity,
          metadata, last_health_check
        FROM edge_nodes
        WHERE ${conditions.join(' AND ')}
        ORDER BY latency ASC NULLS LAST, capacity DESC NULLS LAST
      `;

      const result = await query<{
        id: string;
        region: string;
        host: string;
        port: number;
        protocol: string;
        status: string;
        latency: number | null;
        capacity: number | null;
        metadata: string;
        last_health_check: string;
      }>(selectQuery, params);

      return result.rows.map(row => ({
        id: row.id,
        region: row.region as Region,
        host: row.host,
        port: row.port,
        protocol: row.protocol as 'http' | 'https',
        status: row.status as 'active' | 'standby' | 'maintenance',
        latency: row.latency || undefined,
        capacity: row.capacity || undefined,
        metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
        lastHealthCheck: row.last_health_check,
      }));
    } catch (error) {
      console.error('[EdgeRegistry] Failed to get nodes:', error);
      return [];
    }
  }

  /**
   * Get all active nodes
   */
  async getAllNodes(): Promise<EdgeNode[]> {
    try {
      if (!process.env.DATABASE_URL) {
        return [];
      }

      const selectQuery = `
        SELECT 
          id, region, host, port, protocol, status, latency, capacity,
          metadata, last_health_check
        FROM edge_nodes
        WHERE status = 'active'
        ORDER BY region, latency ASC NULLS LAST
      `;

      const result = await query(selectQuery);

      return result.rows.map(row => ({
        id: row.id,
        region: row.region as Region,
        host: row.host,
        port: row.port,
        protocol: row.protocol as 'http' | 'https',
        status: row.status as 'active' | 'standby' | 'maintenance',
        latency: row.latency || undefined,
        capacity: row.capacity || undefined,
        metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
        lastHealthCheck: row.last_health_check,
      }));
    } catch (error) {
      console.error('[EdgeRegistry] Failed to get all nodes:', error);
      return [];
    }
  }

  /**
   * Update node health
   */
  async updateNodeHealth(nodeId: string, latency?: number, status?: 'active' | 'standby' | 'maintenance'): Promise<void> {
    try {
      if (!process.env.DATABASE_URL) {
        return;
      }

      const updates: string[] = ['last_health_check = NOW()'];
      const params: any[] = [nodeId];

      if (latency !== undefined) {
        params.push(latency);
        updates.push(`latency = $${params.length}`);
      }

      if (status) {
        params.push(status);
        updates.push(`status = $${params.length}`);
      }

      const updateQuery = `
        UPDATE edge_nodes
        SET ${updates.join(', ')}
        WHERE id = $1
      `;

      await query(updateQuery, params);
    } catch (error) {
      console.error('[EdgeRegistry] Failed to update node health:', error);
    }
  }
}

// Singleton instance
let edgeRegistryInstance: EdgeRegistry | null = null;

export function getEdgeRegistry(): EdgeRegistry {
  if (!edgeRegistryInstance) {
    edgeRegistryInstance = new EdgeRegistry();
  }
  return edgeRegistryInstance;
}

