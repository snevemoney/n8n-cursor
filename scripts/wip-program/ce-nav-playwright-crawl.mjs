/**
 * CE dashboard nav crawl — login + visit every sidebar route.
 * Run inside Playwright docker on VPS with CE .env mounted.
 *
 *   node ce-nav-playwright-crawl.mjs
 *
 * Env: CE_BASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD (or load from CE_ENV_FILE)
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

function loadEnvFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return {};
  const out = {};
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const i = line.indexOf('=');
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

const fileEnv = loadEnvFile(process.env.CE_ENV_FILE || '');
const BASE = (process.env.CE_BASE_URL || 'https://evenslouis.ca').replace(/\/$/, '');
const EMAIL = process.env.ADMIN_EMAIL || fileEnv.ADMIN_EMAIL || '';
const PASSWORD = process.env.ADMIN_PASSWORD || fileEnv.ADMIN_PASSWORD || '';
const OUT_DIR = process.env.CE_CRAWL_OUT || '/tmp/ce-nav-crawl';

/** Sidebar items from client-engine/src/components/dashboard/sidebar.tsx */
const NAV = [
  { group: 'capture', label: 'Lead Intake', href: '/dashboard/intake' },
  { group: 'capture', label: 'Prospect', href: '/dashboard/prospect' },
  { group: 'capture', label: 'Signals', href: '/dashboard/signals' },
  { group: 'capture', label: 'Growth', href: '/dashboard/growth' },
  { group: 'capture', label: 'Copilot', href: '/dashboard/copilot' },
  { group: 'capture', label: 'Meta Ads', href: '/dashboard/meta-ads' },
  { group: 'capture', label: 'YouTube', href: '/dashboard/youtube' },
  { group: 'convert', label: 'Leads', href: '/dashboard/leads' },
  { group: 'convert', label: 'Decisions', href: '/dashboard/decisions' },
  { group: 'convert', label: 'Proposals', href: '/dashboard/proposals' },
  { group: 'convert', label: 'Follow-ups', href: '/dashboard/followups' },
  { group: 'convert', label: 'Forecast', href: '/dashboard/forecast' },
  { group: 'build', label: 'Delivery', href: '/dashboard/delivery' },
  { group: 'build', label: 'Handoffs', href: '/dashboard/handoffs' },
  { group: 'build', label: 'Build Ops', href: '/dashboard/build-ops' },
  { group: 'build', label: 'Deploys', href: '/dashboard/deploys' },
  { group: 'prove', label: 'Proof', href: '/dashboard/proof' },
  { group: 'prove', label: 'Scorecard', href: '/dashboard/scorecard' },
  { group: 'prove', label: 'Campaigns', href: '/dashboard/campaigns' },
  { group: 'prove', label: 'Reviews', href: '/dashboard/reviews' },
  { group: 'prove', label: 'Proof Candidates', href: '/dashboard/proof-candidates' },
  { group: 'prove', label: 'Content Posts', href: '/dashboard/content-posts' },
  { group: 'optimize', label: 'Conversion', href: '/dashboard/conversion' },
  { group: 'optimize', label: 'Retention', href: '/dashboard/retention' },
  { group: 'optimize', label: 'Risk', href: '/dashboard/risk' },
  { group: 'optimize', label: 'Intelligence', href: '/dashboard/intelligence' },
  { group: 'optimize', label: 'Scoreboard', href: '/dashboard/internal/scoreboard' },
  { group: 'system', label: 'Home', href: '/dashboard/founder' },
  { group: 'system', label: 'Next Actions', href: '/dashboard/next-actions' },
  { group: 'system', label: 'Inbox', href: '/dashboard/inbox' },
  { group: 'system', label: 'Reminders', href: '/dashboard/reminders' },
  { group: 'system', label: 'Founder OS', href: '/dashboard/founder/os' },
  { group: 'system', label: 'Knowledge', href: '/dashboard/knowledge' },
  { group: 'system', label: 'Jobs', href: '/dashboard/jobs' },
  { group: 'system', label: 'Automation', href: '/dashboard/automation' },
  { group: 'system', label: 'Operator', href: '/dashboard/operator' },
  { group: 'system', label: 'Settings', href: '/dashboard/settings' },
  { group: 'system', label: 'Notifications', href: '/dashboard/notifications' },
  { group: 'system', label: 'Channels', href: '/dashboard/notification-channels' },
  { group: 'system', label: 'Flywheel', href: '/dashboard/flywheel' },
  { group: 'system', label: 'Exec Metrics', href: '/dashboard/system' },
  { group: 'system', label: 'System Health', href: '/dashboard/ops-health' },
  { group: 'system', label: 'Job Schedules', href: '/dashboard/job-schedules' },
];

const ERROR_PATTERNS = [
  /application error/i,
  /internal server error/i,
  /something went wrong/i,
  /uncaught/i,
  /this page could not be found/i,
  /404/i,
  /failed to fetch/i,
  /prisma/i,
  /econnrefused/i,
  /unauthorized/i,
  /access denied/i,
  /not configured/i,
  /coming soon/i,
  /under construction/i,
  /todo:/i,
  /not implemented/i,
  /stub/i,
];

function classify(bodyText, status, finalUrl, consoleErrors, pageErrors) {
  const issues = [];
  const t = bodyText || '';
  if (status >= 500) issues.push(`http_${status}`);
  if (status === 404) issues.push('http_404');
  if (finalUrl.includes('/login')) issues.push('redirected_to_login');
  for (const re of ERROR_PATTERNS) {
    if (re.test(t.slice(0, 4000))) issues.push(`text:${re.source}`);
  }
  if (consoleErrors.length) issues.push(`console_errors:${consoleErrors.length}`);
  if (pageErrors.length) issues.push(`page_errors:${pageErrors.length}`);
  // empty / thin content heuristic (main area)
  const compact = t.replace(/\s+/g, ' ').trim();
  if (compact.length < 80) issues.push('thin_content');
  // empty-state without data tables/cards
  if (
    /no (leads|data|items|results|records|jobs|posts|campaigns|proposals)/i.test(t) ||
    /nothing here|empty state|get started/i.test(t)
  ) {
    issues.push('empty_or_zero_state');
  }
  let severity = 'ok';
  if (issues.some((i) => i.startsWith('http_5') || i === 'redirected_to_login' || i.startsWith('page_errors'))) {
    severity = 'broken';
  } else if (issues.some((i) => i.startsWith('http_4') || i.startsWith('text:application') || i.startsWith('text:internal') || i.startsWith('text:something went'))) {
    severity = 'broken';
  } else if (issues.some((i) => i.startsWith('text:') || i.startsWith('console_errors') || i === 'thin_content')) {
    severity = 'needs_fix';
  } else if (issues.includes('empty_or_zero_state')) {
    severity = 'empty_ok';
  }
  return { severity, issues };
}

async function main() {
  if (!EMAIL || !PASSWORD) {
    console.error('Missing ADMIN_EMAIL/ADMIN_PASSWORD');
    process.exit(2);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(path.join(OUT_DIR, 'screenshots'), { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 300));
  });
  page.on('pageerror', (err) => pageErrors.push(String(err).slice(0, 300)));

  // Login
  console.log('LOGIN', BASE + '/login');
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('input[name="email"], input[type="email"]', { timeout: 30000 });
  await page.fill('input[name="email"], input[type="email"]', EMAIL);
  await page.fill('input[name="password"], input[type="password"]', PASSWORD);
  await Promise.all([
    page.waitForURL(/\/dashboard/, { timeout: 60000 }).catch(() => null),
    page.click('button[type="submit"]'),
  ]);
  await page.waitForTimeout(2000);
  const afterLogin = page.url();
  console.log('AFTER_LOGIN', afterLogin);
  if (afterLogin.includes('/login')) {
    await page.screenshot({ path: path.join(OUT_DIR, 'screenshots', 'login-failed.png'), fullPage: true });
    fs.writeFileSync(
      path.join(OUT_DIR, 'results.json'),
      JSON.stringify({ ok: false, error: 'login_failed', url: afterLogin }, null, 2),
    );
    await browser.close();
    process.exit(3);
  }

  // Prefer full sidebar mode so all items render (crawl uses direct hrefs anyway)
  await page.evaluate(() => {
    try {
      localStorage.setItem('sidebar-mode', 'full');
    } catch {}
  });

  const results = [];
  for (const item of NAV) {
    consoleErrors.length = 0;
    pageErrors.length = 0;
    const url = `${BASE}${item.href}`;
    let status = 0;
    let finalUrl = url;
    let title = '';
    let h1 = '';
    let bodySample = '';
    let mainText = '';
    const started = Date.now();
    try {
      const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      status = resp?.status() || 0;
      await page.waitForTimeout(1500);
      // settle network a bit
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => null);
      finalUrl = page.url();
      title = await page.title();
      h1 = await page
        .locator('main h1, main h2, [data-testid="page-title"]')
        .first()
        .textContent()
        .catch(() => '');
      mainText = await page.locator('main').innerText().catch(() => '');
      bodySample = (mainText || '').replace(/\s+/g, ' ').trim().slice(0, 400);
      const { severity, issues } = classify(
        mainText,
        status,
        finalUrl,
        [...consoleErrors],
        [...pageErrors],
      );
      const shot =
        severity === 'broken' || severity === 'needs_fix'
          ? path.join('screenshots', `${item.href.replace(/\//g, '_').slice(1)}.png`)
          : null;
      if (shot) {
        await page.screenshot({ path: path.join(OUT_DIR, shot), fullPage: true }).catch(() => null);
      }
      results.push({
        ...item,
        status,
        finalUrl,
        title,
        h1: (h1 || '').trim().slice(0, 120),
        severity,
        issues,
        consoleErrors: consoleErrors.slice(0, 8),
        pageErrors: pageErrors.slice(0, 5),
        bodySample,
        ms: Date.now() - started,
        screenshot: shot,
      });
      console.log(
        `${severity.padEnd(12)} ${item.label.padEnd(18)} ${status} ${severity} ${(h1 || '').trim().slice(0, 40)}`,
      );
    } catch (err) {
      const shot = path.join('screenshots', `${item.href.replace(/\//g, '_').slice(1)}.png`);
      await page.screenshot({ path: path.join(OUT_DIR, shot), fullPage: true }).catch(() => null);
      results.push({
        ...item,
        status,
        finalUrl: page.url(),
        title,
        h1,
        severity: 'broken',
        issues: [`exception:${String(err).slice(0, 200)}`],
        consoleErrors: consoleErrors.slice(0, 8),
        pageErrors: pageErrors.slice(0, 5),
        bodySample,
        ms: Date.now() - started,
        screenshot: shot,
      });
      console.log(`EXCEPTION ${item.label}: ${err}`);
    }
  }

  const summary = {
    ok: true,
    base: BASE,
    crawledAt: new Date().toISOString(),
    counts: {
      total: results.length,
      broken: results.filter((r) => r.severity === 'broken').length,
      needs_fix: results.filter((r) => r.severity === 'needs_fix').length,
      empty_ok: results.filter((r) => r.severity === 'empty_ok').length,
      ok: results.filter((r) => r.severity === 'ok').length,
    },
    results,
  };
  fs.writeFileSync(path.join(OUT_DIR, 'results.json'), JSON.stringify(summary, null, 2));

  // Markdown report
  const lines = [
    `# CE nav Playwright crawl`,
    '',
    `Base: ${BASE}`,
    `When: ${summary.crawledAt}`,
    '',
    `Totals: ${summary.counts.total} · broken ${summary.counts.broken} · needs_fix ${summary.counts.needs_fix} · empty_ok ${summary.counts.empty_ok} · ok ${summary.counts.ok}`,
    '',
    '| group | label | href | status | severity | issues | h1 |',
    '|-------|-------|------|--------|----------|--------|----|',
  ];
  for (const r of results) {
    lines.push(
      `| ${r.group} | ${r.label} | \`${r.href}\` | ${r.status} | **${r.severity}** | ${(r.issues || []).join('; ').replace(/\|/g, '/')} | ${(r.h1 || '').replace(/\|/g, '/')} |`,
    );
  }
  lines.push('');
  lines.push('## Needs attention');
  lines.push('');
  for (const r of results.filter((x) => x.severity === 'broken' || x.severity === 'needs_fix')) {
    lines.push(`### ${r.label} (\`${r.href}\`) — ${r.severity}`);
    lines.push('');
    lines.push(`- status: ${r.status}`);
    lines.push(`- finalUrl: ${r.finalUrl}`);
    lines.push(`- issues: ${(r.issues || []).join(', ') || '—'}`);
    if (r.consoleErrors?.length) lines.push(`- console: ${r.consoleErrors[0]}`);
    if (r.pageErrors?.length) lines.push(`- pageerror: ${r.pageErrors[0]}`);
    if (r.bodySample) lines.push(`- sample: ${r.bodySample.slice(0, 220)}`);
    lines.push('');
  }
  fs.writeFileSync(path.join(OUT_DIR, 'REPORT.md'), lines.join('\n'));
  console.log('WROTE', path.join(OUT_DIR, 'results.json'));
  console.log(JSON.stringify(summary.counts));
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
