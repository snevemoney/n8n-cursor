const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawnSync}=require('node:child_process');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'error-parity-'));
const entry={http:400,message:'Invalid',description:'Invalid input',category:'validation',retryable:false};
try {
 fs.mkdirSync(path.join(dir,'contracts'));fs.mkdirSync(path.join(dir,'packages/contracts/src'),{recursive:true});
 const run=(declared,runtime)=>{fs.writeFileSync(path.join(dir,'contracts/errors.yaml'),JSON.stringify({errors:declared}));fs.writeFileSync(path.join(dir,'packages/contracts/src/errors.ts'),'export const errorCatalog = '+JSON.stringify(runtime));return spawnSync(process.execPath,[path.resolve(__dirname,'../scripts/check-error-parity.cjs'),dir],{encoding:'utf8'});};
 assert.equal(run({'LFAI-0001':entry},{'LFAI-0001':entry}).status,0);
 for(const field of Object.keys(entry)){const changed={...entry,[field]:field==='http'?500:field==='retryable'?true:'changed'};assert.equal(run({'LFAI-0001':entry},{'LFAI-0001':changed}).status,1);}
 assert.equal(run({'LFAI-0001':entry},{}).status,1);assert.equal(run({}, {'LFAI-0001':entry}).status,1);
 console.log('Matching catalogs accepted; every semantic field and either missing entry denied.');
} finally{fs.rmSync(dir,{recursive:true,force:true});}
