#!/usr/bin/env node
"use strict";

/**
 * Generate packages/contracts/src/errors.ts from contracts/errors.yaml.
 *
 * Invoked as `node scripts/generate-errors.js` from the contracts package
 * (no arguments). Reads the error catalog and writes the error types.
 * Exits 1 when the catalog is missing, empty, unparsable, or not a
 * compilable schema.
 */

const fs = require("fs");
const path = require("path");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const { loadContract } = require("./compile-schema");

const INPUT = path.resolve(__dirname, "../../../contracts/errors.yaml");
const OUTPUT = path.resolve(__dirname, "../src/errors.ts");

const RESPONSE_FIELDS = {
  error: "ErrorCode",
  message: "string",
  description: "string",
  category: "ErrorCategory",
  retryable: "boolean",
  timestamp: "string",
  requestId: "string",
  details: "ErrorDetails",
};

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
  fail(`unsupported literal ${JSON.stringify(value)}`);
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

function union(names) {
  return names.map((name) => `  | ${literal(name)}`).join("\n");
}

function generate(doc) {
  if (!doc || typeof doc !== "object" || Array.isArray(doc)) fail(`${INPUT} is not a schema object`);
  const codes = requireMap(doc.errors, `${INPUT} errors`);
  const categories = requireMap(doc.categories, `${INPUT} categories`);
  const statusCodes = requireMap(doc.httpStatusCodes, `${INPUT} httpStatusCodes`);
  const format = doc.errorResponseFormat;
  if (!format || typeof format !== "object" || Array.isArray(format)) {
    fail(`${INPUT} errorResponseFormat is missing`);
  }
  const formatProps = requireMap(format.properties, `${INPUT} errorResponseFormat.properties`);
  const formatRequired = new Set(Array.isArray(format.required) ? format.required : []);
  if (formatRequired.size === 0) fail(`${INPUT} errorResponseFormat.required is empty`);

  const responseLines = ["export interface ErrorResponse {"];
  for (const field of formatProps) {
    const tsType = RESPONSE_FIELDS[field];
    if (!tsType) fail(`unsupported error response field ${field}`);
    const optional = formatRequired.has(field) ? "" : "?";
    responseLines.push(`  ${field}${optional}: ${tsType};`);
  }
  responseLines.push("}");

  const catalog = [];
  for (const code of codes) {
    const entry = doc.errors[code];
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) fail(`${code} is not an object`);
    if (typeof entry.http !== "number" || !Number.isInteger(entry.http)) fail(`${code} http is not an integer`);
    if (typeof entry.message !== "string" || entry.message === "") fail(`${code} message is empty`);
    if (typeof entry.description !== "string" || entry.description === "") fail(`${code} description is empty`);
    if (typeof entry.category !== "string" || !Object.prototype.hasOwnProperty.call(doc.categories, entry.category)) {
      fail(`${code} category is not in categories`);
    }
    if (typeof entry.retryable !== "boolean") fail(`${code} retryable is not a boolean`);
    catalog.push(
      [
        `  ${literal(code)}: {`,
        `    http: ${literal(entry.http)},`,
        `    message: ${literal(entry.message)},`,
        `    description: ${literal(entry.description)},`,
        `    category: ${literal(entry.category)},`,
        `    retryable: ${literal(entry.retryable)}`,
        "  },",
      ].join("\n")
    );
  }
  if (catalog.length === 0) fail(`${INPUT} errors are empty`);

  const categoryLines = categories.map((name) => {
    const description = doc.categories[name];
    if (typeof description !== "string" || description === "") fail(`category ${name} description is empty`);
    return `  ${literal(name)}: ${literal(description)},`;
  });

  const statusLines = [];
  for (const status of statusCodes) {
    if (!/^[1-9]\d\d$/.test(status)) fail(`invalid HTTP status ${status}`);
    const text = doc.httpStatusCodes[status];
    if (typeof text !== "string" || text === "") fail(`HTTP status ${status} text is empty`);
    statusLines.push(`  ${status}: ${literal(text)},`);
  }

  const lines = [
    "// LightningFlow AI Contracts - Error Types",
    "// Generated from contracts/errors.yaml by packages/contracts/scripts/generate-errors.js",
    "// Do not edit by hand.",
    "",
    "export type ErrorCode =",
    `${union(codes)};`,
    "",
    "export type ErrorCategory =",
    `${union(categories)};`,
    "",
    "export interface ErrorDetails {",
    "  [key: string]: unknown;",
    "}",
    "",
    ...responseLines,
    "",
    "export const errorCatalog: Record<ErrorCode, {",
    "  http: number;",
    "  message: string;",
    "  description: string;",
    "  category: ErrorCategory;",
    "  retryable: boolean;",
    "}> = {",
    ...catalog,
    "};",
    "",
    "export const errorCategories: Record<ErrorCategory, string> = {",
    ...categoryLines,
    "};",
    "",
    "export const httpStatusCodes: Record<number, string> = {",
    ...statusLines,
    "};",
    "",
  ];
  return { source: lines.join("\n"), codes };
}

function main() {
  if (!fs.existsSync(INPUT)) fail(`cannot read ${INPUT}: file does not exist`);
  const doc = loadContract(INPUT);
  assertCompilable(doc);
  const { source, codes } = generate(doc);
  if (!source || source.trim() === "") fail("generator produced no TypeScript");
  for (const token of ["export type ErrorCode", "export type ErrorCategory", "export interface ErrorResponse", "export interface ErrorDetails"]) {
    if (!source.includes(token)) fail(`generator omitted ${token}`);
  }
  for (const code of codes) {
    if (!source.includes(literal(code))) fail(`generator omitted ${code}`);
  }
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, source);
  const written = fs.readFileSync(OUTPUT, "utf8");
  if (written !== source) fail(`failed to write ${OUTPUT}`);
  console.log(`generated ${codes.length} error codes -> src/errors.ts`);
  for (const code of codes) console.log(`  ${code}`);
}

main();
