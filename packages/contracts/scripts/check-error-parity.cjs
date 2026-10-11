const fs=require('node:fs'),path=require('node:path'),yaml=require('js-yaml'),ts=require('typescript'),vm=require('node:vm');
try {
 const root=path.resolve(process.argv[2]||path.join(__dirname,'../../..'));
 const declared=yaml.load(fs.readFileSync(path.join(root,'contracts/errors.yaml'),'utf8')).errors;
 const source=fs.readFileSync(path.join(root,'packages/contracts/src/errors.ts'),'utf8');
 const result=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020},reportDiagnostics:true});
 if(result.diagnostics.some(d=>d.category===ts.DiagnosticCategory.Error))throw new Error('Cannot transpile runtime error catalog');
 const exports={};vm.runInNewContext(result.outputText,{exports},{timeout:1000});
 const runtime=exports.errorCatalog;
 if(!declared||!runtime||typeof declared!=='object'||typeof runtime!=='object')throw new Error('Missing declared or runtime error catalog');
 const fields=['http','message','description','category','retryable'];
 const differences=[];
 for(const code of new Set([...Object.keys(declared),...Object.keys(runtime)])){
  if(!Object.hasOwn(declared,code)||!Object.hasOwn(runtime,code)){differences.push(code+': missing '+(Object.hasOwn(runtime,code)?'declared':'runtime')+' entry');continue;}
  const drift=fields.filter(field=>declared[code][field]!==runtime[code][field]);
  if(drift.length)differences.push(code+': '+drift.join(', '));
 }
 if(differences.length)throw new Error('Error catalog drift:\n'+differences.join('\n'));
 console.log('Declared and runtime error catalogs agree.');
} catch(error){console.error(error.message);process.exitCode=1;}
