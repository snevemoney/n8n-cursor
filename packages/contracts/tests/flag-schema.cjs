const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'flag-schema-'));
try {
  const file = path.join(dir, 'schema.json');
  const run = value => {
    fs.writeFileSync(file, JSON.stringify(value));
    return spawnSync(process.execPath, [path.resolve(__dirname, '../scripts/validate-flags.cjs'), file], { encoding: 'utf8' });
  };
  assert.equal(run({type:'object', properties:{KNOWN:{type:'boolean', default:false, environments:{prod:false}}}}).status, 0);
  assert.equal(run({type:'invalid'}).status, 1);
  assert.equal(run({type:'object', properties:{KNOWN:{$ref:'#/definitions/missing'}}}).status, 1);
  const missing = spawnSync(process.execPath, [path.resolve(__dirname, '../scripts/validate-flags.cjs'), path.join(dir, 'absent.json')]);
  assert.equal(missing.status, 1);
  console.log('Valid metadata preserved; invalid schema, unresolved reference and missing file denied.');
} finally { fs.rmSync(dir, {recursive:true, force:true}); }
