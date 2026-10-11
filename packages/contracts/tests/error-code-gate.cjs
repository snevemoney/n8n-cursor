const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'error-code-gate-'));
try {
 for(const folder of ['contracts','apps','packages'])fs.mkdirSync(path.join(root,folder));
 fs.writeFileSync(path.join(root,'contracts/errors.yaml'),JSON.stringify({errors:{'LFAI-0001':{}}}));
 const run=(text)=>{fs.writeFileSync(path.join(root,'apps/fixture.tsx'),text);return spawnSync(process.execPath,[path.resolve(__dirname,'../scripts/check-errors.cjs'),root],{encoding:'utf8'});};
 assert.equal(run("const x = 'LFAI-0001'").status,0);
 assert.equal(run("const x = ['LFAI-0001','LFAI-9999']").status,1);
 assert.equal(run('const x = 42').status,0);
 assert.equal(run('// LFAI-9999\n/* LFAI-8888 */\nconst x = 42').status,0);
 assert.equal(run("const x = '// LFAI-9999'").status,1);
 fs.rmSync(path.join(root,'apps'),{recursive:true});
 assert.equal(runMissing().status,1);
 function runMissing(){return spawnSync(process.execPath,[path.resolve(__dirname,'../scripts/check-errors.cjs'),root],{encoding:'utf8'});}
 console.log('Known/empty source allowed; unknown adjacent code and failed scanner denied.');
} finally {fs.rmSync(root,{recursive:true,force:true});}
