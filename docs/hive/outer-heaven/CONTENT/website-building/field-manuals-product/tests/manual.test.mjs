import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MANUALS,
  SECTIONS,
  allDone,
  canOpen,
  createState,
  isDone,
  open,
  pick,
  progress,
  putBack,
  setSection,
  stageLabel,
  stageState,
  stateFromQuery,
  toggleStep,
} from "../assets/manual.js";

test("empty hand on load: nothing held, cannot open, label reads empty", () => {
  const s = createState();
  assert.equal(s.held, null);
  assert.equal(stageState(s), "empty");
  assert.equal(stageLabel(s), "empty · nothing in hand");
  assert.equal(canOpen(s), false);
  assert.equal(open(s).ok, false);
});

test("pick lifts a manual into the hand; unknown id refused", () => {
  const s = createState();
  assert.equal(pick(s, "zzz").ok, false);
  const r = pick(s, "m1");
  assert.equal(r.ok, true);
  assert.equal(s.held, "m1");
  assert.equal(stageState(s), "held");
  assert.equal(stageLabel(s), "held · FM-01");
  assert.equal(canOpen(s), true);
  assert.equal(pick(s, "m1").already, true);
});

test("open shows setup first; sections switch; unknown section ignored", () => {
  const s = createState();
  pick(s, "m2");
  const r = open(s);
  assert.equal(r.ok, true);
  assert.equal(stageState(s), "open");
  assert.equal(s.section, "setup");
  setSection(s, "operate");
  assert.equal(s.section, "operate");
  setSection(s, "appendix");
  assert.equal(s.section, "operate");
  assert.match(stageLabel(s), /^open · FM-02 · operate · operate 0\/4$/);
});

test("tick steps → progress climbs; all ticked; untick drops (hold-out shape)", () => {
  const s = stateFromQuery("?state=open&manual=m1&section=operate");
  const total = MANUALS[0].sections.operate.length;
  assert.deepEqual(progress(s, "operate"), { done: 0, total });
  for (let i = 0; i < total; i += 1) assert.equal(toggleStep(s, "operate", i).ok, true);
  assert.equal(allDone(s, "operate"), true);
  const r = toggleStep(s, "operate", 2);
  assert.equal(r.done, false);
  assert.equal(allDone(s, "operate"), false);
  assert.equal(progress(s, "operate").done, total - 1);
  assert.equal(stageState(s), "open", "stays open");
  assert.equal(toggleStep(s, "operate", 99).ok, false);
});

test("ticks cannot happen on a closed manual, and belong to the manual", () => {
  const s = createState();
  pick(s, "m1");
  assert.equal(toggleStep(s, "setup", 0).ok, false);
  open(s);
  toggleStep(s, "setup", 0);
  assert.equal(isDone(s, "setup", 0), true);
  pick(s, "m2");
  open(s);
  assert.equal(isDone(s, "setup", 0), false, "m2 has its own ticks");
  pick(s, "m1");
  open(s);
  assert.equal(isDone(s, "setup", 0), true, "m1 remembers");
});

test("picking a second manual puts the first back first — one in hand", () => {
  const s = createState();
  pick(s, "m1");
  open(s);
  pick(s, "m3");
  assert.equal(s.held, "m3");
  assert.equal(s.open, false, "second lifts closed");
  assert.equal(stageState(s), "held");
});

test("put back empties the hand", () => {
  const s = stateFromQuery("?state=open&manual=m2");
  putBack(s);
  assert.equal(s.held, null);
  assert.equal(s.open, false);
  assert.equal(stageState(s), "empty");
});

test("stateFromQuery: held / open with manual + section; unknown manual → empty; else empty", () => {
  assert.equal(stageState(stateFromQuery("?state=held&manual=m1")), "held");
  const o = stateFromQuery("?state=open&manual=m2&section=troubleshoot");
  assert.equal(stageState(o), "open");
  assert.equal(o.section, "troubleshoot");
  assert.equal(stageState(stateFromQuery("?state=open&manual=zzz")), "empty");
  assert.equal(stageState(stateFromQuery("")), "empty");
  assert.equal(stateFromQuery("?state=open").held, "m1", "defaults to the first manual");
});

test("every manual has all three sections with at least one step", () => {
  for (const m of MANUALS) {
    for (const sec of SECTIONS) assert.ok(m.sections[sec].length >= 1, `${m.id} ${sec}`);
  }
});
