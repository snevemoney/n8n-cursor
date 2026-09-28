import { test } from "node:test";
import assert from "node:assert/strict";
import {
  LAST,
  SPREADS,
  canNext,
  canPrev,
  clamp,
  close,
  createState,
  currentSpread,
  goTo,
  isEnd,
  next,
  open,
  positionLabel,
  prev,
  stageState,
  stateFromQuery,
} from "../assets/pages.js";

test("closed on load: cover only, prev disabled, label reads closed", () => {
  const s = createState();
  assert.equal(s.open, false);
  assert.equal(stageState(s), "closed");
  assert.equal(positionLabel(s), "closed · cover");
  assert.equal(currentSpread(s), null);
  assert.equal(canPrev(s), false);
  assert.equal(canNext(s), true, "next opens the book");
  assert.equal(prev(s).ok, false);
});

test("open → spread 1; next turns forward; last spread is the end", () => {
  const s = createState();
  open(s);
  assert.equal(stageState(s), "open");
  assert.equal(positionLabel(s), `spread 1 / ${SPREADS.length}`);
  assert.equal(currentSpread(s).right.title, "I · Why a book");
  let turns = 0;
  while (next(s).ok) turns += 1;
  assert.equal(turns, LAST);
  assert.equal(isEnd(s), true);
  assert.equal(stageState(s), "end");
  assert.equal(positionLabel(s), `spread ${SPREADS.length} / ${SPREADS.length} · end`);
  assert.equal(next(s).ok, false, "no wrap (hold-out shape)");
  assert.equal(s.direction, "forward");
});

test("prev on the first spread closes the book rather than erroring (hold-out shape)", () => {
  const s = createState();
  open(s);
  const r = prev(s);
  assert.equal(r.ok, true);
  assert.equal(r.closed, true);
  assert.equal(s.open, false);
  assert.equal(s.direction, "backward");
});

test("next on the cover opens the book", () => {
  const s = createState();
  const r = next(s);
  assert.equal(r.ok, true);
  assert.equal(s.open, true);
  assert.equal(s.page, 0);
});

test("goTo clamps: page 99 lands on the last spread, negatives on the first", () => {
  assert.equal(clamp(99), LAST);
  assert.equal(clamp(-4), 0);
  assert.equal(clamp(NaN), 0);
  const s = createState();
  goTo(s, 99);
  assert.equal(s.page, LAST);
  assert.equal(isEnd(s), true);
  goTo(s, 1);
  assert.equal(s.direction, "backward");
});

test("stateFromQuery: open&page=2 lands on spread 2, end lands on the colophon, else closed", () => {
  const a = stateFromQuery("?state=open&page=2");
  assert.equal(a.open, true);
  assert.equal(a.page, 1);
  assert.equal(isEnd(stateFromQuery("?state=end")), true);
  assert.equal(stateFromQuery("?state=open&page=99").page, LAST);
  assert.equal(stateFromQuery("").open, false);
  assert.equal(stateFromQuery("?state=garbage").open, false);
});

test("close resets to the cover", () => {
  const s = stateFromQuery("?state=end");
  close(s);
  assert.equal(s.open, false);
  assert.equal(s.page, 0);
});

test("every spread has a titled left and right page", () => {
  for (const sp of SPREADS) {
    assert.ok(sp.left.title && sp.right.title);
    assert.ok(sp.left.lines.length && sp.right.lines.length);
  }
  assert.equal(SPREADS.at(-1).right.kind, "end");
});
