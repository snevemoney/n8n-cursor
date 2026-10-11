const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawnSync}=require('node:child_process');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'error-catalog-'));
const valid={errors:{'LFAI-0001':{http:401,message:'Denied',description:'Authentication failure',category:'authentication',retryable:false}},categories:{authentication:'Auth'},httpStatusCodes:{401:'Unauthorized'},errorResponseFormat:{type:'object'}};
const run=value=>{const file=path.join(dir,'catalog.yaml');fs.writeFileSync(file,JSON.stringify(value));return spawnSync(process.execPath,[path.resolve(__dirname,'../scripts/validate-errors.cjs'),file],{encoding:'utf8'});};
try {
 assert.equal(run(valid).status,0);
 for (const patch of [{http:200},{retryable:'false'},{category:'missing'},{http:403},{message:''}]) {
  const copy=structuredClone(valid);Object.assign(copy.errors['LFAI-0001'],patch);assert.equal(run(copy).status,1,JSON.stringify(patch));
 }
 const malformed=structuredClone(valid);malformed.errorResponseFormat={type:'invalid'};assert.equal(run(malformed).status,1);
 console.log('Valid catalog accepted; invalid status, retryability, category, message and response schema denied.');
} finally {fs.rmSync(dir,{recursive:true,force:true});}
