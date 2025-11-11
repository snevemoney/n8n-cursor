/**
 * Log Store - In-memory log storage for system logs
 * Collects logs from telemetry events, system automation, and other sources
 * Uses SSD for persistent log storage when available
 */

import fs from 'fs/promises';
import path from 'path';
import { writeFileWithFallback, readFileWithFallback, validateAndRefreshStorage, isStorageError } from './storage/storage-error-handler';
import { getLokiClient } from './logging/loki-client';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'critical';
  source: string;
  message: string;
  details?: any;
}

class LogStore {
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 5000; // Keep last 5000 logs
  private logDir: string | null = null;
  private logFile: string | null = null;
  private autoSaveInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Subscribe to telemetry events
    this.setupTelemetryListener();
    // Initialize persistent log storage
    this.initializePersistentStorage();
  }

  /**
   * Initialize persistent log storage on SSD if available
   */
  private async initializePersistentStorage() {
    try {
      const { getStorageConfig } = await import('./storage/storage-config');
      const config = await getStorageConfig();
      
      // Use SSD cache directory for logs if available, otherwise use data directory
      this.logDir = config.cacheDir || config.dataDir;
      this.logFile = path.join(this.logDir, 'system-logs.jsonl');
      
      // Ensure directory exists with fallback support
      const { ensureDirWithFallback } = await import('./storage/storage-error-handler');
      const dirResult = await ensureDirWithFallback(this.logDir);
      if (!dirResult.success) {
        throw new Error(`Failed to create log directory: ${this.logDir}`);
      }
      if (dirResult.usedFallback) {
        this.logDir = dirResult.path;
        this.logFile = path.join(this.logDir, 'system-logs.jsonl');
        console.warn(`⚠️ LogStore using fallback directory: ${this.logDir}`);
      }
      
      // Load existing logs
      await this.loadPersistentLogs();
      
      // Auto-save logs every 30 seconds
      this.autoSaveInterval = setInterval(() => {
        this.savePersistentLogs().catch(err => {
          console.debug('[LogStore] Failed to save logs:', err);
        });
      }, 30000);
      
      console.log(`📝 Log storage initialized: ${this.logDir}`);
    } catch (error) {
      console.debug('[LogStore] Failed to initialize persistent storage:', error);
      // Continue with in-memory only
    }
  }

  /**
   * Load logs from persistent storage with fallback
   */
  private async loadPersistentLogs() {
    if (!this.logFile) return;
    
    try {
      const result = await readFileWithFallback(this.logFile);
      
      if (!result.success) {
        if (result.error && !result.error.includes('ENOENT')) {
          console.debug('[LogStore] Failed to load persistent logs:', result.error);
        }
        return;
      }
      
      // Update log file path if fallback was used
      if (result.path && result.path !== this.logFile) {
        this.logFile = result.path;
        this.logDir = path.dirname(result.path);
        console.warn(`⚠️ LogStore using fallback path: ${this.logFile}`);
      }
      
      const lines = result.content!.trim().split('\n').filter(l => l);
      
      // Load last MAX_LOGS entries
      const loadedLogs = lines
        .slice(-this.MAX_LOGS)
        .map(line => {
          try {
            return JSON.parse(line) as LogEntry;
          } catch {
            return null;
          }
        })
        .filter((log): log is LogEntry => log !== null);
      
      this.logs = loadedLogs;
      console.log(`📝 Loaded ${this.logs.length} logs from persistent storage`);
    } catch (error: any) {
      console.debug('[LogStore] Failed to load persistent logs:', error);
    }
  }

  /**
   * Save logs to persistent storage with robust error handling
   */
  private async savePersistentLogs() {
    if (!this.logFile || this.logs.length === 0) return;
    
    try {
      // Validate storage before saving
      const validation = await validateAndRefreshStorage();
      if (!validation.isValid) {
        console.debug('[LogStore] Storage validation failed, logs may not be persisted');
      }
      
      // Update paths if storage was refreshed
      if (validation.wasRefreshed && this.logDir) {
        const fileName = path.basename(this.logFile);
        this.logDir = validation.config.cacheDir || validation.config.dataDir;
        this.logFile = path.join(this.logDir, fileName);
        console.warn(`🔄 LogStore storage refreshed, using new path: ${this.logFile}`);
      }
      
      // Save last MAX_LOGS entries as JSONL
      const logsToSave = this.logs.slice(-this.MAX_LOGS);
      const content = logsToSave.map(log => JSON.stringify(log)).join('\n');
      
      // Use robust write with fallback
      const result = await writeFileWithFallback(
        this.logFile,
        content,
        { ensureDir: true, maxRetries: 3 }
      );
      
      if (!result.success) {
        console.debug(`[LogStore] Failed to save logs after retries: ${result.error}`);
        if (result.usedFallback) {
          // Update log file path to fallback location
          this.logFile = result.path;
          this.logDir = path.dirname(result.path);
          console.warn(`   Logs will use fallback location: ${result.path}`);
        }
      } else if (result.usedFallback) {
        // Update paths to fallback location
        this.logFile = result.path;
        this.logDir = path.dirname(result.path);
        console.warn(`⚠️ Logs saved to fallback location: ${result.path}`);
      }
    } catch (error: any) {
      console.debug('[LogStore] Failed to save persistent logs:', error);
      if (isStorageError(error)) {
        console.debug('   This appears to be a storage disconnection issue');
      }
    }
  }

  private setupTelemetryListener() {
    try {
      const { getTelemetryBus } = require('./telemetry/bus');
      const bus = getTelemetryBus();
      
      // Listen for system.log events
      bus.onEvent((event: any) => {
        if (event.type === 'system.log') {
          this.addLog({
            id: event.id || `log-${event.ts}`,
            timestamp: new Date(event.ts).toISOString(),
            level: (event.level || 'info') as LogEntry['level'],
            source: event.source || 'system',
            message: event.message || 'Log event',
            details: event
          });
        }
      });
    } catch (error) {
      console.debug('[LogStore] Failed to setup telemetry listener:', error);
    }
  }

  /**
   * Add a log entry
   */
  addLog(log: LogEntry): void {
    // Ship to Loki for centralized logging
    try {
      const loki = getLokiClient();
      loki.log(log.level, log.message, {
        id: log.id,
        source: log.source,
        timestamp: log.timestamp,
        ...log.details,
      }).catch(err => {
        // Don't throw - logging failures shouldn't crash the app
        console.debug('[LogStore] Failed to ship to Loki:', err);
      });
    } catch (error) {
      // Loki client not available or disabled - continue with local storage
      console.debug('[LogStore] Loki client not available');
    }
    this.logs.push(log);
    
    // Keep only last MAX_LOGS
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(-this.MAX_LOGS);
    }

    // Save to persistent storage immediately for critical logs
    if (log.level === 'critical' || log.level === 'error') {
      this.savePersistentLogs().catch(err => {
        console.debug('[LogStore] Failed to save critical log:', err);
      });
    }
  }

  /**
   * Get logs with optional filtering
   */
  getLogs(options: {
    limit?: number;
    level?: 'error' | 'warn' | 'info' | 'critical';
    source?: string;
  } = {}): LogEntry[] {
    let filtered = [...this.logs];
    
    // Sort by timestamp (newest first)
    filtered.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeB - timeA;
    });
    
    // Apply filters
    if (options.level) {
      filtered = filtered.filter(log => log.level === options.level);
    }
    if (options.source) {
      filtered = filtered.filter(log => log.source === options.source);
    }
    
    // Apply limit
    if (options.limit) {
      filtered = filtered.slice(0, options.limit);
    }
    
    return filtered;
  }

  /**
   * Get log statistics
   */
  getStats(): {
    total: number;
    errors: number;
    warnings: number;
    info: number;
    bySource: Record<string, number>;
  } {
    return {
      total: this.logs.length,
      errors: this.logs.filter(l => l.level === 'error' || l.level === 'critical').length,
      warnings: this.logs.filter(l => l.level === 'warn').length,
      info: this.logs.filter(l => l.level === 'info').length,
      bySource: this.logs.reduce((acc, log) => {
        acc[log.source] = (acc[log.source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  /**
   * Clear old logs (keep last N)
   */
  clearOldLogs(keep: number = 1000): void {
    if (this.logs.length > keep) {
      this.logs = this.logs.slice(-keep);
    }
  }
}

// Singleton instance
let logStoreInstance: LogStore | null = null;

export function getLogStore(): LogStore {
  if (!logStoreInstance) {
    logStoreInstance = new LogStore();
  }
  return logStoreInstance;
}

export type { LogEntry };

