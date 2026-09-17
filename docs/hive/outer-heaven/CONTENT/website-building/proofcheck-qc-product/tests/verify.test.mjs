import { test } from "node:test";
import assert from "node:assert/strict";
import {
  EXAMPLE_DRAFT,
  EXAMPLE_DRAFT_CITED,
  EXAMPLE_SOURCES,
  attachSource,
  canVerify,
  cite,
  createState,
  detachSource,
  exampleState,
  flaggedState,
  gateLabel,
  setDraft,
  splitClaims,
  stageState,
  stateFromQuery,
  verifiedState,
  verify,
  words,
  wordsChanged,
} from "../assets/verify.js";

test("empty state: no sources, blank draft, cannot verify, label reads empty", () => {
  const s = createState();
  assert.equal(s.sources.size, 0);
  assert.equal(s.draft, "");
  assert.equal(canVerify(s), false);
  assert.equal(stageState(s), "empty");
  assert.equal(gateLabel(s), "empty");
  assert.equal(verify(s).ok, false);
});

test("Verify Now needs both a source and a draft", () => {
  const s = createState();
  setDraft(s, "A claim [S1].");
  assert.equal(canVerify(s), false);
  attachSource(s, "S1");
  assert.equal(canVerify(s), true);
  assert.equal(stageState(s), "ready");
  setDraft(s, "   ");
  assert.equal(canVerify(s), false);
});

test("unknown source ids are ignored on attach", () => {
  const s = createState();
  attachSource(s, "S9");
  assert.equal(s.sources.size, 0);
});

test("example draft splits into three claims, third uncited, gate closed", () => {
  assert.equal(splitClaims(EXAMPLE_DRAFT).length, 3);
  const s = flaggedState();
  assert.equal(s.report.claims.length, 3);
  assert.equal(s.report.uncited, 1);
  assert.equal(s.report.claims[2].status, "uncited");
  assert.equal(s.report.gate, "closed");
  assert.equal(stageState(s), "closed");
  assert.equal(gateLabel(s), "closed · 1 uncited");
});

test("cite the flagged claim → words unchanged → gate opens", () => {
  const s = flaggedState();
  const r = cite(s, 2, "S3");
  assert.equal(r.ok, true);
  assert.equal(r.report.uncited, 0);
  assert.equal(r.report.gate, "open");
  assert.equal(r.report.wordsChanged, 0);
  assert.equal(s.draft, EXAMPLE_DRAFT_CITED);
  assert.equal(stageState(s), "verified");
  assert.equal(gateLabel(s), "open · voice kept");
});

test("citing a source that is not attached, or twice, is refused", () => {
  const s = flaggedState();
  assert.equal(cite(s, 2, "S4").ok, false);
  assert.equal(cite(s, 0, "S1").ok, false, "already cited");
  assert.equal(cite(s, 7, "S1").ok, false, "no such claim");
  const fresh = exampleState();
  assert.equal(cite(fresh, 2, "S3").ok, false, "verify first");
});

test("a claim citing a source you did not attach counts as uncited (hold-out shape)", () => {
  const s = createState();
  attachSource(s, "S1");
  setDraft(s, "Fine [S1]. Points elsewhere [S9].");
  const r = verify(s);
  assert.equal(r.ok, true);
  assert.equal(r.report.uncited, 1);
  assert.deepEqual(r.report.claims[1].missing, ["S9"]);
  assert.equal(r.report.gate, "closed");
});

test("detaching a source after verifying closes the gate again", () => {
  const s = verifiedState();
  assert.equal(s.report.gate, "open");
  detachSource(s, "S3");
  verify(s);
  assert.equal(s.report.gate, "closed");
  assert.equal(s.report.uncited, 1);
});

test("voice meter: markers and punctuation are not words; edits count", () => {
  assert.deepEqual(words("Hello, world [S1]."), ["hello", "world"]);
  assert.equal(wordsChanged("we open at seven", "We open at seven [S2]."), 0);
  assert.equal(wordsChanged("we open at seven", "We open at seven sharp."), 1);
  const s = flaggedState();
  setDraft(s, s.draft.replace("coffee", "espresso"));
  verify(s);
  assert.equal(s.report.wordsChanged, 1);
});

test("stateFromQuery: verified, flagged, example, else empty", () => {
  assert.equal(stateFromQuery("?state=verified").report.gate, "open");
  assert.equal(stateFromQuery("?state=flagged").report.gate, "closed");
  const ex = stateFromQuery("?state=example");
  assert.equal(ex.report, null);
  assert.equal(ex.sources.size, EXAMPLE_SOURCES.length);
  assert.equal(stageState(stateFromQuery("")), "empty");
  assert.equal(stageState(stateFromQuery("?state=garbage")), "empty");
});
