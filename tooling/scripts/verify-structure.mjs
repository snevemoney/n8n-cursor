import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const rules = [
  { from: "apps/lightningflow", forbid: [/apps\/n8n-cursor\//] },
  { from: "apps/n8n-cursor",   forbid: [/apps\/lightningflow\//] },
];

function* walk(d) {
  for (const f of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, f.name);
    if (f.isDirectory()) yield* walk(p);
    else yield p;
  }
}

// Skip documentation files that may contain structural references
function shouldSkipFile(filePath) {
  const skipPatterns = [
    /README\.md$/,
    /\.md$/,
    /\.txt$/,
    /\.yml$/,
    /\.yaml$/,
    /\.json$/
  ];
  
  return skipPatterns.some(pattern => pattern.test(filePath));
}

function fail(msg){ console.error("STRUCTURE ERROR:", msg); process.exitCode = 1; }

console.log("🔍 Verifying workspace structure...");

for (const rule of rules) {
  try {
    for (const f of walk(rule.from)) {
      // Skip documentation files
      if (shouldSkipFile(f)) continue;
      
      // Only check source code files
      if (!/\.(ts|tsx|js|mjs|cjs|sh)$/.test(f)) continue;
      
      const s = readFileSync(f, "utf8");
      for (const r of rule.forbid) {
        if (r.test(s)) {
          fail(`${f} imports forbidden path`);
        }
      }
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`⚠️  Skipping ${rule.from} (directory not found)`);
    } else {
      throw error;
    }
  }
}

if (process.exitCode) {
  console.error("❌ Structure verification failed!");
  process.exit(1);
}

console.log("✅ Structure verification passed!");
