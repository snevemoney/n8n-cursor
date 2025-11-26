import { Event, EventDeliveryStatus } from '@shared/types';

export interface OutboxConfig {
  n8nWebhookUrl: string;
  webhookToken: string;
  maxRetries: number;
  retryDelayMs: number;
  batchSize: number;
  pollIntervalMs: number;
  deadLetterSlackWebhook?: string;
}

export interface OutboxEvent {
  id: string;
  type: string;
  occurred_at: string;
  data: any;
  source: string;
  version: string;
  correlation_id?: string;
  user_id?: string;
  business_node_id?: string;
  delivery_status: EventDeliveryStatus;
  delivery_attempts: number;
  last_delivery_error?: string;
  created_at: string;
  updated_at: string;
}

export class OutboxWorker {
  private config: Required<OutboxConfig>;
  private isRunning = false;
  private stopRequested = false;

  constructor(config: OutboxConfig) {
    this.config = {
      maxRetries: 5,
      retryDelayMs: 1000,
      batchSize: 10,
      pollIntervalMs: 5000,
      deadLetterSlackWebhook: undefined,
      ...config
    };
  }

  /**
   * Start the outbox worker
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('[OutboxWorker] Already running');
      return;
    }

    this.isRunning = true;
    this.stopRequested = false;
    
    console.log('[OutboxWorker] Starting outbox worker...');
    
    while (!this.stopRequested) {
      try {
        await this.processBatch();
        await this.sleep(this.config.pollIntervalMs);
      } catch (error) {
        console.error('[OutboxWorker] Error in main loop:', error);
        await this.sleep(this.config.pollIntervalMs * 2);
      }
    }
    
    this.isRunning = false;
    console.log('[OutboxWorker] Stopped');
  }

  /**
   * Stop the outbox worker
   */
  async stop(): Promise<void> {
    console.log('[OutboxWorker] Stop requested...');
    this.stopRequested = true;
    
    // Wait for current batch to complete
    while (this.isRunning) {
      await this.sleep(100);
    }
  }

  /**
   * Process a batch of pending events
   */
  private async processBatch(): Promise<void> {
    const events = await this.getPendingEvents();
    
    if (events.length === 0) {
      return;
    }

    console.log(`[OutboxWorker] Processing ${events.length} events`);

    const promises = events.map(event => this.processEvent(event));
    await Promise.allSettled(promises);
  }

  /**
   * Process a single event
   */
  private async processEvent(event: OutboxEvent): Promise<void> {
    try {
      // Mark as delivering
      await this.updateEventStatus(event.id, 'delivering');

      // Attempt delivery
      const success = await this.deliverEvent(event);
      
      if (success) {
        await this.updateEventStatus(event.id, 'delivered');
        console.log(`[OutboxWorker] Event ${event.id} delivered successfully`);
      } else {
        throw new Error('Delivery failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[OutboxWorker] Failed to deliver event ${event.id}:`, errorMessage);

      // Update delivery attempts and error
      await this.updateDeliveryAttempt(event.id, errorMessage);

      // Check if we should move to dead letter
      if (event.delivery_attempts >= this.config.maxRetries) {
        await this.moveToDeadLetter(event, errorMessage);
      }
    }
  }

  /**
   * Deliver event to n8n webhook
   */
  private async deliverEvent(event: OutboxEvent): Promise<boolean> {
    const response = await fetch(this.config.n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Token': this.config.webhookToken,
        'X-Event-ID': event.id,
        'X-Event-Type': event.type,
        'X-Correlation-ID': event.correlation_id || '',
        'X-User-ID': event.user_id || '',
        'X-Business-Node-ID': event.business_node_id || ''
      },
      body: JSON.stringify(event)
    });

    return response.ok;
  }

  /**
   * Get pending events from the database
   */
  private async getPendingEvents(): Promise<OutboxEvent[]> {
    // This would typically query your database
    // For now, return mock data
    return [];
  }

  /**
   * Update event delivery status
   */
  private async updateEventStatus(eventId: string, status: EventDeliveryStatus): Promise<void> {
    // This would typically update your database
    console.log(`[OutboxWorker] Updating event ${eventId} status to ${status}`);
  }

  /**
   * Update delivery attempt count and error
   */
  private async updateDeliveryAttempt(eventId: string, error: string): Promise<void> {
    // This would typically update your database
    console.log(`[OutboxWorker] Updating delivery attempt for event ${eventId}`);
  }

  /**
   * Move event to dead letter queue
   */
  private async moveToDeadLetter(event: OutboxEvent, error: string): Promise<void> {
    console.log(`[OutboxWorker] Moving event ${event.id} to dead letter queue`);

    // Update status in database
    await this.updateEventStatus(event.id, 'dead_letter');

    // Send notification to Slack if configured
    if (this.config.deadLetterSlackWebhook) {
      await this.notifyDeadLetter(event, error);
    }
  }

  /**
   * Send dead letter notification to Slack
   */
  private async notifyDeadLetter(event: OutboxEvent, error: string): Promise<void> {
    try {
      const message = {
        text: '🚨 Event moved to dead letter queue',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Event ID:* ${event.id}\n*Type:* ${event.type}\n*Error:* ${error}\n*Attempts:* ${event.delivery_attempts}`
            }
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Re-run in n8n'
                },
                url: `${this.config.n8nWebhookUrl}?event_id=${event.id}&retry=true`
              }
            ]
          }
        ]
      };

      await fetch(this.config.deadLetterSlackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });
    } catch (error) {
      console.error('[OutboxWorker] Failed to send dead letter notification:', error);
    }
  }

  /**
   * Utility function to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get worker status
   */
  getStatus(): { isRunning: boolean; stopRequested: boolean } {
    return {
      isRunning: this.isRunning,
      stopRequested: this.stopRequested
    };
  }
}

/**
 * Factory function to create outbox worker
 */
export const createOutboxWorker = (config: OutboxConfig): OutboxWorker => {
  return new OutboxWorker(config);
};

/**
 * Start outbox worker with default configuration
 */
export const startOutboxWorker = async (config: OutboxConfig): Promise<OutboxWorker> => {
  const worker = createOutboxWorker(config);
  await worker.start();
  return worker;
};
