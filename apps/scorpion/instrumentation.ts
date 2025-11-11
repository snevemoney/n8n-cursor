/**
 * Next.js Instrumentation
 * Runs on server startup to initialize all Scorpion systems
 * Now with parallelized initialization for faster startup
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Don't initialize stores here - let them initialize lazily
    // Only initialize critical systems
    console.log('🦂 Scorpion starting...');

    // Initialize shutdown handlers only
    try {
      const { initializeShutdownHandlers } = await import('./lib/shutdown-handler');
      initializeShutdownHandlers();
    } catch (error: any) {
      console.warn('⚠️  Shutdown handler skipped:', error.message);
    }

    // Everything else initializes lazily on first use
    console.log('✅ Scorpion ready - stores will initialize on first use');
  }
}
