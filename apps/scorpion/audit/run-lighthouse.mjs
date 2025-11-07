// audit/run-lighthouse.mjs - Run Lighthouse performance audits
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.AUDIT_BASE_URL || 'http://localhost:3003';
const outDir = path.join('audit', 'out', new Date().toISOString().replace(/[:.]/g, '-'), 'lighthouse');
fs.mkdirSync(outDir, { recursive: true });

// Key Scorpion pages to audit
const pages = [
  '/',
  '/dashboard',
  '/project',
  '/workflows',
  '/agents'
].map(p => new URL(p, BASE).toString());

console.log('🔦 Running Lighthouse audits...\n');

for (const url of pages) {
  const safe = Buffer.from(url).toString('base64').slice(0, 12);
  const outPath = path.join(outDir, `lh-${safe}`);
  
  console.log(`Auditing: ${url}`);
  
  const cmd = `npx lighthouse ${url} --quiet --chrome-flags="--headless=new" --only-categories=performance,accessibility,best-practices --output json --output html --output-path=${outPath}`;
  
  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log(`  ✅ Report saved: ${outPath}.html\n`);
  } catch (e) {
    console.log(`  ❌ Failed to audit ${url}\n`);
  }
}

console.log(`\n✅ Lighthouse audits complete!`);
console.log(`📁 Reports: ${outDir}/`);

