const {readFileSync} = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = readFileSync(process.argv[2] || __dirname + '/pane.html', 'utf8');
const source = html.slice(html.indexOf('    let turnAbort = null;'), html.indexOf('    function isMouthEcho'));
const tick = () => new Promise(resolve => setImmediate(resolve));
async function scenario(voice, json = false, duplicates = false, failedWatch = false) {
  const element = {textContent:'previous',className:''};
  const heard = {textContent:'previous prompt'};
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
    $:id=>id==='heard'?heard:element,enqueueSpeak:t=>audio.push(t),productLine:t=>t||'',
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
  assert.equal(heard.textContent,'› explain','current prompt must replace the earlier prompt immediately');
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
    STOP_RE:/^(?:jarvis[, ]*)?(stop|cancel|never mind|forget it|shut up)[.!?]?$/i,WAKE_RE:/^jarvis[, ]*/i,YES_RE:/^yes$/i,greet:()=>{},lastTtsBusyAt:0,FOLLOW_UP_MS:12000});
  const typedSource=html.slice(html.indexOf('    $("typed").addEventListener("keydown"'),html.indexOf('    if (WIDGET)',html.indexOf('    $("typed").addEventListener("keydown"')));
  vm.runInContext(typedSource,c);
  keyHandler({key:'Enter'});
  assert.deepEqual(calls.shift(),['Keyboard question',false,false],'typed Enter must pass voice=false explicitly');
  assert.equal(typed.value,'');
  const micSource=html.slice(html.indexOf('    function handleHeard'),html.indexOf('    // FINISH_MS'));
  vm.runInContext(micSource,c);
  for (const lastBusy of [0, Date.now() - 60000]) {
    c.lastTtsBusyAt = lastBusy;
    c.handleHeard('stop');
    assert.deepEqual(calls.shift(), ['stop',false,true], 'bare stop must reach cancellation without wake or recent TTS');
  }
  c.lastTtsBusyAt = 0;
  c.handleHeard('Jarvis explain');
  assert.deepEqual(calls.shift(),['explain',false,true],'mic path must pass voice=true');
  c.handleHeard('yes');
  assert.deepEqual(calls.shift(),['Pending question',true,true]);
  c.handleHeard('The Routines section in the middle of your screen');  // no wake word, no live exchange: ignored
  assert.equal(calls.length,0,'unaddressed speech must not start a turn (self-echo loop)');
}
function watchNoticeTypedSilent() {
  // BUS300-P0-002: Watch push notice paints text always; TTS only when mic armed.
  const spoken = {textContent:''};
  const spokenOut = [];
  const fetches = [];
  const c = vm.createContext({
    state:{turning:false,armed:false}, watchNoticeId:null,
    $:()=>spoken, enqueueSpeak:(t)=>spokenOut.push(t),
    api:async()=>({}),
    fetch:(url,opts)=>{fetches.push({url,opts}); return Promise.resolve({});},
  });
  const start = html.indexOf('        const notice = bus && bus.watch_notice;');
  const end = html.indexOf('        reconcilePhase(bus);', start);
  assert.ok(start > 0 && end > start, 'watch_notice slice');
  // Wrap the notice block into an async fn for the harness.
  vm.runInContext(
    'async function runNotice(bus){\n' + html.slice(start, end) + '\n}',
    c
  );
  return c.runNotice({
    watch_notice:{event_id:'n1', delivered:false, spoken:'Watch saw a change.'}
  }).then(()=>{
    assert.equal(spoken.textContent,'Watch saw a change.');
    assert.deepEqual(spokenOut,[],'disarmed mic must not TTS watch notices');
    assert.equal(fetches.length,1,'ack still fires');
    c.state.armed = true;
    c.watchNoticeId = null;
    return c.runNotice({
      watch_notice:{event_id:'n2', delivered:false, spoken:'Second notice.'}
    });
  }).then(()=>{
    assert.deepEqual(spokenOut,['Second notice.'],'armed mic may speak watch notices');
  });
}
function selfEchoGuards() {
  // Offline contract for the 15:12 mic self-loop: TTS busy/tail + fuzzy match of recent Jarvis lines.
  const c = vm.createContext({
    Date, STOP_RE:/^stop$/i, ECHO_RE:/adopted path missing/i,
    ttsBusy:false, synth:null, ttsSource:null, ttsAudio:null,
    lastTtsBusyAt:0, ECHO_TAIL_MS:1800, FOLLOW_UP_MS:12000,
    recentSpoken:[], lastSpoken:'', state:{turning:false},
  });
  const ttsSrc = html.slice(html.indexOf('    const ttsSpeaking = () =>'), html.indexOf('    const echoWords = (t) =>'));
  const echoSrc = html.slice(html.indexOf('    const echoWords = (t) =>'), html.indexOf('    function pageVisible()'));
  const mouthSrc = html.slice(html.indexOf('    function isMouthEcho(said)'), html.indexOf('    function handleHeard(raw)'));
  vm.runInContext(ttsSrc + echoSrc + mouthSrc, c);
  c.lastSpoken = 'Handing the wheel back, sir. It is yours.';
  c.recentSpoken = ['Handing the wheel back, sir. It is yours.'];
  assert.equal(c.soundsLikeJarvis('Handing the wheel back sir it is yours'), true, 'fuzzy match of last Jarvis line');
  assert.equal(c.soundsLikeJarvis('open Safari for me please'), false, 'unrelated ask is not an echo');
  assert.equal(c.isMouthEcho('Handing the wheel back sir it is yours'), true);
  assert.equal(c.isMouthEcho('stop'), false, 'stop must never be treated as echo');
  c.lastTtsBusyAt = Date.now();
  assert.equal(c.isMouthEcho('Jarvis what time is it'), true, 'TTS tail gates the mic');
  c.lastTtsBusyAt = Date.now() - 5000;
  c.lastSpoken = ''; c.recentSpoken = [];
  assert.equal(c.isMouthEcho('Jarvis what time is it'), false);
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
  await watchNoticeTypedSilent();
  selfEchoGuards();
  busReconciliation();
  for(const voice of [undefined,true]) for(const json of [false,true]) await scenario(voice,json);
  for(const voice of [undefined,true]) await scenario(voice,false,true);
  for(const json of [false,true]) await scenario(false,json,false,true);
  console.log('Real blocked-TTS pump, input routing, typed-vs-mic watch-notice gate, self-echo guards, 8 response cases and bus reconciliation passed: typed silent, mic speaks, partial text, duplicate finals, stale polls, failed Watch results and remount.');
})().catch(e=>{console.error(e);process.exitCode=1});
