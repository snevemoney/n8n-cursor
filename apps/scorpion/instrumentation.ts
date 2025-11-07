/**
 * Next.js Instrumentation
 * Runs on server startup to initialize all Scorpion systems
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('🦂 Initializing Scorpion systems...');

    const initResults: Array<{ name: string; success: boolean; error?: string }> = [];

    // Helper to safely initialize a system
    const safeInit = async (name: string, initFn: () => Promise<void> | void) => {
      try {
        await initFn();
        initResults.push({ name, success: true });
        console.log(`✅ ${name} initialized`);
      } catch (error: any) {
        initResults.push({ name, success: false, error: error.message });
        console.error(`❌ Failed to initialize ${name}:`, error.message);
        // Continue with other systems
      }
    };

    // 1. Initialize persistent stores (RAG, Ontology) - CRITICAL
    await safeInit('Stores', async () => {
      const { initializeStores } = await import('./lib/shared-stores');
      await initializeStores();
    });

    // 2. Initialize training data collector - depends on stores
    await safeInit('Training data collector', async () => {
      const { initializeTrainingDataCollector } = await import('./lib/fine-tuning/collector');
      await initializeTrainingDataCollector();
    });

    // 3. Initialize mistake learner - depends on collector
    await safeInit('Mistake learner', async () => {
      const { initializeMistakeLearner } = await import('./lib/fine-tuning/mistake-learner');
      await initializeMistakeLearner();
    });

    // 4. Initialize auto fine-tuning - depends on collector
    await safeInit('Auto fine-tuning', async () => {
      const { initializeAutoFineTuning } = await import('./lib/fine-tuning/orchestrator');
      await initializeAutoFineTuning();
    });

    // 5. Initialize automatic syncing (knowledge + workflows) - depends on stores
    await safeInit('Auto-sync', async () => {
      const { initializeAutoSync } = await import('./lib/auto-sync');
      initializeAutoSync();
    });

    // 6. Initialize system-wide automation
    await safeInit('System automation', async () => {
      const { initializeSystemAutomation } = await import('./lib/system-automation');
      await initializeSystemAutomation();
    });

    // 7. Initialize proactive intelligence - depends on mistake learner
    await safeInit('Proactive intelligence', async () => {
      const { initializeProactiveIntelligence } = await import('./lib/proactive-intelligence');
      await initializeProactiveIntelligence();
    });

    // 8. Initialize notification system - depends on proactive intelligence
    await safeInit('Notification system', async () => {
      const { initializeNotificationSystem } = await import('./lib/notifications');
      await initializeNotificationSystem();
    });

    // Summary
    const successful = initResults.filter(r => r.success).length;
    const failed = initResults.filter(r => !r.success).length;
    
    console.log(`🦂 Initialization complete: ${successful}/${initResults.length} systems initialized`);
    
    if (failed > 0) {
      console.warn(`⚠️ ${failed} system(s) failed to initialize:`);
      initResults.filter(r => !r.success).forEach(r => {
        console.warn(`  - ${r.name}: ${r.error}`);
      });
    }
  }
}

