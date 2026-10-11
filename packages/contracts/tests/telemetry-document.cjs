const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'telemetry-contract-'));
const exporter={endpoint:'http://fixture.invalid',batch_size:1,export_timeout:10};
const valid={spans:{operation:{description:'Fixture',attributes:{required:['id'],optional:[]}}},metrics:{duration:{type:'histogram',description:'Fixture',labels:[],buckets:[1,2]}},sampling:{traces:{default:.1,rules:[{service:'fixture',operation:'operation',rate:1}]}},export:{traces:exporter,metrics:exporter,logs:exporter},logging:{format:'json',level:'info',fields:{required:['message'],optional:[]},levels:{info:2}},resource:{}};
const run=doc=>{const file=path.join(root,'telemetry.json');fs.writeFileSync(file,JSON.stringify(doc));return spawnSync(process.execPath,[path.resolve(__dirname,'../scripts/validate-telemetry.cjs'),file],{encoding:'utf8'});};
try {
 assert.equal(run(valid).status,0);
 for(const change of [d=>d.sampling.traces.default=2,d=>d.sampling.traces.rules[0].operation='missing',d=>d.metrics.duration.buckets=[2,1],d=>d.export.logs.endpoint='invalid',d=>d.export.logs.batch_size=0,d=>d.logging.level='missing',d=>d.metrics.duration.type='unknown']) {
  const doc=structuredClone(valid);change(doc);assert.equal(run(doc).status,1);
 }
 console.log('Valid telemetry accepted; invalid rates/references/buckets/exporters/levels/types denied.');
} finally {fs.rmSync(root,{recursive:true,force:true});}
