const ts=require('typescript');
const fs=require('node:fs'),path=require('node:path'),yaml=require('js-yaml'),{spawnSync}=require('node:child_process');
try {
  const root=path.resolve(process.argv[2] || path.join(__dirname,'../../..'));
  const catalog=yaml.load(fs.readFileSync(path.join(root,'contracts/errors.yaml'),'utf8'));
  if (!catalog || !catalog.errors || typeof catalog.errors!=='object') throw new Error('Missing error catalog');
  const known=new Set(Object.keys(catalog.errors));
  const scan=spawnSync('rg',['-l','-0',String.raw`\bLFAI-[0-9]{4}\b`,'apps','packages','--type','ts','--type','js'],{cwd:root,encoding:'utf8'});
  if (scan.error || ![0,1].includes(scan.status)) throw new Error(scan.error?.message || scan.stderr || 'Source scan failed');
  const unknown=[];
  for (const file of scan.stdout.split('\0').filter(Boolean)) {
    const source=ts.createSourceFile(file,fs.readFileSync(path.join(root,file),'utf8'),ts.ScriptTarget.Latest,true);
    if (source.parseDiagnostics.length) throw new Error('Cannot parse source: '+file);
    function visit(node) {
      if (ts.isStringLiteralLike(node)) {
        for (const match of node.text.matchAll(/\bLFAI-[0-9]{4}\b/g)) {
          if (!known.has(match[0])) {
            const line=source.getLineAndCharacterOfPosition(node.getStart(source)).line+1;
            unknown.push(file+':'+line+':'+match[0]);
          }
        }
      }
      ts.forEachChild(node,visit);
    }
    visit(source);
  }
  if (unknown.length) throw new Error('Unknown error codes:\n'+unknown.join('\n'));
  console.log('All scanned error codes exist in the catalog.');
} catch (error) { console.error(error.message); process.exitCode=1; }
