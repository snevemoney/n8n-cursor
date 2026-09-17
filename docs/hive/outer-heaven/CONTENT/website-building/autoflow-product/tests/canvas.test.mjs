import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  COLS,
  EXAMPLE,
  addNode,
  canConnect,
  canvasSize,
  cite,
  citedCount,
  connect,
  createState,
  exampleState,
  hasEdge,
  isComplete,
  layout,
  stageLabel,
  stageState,
  stateFromQuery,
  toggleSelect,
} from "../assets/canvas.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("blank canvas: no nodes, no edges, label reads blank canvas", () => {
  const s = createState();
  assert.equal(s.nodes.length, 0);
  assert.equal(s.edges.length, 0);
  assert.equal(stageState(s), "empty");
  assert.equal(stageLabel(s), "blank canvas");
  assert.equal(isComplete(s), false);
});

test("add idea → node selected, uncited; blank idea refused", () => {
  const s = createState();
  assert.equal(addNode(s, "  ").ok, false);
  const r = addNode(s, "Open where you left off");
  assert.equal(r.ok, true);
  assert.equal(r.node.id, "n1");
  assert.deepEqual(s.selected, ["n1"]);
  assert.equal(citedCount(s), 0);
  assert.equal(stageLabel(s), "drafting · 0/1 cited");
});

test("selection holds two in tap order; tapping again unselects", () => {
  const s = createState();
  addNode(s, "a");
  addNode(s, "b");
  addNode(s, "c");
  s.selected = [];
  toggleSelect(s, "n1");
  toggleSelect(s, "n2");
  assert.deepEqual(s.selected, ["n1", "n2"]);
  toggleSelect(s, "n3");
  assert.deepEqual(s.selected, ["n2", "n3"], "keeps the last two");
  toggleSelect(s, "n3");
  assert.deepEqual(s.selected, ["n2"]);
  toggleSelect(s, "zzz");
  assert.deepEqual(s.selected, ["n2"]);
});

test("connect needs two different unconnected ideas; self-connect refused (hold-out shape)", () => {
  const s = createState();
  addNode(s, "a");
  addNode(s, "b");
  s.selected = ["n1"];
  assert.equal(canConnect(s), false);
  s.selected = ["n1", "n1"];
  assert.equal(canConnect(s), false, "self");
  s.selected = ["n1", "n2"];
  const r = connect(s);
  assert.equal(r.ok, true);
  assert.equal(hasEdge(s, "n2", "n1"), true, "undirected");
  s.selected = ["n1", "n2"];
  assert.equal(connect(s).ok, false, "no duplicate edge");
});

test("cite the single selected idea; blank source stays uncited", () => {
  const s = createState();
  addNode(s, "a");
  assert.equal(cite(s, "   ").ok, false);
  assert.equal(citedCount(s), 0);
  const r = cite(s, "interview · sample");
  assert.equal(r.ok, true);
  assert.equal(r.node.cite, "interview · sample");
  assert.equal(isComplete(s), true);
  assert.equal(stageState(s), "cited");
  assert.equal(stageLabel(s), "ready · 1/1 cited");
  addNode(s, "b");
  s.selected = ["n1", "n2"];
  assert.equal(cite(s, "x").ok, false, "two selected → cannot cite");
});

test("example screen: four nodes, three edges, one uncited; ?state=cited completes it", () => {
  const s = exampleState(false);
  assert.equal(s.nodes.length, EXAMPLE.nodes.length);
  assert.equal(s.edges.length, EXAMPLE.edges.length);
  assert.equal(citedCount(s), 3);
  assert.equal(stageState(s), "drafting");
  const c = stateFromQuery("?state=cited");
  assert.equal(citedCount(c), 4);
  assert.equal(stageState(c), "cited");
  assert.equal(stageState(stateFromQuery("?state=example")), "drafting");
  assert.equal(stageState(stateFromQuery("")), "empty");
});

test("layout is a deterministic grid; nine nodes wrap without overlap", () => {
  const s = createState();
  for (let i = 0; i < 9; i += 1) addNode(s, `idea ${i}`);
  const pos = layout(s);
  const seen = new Set();
  for (const p of pos.values()) {
    const key = `${p.x},${p.y}`;
    assert.equal(seen.has(key), false, "no two nodes share a cell");
    seen.add(key);
  }
  assert.equal(pos.get("n4").x, pos.get("n1").x, `wraps every ${COLS}`);
  const size = canvasSize(s);
  assert.ok(size.height > size.width / 2);
  assert.deepEqual(layout(s).get("n5"), pos.get("n5"), "same input, same layout");
});

test("not finance: the state module carries no money vocabulary", () => {
  const src = readFileSync(join(ROOT, "assets", "canvas.js"), "utf8");
  assert.doesNotMatch(src, /invoice|ledger|budget|cash|bank|portfolio|accounting|\$\d/i);
});
