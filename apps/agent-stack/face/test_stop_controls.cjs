/** Actual visible Stop handlers must dispatch full cancellation, with voice off. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(__dirname + '/pane.html', 'utf8');
const handlers = new Map();
const calls = [];
const c = vm.createContext({
  $: id => ({addEventListener: (name, fn) => handlers.set(id, fn)}),
  turn: (...args) => calls.push(args),
  pressStop: () => assert.fail('visible Stop must cancel the task, not only speech'),
});
const legacyStart = html.indexOf('    $("stop").addEventListener');
const legacyEnd = html.indexOf('    $("hide").addEventListener', legacyStart);
const iconStart = html.indexOf('    if ($("stopBtn"))');
const iconEnd = html.indexOf('    if ($("hideBtn"))', iconStart);
assert.ok(legacyStart > 0 && legacyEnd > legacyStart && iconStart > 0 && iconEnd > iconStart);
vm.runInContext(html.slice(legacyStart, legacyEnd), c);
vm.runInContext(html.slice(iconStart, iconEnd), c);
for (const id of ['stop', 'stopBtn']) {
  let prevented = false;
  let propagationStopped = false;
  handlers.get(id)({preventDefault: () => prevented = true, stopPropagation: () => propagationStopped = true});
  assert.equal(prevented, true);
  assert.equal(propagationStopped, true);
  assert.deepEqual(calls.shift(), ['stop', false, false], id + ' must use full cancellation without speech');
}
console.log('Both real visible Stop callbacks dispatch full task cancellation with voice=false.');
