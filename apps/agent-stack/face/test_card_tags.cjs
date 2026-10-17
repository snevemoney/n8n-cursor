/** The card never shows voice-only tags; the voice still gets them. */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const html = fs.readFileSync(path.join(__dirname, 'pane.html'), 'utf8');
const start = html.indexOf('    const VOICE_TAG_RE');
const end = html.indexOf('    (function guardCard()', start);
assert.ok(start > 0 && end > start);
const ctx = {}; vm.createContext(ctx); vm.runInContext(html.slice(start, end), ctx);
const c = (s) => vm.runInContext('cardText(' + JSON.stringify(s) + ')', ctx);
assert.strictEqual(c('[chuckle] "Play In football Natalie" — I\'m trying.'), '"Play In football Natalie" — I\'m trying.');
assert.strictEqual(c('Done. [sigh] Next one.'), 'Done. Next one.');
assert.strictEqual(c('Array [1] stays'), 'Array [1] stays');
console.log('ok card tags');
