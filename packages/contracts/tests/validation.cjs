const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript'),path=require('node:path');const output={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.resolve(__dirname,'../src/validators.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,{exports:output,require,Error});
const schema={type:'object',properties:{amount:{type:'number',format:'satoshi'}},required:['amount'],additionalProperties:false};
const strict={amount:'2',extra:true};assert.equal(output.validate(schema,strict,{coerceTypes:false,removeAdditional:false}).valid,false);assert.equal(strict.amount,'2');assert.equal(strict.extra,true);
const defaulted={amount:'2',extra:true};assert.equal(output.validate(schema,defaulted).valid,true);assert.equal(defaulted.amount,2);assert.equal(Object.hasOwn(defaulted,'extra'),false);
for(const amount of [0,-1,1.5])assert.equal(output.validate(schema,{amount}).valid,false,amount);assert.equal(output.validate(schema,{amount:2}).valid,true);
console.log('Explicit validation options respected; defaults retained; satoshi format rejects zero, negative and fractional values.');
