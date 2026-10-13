// Z03 barge-in: the hit rule and its wiring in pane.html.
const fs = require("fs"); const assert = require("assert");
const html = fs.readFileSync(__dirname + "/pane.html", "utf8");
const src = html.match(/const BARGE = [\s\S]*?function bargeHit\([^)]*\) \{[\s\S]*?\n    \}/)[0];
const { BARGE, bargeHit } = new Function(src + "; return { BARGE, bargeHit };")();
assert.ok(bargeHit(0.2, 0.05, 300), "loud voice over quiet TTS, held -> barge");
assert.ok(!bargeHit(0.2, 0.05, 100), "too short -> no barge");
assert.ok(!bargeHit(0.08, 0.06, 500), "mic only echo-level (below ratio) -> no barge");
assert.ok(!bargeHit(0.02, 0.0, 900), "room noise under floor -> no barge");
assert.ok(/applyConstraints\(\{ echoCancellation: true/.test(html), "mic asks for echo cancellation");
assert.ok(/startBargeWatch\(\);/.test(html) && /pressStop\(\);\s*\n\s*\$\("spoken"\)\.textContent = "Go ahead, I'm listening\."/.test(html), "barge stops speech and listens");
console.log("barge-in rule + wiring ok", BARGE);
