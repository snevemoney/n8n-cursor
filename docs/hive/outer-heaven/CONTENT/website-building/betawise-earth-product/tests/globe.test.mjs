import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DENSITY,
  createState,
  degrees,
  pause,
  pointCount,
  project,
  rotateY,
  seeded,
  setDensity,
  setStyle,
  spherePoints,
  stageLabel,
  stageState,
  start,
  stateFromQuery,
  tick,
} from "../assets/globe.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("dark on load: not running, zero frames, label says 0 stock assets", () => {
  const s = createState();
  assert.equal(s.running, false);
  assert.equal(s.frames, 0);
  assert.equal(stageState(s), "dark");
  assert.equal(stageLabel(s), "dark · 0 stock assets");
  assert.equal(pointCount(s), DENSITY.sparse);
});

test("seeded generator is deterministic and bounded", () => {
  const a = seeded(7);
  const b = seeded(7);
  for (let i = 0; i < 50; i += 1) {
    const x = a();
    assert.equal(x, b());
    assert.ok(x >= 0 && x < 1);
  }
  assert.notEqual(seeded(1)(), seeded(2)());
});

test("sphere points: requested count, on the unit sphere, same every call", () => {
  const p = spherePoints(220);
  const q = spherePoints(220);
  assert.equal(p.length, 220);
  for (let i = 0; i < p.length; i += 1) {
    const r = Math.hypot(p[i].x, p[i].y, p[i].z);
    assert.ok(Math.abs(r - 1) < 1e-9, `point ${i} on sphere`);
    assert.deepEqual(p[i], q[i]);
  }
});

test("rotateY preserves radius; projection stays inside the square", () => {
  const p = { x: 1, y: 0, z: 0 };
  const r = rotateY(p, Math.PI / 2);
  assert.ok(Math.abs(Math.hypot(r.x, r.y, r.z) - 1) < 1e-9);
  assert.ok(Math.abs(r.x) < 1e-9 && Math.abs(r.z + 1) < 1e-9);
  for (const pt of spherePoints(100)) {
    const q = project(pt, 400);
    assert.ok(q.x >= 0 && q.x <= 400 && q.y >= 0 && q.y <= 400);
  }
});

test("tick: first call records time, later calls advance the angle, pause freezes it", () => {
  const s = start(createState());
  assert.equal(tick(s, 1000).advanced, false, "first frame only records ts");
  const r = tick(s, 1100);
  assert.equal(r.advanced, true);
  assert.equal(degrees(s), 1.8, "18°/s × 0.1s");
  assert.equal(s.frames, 1);
  pause(s);
  assert.equal(tick(s, 2000).advanced, false);
  assert.equal(degrees(s), 1.8);
  assert.equal(stageState(s), "paused");
  assert.match(stageLabel(s), /^paused · 1\.8° · 0 stock assets$/);
});

test("tick clamps a long gap to 100ms so a tab-switch does not spin the globe", () => {
  const s = start(createState());
  tick(s, 0);
  tick(s, 60000);
  assert.ok(degrees(s) <= 1.8 + 1e-9);
});

test("density and style: only known values accepted", () => {
  const s = createState();
  setDensity(s, "dense");
  assert.equal(pointCount(s), DENSITY.dense);
  setDensity(s, "ultra");
  assert.equal(pointCount(s), DENSITY.dense);
  setStyle(s, "wire");
  assert.equal(s.style, "wire");
  setStyle(s, "video");
  assert.equal(s.style, "wire");
});

test("stateFromQuery: live starts running; density/style read from the query; else dark", () => {
  const live = stateFromQuery("?state=live&density=dense&style=wire");
  assert.equal(live.running, true);
  assert.equal(live.density, "dense");
  assert.equal(live.style, "wire");
  assert.equal(stageState(live), "live");
  assert.equal(stageState(stateFromQuery("")), "dark");
  assert.equal(stateFromQuery("?density=nope").density, "sparse");
});

test("zero stock assets on disk: no media files anywhere in the slice", () => {
  const walk = (d) =>
    readdirSync(d, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? (e.name === ".pids" ? [] : walk(join(d, e.name))) : [join(d, e.name)],
    );
  for (const f of walk(ROOT)) {
    assert.doesNotMatch(f, /\.(mp4|webm|mov|gif|png|jpe?g|svg|glb|gltf|lottie)$/i, f);
  }
});
