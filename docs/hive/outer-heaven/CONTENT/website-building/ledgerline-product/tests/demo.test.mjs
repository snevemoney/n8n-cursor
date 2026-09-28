import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DAYS,
  EXAMPLE_BOOKED,
  ROLES,
  TIMES,
  book,
  bookedState,
  canBook,
  clearSelection,
  emptyState,
  frictionLine,
  select,
  setRole,
  slotId,
  stateFromQuery,
  statusLabel,
} from "../assets/demo.js";

test("empty state: business week, every slot open, label reads empty", () => {
  const s = emptyState();
  assert.equal(DAYS.length, 5);
  assert.equal(s.slots.size, DAYS.length * TIMES.length);
  for (const slot of s.slots.values()) assert.equal(slot.status, "open");
  assert.equal(s.status, "empty");
  assert.equal(statusLabel(s), "empty");
  assert.equal(canBook(s), false);
  assert.match(frictionLine(s), /Feature fog/);
});

test("booked example state is deterministic", () => {
  const a = bookedState();
  const b = bookedState();
  assert.equal(a.status, "booked");
  assert.equal(a.booked.day, EXAMPLE_BOOKED.day);
  assert.equal(a.booked.time, EXAMPLE_BOOKED.time);
  assert.equal(a.booked.role, EXAMPLE_BOOKED.role);
  assert.equal(b.booked.day, a.booked.day);
  assert.equal(statusLabel(a), "demo booked · on the calendar");
  assert.match(frictionLine(a), /Clear/);
});

test("stateFromQuery: ?state=booked loads the example, anything else is empty", () => {
  assert.equal(stateFromQuery("?state=booked").status, "booked");
  assert.equal(stateFromQuery("?state=example").status, "booked");
  assert.equal(stateFromQuery("").status, "empty");
  assert.equal(stateFromQuery("?state=garbage").status, "empty");
});

test("example interaction: select slot → role → book ends booked and frozen", () => {
  const s = emptyState();
  const id = slotId("Wed", "11:00");
  select(s, id);
  assert.equal(s.selected, id);
  assert.equal(canBook(s), false, "role required");
  setRole(s, "Not a role");
  assert.equal(s.role, "");
  setRole(s, ROLES[0]);
  assert.equal(canBook(s), true);
  const r = book(s, "Sample finance lead");
  assert.equal(r.ok, true);
  assert.equal(s.slots.get(id).status, "booked");
  assert.equal(s.booked.name, "Sample finance lead");
  assert.equal(s.booked.length, "30 min · sample");
  assert.equal(s.selected, null);
  assert.equal(book(s).ok, false, "one demo per load");
  assert.equal(select(s, slotId("Mon", "09:00")).selected, null, "frozen once booked");
  assert.equal(setRole(s, ROLES[1]).role, ROLES[0], "role frozen once booked");
});

test("refusals: book without slot or role; clear removes the selection; unknown ids ignored", () => {
  const s = emptyState();
  assert.equal(book(s).ok, false);
  setRole(s, ROLES[2]);
  assert.equal(book(s).ok, false, "still no slot");
  select(s, "Sat-0900");
  assert.equal(s.selected, null);
  select(s, slotId("Fri", "16:00"));
  clearSelection(s);
  assert.equal(s.selected, null);
});

test("blank name falls back to Sample lead", () => {
  const s = emptyState();
  select(s, slotId("Mon", "09:00"));
  setRole(s, ROLES[3]);
  const r = book(s, "   ");
  assert.equal(r.ok, true);
  assert.equal(r.booked.name, "Sample lead");
});
