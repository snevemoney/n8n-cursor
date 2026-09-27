#!/usr/bin/env node
"use strict";

/**
 * Generate packages/contracts/src/telemetry.ts from contracts/telemetry.yaml.
 *
 * Invoked as `node scripts/generate-telemetry.js` from the contracts package
 * (no arguments). Reads the telemetry catalog and writes the telemetry types.
 * Exits 1 when the catalog is missing, empty, unparsable, or not a
 * compilable schema.
 */

const fs = require("fs");
const path = require("path");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const { loadContract } = require("./compile-schema");

const INPUT = path.resolve(__dirname, "../../../contracts/telemetry.yaml");
const OUTPUT = path.resolve(__dirname, "../src/telemetry.ts");

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

function ident(key) {
  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) return key;
  return literal(String(key));
}

function pascal(name) {
  const parts = String(name).split(/[^A-Za-z0-9]+/).filter(Boolean);
  if (parts.length === 0) fail(`cannot name ${name}`);
  const out = parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(out)) fail(`invalid identifier for ${name}`);
  return out;
}

function requireMap(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(`${label} is not a map`);
  const keys = Object.keys(value);
  if (keys.length === 0) fail(`${label} is empty`);
  return keys;
}

function stringList(value, label, allowEmpty) {
  if (value === undefined && allowEmpty) return [];
  if (!Array.isArray(value) || (!allowEmpty && value.length === 0)) fail(`${label} is empty`);
  if (value.some((item) => typeof item !== "string" || item === "")) fail(`${label} has a non-string entry`);
  return value;
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

function constMap(exportName, entries) {
  const seen = new Set();
  const lines = [`export const ${exportName} = {`];
  for (const [name, value] of entries) {
    const key = pascal(name);
    if (seen.has(key)) fail(`${exportName} identifier collision on ${key}`);
    seen.add(key);
    lines.push(`  ${key}: ${literal(value)},`);
  }
  lines.push("} as const;");
  return lines;
}

function generate(doc) {
  if (!doc || typeof doc !== "object" || Array.isArray(doc)) fail(`${INPUT} is not a schema object`);
  const spanNames = requireMap(doc.spans, `${INPUT} spans`);
  const metricNames = requireMap(doc.metrics, `${INPUT} metrics`);
  const logging = doc.logging;
  if (!logging || typeof logging !== "object" || Array.isArray(logging)) fail(`${INPUT} logging is missing`);
  const fields = logging.fields;
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) fail(`${INPUT} logging.fields is missing`);
  const requiredFields = stringList(fields.required, `${INPUT} logging.fields.required`, false);
  const optionalFields = stringList(fields.optional, `${INPUT} logging.fields.optional`, true);
  const levels = requireMap(logging.levels, `${INPUT} logging.levels`);

  const attributeNames = [];
  const seenAttributes = new Set();
  for (const name of spanNames) {
    const span = doc.spans[name];
    if (!span || typeof span !== "object" || Array.isArray(span)) fail(`span ${name} is not an object`);
    if (typeof span.description !== "string" || span.description === "") fail(`span ${name} description is empty`);
    const attributes = span.attributes;
    if (!attributes || typeof attributes !== "object" || Array.isArray(attributes)) {
      fail(`span ${name} attributes are missing`);
    }
    const required = stringList(attributes.required, `span ${name} required attributes`, false);
    const optional = stringList(attributes.optional, `span ${name} optional attributes`, true);
    for (const attr of [...required, ...optional]) {
      if (!seenAttributes.has(attr)) {
        seenAttributes.add(attr);
        attributeNames.push(attr);
      }
    }
  }
  if (attributeNames.length === 0) fail(`${INPUT} span attributes are empty`);

  const labelNames = [];
  const seenLabels = new Set();
  const metricTypes = [];
  for (const name of metricNames) {
    const metric = doc.metrics[name];
    if (!metric || typeof metric !== "object" || Array.isArray(metric)) fail(`metric ${name} is not an object`);
    if (typeof metric.type !== "string" || metric.type === "") fail(`metric ${name} type is empty`);
    if (typeof metric.description !== "string" || metric.description === "") fail(`metric ${name} description is empty`);
    if (!metricTypes.includes(metric.type)) metricTypes.push(metric.type);
    const labels = stringList(metric.labels, `metric ${name} labels`, false);
    for (const label of labels) {
      if (!seenLabels.has(label)) {
        seenLabels.add(label);
        labelNames.push(label);
      }
    }
  }
  if (labelNames.length === 0) fail(`${INPUT} metric labels are empty`);

  const logFieldLines = [
    ...requiredFields.map((name) => `  ${ident(name)}: ${name === "level" ? "LogLevel" : "string"};`),
    ...optionalFields.map((name) => `  ${ident(name)}?: string;`),
  ];
  const overlap = requiredFields.filter((name) => optionalFields.includes(name));
  if (overlap.length > 0) fail(`logging field is both required and optional: ${overlap.join(", ")}`);

  const lines = [
    "// LightningFlow AI Telemetry Schema",
    "// Generated from contracts/telemetry.yaml by packages/contracts/scripts/generate-telemetry.js",
    "// Do not edit by hand.",
    "",
    ...constMap("Spans", spanNames.map((name) => [name, name])),
    "",
    "export type SpanName = typeof Spans[keyof typeof Spans];",
    "",
    ...constMap("Metrics", metricNames.map((name) => [name, name])),
    "",
    "export type MetricName = typeof Metrics[keyof typeof Metrics];",
    "",
    `export type MetricType = ${metricTypes.map(literal).join(" | ")};`,
    "",
    "export interface SpanAttributes {",
    ...attributeNames.map((name) => `  ${ident(name)}?: string;`),
    "}",
    "",
    "export interface MetricLabels {",
    ...labelNames.map((name) => `  ${ident(name)}?: string;`),
    "}",
    "",
    "export type LogLevel =",
    `${levels.map((name) => `  | ${literal(name)}`).join("\n")};`,
    "",
    "export interface LogFields {",
    ...logFieldLines,
    "}",
    "",
  ];
  return { source: lines.join("\n"), spanNames, metricNames };
}

function telemetryRuntime(existing) {
  const startMarker = "export const MetricAttributes = {";
  const start = existing.indexOf(startMarker);
  if (start < 0) fail("src/telemetry.ts is missing MetricAttributes");
  const endMarkers = [
    "export type SpanName = typeof Spans[keyof typeof Spans];",
    "export type SpanAttributeName =",
  ];
  let end = -1;
  for (const marker of endMarkers) {
    const at = existing.indexOf(marker, start);
    if (at >= 0 && (end < 0 || at < end)) end = at;
  }
  if (end < 0) fail("src/telemetry.ts runtime block has no end");
  const block = existing.slice(start, end).trimEnd();
  const aliases = [
    "export type SpanAttributeName = keyof SpanAttributes;",
    "export type MetricAttributeName = typeof MetricAttributes[keyof typeof MetricAttributes];",
    "export type ResourceAttributeName = typeof ResourceAttributes[keyof typeof ResourceAttributes];",
    "export type SpanEventName = typeof SpanEvents[keyof typeof SpanEvents];",
    "export type SpanEventAttributeName = typeof SpanEventAttributes[keyof typeof SpanEventAttributes];",
  ].join("\n");
  return `${block}\n\n${aliases}\n`;
}

function main() {
  if (!fs.existsSync(INPUT)) fail(`cannot read ${INPUT}: file does not exist`);
  if (!fs.existsSync(OUTPUT)) fail(`cannot read ${OUTPUT}: file does not exist`);
  const existing = fs.readFileSync(OUTPUT, "utf8");
  const doc = loadContract(INPUT);
  assertCompilable(doc);
  const { source, spanNames, metricNames } = generate(doc);
  const finalSource = `${source.trimEnd()}\n\n${telemetryRuntime(existing)}`;
  if (!finalSource || finalSource.trim() === "") fail("generator produced no TypeScript");
  for (const token of [
    "export type SpanName",
    "export type MetricName",
    "export interface SpanAttributes",
    "export interface MetricLabels",
    "export interface LogFields",
    "export const MetricAttributes",
    "export const ResourceAttributes",
    "export const SpanEvents",
    "export const SpanEventAttributes",
    "export const defaultTelemetryConfig",
    "export function createSpanAttributes",
    "export function createMetricAttributes",
    "export function createResourceAttributes",
    "export const defaultSamplingConfig",
    "export interface TelemetryConfig",
    "export interface SamplingConfig",
    "export type SpanAttributeName",
    "export type MetricAttributeName",
    "export type ResourceAttributeName",
    "export type SpanEventName",
    "export type SpanEventAttributeName",
  ]) {
    if (!finalSource.includes(token)) fail(`generator omitted ${token}`);
  }
  for (const name of [...spanNames, ...metricNames]) {
    if (!finalSource.includes(literal(name))) fail(`generator omitted ${name}`);
  }
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, finalSource);
  const written = fs.readFileSync(OUTPUT, "utf8");
  if (written !== finalSource) fail(`failed to write ${OUTPUT}`);
  console.log(`generated ${spanNames.length} spans and ${metricNames.length} metrics -> src/telemetry.ts`);
  for (const name of spanNames) console.log(`  span ${name}`);
  for (const name of metricNames) console.log(`  metric ${name}`);
}

main();
