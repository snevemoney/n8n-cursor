/**
 * Browser Pool for Web Research
 * Manages multiple browser instances for concurrent research tasks
 */

import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { EventEmitter } from 'events';
import path from 'path';
import fs from 'fs/promises';

export interface BrowserAction {
  type: 'navigate' | 'click' | 'type' | 'scroll' | 'screenshot' | 'extract' | 'wait';
  timestamp: number;
  url: string;
  selector?: string;
  data?: any;
  screenshot?: string; // base64 encoded
}

export class BrowserPool extends EventEmitter {
  private browsers: Browser[] = [];
  private contexts: Map<string, BrowserContext> = new Map();
  private maxBrowsers = 3;
  private screenshotDir = 'data/research-screenshots';
  private videoDir = 'data/research-videos';

  async initialize() {
    console.log('🌐 Initializing browser pool...');
    
    // Create directories
    await fs.mkdir(this.screenshotDir, { recursive: true });
    await fs.mkdir(this.videoDir, { recursive: true });

    // Launch browsers
    for (let i = 0; i < this.maxBrowsers; i++) {
      const browser = await chromium.launch({
        headless: process.env.PLAYWRIGHT_HEADLESS !== 'false',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      this.browsers.push(browser);
    }

    console.log(`✅ Browser pool initialized with ${this.maxBrowsers} browsers`);
  }

  async createResearchSession(sessionId: string): Promise<ResearchBrowser> {
    // Simple round-robin for now
    const browser = this.browsers[this.contexts.size % this.browsers.length];
    
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      recordVideo: { 
        dir: path.join(this.videoDir, sessionId),
        size: { width: 1920, height: 1080 }
      },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    this.contexts.set(sessionId, context);
    
    return new ResearchBrowser(sessionId, context, this.screenshotDir, (action) => {
      // Emit every action to WebSocket listeners
      this.emit('browser-action', sessionId, action);
    });
  }

  async closeSession(sessionId: string) {
    const context = this.contexts.get(sessionId);
    if (context) {
      await context.close();
      this.contexts.delete(sessionId);
    }
  }

  async shutdown() {
    console.log('🛑 Shutting down browser pool...');
    
    // Close all contexts
    for (const [sessionId, context] of this.contexts) {
      await context.close();
    }
    this.contexts.clear();

    // Close all browsers
    for (const browser of this.browsers) {
      await browser.close();
    }
    this.browsers = [];

    console.log('✅ Browser pool shut down');
  }
}

export class ResearchBrowser {
  private page: Page | null = null;
  private actionCounter = 0;

  constructor(
    public sessionId: string,
    private context: BrowserContext,
    private screenshotDir: string,
    private onAction: (action: BrowserAction) => void
  ) {}

  async navigate(url: string): Promise<void> {
    if (!this.page) {
      this.page = await this.context.newPage();
      
      // Intercept network requests for logging
      this.page.on('request', (request) => {
        if (request.resourceType() === 'document') {
          this.onAction({
            type: 'navigate',
            timestamp: Date.now(),
            url: request.url()
          });
        }
      });
    }

    await this.page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // Capture screenshot
    const screenshotPath = await this.captureScreenshot();
    
    this.onAction({
      type: 'navigate',
      timestamp: Date.now(),
      url,
      screenshot: screenshotPath
    });
  }

  async extract(selector: string): Promise<any[]> {
    if (!this.page) throw new Error('No active page');

    try {
      await this.page.waitForSelector(selector, { timeout: 5000 });
    } catch (error) {
      console.warn(`Selector ${selector} not found, returning empty array`);
      return [];
    }

    const data = await this.page.$$eval(selector, (elements) => {
      return elements.map(el => ({
        text: el.textContent?.trim(),
        html: el.innerHTML,
        href: el.getAttribute('href'),
        src: el.getAttribute('src')
      }));
    });

    this.onAction({
      type: 'extract',
      timestamp: Date.now(),
      url: this.page.url(),
      selector,
      data: { count: data.length }
    });

    return data;
  }

  async click(selector: string): Promise<void> {
    if (!this.page) throw new Error('No active page');

    await this.page.click(selector);
    await this.page.waitForLoadState('domcontentloaded');
    
    const screenshotPath = await this.captureScreenshot();
    
    this.onAction({
      type: 'click',
      timestamp: Date.now(),
      url: this.page.url(),
      selector,
      screenshot: screenshotPath
    });
  }

  async type(selector: string, text: string): Promise<void> {
    if (!this.page) throw new Error('No active page');

    await this.page.fill(selector, text);
    
    this.onAction({
      type: 'type',
      timestamp: Date.now(),
      url: this.page.url(),
      selector,
      data: { text }
    });
  }

  async scroll(direction: 'down' | 'up' = 'down'): Promise<void> {
    if (!this.page) throw new Error('No active page');

    await this.page.evaluate((dir) => {
      const distance = dir === 'down' ? window.innerHeight : -window.innerHeight;
      window.scrollBy(0, distance);
    }, direction);

    await this.page.waitForTimeout(500); // Wait for scroll to complete

    const screenshotPath = await this.captureScreenshot();
    
    this.onAction({
      type: 'scroll',
      timestamp: Date.now(),
      url: this.page.url(),
      screenshot: screenshotPath
    });
  }

  async wait(milliseconds: number): Promise<void> {
    if (!this.page) throw new Error('No active page');

    await this.page.waitForTimeout(milliseconds);
    
    this.onAction({
      type: 'wait',
      timestamp: Date.now(),
      url: this.page.url(),
      data: { milliseconds }
    });
  }

  async getPageContent(): Promise<string> {
    if (!this.page) throw new Error('No active page');
    return await this.page.content();
  }

  async getTextContent(): Promise<string> {
    if (!this.page) throw new Error('No active page');
    return await this.page.evaluate(() => document.body.innerText);
  }

  async evaluateScript(script: string): Promise<any> {
    if (!this.page) throw new Error('No active page');
    return await this.page.evaluate(script);
  }

  private async captureScreenshot(): Promise<string> {
    if (!this.page) return '';

    this.actionCounter++;
    const filename = `${this.sessionId}-${this.actionCounter}-${Date.now()}.png`;
    const fullPath = path.join(this.screenshotDir, filename);
    
    await this.page.screenshot({ path: fullPath, fullPage: false });
    
    // Return relative path for API
    return `/api/research/screenshots/${filename}`;
  }

  async close() {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
  }
}

// Singleton instance
let browserPool: BrowserPool | null = null;

export async function getBrowserPool(): Promise<BrowserPool> {
  if (!browserPool) {
    browserPool = new BrowserPool();
    await browserPool.initialize();
  }
  return browserPool;
}

