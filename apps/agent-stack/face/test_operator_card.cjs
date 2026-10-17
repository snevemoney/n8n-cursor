/** Offline: the driving badge, receipt footer and chips paint from /api/operator (matrix: driving, receiptcard, gatehud, chips). */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, 'pane.html'), 'utf8');
const start = html.indexOf('    function paintOperator(op)');
const end = html.indexOf('    function paintInbox(bus)', start);
assert.ok(start > 0 && end > start, 'paintOperator slice');
const el = (id) => ({ id, hidden: true, textContent: '', innerHTML: '', dataset: {}, kids: [], appendChild(k) { this.kids.push(k); } });
const els = { driveBadge: el('driveBadge'), receipt: el('receipt'), chips: el('chips') };
const turns = [];
const ctx = { $(id) { return els[id] || null; }, turn(u) { turns.push(u); },
  document: { createElement() { const b = { listeners: {}, addEventListener(n, f) { this.listeners[n] = f; } }; return b; } },
  Object, JSON, Number, String };
vm.createContext(ctx);
vm.runInContext(html.slice(start, end), ctx);
ctx.paintOperator({ driving: { tool: 'app', since: 1 }, tools_run: { app: 3, shell: 1 }, tier: 'cheap', kind: 'screen', jev: { ne: 0.13 },
  cost_usd: 0.0042, rev: 'f22ce83e29ab', verified: true, chips: ['How is it going?', 'Good morning, what\'s on today?'] });
assert.strictEqual(els.driveBadge.hidden, false, 'badge shows while driving');
assert.ok(els.receipt.textContent.includes('app ×3') && els.receipt.textContent.includes('cheap/screen · jev 0.13') && els.receipt.textContent.includes('rev f22ce83'), els.receipt.textContent);
assert.strictEqual(els.chips.kids.length, 2);
els.chips.kids[0].listeners.click({ stopPropagation() {} });
assert.deepStrictEqual(turns, ['How is it going?'], 'a chip sends its text as a typed turn');
ctx.paintOperator({ driving: null, tools_run: {}, chips: ['How is it going?', 'Good morning, what\'s on today?'] });
assert.strictEqual(els.driveBadge.hidden, true, 'badge hides when not driving');
assert.strictEqual(els.chips.kids.length, 2, 'same chips are not re-rendered');
console.log('ok operator card');
