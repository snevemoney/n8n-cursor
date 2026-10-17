/* Pure DOM unit harness; no browser, screen, network or running Face. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
class Element {
  constructor(tag) { this.tag=tag; this.children=[]; this.attrs={}; this.textContent=''; }
  appendChild(node) { this.children.push(node); }
  replaceChildren() { this.children=[]; }
  setAttribute(key,value) { this.attrs[key]=value; }
  querySelectorAll(selector) {
    const results=[];
    function visit(node,inArticle=false) {
      inArticle = inArticle || node.tag === 'article';
      if (selector === 'article button' && inArticle && node.tag === 'button') results.push(node);
      for (const child of node.children) visit(child,inArticle);
    } visit(this); return results;
  }
}
function all(node,tag) { return [...(node.tag===tag?[node]:[]),...node.children.flatMap(c=>all(c,tag))]; }
const context={document:{createElement:tag=>new Element(tag)}};
vm.createContext(context);
vm.runInContext(fs.readFileSync(new URL('./review-panel.js', import.meta.url),'utf8'),context);
const row={id:'0123456789abcdef',title:'<script>untrusted title</script>',body:'Original',revision:0,state:'awaiting-review'};
const bus=(generation=1,item=row)=>({turn_gen:generation,execution_gen:generation,job_status:'done',execution:{project_view:{project:'launch',items:[item],complete:true,error:''}}});
(async()=>{
  const host=new Element('section'), commands=[];
  let resolve;
  const panel=context.JarvisReviewPanel.create(host,command=>{commands.push(command);return new Promise(r=>{resolve=r;});});
  panel.paint(bus());
  assert.equal(host.hidden,false);
  assert.equal(all(host,'h3')[0].textContent,row.title);
  assert.equal(all(host,'script').length,0);
  all(host,'textarea')[0].value='Changed';
  await host.querySelectorAll('article button')[0].onclick();
  assert.equal(commands.length,0,'unsaved edits cannot approve old text');
  const edit=host.querySelectorAll('article button')[1];
  const pending=edit.onclick();
  edit.onclick();
  assert.deepEqual(commands,['project launch review 0123456789abcdef edit revision 0: Changed']);
  assert(host.querySelectorAll('article button').every(b=>b.disabled));
  resolve(); await pending;
  panel.paint(bus(2,{...row,body:'Changed',revision:1}));
  assert(host.querySelectorAll('article button').every(b=>!b.disabled));
  for (const [index,action] of [[0,'approve'],[2,'reject'],[3,'redo']]) {
    const pending=host.querySelectorAll('article button')[index].onclick();
    assert.equal(commands.at(-1),`project launch review 0123456789abcdef ${action} revision 1`);
    resolve(); await pending;
    panel.paint(bus(3+index,{...row,body:'Changed',revision:1}));
  }
  const stale=bus(8); stale.execution_gen=7; panel.paint(stale);
  assert(host.hidden,'stale receipt cannot leave approval buttons active');
  panel.paint({...bus(9),job_status:'working'});
  assert(host.hidden,'working turns cannot expose prior review controls');
  console.log('Review panel: draft text, literal rendering, edit guard, all four commands, double-click guard, revision refresh and stale receipt checks passed.');
})().catch(error=>{console.error(error);process.exitCode=1;});
