import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PAGES = ["index.html", "book.html", "check.html"];

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

test("shell: See schedule and Book a session land on the booking page", () => {
  const html = read("index.html");
  const ctas = [...html.matchAll(/<a[^>]*data-cta="([^"]+)"[^>]*href="([^"]+)"|<a[^>]*href="([^"]+)"[^>]*data-cta="([^"]+)"/g)]
    .map((m) => ({ cta: m[1] ?? m[4], href: m[2] ?? m[3] }));
  const byCta = Object.fromEntries(ctas.map((c) => [c.cta, c.href]));
  assert.equal(byCta["nav-see-schedule"], "book.html");
  assert.equal(byCta["hero-see-schedule"], "book.html");
  assert.equal(byCta["floor-book-session"], "book.html");
  assert.equal(byCta["hero-request-intro"], "book.html#intro");
  assert.equal(byCta["floor-check-path"], "check.html");
  assert.match(html, /See the floor\./);
  assert.match(html, /claim an intro\./);
  assert.match(html, /Book a session/);
});

test("booking page: empty state, confirm control, toast, muted-inbox contrast, demo states", () => {
  const html = read("book.html");
  assert.match(html, /id="calendar" data-state="empty"/);
  assert.match(html, /id="cal-state"[^>]*aria-live="polite"/);
  assert.match(html, /id="confirm-btn" disabled/);
  assert.match(html, /id="toast" role="status" aria-live="polite"/);
  assert.match(html, /Confirmed · on the calendar/);
  assert.match(html, /id="inbox" data-muted="false"/);
  assert.match(html, /id="load-example"/);
  assert.match(html, /id="reset-empty"/);
  assert.match(html, /<label for="member">/);
  assert.match(html, /<script type="module" src="assets\/booking-ui.js">/);
});

test("check page: labelled input, submit, result region, 404 wall for fail, calendar link for pass", () => {
  const html = read("check.html");
  assert.match(html, /<label for="site-url">/);
  assert.match(html, /id="site-url"[^>]*inputmode="url"/);
  assert.match(html, /id="check-btn">Check book path</);
  assert.match(html, /id="result"[^>]*aria-live="polite"/);
  assert.match(html, /id="wall" hidden/);
  assert.match(html, /404/);
  assert.match(html, /id="result-book"[^>]*>Open the calendar</);
  assert.match(html, /<script type="module" src="assets\/door-check-ui.js">/);
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

test("CSS: hidden attribute beats display:flex/grid so fail state never shows the pass CTA", () => {
  const css = read("assets/ironlane.css");
  assert.match(css, /\[hidden\]\s*\{\s*display:\s*none\s*!important;?\s*\}/);
  assert.match(css, /@media \(max-width: 720px\)/, "mobile breakpoint present");
  assert.match(css, /prefers-reduced-motion: reduce/, "reduced motion respected");
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
