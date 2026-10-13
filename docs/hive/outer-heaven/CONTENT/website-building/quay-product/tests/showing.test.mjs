import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DAYS,
  EXAMPLE_REQUEST,
  LISTINGS,
  MAX_WINDOWS,
  TIMES,
  approve,
  approvedState,
  canRequest,
  emptyState,
  frictionLine,
  parseSlot,
  request,
  requestedState,
  selectListing,
  slotId,
  slotStatus,
  stateFromQuery,
  statusLabel,
  toggleWindow,
} from "../assets/showing.js";

test("empty state: no listing, no windows, label reads no showing requested", () => {
  const s = emptyState();
  assert.equal(s.status, "empty");
  assert.equal(s.listingId, null);
  assert.deepEqual(s.windows, []);
  assert.equal(statusLabel(s), "no showing requested");
  assert.equal(canRequest(s), false);
  assert.match(frictionLine(s), /Phone tag/);
});

test("requested and approved example states are deterministic", () => {
  const r1 = requestedState();
  const r2 = requestedState();
  assert.equal(r1.status, "requested");
  assert.deepEqual(r1.windows, EXAMPLE_REQUEST.windows);
  assert.deepEqual(r2.windows, r1.windows);
  const a = approvedState();
  assert.equal(a.status, "approved");
  assert.equal(a.approved.id, EXAMPLE_REQUEST.windows[0]);
  assert.equal(a.approved.listing.id, EXAMPLE_REQUEST.listingId);
  assert.equal(statusLabel(a), "approved · on the calendar");
  assert.match(frictionLine(a), /Quiet/);
});

test("stateFromQuery: ?state=requested | approved, ?listing preselects, garbage is empty", () => {
  assert.equal(stateFromQuery("?state=requested").status, "requested");
  assert.equal(stateFromQuery("?state=approved").status, "approved");
  assert.equal(stateFromQuery("?state=example").status, "approved");
  assert.equal(stateFromQuery("").status, "empty");
  assert.equal(stateFromQuery("?state=garbage").status, "empty");
  const pre = stateFromQuery("?listing=harbourview-4");
  assert.equal(pre.status, "empty");
  assert.equal(pre.listingId, "harbourview-4");
  assert.equal(stateFromQuery("?listing=nope").listingId, null);
});

test("example interaction: listing → two windows → request → approve ends on the calendar", () => {
  const s = emptyState();
  selectListing(s, LISTINGS[0].id);
  assert.equal(canRequest(s), false, "needs a window");
  toggleWindow(s, slotId("Tue", "12:30"));
  assert.equal(canRequest(s), true, "one window is enough");
  toggleWindow(s, slotId("Thu", "15:00"));
  toggleWindow(s, slotId("Fri", "10:00"));
  assert.equal(s.windows.length, MAX_WINDOWS, "third window refused");
  assert.equal(slotStatus(s, slotId("Tue", "12:30")), "selected");

  const r = request(s, "Sample buyer");
  assert.equal(r.ok, true);
  assert.equal(s.status, "requested");
  assert.equal(statusLabel(s), "requested · awaiting agent approval");
  assert.equal(slotStatus(s, slotId("Tue", "12:30")), "requested");
  assert.equal(toggleWindow(s, slotId("Mon", "10:00")).windows.length, 2, "frozen once requested");
  assert.equal(selectListing(s, LISTINGS[1].id).listingId, LISTINGS[0].id, "listing frozen once requested");

  const a = approve(s, slotId("Thu", "15:00"));
  assert.equal(a.ok, true);
  assert.equal(s.status, "approved");
  assert.equal(s.approved.day, "Thu");
  assert.equal(s.approved.time, "15:00");
  assert.equal(slotStatus(s, slotId("Thu", "15:00")), "approved");
  assert.equal(slotStatus(s, slotId("Tue", "12:30")), "requested", "the unpicked offer stays visible as offered");
  assert.equal(approve(s).ok, false, "second approve refused");
});

test("refusals: request without listing, approve without request, approve an un-offered window", () => {
  const s = emptyState();
  toggleWindow(s, slotId("Mon", "10:00"));
  assert.equal(request(s).ok, false);
  assert.equal(approve(s).ok, false);
  selectListing(s, LISTINGS[2].id);
  request(s);
  assert.equal(approve(s, slotId("Sat", "17:30")).ok, false);
  assert.equal(s.status, "requested");
});

test("toggle removes an offered window; unknown slot ids are ignored", () => {
  const s = emptyState();
  const id = slotId("Wed", "17:30");
  toggleWindow(s, id);
  toggleWindow(s, id);
  assert.deepEqual(s.windows, []);
  toggleWindow(s, "Nope-0000");
  toggleWindow(s, "Mon-9999");
  assert.deepEqual(s.windows, []);
  assert.equal(parseSlot("Mon-1000").time, "10:00");
  assert.equal(parseSlot("Sun-1000"), null);
});

test("blank buyer name falls back to Sample buyer; grid dimensions are fixed", () => {
  const s = emptyState();
  selectListing(s, LISTINGS[0].id);
  toggleWindow(s, slotId("Mon", "10:00"));
  request(s, "   ");
  assert.equal(s.name, "Sample buyer");
  assert.equal(DAYS.length, 6);
  assert.equal(TIMES.length, 4);
});
