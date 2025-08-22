#!/usr/bin/env node
import { execSync } from "node:child_process";
import fs from "fs"; import path from "path";
const staged = execSync("git diff --name-only --cached", {encoding:"utf8"}).trim().split("\n").filter(Boolean);
let bad=0;
for(const f of staged){
  const base = path.basename(f);
  if(!f.includes("/") && (base.endsWith(".sh")||base.endsWith(".json"))){
    console.error(`Forbidden top-level file: ${f}`); bad=1;
  }
}
process.exit(bad);
