import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  FILTERS,
  PROOFS,
  closeDoor,
  countBy,
  createState,
  openDoor,
  select,
  selected,
  setFilter,
  stageLabel,
  stageState,
  stateFromQuery,
  visible,
} from "../assets/proofs.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("closed on load: no cards visible, filter locked, label reads building mode", () => {
  const s = createState();
  assert.equal(stageState(s), "closed");
  assert.equal(stageLabel(s), "closed · building mode");
  assert.deepEqual(visible(s), []);
  assert.equal(setFilter(s, "graded").ok, false);
  assert.equal(select(s, "p1").ok, false);
});

test("open shows every proof on All; filters narrow; counts match", () => {
  const s = openDoor(createState());
  assert.equal(visible(s).length, PROOFS.length);
  assert.equal(stageLabel(s), `${PROOFS.length} proofs · all · building mode`);
  for (const f of FILTERS) {
    setFilter(s, f);
    assert.equal(visible(s).length, countBy(f), f);
    for (const p of visible(s)) if (f !== "all") assert.equal(p.status, f);
  }
  assert.equal(setFilter(s, "investors").ok, false);
});

test("select toggles a visible proof; hidden proofs cannot be selected", () => {
  const s = openDoor(createState());
  setFilter(s, "graded");
  const g = visible(s)[0];
  assert.equal(select(s, g.id).ok, true);
  assert.equal(selected(s).id, g.id);
  const held = PROOFS.find((p) => p.status === "held");
  assert.equal(select(s, held.id).ok, false, "not under this filter");
  select(s, g.id);
  assert.equal(selected(s), null, "toggle off");
});

test("switching filter drops a selection that is no longer visible", () => {
  const s = stateFromQuery("?state=open&filter=graded&proof=p1");
  assert.equal(selected(s).id, "p1");
  setFilter(s, "held");
  assert.equal(selected(s), null);
});

test("close forgets the filter and selection — next open starts on All (hold-out shape)", () => {
  const s = stateFromQuery("?state=open&filter=held&proof=p5");
  closeDoor(s);
  assert.equal(s.filter, "all");
  assert.equal(s.selected, null);
  openDoor(s);
  assert.equal(visible(s).length, PROOFS.length);
});

test("grade honesty: non-graded proofs are UNFILLED; graded ones say sample", () => {
  for (const p of PROOFS) {
    if (p.status === "graded") assert.match(p.grade, /sample/);
    else assert.equal(p.grade, "UNFILLED");
  }
  assert.ok(PROOFS.some((p) => p.status === "held"), "held proofs exist");
});

test("stateFromQuery: open / filter / proof; closed otherwise", () => {
  const a = stateFromQuery("?state=open&filter=graded");
  assert.equal(a.open, true);
  assert.equal(a.filter, "graded");
  assert.equal(stateFromQuery("?state=open&filter=nope").filter, "all");
  assert.equal(stateFromQuery("?filter=graded").open, false);
  assert.equal(stageState(stateFromQuery("")), "closed");
});

test("not a deck, no live wiring: records carry no pitch words and no URLs", () => {
  const src = readFileSync(join(ROOT, "assets", "proofs.js"), "utf8");
  assert.doesNotMatch(src, /slide|deck|investor|discovery call|book a call|https?:\/\//i);
});
