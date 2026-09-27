#!/usr/bin/env node
"use strict";

/**
 * Compile one contract file the way `ajv validate -s` does when the CLI is absent.
 * Extra catalog keywords (version, environments) are allowed. A file that does
 * not parse, or a schema Ajv refuses, exits 1. This script does not exit 0 on
 * an empty or unreadable file.
 */

const fs = require("fs");
const path = require("path");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");

function fail(message) {
  console.error(message);
  process.exit(1);
}

function stripComment(line) {
  let quote = null;
  for (let i = 0; i < line.length; i += 1) {
    const c = line[i];
    if (quote) {
      if (c === quote && line[i - 1] !== "\\") quote = null;
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      continue;
    }
    if (c === "#" && (i === 0 || line[i - 1] === " " || line[i - 1] === "\t")) {
      return line.slice(0, i).replace(/[ \t]+$/, "");
    }
  }
  return line.replace(/[ \t]+$/, "");
}

function indentOf(line) {
  let n = 0;
  while (line[n] === " ") n += 1;
  return n;
}

function parseScalar(raw) {
  const s = raw.trim();
  if (s === "" || s === "~" || s === "null" || s === "Null" || s === "NULL") return null;
  if (s === "true" || s === "True" || s === "TRUE") return true;
  if (s === "false" || s === "False" || s === "FALSE") return false;
  if (/^-?(0|[1-9]\d*)$/.test(s)) return Number(s);
  if (/^-?(0|[1-9]\d*)\.\d+$/.test(s)) return Number(s);
  if (s.length >= 2 && s.startsWith('"') && s.endsWith('"')) {
    return s
      .slice(1, -1)
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");
  }
  if (s.length >= 2 && s.startsWith("'") && s.endsWith("'")) {
    return s.slice(1, -1).replace(/''/g, "'");
  }
  return s;
}

function parseFlowSeq(raw) {
  const inner = raw.slice(1, -1).trim();
  if (inner === "") return [];
  const parts = [];
  let cur = "";
  let quote = null;
  for (let i = 0; i < inner.length; i += 1) {
    const c = inner[i];
    if (quote) {
      cur += c;
      if (c === quote && inner[i - 1] !== "\\") quote = null;
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      cur += c;
      continue;
    }
    if (c === ",") {
      parts.push(parseScalar(cur));
      cur = "";
      continue;
    }
    cur += c;
  }
  if (quote) fail("unclosed quote in flow sequence");
  parts.push(parseScalar(cur));
  return parts;
}

function parseValue(raw) {
  const s = raw.trim();
  if (s.startsWith("[")) {
    if (!s.endsWith("]")) fail("unclosed flow sequence");
    return parseFlowSeq(s);
  }
  return parseScalar(s);
}

function splitKey(content) {
  let quote = null;
  for (let i = 0; i < content.length; i += 1) {
    const c = content[i];
    if (quote) {
      if (c === quote && content[i - 1] !== "\\") quote = null;
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      continue;
    }
    if (c === ":" && (i + 1 === content.length || content[i + 1] === " " || content[i + 1] === "\t")) {
      const rawKey = content.slice(0, i).trim();
      if (!rawKey) return null;
      const key = rawKey.startsWith('"') || rawKey.startsWith("'") ? parseScalar(rawKey) : rawKey;
      if (typeof key !== "string" || key === "") return null;
      const value = content.slice(i + 1).trim();
      return { key, inline: value !== "", value };
    }
  }
  return null;
}

function parseNode(lines, index, minIndent) {
  if (index >= lines.length) return { value: null, next: index };
  const ind = indentOf(lines[index]);
  if (ind < minIndent) return { value: null, next: index };
  const content = lines[index].slice(ind);
  if (content === "-" || content.startsWith("- ")) return parseSeq(lines, index, ind);
  return parseMap(lines, index, ind);
}

function parseSeq(lines, index, ind) {
  const arr = [];
  let i = index;
  while (i < lines.length && indentOf(lines[i]) === ind) {
    const content = lines[i].slice(ind);
    if (content !== "-" && !content.startsWith("- ")) break;
    const after = content === "-" ? "" : content.slice(2);
    if (after === "") {
      const nested = parseNode(lines, i + 1, ind + 1);
      arr.push(nested.value);
      i = nested.next;
      continue;
    }
    const first = splitKey(after);
    if (first) {
      const keyIndent = ind + 2;
      const map = {};
      i += 1;
      if (first.inline) {
        map[first.key] = parseValue(first.value);
      } else {
        const nested = parseNode(lines, i, keyIndent + 1);
        map[first.key] = nested.value;
        i = nested.next;
      }
      while (i < lines.length && indentOf(lines[i]) === keyIndent) {
        const more = lines[i].slice(keyIndent);
        if (more === "-" || more.startsWith("- ")) break;
        const sp = splitKey(more);
        if (!sp) break;
        i += 1;
        if (sp.inline) {
          map[sp.key] = parseValue(sp.value);
        } else {
          const nested = parseNode(lines, i, keyIndent + 1);
          map[sp.key] = nested.value;
          i = nested.next;
        }
      }
      arr.push(map);
      continue;
    }
    arr.push(parseValue(after));
    i += 1;
  }
  return { value: arr, next: i };
}

function parseMap(lines, index, ind) {
  const map = {};
  let i = index;
  while (i < lines.length && indentOf(lines[i]) === ind) {
    const content = lines[i].slice(ind);
    if (content === "-" || content.startsWith("- ")) break;
    const sp = splitKey(content);
    if (!sp) break;
    i += 1;
    if (sp.inline) {
      map[sp.key] = parseValue(sp.value);
    } else {
      const nested = parseNode(lines, i, ind + 1);
      map[sp.key] = nested.value;
      i = nested.next;
    }
  }
  return { value: map, next: i };
}

function parseYaml(text) {
  const lines = [];
  for (const raw of text.replace(/^\uFEFF/, "").split(/\r?\n/)) {
    const stripped = stripComment(raw);
    if (stripped.trim() === "") continue;
    if (stripped.startsWith("\t") || stripped.slice(indentOf(stripped)).startsWith("\t")) {
      fail("tabs are not allowed in contract YAML");
    }
    lines.push(stripped);
  }
  if (lines.length === 0) fail("empty contract file");
  const parsed = parseNode(lines, 0, 0);
  if (parsed.next !== lines.length) {
    fail(`unparsed YAML at line content: ${lines[parsed.next]}`);
  }
  return parsed.value;
}

function loadContract(file) {
  let text;
  try {
    text = fs.readFileSync(file, "utf8");
  } catch (err) {
    fail(`cannot read ${file}: ${err.message}`);
  }
  if (text.trim() === "") fail(`empty contract file: ${file}`);
  if (file.endsWith(".json")) {
    try {
      return JSON.parse(text);
    } catch (err) {
      fail(`invalid JSON in ${file}: ${err.message}`);
    }
  }
  try {
    return parseYaml(text);
  } catch (err) {
    if (err && err.message && process.exitCode !== 1) fail(`${file}: ${err.message}`);
    throw err;
  }
}

function compile(file) {
  const schema = loadContract(file);
  if (schema === null || typeof schema !== "object") {
    fail(`${file} is not an object schema`);
  }
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  try {
    ajv.compile(schema);
  } catch (err) {
    fail(`${file} is not a compilable schema: ${err.message}`);
  }
  console.log(`compiled ${path.basename(file)}`);
}

const file = process.argv[2];
if (!file) fail("usage: node scripts/compile-schema.js <schema.yaml|schema.json>");
compile(path.resolve(file));
