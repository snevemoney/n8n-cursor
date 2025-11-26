#!/usr/bin/env node
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Resolve .env next to this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, ".env");
dotenv.config({ path: envPath });

console.error("[claude-dev] Using .env at:", envPath);

// Check API key
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error("❌ ANTHROPIC_API_KEY not found in environment.");
  process.exit(1);
}

console.error("[claude-dev] ANTHROPIC_API_KEY is set (hidden).");

const anthropic = new Anthropic({ apiKey });

// Parse CLI args
const [question, ...filePaths] = process.argv.slice(2);
if (!question) {
  console.error("Usage: node claude-dev.mjs \"question\" [file1 file2 ...]");
  process.exit(1);
}

// Read files (if any)
let fileContext = "";
for (const p of filePaths) {
  try {
    const content = fs.readFileSync(p, "utf8");
    fileContext += `\n\n===== FILE: ${p} =====\n${content}`;
  } catch (err) {
    console.error(`⚠️ Could not read ${p}:`, err.message);
  }
}

const systemPrompt = `
You are Claude Code running in a local terminal.
You are helping the user work on the Scorpion project (n8n-cursor monorepo).
Be concrete, reference files by path, and show small, focused diffs or code blocks.
If you propose edits, show EXACT code snippets they can paste.
`;

const userPrompt = `
User question:
${question}

Project context from files (if any):
${fileContext || "(no files provided)"}
`;

(async () => {
  try {
    console.error("[claude-dev] Calling Anthropic (model=claude-opus-4-5)...");
    const response = await anthropic.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1400,
      temperature: 0.2,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });
    console.error("[claude-dev] Got response from Anthropic, formatting...");

    const text = response.content
      .filter(part => part.type === "text")
      .map(part => part.text)
      .join("\n\n");

    console.log("\n──────── Claude Code (terminal) ────────\n");
    console.log(text);
    console.log("\n───────────────────────────────────────\n");
  } catch (err) {
    console.error("❌ Claude API error:", err?.response?.data || err.message || err);
    process.exit(1);
  }
})();
