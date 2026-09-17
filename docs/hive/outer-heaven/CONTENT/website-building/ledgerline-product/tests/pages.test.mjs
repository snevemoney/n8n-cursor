import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PAGES = ["index.html", "demo.html"];

const read = (f) => readFileSync(join(ROOT, f), "utf8");

function localRefs(html) {
  const refs = [];
  for (const m of html.matchAll(/\b(?:href|src)="([^"#]+)(?:#[^"]*)?"/g)) refs.push(m[1]);
  return refs.filter((r) => !/^(https?:|mailto:|tel:|data:)/.test(r));
}

function ctas(html) {
  return Object.fromEntries(
    [...html.matchAll(/<a[^>]*data-cta="([^"]+)"[^>]*href="([^"]+)"|<a[^>]*href="([^"]+)"[^>]*data-cta="([^"]+)"/g)]
      .map((m) => [m[1] ?? m[4], m[2] ?? m[3]]),
  );
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
    assert.match(html, /assets\/tokens\.css/, `${p} loads the brand tokens`);
    assert.match(html, /assets\/product\.css/, `${p} loads the shared shell`);
  }
});

test("no local link or asset points at a missing file", () => {
  for (const p of PAGES) {
    for (const ref of localRefs(read(p))) {
      const target = ref.split("?")[0];
      assert.ok(existsSync(join(ROOT, target)), `${p} → ${ref} must exist`);
    }
  }
});

test("shell: every demo CTA lands on demo.html; the clarity block opens clear with a toggle", () => {
  const html = read("index.html");
  const byCta = ctas(html);
  assert.equal(byCta["nav-book-demo"], "demo.html");
  assert.equal(byCta["hero-book-demo"], "demo.html");
  assert.equal(byCta["clarity-book-demo"], "demo.html");
  assert.equal(byCta["see-booked"], "demo.html?state=booked");
  assert.equal(byCta["hero-read-three-lines"], "#clarity-section");
  assert.match(html, /Three lines\./);
  assert.match(html, /a demo\./);
  assert.match(html, /id="clarity" data-mode="clear"/);
  assert.match(html, /id="clarity-lines"/);
  assert.match(html, /id="clarity-count"[^>]*aria-live="polite"/);
  assert.match(html, /id="clarity-toggle" aria-pressed="false"/);
  assert.match(html, /<script type="module" src="assets\/clarity-ui.js">/);
});

test("demo page: empty frame, grid group, role + name labelled, disabled book, outcome, recap, friction, demo states", () => {
  const html = read("demo.html");
  assert.match(html, /id="demo-frame" data-state="empty"/);
  assert.match(html, /id="demo-state"[^>]*aria-live="polite"/);
  assert.match(html, /id="grid" role="group"/);
  assert.match(html, /<label for="role">/);
  assert.match(html, /<label for="lead">/);
  assert.match(html, /id="book-btn" disabled/);
  assert.match(html, /id="outcome" hidden/);
  assert.match(html, /id="clarity-recap"/);
  assert.match(html, /id="friction" data-muted="false"/);
  assert.match(html, /Feature fog/);
  assert.match(html, /id="load-example"/);
  assert.match(html, /id="reset-empty"/);
  assert.match(html, /<script type="module" src="assets\/demo-ui.js">/);
});

test("CapEx locks: sample labels on every page, no external scripts, no payment or outbound chrome", () => {
  for (const p of PAGES) {
    const html = read(p);
    assert.match(html, /SAMPLE/, `${p} must say SAMPLE`);
    assert.match(html, /CapEx/, `${p} must say CapEx`);
    assert.match(html, /invent_kpi=0/, `${p} must carry invent_kpi=0`);
    assert.match(html, /name="robots" content="noindex, nofollow"/, `${p} must be noindex`);
    assert.doesNotMatch(html, /<script[^>]*src="https?:/, `${p} must not load external scripts`);
    assert.doesNotMatch(html, /stripe|checkout|paypal|pricing/i, `${p} must not mention payment or pricing`);
    assert.doesNotMatch(html, /fetch\(|XMLHttpRequest|websocket/i, `${p} must not call out`);
    const visible = html.replace(/href="data:[^"]*"/g, "");
    assert.doesNotMatch(visible, /\b\d{1,3}%/, `${p} must not carry a percentage claim`);
    assert.doesNotMatch(visible, /\$\s?\d/, `${p} must not carry a price figure`);
    assert.doesNotMatch(visible, /\b\d+x\b|faster|save \d/i, `${p} must not carry a speed/savings claim`);
  }
});

test("CSS: tokens define the brand, shell is token-only, hidden wins, mobile + reduced motion + clarity layout present", () => {
  const tokens = read("assets/tokens.css");
  const css = read("assets/product.css");
  assert.match(tokens, /--brand:\s*#[0-9a-f]{6}/i);
  assert.match(tokens, /VERTICALS\.ledgerline/, "tokens name the SSOT swap point");
  assert.doesNotMatch(css, /--brand:\s*#/, "shell does not define the brand");
  assert.match(css, /\[hidden\]\s*\{\s*display:\s*none\s*!important;?\s*\}/);
  assert.match(css, /@media \(max-width: 720px\)/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /\.clarity\[data-mode="fog"\]/, "fog mode styled");
});

test("JS modules: no network, no storage, no clock", () => {
  const dir = join(ROOT, "assets");
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".js"))) {
    const src = readFileSync(join(dir, f), "utf8");
    assert.doesNotMatch(src, /fetch\(|XMLHttpRequest|WebSocket|navigator\.sendBeacon/, `${f} must not call out`);
    assert.doesNotMatch(src, /localStorage|sessionStorage|indexedDB|document\.cookie/, `${f} must not persist`);
    assert.doesNotMatch(src, /Date\.now|new Date\(|Math\.random|performance\.now/, `${f} must stay deterministic (no stopwatch)`);
  }
});

test("serve.sh binds 127.0.0.1 on the slice port and never kills a listener", () => {
  const sh = read("serve.sh");
  assert.match(sh, /--bind 127\.0\.0\.1/);
  assert.match(sh, /4846/);
  assert.doesNotMatch(sh, /kill\s/);
  assert.doesNotMatch(sh, /0\.0\.0\.0/);
});
