import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DAYS,
  EXAMPLE_JOB,
  SERVICES,
  WINDOWS,
  back,
  book,
  bookedState,
  canBook,
  emptyState,
  frictionLine,
  jobComplete,
  next,
  parseWindow,
  selectWindow,
  setJob,
  stateFromQuery,
  statusLabel,
  windowId,
} from "../assets/job.js";

test("empty state: step 0, no job, no window, label reads empty · describe the job", () => {
  const s = emptyState();
  assert.equal(s.step, 0);
  assert.equal(s.status, "empty");
  assert.equal(statusLabel(s), "empty · describe the job");
  assert.equal(jobComplete(s), false);
  assert.equal(canBook(s), false);
  assert.match(frictionLine(s), /Phone tag/);
});

test("booked example state is deterministic and carries the job with the visit", () => {
  const a = bookedState();
  const b = bookedState();
  assert.equal(a.status, "booked");
  assert.equal(a.visit.id, EXAMPLE_JOB.window);
  assert.equal(a.visit.job.service, EXAMPLE_JOB.service);
  assert.equal(a.visit.job.address, EXAMPLE_JOB.address);
  assert.equal(b.visit.id, a.visit.id);
  assert.equal(statusLabel(a), "visit booked · on the calendar");
  assert.match(frictionLine(a), /Quiet/);
});

test("stateFromQuery: ?state=booked loads the example, ?service preselects, garbage is empty", () => {
  assert.equal(stateFromQuery("?state=booked").status, "booked");
  assert.equal(stateFromQuery("?state=example").status, "booked");
  assert.equal(stateFromQuery("").status, "empty");
  assert.equal(stateFromQuery("?state=garbage").status, "empty");
  const pre = stateFromQuery("?service=Small+plumbing");
  assert.equal(pre.job.service, "Small plumbing");
  assert.equal(stateFromQuery("?service=Nope").job.service, "");
});

test("example interaction: job → next → window → book ends on the calendar and frozen", () => {
  const s = emptyState();
  next(s);
  assert.equal(s.step, 0, "job incomplete → stays");
  setJob(s, "service", SERVICES[0]);
  next(s);
  assert.equal(s.step, 0, "address still missing");
  setJob(s, "address", "12 Sample Street");
  assert.equal(jobComplete(s), true);
  selectWindow(s, windowId("Tue", "am"));
  assert.equal(s.selected, null, "cannot pick a window before step 2");
  next(s);
  assert.equal(s.step, 1);
  assert.equal(statusLabel(s), "empty · pick a visit");
  assert.equal(canBook(s), false);
  selectWindow(s, windowId("Tue", "am"));
  assert.equal(s.selected, "Tue-am");
  assert.equal(canBook(s), true);
  const r = book(s, "Sample homeowner");
  assert.equal(r.ok, true);
  assert.equal(r.visit.day, "Tue");
  assert.equal(r.visit.window.label, "AM");
  assert.equal(r.visit.job.service, SERVICES[0]);
  assert.equal(s.status, "booked");
  assert.equal(s.selected, null);
  assert.equal(book(s).ok, false, "one visit per load");
  assert.equal(setJob(s, "address", "changed").job.address, "12 Sample Street", "job frozen once booked");
  assert.equal(back(s).step, 1, "steps frozen once booked");
});

test("back returns to the job step; window selection survives a round trip", () => {
  const s = emptyState();
  setJob(s, "service", SERVICES[2]);
  setJob(s, "address", "1 Sample Lane");
  next(s);
  selectWindow(s, windowId("Fri", "pm"));
  back(s);
  assert.equal(s.step, 0);
  next(s);
  assert.equal(s.selected, "Fri-pm");
});

test("refusals and edge cases: unknown service, unknown job key, bad window ids, blank name", () => {
  const s = emptyState();
  setJob(s, "service", "Not a service");
  assert.equal(s.job.service, "");
  setJob(s, "price", "100");
  assert.equal("price" in s.job, false, "no price field exists");
  assert.equal(parseWindow("Sat-am"), null);
  assert.equal(parseWindow("Mon-eve"), null);
  assert.equal(parseWindow("Mon-pm").window.hours, "12–4");
  setJob(s, "service", SERVICES[4]);
  setJob(s, "address", "x");
  next(s);
  selectWindow(s, "Sat-am");
  assert.equal(s.selected, null);
  selectWindow(s, windowId("Mon", "pm"));
  const r = book(s, "  ");
  assert.equal(r.visit.name, "Sample homeowner");
  assert.equal(DAYS.length, 5);
  assert.equal(WINDOWS.length, 2);
});
