import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PAGES = ["index.html", "proofs.html"];

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
  assert.equal(byCta["nav-door"], "proofs.html");
  assert.equal(byCta["hero-primary"].split("#")[0], "proofs.html");
  assert.equal(byCta["door-primary"], "proofs.html");
  assert.ok(byCta["door-contrast"].startsWith("proofs.html"), "contrast CTA resolves to the door");
  assert.match(html, /Building\./);
  assert.match(html, /class="card friction" data-muted="true"/, "friction contrast card present and struck");
});

test("door page: closed door, open/close controls, filter chips disabled, cards grid, detail panel, building-mode pill, demo states", () => {
  const html = read("proofs.html");
  assert.match(html, /id="door" data-state="closed"/);
  assert.match(html, /id="door-state"[^>]*aria-live="polite"/);
  assert.match(html, /id="open-btn"/);
  assert.match(html, /id="close-btn" disabled/);
  assert.match(html, /id="filters"[^>]*role="group"/);
  assert.match(html, /id="cards"/);
  assert.match(html, /id="detail"/);
  assert.match(html, /Building mode/);
  assert.match(html, /id="toast" role="status" aria-live="polite"/);
  assert.match(html, /id="friction" data-muted="false"/);
  assert.match(html, /id="load-example"/);
  assert.match(html, /id="reset-empty"/);
  assert.doesNotMatch(html, /href="https?:\/\/evenslouis\.ca/, "no live /work wiring from the preview");
  assert.match(html, /<script type="module" src="assets\/proofs-ui.js">/);
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

test("not-a-deck lock: pitch vocabulary only inside the struck friction card", () => {
  for (const p of PAGES) {
    const html = read(p).replace(/<s>[\s\S]*?<\/s>/g, "").replace(/<[^>]*data-contrast[^>]*>[\s\S]*?<\/[a-z]+>/g, "");
    assert.doesNotMatch(html, /pitch deck|\bslides?\b|investor|discovery call|book a call|full-service/i, `${p} must not read as a pitch deck or agency page`);
  }
});

test("CSS: hidden attribute beats display:flex/grid; mobile breakpoint; reduced motion; tokens block", () => {
  const css = read("assets/business.css");
  assert.match(css, /\[hidden\]\s*\{\s*display:\s*none\s*!important;?\s*\}/);
  assert.match(css, /@media \(max-width: 720px\)/, "mobile breakpoint present");
  assert.match(css, /prefers-reduced-motion: reduce/, "reduced motion respected");
  assert.match(css, /--brand:\s*#d8d2c4/, "placeholder token declared where the SSOT swap lands");
  assert.match(css, /VERTICALS\.business/, "SSOT pointer kept in the tokens comment");
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
