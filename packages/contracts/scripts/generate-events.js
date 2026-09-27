#!/usr/bin/env node
"use strict";

/**
 * Generate packages/contracts/src/events.ts from contracts/events.yaml.
 *
 * Invoked as `node scripts/generate-events.js` from the contracts package
 * (no arguments). Reads the event catalog, compiles each definition, and
 * writes TypeScript interfaces. Exits 1 when the catalog is missing, empty,
 * unparsable, internally inconsistent, or not a compilable schema.
 */

const fs = require("fs");
const path = require("path");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const { loadContract } = require("./compile-schema");

const INPUT = path.resolve(__dirname, "../../../contracts/events.yaml");
const OUTPUT = path.resolve(__dirname, "../src/events.ts");

function fail(message) {
  console.error(message);
  process.exit(1);
}

function literal(value) {
  if (typeof value === "string") {
    return `'${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
  }
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value === null) return "null";
  fail(`unsupported literal ${JSON.stringify(value)}`);
}

function ident(key) {
  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) return key;
  return `'${String(key).replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

function refName(ref) {
  if (typeof ref !== "string") fail(`unsupported $ref: ${JSON.stringify(ref)}`);
  const match = /^#\/definitions\/([A-Za-z_][A-Za-z0-9_]*)$/.exec(ref);
  if (!match) fail(`unsupported $ref: ${ref}`);
  return match[1];
}

function schemaToType(schema, keyIndent) {
  if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
    fail("invalid property schema");
  }
  if (typeof schema.$ref === "string") return refName(schema.$ref);
  if (Array.isArray(schema.allOf)) {
    if (schema.allOf.length === 0) fail("empty allOf");
    return schema.allOf.map((part) => schemaToType(part, keyIndent)).join(" & ");
  }
  if (Array.isArray(schema.oneOf)) {
    if (schema.oneOf.length === 0) fail("empty oneOf");
    return schema.oneOf.map((part) => schemaToType(part, keyIndent)).join(" | ");
  }
  if (Object.prototype.hasOwnProperty.call(schema, "const")) return literal(schema.const);
  if (Array.isArray(schema.enum)) {
    if (schema.enum.length === 0) fail("empty enum");
    return schema.enum.map(literal).join(" | ");
  }
  if (schema.type === "string") return "string";
  if (schema.type === "integer" || schema.type === "number") return "number";
  if (schema.type === "boolean") return "boolean";
  if (schema.type === "null") return "null";
  if (schema.type === "array") {
    const item = schema.items ? schemaToType(schema.items, keyIndent) : "unknown";
    return `Array<${item}>`;
  }
  if (schema.type === "object" || schema.properties) return objectType(schema, keyIndent);
  fail(`unsupported schema: ${JSON.stringify(schema).slice(0, 180)}`);
}

function objectType(schema, keyIndent) {
  const props = schema.properties;
  if (!props || typeof props !== "object" || Array.isArray(props) || Object.keys(props).length === 0) {
    return "Record<string, unknown>";
  }
  const required = new Set(Array.isArray(schema.required) ? schema.required : []);
  const inner = " ".repeat(keyIndent + 2);
  const close = " ".repeat(keyIndent);
  const lines = ["{"];
  for (const [key, propSchema] of Object.entries(props)) {
    const optional = required.has(key) ? "" : "?";
    const type = schemaToType(propSchema, keyIndent + 2);
    lines.push(`${inner}${ident(key)}${optional}: ${type};`);
  }
  lines.push(`${close}}`);
  return lines.join("\n");
}

function objectBody(schema) {
  const rendered = objectType(schema, 0);
  if (!rendered.startsWith("{")) fail("event definition did not render an object body");
  return rendered;
}

function splitAllOf(name, schema) {
  if (!Array.isArray(schema.allOf) || schema.allOf.length === 0) {
    fail(`${name} allOf is empty`);
  }
  const refs = [];
  const bodies = [];
  for (const part of schema.allOf) {
    if (part && typeof part.$ref === "string") {
      refs.push(refName(part.$ref));
      continue;
    }
    if (part && (part.type === "object" || part.properties)) {
      bodies.push(part);
      continue;
    }
    fail(`${name} has an unsupported allOf branch`);
  }
  if (bodies.length !== 1) fail(`${name} must have one object body`);
  return { refs, body: bodies[0] };
}

function requiredKeys(schema, definitions, seen = new Set()) {
  if (!schema || typeof schema !== "object" || seen.has(schema)) return new Set();
  seen.add(schema);
  const out = new Set(Array.isArray(schema.required) ? schema.required : []);
  if (typeof schema.$ref === "string") {
    const name = refName(schema.$ref);
    const target = definitions[name];
    if (!target) fail(`missing definition ${name}`);
    for (const key of requiredKeys(target, definitions, seen)) out.add(key);
  }
  if (Array.isArray(schema.allOf)) {
    for (const part of schema.allOf) {
      for (const key of requiredKeys(part, definitions, seen)) out.add(key);
    }
  }
  return out;
}

function withInheritedRequired(body, inherited) {
  const props = body.properties && typeof body.properties === "object" ? Object.keys(body.properties) : [];
  const own = Array.isArray(body.required) ? body.required : [];
  const required = [...own];
  const seen = new Set(own);
  for (const key of props) {
    if (inherited.has(key) && !seen.has(key)) {
      required.push(key);
      seen.add(key);
    }
  }
  return { ...body, required };
}

function emitDefinition(name, schema, definitions) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) fail(`invalid definition name: ${name}`);
  if (schema && Array.isArray(schema.allOf)) {
    const { refs, body } = splitAllOf(name, schema);
    const inherited = new Set();
    for (const ref of refs) {
      const target = definitions[ref];
      if (!target) fail(`${name} extends missing definition ${ref}`);
      for (const key of requiredKeys(target, definitions)) inherited.add(key);
    }
    const ext = refs.length > 0 ? ` extends ${refs.join(", ")}` : "";
    return `export interface ${name}${ext} ${objectBody(withInheritedRequired(body, inherited))}`;
  }
  if (schema && (schema.type === "object" || schema.properties)) {
    return `export interface ${name} ${objectBody(schema)}`;
  }
  fail(`${name} is not an object schema`);
}

function eventTypeOf(schema) {
  const parts = schema && Array.isArray(schema.allOf) ? schema.allOf : [schema];
  for (const part of parts) {
    const eventType = part && part.properties && part.properties.eventType;
    if (!eventType || typeof eventType !== "object") continue;
    if (typeof eventType.const === "string" && eventType.const !== "") return eventType.const;
    if (Array.isArray(eventType.enum) && eventType.enum.length === 1 && typeof eventType.enum[0] === "string") {
      return eventType.enum[0];
    }
  }
  return null;
}

function registryEventTypes(doc) {
  const groups = doc.eventTypes;
  if (groups === undefined) return [];
  if (!groups || typeof groups !== "object" || Array.isArray(groups)) {
    fail("eventTypes is not a map of event names");
  }
  const found = [];
  const groupNames = Object.keys(groups);
  if (groupNames.length === 0) fail("eventTypes is empty");
  for (const group of groupNames) {
    const list = groups[group];
    if (!Array.isArray(list) || list.length === 0) fail(`eventTypes.${group} is empty`);
    for (const item of list) {
      if (typeof item !== "string" || item === "") fail(`eventTypes.${group} has a non-string entry`);
      found.push(item);
    }
  }
  return found;
}

function assertSameSet(labelA, listA, labelB, listB) {
  const a = new Set(listA);
  const b = new Set(listB);
  if (a.size !== listA.length) fail(`${labelA} contains duplicate event types`);
  if (b.size !== listB.length) fail(`${labelB} contains duplicate event types`);
  for (const item of a) {
    if (!b.has(item)) fail(`${labelA} declares ${item} but ${labelB} omits it`);
  }
  for (const item of b) {
    if (!a.has(item)) fail(`${labelB} lists ${item} but ${labelA} omits it`);
  }
}

function compileDefinitions(definitions) {
  for (const [name, schema] of Object.entries(definitions)) {
    const ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(ajv);
    try {
      ajv.compile({
        $id: `https://lightningflow.local/events/${name}.json`,
        definitions,
        ...schema,
      });
    } catch (err) {
      fail(`${name} is not a compilable schema: ${err.message}`);
    }
  }
}

function generate(doc) {
  if (!doc || typeof doc !== "object" || Array.isArray(doc)) fail(`${INPUT} is not a schema object`);
  const definitions = doc.definitions;
  if (!definitions || typeof definitions !== "object" || Array.isArray(definitions)) {
    fail(`${INPUT} has no definitions`);
  }
  const names = Object.keys(definitions);
  if (names.length === 0) fail(`${INPUT} definitions are empty`);
  if (!Object.prototype.hasOwnProperty.call(definitions, "BaseEvent")) {
    fail(`${INPUT} is missing definitions.BaseEvent`);
  }

  compileDefinitions(definitions);

  const declared = [];
  const interfaces = [];
  for (const name of names) {
    const schema = definitions[name];
    const eventType = eventTypeOf(schema);
    if (name === "BaseEvent") {
      if (eventType) fail("BaseEvent must stay a shared envelope, not a single event type");
    } else if (!eventType) {
      fail(`${name} has no single eventType const or enum`);
    } else {
      declared.push({ name, eventType });
    }
    interfaces.push(emitDefinition(name, schema, definitions));
  }
  if (declared.length === 0) fail(`${INPUT} has no event definitions`);

  const fromRegistry = registryEventTypes(doc);
  if (fromRegistry.length === 0) fail(`${INPUT} eventTypes registry is empty`);
  assertSameSet(
    "definitions",
    declared.map((item) => item.eventType),
    "eventTypes",
    fromRegistry
  );

  const byType = new Map(declared.map((item) => [item.eventType, item.name]));
  const ordered = fromRegistry.map((eventType) => {
    const name = byType.get(eventType);
    if (!name) fail(`missing interface for ${eventType}`);
    return { name, eventType };
  });

  const eventUnion = ordered.map((item) => `  | ${literal(item.eventType)}`).join("\n");
  const interfaceUnion = ordered.map((item) => `  | ${item.name}`).join("\n");
  const lines = [
    "// LightningFlow AI Event Schema",
    "// Generated from contracts/events.yaml by packages/contracts/scripts/generate-events.js",
    "// Do not edit by hand.",
    "",
    "export type EventType =",
    eventUnion + ";",
    "",
    interfaces.join("\n\n"),
    "",
    "export type LightningFlowEvent =",
    interfaceUnion + ";",
    "",
  ];
  return { source: lines.join("\n"), ordered };
}

function main() {
  if (!fs.existsSync(INPUT)) fail(`cannot read ${INPUT}: file does not exist`);
  const doc = loadContract(INPUT);
  const { source, ordered } = generate(doc);
  if (!source || source.trim() === "") fail("generator produced no TypeScript");
  if (!source.includes("export interface BaseEvent")) fail("generator omitted BaseEvent");
  for (const item of ordered) {
    if (!source.includes(`export interface ${item.name}`)) {
      fail(`generator omitted ${item.name}`);
    }
  }
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, source);
  const written = fs.readFileSync(OUTPUT, "utf8");
  if (written !== source) fail(`failed to write ${OUTPUT}`);
  console.log(`generated ${ordered.length} event types -> src/events.ts`);
  for (const item of ordered) {
    console.log(`  ${item.eventType} ${item.name}`);
  }
}

main();
