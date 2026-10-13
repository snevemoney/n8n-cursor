import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DAYS,
  EXAMPLE_CONFIRMED,
  TIMES,
  calendarLabel,
  confirm,
  confirmedCount,
  emptyState,
  exampleState,
  isEmpty,
  select,
  slotId,
  stateFromQuery,
} from "../assets/booking.js";

test("empty state: every slot open, label reads empty", () => {
  const s = emptyState();
  assert.equal(s.slots.size, DAYS.length * TIMES.length);
  assert.equal(confirmedCount(s), 0);
  assert.equal(isEmpty(s), true);
  assert.equal(calendarLabel(s), "empty");
  for (const slot of s.slots.values()) assert.equal(slot.status, "open");
});

test("example state: deterministic confirmed days, label reads on the calendar", () => {
  const a = exampleState();
  const b = exampleState();
  assert.equal(confirmedCount(a), EXAMPLE_CONFIRMED.length);
  assert.equal(calendarLabel(a), "on the calendar");
  for (const c of EXAMPLE_CONFIRMED) {
    assert.equal(a.slots.get(slotId(c.day, c.time)).status, "confirmed");
    assert.equal(b.slots.get(slotId(c.day, c.time)).status, "confirmed");
  }
});

test("stateFromQuery: ?state=confirmed loads example, anything else is empty", () => {
  assert.equal(isEmpty(stateFromQuery("?state=confirmed")), false);
  assert.equal(isEmpty(stateFromQuery("?state=example")), false);
  assert.equal(isEmpty(stateFromQuery("")), true);
  assert.equal(isEmpty(stateFromQuery("?state=garbage")), true);
});

test("example booking interaction: select → confirm ends visibly confirmed", () => {
  const s = emptyState();
  const id = slotId("Tue", "18:30");

  select(s, id);
  assert.equal(s.selected, id);

  const r = confirm(s, "Sample member");
  assert.equal(r.ok, true);
  assert.equal(r.slot.day, "Tue");
  assert.equal(r.slot.time, "18:30");
  assert.equal(s.slots.get(id).status, "confirmed");
  assert.equal(s.slots.get(id).member, "Sample member");
  assert.equal(s.selected, null);
  assert.equal(s.lastConfirmed, r.slot);
  assert.equal(calendarLabel(s), "on the calendar");
  assert.equal(confirmedCount(s), 1);
});

test("confirm without a selection is refused", () => {
  const s = emptyState();
  const r = confirm(s);
  assert.equal(r.ok, false);
  assert.equal(confirmedCount(s), 0);
});

test("a confirmed slot cannot be selected or confirmed twice", () => {
  const s = exampleState();
  const taken = slotId(EXAMPLE_CONFIRMED[0].day, EXAMPLE_CONFIRMED[0].time);
  select(s, taken);
  assert.equal(s.selected, null);
  const before = confirmedCount(s);
  const r = confirm(s);
  assert.equal(r.ok, false);
  assert.equal(confirmedCount(s), before);
});

test("blank member name falls back to Sample member", () => {
  const s = emptyState();
  select(s, slotId("Mon", "06:00"));
  const r = confirm(s, "   ");
  assert.equal(r.ok, true);
  assert.equal(r.slot.member, "Sample member");
});

test("unknown slot id is ignored", () => {
  const s = emptyState();
  select(s, "Nope-0000");
  assert.equal(s.selected, null);
});
