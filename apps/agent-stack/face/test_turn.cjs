const {readFileSync} = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = readFileSync(process.argv[2] || __dirname + '/pane.html', 'utf8');
const source = html.slice(html.indexOf('    let turnAbort = null;'), html.indexOf('    function isMouthEcho'));
const tick = () => new Promise(resolve => setImmediate(resolve));
async function scenario(voice, json = false, duplicates = false, failedWatch = false) {
  const element = {textContent:'previous',className:''};
  const audio = []; let unlocked = 0; let release;
  const paused = new Promise(resolve => release=resolve);
  let read = 0;
  const events = [
    {spoken:'First sentence.',spoken_delta:'First sentence.',done:false},
    {spoken:'First sentence. Second sentence.',spoken_delta:'Second sentence.',done:true}
  ];
  if (failedWatch) {
    events[1] = {ok:false, spoken:'Postcondition failed.', done:true,
      execution:{ok:false, stroke:{ok:false, why:'verification_failed'}}};
  }
  if (duplicates) events.push(
    {spoken:'The talk wire is dark this turn.',done:true},
    {spoken:'Retry candidate.',spoken_delta:'Retry candidate.',done:true});
  const c = vm.createContext({
    STOP_RE:/^stop$/i, state:{turning:false,armed:false,phase:'idle'},
    eyesStream:null,lastSpoken:'',busGen:0,nextHandle:'',ttsGen:0,
    unlockAudio:()=>unlocked++,stopSpeech:()=>{},paintPhase:()=>{},
    $:()=>element,enqueueSpeak:t=>audio.push(t),productLine:t=>t||'',
    ttsSpeaking:()=>false,scheduleRestart:()=>{},TTS_COOLDOWN:0,
    AbortController,TextDecoder,Date,
    fetch:async()=>({headers:{get:()=>json?'application/json':'text/event-stream'},
      json:async()=>events[1],body:{getReader:()=>({
        read:async()=>{
          if(read===1) await paused;
          if(read>=events.length) return {done:true};
          return {value:Buffer.from('data: '+JSON.stringify(events[read++])+'\n\n'),done:false};
        },cancel:async()=>{}
      })}})
  });
  vm.runInContext(source,c);
  const running = c.turn('explain',false,voice);
  await tick();
  if(!json) {
    assert.equal(element.textContent,'First sentence.','partial text must appear before stream completes');
    assert.deepEqual(audio,voice?['First sentence.']:[]);
    release();
  }
  await running;
  assert.equal(element.textContent,failedWatch?'Postcondition failed.':'First sentence. Second sentence.');
  const finalText=failedWatch?'Postcondition failed.':'First sentence. Second sentence.';
  assert.deepEqual(audio,voice?(json?[finalText]:['First sentence.','Second sentence.']):[]);
  assert.equal(unlocked,voice?1:0);
}
async function blockedAudioDoesNotBlockText(voice) {
  const element = {textContent:'previous',className:''};
  let releaseStream, releaseAudio;
  const pausedStream = new Promise(resolve => releaseStream=resolve);
  const pausedAudio = new Promise(resolve => releaseAudio=resolve);
  const requests=[], played=[];
  let read=0;
  const events=[{spoken:'First.',spoken_delta:'First.',done:false},
    {spoken:'First. Second.',spoken_delta:'Second.',done:true}];
  const c=vm.createContext({
    STOP_RE:/^stop$/i,state:{turning:false,armed:false,phase:'idle'},
    eyesStream:null,lastSpoken:'',busGen:0,nextHandle:'',ttsGen:0,
    ttsQueue:[],ttsCloud:new Map(),ttsBusy:false,mouthOpen:false,
    unlockAudio:()=>{},stopSpeech:()=>{},paintPhase:()=>{},$:()=>element,
    productLine:t=>t||'',productMouth:()=>true,isWireMissLine:()=>false,
    fetchTtsBuf:async(text)=>{requests.push(text);await pausedAudio;return Buffer.from('fixture');},
    playCloudBuf:async(buf,text)=>{played.push(text);return true;},
    speakLocal:async()=>assert.fail('no local fallback expected'),revealSpoken:()=>{},afterSpeak:()=>{},
    ttsSpeaking:()=>false,scheduleRestart:()=>{},TTS_COOLDOWN:0,
    AbortController,TextDecoder,Date,
    fetch:async()=>({headers:{get:()=> 'text/event-stream'},body:{getReader:()=>({
      read:async()=>{if(read===1)await pausedStream;if(read===events.length)return {done:true};
        return {value:Buffer.from('data: '+JSON.stringify(events[read++])+'\n\n'),done:false};},cancel:async()=>{}
    })}})
  });
  const audioStart=html.indexOf('    function prefetchCloud');
  vm.runInContext(html.slice(audioStart,html.indexOf('    function speak(text)',audioStart)),c);
  vm.runInContext(source,c);
  const running=c.turn('fixture',false,voice);
  await tick();
  assert.equal(element.textContent,'First.','partial text must render while real TTS pump is blocked');
  assert.equal(played.length,0);
  assert.deepEqual(requests,voice?['First.']:[]);
  releaseStream();await running;
  assert.equal(element.textContent,'First. Second.','final text must render before audio resolves');
  assert.equal(played.length,0);
  assert.equal(c.state.turning,false,'audio must not keep the turn request active');
  releaseAudio();await tick();await tick();
  assert.deepEqual(played,voice?['First.','Second.']:[]);
}
function inputRoutes() {
  const calls = []; let keyHandler;
  const typed = {value:'Keyboard question',addEventListener:(_,handler)=>keyHandler=handler};
  const c = vm.createContext({$:()=>typed,turn:(...args)=>calls.push(args),
    unlockAudio:()=>assert.fail('Keyboard input must not unlock audio'),
    state:{pending:'Pending question'},isMouthEcho:()=>false,
    WAKE_RE:/^jarvis[, ]*/i,YES_RE:/^yes$/i,greet:()=>{}});
  const typedSource=html.slice(html.indexOf('    $("typed").addEventListener("keydown"'),html.indexOf('    if (WIDGET)',html.indexOf('    $("typed").addEventListener("keydown"')));
  vm.runInContext(typedSource,c);
  keyHandler({key:'Enter'});
  assert.deepEqual(calls.shift(),['Keyboard question',false]);
  assert.equal(typed.value,'');
  const micSource=html.slice(html.indexOf('    function handleHeard'),html.indexOf('    // FINISH_MS'));
  vm.runInContext(micSource,c);
  c.handleHeard('Jarvis explain');
  assert.deepEqual(calls.shift(),['explain',false,true]);
  c.handleHeard('yes');
  assert.deepEqual(calls.shift(),['Pending question',true,true]);
}
async function terminalReceiptDoesNotWaitForEOF() {
  const element={textContent:"previous",className:""};
  let reads=0, cancelled=0, settled=false;
  const c=vm.createContext({
    STOP_RE:/^stop$/i,state:{turning:false,armed:false,phase:"idle"},
    eyesStream:null,lastSpoken:"",busGen:0,nextHandle:"",ttsGen:0,
    unlockAudio:()=>{},stopSpeech:()=>{},paintPhase:()=>{},$:()=>element,
    enqueueSpeak:()=>{throw new Error("typed reply must stay silent");},
    productLine:t=>t||"",ttsSpeaking:()=>false,scheduleRestart:()=>{},TTS_COOLDOWN:0,
    AbortController,TextDecoder,Date,
    fetch:async()=>({headers:{get:()=>"text/event-stream"},body:{getReader:()=>({
      read:async()=>{reads++; return reads===1
        ? {value:Buffer.from("data: "+JSON.stringify({spoken:"Verified answer.",done:true,turn_gen:10})+"\n\n"),done:false}
        : new Promise(()=>{});},
      cancel:()=>{cancelled++; return new Promise(()=>{});}
    })}})
  });
  vm.runInContext(source,c);
  c.turn("explain",false,false).then(()=>settled=true);
  await tick(); await tick();
  assert.equal(element.textContent,"Verified answer.");
  assert.equal(settled,true,"terminal receipt must release the turn without EOF or completed cancellation");
  assert.equal(c.state.turning,false);
  assert.equal(reads,1,"do not wait for another stream read after terminal delivery");
  assert.equal(cancelled,1,"request stream cleanup without blocking completed UI");
}
function busReconciliation() {
  const element = {textContent:'The talk wire is dark this turn.'};
  const c = vm.createContext({busGen:8,state:{turning:false,phase:'idle',listening:false,armed:false},
    $:()=>element,productLine:t=>t||'',isStatusLine:()=>false,isFallbackLine:t=>t.includes('dark'),
    ttsSpeaking:()=>false,paintPhase:()=>{}});
  const start=html.indexOf('    function reconcilePhase(bus)');
  vm.runInContext(html.slice(start,html.indexOf('    async function refresh()',start)),c);
  c.reconcilePhase({turn_gen:7,job_status:'done',spoken:'Old generation answer.'});
  assert.equal(c.busGen,8,'out-of-order poll must not rewind the generation');
  assert.equal(element.textContent,'The talk wire is dark this turn.','old poll must not paint a stale answer');
  c.reconcilePhase({turn_gen:8,job_status:'done',spoken:'Current answer.'});
  assert.equal(element.textContent,'Current answer.');
  c.reconcilePhase({turn_gen:9,job_status:'done',spoken:'External new answer.'});
  assert.equal(element.textContent,'External new answer.','newer completed bus turn must replace older displayed reply');
  // A fresh Face mount can recover the persisted current reply.
  element.textContent=''; c.busGen=0;
  c.reconcilePhase({turn_gen:8,job_status:'done',spoken:'Current answer.'});
  assert.equal(element.textContent,'Current answer.');
  element.textContent='';
  c.reconcilePhase({turn_gen:8,job_status:'done',spoken:'Postcondition failed.',execution:{ok:false}});
  assert.equal(element.textContent,'Postcondition failed.','remount must retain the failed Watch result');
  c.state.turning=true; element.textContent='New partial.';
  c.reconcilePhase({turn_gen:9,job_status:'done',spoken:'Bus candidate.'});
  assert.equal(element.textContent,'New partial.','poll must not overwrite an active stream');
}
(async()=>{
  await terminalReceiptDoesNotWaitForEOF();
  await blockedAudioDoesNotBlockText(false);
  await blockedAudioDoesNotBlockText(true);
  inputRoutes();
  busReconciliation();
  for(const voice of [undefined,true]) for(const json of [false,true]) await scenario(voice,json);
  for(const voice of [undefined,true]) await scenario(voice,false,true);
  for(const json of [false,true]) await scenario(false,json,false,true);
  console.log('Real blocked-TTS pump, input routing, 8 response cases and bus reconciliation passed: typed silent, mic speaks, partial text, duplicate finals, stale polls, failed Watch results and remount.');
})().catch(e=>{console.error(e);process.exitCode=1});
