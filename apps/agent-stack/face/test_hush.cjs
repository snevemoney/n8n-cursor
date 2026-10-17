/** Z75 hush: "quiet" stops the voice only (no turn, the job keeps going); "stop" still cancels. */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const html = fs.readFileSync(path.join(__dirname, 'pane.html'), 'utf8');
const s1 = html.indexOf('    const STOP_RE'); const e1 = html.indexOf('\n', html.indexOf('    function hush()', s1) + 140);
const block = html.slice(s1, html.indexOf('    }', html.indexOf('    function hush()')) + 6);
const hs = html.indexOf('    function handleHeard(raw)'); const he = html.indexOf('\n    }\n', hs) + 6;
const calls = { stop: 0, turns: [] };
const spoken = { textContent: '' };
const ctx = { stopSpeech: () => { calls.stop += 1; }, $: () => spoken, turn: (u) => calls.turns.push(u), greet: () => {},
  isMouthEcho: () => false, WAKE_RE: /^(?:hey\s+)?jarvis[,.]?\s*/i, YES_RE: /^yes\b/i, state: {} };
vm.createContext(ctx);
vm.runInContext(block + '\n' + html.slice(hs, he), ctx);
for (const w of ['quiet', 'Jarvis, hush.', 'shh', 'be quiet', 'enough!']) {
  vm.runInContext('handleHeard(' + JSON.stringify(w) + ')', ctx);
}
assert.strictEqual(calls.stop, 5, 'each hush stops the voice');
assert.strictEqual(calls.turns.length, 0, 'no hush becomes a turn (the job is not cancelled)');
assert.strictEqual(spoken.textContent, "Quiet. I'm still on it.");
vm.runInContext('handleHeard("stop")', ctx);
assert.deepStrictEqual([...calls.turns], ['stop'], '"stop" still goes through and cancels');
assert.ok(!vm.runInContext('HUSH_RE.test("quiet the music in Spotify")', ctx), 'a real request is not a hush');
console.log('ok hush');
