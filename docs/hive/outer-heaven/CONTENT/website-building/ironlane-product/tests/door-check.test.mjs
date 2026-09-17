import { test } from "node:test";
import assert from "node:assert/strict";
import { DOORS, EXAMPLES, checkDoor, normalizeUrl } from "../assets/door-check.js";

test("normalizeUrl adds https and accepts bare hosts", () => {
  assert.equal(normalizeUrl("ironlane.example").href, "https://ironlane.example/");
  assert.equal(normalizeUrl("  http://Ironlane.Example/book ").hostname, "ironlane.example");
  assert.equal(normalizeUrl("localhost:4842").hostname, "localhost");
});

test("normalizeUrl rejects junk", () => {
  for (const bad of ["", "   ", "not a url", "ftp://x.example", "justaword", "mailto:a@b.c"]) {
    assert.equal(normalizeUrl(bad), null, bad);
  }
});

test("open door → pass with clear success copy", () => {
  const r = checkDoor("ironlane.example");
  assert.equal(r.status, "pass");
  assert.equal(r.headline, "Path works.");
  assert.equal(r.host, "ironlane.example");
  assert.equal(r.path, "/book");
});

test("wall → fail with clear hit-a-wall copy", () => {
  const r = checkDoor("https://dm-only-gym.example/anything");
  assert.equal(r.status, "fail");
  assert.equal(r.headline, "Hit a wall.");
  assert.match(r.detail, /404/);
});

test("invalid input → invalid state, never throws", () => {
  const r = checkDoor("yoursite.c om");
  assert.equal(r.status, "invalid");
  assert.equal(r.host, null);
});

test("real host is never fetched: unknown state names the limit", () => {
  const r = checkDoor("https://evenslouis.ca/work/ironlane-studio");
  assert.equal(r.status, "unknown");
  assert.match(r.detail, /No live site is fetched/);
});

test("the local preview passes because /book.html exists", () => {
  assert.equal(checkDoor("http://127.0.0.1:4842/").status, "pass");
  assert.equal(checkDoor("localhost:4842").status, "pass");
});

test("registry is example-only and each door is pass or fail", () => {
  assert.ok(DOORS.length >= 2);
  for (const d of DOORS) {
    assert.match(d.host, /\.example$/, `${d.host} must be an .example host`);
    assert.ok(["open", "wall"].includes(d.door));
    assert.ok(["pass", "fail"].includes(checkDoor(d.host).status));
  }
  assert.ok(EXAMPLES.some((h) => checkDoor(h).status === "pass"));
  assert.ok(EXAMPLES.some((h) => checkDoor(h).status === "fail"));
});

test("deterministic: same input, same result", () => {
  const a = checkDoor("textus.example");
  const b = checkDoor("textus.example");
  assert.deepEqual(a, b);
});
