#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import { performance } from 'perf_hooks';

// Configuration
const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  botCount: parseInt(process.env.BOT_COUNT || '10'),
  testDuration: parseInt(process.env.TEST_DURATION || '300'), // 5 minutes
  concurrency: parseInt(process.env.CONCURRENCY || '5'),
  mode: process.env.TEST_MODE || 'mock', // 'mock' or 'real'
};

interface BotMetrics {
  botId: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgResponseTime: number;
  errors: string[];
  actions: BotAction[];
}

interface BotAction {
  action: string;
  timestamp: number;
  responseTime: number;
  success: boolean;
  error?: string;
}

class LightningBot {
  private botId: string;
  private session: any = null;
  private metrics: BotMetrics;
  private isRunning: boolean = false;

  constructor(botId: string) {
    this.botId = botId;
    this.metrics = {
      botId,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      avgResponseTime: 0,
      errors: [],
      actions: []
    };
  }

  async authenticate(): Promise<boolean> {
    try {
      if (config.mode === 'mock') {
        this.session = { access_token: 'mock-token' };
        return true;
      }

      const supabase = createClient(config.supabaseUrl!, config.supabaseKey!);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `bot${this.botId}@lightningplatform.test`,
        password: 'BotPassword123!',
      });

      if (error) throw error;
      this.session = data.session;
      return true;
    } catch (error) {
      console.error(`Bot ${this.botId} auth failed:`, error);
      return false;
    }
  }

  private async makeRequest(endpoint: string, options: any = {}): Promise<any> {
    const startTime = performance.now();
    
    try {
      const response = await fetch(`${config.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(this.session && { Authorization: `Bearer ${this.session.access_token}` }),
          ...options.headers,
        },
      });

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      this.metrics.totalRequests++;
      
      if (response.ok) {
        this.metrics.successfulRequests++;
        const data = await response.json();
        
        this.metrics.actions.push({
          action: `${options.method || 'GET'} ${endpoint}`,
          timestamp: Date.now(),
          responseTime,
          success: true,
        });

        return data;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      this.metrics.failedRequests++;
      this.metrics.errors.push(`${endpoint}: ${error}`);
      
      this.metrics.actions.push({
        action: `${options.method || 'GET'} ${endpoint}`,
        timestamp: Date.now(),
        responseTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  // Simulate Lightning node info check
  async checkNodeInfo(): Promise<void> {
    await this.makeRequest('/api/lightning/node-info');
  }

  // Simulate invoice creation
  async createInvoice(): Promise<string> {
    const response = await this.makeRequest('/api/lightning/invoice', {
      method: 'POST',
      body: JSON.stringify({
        amount_sats: Math.floor(Math.random() * 10000) + 1000,
        description: `Test invoice from bot ${this.botId}`,
        expires_in: 3600,
      }),
    });
    return response.invoice?.id || 'mock-invoice-id';
  }

  // Simulate invoice status check
  async checkInvoiceStatus(invoiceId: string): Promise<void> {
    await this.makeRequest(`/api/lightning/invoice/status?invoice_id=${invoiceId}`);
  }

  // Simulate LNURL-pay flow
  async testLnurlPay(): Promise<void> {
    const invoiceId = await this.createInvoice();
    await this.makeRequest(`/api/lnurl-pay?invoice_id=${invoiceId}`);
    await this.makeRequest(`/api/lnurl-pay/callback?invoice_id=${invoiceId}&amount=1000000`);
  }

  // Simulate AI assistant interaction
  async testAiAssistant(): Promise<void> {
    await this.makeRequest('/api/ai/assistant', {
      method: 'POST',
      body: JSON.stringify({
        message: `Bot ${this.botId} testing AI assistant`,
        context: 'lightning_node_management',
      }),
    });
  }

  // Simulate system health check
  async testSystemCheck(): Promise<void> {
    await this.makeRequest('/api/test-system');
  }

  // Simulate abuse scan
  async testAbuseScan(): Promise<void> {
    await this.makeRequest('/api/abuse/scan');
  }

  // Simulate vector search
  async testVectorSearch(): Promise<void> {
    await this.makeRequest('/api/vector/search', {
      method: 'POST',
      body: JSON.stringify({
        query: 'lightning network channel management',
        limit: 5,
      }),
    });
  }

  // Simulate onboarding analytics
  async testAnalytics(): Promise<void> {
    await this.makeRequest('/api/analytics/onboarding', {
      method: 'POST',
      body: JSON.stringify({
        event: 'bot_test_event',
        properties: { bot_id: this.botId },
      }),
    });
  }

  // Run a random user behavior simulation
  async simulateUserBehavior(): Promise<void> {
    const actions = [
      () => this.checkNodeInfo(),
      () => this.createInvoice(),
      () => this.testLnurlPay(),
      () => this.testAiAssistant(),
      () => this.testSystemCheck(),
      () => this.testAbuseScan(),
      () => this.testVectorSearch(),
      () => this.testAnalytics(),
    ];

    // Simulate realistic user behavior with delays
    const numActions = Math.floor(Math.random() * 5) + 3; // 3-7 actions
    
    for (let i = 0; i < numActions; i++) {
      try {
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        await randomAction();
        
        // Random delay between actions (500ms - 3s)
        const delay = Math.floor(Math.random() * 2500) + 500;
        await new Promise(resolve => setTimeout(resolve, delay));
      } catch (error) {
        // Continue with other actions even if one fails
        console.warn(`Bot ${this.botId} action failed:`, error);
      }
    }
  }

  async start(): Promise<void> {
    this.isRunning = true;
    
    console.log(`🤖 Bot ${this.botId} starting...`);
    
    if (!(await this.authenticate())) {
      console.error(`❌ Bot ${this.botId} failed to authenticate`);
      return;
    }

    console.log(`✅ Bot ${this.botId} authenticated successfully`);

    const endTime = Date.now() + (config.testDuration * 1000);
    
    while (this.isRunning && Date.now() < endTime) {
      try {
        await this.simulateUserBehavior();
      } catch (error) {
        console.warn(`Bot ${this.botId} behavior simulation failed:`, error);
      }
    }

    this.calculateAverageResponseTime();
    console.log(`🏁 Bot ${this.botId} completed simulation`);
  }

  stop(): void {
    this.isRunning = false;
  }

  private calculateAverageResponseTime(): void {
    if (this.metrics.actions.length > 0) {
      const totalResponseTime = this.metrics.actions.reduce(
        (sum, action) => sum + action.responseTime, 
        0
      );
      this.metrics.avgResponseTime = totalResponseTime / this.metrics.actions.length;
    }
  }

  getMetrics(): BotMetrics {
    return { ...this.metrics };
  }
}

class BotTestRunner {
  private bots: LightningBot[] = [];
  private startTime: number = 0;

  async createBots(): Promise<void> {
    console.log(`🏭 Creating ${config.botCount} bots...`);
    
    for (let i = 1; i <= config.botCount; i++) {
      this.bots.push(new LightningBot(i.toString()));
    }

    if (config.mode === 'real') {
      await this.createBotUsers();
    }
  }

  private async createBotUsers(): Promise<void> {
    if (!config.supabaseUrl || !config.supabaseKey) {
      console.warn('⚠️ Supabase not configured, skipping user creation');
      return;
    }

    const supabase = createClient(config.supabaseUrl, config.supabaseKey);
    
    console.log('👥 Creating bot users in Supabase...');
    
    for (let i = 1; i <= config.botCount; i++) {
      try {
        const { error } = await supabase.auth.admin.createUser({
          email: `bot${i}@lightningplatform.test`,
          password: 'BotPassword123!',
          email_confirm: true,
          user_metadata: { 
            isBot: true,
            botId: i.toString(),
            createdAt: new Date().toISOString(),
          },
        });

        if (error && !error.message.includes('already registered')) {
          console.warn(`Failed to create bot ${i}:`, error.message);
        }
      } catch (error) {
        console.warn(`Error creating bot ${i}:`, error);
      }
    }
  }

  async runTests(): Promise<void> {
    this.startTime = Date.now();
    
    console.log(`🚀 Starting bot simulation with ${config.botCount} bots`);
    console.log(`⚙️ Configuration:`);
    console.log(`   - Mode: ${config.mode}`);
    console.log(`   - Base URL: ${config.baseUrl}`);
    console.log(`   - Duration: ${config.testDuration}s`);
    console.log(`   - Concurrency: ${config.concurrency}`);

    // Run bots in batches to control concurrency
    const batches = [];
    for (let i = 0; i < this.bots.length; i += config.concurrency) {
      batches.push(this.bots.slice(i, i + config.concurrency));
    }

    for (const batch of batches) {
      const promises = batch.map(bot => bot.start());
      await Promise.allSettled(promises);
    }

    await this.generateReport();
  }

  private async generateReport(): Promise<void> {
    const endTime = Date.now();
    const duration = (endTime - this.startTime) / 1000;
    
    const allMetrics = this.bots.map(bot => bot.getMetrics());
    
    const totalRequests = allMetrics.reduce((sum, m) => sum + m.totalRequests, 0);
    const totalSuccessful = allMetrics.reduce((sum, m) => sum + m.successfulRequests, 0);
    const totalFailed = allMetrics.reduce((sum, m) => sum + m.failedRequests, 0);
    const avgResponseTime = allMetrics.reduce((sum, m) => sum + m.avgResponseTime, 0) / allMetrics.length;
    
    const report = {
      timestamp: new Date().toISOString(),
      configuration: config,
      duration: `${duration.toFixed(2)}s`,
      summary: {
        totalBots: config.botCount,
        totalRequests,
        successfulRequests: totalSuccessful,
        failedRequests: totalFailed,
        successRate: `${((totalSuccessful / totalRequests) * 100).toFixed(2)}%`,
        avgResponseTime: `${avgResponseTime.toFixed(2)}ms`,
        requestsPerSecond: (totalRequests / duration).toFixed(2),
      },
      botMetrics: allMetrics,
    };

    console.log('\n📊 Bot Test Report:');
    console.log('='.repeat(50));
    console.log(`🕐 Duration: ${report.duration}`);
    console.log(`🤖 Bots: ${report.summary.totalBots}`);
    console.log(`📈 Total Requests: ${report.summary.totalRequests}`);
    console.log(`✅ Success Rate: ${report.summary.successRate}`);
    console.log(`⚡ Avg Response Time: ${report.summary.avgResponseTime}`);
    console.log(`🚀 Requests/sec: ${report.summary.requestsPerSecond}`);
    
    if (totalFailed > 0) {
      console.log(`❌ Failed Requests: ${totalFailed}`);
      
      // Show top errors
      const errorCounts: { [key: string]: number } = {};
      allMetrics.forEach(m => {
        m.errors.forEach(error => {
          errorCounts[error] = (errorCounts[error] || 0) + 1;
        });
      });
      
      console.log('\n🔍 Top Errors:');
      Object.entries(errorCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .forEach(([error, count]) => {
          console.log(`   ${count}x: ${error}`);
        });
    }

    // Save report to file
    const fs = await import('fs/promises');
    const reportPath = `bot-test-report-${Date.now()}.json`;
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Full report saved to: ${reportPath}`);
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const runner = new BotTestRunner();

  console.log('🤖 Lightning Platform Bot Test Suite');
  console.log('=====================================\n');

  try {
    await runner.createBots();
    await runner.runTests();
  } catch (error) {
    console.error('❌ Bot test failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { LightningBot, BotTestRunner }; 