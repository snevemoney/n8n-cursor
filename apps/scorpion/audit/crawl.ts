// audit/crawl.ts - BFS crawler to discover all pages
import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const BASE = process.env.AUDIT_BASE_URL || 'http://localhost:3003';
const outDir = path.join('audit', 'out', new Date().toISOString().replace(/[:.]/g, '-'));
fs.mkdirSync(outDir, { recursive: true });

interface CrawlResult {
  url: string;
  status: number;
  title: string;
  error?: string;
  timestamp: string;
}

(async () => {
  console.log('🕷️  Starting Scorpion UI crawl...');
  console.log(`📍 Base URL: ${BASE}`);
  console.log(`📂 Output: ${outDir}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const visited = new Set<string>();
  const queue = new Set<string>([BASE]);
  const results: CrawlResult[] = [];
  
  const maxDepth = Number(process.env.AUDIT_DEPTH || 2);
  const maxPages = Number(process.env.AUDIT_MAX_PAGES || 50);
  
  let count = 0;

  // Known routes in Scorpion
  const knownRoutes = [
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
    '/chat',
    '/notifications',
    '/logs',
    '/settings',
  ];

  // Add known routes to queue
  knownRoutes.forEach(route => queue.add(`${BASE}${route}`));

  while (queue.size && count < maxPages) {
    const url = [...queue][0];
    queue.delete(url);
    
    if (visited.has(url)) continue;
    visited.add(url);
    count++;

    console.log(`\n[${count}/${maxPages}] Visiting: ${url}`);

    try {
      const resp = await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 15000 
      });
      
      const status = resp?.status() || 0;
      const title = await page.title();
      
      console.log(`  ✅ ${status} - ${title}`);
      
      results.push({
        url,
        status,
        title,
        timestamp: new Date().toISOString()
      });

      // Take screenshot
      const safeName = url.replace(/[^a-z0-9]/gi, '_').slice(0, 50);
      await page.screenshot({ 
        path: path.join(outDir, `screenshot-${count}-${safeName}.png`), 
        fullPage: true 
      });

      // Collect same-origin links
      const links = await page.$$eval('a[href]', as => 
        as.map(a => (a as HTMLAnchorElement).href)
      );
      
      for (const link of links) {
        if (link.startsWith(BASE) && !link.includes('#')) {
          queue.add(link);
        }
      }

    } catch (e: any) {
      console.log(`  ❌ Error: ${e.message}`);
      results.push({
        url,
        status: 0,
        title: '',
        error: e.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Save results
  fs.writeFileSync(
    path.join(outDir, 'crawl-results.json'), 
    JSON.stringify(results, null, 2)
  );
  
  fs.writeFileSync(
    path.join(outDir, 'visited.json'), 
    JSON.stringify([...visited], null, 2)
  );

  await browser.close();

  console.log(`\n✅ Crawl complete!`);
  console.log(`   Pages visited: ${visited.size}`);
  console.log(`   Results: ${outDir}/crawl-results.json`);
  console.log(`   Screenshots: ${outDir}/screenshot-*.png`);
})();

