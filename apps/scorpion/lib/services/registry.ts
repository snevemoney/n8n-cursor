/**
 * Service Registry
 * Central registry for service discovery and health tracking
 */

import { query } from '../db/client';
import { randomUUID } from 'crypto';
import { emitEvent } from '../events/event-bus';
import type { ServiceInstance, ServiceHealth } from './types';

export class ServiceRegistry {
  /**
   * Register a service instance
   */
  async register(instance: Omit<ServiceInstance, 'id' | 'registeredAt' | 'lastHeartbeat'>): Promise<string> {
    const id = randomUUID();
    const now = new Date().toISOString();

    try {
      if (!process.env.DATABASE_URL) {
        // Fallback: just emit event
        await emitEvent({
          id: randomUUID(),
          type: 'service.registered',
          severity: 'info',
          timestamp: now,
          source: 'service-registry',
          environment: 'dev',
          data: {
            serviceId: id,
            serviceName: instance.serviceName,
            host: instance.host,
            port: instance.port,
          },
        });
        return id;
      }

      const insertQuery = `
        INSERT INTO service_instances (
          id, service_name, version, host, port, protocol, status, metadata, tags
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (service_name, host, port) 
        DO UPDATE SET
          version = EXCLUDED.version,
          status = EXCLUDED.status,
          metadata = EXCLUDED.metadata,
          tags = EXCLUDED.tags,
          last_heartbeat = NOW()
        RETURNING id::text
      `;

      const result = await query<{ id: string }>(insertQuery, [
        id,
        instance.serviceName,
        instance.version,
        instance.host,
        instance.port,
        instance.protocol,
        instance.status || 'unknown',
        JSON.stringify(instance.metadata || {}),
        JSON.stringify(instance.tags || []),
      ]);

      const serviceId = result.rows[0]?.id || id;

      // Emit event
      await emitEvent({
        id: randomUUID(),
        type: 'service.registered',
        severity: 'info',
        timestamp: now,
        source: 'service-registry',
        environment: 'dev',
        data: {
          serviceId,
          serviceName: instance.serviceName,
          host: instance.host,
          port: instance.port,
        },
      });

      return serviceId;
    } catch (error) {
      console.error('[ServiceRegistry] Failed to register service:', error);
      return id;
    }
  }

  /**
   * Update service heartbeat
   */
  async heartbeat(serviceId: string, status?: 'healthy' | 'unhealthy'): Promise<void> {
    try {
      if (!process.env.DATABASE_URL) {
        return;
      }

      const updateQuery = `
        UPDATE service_instances
        SET last_heartbeat = NOW(),
            status = COALESCE($2::text, status)
        WHERE id = $1
      `;

      await query(updateQuery, [serviceId, status || null]);
    } catch (error) {
      console.error('[ServiceRegistry] Failed to update heartbeat:', error);
    }
  }

  /**
   * Discover services by name
   */
  async discover(serviceName: string, healthyOnly: boolean = true): Promise<ServiceInstance[]> {
    try {
      if (!process.env.DATABASE_URL) {
        return [];
      }

      const conditions: string[] = ['service_name = $1'];
      const params: any[] = [serviceName];

      if (healthyOnly) {
        conditions.push("status = 'healthy'");
      }

      // Only return services that have heartbeated in the last 5 minutes
      conditions.push('last_heartbeat > NOW() - INTERVAL \'5 minutes\'');

      const selectQuery = `
        SELECT 
          id, service_name, version, host, port, protocol, status,
          metadata, tags, registered_at, last_heartbeat
        FROM service_instances
        WHERE ${conditions.join(' AND ')}
        ORDER BY last_heartbeat DESC
      `;

      const result = await query<{
        id: string;
        service_name: string;
        version: string;
        host: string;
        port: number;
        protocol: string;
        status: string;
        metadata: string;
        tags: string;
        registered_at: string;
        last_heartbeat: string;
      }>(selectQuery, params);

      return result.rows.map(row => ({
        id: row.id,
        serviceName: row.service_name,
        version: row.version,
        host: row.host,
        port: row.port,
        protocol: row.protocol as 'http' | 'https' | 'grpc',
        status: row.status as 'healthy' | 'unhealthy' | 'unknown',
        metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
        tags: row.tags ? JSON.parse(row.tags) : undefined,
        registeredAt: row.registered_at,
        lastHeartbeat: row.last_heartbeat,
      }));
    } catch (error) {
      console.error('[ServiceRegistry] Failed to discover services:', error);
      return [];
    }
  }

  /**
   * Get all registered services
   */
  async listServices(): Promise<ServiceInstance[]> {
    try {
      if (!process.env.DATABASE_URL) {
        return [];
      }

      const selectQuery = `
        SELECT 
          id, service_name, version, host, port, protocol, status,
          metadata, tags, registered_at, last_heartbeat
        FROM service_instances
        WHERE last_heartbeat > NOW() - INTERVAL '10 minutes'
        ORDER BY service_name, last_heartbeat DESC
      `;

      const result = await query(selectQuery);

      return result.rows.map(row => ({
        id: row.id,
        serviceName: row.service_name,
        version: row.version,
        host: row.host,
        port: row.port,
        protocol: row.protocol as 'http' | 'https' | 'grpc',
        status: row.status as 'healthy' | 'unhealthy' | 'unknown',
        metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
        tags: row.tags ? JSON.parse(row.tags) : undefined,
        registeredAt: row.registered_at,
        lastHeartbeat: row.last_heartbeat,
      }));
    } catch (error) {
      console.error('[ServiceRegistry] Failed to list services:', error);
      return [];
    }
  }

  /**
   * Deregister a service
   */
  async deregister(serviceId: string): Promise<void> {
    try {
      if (!process.env.DATABASE_URL) {
        return;
      }

      await query('DELETE FROM service_instances WHERE id = $1', [serviceId]);

      await emitEvent({
        id: randomUUID(),
        type: 'service.deregistered',
        severity: 'info',
        timestamp: new Date().toISOString(),
        source: 'service-registry',
        environment: 'dev',
        data: { serviceId },
      });
    } catch (error) {
      console.error('[ServiceRegistry] Failed to deregister service:', error);
    }
  }

  /**
   * Record service health check
   */
  async recordHealth(health: ServiceHealth): Promise<void> {
    try {
      if (!process.env.DATABASE_URL) {
        return;
      }

      const insertQuery = `
        INSERT INTO service_health (
          id, service_id, status, checks, timestamp
        ) VALUES ($1, $2, $3, $4, $5)
      `;

      await query(insertQuery, [
        randomUUID(),
        health.serviceId,
        health.status,
        JSON.stringify(health.checks),
        health.timestamp,
      ]);

      // Update service instance status
      await query(
        `UPDATE service_instances SET status = $1 WHERE id = $2`,
        [health.status, health.serviceId]
      );
    } catch (error) {
      console.error('[ServiceRegistry] Failed to record health:', error);
    }
  }
}

// Singleton instance
let serviceRegistryInstance: ServiceRegistry | null = null;

export function getServiceRegistry(): ServiceRegistry {
  if (!serviceRegistryInstance) {
    serviceRegistryInstance = new ServiceRegistry();
  }
  return serviceRegistryInstance;
}

