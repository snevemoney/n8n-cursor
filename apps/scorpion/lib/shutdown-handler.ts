/**
 * Graceful Shutdown Handler
 * Handles SIGTERM/SIGINT signals to ensure clean shutdown of all systems
 */

import { getAgentOperationsExecutor } from './agent-operations-executor';
import { getAgentOperationsScheduler } from './agent-operations-scheduler';

let isShuttingDown = false;
let shutdownTimeout: NodeJS.Timeout | null = null;
const SHUTDOWN_TIMEOUT_MS = 30000; // 30 seconds max shutdown time

/**
 * Cleanup function for auto-sync
 */
async function cleanupAutoSync(): Promise<void> {
  try {
    const { stopAutoSync } = await import('./auto-sync');
    if (typeof stopAutoSync === 'function') {
      stopAutoSync();
    }
  } catch (error) {
    console.warn('⚠️  Auto-sync cleanup failed:', error);
  }
}

/**
 * Cleanup function for agent operations
 */
async function cleanupAgentOperations(): Promise<void> {
  try {
    const scheduler = getAgentOperationsScheduler();
    if (scheduler && typeof scheduler.stop === 'function') {
      scheduler.stop();
    }
    
    // Wait for any active operations to complete (with timeout)
    const executor = getAgentOperationsExecutor();
    if (executor) {
      // Give active operations up to 10 seconds to complete
      const activeOps = (executor as any).activeExecutions;
      if (activeOps && activeOps.size > 0) {
        console.log(`⏳ Waiting for ${activeOps.size} active operation(s) to complete...`);
        let waitTime = 0;
        while (activeOps.size > 0 && waitTime < 10000) {
          await new Promise(resolve => setTimeout(resolve, 500));
          waitTime += 500;
        }
        if (activeOps.size > 0) {
          console.warn(`⚠️  ${activeOps.size} operation(s) still running after timeout`);
        }
      }
    }
  } catch (error) {
    console.warn('⚠️  Agent operations cleanup failed:', error);
  }
}

/**
 * Cleanup function for browser pool
 */
async function cleanupBrowserPool(): Promise<void> {
  try {
    const { getBrowserPool } = await import('./research/browser-pool');
    const browserPool = await getBrowserPool();
    if (browserPool && typeof browserPool.shutdown === 'function') {
      await browserPool.shutdown();
    }
  } catch (error) {
    console.warn('⚠️  Browser pool cleanup failed:', error);
  }
}

/**
 * Cleanup function for system automation
 */
async function cleanupSystemAutomation(): Promise<void> {
  try {
    const { getSystemAutomation } = await import('./system-automation');
    const automation = getSystemAutomation();
    if (automation && typeof automation.cleanup === 'function') {
      await automation.cleanup();
    }
  } catch (error) {
    console.warn('⚠️  System automation cleanup failed:', error);
  }
}

/**
 * Cleanup function for telemetry
 */
async function cleanupTelemetry(): Promise<void> {
  try {
    const { telemetry } = await import('./telemetry/emitter');
    if (telemetry && typeof telemetry.shutdown === 'function') {
      await telemetry.shutdown();
    }
  } catch (error) {
    console.warn('⚠️  Telemetry cleanup failed:', error);
  }
}

/**
 * Cleanup function for Loki logging
 */
async function cleanupLoki(): Promise<void> {
  try {
    const { shutdownLokiClient } = await import('./logging/loki-client');
    await shutdownLokiClient();
  } catch (error) {
    console.warn('⚠️  Loki cleanup failed:', error);
  }
}

/**
 * Perform graceful shutdown of all systems
 */
async function gracefulShutdown(signal: string): Promise<void> {
  if (isShuttingDown) {
    console.log('⚠️  Shutdown already in progress, forcing exit...');
    process.exit(1);
  }

  isShuttingDown = true;
  console.log(`\n🛑 ${signal} received, initiating graceful shutdown...`);

  const shutdownStartTime = Date.now();
  const cleanupTasks: Array<{ name: string; fn: () => Promise<void> }> = [
    { name: 'Auto-sync', fn: cleanupAutoSync },
    { name: 'Agent operations', fn: cleanupAgentOperations },
    { name: 'Browser pool', fn: cleanupBrowserPool },
    { name: 'System automation', fn: cleanupSystemAutomation },
    { name: 'Telemetry', fn: cleanupTelemetry },
    { name: 'Loki logging', fn: cleanupLoki },
  ];

  // Set timeout to force exit if shutdown takes too long
  shutdownTimeout = setTimeout(() => {
    console.error('❌ Shutdown timeout exceeded, forcing exit...');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);

  try {
    // Run cleanup tasks in parallel (they should be independent)
    const results = await Promise.allSettled(
      cleanupTasks.map(async ({ name, fn }) => {
        try {
          await fn();
          console.log(`✅ ${name} shutdown complete`);
        } catch (error: any) {
          console.error(`❌ ${name} shutdown failed:`, error.message);
          throw error;
        }
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    const duration = ((Date.now() - shutdownStartTime) / 1000).toFixed(2);
    console.log(`\n✅ Graceful shutdown complete: ${successful}/${cleanupTasks.length} systems shut down in ${duration}s`);

    if (failed > 0) {
      console.warn(`⚠️  ${failed} system(s) failed to shut down cleanly`);
    }

    // Clear timeout and exit
    if (shutdownTimeout) {
      clearTimeout(shutdownTimeout);
    }
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Shutdown error:', error);
    if (shutdownTimeout) {
      clearTimeout(shutdownTimeout);
    }
    process.exit(1);
  }
}

/**
 * Initialize shutdown handlers
 */
export function initializeShutdownHandlers(): void {
  // Handle SIGTERM (Docker/Kubernetes graceful shutdown)
  process.on('SIGTERM', () => {
    gracefulShutdown('SIGTERM').catch(err => {
      console.error('Fatal error during shutdown:', err);
      process.exit(1);
    });
  });

  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', () => {
    gracefulShutdown('SIGINT').catch(err => {
      console.error('Fatal error during shutdown:', err);
      process.exit(1);
    });
  });

  // Handle uncaught exceptions (log and shutdown)
  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught exception:', error);
    gracefulShutdown('uncaughtException').catch(() => {
      process.exit(1);
    });
  });

  // Handle unhandled promise rejections (log and continue)
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled promise rejection:', reason);
    // Don't shutdown on unhandled rejections - just log them
    // (Next.js handles these internally)
  });

  console.log('✅ Graceful shutdown handlers initialized');
}

