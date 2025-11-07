import { telemetry } from './emitter';

/**
 * Synthetic event generator for SCORPION_DEMO=1 mode
 * Generates realistic events to demo the observability features
 */
class DemoEventGenerator {
  private interval: NodeJS.Timeout | null = null;
  private running = false;
  
  private agents = [
    { id: 'E-001', name: 'Architectus' },
    { id: 'A-002', name: 'Analytica' },
    { id: 'P-003', name: 'Pragmaton' },
    { id: 'S-004', name: 'Satori' },
    { id: 'N-005', name: 'Nexus' },
  ];
  
  private queues = ['research', 'workflows', 'knowledge', 'analysis'];
  private workflows = ['WF-001', 'WF-002', 'WF-003'];
  
  start(): void {
    if (this.running) return;
    
    this.running = true;
    console.log('[DemoEventGenerator] Starting synthetic events...');
    
    // Generate initial burst
    this.generateBurst();
    
    // Then generate events every 2-5 seconds
    this.interval = setInterval(() => {
      this.generateRandomEvent();
    }, 2000 + Math.random() * 3000);
  }
  
  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.running = false;
    console.log('[DemoEventGenerator] Stopped synthetic events');
  }
  
  private generateBurst(): void {
    // Initial burst of events to populate the UI
    for (let i = 0; i < 10; i++) {
      setTimeout(() => this.generateRandomEvent(), i * 200);
    }
  }
  
  private generateRandomEvent(): void {
    const eventType = Math.random();
    
    if (eventType < 0.25) {
      // Agent events
      this.generateAgentEvent();
    } else if (eventType < 0.5) {
      // Job events
      this.generateJobEvent();
    } else if (eventType < 0.75) {
      // Workflow events
      this.generateWorkflowEvent();
    } else {
      // System events
      this.generateSystemEvent();
    }
  }
  
  private generateAgentEvent(): void {
    const agent = this.randomAgent();
    const eventType = Math.random();
    
    if (eventType < 0.7) {
      telemetry.agentStarted(agent.id, agent.name);
    } else if (eventType < 0.9) {
      telemetry.agentStopped(agent.id, agent.name);
    } else {
      telemetry.agentError(agent.id, agent.name, 'Simulated error for demo');
    }
  }
  
  private generateJobEvent(): void {
    const queue = this.randomQueue();
    const jobId = `JOB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const worker = `worker-${Math.floor(Math.random() * 3) + 1}`;
    
    // Simulate job lifecycle
    telemetry.jobQueued(jobId, queue);
    
    setTimeout(() => {
      telemetry.jobStarted(jobId, queue, worker);
      
      const duration = 500 + Math.random() * 2000;
      setTimeout(() => {
        if (Math.random() < 0.9) {
          // 90% success rate
          telemetry.jobCompleted(jobId, queue, worker, duration);
        } else {
          telemetry.jobFailed(jobId, queue, worker, 'Simulated job failure');
        }
      }, duration);
    }, 100 + Math.random() * 500);
  }
  
  private generateWorkflowEvent(): void {
    const workflowId = this.randomWorkflow();
    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    telemetry.workflowRunStarted(workflowId, executionId);
    
    const duration = 1000 + Math.random() * 3000;
    setTimeout(() => {
      if (Math.random() < 0.85) {
        // 85% success rate
        telemetry.workflowRunCompleted(workflowId, executionId, duration);
      } else {
        telemetry.workflowRunFailed(workflowId, executionId, 'Workflow execution failed');
      }
    }, duration);
  }
  
  private generateSystemEvent(): void {
    const services = ['ollama', 'n8n', 'postgres', 'api'];
    const service = services[Math.floor(Math.random() * services.length)];
    
    const eventType = Math.random();
    
    if (eventType < 0.1) {
      // Occasional errors
      telemetry.httpError('GET', `/api/${service}/check`, 500, 'Service unavailable');
    } else {
      // Mostly healthy
      const status = Math.random() < 0.95 ? 'healthy' : 'degraded';
      telemetry.systemHealth(service, status, Math.random() * 86400);
    }
    
    // Queue depth updates
    const queue = this.randomQueue();
    telemetry.queueDepth(queue, Math.floor(Math.random() * 50));
  }
  
  private randomAgent() {
    return this.agents[Math.floor(Math.random() * this.agents.length)];
  }
  
  private randomQueue() {
    return this.queues[Math.floor(Math.random() * this.queues.length)];
  }
  
  private randomWorkflow() {
    return this.workflows[Math.floor(Math.random() * this.workflows.length)];
  }
}

// Singleton
let demoGenerator: DemoEventGenerator | null = null;

export function startDemoEvents(): void {
  if (!demoGenerator) {
    demoGenerator = new DemoEventGenerator();
  }
  demoGenerator.start();
}

export function stopDemoEvents(): void {
  if (demoGenerator) {
    demoGenerator.stop();
  }
}

// Auto-start if SCORPION_DEMO=1
if (process.env.SCORPION_DEMO === '1') {
  console.log('[Demo] SCORPION_DEMO=1 detected, starting demo events...');
  startDemoEvents();
}

