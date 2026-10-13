import { test } from "node:test";
import assert from "node:assert/strict";
import {
  EXAMPLE_ANSWERS,
  LOOKING_FOR,
  REFERENCE,
  REFERRAL,
  STEPS,
  TIMELINE,
  back,
  emptyState,
  frictionLine,
  next,
  qualify,
  receivedState,
  setAnswer,
  stateFromQuery,
  statusLabel,
  stepComplete,
  submit,
} from "../assets/apply.js";

test("empty state: step 0, nothing answered, label reads empty", () => {
  const s = emptyState();
  assert.equal(s.step, 0);
  assert.equal(s.status, "empty");
  assert.equal(statusLabel(s), "empty");
  assert.equal(stepComplete(s), false);
  assert.match(frictionLine(s), /Loud Book/);
});

test("received state is deterministic: same reference, same lane every load", () => {
  const a = receivedState();
  const b = receivedState();
  assert.equal(a.status, "received");
  assert.equal(a.reference, REFERENCE);
  assert.equal(b.reference, REFERENCE);
  assert.equal(a.outcome.tier, b.outcome.tier);
  assert.equal(statusLabel(a), "received · private review");
  assert.match(frictionLine(a), /Quiet/);
});

test("stateFromQuery: ?state=received loads the under-review picture, anything else is empty", () => {
  assert.equal(stateFromQuery("?state=received").status, "received");
  assert.equal(stateFromQuery("?state=example").status, "received");
  assert.equal(stateFromQuery("").status, "empty");
  assert.equal(stateFromQuery("?state=garbage").status, "empty");
});

test("cannot advance until the step is complete; cannot submit before review", () => {
  const s = emptyState();
  next(s);
  assert.equal(s.step, 0, "step 0 incomplete → stays");
  setAnswer(s, "name", "Sample applicant");
  next(s);
  assert.equal(s.step, 0, "lookingFor still missing");
  setAnswer(s, "lookingFor", LOOKING_FOR[0]);
  next(s);
  assert.equal(s.step, 1);
  assert.equal(submit(s).ok, false, "not on review step");
  next(s);
  assert.equal(s.step, 1, "fit incomplete → stays");
  setAnswer(s, "referral", REFERRAL[2]);
  setAnswer(s, "timeline", TIMELINE[0]);
  next(s);
  assert.equal(s.step, 2);
  next(s);
  assert.equal(s.step, 2, "no step past review");
  back(s);
  assert.equal(s.step, 1);
});

test("example interaction: about → fit → review → submit ends received with a reference", () => {
  const s = emptyState();
  for (const [k, v] of Object.entries(EXAMPLE_ANSWERS)) setAnswer(s, k, v);
  next(s);
  next(s);
  assert.equal(s.step, STEPS.length - 1);
  const r = submit(s);
  assert.equal(r.ok, true);
  assert.equal(r.reference, REFERENCE);
  assert.equal(s.status, "received");
  assert.equal(s.outcome.tier, "invite");
  assert.equal(submit(s).ok, false, "second submit refused");
  assert.equal(back(s).step, STEPS.length - 1, "received is frozen");
});

test("qualify: three deterministic lanes, no score", () => {
  const referred = qualify({ ...EXAMPLE_ANSWERS });
  assert.equal(referred.tier, "invite");
  const direct = qualify({ ...EXAMPLE_ANSWERS, referral: "Found Ashford directly" });
  assert.equal(direct.tier, "review");
  const exploring = qualify({ ...EXAMPLE_ANSWERS, timeline: "Exploring" });
  assert.equal(exploring.tier, "not-now");
  const unsure = qualify({ ...EXAMPLE_ANSWERS, lookingFor: "Not sure yet" });
  assert.equal(unsure.tier, "not-now");
  for (const lane of [referred, direct, exploring]) {
    assert.ok(lane.headline.length > 0);
    assert.doesNotMatch(lane.line, /\d+%|score/i, "no invented KPI in the lane copy");
  }
});

test("unknown answer keys are ignored; option lists are the only accepted values", () => {
  const s = emptyState();
  setAnswer(s, "nope", "x");
  assert.equal("nope" in s.answers, false);
  setAnswer(s, "name", "Sample");
  setAnswer(s, "lookingFor", "Something not in the list");
  assert.equal(stepComplete(s), false);
});
