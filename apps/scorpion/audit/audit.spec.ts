// audit/audit.spec.ts - Capture console errors, network failures, and page crashes
import { test, chromium, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BASE = process.env.AUDIT_BASE_URL || 'http://localhost:3003';
const outDir = path.join('audit', 'out', new Date().toISOString().replace(/[:.]/g, '-'));
fs.mkdirSync(outDir, { recursive: true });

interface ConsoleEvent {
  type: string;
  text: string;
  location?: any;
  url?: string;
  timestamp: string;
}

interface NetworkEvent {
  url: string;
  method: string;
  status: number;
  statusText: string;
  timestamp: string;
}

test.describe('Scorpion UI Audit', () => {
  test('audit all pages for errors and issues', async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      recordHar: { path: path.join(outDir, 'network.har') }
    });
    const page = await context.newPage();

    const consoleEvents: ConsoleEvent[] = [];
    const networkFailures: NetworkEvent[] = [];
    const pageErrors: string[] = [];

    // Listen for console messages
    page.on('console', msg => {
      const event: ConsoleEvent = {
        type: msg.type(),
        text: msg.text(),
        location: msg.location(),
        url: page.url(),
        timestamp: new Date().toISOString()
      };
      consoleEvents.push(event);
      
      if (['error', 'warning'].includes(msg.type())) {
        console.log(`  🔴 Console ${msg.type()}: ${msg.text()}`);
      }
    });

    // Listen for page errors (uncaught exceptions)
    page.on('pageerror', err => {
      const errorText = `${err.message}\n${err.stack || ''}`;
      pageErrors.push(errorText);
      console.log(`  💥 Page error: ${err.message}`);
      
      consoleEvents.push({
        type: 'pageerror',
        text: errorText,
        url: page.url(),
        timestamp: new Date().toISOString()
      });
    });

    // Listen for failed network requests
    page.on('response', response => {
      if (response.status() >= 400) {
        const event: NetworkEvent = {
          url: response.url(),
          method: response.request().method(),
          status: response.status(),
          statusText: response.statusText(),
          timestamp: new Date().toISOString()
        };
        networkFailures.push(event);
        console.log(`  ⚠️  ${response.status()} ${response.request().method()} ${response.url()}`);
      }
    });

    // Read visited pages from crawl
    const visitedPath = path.join(outDir, 'visited.json');
    const crawlResultsPath = path.join(outDir, 'crawl-results.json');
    
    let seeds: string[] = [BASE];
    
    if (fs.existsSync(visitedPath)) {
      seeds = JSON.parse(fs.readFileSync(visitedPath, 'utf-8'));
    } else if (fs.existsSync(crawlResultsPath)) {
      const results = JSON.parse(fs.readFileSync(crawlResultsPath, 'utf-8'));
      seeds = results.map((r: any) => r.url);
    }

    // Sample top pages (limit for speed)
    const pagesToAudit = seeds.slice(0, 15);
    console.log(`\n🔍 Auditing ${pagesToAudit.length} pages...\n`);

    for (const url of pagesToAudit) {
      console.log(`Auditing: ${url}`);
      
      try {
        await page.goto(url, { 
          waitUntil: 'networkidle',
          timeout: 15000 
        });
        
        // Wait a bit for any async errors
        await page.waitForTimeout(2000);
        
        // Take audit screenshot
        const safeName = Buffer.from(url).toString('base64').slice(0, 12);
        await page.screenshot({ 
          path: path.join(outDir, `audit-${safeName}.png`), 
          fullPage: true 
        });

      } catch (e: any) {
        console.log(`  ❌ Failed to audit: ${e.message}`);
        pageErrors.push(`Failed to load ${url}: ${e.message}`);
      }
    }

    // Save all collected data
    fs.writeFileSync(
      path.join(outDir, 'console.json'), 
      JSON.stringify(consoleEvents, null, 2)
    );
    
    fs.writeFileSync(
      path.join(outDir, 'network-failures.json'), 
      JSON.stringify(networkFailures, null, 2)
    );
    
    fs.writeFileSync(
      path.join(outDir, 'page-errors.json'), 
      JSON.stringify(pageErrors, null, 2)
    );

    // Generate summary report
    const errors = consoleEvents.filter(e => e.type === 'error' || e.type === 'pageerror');
    const warnings = consoleEvents.filter(e => e.type === 'warning');
    
    const summary = {
      timestamp: new Date().toISOString(),
      pagesAudited: pagesToAudit.length,
      consoleErrors: errors.length,
      consoleWarnings: warnings.length,
      networkFailures: networkFailures.length,
      pageErrors: pageErrors.length,
      totalIssues: errors.length + networkFailures.length + pageErrors.length,
      artifactsLocation: outDir
    };

    fs.writeFileSync(
      path.join(outDir, 'summary.json'), 
      JSON.stringify(summary, null, 2)
    );

    console.log(`\n📊 Audit Summary:`);
    console.log(`   Pages audited: ${summary.pagesAudited}`);
    console.log(`   Console errors: ${summary.consoleErrors}`);
    console.log(`   Console warnings: ${summary.consoleWarnings}`);
    console.log(`   Network failures: ${summary.networkFailures}`);
    console.log(`   Page crashes: ${summary.pageErrors}`);
    console.log(`   Total issues: ${summary.totalIssues}`);
    console.log(`\n📁 Artifacts: ${outDir}`);

    await context.close();
    await browser.close();

    // Assertion: Fail the test if critical issues found
    const hasCriticalIssues = summary.consoleErrors > 0 || summary.pageErrors > 0;
    expect(hasCriticalIssues, `Found ${summary.consoleErrors} console errors and ${summary.pageErrors} page crashes. See ${outDir}/console.json and page-errors.json`).toBeFalsy();
  });
});

