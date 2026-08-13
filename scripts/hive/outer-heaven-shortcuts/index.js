import { definePluginEntry } from "file:///opt/node22/lib/node_modules/openclaw/dist/plugin-sdk/plugin-entry.js";

const HIVE_PATTERNS = [
  /hive\s+report/i,
  /golden\s+path/i,
  /weekly\s+scoreboard/i,
  /how\s+is\s+the\s+hive/i,
  /^scoreboard$/i,
  /hive_report/i,
];

const HELP_PATTERNS = [
  /^help$/i,
  /^menu$/i,
  /^commands$/i,
  /what\s+can\s+you\s+do/i,
  /^\/help$/i,
  /^\/menu$/i,
];

const STATUS_PATTERNS = [
  /^status$/i,
  /^health$/i,
  /^ping$/i,
  /system\s+status/i,
  /^\/status$/i,
];

const ROSTER_PATTERNS = [
  /^agents$/i,
  /^roster$/i,
  /^topics$/i,
  /who\s+is\s+here/i,
  /^\/agents$/i,
];

const QUEUE_PATTERNS = [/^queue$/i, /ce\s+queue/i, /^\/queue$/i];

const WORKFLOWS_PATTERNS = [/^workflows$/i, /^n8n$/i, /list\s+workflows/i, /^\/workflows$/i];

const MISSIONS_PATTERNS = [/^missions$/i, /^ops$/i, /open\s+missions/i, /^\/missions$/i];

const HITL_PATTERNS = [/^hitl$/i, /^tier\s*3$/i, /what.*blocked/i, /^\/hitl$/i];

const VOICE_REPLY_PATTERNS = [
  /read\s+(it\s+)?aloud/i,
  /voice\s+reply/i,
  /send\s+(as\s+)?voice/i,
  /as\s+a\s+voice\s+note/i,
  /speak\s+(this|it)/i,
  /say\s+(this|it)\s+out\s+loud/i,
];

const voiceRequested = new Map();

function wantsVoiceReply(text) {
  return VOICE_REPLY_PATTERNS.some((p) => p.test(String(text ?? "")));
}

function sessionKeyFrom(ctx, event) {
  return ctx?.sessionKey ?? event?.sessionKey ?? "";
}

function normalizeBody(text) {
  return String(text ?? "")
    .trim()
    .replace(/^@\w+\s+/, "");
}

function matchesAny(text, patterns) {
  if (!text) return false;
  return patterns.some((p) => p.test(text));
}

async function callPhilanthropyTool(tool, params = {}) {
  const res = await fetch("http://127.0.0.1:3002/api/agent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tool, params }),
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json();
  return { res, data };
}

async function runHiveReport(body, api) {
  api.logger?.info?.(`outer-heaven-shortcuts: hive report "${body.slice(0, 80)}"`);
  const { res, data } = await callPhilanthropyTool("hive_send_report", {
    agentId: "bigboss",
    correlationId: `hive-shortcut-${Date.now()}`,
    triggerPhrase: body.slice(0, 200),
    skipAlert: true,
    voice: /voice|spoken|read it/i.test(body),
  });
  if (!res.ok || !data.ok) {
    const err = data.error ?? data.details ?? `HTTP ${res.status}`;
    return { handled: true, text: `Could not pull the hive report: ${err}` };
  }
  return {
    handled: true,
    text: data.summary ?? `Hive: ${data.passCount}/${data.total} golden paths OK`,
  };
}

const HITL_OPERATOR_LINKS = {
  money: "https://evenslouis.ca/pro",
  client_send: "https://evenslouis.ca/pro",
  deploy: "https://github.com/snevemoney/n8n-cursor/pulls",
  secrets: "https://evenslouis.ca/n8n",
};

function inferHitlCategory(summary, type) {
  const hay = `${summary ?? ""} ${type ?? ""}`.toLowerCase();
  if (hay.includes("client_send") || hay.includes("client send")) return "client_send";
  if (hay.includes("money") || hay.includes("billing") || hay.includes("stripe")) return "money";
  if (hay.includes("deploy")) return "deploy";
  if (hay.includes("secret") || hay.includes("oauth") || hay.includes("credential")) return "secrets";
  return null;
}

function hitlLinkFor(category, summary, type) {
  const cat = category ?? inferHitlCategory(summary, type);
  return (cat && HITL_OPERATOR_LINKS[cat]) || HITL_OPERATOR_LINKS.money;
}

async function runQueue() {
  const { res, data } = await callPhilanthropyTool("ce_list_actions", { limit: 8 });
  if (!res.ok || !data.ok) {
    return { handled: true, text: `CE queue unavailable: ${data.error ?? res.status}` };
  }
  const actions = data.data?.actions ?? [];
  if (!actions.length) {
    return { handled: true, text: "CE queue empty — no pending HITL audit rows." };
  }
  const lines = ["💼 CE queue (latest)", ""];
  for (const a of actions) {
    const flag = a.resolved ? "✓" : a.hitl ? "⏸" : "·";
    lines.push(`${flag} ${a.id.slice(0, 8)}… ${a.summary}`);
  }
  lines.push("", "Resolve: *ce_approve_action* / *ce_reject_action* + actionId (ledger only; /pro for money).");
  lines.push("Open Tier 3: *hitl*");
  return { handled: true, text: lines.join("\n") };
}

async function runWorkflows() {
  const { res, data } = await callPhilanthropyTool("n8n_list_workflows", { limit: 12 });
  if (!res.ok || !data.ok) {
    return { handled: true, text: `n8n list failed: ${data.error ?? res.status}` };
  }
  const workflows = data.data?.workflows ?? [];
  const catalog = data.data?.catalog ?? [];
  const lines = ["⚙️ n8n workflows", ""];
  if (workflows.length) {
    for (const w of workflows.slice(0, 10)) {
      lines.push(`${w.active ? "🟢" : "⚪"} ${w.name} (${w.id})`);
    }
  } else {
    lines.push("(no workflows — check N8N_API_KEY)");
  }
  if (catalog.length) {
    lines.push("", "📋 Catalog triggers (via Big Boss tool):");
    for (const c of catalog) {
      lines.push(`• ${c.name}${c.hitl ? " ⏸ HITL" : ""}`);
    }
  }
  lines.push("", "Trigger: ask Big Boss *n8n_trigger_catalog_webhook* + name.");
  return { handled: true, text: lines.join("\n") };
}

async function runHitl() {
  const [queueResult, missionsResult] = await Promise.all([
    callPhilanthropyTool("ce_list_actions", { limit: 20 }),
    callPhilanthropyTool("scorpion_list_missions", { limit: 40 }),
  ]);

  const lines = ["🔒 Tier 3 HITL — operator only (never auto from Telegram)", ""];

  const openQueue = [];
  if (queueResult.res.ok && queueResult.data.ok) {
    const actions = queueResult.data.data?.actions ?? [];
    for (const a of actions) {
      if (a.resolved) continue;
      if (a.hitl || /hitl|tier3/i.test(`${a.summary ?? ""} ${a.type ?? ""}`)) {
        openQueue.push(a);
      }
    }
  }

  const openMissions = [];
  if (missionsResult.res.ok && missionsResult.data.ok) {
    const missions = missionsResult.data.data?.missions ?? missionsResult.data.missions ?? [];
    for (const m of missions) {
      if (m.status === "need_hitl" || m.status === "blocked") {
        openMissions.push(m);
      }
    }
  }

  if (openQueue.length) {
    lines.push(`💼 CE proposals (${openQueue.length})`);
    for (const a of openQueue.slice(0, 6)) {
      const link = hitlLinkFor(null, a.summary, a.type);
      lines.push(`⏸ ${a.id.slice(0, 8)}… ${a.summary}`);
      lines.push(`   → ${link}`);
    }
    if (openQueue.length > 6) lines.push(`   … +${openQueue.length - 6} more (*queue* for full list)`);
    lines.push("");
  }

  if (openMissions.length) {
    lines.push(`🦂 Scorpion missions (${openMissions.length})`);
    for (const m of openMissions.slice(0, 6)) {
      const meta = m.metadata && typeof m.metadata === "object" ? m.metadata : {};
      const goal = m.goal?.slice(0, 55) ?? m.jobType ?? m.correlationId;
      const link = hitlLinkFor(meta.category, goal, m.jobType);
      lines.push(`⏸ ${m.status} · ${m.correlationId?.slice(0, 18) ?? "?"}…`);
      lines.push(`   ${goal}`);
      lines.push(`   → ${link}`);
    }
    if (openMissions.length > 6) lines.push(`   … +${openMissions.length - 6} more (*missions*)`);
    lines.push("");
  }

  if (!openQueue.length && !openMissions.length) {
    lines.push("✅ No open Tier 3 proposals right now.");
    lines.push("");
  }

  lines.push("Operator surfaces:");
  lines.push("• Money / client send → https://evenslouis.ca/pro");
  lines.push("• n8n credentials / OAuth → https://evenslouis.ca/n8n");
  lines.push("• Deploy → GitHub PR + you verify");
  lines.push("");
  lines.push("Tier 2 on Telegram: *queue* · *workflows* · *missions*");
  lines.push("Propose only: Big Boss *hitl_propose_action*");

  if (!queueResult.res.ok && !missionsResult.res.ok) {
    return {
      handled: true,
      text: `HITL data unavailable (CE: ${queueResult.data.error ?? queueResult.res.status}, missions: ${missionsResult.data.error ?? missionsResult.res.status}).\n\nhttps://evenslouis.ca/pro\nhttps://evenslouis.ca/n8n`,
    };
  }

  return { handled: true, text: lines.join("\n") };
}

async function runMissions() {
  const { res, data } = await callPhilanthropyTool("scorpion_list_missions", { limit: 10 });
  if (!res.ok || !data.ok) {
    return { handled: true, text: `Missions unavailable: ${data.error ?? res.status}` };
  }
  const missions = data.data?.missions ?? [];
  if (!missions.length) {
    return { handled: true, text: "No hive missions registered yet." };
  }
  const lines = ["🦂 Scorpion missions", ""];
  for (const m of missions) {
    lines.push(`${m.status} · ${m.correlationId} — ${m.goal?.slice(0, 60) ?? m.jobType}`);
  }
  return { handled: true, text: lines.join("\n") };
}

async function runStatus() {
  const checks = [
    { name: "OpenClaw", url: "http://127.0.0.1:18789/health" },
    { name: "Philanthropy", url: "http://127.0.0.1:3002/api/health" },
    { name: "Embedder", url: "http://127.0.0.1:8000/health" },
    { name: "Scorpion", url: "https://evenslouis.ca/scorpion/api/hive/golden-paths" },
  ];

  const lines = ["Outer Heaven — quick health"];
  for (const check of checks) {
    try {
      const res = await fetch(check.url, { signal: AbortSignal.timeout(5000) });
      lines.push(`${res.ok ? "✅" : "⚠️"} ${check.name} (${res.status})`);
    } catch {
      lines.push(`❌ ${check.name} (unreachable)`);
    }
  }
  lines.push("", "Try: *queue* · *hitl* · *workflows* · *missions* · *hive report*");
  return { handled: true, text: lines.join("\n") };
}

function runHelp(event) {
  const agent = event?.agentId ?? event?.sessionKey?.split(":")?.pop() ?? "this agent";
  const text = [
    "Hey — I'm here. Quick commands (instant, no wait):",
    "",
    "• *hive report* / *scoreboard* — golden paths",
    "• *status* — gateway + tools health",
    "• *queue* — CE audit queue (Tier 2)",
    "• *workflows* — n8n + catalog (Tier 2)",
    "• *hitl* — open Tier 3 proposals + /pro & n8n links",
    "• *missions* — Scorpion hive missions",
    "• *agents* / *topics* — 17-agent map",
    "• *help* — this menu",
    "",
    "Model tiers: *!fast* (Haiku), *!smart* (Sonnet), *!free*",
    "Voice out: *read it aloud* / *voice reply*",
    "",
    `Routed to: ${agent}`,
    "Lanes: Karpathy→Forge · Dexter→#council · Business→Ocelot",
  ].join("\n");
  return { handled: true, text };
}

function runRoster() {
  const text = [
    "Outer Heaven — 17 agents (Telegram topics)",
    "",
    "👑 Big Boss → #general (1)",
    "🧠 SolidSnake + VenomSnake → #council (163) · LiquidSnake → #autoresearch (9)",
    "⚙️ Sigint (8) · Naomi (12) · Herald (164) · Forge (10) · Ledger (162)",
    "💼 Business (417) · Scout (418) · Radar (419) · Voice (420)",
    "   Designer (421) · Social (422) · Creator (423) · Ocelot (1651)",
    "",
    "📡 #live-activity (424) · #knowledge (11) · #alerts (13)",
  ].join("\n");
  return { handled: true, text };
}

async function routeShortcut(body, event, api) {
  const text = normalizeBody(body);
  if (matchesAny(text, HIVE_PATTERNS)) return runHiveReport(text, api);
  if (matchesAny(text, STATUS_PATTERNS)) return runStatus();
  if (matchesAny(text, QUEUE_PATTERNS)) return runQueue();
  if (matchesAny(text, WORKFLOWS_PATTERNS)) return runWorkflows();
  if (matchesAny(text, MISSIONS_PATTERNS)) return runMissions();
  if (matchesAny(text, HITL_PATTERNS)) return runHitl();
  if (matchesAny(text, HELP_PATTERNS)) return runHelp(event);
  if (matchesAny(text, ROSTER_PATTERNS)) return runRoster();
  return undefined;
}

export default definePluginEntry({
  id: "hive-report-shortcut",
  name: "Outer Heaven Shortcuts",
  description: "Hermes-like instant commands: help, status, queue, workflows, hive report",
  register(api) {
    if (api.pluginConfig?.enabled === false) return;
    api.logger?.info?.("outer-heaven-shortcuts: registered");

    const tryHandle = async (body, event) => routeShortcut(body, event, api);

    api.on("before_dispatch", async (event) => {
      const body = String(event?.body ?? event?.content ?? "");
      return (await tryHandle(body, event)) ?? undefined;
    });

    api.on("before_agent_reply", async (event, ctx) => {
      const body = String(event?.cleanedBody ?? event?.body ?? "");
      const key = sessionKeyFrom(ctx, event);
      if (key && wantsVoiceReply(body)) {
        voiceRequested.set(key, true);
      }
      const result = await tryHandle(body, event);
      if (!result) return undefined;
      return {
        handled: true,
        reply: { text: result.text },
        reason: "outer-heaven-shortcuts",
      };
    });

    api.on("before_prompt_build", async (event, ctx) => {
      const prompt = String(event?.prompt ?? "");
      const key = sessionKeyFrom(ctx, event);
      if (!wantsVoiceReply(prompt)) return undefined;
      if (key) voiceRequested.set(key, true);
      return {
        appendSystemContext:
          "Operator requested a voice note reply on Telegram. Put [[audio_as_voice]] on its own line immediately before the spoken text. Keep it concise for TTS.",
      };
    });

    api.on("message_sending", async (event, ctx) => {
      const key = sessionKeyFrom(ctx, event);
      if (!key || !voiceRequested.get(key)) return undefined;
      voiceRequested.delete(key);
      const content = String(event?.content ?? "");
      if (content.includes("[[audio_as_voice]]")) return undefined;
      return { content: `[[audio_as_voice]]\n${content}` };
    });
  },
});
