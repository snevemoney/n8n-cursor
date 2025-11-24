/**
 * Storage Reconnect Monitor
 * Monitors for SSD reconnection and automatically switches back to SSD mode
 */

import { detectStorage, validateDetectedSSD, clearDetectionCache } from './storage-detector';
import { getStorageConfig, resetStorageConfig } from './storage-config';
import { validateAndRefreshStorage } from './storage-error-handler';

interface ReconnectMonitorOptions {
  checkInterval?: number; // milliseconds between checks (default: 10 seconds)
  autoMigrate?: boolean; // automatically migrate data back to SSD (default: true)
  enabled?: boolean; // enable/disable monitoring (default: true)
}

class StorageReconnectMonitor {
  private intervalId: NodeJS.Timeout | null = null;
  private lastWasSSD: boolean = false;
  private lastSSDPath: string | null = null;
  private options: Required<ReconnectMonitorOptions>;
  private isMonitoring: boolean = false;

  constructor(options: ReconnectMonitorOptions = {}) {
    this.options = {
      checkInterval: options.checkInterval ?? 10000, // 10 seconds
      autoMigrate: options.autoMigrate ?? true,
      enabled: options.enabled ?? true,
    };
  }

  /**
   * Start monitoring for SSD reconnection
   */
  async start(): Promise<void> {
    if (!this.options.enabled) {
      console.log('📡 Storage reconnect monitor disabled');
      return;
    }

    if (this.isMonitoring) {
      console.log('📡 Storage reconnect monitor already running');
      return;
    }

    // Get initial state
    try {
      const config = await getStorageConfig();
      this.lastWasSSD = config.isSSD;
      this.lastSSDPath = config.storageInfo.detectedSSDPath;
    } catch (error) {
      console.warn('Failed to get initial storage config:', error);
    }

    this.isMonitoring = true;
    console.log(`📡 Storage reconnect monitor started (checking every ${this.options.checkInterval / 1000}s)`);

    // Start monitoring interval
    this.intervalId = setInterval(() => {
      this.checkForReconnection().catch(error => {
        console.error('Error checking for reconnection:', error);
      });
    }, this.options.checkInterval);

    // Do initial check
    await this.checkForReconnection();
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isMonitoring = false;
    console.log('📡 Storage reconnect monitor stopped');
  }

  /**
   * Check if SSD has reconnected
   */
  private async checkForReconnection(): Promise<void> {
    try {
      const currentConfig = await getStorageConfig();
      const currentIsSSD = currentConfig.isSSD;
      const currentSSDPath = currentConfig.storageInfo.detectedSSDPath;

      // If we were using fallback and now SSD is available
      if (!this.lastWasSSD && currentIsSSD && currentSSDPath) {
        console.log('🔄 SSD reconnected! Switching back to SSD mode...');
        await this.handleReconnection(currentSSDPath);
        this.lastWasSSD = true;
        this.lastSSDPath = currentSSDPath;
        return;
      }

      // If we were using SSD and it's still available, validate it
      if (this.lastWasSSD && this.lastSSDPath) {
        const isValid = await validateDetectedSSD(this.lastSSDPath);
        if (!isValid) {
          console.warn('⚠️ SSD disconnected, using fallback storage');
          this.lastWasSSD = false;
          this.lastSSDPath = null;
        }
      }

      // Update state
      this.lastWasSSD = currentIsSSD;
      this.lastSSDPath = currentSSDPath;
    } catch (error) {
      console.error('Error in reconnect check:', error);
    }
  }

  /**
   * Handle SSD reconnection
   */
  private async handleReconnection(ssdPath: string): Promise<void> {
    try {
      // Validate SSD is accessible
      const isValid = await validateDetectedSSD(ssdPath);
      if (!isValid) {
        console.warn('⚠️ SSD path not accessible:', ssdPath);
        return;
      }

      // Clear caches and refresh storage detection (only on actual reconnection)
      console.log('🔄 Refreshing storage configuration after SSD reconnection...');
      // Force re-initialization since SSD was reconnected
      clearDetectionCache();
      resetStorageConfig();
      
      const { initializeStorageConfig } = await import('./storage-config');
      const newConfig = await initializeStorageConfig();
      
      // Validate the new config is accessible
      const { isStorageAccessible } = await import('./storage-error-handler');
      const isAccessible = await isStorageAccessible(newConfig.dataDir);
      
      if (!isAccessible) {
        console.warn('⚠️ Storage validation failed after reconnection');
        return;
      }
      
      if (newConfig.isSSD && newConfig.storageInfo.detectedSSDPath) {
        console.log(`✅ Switched back to SSD mode: ${newConfig.dataDir}`);
        
        // Optionally migrate data back to SSD
        if (this.options.autoMigrate) {
          await this.migrateDataToSSD(newConfig);
        } else {
          console.log('💡 Auto-migration disabled. Data remains in fallback location.');
        }

        // Emit reconnection event (if telemetry is available)
        try {
          const { telemetry } = await import('../telemetry/emitter');
          telemetry.systemLog('info', 'SSD reconnected and system switched back to SSD mode', 'storage-reconnect-monitor', {
              ssdPath: newConfig.storageInfo.detectedSSDPath,
              dataDir: newConfig.dataDir,
          });
        } catch {
          // Telemetry not available, skip
        }
      }
    } catch (error: any) {
      console.error('❌ Error handling reconnection:', error);
    }
  }

  /**
   * Migrate data back to SSD after reconnection
   */
  private async migrateDataToSSD(config: any): Promise<void> {
    try {
      const defaultDir = path.join(process.cwd(), 'data', 'scorpion');
      const ssdDataDir = config.dataDir;

      // Only migrate if we're switching from default to SSD
      if (ssdDataDir !== defaultDir && config.isSSD) {
        // Check if default directory has data
        const defaultFiles = await fs.readdir(defaultDir).catch(() => []);
        
        if (defaultFiles.length > 0) {
          console.log(`🔄 Migrating data back to SSD from ${defaultDir}...`);
          
          // The storage-config initialization already handles migration
          // We just need to trigger a refresh, which will handle migration
          console.log(`💡 ${defaultFiles.length} items found in fallback location`);
          console.log(`   Data will be available in both locations (SSD and fallback)`);
          console.log(`   New operations will use SSD: ${ssdDataDir}`);
          console.log(`   Note: Migration happens automatically during initialization`);
        }
      }
    } catch (error: any) {
      console.warn('⚠️ Migration check failed:', error.message);
    }
  }
}

// Singleton instance
let monitorInstance: StorageReconnectMonitor | null = null;

/**
 * Get or create the storage reconnect monitor
 */
export function getStorageReconnectMonitor(options?: ReconnectMonitorOptions): StorageReconnectMonitor {
  if (!monitorInstance) {
    monitorInstance = new StorageReconnectMonitor(options);
  }
  return monitorInstance;
}

/**
 * Start monitoring for SSD reconnection
 */
export async function startReconnectMonitoring(options?: ReconnectMonitorOptions): Promise<void> {
  const monitor = getStorageReconnectMonitor(options);
  await monitor.start();
}

/**
 * Stop monitoring
 */
export function stopReconnectMonitoring(): void {
  if (monitorInstance) {
    monitorInstance.stop();
  }
}

// Import required modules
import fs from 'fs/promises';
import path from 'path';

