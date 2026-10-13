import { test } from "node:test";
import assert from "node:assert/strict";
import * as mod from "../assets/casefile.js";

const {
  EVIDENCE,
  EXAMPLE_CLAIMS,
  RELATIONS,
  addClaim,
  attach,
  canAttach,
  claimStatus,
  counts,
  createState,
  detach,
  exampleState,
  isContested,
  selectClaim,
  stageLabel,
  stageState,
  stateFromQuery,
  summary,
} = mod;

test("empty casefile: no claims, nothing selected, label reads empty, 0 verdicts", () => {
  const s = createState();
  assert.equal(s.claims.length, 0);
  assert.equal(s.selected, null);
  assert.equal(stageState(s), "empty");
  assert.equal(stageLabel(s), "empty");
  assert.equal(summary(s).verdicts, 0);
});

test("add claim selects it; blank claim refused", () => {
  const s = createState();
  assert.equal(addClaim(s, "   ").ok, false);
  const r = addClaim(s, "The fence went up first.");
  assert.equal(r.ok, true);
  assert.equal(r.claim.id, "C1");
  assert.equal(s.selected, "C1");
  assert.equal(claimStatus(r.claim), "unlinked");
  assert.equal(stageState(s), "drafting");
});

test("attach needs a selected claim, known evidence and a known relation", () => {
  const s = createState();
  assert.equal(canAttach(s, "E1", "supports"), false, "no claim selected");
  addClaim(s, "A claim.");
  assert.equal(canAttach(s, "E1", "supports"), true);
  assert.equal(canAttach(s, "E9", "supports"), false, "unknown evidence");
  assert.equal(canAttach(s, "E1", "true"), false, "'true' is not a relation");
  assert.deepEqual(RELATIONS, ["supports", "contradicts", "context"]);
});

test("attach → linked; same evidence twice is refused; counts per relation", () => {
  const s = createState();
  addClaim(s, "A claim.");
  const r = attach(s, "E1", "supports");
  assert.equal(r.ok, true);
  assert.equal(claimStatus(r.claim), "linked");
  assert.equal(attach(s, "E1", "context").ok, false, "once per claim");
  attach(s, "E3", "context");
  assert.deepEqual(counts(r.claim), { supports: 1, contradicts: 0, context: 1 });
  assert.equal(stageState(s), "linked");
});

test("supports + contradicts on one claim → contested (a shape, not a ruling)", () => {
  const s = createState();
  addClaim(s, "A claim.");
  attach(s, "E2", "supports");
  assert.equal(isContested(s.claims[0]), false);
  attach(s, "E4", "contradicts");
  assert.equal(isContested(s.claims[0]), true);
  assert.equal(claimStatus(s.claims[0]), "contested");
  assert.equal(summary(s).contested, 1);
  assert.equal(summary(s).verdicts, 0);
});

test("detach the only contradicts → contested drops (hold-out shape)", () => {
  const s = exampleState();
  const contested = s.claims.find(isContested);
  assert.ok(contested);
  const bad = contested.attachments.find((a) => a.relation === "contradicts");
  const r = detach(s, contested.id, bad.evidence);
  assert.equal(r.ok, true);
  assert.equal(isContested(contested), false);
  assert.equal(detach(s, "C99", "E1").ok, false);
});

test("example casefile: three claims linked, one contested, selection on first", () => {
  const s = exampleState();
  assert.equal(s.claims.length, EXAMPLE_CLAIMS.length);
  const sum = summary(s);
  assert.equal(sum.linked, 3);
  assert.equal(sum.contested, 1);
  assert.equal(sum.attachments, 5);
  assert.equal(s.selected, "C1");
  assert.equal(stageLabel(s), "3/3 linked · 1 contested · 0 verdicts");
});

test("selectClaim ignores unknown ids", () => {
  const s = exampleState();
  selectClaim(s, "C2");
  assert.equal(s.selected, "C2");
  selectClaim(s, "nope");
  assert.equal(s.selected, null);
});

test("no truth adjudication: module exports nothing named verdict/true/false/debunk", () => {
  const names = Object.keys(mod).map((n) => n.toLowerCase());
  for (const n of names) {
    assert.doesNotMatch(n, /verdict|truth|istrue|isfalse|debunk|adjudicat|rate/, n);
  }
  assert.equal(summary(exampleState()).verdicts, 0);
  assert.ok(EVIDENCE.length >= 4);
});

test("stateFromQuery: linked / example load the casefile, anything else empty", () => {
  assert.equal(stageState(stateFromQuery("?state=linked")), "linked");
  assert.equal(stageState(stateFromQuery("?state=example")), "linked");
  assert.equal(stageState(stateFromQuery("")), "empty");
  assert.equal(stageState(stateFromQuery("?state=verdict")), "empty");
});
