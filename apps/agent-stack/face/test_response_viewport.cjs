/** New replies must be visible even after reading retained mission cards. */
const fs=require('node:fs'), vm=require('node:vm'), assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/pane.html','utf8');
const turnSource=html.slice(html.indexOf('    let turnAbort = null;'),html.indexOf('    function isMouthEcho'));
const phaseSource=html.slice(html.indexOf('    function reconcilePhase(bus)'),html.indexOf('    async function refresh()',html.indexOf('    function reconcilePhase(bus)')));
function harness() {
 const elements={chip:{scrollTop:777,getBoundingClientRect:()=>({top:500})},spoken:{textContent:'Older coding result',className:''},heard:{textContent:'Older prompt'},browserResults:{children:[],appendChild(row){this.children.push(row);}}};
 const c=vm.createContext({$:id=>elements[id]||null, STOP_RE:/^stop$/i,
  state:{turning:false,armed:false,phase:'idle',renderedBusGen:10},eyesStream:null,lastSpoken:'',busGen:10,nextHandle:'',ttsGen:0,
  stopSpeech:()=>{},paintPhase:()=>{},ttsSpeaking:()=>false,scheduleRestart:()=>{},TTS_COOLDOWN:0,
  productLine:x=>x||'',isStatusLine:()=>false,isFallbackLine:()=>false,AbortController,Date,
  document:{createElement:()=>({dataset:{},textContent:'',getBoundingClientRect:()=>({top:900})})},api:async()=>({}),
  fetch:async()=>({headers:{get:()=> 'application/json'},json:async()=>({spoken:'New artifact hash verified.',turn_gen:11,cites:[]})})});
 vm.runInContext(turnSource+'\n'+phaseSource,c);return {c,e:elements};
}
(async()=>{
 const typed=harness();await typed.c.turn('Download the controlled artifact',false,false);
 assert.equal(typed.e.spoken.textContent,'New artifact hash verified.');
 assert.equal(typed.e.chip.scrollTop,0,'new typed request must return current reply to the visible top');
 const bus=harness();bus.c.reconcilePhase({turn_gen:11,job_status:'done',spoken:'New delivered answer',utterance:'New request'});
 assert.equal(bus.e.spoken.textContent,'New delivered answer');assert.equal(bus.e.chip.scrollTop,0,'new bus reply must be visible');
 bus.e.chip.scrollTop=444;bus.c.reconcilePhase({turn_gen:11,job_status:'done',spoken:'New delivered answer'});
 assert.equal(bus.e.chip.scrollTop,444,'same-generation polls must preserve the user reading retained cards');
 bus.c.reconcilePhase({turn_gen:10,job_status:'done',spoken:'Stale answer'});
 assert.equal(bus.e.chip.scrollTop,444,'stale callbacks cannot reposition the current result');
 const working=harness();working.c.reconcilePhase({turn_gen:11,job_status:'working',phase:'think'});
 assert.equal(working.e.chip.scrollTop,777,'working status poll must not steal manual scrolling');
 const background=harness();background.c.reconcilePhase({turn_gen:11,job_status:'done',mission_delivery_pending:{mission_id:'m',spoken:'Latest worker result',gen:11}});
 assert.equal(background.e.browserResults.children.length,1);assert.equal(background.e.spoken.textContent,'Latest worker result');assert.equal(background.e.chip.scrollTop,0,'fresh result must be the current answer above collapsed history');
 background.e.chip.scrollTop=222;background.c.reconcilePhase({turn_gen:11,job_status:'done',mission_delivery_pending:{mission_id:'m',spoken:'Latest worker result',gen:11}});
 assert.equal(background.e.browserResults.children.length,1);assert.equal(background.e.chip.scrollTop,222,'duplicate delivery polls must not steal reading position');
 background.c.reconcilePhase({turn_gen:11,job_status:'done',spoken:'Latest worker result'});
 assert.equal(background.e.chip.scrollTop,222,'ack-cleared same-generation poll must not reposition an already delivered card');
 const stale=harness();stale.c.reconcilePhase({turn_gen:20,job_status:'done',spoken:'Current answer'});
 stale.c.state.armed=true;stale.c.enqueueSpeak=()=>{throw new Error('old notice must not be spoken');};
 stale.c.reconcilePhase({turn_gen:20,job_status:'done',mission_delivery_pending:{mission_id:'old',spoken:'Old blocked attempt',gen:19}});
 assert.equal(stale.e.spoken.textContent,'Current answer','older notices must not replace the current answer');
 stale.c.state.armed=false;
 stale.c.reconcilePhase({turn_gen:20,job_status:'done',mission_delivery_pending:{mission_id:'same-text-another-id',spoken:'Old blocked attempt',gen:19}});
 assert.equal(stale.e.browserResults.children.length,1,'repeated notices must not flood the reading area');
 assert.match(html,/<details id="resultHistory"><summary>Earlier updates<\/summary>/,'history must start collapsed and explicitly labeled');
 const distinct=harness();distinct.c.reconcilePhase({turn_gen:11,job_status:'done',mission_delivery_pending:{mission_id:'a',spoken:'Blocked',gen:11}});
 distinct.c.reconcilePhase({turn_gen:12,job_status:'done',spoken:'Current answer'});
 distinct.c.reconcilePhase({turn_gen:13,job_status:'done',mission_delivery_pending:{mission_id:'b',spoken:'Blocked',gen:13}});
 assert.equal(distinct.e.spoken.textContent,'Blocked','a fresh distinct result must be shown even when its wording matches history');
 distinct.e.chip.scrollTop=123;distinct.c.reconcilePhase({turn_gen:13,job_status:'done',mission_delivery_pending:{mission_id:'b',spoken:'Blocked',gen:13}});
 assert.equal(distinct.e.chip.scrollTop,123,'duplicate poll for same delivery must preserve reading');
 const acked=harness();acked.c.reconcilePhase({turn_gen:11,job_status:'done',mission_delivery_pending:{mission_id:'browser-a',spoken:'Actual browser result',gen:11}});
 acked.c.reconcilePhase({turn_gen:11,job_status:'done',tool:'browser_mission',browser_mission_id:'browser-a',spoken:'Actual browser result'});
 assert.equal(acked.e.spoken.textContent,'Actual browser result','acknowledging a result must not erase the visible current answer');
 console.log('Current typed/bus reply viewport, stable manual reading and stale/working guards passed.');
})().catch(e=>{console.error(e);process.exitCode=1;});
