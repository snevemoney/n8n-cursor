import { test } from "node:test";
import assert from "node:assert/strict";
import {
  LAST_REACHABLE,
  STATIONS,
  advance,
  back,
  canAdvance,
  canBack,
  createState,
  current,
  holdoutsRevealed,
  isComplete,
  loadSpec,
  stageLabel,
  stageState,
  stateFromQuery,
  stationStatus,
} from "../assets/line.js";

test("six stations, Ship is locked, line ends one before it", () => {
  assert.equal(STATIONS.length, 6);
  assert.equal(STATIONS.at(-1).id, "ship");
  assert.equal(STATIONS.at(-1).locked, true);
  assert.equal(LAST_REACHABLE, 4);
  assert.equal(STATIONS[LAST_REACHABLE].id, "hold");
});

test("empty line: nothing loaded, cannot advance, every bench dark except the lock", () => {
  const s = createState();
  assert.equal(stageState(s), "empty");
  assert.equal(stageLabel(s), "empty · no run");
  assert.equal(canAdvance(s), false);
  assert.equal(advance(s).ok, false);
  assert.equal(current(s), null);
  for (let i = 0; i < 5; i += 1) assert.equal(stationStatus(s, i), "dark");
  assert.equal(stationStatus(s, 5), "locked");
});

test("load spec lights station 1; advance walks to HITL hold and stops", () => {
  const s = loadSpec(createState());
  assert.equal(stationStatus(s, 0), "active");
  assert.equal(stageLabel(s), "running · 1/5 · Spec");
  let steps = 0;
  while (advance(s).ok) steps += 1;
  assert.equal(steps, 4);
  assert.equal(current(s).id, "hold");
  assert.equal(isComplete(s), true);
  assert.equal(stageState(s), "complete");
  assert.equal(stageLabel(s), "complete · held at HITL");
  assert.equal(advance(s).ok, false, "Ship stays locked");
  assert.equal(stationStatus(s, 5), "locked");
  assert.equal(stationStatus(s, 0), "done");
});

test("hold-outs stay sealed until Grade", () => {
  const s = loadSpec(createState());
  advance(s); // holdouts
  assert.equal(current(s).id, "holdouts");
  assert.equal(holdoutsRevealed(s), false);
  advance(s); // build
  assert.equal(holdoutsRevealed(s), false);
  advance(s); // grade
  assert.equal(current(s).id, "grade");
  assert.equal(holdoutsRevealed(s), true);
});

test("back from HITL hold drops completion, keeps hold-outs revealed (hold-out shape)", () => {
  const s = stateFromQuery("?state=complete");
  assert.equal(isComplete(s), true);
  const r = back(s);
  assert.equal(r.ok, true);
  assert.equal(r.station.id, "grade");
  assert.equal(isComplete(s), false);
  assert.equal(holdoutsRevealed(s), true);
  while (back(s).ok);
  assert.equal(s.station, 0);
  assert.equal(canBack(s), false);
});

test("stateFromQuery: complete, a station id, locked id falls back to spec, empty otherwise", () => {
  assert.equal(isComplete(stateFromQuery("?state=complete")), true);
  assert.equal(current(stateFromQuery("?state=grade")).id, "grade");
  assert.equal(current(stateFromQuery("?state=ship")).id, "spec", "locked station not reachable by query");
  assert.equal(stageState(stateFromQuery("")), "empty");
});

test("the sample GRADE stamp is labelled sample and never reads as this slice's grade", () => {
  const grade = STATIONS.find((s) => s.id === "grade");
  assert.match(grade.lines.join(" "), /sample/i);
  assert.match(grade.lines.join(" "), /not this slice/i);
});
