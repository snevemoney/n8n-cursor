import { test } from "node:test";
import assert from "node:assert/strict";
import {
  COHORTS,
  EXAMPLE_HELD,
  EXAMPLE_WAITLISTED,
  SEATS_PER_COHORT,
  canRequest,
  cohort,
  emptyState,
  frictionLine,
  heldState,
  isFull,
  openSeats,
  outcomeCopy,
  requestSeat,
  seatStatus,
  selectCohort,
  selectSeat,
  stateFromQuery,
  statusLabel,
  waitlistedState,
} from "../assets/seat.js";

test("empty state: autumn cohort, open seats counted from the map, nothing requested", () => {
  const s = emptyState();
  assert.equal(s.status, "empty");
  assert.equal(s.cohortId, "autumn");
  const c = cohort("autumn");
  assert.equal(isFull(c), false);
  assert.deepEqual(openSeats(c), [4, 7, 12]);
  assert.equal(statusLabel(s), "3 seats open");
  assert.equal(canRequest(s), false);
  assert.match(frictionLine(s), /Funnel spam/);
});

test("held and waitlisted example states are deterministic", () => {
  const h1 = heldState();
  const h2 = heldState();
  assert.equal(h1.status, "held");
  assert.equal(h1.result.seat, EXAMPLE_HELD.seat);
  assert.equal(h2.result.seat, h1.result.seat);
  assert.equal(statusLabel(h1), `seat ${EXAMPLE_HELD.seat} held`);
  const w = waitlistedState();
  assert.equal(w.status, "waitlisted");
  assert.equal(w.cohortId, EXAMPLE_WAITLISTED.cohortId);
  assert.equal(w.result.position, cohort("winter").waitlist.length + 1);
  assert.equal(statusLabel(w), `waitlist · place ${w.result.position}`);
  assert.match(frictionLine(w), /No drip/);
});

test("stateFromQuery: ?state=held | waitlisted, ?cohort preselects, garbage is empty", () => {
  assert.equal(stateFromQuery("?state=held").status, "held");
  assert.equal(stateFromQuery("?state=waitlisted").status, "waitlisted");
  assert.equal(stateFromQuery("?state=example").status, "held");
  assert.equal(stateFromQuery("").status, "empty");
  assert.equal(stateFromQuery("?state=garbage").status, "empty");
  const pre = stateFromQuery("?cohort=winter");
  assert.equal(pre.status, "empty");
  assert.equal(pre.cohortId, "winter");
  assert.equal(stateFromQuery("?cohort=nope").cohortId, "autumn");
});

test("example interaction: open cohort → pick seat → request ends held", () => {
  const s = emptyState();
  selectSeat(s, 1);
  assert.equal(s.selectedSeat, null, "taken seat cannot be picked");
  selectSeat(s, 7);
  assert.equal(s.selectedSeat, 7);
  assert.equal(seatStatus(s, 7), "selected");
  assert.equal(canRequest(s), true);
  const r = requestSeat(s, "Sample maker");
  assert.equal(r.ok, true);
  assert.equal(r.result.kind, "held");
  assert.equal(r.result.seat, 7);
  assert.equal(s.status, "held");
  assert.equal(seatStatus(s, 7), "held");
  assert.equal(s.selectedSeat, null);
  assert.match(outcomeCopy(s).headline, /Seat 7 held/);
  assert.equal(requestSeat(s).ok, false, "second request refused");
  assert.equal(selectSeat(s, 12).selectedSeat, null, "frozen once held");
  assert.equal(selectCohort(s, "winter").cohortId, "autumn", "cohort frozen once held");
});

test("full cohort: no seat needed, request lands a numbered waitlist place", () => {
  const s = emptyState();
  selectCohort(s, "winter");
  const c = cohort("winter");
  assert.equal(isFull(c), true);
  assert.deepEqual(openSeats(c), []);
  assert.equal(statusLabel(s), "cohort full · waitlist open");
  assert.equal(canRequest(s), true, "waitlist needs no seat");
  selectSeat(s, 3);
  assert.equal(s.selectedSeat, null, "every chair is taken");
  const r = requestSeat(s, "Sample maker");
  assert.equal(r.ok, true);
  assert.equal(r.result.kind, "waitlisted");
  assert.equal(r.result.position, c.waitlist.length + 1);
  assert.match(outcomeCopy(s).headline, /Waitlist · place 3/);
});

test("refusals and edge cases: request without seat, out-of-range seat, unknown cohort, blank name", () => {
  const s = emptyState();
  assert.equal(requestSeat(s).ok, false);
  selectSeat(s, 0);
  selectSeat(s, SEATS_PER_COHORT + 1);
  selectSeat(s, 4.5);
  assert.equal(s.selectedSeat, null);
  selectCohort(s, "spring");
  assert.equal(s.cohortId, "autumn");
  selectSeat(s, 12);
  requestSeat(s, "   ");
  assert.equal(s.result.name, "Sample maker");
});

test("cohort data is honest: twelve chairs each, taken lists inside range, no duplicates", () => {
  for (const c of COHORTS) {
    assert.ok(c.taken.length <= SEATS_PER_COHORT);
    assert.equal(new Set(c.taken).size, c.taken.length);
    for (const n of c.taken) assert.ok(n >= 1 && n <= SEATS_PER_COHORT);
    assert.equal(openSeats(c).length + c.taken.length, SEATS_PER_COHORT);
  }
});
