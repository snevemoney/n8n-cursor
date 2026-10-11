const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript'),path=require('node:path');const out={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.resolve(__dirname,'../src/utils.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:out,require:()=>({})});
for(const value of [null,undefined,0,'',[],{},3])assert.equal(typeof out.ObjectUtils.isObject(value),'boolean');
const result=out.ObjectUtils.deepMerge({settings:4},{settings:{enabled:true}});assert.equal(result.settings.enabled,true);
const ordinary=out.ObjectUtils.deepMerge({settings:{left:1}},{settings:{right:2}});assert.equal(ordinary.settings.left,1);assert.equal(ordinary.settings.right,2);console.log('Object predicate is boolean; nested merge replaces scalar target and retains existing object fields.');

for(const original of [[],[1],[1,2,2,3]]){const copy=[...original],result=out.ArrayUtils.shuffle(original);assert.equal(result.length,original.length);assert.equal(JSON.stringify([...result].sort()),JSON.stringify([...original].sort()));assert.equal(JSON.stringify(original),JSON.stringify(copy));}
console.log('Shuffle preserves input, count and multiset including duplicate values.');
