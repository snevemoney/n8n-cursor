/** matrix "eventreplay": the Orb shows each job line exactly once, in order, across polls and reconnects. */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const html = fs.readFileSync(path.join(__dirname, 'pane.html'), 'utf8');
const start = html.indexOf('    let ev = (() =>');
const end = html.indexOf('    async function pollEvents()', start);
assert.ok(start > 0 && end > start, 'event slice');
const store = {};
const spoken = { textContent: '' };
const said = [];
const ctx = { localStorage: { getItem: (k) => store[k] || null, setItem: (k, v) => { store[k] = v; } },
  $: (id) => (id === 'spoken' ? spoken : null), productLine: (t) => String(t || '').trim(),
  enqueueSpeak: (t) => said.push(t), state: { armed: true }, JSON, Number, String, Math };
vm.createContext(ctx);
vm.runInContext(html.slice(start, end), ctx);
const run = (code) => JSON.parse(JSON.stringify(vm.runInContext(code, ctx) ?? null));
// the turn reply showed lines 0-1 and said where it ended
run('evNote("t1", 2)');
let shown = run('applyEvents({task_id:"t1", status:"RUNNING", seq:4, lines:[{seq:2,text:"Halfway."},{seq:3,text:"Done."}], latest_task_id:"t1"})');
assert.deepStrictEqual(shown, ['Halfway.', 'Done.']); assert.strictEqual(spoken.textContent, 'Done.');
// the same lines again (a slow poll) are not shown twice
shown = run('applyEvents({task_id:"t1", status:"DONE", seq:4, lines:[{seq:2,text:"Halfway."},{seq:3,text:"Done."}], latest_task_id:"t1"})');
assert.deepStrictEqual(shown, []);
// a reconnect (fresh page) keeps the bookmark from storage
const saved = JSON.parse(store['jarvis.ev']); assert.deepStrictEqual(saved, { task: 't1', seq: 4 });
// a job this Orb never showed starts from its end, nothing old replayed
shown = run('applyEvents({task_id:"t2", status:"RUNNING", seq:7, lines:[{seq:0,text:"old"}], latest_task_id:"t2"})');
assert.deepStrictEqual(shown, []); assert.deepStrictEqual(JSON.parse(store['jarvis.ev']), { task: 't2', seq: 7 });
assert.deepStrictEqual([...said], ['Halfway.', 'Done.'], 'spoken once each when the mic is armed');
console.log('ok event replay');
