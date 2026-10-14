/** Offline: inbox cards must not attach to the wrong turn or burn the cursor on bus lag. */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, 'pane.html'), 'utf8');
// Skip the `let lastInboxGen` declaration so the vm context property is the mutable cursor.
const start = html.indexOf('    function paintInbox(bus)');
const end = html.indexOf('    function paintPrebrief(bus)', start);
assert.ok(start > 0 && end > start, 'paintInbox slice');

function harness() {
  const inbox = {
    classList: {
      on: false,
      contains(n) { return n === 'on' && this.on; },
      add() { this.on = true; },
      remove() { this.on = false; },
    },
    dataset: {},
    innerHTML: '',
    querySelector: () => null,
  };
  const spoken = { id: 'spoken' };
  const ctx = {
    lastInboxGen: null,
    $(id) { return id === 'inboxcard' ? inbox : id === 'spoken' ? spoken : null; },
  };
  vm.createContext(ctx);
  vm.runInContext(html.slice(start, end), ctx);
  return { ctx, host: inbox };
}

const { ctx, host } = harness();
// Seed cursor
ctx.paintInbox({ turn_gen: 1, job_status: 'done', inbox: { gen: 0, items: [] } });
assert.equal(ctx.lastInboxGen, 0);

// Same-turn card arrives before bus.turn_gen catches up — must NOT burn the cursor
ctx.paintInbox({ turn_gen: 7, job_status: 'done', inbox: { gen: 1, items: [{ title: 'Soon', body: 'x', turn_gen: 8 }] } });
assert.equal(ctx.lastInboxGen, 0, 'bus lag must keep inbox cursor for retry');
assert.equal(host.classList.on, false);

// Bus catches up — card paints
ctx.paintInbox({ turn_gen: 8, job_status: 'done', inbox: { gen: 1, items: [{ title: 'Now', body: 'ok', turn_gen: 8 }] } });
assert.equal(ctx.lastInboxGen, 1);
assert.equal(host.classList.on, true);
assert.ok(host.innerHTML.includes('Now'));

// Older-turn card must not paint over current turn, and cursor may advance
host.classList.remove('on');
ctx.paintInbox({ turn_gen: 9, job_status: 'done', inbox: { gen: 2, items: [{ title: 'Old', body: 'stale', turn_gen: 8 }] } });
assert.equal(ctx.lastInboxGen, 2);
assert.equal(host.classList.on, false, 'stale turn_gen must not paint');

// Background card while working waits
ctx.paintInbox({ turn_gen: 9, job_status: 'working', inbox: { gen: 3, items: [{ title: 'BG', body: 'later', background: true, turn_gen: null }] } });
assert.equal(ctx.lastInboxGen, 2, 'background during work must retry');
ctx.paintInbox({ turn_gen: 9, job_status: 'done', inbox: { gen: 3, items: [{ title: 'BG', body: 'later', background: true, turn_gen: null }] } });
assert.equal(ctx.lastInboxGen, 3);
assert.equal(host.classList.on, true);

console.log('Inbox card turn binding: bus-lag retry, stale drop, background-while-working retry passed.');

const firstPoll = harness();
firstPoll.ctx.paintInbox({turn_gen:7, job_status:'done', inbox:{gen:4,items:[{title:'First future',turn_gen:8}]}});
assert.equal(firstPoll.host.classList.on,false);
assert.equal(firstPoll.ctx.lastInboxGen,3,'first-poll future card must remain pending');
firstPoll.ctx.paintInbox({turn_gen:8, job_status:'done', inbox:{gen:4,items:[{title:'First future',turn_gen:8}]}});
assert.equal(firstPoll.host.classList.on,true,'first-poll future card must paint after catch-up');
const historical = harness();
historical.ctx.paintInbox({turn_gen:8,inbox:{gen:4,items:[{title:'History',turn_gen:8}]}});
assert.equal(historical.host.classList.on,false,'remount must not replay historical card');
console.log('First-poll future card retry and historical remount suppression passed.');
