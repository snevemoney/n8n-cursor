#!/usr/bin/env node
"use strict";

/**
 * Generate packages/contracts/src/flags.ts from contracts/flags.schema.json.
 *
 * Invoked as `node scripts/generate-flags.js` from the contracts package
 * (no arguments). Reads the flag catalog and writes the feature-flag types.
 * Exits 1 when the catalog is missing, empty, unparsable, or not a
 * compilable schema.
 */

const fs = require("fs");
const path = require("path");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const { loadContract } = require("./compile-schema");

const INPUT = path.resolve(__dirname, "../../../contracts/flags.schema.json");
const OUTPUT = path.resolve(__dirname, "../src/flags.ts");
const ENVIRONMENTS = ["int", "staging", "prod"];

function fail(message) {
  console.error(message);
  process.exit(1);
}

function literal(value) {
  if (typeof value === "string") {
    return `'${value
      .replace(/\\/g, "\\\\")
      .replace(/'/g, "\\'")
      .replace(/\r/g, "\\r")
      .replace(/\n/g, "\\n")}'`;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) fail(`unsupported number ${value}`);
    return String(value);
  }
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) return `[${value.map(literal).join(", ")}]`;
  fail(`unsupported literal ${JSON.stringify(value)}`);
}

function ident(key) {
  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) return key;
  return literal(String(key));
}

function requireMap(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(`${label} is not a map`);
  const keys = Object.keys(value);
  if (keys.length === 0) fail(`${label} is empty`);
  return keys;
}

function assertCompilable(doc) {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  try {
    ajv.compile(doc);
  } catch (err) {
    fail(`${INPUT} is not a compilable schema: ${err.message}`);
  }
}

function flagType(name, schema) {
  const type = schema.type;
  if (type === "boolean") return "boolean";
  if (type === "integer" || type === "number") return "number";
  if (type === "string") {
    if (schema.enum === undefined) return "string";
    if (!Array.isArray(schema.enum) || schema.enum.length === 0) fail(`${name} enum is empty`);
    if (schema.enum.some((item) => typeof item !== "string" || item === "")) {
      fail(`${name} enum must be non-empty strings`);
    }
    return schema.enum.map(literal).join(" | ");
  }
  if (type === "array") {
    const items = schema.items;
    if (!items || typeof items !== "object" || items.type !== "string") {
      fail(`${name} array items must be strings`);
    }
    return "string[]";
  }
  fail(`${name} has unsupported type ${JSON.stringify(type)}`);
}

function assertDefault(name, schema) {
  if (!Object.prototype.hasOwnProperty.call(schema, "default")) fail(`${name} is missing default`);
  const value = schema.default;
  if (schema.type === "boolean" && typeof value !== "boolean") fail(`${name} default is not a boolean`);
  if ((schema.type === "integer" || schema.type === "number") && typeof value !== "number") {
    fail(`${name} default is not a number`);
  }
  if (schema.type === "string") {
    if (typeof value !== "string") fail(`${name} default is not a string`);
    if (Array.isArray(schema.enum) && !schema.enum.includes(value)) {
      fail(`${name} default is not in its enum`);
    }
  }
  if (schema.type === "array") {
    if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
      fail(`${name} default is not an array of strings`);
    }
  }
}

function assertEnvironments(name, schema) {
  const environments = schema.environments;
  if (environments === undefined) return;
  requireMap(environments, `${name} environments`);
  for (const key of Object.keys(environments)) {
    if (!ENVIRONMENTS.includes(key)) fail(`${name} has unknown environment ${key}`);
  }
}

function generate(doc) {
  if (!doc || typeof doc !== "object" || Array.isArray(doc)) fail(`${INPUT} is not a schema object`);
  const names = requireMap(doc.properties, `${INPUT} properties`);
  const required = new Set(Array.isArray(doc.required) ? doc.required : []);
  for (const name of required) {
    if (!Object.prototype.hasOwnProperty.call(doc.properties, name)) {
      fail(`${INPUT} required flag ${name} is not in properties`);
    }
  }

  const seenTypes = [];
  const fields = [];
  const defaults = [];
  for (const name of names) {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) fail(`invalid flag name: ${name}`);
    const schema = doc.properties[name];
    if (!schema || typeof schema !== "object" || Array.isArray(schema)) fail(`${name} is not an object`);
    if (typeof schema.description !== "string" || schema.description === "") {
      fail(`${name} is missing a description`);
    }
    const tsType = flagType(name, schema);
    assertDefault(name, schema);
    assertEnvironments(name, schema);
    if (!seenTypes.includes(schema.type)) seenTypes.push(schema.type);
    const optional = required.has(name) ? "" : "?";
    fields.push(`  ${ident(name)}${optional}: ${tsType};`);
    defaults.push(`  ${ident(name)}: ${literal(schema.default)},`);
  }
  if (fields.length === 0) fail(`${INPUT} properties are empty`);

  const flagTypeUnion = seenTypes.map(literal).join(" | ");
  const lines = [
    "// LightningFlow AI Contracts - Feature Flag Types",
    "// Generated from contracts/flags.schema.json by packages/contracts/scripts/generate-flags.js",
    "// Do not edit by hand.",
    "",
    "export type FlagValue = boolean | number | string | string[];",
    "",
    `export type FlagType = ${flagTypeUnion};`,
    "",
    "export interface FlagConfig {",
    "  type: FlagType;",
    "  default: FlagValue;",
    "  description: string;",
    "  environments?: {",
    "    int?: FlagValue;",
    "    staging?: FlagValue;",
    "    prod?: FlagValue;",
    "  };",
    "  sunsetOn?: string;",
    "}",
    "",
    "export interface FeatureFlags {",
    ...fields,
    "}",
    "",
    "export const flagDefaults: FeatureFlags = {",
    ...defaults,
    "};",
    "",
  ];
  return { source: lines.join("\n"), names };
}

function flagsRuntime(existing) {
  const startMarker = "export type Environment = 'int' | 'staging' | 'prod';";
  const start = existing.indexOf(startMarker);
  if (start < 0) fail("src/flags.ts is missing Environment");
  let tail = existing.slice(start).trimEnd();
  const asserted = "} as FeatureFlags;";
  if (!tail.includes(asserted)) {
    const needle =
      "this.getNumberFlag('FF_LIGHTNING_NETWORK_CHECK_INTERVAL_MS', 30000)\n    };";
    const replacement =
      "this.getNumberFlag('FF_LIGHTNING_NETWORK_CHECK_INTERVAL_MS', 30000)\n    } as FeatureFlags;";
    if (!tail.includes(needle)) fail("src/flags.ts loadFlags return is not in the expected shape");
    tail = tail.replace(needle, replacement);
  }
  if (!tail.includes("export class FlagLoader")) fail("src/flags.ts is missing FlagLoader");
  if (!tail.includes("export function validateFlagSchema")) fail("src/flags.ts is missing validateFlagSchema");
  return `${tail}\n`;
}

function main() {
  if (!fs.existsSync(INPUT)) fail(`cannot read ${INPUT}: file does not exist`);
  if (!fs.existsSync(OUTPUT)) fail(`cannot read ${OUTPUT}: file does not exist`);
  const existing = fs.readFileSync(OUTPUT, "utf8");
  const doc = loadContract(INPUT);
  assertCompilable(doc);
  const { source, names } = generate(doc);
  const finalSource = `${source.trimEnd()}\n\n${flagsRuntime(existing)}`;
  if (!finalSource || finalSource.trim() === "") fail("generator produced no TypeScript");
  if (!finalSource.includes("export interface FeatureFlags")) fail("generator omitted FeatureFlags");
  if (!finalSource.includes("export type FlagValue")) fail("generator omitted FlagValue");
  if (!finalSource.includes("export interface FlagConfig")) fail("generator omitted FlagConfig");
  if (!finalSource.includes("export class FlagLoader")) fail("generator omitted FlagLoader");
  if (!finalSource.includes("export function validateFlagSchema")) fail("generator omitted validateFlagSchema");
  for (const name of names) {
    if (!finalSource.includes(name)) fail(`generator omitted ${name}`);
  }
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, finalSource);
  const written = fs.readFileSync(OUTPUT, "utf8");
  if (written !== finalSource) fail(`failed to write ${OUTPUT}`);
  console.log(`generated ${names.length} flags -> src/flags.ts`);
  for (const name of names) console.log(`  ${name}`);
}

main();
