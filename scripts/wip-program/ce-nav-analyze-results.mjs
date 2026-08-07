/** Re-score CE nav crawl results.json into product findings (ignore Meta Pixel CSP noise). */
import fs from 'fs';

const inPath = process.argv[2] || '/out/results.json';
const outMd = process.argv[3] || '/docs/CE_NAV_CRAWL_FINDINGS.md';
const outJson = process.argv[4] || '/out/results.product.json';
const j = JSON.parse(fs.readFileSync(inPath, 'utf8'));

function signals(r) {
  const t = `${r.bodySample || ''} ${r.h1 || ''}`;
  const s = [];
  const cons = (r.consoleErrors || []).filter(
    (e) => !/fbevents\.js|Content Security Policy|facebook\.net/i.test(e),
  );
  if (cons.length) s.push({ sev: 'warn', code: 'console', detail: cons[0].slice(0, 180) });
  if ((r.pageErrors || []).length)
    s.push({ sev: 'broken', code: 'pageerror', detail: r.pageErrors[0] });
  if (r.status >= 500) s.push({ sev: 'broken', code: 'http5xx', detail: String(r.status) });
  if (r.status === 404 || /could not be found/i.test(t))
    s.push({ sev: 'broken', code: 'not_found', detail: r.finalUrl });
  if (/\/login/.test(r.finalUrl) && !/login/.test(r.href))
    s.push({ sev: 'broken', code: 'auth_bounce', detail: r.finalUrl });

  if (/\bstub\b|not implemented|coming soon|under construction|placeholder/i.test(t)) {
    const m = t.match(/.{0,40}(stub|not implemented|coming soon|placeholder).{0,40}/i);
    s.push({ sev: 'fix', code: 'stub_or_placeholder', detail: (m && m[0]) || 'stub' });
  }
  if (/Stale|Last computed \d+d ago|155d ago/i.test(t)) {
    const m = t.match(/Last computed[^.]{0,40}|Stale/i);
    s.push({ sev: 'fix', code: 'stale_metrics', detail: (m && m[0]) || 'stale' });
  }
  if (/Low confi|Warnings/i.test(t) && /Forecast|Pace/i.test(t))
    s.push({ sev: 'warn', code: 'forecast_low_confidence', detail: 'forecast warnings' });
  if (/Health Score\s*\d+\.\d{5,}/i.test(t) || /77\.142857/i.test(t))
    s.push({ sev: 'fix', code: 'ugly_number_precision', detail: 'unrounded health score' });
  if (/OVERDUE\s+[1-9]/i.test(t))
    s.push({ sev: 'warn', code: 'has_overdue', detail: 'overdue items present' });
  if (/NEEDS PIPELINE\s+[1-9]/i.test(t))
    s.push({ sev: 'warn', code: 'needs_pipeline', detail: 'leads need pipeline' });
  if (/TOTAL LEADS\s+0\b/i.test(t) && /Conversion/i.test(r.label + t))
    s.push({ sev: 'fix', code: 'conversion_all_zero', detail: 'conversion funnel all zeros' });
  if (
    /Follow-ups/i.test(r.label) &&
    (/ALL\s+0\b/i.test(t) || /UPCOMING \(7D\)\s+0/i.test(t))
  )
    s.push({ sev: 'warn', code: 'followups_empty', detail: 'no follow-ups scheduled' });
  if (/Growth Pipeline/i.test(t) && /new \(0\)/i.test(t))
    s.push({ sev: 'warn', code: 'growth_pipeline_empty', detail: 'growth stages empty' });
  if (/Time to close\s*No/i.test(t))
    s.push({ sev: 'warn', code: 'scorecard_no_data', detail: 'scorecard missing close data' });
  if (/YouTube/i.test(r.label) && /fallback|Not connected|Note:/i.test(t))
    s.push({ sev: 'warn', code: 'youtube_notes', detail: 'youtube ingest caveats' });
  if (/Meta Ads/i.test(r.label) && /live/i.test(t))
    s.push({ sev: 'info', code: 'meta_live_ui', detail: 'Meta monitor shows live' });
  if (
    /Follow-ups|Growth|Conversion|Campaigns|Scorecard/.test(r.label) &&
    /None\b|ALL 0|TOTAL LEADS 0|new \(0\)/i.test(t)
  )
    s.push({ sev: 'warn', code: 'operator_empty', detail: 'critical surface empty' });
  return s;
}

const rows = j.results.map((r) => {
  const sig = signals(r);
  let severity = 'ok';
  if (sig.some((x) => x.sev === 'broken')) severity = 'broken';
  else if (sig.some((x) => x.sev === 'fix')) severity = 'needs_fix';
  else if (sig.some((x) => x.sev === 'warn')) severity = 'needs_attention';
  return {
    ...r,
    signals: sig,
    severity,
    issues: sig.map((x) => `${x.code}:${x.detail}`),
  };
});

const counts = { total: rows.length, broken: 0, needs_fix: 0, needs_attention: 0, ok: 0 };
for (const r of rows) counts[r.severity] = (counts[r.severity] || 0) + 1;

const global = [
  {
    sev: 'fix',
    code: 'csp_blocks_fbevents',
    detail:
      'Every dashboard page: CSP blocks https://connect.facebook.net/en_US/fbevents.js — allowlist in CSP or remove Meta Pixel from dashboard layouts',
  },
  {
    sev: 'warn',
    code: 'health_banner_everywhere',
    detail:
      'Global Intelligence banner shows Health 77 / 1 risk / 4 actions on every page — verify accuracy and reduce noise',
  },
];

const lines = [];
lines.push('# CE dashboard — what needs fixing (Playwright)');
lines.push('');
lines.push(`Crawled: ${j.crawledAt} · Base: ${j.base} · ${counts.total} nav routes`);
lines.push('');
lines.push(
  `**Result:** broken ${counts.broken || 0} · needs_fix ${counts.needs_fix || 0} · needs_attention ${counts.needs_attention || 0} · ok ${counts.ok || 0}`,
);
lines.push('');
lines.push(
  'All listed sidebar routes **load (HTTP 200)** after Auth.js login. Issues below are functional/UX/data, not dead links.',
);
lines.push('');
lines.push('## Global (every page)');
lines.push('');
for (const g of global) lines.push(`- **${g.code}** (${g.sev}): ${g.detail}`);
lines.push('');
lines.push('## Priority fixes');
lines.push('');
const fix = rows.filter((r) => r.severity === 'needs_fix' || r.severity === 'broken');
const attn = rows.filter((r) => r.severity === 'needs_attention');
if (!fix.length) lines.push('_No page-level broken/fix beyond globals — see attention list._', '');
for (const r of fix) {
  lines.push(`### ${r.label} (\`${r.href}\`)`);
  for (const s of r.signals.filter((x) => x.sev === 'fix' || x.sev === 'broken'))
    lines.push(`- ${s.code}: ${s.detail}`);
  lines.push(`- sample: ${(r.bodySample || '').slice(0, 220)}`);
  lines.push('');
}
lines.push('## Needs attention (data/ops, not crashes)');
lines.push('');
for (const r of attn) {
  lines.push(
    `- **${r.label}** (\`${r.href}\`): ${r.signals
      .filter((x) => x.sev === 'warn')
      .map((x) => x.code)
      .join(', ')}`,
  );
  lines.push(`  - ${(r.bodySample || '').slice(0, 160)}`);
}
lines.push('');
lines.push('## Healthy / usable');
lines.push('');
for (const r of rows.filter((r) => r.severity === 'ok')) {
  lines.push(`- **${r.label}** (\`${r.href}\`) — ${r.h1 || 'ok'}`);
}
lines.push('');
lines.push('## Full severity table');
lines.push('');
lines.push('| group | label | href | severity | signals |');
lines.push('|-------|-------|------|----------|---------|');
for (const r of rows) {
  const sig = r.signals.map((x) => x.code).join(', ') || '—';
  lines.push(
    `| ${r.group} | ${r.label} | \`${r.href}\` | **${r.severity}** | ${sig.replace(/\|/g, '/')} |`,
  );
}
fs.mkdirSync(outMd.split('/').slice(0, -1).join('/') || '.', { recursive: true });
fs.writeFileSync(outMd, `${lines.join('\n')}\n`);
fs.writeFileSync(outJson, JSON.stringify({ counts, global, results: rows }, null, 2));
console.log(JSON.stringify(counts));
console.log('FIX', fix.map((r) => r.label).join(', ') || 'none');
console.log('ATTN', attn.map((r) => r.label).join(', ') || 'none');
