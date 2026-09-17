import { test } from "node:test";
import assert from "node:assert/strict";
import {
  VOLUMES,
  createState,
  desk,
  isPulled,
  pull,
  pulledCount,
  reshelve,
  reshelveAll,
  stageLabel,
  stageState,
  stateFromQuery,
  toggle,
} from "../assets/shelf.js";

test("eight volumes, each with chapters and a status", () => {
  assert.equal(VOLUMES.length, 8);
  for (const v of VOLUMES) {
    assert.ok(v.chapters.length >= 2, v.id);
    assert.ok(["working", "done"].includes(v.status));
  }
});

test("shelved on load: nothing pulled, desk empty, label reads shelved", () => {
  const s = createState();
  assert.equal(pulledCount(s), 0);
  assert.deepEqual(desk(s), []);
  assert.equal(stageState(s), "empty");
  assert.equal(stageLabel(s), "shelved · nothing pulled");
});

test("pull opens a volume on the desk; twice is refused; unknown id ignored (hold-out shape)", () => {
  const s = createState();
  const r = pull(s, "v3");
  assert.equal(r.ok, true);
  assert.equal(r.volume.numeral, "III");
  assert.equal(isPulled(s, "v3"), true);
  assert.equal(pull(s, "v3").ok, false);
  assert.equal(pull(s, "v9").ok, false);
  assert.equal(pulledCount(s), 1);
  assert.equal(stageState(s), "pulled");
  assert.equal(stageLabel(s), "1 pulled · on the desk");
});

test("pulling more stacks the desk in order; reshelve removes one", () => {
  const s = createState();
  pull(s, "v1");
  pull(s, "v5");
  pull(s, "v2");
  assert.deepEqual(desk(s).map((v) => v.id), ["v1", "v5", "v2"]);
  assert.equal(stageLabel(s), "3 pulled · on the desk");
  assert.equal(reshelve(s, "v5").ok, true);
  assert.deepEqual(desk(s).map((v) => v.id), ["v1", "v2"]);
  assert.equal(reshelve(s, "v5").ok, false, "not on the desk");
});

test("toggle: tapping a pulled spine reshelves it, not duplicates it (hold-out shape)", () => {
  const s = createState();
  assert.equal(toggle(s, "v4").action, "pulled");
  const r = toggle(s, "v4");
  assert.equal(r.action, "reshelved");
  assert.equal(pulledCount(s), 0);
  assert.equal(toggle(s, "v9").ok, false);
});

test("reshelve all clears the desk and reports the count", () => {
  const s = stateFromQuery("?state=pulled&vol=v1,v5");
  assert.equal(pulledCount(s), 2);
  const r = reshelveAll(s);
  assert.equal(r.ok, true);
  assert.equal(r.count, 2);
  assert.equal(stageState(s), "empty");
  assert.equal(reshelveAll(s).ok, false);
});

test("stateFromQuery: pulled&vol lands volumes on the desk; unknown ids skipped; else shelved", () => {
  assert.deepEqual(desk(stateFromQuery("?state=pulled&vol=v3")).map((v) => v.id), ["v3"]);
  assert.deepEqual(desk(stateFromQuery("?state=pulled&vol=v1,v9,v5")).map((v) => v.id), ["v1", "v5"]);
  assert.equal(stateFromQuery("?state=pulled").pulled[0], "v1", "defaults to Vol. I");
  assert.equal(stageState(stateFromQuery("?state=pulled&vol=v9")), "empty");
  assert.equal(stageState(stateFromQuery("")), "empty");
});
