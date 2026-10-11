const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'telemetry-parity-'));
try{
 fs.mkdirSync(path.join(root,'contracts'));fs.mkdirSync(path.join(root,'packages/contracts/src'),{recursive:true});
 fs.writeFileSync(path.join(root,'contracts/telemetry.yaml'),JSON.stringify({spans:{'known.span':{}},metrics:{'known.metric':{}}}));
 const run=(span,metric)=>{fs.writeFileSync(path.join(root,'packages/contracts/src/telemetry.ts'),`export const Spans={One:${JSON.stringify(span)}}; export const Metrics={One:${JSON.stringify(metric)}}`);return spawnSync(process.execPath,[path.resolve(__dirname,'../scripts/check-telemetry.cjs'),root],{encoding:'utf8'});};
 assert.equal(run('known.span','known.metric').status,0);
 assert.equal(run('unknown.span','known.metric').status,1);
 assert.equal(run('known.span','unknown.metric').status,1);
 console.log('Matching names accepted; actual undocumented span/metric exports denied.');
} finally{fs.rmSync(root,{recursive:true,force:true});}
