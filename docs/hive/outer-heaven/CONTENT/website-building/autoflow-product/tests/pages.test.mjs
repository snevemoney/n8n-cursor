import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PAGES = ["index.html", "editor.html"];

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
  assert.equal(byCta["nav-door"], "editor.html");
  assert.equal(byCta["hero-primary"].split("#")[0], "editor.html");
  assert.equal(byCta["door-primary"], "editor.html");
  assert.ok(byCta["door-contrast"].startsWith("editor.html"), "contrast CTA resolves to the door");
  assert.match(html, /Ideas on a canvas\./);
  assert.match(html, /class="card friction" data-muted="true"/, "friction contrast card present and struck");
});

test("door page: blank canvas, idea input, connect/cite controls disabled, badge counts, svg edge layer, demo states", () => {
  const html = read("editor.html");
  assert.match(html, /id="canvas" data-state="empty"/);
  assert.match(html, /id="canvas-state"[^>]*aria-live="polite"/);
  assert.match(html, /<label for="idea-text">/);
  assert.match(html, /id="add-btn"/);
  assert.match(html, /id="connect-btn" disabled/);
  assert.match(html, /id="cite-btn" disabled/);
  assert.match(html, /<label for="cite-ref">/);
  assert.match(html, /<svg[^>]*id="edges"/);
  assert.match(html, /id="nodes"/);
  assert.match(html, /id="cite-count"/);
  assert.match(html, /id="toast" role="status" aria-live="polite"/);
  assert.match(html, /id="friction" data-muted="false"/);
  assert.match(html, /id="load-example"/);
  assert.match(html, /id="reset-empty"/);
  assert.match(html, /<script type="module" src="assets\/canvas-ui.js">/);
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

test("not-finance lock: no finance vocabulary anywhere except the struck name-collision card", () => {
  for (const p of PAGES) {
    const html = read(p).replace(/<s>[\s\S]*?<\/s>/g, "").replace(/<[^>]*data-contrast[^>]*>[\s\S]*?<\/[a-z]+>/g, "");
    assert.doesNotMatch(html, /invoice|ledger|budget|cash ?flow|bank|portfolio|accounting|\$[0-9]/i, `${p} must not read as a finance product`);
  }
});

test("CSS: hidden attribute beats display:flex/grid; mobile breakpoint; reduced motion; tokens block", () => {
  const css = read("assets/autoflow.css");
  assert.match(css, /\[hidden\]\s*\{\s*display:\s*none\s*!important;?\s*\}/);
  assert.match(css, /@media \(max-width: 720px\)/, "mobile breakpoint present");
  assert.match(css, /prefers-reduced-motion: reduce/, "reduced motion respected");
  assert.match(css, /--brand:\s*#8b6cff/, "placeholder token declared where the SSOT swap lands");
  assert.match(css, /VERTICALS\.autoflow/, "SSOT pointer kept in the tokens comment");
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
