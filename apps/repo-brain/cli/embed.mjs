#!/usr/bin/env node
// Embeds file summaries and upserts into Supabase pgvector
import fs from "fs"; import path from "path"; import crypto from "crypto";
import fetch from "node-fetch";
const file = process.argv[2]; if(!file){ console.error("embed <file>"); process.exit(1); }

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const OPENAI_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const OPENAI_KEY = process.env.OPENAI_API_KEY;

const text = fs.readFileSync(file, "utf8").slice(0, 8000);
const resp = await fetch(`${OPENAI_URL}/embeddings`, {
  method:"POST",
  headers:{ "Authorization":`Bearer ${OPENAI_KEY}`, "Content-Type":"application/json" },
  body: JSON.stringify({ model:"text-embedding-3-small", input:text })
});
const { data:[{ embedding }] } = await resp.json();

const hash = crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const body = {
  path: file, kind: guessKind(file), summary: summarize(file, text),
  embedding, last_hash: hash
};

await fetch(`${SUPABASE_URL}/rest/v1/repo_items`, {
  method:"POST",
  headers:{ "apikey": SUPABASE_ANON_KEY, "Authorization": `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type":"application/json", "Prefer":"resolution=merge-duplicates" },
  body: JSON.stringify(body)
});
console.log(`Indexed ${file}`);

function guessKind(p){ if(p.startsWith("scripts/")) return "script";
  if(p.startsWith("infra/")) return "infra";
  if(p.startsWith("workflows/")) return "workflow";
  if(p.startsWith("docs/")) return "doc"; return "misc"; }
function summarize(fname, t){ return `${fname}: ${t.split("\n").slice(0,10).join(" ")}`; }
