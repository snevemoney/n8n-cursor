#!/usr/bin/env node
import fs from "fs"; import path from "path";
const file = process.argv[2]; if(!file){ console.error("Usage: suggest <path>"); process.exit(1); }
const txt = fs.readFileSync(file, "utf8");
const base = path.basename(file).toLowerCase();
let target = "docs/";
if (base.endsWith(".sh")) target = "scripts/ops/";
if (base.includes("workflow") || base.endsWith(".json")) target = "workflows/";
console.log(JSON.stringify({allowed:true, target_path: path.join(target, base), rationale:["rule-of-thumb stub"]}, null, 2));
