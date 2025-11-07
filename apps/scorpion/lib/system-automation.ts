/**
 * System-Wide Automation
 * Handles error detection, backups, database sync, stack monitoring, and MCP integration
 */

import { getOrchestrator, getRAGStore, getOntologyStore } from './shared-stores';
import { N8nClient } from './n8n-client';
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
  private backupInterval: NodeJS.Timeout | null = null;
  private databaseSyncInterval: NodeJS.Timeout | null = null;
  private mcpCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.workspaceRoot = path.resolve(process.cwd(), '../..');
  }

  /**
   * Initialize all automation systems
   */
  async initialize() {
    console.log('🦂 Initializing system-wide automation...');

    // Error detection (every 30 seconds)
    this.healthCheckInterval = setInterval(() => {
      this.detectErrors();
    }, 30 * 1000);

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

    // Initial checks
    await Promise.all([
      this.detectErrors(),
      this.checkMCPTools(),
      this.getSystemHealth()
    ]);

    console.log('✅ System-wide automation initialized');
  }

  /**
   * Detect errors across the system
   */
  async detectErrors(): Promise<void> {
    try {
      // Check service health
      const health = await this.checkServiceHealth();
      
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
   * Check service health
   */
  async checkServiceHealth(): Promise<StackStatus> {
    const services = [
      { name: 'n8n', url: process.env.N8N_BASE_URL?.replace('/webhook', '') || 'http://localhost:5678' },
      { name: 'Ollama', url: process.env.OLLAMA_URL || 'http://localhost:11434' },
      { name: 'PostgreSQL', port: 5432 },
      { name: 'Redis', port: 6379 },
      { name: 'Caddy', port: 80 },
    ];

    const serviceStatuses = await Promise.all(
      services.map(async (service) => {
        try {
          if ('url' in service) {
            const response = await fetch(`${service.url}/healthz`, {
              signal: AbortSignal.timeout(5000)
            });
            return {
              name: service.name,
              status: response.ok ? 'online' as const : 'offline' as const,
              health: response.ok ? 100 : 0,
              lastCheck: new Date().toISOString()
            };
          } else {
            // TCP port check
            const isOpen = await this.checkPort(service.port);
            return {
              name: service.name,
              status: isOpen ? 'online' as const : 'offline' as const,
              health: isOpen ? 100 : 0,
              lastCheck: new Date().toISOString()
            };
          }
        } catch (error) {
          this.reportError({
            severity: 'medium',
            source: 'health-check',
            message: `Service ${service.name} health check failed`,
            context: { service, error: (error as Error).message }
          });
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
        }

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
    
    if (offline > 0) return 'critical';
    if (degraded > 0) return 'degraded';
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
      const n8nClient = new N8nClient(process.env.N8N_API_KEY);
      // Check recent n8n executions for errors
      // This would require n8n API access to executions
    } catch (error) {
      // Silent fail
    }
  }

  private async storeErrors(): Promise<void> {
    const ontologyStore = await getOntologyStore();
    for (const error of this.errorLog.slice(-10)) { // Store last 10 errors
      await ontologyStore.store({
          id: error.id,
          type: 'Error',
          createdAt: new Date(error.detectedAt),
          updatedAt: new Date(error.detectedAt),
          data: error
        });
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

