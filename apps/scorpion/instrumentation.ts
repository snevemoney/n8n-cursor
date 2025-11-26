// apps/scorpion/instrumentation.ts

// Next.js instrumentation hook - runs on server startup
// Initialize event-driven architecture components here

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Initialize event handlers for event-driven architecture
    try {
      const { initializeEventHandlers } = await import('./lib/events/handlers');
      initializeEventHandlers();
      console.log('✅ Event handlers initialized');
    } catch (error) {
      console.error('Failed to initialize event handlers:', error);
    }
    
    // Initialize cost automation (auto-register resources and budgets)
    try {
      const { initializeCostAutomation } = await import('./lib/cost/automation');
      await initializeCostAutomation();
    } catch (error) {
      console.error('Failed to initialize cost automation:', error);
    }
  }
}
