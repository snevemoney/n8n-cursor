#!/usr/bin/env node
/** Patch hive_send_report: dedupe #alerts spam + skipAlert for #general replies */
import { readFileSync, writeFileSync, existsSync } from "fs";

const path = "/opt/philanthropy/app/api/agent/tools/hive.ts";
let text = readFileSync(path, "utf8");

if (text.includes("HIVE_REPORT_DEDUPE_MS")) {
  console.log("already patched");
  process.exit(0);
}

text = text.replace(
  'import { fetchWithTimeout, missingKeyAlert, sendTelegramAlert } from \'./utils\'',
  "import { readFileSync, writeFileSync } from 'fs'\nimport { fetchWithTimeout, missingKeyAlert, sendTelegramAlert } from './utils'",
);

text = text.replace(
  "function stripUrls(text: string): string {",
  `const HIVE_REPORT_DEDUPE_MS = 15 * 60 * 1000
const HIVE_REPORT_LAST_ALERT = '/tmp/hive-report-last-alert.json'

function shouldSkipHiveAlert(reportText: string, forceAlert: boolean): boolean {
  if (forceAlert) return false
  try {
    if (!existsSync(HIVE_REPORT_LAST_ALERT)) return false
    const raw = readFileSync(HIVE_REPORT_LAST_ALERT, 'utf8')
    const prev = JSON.parse(raw) as { text?: string; at?: number }
    if (!prev.text || !prev.at) return false
    if (Date.now() - prev.at > HIVE_REPORT_DEDUPE_MS) return false
    return prev.text === reportText
  } catch {
    return false
  }
}

function recordHiveAlert(reportText: string): void {
  writeFileSync(
    HIVE_REPORT_LAST_ALERT,
    JSON.stringify({ text: reportText, at: Date.now() }),
    'utf8',
  )
}

function stripUrls(text: string): string {`,
);

text = text.replace(
  '  lines.push("", "Ask Big Boss in #general anytime for a fresh check.")',
  '  lines.push("", "Updated automatically when golden paths change.")',
);

text = text.replace(
  `  const { text, voiceBrief } = formatGoldenPathReport(gp)
  await sendTelegramAlert(text, topicId)`,
  `  const { text, voiceBrief } = formatGoldenPathReport(gp)
  const skipAlert = params.skipAlert === true || params.skipAlert === 'true'
  const forceAlert = params.forceAlert === true || params.forceAlert === 'true'
  const deduped = shouldSkipHiveAlert(text, forceAlert)
  if (!skipAlert && !deduped) {
    await sendTelegramAlert(text, topicId)
    recordHiveAlert(text)
  }`,
);

writeFileSync(path, text);
console.log("patched hive.ts");
