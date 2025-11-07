// audit/comprehensive-audit.ts - Complete audit of all Scorpion pages
import { chromium, ConsoleMessage, Response } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE = process.env.AUDIT_BASE_URL || 'http://localhost:3003';
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const outDir = path.join('audit', 'out', timestamp);
fs.mkdirSync(outDir, { recursive: true });

interface PageAudit {
  url: string;
  title: string;
  status: number;
  consoleErrors: Array<{type: string; text: string; location?: any}>;
  consoleWarnings: Array<{type: string; text: string; location?: any}>;
  networkFailures: Array<{url: string; status: number; method: string}>;
  pageErrors: string[];
  loadTime: number;
  timestamp: string;
}

// All known Scorpion routes
const routes = [
  '/',
  '/dashboard',
  '/project',
  '/ops',
  '/workflows',
  '/build',
  '/knowledge',
  '/research',
  '/council',
  '/agents',
  '/agents/E-001',
  '/agents/A-002',
  '/agents/P-003',
  '/agents/S-004',
  '/agents/N-005',
  '/agents/S-006',
  '/agents/C-007',
  '/agents/O-008',
  '/chat',
  '/notifications',
  '/logs',
  '/settings',
];

(async () => {
  console.log('🦂 Starting Comprehensive Scorpion Audit\n');
  console.log(`📍 Base URL: ${BASE}`);
  console.log(`📋 Pages to audit: ${routes.length}`);
  console.log(`📂 Output: ${outDir}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    recordHar: { path: path.join(outDir, 'network.har') }
  });
  const page = await context.newPage();

  const results: PageAudit[] = [];
  let totalErrors = 0;
  let totalWarnings = 0;
  let totalNetworkFailures = 0;
  let totalPageCrashes = 0;

  for (const route of routes) {
    const url = `${BASE}${route}`;
    console.log(`\n[${results.length + 1}/${routes.length}] Auditing: ${route}`);

    const audit: PageAudit = {
      url,
      title: '',
      status: 0,
      consoleErrors: [],
      consoleWarnings: [],
      networkFailures: [],
      pageErrors: [],
      loadTime: 0,
      timestamp: new Date().toISOString()
    };

    // Set up listeners
    const consoleHandler = (msg: ConsoleMessage) => {
      const event = {
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      };

      if (msg.type() === 'error') {
        audit.consoleErrors.push(event);
        console.log(`  🔴 Console error: ${msg.text().slice(0, 100)}...`);
      } else if (msg.type() === 'warning') {
        audit.consoleWarnings.push(event);
        console.log(`  ⚠️  Console warning: ${msg.text().slice(0, 100)}...`);
      }
    };

    const pageErrorHandler = (err: Error) => {
      const errorText = `${err.message}\n${err.stack || ''}`;
      audit.pageErrors.push(errorText);
      console.log(`  💥 Page crash: ${err.message}`);
    };

    const responseHandler = (response: Response) => {
      if (response.status() >= 400) {
        const failure = {
          url: response.url(),
          status: response.status(),
          method: response.request().method()
        };
        audit.networkFailures.push(failure);
        console.log(`  ⚠️  ${response.status()} ${response.request().method()} ${response.url().slice(0, 60)}...`);
      }
    };

    page.on('console', consoleHandler);
    page.on('pageerror', pageErrorHandler);
    page.on('response', responseHandler);

    try {
      const startTime = Date.now();
      const resp = await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 15000 
      });
      const loadTime = Date.now() - startTime;

      audit.status = resp?.status() || 0;
      audit.title = await page.title();
      audit.loadTime = loadTime;

      console.log(`  ✅ ${audit.status} - ${audit.title} (${loadTime}ms)`);

      // Wait for any async errors
      await page.waitForTimeout(1000);

      // Take screenshot
      const safeName = route.replace(/\//g, '_').replace(/[^a-z0-9_]/gi, '') || 'home';
      await page.screenshot({ 
        path: path.join(outDir, `screenshot-${safeName}.png`), 
        fullPage: true 
      });

    } catch (e: any) {
      console.log(`  ❌ Failed: ${e.message}`);
      audit.pageErrors.push(`Failed to load ${url}: ${e.message}`);
      audit.status = 0;
    } finally {
      page.off('console', consoleHandler);
      page.off('pageerror', pageErrorHandler);
      page.off('response', responseHandler);
    }

    results.push(audit);
    totalErrors += audit.consoleErrors.length;
    totalWarnings += audit.consoleWarnings.length;
    totalNetworkFailures += audit.networkFailures.length;
    totalPageCrashes += audit.pageErrors.length;
  }

  await context.close();
  await browser.close();

  // Save detailed results
  fs.writeFileSync(
    path.join(outDir, 'audit-results.json'),
    JSON.stringify(results, null, 2)
  );

  // Save console errors separately
  const allConsoleErrors = results.flatMap(r => 
    r.consoleErrors.map(e => ({ ...e, page: r.url }))
  );
  fs.writeFileSync(
    path.join(outDir, 'console-errors.json'),
    JSON.stringify(allConsoleErrors, null, 2)
  );

  // Save network failures separately
  const allNetworkFailures = results.flatMap(r => 
    r.networkFailures.map(e => ({ ...e, page: r.url }))
  );
  fs.writeFileSync(
    path.join(outDir, 'network-failures.json'),
    JSON.stringify(allNetworkFailures, null, 2)
  );

  // Generate summary
  const summary = {
    timestamp: new Date().toISOString(),
    pagesAudited: results.length,
    totalConsoleErrors: totalErrors,
    totalConsoleWarnings: totalWarnings,
    totalNetworkFailures: totalNetworkFailures,
    totalPageCrashes: totalPageCrashes,
    totalIssues: totalErrors + totalNetworkFailures + totalPageCrashes,
    pagesWithErrors: results.filter(r => r.consoleErrors.length > 0).length,
    pagesWithWarnings: results.filter(r => r.consoleWarnings.length > 0).length,
    pagesWithNetworkFailures: results.filter(r => r.networkFailures.length > 0).length,
    pagesWithCrashes: results.filter(r => r.pageErrors.length > 0).length,
    slowestPages: results
      .sort((a, b) => b.loadTime - a.loadTime)
      .slice(0, 5)
      .map(r => ({ url: r.url, loadTime: r.loadTime })),
    artifactsLocation: outDir
  };

  fs.writeFileSync(
    path.join(outDir, 'summary.json'),
    JSON.stringify(summary, null, 2)
  );

  // Print summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 AUDIT SUMMARY');
  console.log(`${'='.repeat(60)}`);
  console.log(`   Pages audited: ${summary.pagesAudited}`);
  console.log(`   Console errors: ${summary.totalConsoleErrors}`);
  console.log(`   Console warnings: ${summary.totalConsoleWarnings}`);
  console.log(`   Network failures: ${summary.totalNetworkFailures}`);
  console.log(`   Page crashes: ${summary.totalPageCrashes}`);
  console.log(`   Total issues: ${summary.totalIssues}`);
  console.log(`\n   Pages with errors: ${summary.pagesWithErrors}`);
  console.log(`   Pages with warnings: ${summary.pagesWithWarnings}`);
  console.log(`   Pages with network failures: ${summary.pagesWithNetworkFailures}`);
  console.log(`   Pages with crashes: ${summary.pagesWithCrashes}`);
  console.log(`\n   Slowest pages:`);
  summary.slowestPages.forEach(p => {
    console.log(`     • ${p.url} (${p.loadTime}ms)`);
  });
  console.log(`\n📁 Artifacts: ${outDir}`);
  console.log(`${'='.repeat(60)}\n`);

  // Exit with error if critical issues found
  if (summary.totalConsoleErrors > 0 || summary.totalPageCrashes > 0) {
    console.log(`❌ AUDIT FAILED: Found ${summary.totalConsoleErrors} console errors and ${summary.totalPageCrashes} page crashes`);
    process.exit(1);
  } else {
    console.log(`✅ AUDIT PASSED: No critical issues found!`);
    process.exit(0);
  }
})();

