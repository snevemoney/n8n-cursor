const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawnSync}=require('node:child_process');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'openapi-contract-'));
const valid={openapi:'3.0.3',info:{title:'Fixture',version:'1'},paths:{'/fixture':{get:{responses:{200:{description:'Success'}}}}}};
const run=doc=>{const file=path.join(dir,'document.json');fs.writeFileSync(file,JSON.stringify(doc));return spawnSync(process.execPath,[path.resolve(__dirname,'../scripts/validate-openapi.cjs'),file],{encoding:'utf8'});};
try {
 assert.equal(run(valid).status,0);
 for(const change of [d=>delete d.info,d=>delete d.paths['/fixture'].get.responses,d=>d.paths['/fixture'].get.responses[200]={$ref:'#/components/responses/missing'},d=>d.paths['/fixture'].get.responses[200]={$ref:'http://fixture.invalid/schema'}]){const doc=structuredClone(valid);change(doc);assert.equal(run(doc).status,1);}
 console.log('Valid OpenAPI accepted; malformed operations and internal/external missing references denied.');
} finally{fs.rmSync(dir,{recursive:true,force:true});}
