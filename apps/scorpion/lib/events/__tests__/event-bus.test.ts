/**
 * Event Bus Tests
 * Test the event-driven architecture foundation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ScorpionEventBus, getEventBus, emitEvent } from '../event-bus';
import type { WorkflowStartedEvent, WorkflowFailedEvent } from '../types';

describe('EventBus', () => {
  let bus: ScorpionEventBus;

  beforeEach(() => {
    bus = new ScorpionEventBus({ persistence: false, enableMetrics: false });
  });

  it('should create a singleton instance', () => {
    const bus1 = getEventBus();
    const bus2 = getEventBus();
    expect(bus1).toBe(bus2);
  });

  it('should emit and receive events', async () => {
    const receivedEvents: any[] = [];

    const unsubscribe = bus.subscribe('workflow.started', (event) => {
      receivedEvents.push(event);
    });

    await bus.publish({
      id: 'test-1',
      type: 'workflow.started',
      severity: 'info',
      timestamp: new Date().toISOString(),
      source: 'test',
      environment: 'dev',
      data: {
        workflowId: 'wf-123',
        workflowName: 'Test Workflow',
        trigger: 'manual',
      },
    });

    // Wait a bit for async handling
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(receivedEvents.length).toBe(1);
    expect(receivedEvents[0].type).toBe('workflow.started');
    expect(receivedEvents[0].data.workflowId).toBe('wf-123');

    unsubscribe();
  });

  it('should support wildcard subscriptions', async () => {
    const receivedEvents: any[] = [];

    const unsubscribe = bus.subscribeAll((event) => {
      receivedEvents.push(event);
    });

    await bus.publish({
      id: 'test-2',
      type: 'workflow.failed',
      severity: 'error',
      timestamp: new Date().toISOString(),
      source: 'test',
      environment: 'dev',
      data: {
        workflowId: 'wf-456',
        workflowName: 'Failed Workflow',
        error: 'Test error',
      },
    });

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(receivedEvents.length).toBeGreaterThan(0);
    expect(receivedEvents.some(e => e.type === 'workflow.failed')).toBe(true);

    unsubscribe();
  });

  it('should track event metrics', async () => {
    const busWithMetrics = new ScorpionEventBus({ enableMetrics: true });

    await busWithMetrics.publish({
      id: 'test-3',
      type: 'workflow.started',
      severity: 'info',
      timestamp: new Date().toISOString(),
      source: 'test',
      environment: 'dev',
      data: {
        workflowId: 'wf-789',
        workflowName: 'Metrics Test',
        trigger: 'manual',
      },
    });

    const metrics = busWithMetrics.getMetrics();
    expect(metrics['workflow.started']).toBe(1);
  });

  it('should use emitEvent helper', async () => {
    const receivedEvents: any[] = [];

    const bus = getEventBus();
    const unsubscribe = bus.subscribe('workflow.started', (event) => {
      receivedEvents.push(event);
    });

    await emitEvent({
      id: 'test-4',
      type: 'workflow.started',
      severity: 'info',
      timestamp: new Date().toISOString(),
      source: 'test',
      environment: 'dev',
      data: {
        workflowId: 'wf-helper',
        workflowName: 'Helper Test',
        trigger: 'manual',
      },
    });

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(receivedEvents.length).toBeGreaterThan(0);

    unsubscribe();
  });
});

