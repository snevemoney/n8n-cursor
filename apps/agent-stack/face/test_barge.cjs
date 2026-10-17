// Z03 barge-in: the hit rule and its wiring in pane.html.
const fs = require("fs"); const assert = require("assert");
const html = fs.readFileSync(__dirname + "/pane.html", "utf8");
const src = html.match(/const BARGE = [\s\S]*?function bargeHit\([^)]*\) \{[\s\S]*?\n    \}/)[0];
const { BARGE, bargeHit } = new Function(src + "; return { BARGE, bargeHit };")();
assert.ok(bargeHit(0.2, 0.05, 300), "loud voice over quiet TTS, held -> barge");
assert.ok(!bargeHit(0.2, 0.05, 100), "too short -> no barge");
assert.ok(!bargeHit(0.08, 0.06, 500), "mic only echo-level (below ratio) -> no barge");
assert.ok(bargeHit(0.09, 0.03, 300), "his voice over the mic's own bleed (not the raw TTS level) -> barge");
assert.ok(/scheduleRestart\(RESTART_MIN\);  \/\/ listen at once/.test(html), "after a barge it listens at once");
assert.ok(/else if \(finishTimer && \(t \|\| ""\)\.trim\(\)\) holdFinish\(\);/.test(html), "new words restart the pause clock");
assert.ok(!bargeHit(0.002, 0.0, 900), "room noise under floor -> no barge");
assert.ok(bargeHit(0.01, 0.0005, 300), "live 10-17: his voice (~0.01) over the real bleed (~0.0005) -> barge");
assert.ok(!bargeHit(0.0006, 0.0005, 900), "Jarvis's own bleed alone -> no barge");
assert.ok(/applyConstraints\(\{ echoCancellation: true/.test(html), "mic asks for echo cancellation");
assert.ok(/startBargeWatch\(\);/.test(html) && /pressStop\(\);\s*\n(?:\s*bargeBeacon\([^)]*\);\s*\n)?\s*\$\("spoken"\)\.textContent = "Go ahead, I'm listening\."/.test(html), "barge stops speech and listens");
// Evens 10-17: ducking stage — voice over the bleed ducks Jarvis before the full barge rule fires
const dsrc = html.match(/function duckHit\([^)]*\) \{[\s\S]*?\n    \}/)[0];
const { duckHit } = new Function(src + "; " + dsrc + "; return { duckHit };")();
assert.ok(duckHit(0.05, 0.03), "voice a bit over the bleed -> duck");
assert.ok(!duckHit(0.02, 0.01), "under the floor -> no duck");
assert.ok(/duckTts\(true\)/.test(html) && /duckTts\(false\)/.test(html), "ducks and releases");
assert.ok(/startBargeWatch\(\);  \/\/ Evens 10-17/.test(html), "watch (re)starts when speech starts");
assert.ok(BARGE.floor <= 0.005, "floor is on the echo-cancelled mic's real scale (beacon 10-17)");
console.log("barge-in rule + wiring ok", BARGE);
// Z12 reflex 'finished' rule in the pane matches brain/reflex5.TRAIL_RE.
const mid = html.match(/const MID_RE = (\/.*\/i);/)[1];
const MID = eval(mid);
for (const t of ["so I was thinking and", "open the, ", "um", "check my"]) assert.ok(MID.test(t.trim()), t);
for (const t of ["open my notes", "what time is it?", "stop"]) assert.ok(!MID.test(t), t);
assert.ok(/midSentence\(pendingHeard\) \? FINISH_MS \+ MID_SENTENCE_EXTRA_MS : FINISH_MS/.test(html));
console.log("reflex finished rule ok");
