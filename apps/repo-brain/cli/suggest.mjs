#!/usr/bin/env node
import fs from "fs"; import path from "path"; import fetch from "node-fetch";
const p = process.argv[2]; if(!p){ console.error("suggest <file>"); process.exit(1); }
const OPENAI_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL; const KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const txt = fs.readFileSync(p, "utf8").slice(0, 8000);
const emb = await (await fetch(`${OPENAI_URL}/embeddings`, {method:"POST", headers:{Authorization:`Bearer ${OPENAI_KEY}`, "Content-Type":"application/json"}, body:JSON.stringify({model:"text-embedding-3-small", input:txt})})).json();
const vector = emb.data[0].embedding;

const q = await fetch(`${SUPABASE_URL}/rest/v1/rpc/nn_repo_items`, { // define SQL RPC below
  method:"POST", headers:{apikey:KEY, Authorization:`Bearer ${KEY}`, "Content-Type":"application/json"},
  body: JSON.stringify({ query_embedding: vector, match_count: 8 })
});
const neighbors = await q.json();
const vote = mode(neighbors.map(n => dirOf(n.path)));
const decision = routeByRules(p, txt) || vote || "docs/";
const target = path.join(decision, path.basename(p).toLowerCase());
console.log(JSON.stringify({ target_path: target, neighbors, rationale:[`vote:${vote}`, `rules:${decision}`] }, null, 2));

function dirOf(s){ const i = s.indexOf("/"); return i>0 ? s.slice(0, s.indexOf("/", i)+1) : ""; }
function mode(arr){ return Object.entries(arr.reduce((m,v)=> (m[v]=(m[v]||0)+1,m),{})).sort((a,b)=>b[1]-a[1])[0]?.[0]; }
function routeByRules(fname, t){ const name=fname.toLowerCase();
  if(name.endsWith(".sh")) return "scripts/ops/";
  if(name.includes("workflow") || name.endsWith(".json")) return "workflows/";
  if(/docker|nginx|compose/i.test(t)) return "infra/";
  if(/guard|safety|verify|snapshot/.test(t)) return "scripts/safety/"; return null; }
