#!/usr/bin/env node
import {Server} from "@modelcontextprotocol/sdk/server/index.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import {fileURLToPath} from "url";
import YAML from "yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const N8N_URL = process.env.N8N_URL || "https://evenslouis.ca/n8n";
const N8N_API_KEY = process.env.N8N_API_KEY || ""; 
const WORKDIR = process.env.N8N_WORKDIR || "/home/evens/n8n-cursor";

function h(url, opts={}) {
  const headers = {
    "Content-Type": "application/json",
    ...(N8N_API_KEY ? {"X-N8N-API-KEY": N8N_API_KEY} : {})
  };
  return fetch(url, {...opts, headers: {...headers, ...(opts.headers || {})}});
}

const server = new Server(
  { name: "n8n-mcp", version: "1.0.0" },
  {
    capabilities: {
      tools: {
        list: async () => [
          {
            name: "n8n_list_workflows",
            description: "List all n8n workflows (id, name, active).",
            inputSchema: { type: "object", properties: {} }
          },
          {
            name: "n8n_get_workflow",
            description: "Fetch a workflow JSON by ID.",
            inputSchema: { type: "object", required: ["id"], properties: { id: { type: "string" } } }
          },
          {
            name: "n8n_import_json",
            description: "Import a workflow JSON (object) into n8n.",
            inputSchema: { type: "object", required: ["workflow"], properties: { workflow: {} } }
          },
          {
            name: "n8n_import_file",
            description: "Import a workflow JSON from a file path on server.",
            inputSchema: { type: "object", required: ["path"], properties: { path: { type: "string" } } }
          },
          {
            name: "n8n_explain",
            description: "Create Markdown explanation for a workflow JSON file.",
            inputSchema: { type: "object", required: ["path"], properties: { path: { type: "string" } } }
          },
          {
            name: "n8n_compile_spec",
            description: "Compile a YAML spec into n8n JSON and save to workflows/",
            inputSchema: { type: "object", required: ["yaml"], properties: { yaml: { type: "string" } } }
          },
          {
            name: "n8n_validate_spec",
            description: "Validate a YAML workflow spec.",
            inputSchema: { type: "object", required: ["yaml"], properties: { yaml: { type: "string" } } }
          },
          {
            name: "n8n_activate_workflow",
            description: "Activate a workflow by ID.",
            inputSchema: { type: "object", required: ["id"], properties: { id: { type: "string" } } }
          },
          {
            name: "n8n_deactivate_workflow",
            description: "Deactivate a workflow by ID.",
            inputSchema: { type: "object", required: ["id"], properties: { id: { type: "string" } } }
          }
        ]
      }
    }
  }
);

// Tool handlers
server.setRequestHandler("tools/call", async (req) => {
  const { name, arguments: args } = req.params;

  if (name === "n8n_list_workflows") {
    const r = await h(`${N8N_URL}/rest/workflows`);
    if (!r.ok) throw new Error(`n8n API error ${r.status}`);
    const data = await r.json();
    const rows = data.data?.map(w => ({ 
      id: w.id, 
      name: w.name, 
      active: !!w.active,
      updatedAt: w.updatedAt,
      nodes: w.nodes?.length || 0
    })) || [];
    return { content: [{ type: "text", text: JSON.stringify(rows, null, 2) }] };
  }

  if (name === "n8n_get_workflow") {
    const id = args.id;
    const r = await h(`${N8N_URL}/rest/workflows/${id}`);
    if (!r.ok) throw new Error(`n8n API error ${r.status}`);
    const wf = await r.json();
    return { content: [{ type: "text", text: JSON.stringify(wf, null, 2) }] };
  }

  if (name === "n8n_import_json") {
    const body = { ...args.workflow };
    delete body.id; // Remove ID to create new workflow
    const r = await h(`${N8N_URL}/rest/workflows`, { method: "POST", body: JSON.stringify(body) });
    if (!r.ok) throw new Error(`n8n API error ${r.status}: ${await r.text()}`);
    const created = await r.json();
    return { content: [{ type: "text", text: `✅ Imported workflow id=${created.id} name="${created.name}"` }] };
  }

  if (name === "n8n_import_file") {
    const p = args.path;
    const raw = fs.readFileSync(p, "utf8");
    const obj = JSON.parse(raw);
    delete obj.id; // Remove ID to create new workflow
    const r = await h(`${N8N_URL}/rest/workflows`, { method: "POST", body: JSON.stringify(obj) });
    if (!r.ok) throw new Error(`n8n API error ${r.status}: ${await r.text()}`);
    const created = await r.json();
    return { content: [{ type: "text", text: `✅ Imported workflow id=${created.id} name="${created.name}" from ${p}` }] };
  }

  if (name === "n8n_activate_workflow") {
    const id = args.id;
    const r = await h(`${N8N_URL}/rest/workflows/${id}/activate`, { method: "POST" });
    if (!r.ok) throw new Error(`n8n API error ${r.status}`);
    return { content: [{ type: "text", text: `✅ Activated workflow ${id}` }] };
  }

  if (name === "n8n_deactivate_workflow") {
    const id = args.id;
    const r = await h(`${N8N_URL}/rest/workflows/${id}/deactivate`, { method: "POST" });
    if (!r.ok) throw new Error(`n8n API error ${r.status}`);
    return { content: [{ type: "text", text: `✅ Deactivated workflow ${id}` }] };
  }

  if (name === "n8n_explain") {
    const p = args.path;
    const wf = JSON.parse(fs.readFileSync(p, "utf8"));
    const nodes = wf.nodes || [];
    const conns = wf.connections || {};
    const outgoing = (n) => (conns[n]?.main || []).flat().map(e => e.node);

    let md = `# ${wf.name} — Explanation\\n\\n`;
    md += `**Active:** ${wf.active ? "🟢 Yes" : "🔴 No"}  \\n`;
    md += `**Nodes:** ${nodes.length}\\n\\n## Nodes\\n`;
    for (const n of nodes) md += `- **${n.name}** \`(${(n.type||"").split(".").pop()})\`\\n`;
    md += `\\n## Data Flow\\n`;
    for (const n of nodes) {
      const outs = outgoing(n.name);
      if (outs.length) md += `- **${n.name}** ➜ ${outs.join(", ")}\\n`;
    }
    
    const outDir = path.join(WORKDIR, "visualizations");
    fs.mkdirSync(outDir, { recursive: true });
    const base = path.basename(p).replace(/\\.json$/,"");
    const outFile = path.join(outDir, `${base}-explained.md`);
    fs.writeFileSync(outFile, md.replace(/\\\\n/g, '\\n'));
    return { content: [{ type: "text", text: `✅ Wrote explanation: ${outFile}` }] };
  }

  if (name === "n8n_validate_spec") {
    try {
      const spec = YAML.parse(args.yaml);
      
      // Basic validation
      if (!spec.name) throw new Error("Missing required: name");
      if (!spec.trigger) throw new Error("Missing required: trigger");
      if (!spec.steps) throw new Error("Missing required: steps");
      
      return { content: [{ type: "text", text: "✅ YAML spec is valid" }] };
    } catch (error) {
      return { content: [{ type: "text", text: `❌ Validation error: ${error.message}` }] };
    }
  }

  if (name === "n8n_compile_spec") {
    const spec = YAML.parse(args.yaml);
    const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"");
    const nid = () => Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2);

    const nodes = [];
    const idMap = new Map();

    const addNode = (name, type, parameters={}, options={}) => {
      const id = nid();
      nodes.push({ id, name, type, typeVersion: 1, position: [0,0], parameters, ...options });
      return id;
    };

    // trigger
    let startId;
    if (spec.trigger?.type === "webhook") {
      startId = addNode(spec.trigger.name || "Webhook", "n8n-nodes-base.webhook", {
        httpMethod: (spec.trigger.method || "POST").toUpperCase(),
        path: spec.trigger.path || "/incoming",
        responseMode: "onReceived",
      });
    } else if (spec.trigger?.type === "cron") {
      startId = addNode(spec.trigger.name || "Cron", "n8n-nodes-base.cron", {
        triggerTimes: { item: [{ mode: "everyMinute" }] },
      });
    } else {
      throw new Error("Unsupported trigger");
    }

    // steps
    for (const s of (spec.steps||[])) {
      let type = s.type, params = {};
      if (type === "httpRequest") {
        params = {
          method: (s.request?.method || "GET").toUpperCase(),
          url: s.request?.url || "",
          jsonParameters: true,
          options: {},
          ...(s.request?.headers ? { headerParametersJson: JSON.stringify(s.request.headers) } : {}),
          ...(s.request?.query ?   { queryParametersJson:  JSON.stringify(s.request.query) } : {}),
          ...(s.request?.json ?    { bodyParametersJson:   JSON.stringify(s.request.json) } : {}),
        };
        idMap.set(s.id, addNode(s.name || s.id, "n8n-nodes-base.httpRequest", params));
      } else if (type === "set") {
        const values = { string: Object.entries(s.fields||{}).map(([k,v])=>({name:k,value:v})) };
        idMap.set(s.id, addNode(s.name || s.id, "n8n-nodes-base.set", { keepOnlySet: false, values }));
      } else if (type === "function") {
        idMap.set(s.id, addNode(s.name || s.id, "n8n-nodes-base.function", { functionCode: s.code || "return $json;" }));
      } else if (type === "if") {
        idMap.set(s.id, addNode(s.name || s.id, "n8n-nodes-base.if", { mode: "expression", expression: s.condition || "={{true}}" }));
      } else if (type === "merge") {
        idMap.set(s.id, addNode(s.name || s.id, "n8n-nodes-base.merge", { mode: "passThrough" }));
      } else {
        throw new Error(`Unsupported step type: ${type}`);
      }
    }

    // connections
    const connections = {};
    const byName = (id) => nodes.find(n => n.id === id).name;
    const wire = (fromId, outIndex, toId, inIndex) => {
      const key = byName(fromId);
      connections[key] = connections[key] || { main: [[]] };
      const arr = connections[key].main[outIndex] || (connections[key].main[outIndex] = []);
      arr.push({ node: byName(toId), type: "main", index: inIndex });
    };

    if (Array.isArray(spec.connections) && spec.connections.length) {
      for (const c of spec.connections) {
        const [fromBase, branch] = c.from.split(".");
        const outIdx = branch === "false" ? 1 : 0;
        const fromId = fromBase === (spec.trigger?.id || "trigger") ? startId : idMap.get(fromBase);
        const toId = idMap.get(c.to);
        wire(fromId, outIdx, toId, 0);
      }
    } else {
      let prev = startId;
      for (const s of (spec.steps||[])) {
        const next = idMap.get(s.id);
        wire(prev, 0, next, 0);
        prev = next;
      }
    }

    const wf = {
      name: spec.name || "Generated Workflow",
      active: spec.active ?? false,
      nodes,
      connections,
      settings: { executionOrder: "v1" }
    };

    const outDir = path.join(WORKDIR, "workflows");
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, `${slug(wf.name)}.json`);
    fs.writeFileSync(outPath, JSON.stringify(wf, null, 2));
    return { content: [{ type: "text", text: `✅ Compiled to ${outPath}` }] };
  }

  throw new Error(`Unknown tool: ${name}`);
});

await server.connect(new StdioServerTransport());
