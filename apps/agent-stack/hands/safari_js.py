"""Page-side JavaScript for hands/safari_dom.py. Runs inside the page through Safari's `do JavaScript`, in a tab that
may be in the background: nothing here needs focus, the real mouse, or Safari in front.

Elements found by `snapshot` are kept in window.__jref (open shadow roots and same-origin frames included), so later
calls address them by number until the next snapshot or page load. Every script returns a JSON string.
"""

MAX_ELEMENTS = 300

# Shared helpers, prefixed to every script.
LIB = r"""
const W=window;
function* docs(d){yield d;for(const f of d.querySelectorAll('iframe,frame')){try{if(f.contentDocument)yield* docs(f.contentDocument)}catch(e){}}}
function deep(root,sel,out){for(const e of root.querySelectorAll(sel))out.push(e);for(const h of root.querySelectorAll('*'))if(h.shadowRoot)deep(h.shadowRoot,sel,out);return out}
function off(e){let x=0,y=0,w=e.ownerDocument.defaultView;while(w&&w!==W&&w.frameElement){const r=w.frameElement.getBoundingClientRect();x+=r.left;y+=r.top;w=w.parent}return[x,y]}
function E(n){const e=(W.__jref||[])[n-1];if(!e||!e.isConnected)throw new Error('element '+n+' is gone (the page changed); take a new snapshot');return e}
function lab(e){const t=(s)=>(s||'').trim().replace(/\s+/g,' ');let l=t(e.getAttribute('aria-label'));
 if(!l&&e.getAttribute('aria-labelledby')){l=t(e.getAttribute('aria-labelledby').split(' ').map(i=>(e.ownerDocument.getElementById(i)||{}).innerText).join(' '))}
 if(!l&&e.labels&&e.labels.length)l=t(e.labels[0].innerText);
 if(!l)l=t(e.innerText)||t(e.value&&e.type!=='password'?e.value:'')||t(e.placeholder)||t(e.title)||t(e.getAttribute('alt'))||t((e.querySelector&&e.querySelector('img')||{}).alt)||t(e.name)||t(e.getAttribute('href'));
 return l.slice(0,90)}
function pt(e){const r=e.getBoundingClientRect(),o=off(e);return{cx:r.left+r.width/2+o[0],cy:r.top+r.height/2+o[1],iw:W.innerWidth,ih:W.innerHeight}}
function guard(){if(W.__jguard)return;W.__jguard=1;W.__jdialogs=[];
 W.alert=(m)=>{W.__jdialogs.push('alert: '+m)};
 W.confirm=(m)=>{const ok=!!W.__jconfirm;W.__jconfirm=false;W.__jdialogs.push('confirm: '+m+' -> answered '+(ok?'OK':'Cancel'));return ok};
 W.prompt=(m,d)=>{W.__jdialogs.push('prompt: '+m+' -> answered empty');return null}}
function dialogs(){const d=W.__jdialogs||[];W.__jdialogs=[];return d}
"""

SELECTOR = ("a[href],button,input:not([type=hidden]),select,textarea,summary,label[for],video,audio,"
            "[role=button],[role=link],[role=tab],[role=menuitem],[role=menuitemcheckbox],[role=menuitemradio],"
            "[role=option],[role=checkbox],[role=radio],[role=switch],[role=combobox],[role=searchbox],[role=textbox],"
            "[role=slider],[role=treeitem],[contenteditable=''],[contenteditable=true],[onclick],[tabindex]:not([tabindex='-1'])")

SNAPSHOT = LIB + r"""guard();
let els=[];for(const d of docs(document))deep(d,"%s",els);
W.__jref=[];const out=[];const seen=new Set();
for(const e of els){if(W.__jref.length>=%d)break;if(seen.has(e))continue;seen.add(e);
 const r=e.getBoundingClientRect();if(r.width<2||r.height<2)continue;const st=getComputedStyle(e);
 if(st.visibility==='hidden'||st.display==='none'||+st.opacity===0)continue;
 W.__jref.push(e);const n=W.__jref.length;const o=off(e);const top=r.top+o[1];
 const role=e.getAttribute('role')||e.tagName.toLowerCase();const ty=(e.type&&!/^(BUTTON|SELECT|TEXTAREA)$/.test(e.tagName))?'['+e.type+']':'';
 let s='';if('checked' in e&&/checkbox|radio/.test(e.type))s+=e.checked?' [checked]':' [unchecked]';
 if(e.getAttribute('aria-checked'))s+=' [checked='+e.getAttribute('aria-checked')+']';
 if(e.getAttribute('aria-expanded'))s+=' [expanded='+e.getAttribute('aria-expanded')+']';
 if(e.disabled||e.getAttribute('aria-disabled')==='true')s+=' [disabled]';
 if(e.tagName==='SELECT')s+=' [selected: '+((e.selectedOptions[0]||{}).text||'')+'] options: '+[...e.options].slice(0,25).map(x=>x.text.trim()).join(' | ');
 else if(/INPUT|TEXTAREA/.test(e.tagName)&&e.type!=='password'&&e.value)s+=' [value: '+e.value.slice(0,60)+']';
 if(/VIDEO|AUDIO/.test(e.tagName))s+=e.paused?' [paused]':' [playing]';
 const where=(top<0)?' (above, scroll up)':(top>W.innerHeight?' (below, scroll down)':'');
 out.push(n+' '+role+ty+' "'+lab(e)+'"'+s+where)}
const pw=deep(document,'input[type=password]',[]).filter(e=>e.getBoundingClientRect().width>0);
const u=location.href.toLowerCase();const body=(document.body?document.body.innerText:'');
const loginish=/(^|[\/.?=_-])(login|log-in|signin|sign-in|sign_in|auth|sso|accounts\.google|session\/new)([\/.?=_-]|$)/.test(u);
const login=pw.length>0||(loginish&&/sign in|log in|password|continue with/i.test(body.slice(0,3000)));
return JSON.stringify({url:location.href,title:document.title,ready:document.readyState,n:W.__jref.length,
 elements:out.join('\n'),text:body.replace(/\n{3,}/g,'\n\n').slice(0,2500),login:login,
 scroll:Math.round(W.scrollY)+'/'+Math.round(document.documentElement.scrollHeight-W.innerHeight),dialogs:dialogs()})""" % (
    SELECTOR.replace('"', '\\"'), MAX_ELEMENTS)


def wrap(body: str) -> str:
    """One self-contained script; page errors come back as {"error": ...} instead of an AppleScript failure."""
    return "(()=>{try{" + body + "}catch(err){return JSON.stringify({error:String(err&&err.message||err)})}})()"


def element_script(n: int, body: str) -> str:
    return wrap(LIB + f"guard();const e=E({int(n)});" + body)


INFO = "return JSON.stringify({label:lab(e),tag:e.tagName.toLowerCase(),type:e.type||'',form:!!e.form})"

CLICK = r"""e.scrollIntoView({block:'center',inline:'center'});const p=pt(e);const o={bubbles:true,cancelable:true,composed:true,
 clientX:p.cx,clientY:p.cy,button:0,buttons:1,view:e.ownerDocument.defaultView};
for(const t of ['pointerover','pointerenter','mouseover','mouseenter','pointerdown','mousedown'])e.dispatchEvent(new (t.startsWith('pointer')?PointerEvent:MouseEvent)(t,o));
if(e.focus)e.focus({preventScroll:true});
for(const t of ['pointerup','mouseup'])e.dispatchEvent(new (t.startsWith('pointer')?PointerEvent:MouseEvent)(t,o));
e.click();return JSON.stringify(Object.assign(pt(e),{ok:1,dialogs:dialogs()}))"""

DBLCLICK = CLICK.replace("e.click();", "e.click();e.dispatchEvent(new MouseEvent('dblclick',o));")

HOVER = r"""e.scrollIntoView({block:'center'});const p=pt(e);const o={bubbles:true,composed:true,clientX:p.cx,clientY:p.cy,view:e.ownerDocument.defaultView};
for(const t of ['pointerover','pointerenter','mouseover','mouseenter','pointermove','mousemove'])e.dispatchEvent(new (t.startsWith('pointer')?PointerEvent:MouseEvent)(t,o));
return JSON.stringify(Object.assign(pt(e),{ok:1}))"""


def type_script(text: str, replace: bool, submit: bool) -> str:
    import json as _json
    t = _json.dumps(text)
    return (r"""e.scrollIntoView({block:'center'});e.focus();const txt=%s;
if(e.isContentEditable){if(%s){const s=e.ownerDocument.getSelection();s.selectAllChildren(e)}e.ownerDocument.execCommand('insertText',false,txt)}
else{const proto=e.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:(e.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype);
 const set=Object.getOwnPropertyDescriptor(proto,'value').set;set.call(e,%s?txt:(e.value||'')+txt);
 e.dispatchEvent(new InputEvent('input',{bubbles:true,composed:true,inputType:'insertText',data:txt}));e.dispatchEvent(new Event('change',{bubbles:true}))}
let sent=false;if(%s){const k={key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true,cancelable:true,composed:true};
 const go=e.dispatchEvent(new KeyboardEvent('keydown',k));e.dispatchEvent(new KeyboardEvent('keypress',k));e.dispatchEvent(new KeyboardEvent('keyup',k));
 if(go&&e.form){e.form.requestSubmit?e.form.requestSubmit():e.form.submit();sent=true}}
return JSON.stringify(Object.assign(pt(e),{ok:1,submitted:sent,dialogs:dialogs()}))""" % (
        t, "true" if replace else "false", "true" if replace else "false", "true" if submit else "false"))


KEYS = {"enter": ("Enter", 13), "return": ("Enter", 13), "escape": ("Escape", 27), "esc": ("Escape", 27),
        "tab": ("Tab", 9), "backspace": ("Backspace", 8), "delete": ("Delete", 46), "space": (" ", 32),
        "arrowdown": ("ArrowDown", 40), "down": ("ArrowDown", 40), "arrowup": ("ArrowUp", 38), "up": ("ArrowUp", 38),
        "arrowleft": ("ArrowLeft", 37), "left": ("ArrowLeft", 37), "arrowright": ("ArrowRight", 39),
        "right": ("ArrowRight", 39), "pagedown": ("PageDown", 34), "pageup": ("PageUp", 33), "home": ("Home", 36),
        "end": ("End", 35)}


def key_script(keys: str, n: int | None) -> str:
    parts = [p.strip().lower() for p in keys.replace("-", "+").split("+") if p.strip()]
    mods = {m: (m in parts) for m in ("cmd", "ctrl", "alt", "shift")}
    main = next((p for p in parts if p not in ("cmd", "command", "ctrl", "control", "alt", "option", "shift")), "")
    key, code = KEYS.get(main, (main[:1].upper() if mods["shift"] else main[:1], ord(main[:1].upper()) if main else 0))
    target = f"E({int(n)})" if n else "(document.activeElement||document.body)"
    return wrap(LIB + "guard();const e=%s;const k={key:%r,code:%r,keyCode:%d,which:%d,bubbles:true,cancelable:true,composed:true,"
                "metaKey:%s,ctrlKey:%s,altKey:%s,shiftKey:%s};" % (
                    target, key, key, code, code, *("true" if mods[m] else "false" for m in ("cmd", "ctrl", "alt", "shift")))
                + "const go=e.dispatchEvent(new KeyboardEvent('keydown',k));e.dispatchEvent(new KeyboardEvent('keyup',k));"
                  "if(go&&k.key==='Enter'&&e.form){e.form.requestSubmit?e.form.requestSubmit():e.form.submit()}"
                  "return JSON.stringify({ok:1,dialogs:dialogs()})")


def select_script(option: str) -> str:
    import json as _json
    o = _json.dumps(option)
    return (r"""const want=%s.toLowerCase();if(e.tagName!=='SELECT')throw new Error('not a dropdown; click it, then click the option');
const opt=[...e.options].find(x=>x.text.trim().toLowerCase()===want||x.value.toLowerCase()===want)||[...e.options].find(x=>x.text.toLowerCase().includes(want));
if(!opt)throw new Error('no option like '+want+'; options: '+[...e.options].map(x=>x.text.trim()).join(' | '));
const set=Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set;set.call(e,opt.value);
e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));
return JSON.stringify({ok:1,selected:opt.text.trim()})""" % o)


def scroll_script(direction: str, amount: int, n: int | None) -> str:
    dy = -amount if direction == "up" else amount if direction == "down" else 0
    dx = -amount if direction == "left" else amount if direction == "right" else 0
    if n:
        return element_script(n, f"if(e.scrollHeight>e.clientHeight||e.scrollWidth>e.clientWidth)e.scrollBy({dx},{dy});"
                                  "else e.scrollIntoView({block:'center'});return JSON.stringify({ok:1})")
    return wrap(f"window.scrollBy({dx},{dy});return JSON.stringify({{ok:1,y:Math.round(scrollY)}})")


def find_script(text: str) -> str:
    import json as _json
    return wrap(LIB + r"""const q=%s.toLowerCase();const lines=(document.body.innerText||'').split('\n').map(s=>s.trim()).filter(s=>s&&s.toLowerCase().includes(q));
const refs=(W.__jref||[]).map((e,i)=>[i+1,lab(e)]).filter(p=>p[1].toLowerCase().includes(q)).slice(0,20);
return JSON.stringify({lines:lines.slice(0,30),elements:refs})""" % _json.dumps(text))


def eval_script(code: str) -> str:
    return wrap(LIB + "guard();const r=(function(){" + code + "})();return JSON.stringify({result:r===undefined?null:r})")


def upload_script(name: str, mime: str, b64: str) -> str:
    import json as _json
    return (r"""if(e.tagName!=='INPUT'||e.type!=='file')throw new Error('not a file field');
const bin=atob(%s);const u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
const dt=new DataTransfer();dt.items.add(new File([u],%s,{type:%s}));e.files=dt.files;
e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));
return JSON.stringify({ok:1,files:e.files.length})""" % (_json.dumps(b64), _json.dumps(name), _json.dumps(mime)))


READ = wrap(LIB + "return JSON.stringify({url:location.href,title:document.title,text:(document.body?document.body.innerText:'').slice(0,15000)})")
STATE = wrap("return JSON.stringify({url:location.href,ready:document.readyState,text:(document.body?document.body.innerText:'').slice(0,20000)})")
