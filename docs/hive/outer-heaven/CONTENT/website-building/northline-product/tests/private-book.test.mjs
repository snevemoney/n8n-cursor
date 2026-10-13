import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DAYS,
  EXAMPLE,
  SLA,
  TIMES,
  VISIT_TYPES,
  advance,
  canSubmit,
  confirmedState,
  emptyState,
  frictionLine,
  parseSlot,
  receivedState,
  select,
  setForm,
  setVisitType,
  slotId,
  slotStatus,
  stateFromQuery,
  statusLabel,
  submit,
} from "../assets/private-book.js";

test("empty state: no slot, no form, stage -1, label reads empty · private", () => {
  const s = emptyState();
  assert.equal(s.status, "empty");
  assert.equal(s.stage, -1);
  assert.equal(statusLabel(s), "empty · private");
  assert.equal(canSubmit(s), false);
  assert.match(frictionLine(s), /Waitlist chaos/);
});

test("received and confirmed example states are deterministic", () => {
  const r1 = receivedState();
  const r2 = receivedState();
  assert.equal(r1.status, "received");
  assert.equal(r1.stage, 0);
  assert.equal(r1.booking.id, EXAMPLE.slot);
  assert.equal(r2.booking.id, r1.booking.id);
  assert.equal(statusLabel(r1), `form received · SLA ${SLA.label}`);
  const c = confirmedState();
  assert.equal(c.status, "confirmed");
  assert.equal(c.stage, SLA.stages.length - 1);
  assert.equal(statusLabel(c), "slot confirmed · private");
  assert.equal(slotStatus(c, EXAMPLE.slot), "confirmed");
  assert.match(frictionLine(c), /Private/);
});

test("stateFromQuery: ?state=received | review | confirmed, garbage is empty", () => {
  assert.equal(stateFromQuery("?state=received").status, "received");
  assert.equal(stateFromQuery("?state=review").status, "review");
  assert.equal(stateFromQuery("?state=confirmed").status, "confirmed");
  assert.equal(stateFromQuery("?state=example").status, "confirmed");
  assert.equal(stateFromQuery("").status, "empty");
  assert.equal(stateFromQuery("?state=garbage").status, "empty");
});

test("example interaction: slot → visit type → form → consent → submit → advance twice ends confirmed", () => {
  const s = emptyState();
  const id = slotId("Wed", "10:00");
  select(s, id);
  assert.equal(canSubmit(s), false, "visit type required");
  setVisitType(s, "Not a type");
  assert.equal(s.visitType, "");
  setVisitType(s, VISIT_TYPES[0]);
  setForm(s, "name", "Sample patient");
  assert.equal(canSubmit(s), false, "consent required");
  setForm(s, "consent", true);
  assert.equal(canSubmit(s), true);

  const r = submit(s);
  assert.equal(r.ok, true);
  assert.equal(r.stage.id, "received");
  assert.equal(s.status, "received");
  assert.equal(slotStatus(s, id), "requested");
  assert.equal(submit(s).ok, false, "second submit refused");
  assert.equal(select(s, slotId("Mon", "08:30")).selected, id, "slot frozen once submitted");
  assert.equal(setForm(s, "name", "changed").form.name, "Sample patient", "form frozen once submitted");

  const a1 = advance(s);
  assert.equal(a1.ok, true);
  assert.equal(s.status, "review");
  assert.equal(statusLabel(s), `in clinical review · SLA ${SLA.label}`);
  assert.equal(slotStatus(s, id), "requested");

  const a2 = advance(s);
  assert.equal(a2.stage.id, "confirmed");
  assert.equal(s.status, "confirmed");
  assert.equal(slotStatus(s, id), "confirmed");
  assert.equal(advance(s).ok, false, "nothing past confirmed");
});

test("refusals: advance before submit, submit without slot / name / consent, bad slot ids", () => {
  const s = emptyState();
  assert.equal(advance(s).ok, false);
  setVisitType(s, VISIT_TYPES[1]);
  setForm(s, "name", "Sample patient");
  setForm(s, "consent", true);
  assert.equal(submit(s).ok, false, "no slot");
  select(s, "Sat-0830");
  select(s, "Mon-0000");
  assert.equal(s.selected, null);
  select(s, slotId("Fri", "15:00"));
  setForm(s, "name", "   ");
  assert.equal(canSubmit(s), false, "blank name");
  setForm(s, "name", "Sample patient");
  setForm(s, "consent", false);
  assert.equal(canSubmit(s), false, "consent withdrawn");
  setForm(s, "nope", "x");
  assert.equal("nope" in s.form, false);
  assert.equal(parseSlot("Mon-0830").time, "08:30");
});

test("the SLA is a labelled sample promise with three stages, not a measured KPI", () => {
  assert.equal(SLA.stages.length, 3);
  assert.deepEqual(SLA.stages.map((st) => st.id), ["received", "review", "confirmed"]);
  assert.match(SLA.label, /sample/i);
  for (const st of SLA.stages) assert.doesNotMatch(st.line, /\d+%|average|avg\.?|typically/i);
  assert.equal(DAYS.length, 5);
  assert.equal(TIMES.length, 4);
});
