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
    
    try {
    // Create directories
    await fs.mkdir(this.screenshotDir, { recursive: true });
    await fs.mkdir(this.videoDir, { recursive: true });

    // Launch browsers
    for (let i = 0; i < this.maxBrowsers; i++) {
        try {
      const browser = await chromium.launch({
        headless: process.env.PLAYWRIGHT_HEADLESS !== 'false',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      this.browsers.push(browser);
          console.log(`✅ Browser ${i + 1}/${this.maxBrowsers} launched`);
        } catch (error: any) {
          console.error(`❌ Failed to launch browser ${i + 1}:`, error.message);
          throw new Error(`Browser pool initialization failed: ${error.message}. Make sure Playwright is installed: npx playwright install chromium`);
        }
      }

      console.log(`✅ Browser pool initialized with ${this.browsers.length} browsers`);
    } catch (error: any) {
      console.error('❌ Browser pool initialization failed:', error);
      throw error;
    }
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
      
      // Set a realistic user agent via extra HTTP headers to avoid bot detection
      await this.page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });
      
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
      waitUntil: 'networkidle', // Wait for network to be idle (better for JS-rendered content)
      timeout: 30000 
    });
    
    // Wait a bit more for JavaScript to render content
    await this.page.waitForTimeout(2000);
    
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
      // Try to wait for selector, but don't fail if it doesn't exist
      await this.page.waitForSelector(selector, { timeout: 3000 }).catch(() => {
        // Selector not found, will return empty array
      });

      const data = await this.page.$$eval(selector, (elements) => {
        return elements.map(el => {
          // Get href from various possible attributes
          let href = el.getAttribute('href');
          if (!href) {
            href = el.getAttribute('data-href') || el.getAttribute('data-url') || el.getAttribute('data-uddg');
          }
          
          // For DuckDuckGo redirect URLs (/l/?uddg=...), extract the actual URL
          if (href && (href.startsWith('/l/') || href.includes('uddg='))) {
            // Try to extract from query params
            try {
              const urlMatch = href.match(/[?&](?:uddg|u)=([^&]+)/);
              if (urlMatch) {
                href = decodeURIComponent(urlMatch[1]);
              } else if (href.startsWith('/l/')) {
                // Keep /l/ URLs for now, we'll resolve them later
                href = href;
              }
            } catch (e) {
              // If parsing fails, try data attributes
              const actualUrl = el.getAttribute('data-uddg') || el.getAttribute('data-url');
              if (actualUrl) {
                href = actualUrl;
              }
            }
          }
          
          // Get text content - try multiple methods
          const text = el.textContent?.trim() || el.innerText?.trim() || el.getAttribute('aria-label') || '';
          
          return {
            text: text,
            html: el.innerHTML || '',
            href: href || null,
            src: el.getAttribute('src') || null,
            title: el.getAttribute('title') || el.getAttribute('aria-label') || null,
            // Get all data attributes for debugging
            dataAttrs: Array.from(el.attributes)
              .filter(attr => attr.name.startsWith('data-'))
              .reduce((acc, attr) => {
                acc[attr.name] = attr.value;
                return acc;
              }, {} as Record<string, string>)
          };
        }).filter(item => {
          // Keep items that have either text or href (or both)
          // But skip if both are empty
          return (item.text && item.text.length > 0) || (item.href && item.href.length > 0);
        });
      });
      
      this.onAction({
        type: 'extract',
        timestamp: Date.now(),
        url: this.page.url(),
        selector,
        data: { count: data.length }
      });

      return data;
    } catch (error: any) {
      console.warn(`Failed to extract with selector ${selector}:`, error.message);
      return [];
    }
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

  async evaluateScript(script: string | Function): Promise<any> {
    if (!this.page) throw new Error('No active page');
    return await this.page.evaluate(script as any);
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

