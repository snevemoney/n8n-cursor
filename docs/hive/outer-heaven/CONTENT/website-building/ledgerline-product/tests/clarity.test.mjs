import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CLEAR_LINES,
  CLEAR_MAX_WORDS,
  FOG_FEATURES,
  MODES,
  clarityFacts,
  modeCopy,
  modeFromQuery,
  toggleMode,
  wordCount,
} from "../assets/clarity.js";

test("the three lines are exactly three, under the word cap, and say what / who / not", () => {
  assert.equal(CLEAR_LINES.length, 3);
  const f = clarityFacts();
  assert.equal(f.words, wordCount(CLEAR_LINES));
  assert.ok(f.words <= CLEAR_MAX_WORDS, `${f.words} words must be ≤ ${CLEAR_MAX_WORDS}`);
  assert.equal(f.underMax, true);
  assert.match(CLEAR_LINES[0], /^Ledgerline /, "line 1 names the product and what it does");
  assert.match(CLEAR_LINES[1], /^For /, "line 2 names who it is for");
  assert.match(CLEAR_LINES[2], /^Not /, "line 3 names what it is not");
  for (const line of CLEAR_LINES) {
    assert.doesNotMatch(line, /\d+%|\d+x|faster|save/i, "no invented KPI in the clarity copy");
  }
});

test("the fog is a real contrast: many feature tabs, none of them a sentence about the product", () => {
  assert.ok(FOG_FEATURES.length >= 20);
  assert.equal(new Set(FOG_FEATURES).size, FOG_FEATURES.length, "no duplicate tabs");
  for (const f of FOG_FEATURES) assert.doesNotMatch(f, /\.$/, "tabs are labels, not sentences");
  assert.equal(clarityFacts().fogItems, FOG_FEATURES.length);
});

test("mode: defaults to clear, ?mode=fog opens on the fog, toggle flips, garbage is clear", () => {
  assert.deepEqual(MODES, ["clear", "fog"]);
  assert.equal(modeFromQuery(""), "clear");
  assert.equal(modeFromQuery("?mode=fog"), "fog");
  assert.equal(modeFromQuery("?mode=garbage"), "clear");
  assert.equal(toggleMode("clear"), "fog");
  assert.equal(toggleMode("fog"), "clear");
});

test("mode copy reports measured facts, not claims", () => {
  const clear = modeCopy("clear");
  assert.match(clear.count, new RegExp(`^3 lines · ${wordCount(CLEAR_LINES)} words · under ${CLEAR_MAX_WORDS}$`));
  assert.match(clear.button, /fog/i);
  const fog = modeCopy("fog");
  assert.match(fog.count, new RegExp(`^${FOG_FEATURES.length} feature tabs`));
  assert.match(fog.button, /three lines/i);
});

test("wordCount is whitespace-safe", () => {
  assert.equal(wordCount(["  a  b ", "c"]), 3);
  assert.equal(wordCount([]), 0);
  assert.equal(wordCount(["   "]), 0);
});
