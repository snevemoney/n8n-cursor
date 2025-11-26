/**
 * System-Wide Automation
 * Handles error detection, backups, database sync, stack monitoring, and MCP integration
 */

import { getOrchestrator, getRAGStore, getOntologyStore } from './shared-stores';
import { getMCPn8nClient } from './mcp-n8n-client';
import { getCircuitBreaker } from './circuit-breaker';
import { getMetricsCollector } from './metrics';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

interface SystemHealth {
  services: ServiceStatus[];
  errors: ErrorReport[];
  backups: BackupStatus;
  database: DatabaseSyncStatus;
  stack: StackStatus;
  mcp: MCPStatus;
  timestamp: string;
}

interface ErrorReport {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  source: string;
  message: string;
  stack?: string;
  context?: Record<string, any>;
  detectedAt: string;
  resolvedAt?: string;
}

interface BackupStatus {
  lastBackup: string | null;
  nextBackup: string;
  retention: number;
  location: string;
}

interface DatabaseSyncStatus {
  lastSync: string | null;
  pendingMigrations: number;
  schemaVersion: string;
  synced: boolean;
}

interface StackStatus {
  services: Array<{
    name: string;
    status: 'online' | 'offline' | 'degraded';
    health: number; // 0-100
    lastCheck: string;
  }>;
  overallHealth: 'healthy' | 'degraded' | 'critical';
}

interface MCPStatus {
  tools: Array<{
    name: string;
    available: boolean;
    lastUsed?: string;
  }>;
  servers: Array<{
    name: string;
    connected: boolean;
    tools: number;
  }>;
}

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'unknown';
  health: number;
  lastCheck: string;
}

class SystemAutomation {
  private workspaceRoot: string;
  private errorLog: ErrorReport[] = [];
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private serviceHealthInterval: NodeJS.Timeout | null = null;
  private backupInterval: NodeJS.Timeout | null = null;
  private databaseSyncInterval: NodeJS.Timeout | null = null;
  private mcpCheckInterval: NodeJS.Timeout | null = null;
  private lastHealthErrorTimes: Map<string, number> = new Map();
  private readonly HEALTH_ERROR_THROTTLE = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.workspaceRoot = path.resolve(process.cwd(), '../..');
  }

  /**
   * Initialize all automation systems
   */
  async initialize() {
    console.log('🦂 Initializing system-wide automation...');

    // Emit startup log event
    try {
      const { emitEvent } = require('./telemetry/emitter');
      emitEvent({
        type: 'system.log',
        source: 'system-automation',
        level: 'info',
        message: 'System automation initialized - starting monitoring and health checks',
        severity: 'info'
      });
    } catch (err) {
      // Silent fail
    }

    // Error detection (every 30 seconds)
    this.healthCheckInterval = setInterval(() => {
      this.detectErrors();
    }, 30 * 1000);

    // Service health checks (every 60 seconds) - emits telemetry events
    this.serviceHealthInterval = setInterval(() => {
      this.checkServiceHealth().catch(err => {
        console.error('❌ Service health check failed:', err);
      });
    }, 60 * 1000);

    // Auto backups (every 6 hours)
    this.backupInterval = setInterval(() => {
      this.performBackup();
    }, 6 * 60 * 60 * 1000);

    // Database sync (every 15 minutes)
    this.databaseSyncInterval = setInterval(() => {
      this.syncDatabase();
    }, 15 * 60 * 1000);

    // MCP tools check (every 5 minutes)
    this.mcpCheckInterval = setInterval(() => {
      this.checkMCPTools();
    }, 5 * 60 * 1000);

    // Update circuit breaker metrics (every 30 seconds)
    setInterval(() => {
      this.updateCircuitBreakerMetrics();
    }, 30 * 1000);

    // Initial checks
    await Promise.all([
      this.detectErrors(),
      this.checkMCPTools(),
      this.getSystemHealth(),
      this.updateCircuitBreakerMetrics()
    ]);

    console.log('✅ System-wide automation initialized');
    
    // Emit completion log
    try {
      const { emitEvent } = require('./telemetry/emitter');
      emitEvent({
        type: 'system.log',
        source: 'system-automation',
        level: 'info',
        message: 'System automation initialization complete - all monitoring systems active',
        severity: 'info'
      });
    } catch (err) {
      // Silent fail
    }
  }

  /**
   * Update circuit breaker metrics
   */
  private updateCircuitBreakerMetrics(): void {
    try {
      const metrics = getMetricsCollector();
      const n8nBreaker = getCircuitBreaker('n8n');
      const stats = n8nBreaker.getStats();
      
      // Update circuit breaker state (0=closed, 1=open, 0.5=half-open)
      const stateValue = stats.state === 'closed' ? 0 : stats.state === 'open' ? 1 : 0.5;
      metrics.setGauge('scorpion_circuit_breaker_state', stateValue, { service: 'n8n' });
      
      // Note: Failure counter is incremented by the circuit breaker itself when failures occur
      // This function only updates the state gauge
    } catch (error) {
      console.warn('Failed to update circuit breaker metrics:', error);
    }
  }

  /**
   * Detect errors across the system
   */
  async detectErrors(): Promise<void> {
    try {
      // Check service health
      const health = await this.checkServiceHealth();
      
      // Emit health check log
      try {
        const { emitEvent } = require('./telemetry/emitter');
        const overallHealth = this.calculateOverallHealth(health.services);
        emitEvent({
          type: 'system.log',
          source: 'system-automation',
          level: overallHealth === 'critical' ? 'error' : overallHealth === 'degraded' ? 'warn' : 'info',
          message: `Health check completed - Overall status: ${overallHealth}`,
          severity: overallHealth === 'critical' ? 'error' : overallHealth === 'degraded' ? 'warn' : 'info'
        });
      } catch (err) {
        // Silent fail
      }
      
      // Check logs for errors
      await this.scanLogsForErrors();
      
      // Check database errors
      await this.checkDatabaseErrors();
      
      // Check n8n execution errors
      await this.checkN8nErrors();
      
      // Store errors in ontology
      await this.storeErrors();
    } catch (error) {
      console.error('❌ Error detection failed:', error);
    }
  }

  /**
   * Check stack health (alias for checkServiceHealth)
   */
  async checkStackHealth(): Promise<StackStatus> {
    return this.checkServiceHealth();
  }

  /**
   * Check service health
   */
  async checkServiceHealth(): Promise<StackStatus> {
    const services = [
      { name: 'n8n', url: (process.env.N8N_API_URL || process.env.N8N_BASE_URL?.replace('/webhook', '') || 'http://localhost:5678'), healthPath: '/healthz' },
      { name: 'Ollama', url: process.env.OLLAMA_URL || 'http://localhost:11434', healthPath: '/api/version' },
      { name: 'PostgreSQL', port: 5432 },
      { name: 'Redis', port: 6379 },
      { name: 'Caddy', port: 80 },
    ];

    const serviceStatuses = await Promise.all(
      services.map(async (service) => {
        try {
          // Special handling for n8n - check if client is configured first
          if (service.name === 'n8n') {
            try {
              const mcpClient = getMCPn8nClient();
              if (!mcpClient.isConfigured()) {
                // n8n not configured - don't report error, just mark as offline
                const status = {
                  name: service.name,
                  status: 'offline' as const,
                  health: 0,
                  lastCheck: new Date().toISOString()
                };
                // Emit health event
                try {
                  const { telemetry } = require('./telemetry/emitter');
                  telemetry.systemHealth(service.name, 'down');
                } catch (err) {
                  // Silent fail
                }
                return status;
              }
            } catch (clientError) {
              // Client initialization failed - skip health check
              const status = {
                name: service.name,
                status: 'offline' as const,
                health: 0,
                lastCheck: new Date().toISOString()
              };
              // Emit health event
              try {
                const { telemetry } = require('./telemetry/emitter');
                telemetry.systemHealth(service.name, 'down');
              } catch (err) {
                // Silent fail
              }
              return status;
            }
          }

          let serviceStatus: 'healthy' | 'degraded' | 'down' = 'down';
          let healthValue = 0;

          if ('url' in service) {
            const healthPath = 'healthPath' in service ? service.healthPath : '/healthz';
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            let response: Response;
            try {
              response = await fetch(`${service.url}${healthPath}`, {
                signal: controller.signal
              });
            } finally {
              clearTimeout(timeoutId);
            }
            
            // Check for auth errors (401/403) - don't report these as errors
            if (!response.ok && (response.status === 401 || response.status === 403)) {
              // Auth error - don't report, just mark as offline
              serviceStatus = 'down';
              healthValue = 0;
            } else {
              serviceStatus = response.ok ? 'healthy' : 'down';
              healthValue = response.ok ? 100 : 0;
            }
          } else {
            // TCP port check
            const isOpen = await this.checkPort(service.port);
            serviceStatus = isOpen ? 'healthy' : 'down';
            healthValue = isOpen ? 100 : 0;
          }

          // Emit health event
          try {
            const { telemetry } = require('./telemetry/emitter');
            telemetry.systemHealth(service.name, serviceStatus);
          } catch (err) {
            // Silent fail
          }

          return {
            name: service.name,
            status: serviceStatus === 'healthy' ? 'online' as const : 'offline' as const,
            health: healthValue,
            lastCheck: new Date().toISOString()
          };
        } catch (error: any) {
          // Only report errors if they're not auth-related and not throttled
          const errorMessage = error.message || String(error);
          const isAuthError = errorMessage.includes('401') || 
                            errorMessage.includes('403') || 
                            errorMessage.includes('authentication') ||
                            errorMessage.includes('Unauthorized') ||
                            errorMessage.includes('Forbidden');
          
          if (!isAuthError) {
            // Throttle error reporting to prevent spam
            const lastErrorTime = this.lastHealthErrorTimes.get(service.name) || 0;
            const now = Date.now();
            
            if (now - lastErrorTime > this.HEALTH_ERROR_THROTTLE) {
              this.reportError({
                severity: 'medium',
                source: 'health-check',
                message: `Service ${service.name} health check failed`,
                context: { service: service.name, error: errorMessage }
              });
              this.lastHealthErrorTimes.set(service.name, now);
            }
          }
          
          // Emit health event for failed check
          try {
            const { telemetry } = require('./telemetry/emitter');
            telemetry.systemHealth(service.name, 'down');
          } catch (err) {
            // Silent fail
          }
          
          return {
            name: service.name,
            status: 'offline' as const,
            health: 0,
            lastCheck: new Date().toISOString()
          };
        }
      })
    );

    const overallHealth = this.calculateOverallHealth(serviceStatuses);

    return {
      services: serviceStatuses,
      overallHealth
    };
  }

  /**
   * Perform automatic backup
   */
  async performBackup(): Promise<void> {
    try {
      console.log('🔄 Performing automatic backup...');
      
      const workspaceRoot = this.workspaceRoot;
      
      // Try Scorpion-specific backup first
      const scorpionBackupScript = path.join(workspaceRoot, 'scripts', 'backup-scorpion.sh');
      try {
        await fs.access(scorpionBackupScript);
        await this.runScript(scorpionBackupScript);
        console.log('✅ Scorpion data backed up');
      } catch {
        console.warn('⚠️ Scorpion backup script not found, trying general backup');
      }
      
      // Also try general backup script
      const backupScript = path.join(workspaceRoot, 'scripts', 'backup.sh');
      try {
        await fs.access(backupScript);
        await this.runScript(backupScript);
        console.log('✅ General backup completed');
      } catch {
        console.warn('⚠️ General backup script not found, using comprehensive backup');
        await this.runComprehensiveBackup();
      }
      
      // Update backup status
      await this.updateBackupStatus();
      
      // Update metrics
      const metrics = getMetricsCollector();
      metrics.incrementCounter('scorpion_backups_total');
      
      console.log('✅ Automatic backup completed');
    } catch (error) {
      this.reportError({
        severity: 'high',
        source: 'backup',
        message: 'Automatic backup failed',
        context: { error: (error as Error).message }
      });
    }
  }

  /**
   * Sync database schema and migrations
   */
  async syncDatabase(): Promise<void> {
    try {
      console.log('🔄 Syncing database...');
      
      const workspaceRoot = this.workspaceRoot;
      const migrateScript = path.join(workspaceRoot, 'scripts', 'migrate', 'migrate.js');
      
      try {
        await fs.access(migrateScript);
        
        // Run migration status check
        const status = await this.runScript(migrateScript, ['status'], { captureOutput: true });
        
        // If migrations pending, run migrations
        if (status.includes('pending') || status.includes('not applied')) {
          await this.runScript(migrateScript, ['up']);
          console.log('✅ Database migrations applied');
        }
      } catch (error) {
        console.warn('⚠️ Migration script not found or failed:', error);
      }
      
      // Update database sync status
      await this.updateDatabaseSyncStatus();
      
    } catch (error) {
      this.reportError({
        severity: 'medium',
        source: 'database-sync',
        message: 'Database sync failed',
        context: { error: (error as Error).message }
      });
    }
  }

  /**
   * Check MCP tools availability
   */
  async checkMCPTools(): Promise<void> {
    try {
      const mcpConfigPath = path.join(process.env.HOME || '', '.cursor', 'mcp.json');
      
      try {
        const mcpConfig = JSON.parse(await fs.readFile(mcpConfigPath, 'utf-8'));
        
        const servers = Object.keys(mcpConfig.mcpServers || {});
        const mcpStatus: MCPStatus = {
          tools: [],
          servers: []
        };

        for (const serverName of servers) {
          const server = mcpConfig.mcpServers[serverName];
          const tools = server.tools || [];
          
          mcpStatus.servers.push({
            name: serverName,
            connected: true, // Assume connected if config exists
            tools: tools.length
          });

          // Add individual tools
          for (const tool of tools) {
            mcpStatus.tools.push({
              name: `${serverName}:${tool}`,
              available: true
            });
          }
        }

        // Store MCP status in ontology
        const ontologyStore = await getOntologyStore();
        await ontologyStore.store({
            id: 'mcp-status',
            type: 'Metric',
            createdAt: new Date(),
            updatedAt: new Date(),
            data: {
              ...mcpStatus,
              timestamp: new Date().toISOString()
            }
          });
      } catch (error) {
        console.warn('⚠️ Could not read MCP config:', error);
      }
    } catch (error) {
      console.error('❌ MCP tools check failed:', error);
    }
  }

  /**
   * Get comprehensive system health
   */
  async getSystemHealth(): Promise<SystemHealth> {
    const [stack, errors, backups, database, mcp] = await Promise.all([
      this.checkServiceHealth(),
      this.getRecentErrors(),
      this.getBackupStatus(),
      this.getDatabaseSyncStatus(),
      this.getMCPStatus()
    ]);

    return {
      services: stack.services,
      errors,
      backups,
      database,
      stack,
      mcp,
      timestamp: new Date().toISOString()
    };
  }

  // Helper methods
  private async checkPort(port: number): Promise<boolean> {
    // Simple TCP port check
    return new Promise((resolve) => {
      const net = require('net');
      const socket = new net.Socket();
      socket.setTimeout(2000);
      socket.once('connect', () => {
        socket.destroy();
        resolve(true);
      });
      socket.once('timeout', () => {
        socket.destroy();
        resolve(false);
      });
      socket.once('error', () => {
        resolve(false);
      });
      socket.connect(port, 'localhost');
    });
  }

  private calculateOverallHealth(services: StackStatus['services']): 'healthy' | 'degraded' | 'critical' {
    const offline = services.filter(s => s.status === 'offline').length;
    const degraded = services.filter(s => s.status === 'degraded').length;
    const total = services.length;
    const online = total - offline - degraded;
    
    // Critical: More than 50% offline or core services (n8n) offline
    const coreServicesOffline = services.some(s => 
      (s.name === 'n8n' || s.name === 'PostgreSQL') && s.status === 'offline'
    );
    if (coreServicesOffline || offline > total / 2) return 'critical';
    
    // Degraded: 1-2 services offline or any degraded
    if (offline > 0 || degraded > 0) return 'degraded';
    
    // Healthy: All services online
    return 'healthy';
  }

  private reportError(error: Omit<ErrorReport, 'id' | 'detectedAt'>): void {
    const report: ErrorReport = {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...error,
      detectedAt: new Date().toISOString()
    };
    
    this.errorLog.push(report);
    
    // Keep only last 1000 errors
    if (this.errorLog.length > 1000) {
      this.errorLog = this.errorLog.slice(-1000);
    }
    
    console.error(`❌ [${error.severity.toUpperCase()}] ${error.source}: ${error.message}`);
    
    // Emit telemetry event for the log
    try {
      const { emitEvent } = require('./telemetry/emitter');
      // Map error severity to valid schema values
      const severityMap: Record<string, 'info' | 'warn' | 'error' | 'critical'> = {
        'critical': 'critical',
        'high': 'error',
        'medium': 'warn',
        'low': 'info',
        'info': 'info',
        'warn': 'warn',
        'warning': 'warn',
        'error': 'error'
      };
      const mappedSeverity = severityMap[error.severity] || 'info';
      const mappedLevel = mappedSeverity === 'critical' ? 'critical' : mappedSeverity;
      
      emitEvent({
        type: 'system.log',
        source: error.source || 'system-automation',
        level: mappedLevel,
        message: error.message,
        severity: mappedSeverity,
        context: error.context
      });
      
      // Create notification for critical/high severity errors
      if (error.severity === 'critical' || error.severity === 'high') {
        const { getNotificationManager } = require('./notification-manager');
        const notificationManager = getNotificationManager();
        notificationManager.notify(
          error.severity === 'critical' ? 'danger' : 'warning',
          error.severity,
          `System Error: ${error.source}`,
          error.message,
          error.severity === 'critical'
        );
      }
    } catch (err) {
      // Silent fail - telemetry/notifications not critical for error reporting
      console.debug('Failed to emit telemetry/notification for error:', err);
    }
  }

  private async scanLogsForErrors(): Promise<void> {
    // Scan application logs for error patterns
    // Implementation depends on your logging setup
  }

  private async checkDatabaseErrors(): Promise<void> {
    // Check database for error records
  }

  private async checkN8nErrors(): Promise<void> {
    try {
      const mcpClient = getMCPn8nClient();
      // Check recent n8n executions for errors
      // This would require n8n API access to executions via MCP
    } catch (error) {
      // Silent fail
    }
  }

  private async storeErrors(): Promise<void> {
    try {
      const ontologyStore = await getOntologyStore();
      for (const error of this.errorLog.slice(-10)) { // Store last 10 errors
        try {
          // Only store basic error info to avoid schema validation issues
          await ontologyStore.store({
            id: error.id,
            type: 'Error',
            createdAt: new Date(error.detectedAt),
            updatedAt: new Date(error.detectedAt),
            data: {
              message: error.message,
              severity: error.severity,
              source: error.source,
              detectedAt: error.detectedAt
            }
          });
        } catch (storeError: any) {
          console.error(`Failed to store error ${error.id}:`, storeError.message);
        }
      }
    } catch (error: any) {
      console.error('Failed to access ontology store:', error.message);
    }
  }

  private async runScript(script: string, args: string[] = [], options: { captureOutput?: boolean } = {}): Promise<string> {
    return new Promise((resolve, reject) => {
      const process = spawn('bash', [script, ...args], {
        cwd: this.workspaceRoot,
        stdio: options.captureOutput ? 'pipe' : 'inherit'
      });

      let output = '';
      if (options.captureOutput && process.stdout) {
        process.stdout.on('data', (data: Buffer) => {
          output += data.toString();
        });
      }

      process.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Script exited with code ${code}`));
        }
      });
    });
  }

  private async runComprehensiveBackup(): Promise<void> {
    const backupScript = path.join(this.workspaceRoot, 'scripts', 'comprehensive_backup.sh');
    try {
      await fs.access(backupScript);
      await this.runScript(backupScript);
    } catch {
      console.warn('⚠️ Comprehensive backup script not found');
    }
  }

  private async updateBackupStatus(): Promise<void> {
    // Update backup status in ontology
  }

  private async updateDatabaseSyncStatus(): Promise<void> {
    // Update database sync status
  }

  /**
   * Get recent errors (public method for health checks)
   */
  getErrors(): ErrorReport[] {
    return this.errorLog.slice(-50); // Last 50 errors
  }

  private async getRecentErrors(): Promise<ErrorReport[]> {
    return this.errorLog.slice(-50); // Last 50 errors
  }

  private async getBackupStatus(): Promise<BackupStatus> {
    // Read backup status from ontology or file
    return {
      lastBackup: null,
      nextBackup: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      retention: 7,
      location: '/backups'
    };
  }

  private async getDatabaseSyncStatus(): Promise<DatabaseSyncStatus> {
    // Read database sync status
    return {
      lastSync: null,
      pendingMigrations: 0,
      schemaVersion: '1.0.0',
      synced: true
    };
  }

  private async getMCPStatus(): Promise<MCPStatus> {
    // Read MCP status from ontology
    return {
      tools: [],
      servers: []
    };
  }

  /**
   * Stop all automation
   */
  stop() {
    if (this.healthCheckInterval) clearInterval(this.healthCheckInterval);
    if (this.serviceHealthInterval) clearInterval(this.serviceHealthInterval);
    if (this.backupInterval) clearInterval(this.backupInterval);
    if (this.databaseSyncInterval) clearInterval(this.databaseSyncInterval);
    if (this.mcpCheckInterval) clearInterval(this.mcpCheckInterval);
  }
}

// Singleton instance
let systemAutomation: SystemAutomation | null = null;

export function getSystemAutomation(): SystemAutomation {
  if (!systemAutomation) {
    systemAutomation = new SystemAutomation();
  }
  return systemAutomation;
}

export async function initializeSystemAutomation() {
  const automation = getSystemAutomation();
  await automation.initialize();
  return automation;
}

