import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PAGES = ["index.html", "seat.html"];

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

test("shell: every seat CTA lands on seat.html and there is NO funnel opt-in", () => {
  const html = read("index.html");
  const byCta = ctas(html);
  assert.equal(byCta["nav-request-seat"], "seat.html");
  assert.equal(byCta["hero-request-seat"], "seat.html");
  assert.equal(byCta["cohort-autumn"], "seat.html?cohort=autumn");
  assert.equal(byCta["cohort-winter"], "seat.html?cohort=winter");
  assert.equal(byCta["see-held"], "seat.html?state=held");
  assert.equal(byCta["see-waitlisted"], "seat.html?state=waitlisted");
  assert.match(html, /Twelve chairs\./);
  assert.match(html, /Request one\./);
  assert.doesNotMatch(html, /<input/i, "no opt-in field on the shell");
  assert.doesNotMatch(html, /subscribe|newsletter|download the (free )?(pdf|guide)/i, "no lead-magnet copy");
  assert.doesNotMatch(html, /data-cta="[^"]*(subscribe|optin|opt-in)/i, "no opt-in CTA");
});

test("seat page: empty frame, cohort chips + seat group, disabled request, outcome, friction, demo states", () => {
  const html = read("seat.html");
  assert.match(html, /id="seat-frame" data-state="empty"/);
  assert.match(html, /id="seat-state"[^>]*aria-live="polite"/);
  assert.match(html, /id="cohorts" role="group"/);
  assert.match(html, /id="seats" role="group"/);
  assert.match(html, /id="request-btn" disabled/);
  assert.match(html, /id="outcome" hidden/);
  assert.match(html, /id="friction" data-muted="false"/);
  assert.match(html, /Funnel spam/);
  assert.match(html, /id="load-held"/);
  assert.match(html, /id="load-waitlisted"/);
  assert.match(html, /id="reset-empty"/);
  assert.match(html, /<label for="maker">/);
  assert.doesNotMatch(html, /type="email"/, "a seat request is not an email capture");
  assert.match(html, /<script type="module" src="assets\/seat-ui.js">/);
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
    const visible = html.replace(/href="data:[^"]*"/g, "");
    assert.doesNotMatch(visible, /\b\d{1,3}%/, `${p} must not carry a percentage claim`);
    assert.doesNotMatch(visible, /\$\s?\d/, `${p} must not carry a price figure`);
  }
});

test("CSS: tokens define the brand, shell is token-only, hidden wins, mobile + reduced motion present", () => {
  const tokens = read("assets/tokens.css");
  const css = read("assets/product.css");
  assert.match(tokens, /--brand:\s*#[0-9a-f]{6}/i);
  assert.match(tokens, /VERTICALS\.atelier/, "tokens name the SSOT swap point");
  assert.doesNotMatch(css, /--brand:\s*#/, "shell does not define the brand");
  assert.match(css, /\[hidden\]\s*\{\s*display:\s*none\s*!important;?\s*\}/);
  assert.match(css, /@media \(max-width: 720px\)/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /\.seats\s*\{/, "seat map layout present");
});

test("JS modules: no network, no storage, no clock", () => {
  const dir = join(ROOT, "assets");
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".js"))) {
    const src = readFileSync(join(dir, f), "utf8");
    assert.doesNotMatch(src, /fetch\(|XMLHttpRequest|WebSocket|navigator\.sendBeacon/, `${f} must not call out`);
    assert.doesNotMatch(src, /localStorage|sessionStorage|indexedDB|document\.cookie/, `${f} must not persist`);
    assert.doesNotMatch(src, /Date\.now|new Date\(|Math\.random|setInterval/, `${f} must stay deterministic (no countdown)`);
  }
});

test("serve.sh binds 127.0.0.1 on the slice port and never kills a listener", () => {
  const sh = read("serve.sh");
  assert.match(sh, /--bind 127\.0\.0\.1/);
  assert.match(sh, /4845/);
  assert.doesNotMatch(sh, /kill\s/);
  assert.doesNotMatch(sh, /0\.0\.0\.0/);
});
