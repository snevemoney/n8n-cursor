const fs=require('node:fs'),path=require('node:path'),yaml=require('js-yaml'),ts=require('typescript'),vm=require('node:vm');
try {
 const root=path.resolve(process.argv[2]||path.join(__dirname,'../../..'));
 const spec=yaml.load(fs.readFileSync(path.join(root,'contracts/telemetry.yaml'),'utf8'));
 const source=fs.readFileSync(path.join(root,'packages/contracts/src/telemetry.ts'),'utf8');
 const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020},reportDiagnostics:true});
 if(compiled.diagnostics.some(d=>d.category===ts.DiagnosticCategory.Error))throw new Error('Cannot transpile telemetry constants');
 const exports={};vm.runInNewContext(compiled.outputText,{exports},{timeout:1000});
 const missing=[];
 for(const [owner,section] of [['Spans','spans'],['Metrics','metrics']]){
  if(!exports[owner]||!spec[section])throw new Error('Missing '+owner+' or '+section+' registry');
  for(const name of Object.values(exports[owner]))if(typeof name!=='string'||!Object.hasOwn(spec[section],name))missing.push(owner+': '+name);
 }
 if(missing.length)throw new Error('Undocumented runtime telemetry names:\n'+missing.join('\n'));
 console.log('Every exported runtime span and metric name exists in the specification.');
} catch(error){console.error(error.message);process.exitCode=1;}
