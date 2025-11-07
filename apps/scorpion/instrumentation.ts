/**
 * Next.js Instrumentation
 * Runs on server startup to initialize all Scorpion systems
 * Now with parallelized initialization for faster startup
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('🦂 Initializing Scorpion systems...');
    const startTime = Date.now();

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

    // PHASE 1: Initialize persistent stores (CRITICAL - must be first)
    await safeInit('Stores', async () => {
      const { initializeStores } = await import('./lib/shared-stores');
      await initializeStores();
    });

    // PHASE 2: Parallel initialization of independent systems (FAST)
    await Promise.allSettled([
      safeInit('Knowledge base ingestion', async () => {
        const { getRAGStore } = await import('./lib/shared-stores');
        const { KnowledgeIngestionService } = await import('./lib/knowledge-ingestion');
        const ragStore = await getRAGStore();
        const ingestionService = new KnowledgeIngestionService(ragStore);
        
        // Check if already ingested (to avoid re-ingesting on every restart)
        const status = ingestionService.getStatus();
        if (status.ingested === 0) {
          await ingestionService.ingestAll();
        } else {
          console.log(`✅ Knowledge base already ingested (${status.ingested}/${status.total} domains)`);
        }
      }),
      
      safeInit('Training data collector', async () => {
        const { initializeTrainingDataCollector } = await import('./lib/fine-tuning/collector');
        await initializeTrainingDataCollector();
      }),

      safeInit('System automation', async () => {
        const { initializeSystemAutomation } = await import('./lib/system-automation');
        await initializeSystemAutomation();
      }),

      safeInit('Auto-sync', async () => {
        const { initializeAutoSync } = await import('./lib/auto-sync');
        initializeAutoSync();
      })
    ]);

    // PHASE 3: Systems that depend on previous ones (PARALLEL)
    await Promise.allSettled([
      safeInit('Mistake learner', async () => {
        const { initializeMistakeLearner } = await import('./lib/fine-tuning/mistake-learner');
        await initializeMistakeLearner();
      }),

      safeInit('Auto fine-tuning', async () => {
        const { initializeAutoFineTuning } = await import('./lib/fine-tuning/orchestrator');
        await initializeAutoFineTuning();
      }),

      safeInit('Proactive intelligence', async () => {
        const { initializeProactiveIntelligence } = await import('./lib/proactive-intelligence');
        await initializeProactiveIntelligence();
      })
    ]);

    // PHASE 4: Final systems
    await safeInit('Notification system', async () => {
      const { initializeNotificationSystem } = await import('./lib/notifications');
      await initializeNotificationSystem();
    });

    // Summary
    const successful = initResults.filter(r => r.success).length;
    const failed = initResults.filter(r => !r.success).length;
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`🦂 Initialization complete: ${successful}/${initResults.length} systems initialized in ${duration}s`);
    
    if (failed > 0) {
      console.warn(`⚠️ ${failed} system(s) failed to initialize:`);
      initResults.filter(r => !r.success).forEach(r => {
        console.warn(`  - ${r.name}: ${r.error}`);
      });
    }
  }
}
