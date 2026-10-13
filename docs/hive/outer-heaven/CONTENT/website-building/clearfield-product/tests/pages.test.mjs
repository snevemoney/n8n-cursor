import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PAGES = ["index.html", "workbench.html"];

const read = (f) => readFileSync(join(ROOT, f), "utf8");

// href / src / import specifiers that should resolve to a file on disk.
function localRefs(html) {
  const refs = [];
  for (const m of html.matchAll(/\b(?:href|src)="([^"#]+)(?:#[^"]*)?"/g)) refs.push(m[1]);
  return refs.filter((r) => !/^(https?:|mailto:|tel:|data:)/.test(r));
}

test("every page exists and is a full HTML document", () => {
  for (const p of PAGES) {
    assert.ok(existsSync(join(ROOT, p)), p);
    const html = read(p);
    assert.match(html, /^<!doctype html>/i);
    assert.match(html, /<html lang="en">/);
    assert.match(html, /name="viewport"/);
    assert.match(html, /<main id="main"/);
    assert.match(html, /class="skip-link"/);
  }
});

test("no local link or asset points at a missing file (the 404 is gone)", () => {
  for (const p of PAGES) {
    for (const ref of localRefs(read(p))) {
      const target = ref.split("?")[0];
      assert.ok(existsSync(join(ROOT, target)), `${p} → ${ref} must exist`);
    }
  }
});

test("shell: every primary CTA lands on the product door, contrast card points back at it", () => {
  const html = read("index.html");
  const ctas = [...html.matchAll(/<a[^>]*data-cta="([^"]+)"[^>]*href="([^"]+)"|<a[^>]*href="([^"]+)"[^>]*data-cta="([^"]+)"/g)]
    .map((m) => ({ cta: m[1] ?? m[4], href: m[2] ?? m[3] }));
  const byCta = Object.fromEntries(ctas.map((c) => [c.cta, c.href]));
  assert.equal(byCta["nav-door"], "workbench.html");
  assert.equal(byCta["hero-primary"].split("#")[0], "workbench.html");
  assert.equal(byCta["door-primary"], "workbench.html");
  assert.ok(byCta["door-contrast"].startsWith("workbench.html"), "contrast CTA resolves to the door");
  assert.match(html, /Every claim\. Every source\./);
  assert.match(html, /class="card friction" data-muted="true"/, "friction contrast card present and struck");
});

test("door page: empty casefile, claim input, evidence pool, relation control, attach disabled, summary 0 verdicts, no truth control", () => {
  const html = read("workbench.html");
  assert.match(html, /id="casefile" data-state="empty"/);
  assert.match(html, /id="case-state"[^>]*aria-live="polite"/);
  assert.match(html, /<label for="claim-text">/);
  assert.match(html, /id="claims"/);
  assert.match(html, /id="evidence"/);
  assert.match(html, /id="relation"/);
  assert.match(html, /id="attach-btn" disabled/);
  assert.match(html, /id="summary"/);
  assert.match(html, /0 verdicts/);
  assert.match(html, /id="toast" role="status" aria-live="polite"/);
  assert.match(html, /id="friction" data-muted="false"/);
  assert.match(html, /id="load-example"/);
  assert.match(html, /id="reset-empty"/);
  assert.doesNotMatch(html, /<(button|option)[^>]*>\s*(True|False|Verdict|Debunked|Confirmed true)\s*</i, "no truth control");
  assert.match(html, /<script type="module" src="assets\/casefile-ui.js">/);
});

test("CapEx locks: sample labels on every page, no external scripts, no payment or outbound chrome", () => {
  for (const p of PAGES) {
    const html = read(p);
    assert.match(html, /SAMPLE/, `${p} must say SAMPLE`);
    assert.match(html, /CapEx/, `${p} must say CapEx`);
    assert.match(html, /invent_kpi=0/, `${p} must carry invent_kpi=0`);
    assert.match(html, /name="robots" content="noindex, nofollow"/, `${p} must be noindex`);
    assert.doesNotMatch(html, /<script[^>]*src="https?:/, `${p} must not load external scripts`);
    assert.doesNotMatch(html, /stripe|checkout|paypal/i, `${p} must not mention payment`);
    assert.doesNotMatch(html, /fetch\(|XMLHttpRequest|websocket/i, `${p} must not call out`);
  }
});

test("no-adjudicate lock: no verdict language anywhere except the struck friction card", () => {
  for (const p of PAGES) {
    const html = read(p).replace(/<s>[\s\S]*?<\/s>/g, "").replace(/<[^>]*data-contrast[^>]*>[\s\S]*?<\/[a-z]+>/g, "");
    assert.doesNotMatch(html, /fact-?check verdict|we decide what is true|debunked|rated false|rated true/i, `${p} must not read as a truth adjudicator`);
  }
});

test("CSS: hidden attribute beats display:flex/grid; mobile breakpoint; reduced motion; tokens block", () => {
  const css = read("assets/clearfield.css");
  assert.match(css, /\[hidden\]\s*\{\s*display:\s*none\s*!important;?\s*\}/);
  assert.match(css, /@media \(max-width: 720px\)/, "mobile breakpoint present");
  assert.match(css, /prefers-reduced-motion: reduce/, "reduced motion respected");
  assert.match(css, /--brand:\s*#4f8cff/, "placeholder token declared where the SSOT swap lands");
  assert.match(css, /VERTICALS\.clearfield/, "SSOT pointer kept in the tokens comment");
});

test("JS modules: no network, no storage, no clock", () => {
  const dir = join(ROOT, "assets");
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".js"))) {
    const src = readFileSync(join(dir, f), "utf8");
    assert.doesNotMatch(src, /fetch\(|XMLHttpRequest|WebSocket|navigator\.sendBeacon/, `${f} must not call out`);
    assert.doesNotMatch(src, /localStorage|sessionStorage|indexedDB|document\.cookie/, `${f} must not persist`);
    assert.doesNotMatch(src, /Date\.now|new Date\(|Math\.random/, `${f} must stay deterministic`);
  }
});
