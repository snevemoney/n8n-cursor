/**
 * complexity-router — Hermes-like model tiers via before_model_resolve.
 *
 * Markers (highest priority): !smart → complex, !fast → simple, !free → free
 * Agent defaults, keywords, and prompt length fill in when no marker matches.
 */
import { definePluginEntry } from "file:///opt/node22/lib/node_modules/openclaw/dist/plugin-sdk/plugin-entry.js";

const DEFAULT_TIERS = {
  complex: "openrouter/anthropic/claude-sonnet-4-6",
  simple: "openrouter/anthropic/claude-haiku-4-5",
  free: "openrouter/openrouter/free",
};

const DEFAULT_MARKERS = {
  "!smart": "complex",
  "!deep": "complex",
  "!fast": "simple",
  "!quick": "simple",
  "!free": "free",
};

const DEFAULT_AGENT_DEFAULTS = {
  naomi: "simple",
  herald: "simple",
  scout: "simple",
  designer: "simple",
  social: "simple",
  creator: "simple",
};

const DEFAULT_COMPLEX_KEYWORDS = [
  "architect",
  "audit",
  "debug",
  "refactor",
  "implement",
  "deploy",
  "council",
  "strategy",
  "analyze",
  "design",
  "write code",
  "fix the",
];

const DEFAULT_SIMPLE_KEYWORDS = [
  "thanks",
  "thank you",
  "ok",
  "okay",
  "yes",
  "no",
  "ping",
  "got it",
  "sounds good",
];

function splitModelRef(ref) {
  const trimmed = String(ref ?? "").trim();
  const slash = trimmed.indexOf("/");
  if (slash <= 0) {
    return { modelOverride: trimmed || undefined };
  }
  return {
    providerOverride: trimmed.slice(0, slash),
    modelOverride: trimmed.slice(slash + 1),
  };
}

function resolveTierName(prompt, agentId, cfg) {
  const text = String(prompt ?? "").toLowerCase();
  const markers = { ...DEFAULT_MARKERS, ...(cfg.markers ?? {}) };

  for (const [marker, tier] of Object.entries(markers)) {
    if (text.includes(marker.toLowerCase())) {
      return tier;
    }
  }

  const complexKeywords = cfg.complexKeywords ?? DEFAULT_COMPLEX_KEYWORDS;
  if (complexKeywords.some((kw) => text.includes(String(kw).toLowerCase()))) {
    return "complex";
  }

  const simpleKeywords = cfg.simpleKeywords ?? DEFAULT_SIMPLE_KEYWORDS;
  if (simpleKeywords.some((kw) => text.includes(String(kw).toLowerCase()))) {
    return "simple";
  }

  const thresholds = cfg.lengthThresholds ?? { simple: 80, complex: 1200 };
  const len = String(prompt ?? "").trim().length;
  if (len > 0 && len <= (thresholds.simple ?? 80)) {
    return "simple";
  }
  if (len >= (thresholds.complex ?? 1200)) {
    return "complex";
  }

  const agentDefaults = { ...DEFAULT_AGENT_DEFAULTS, ...(cfg.agentDefaults ?? {}) };
  if (agentId && agentDefaults[agentId]) {
    return agentDefaults[agentId];
  }

  return cfg.defaultTier ?? "complex";
}

function tierToOverride(tierName, cfg) {
  const tiers = { ...DEFAULT_TIERS, ...(cfg.tiers ?? {}) };
  const ref = tiers[tierName] ?? tiers.complex ?? DEFAULT_TIERS.complex;
  return splitModelRef(ref);
}

export default definePluginEntry({
  id: "complexity-router",
  name: "Complexity Router",
  description: "Route turns to model tiers (!fast / !smart / !free) via before_model_resolve",
  register(api) {
    const cfg = api.pluginConfig ?? {};

    if (cfg.disabled === true) {
      api.logger?.info?.("complexity-router: disabled via config");
      return;
    }

    api.logger?.info?.("complexity-router: registered (!fast !smart !free)");

    api.on("before_model_resolve", async (event, ctx) => {
      try {
        const prompt = event?.prompt ?? "";
        const agentId = ctx?.agentId ?? "";
        const tier = resolveTierName(prompt, agentId, cfg);
        const override = tierToOverride(tier, cfg);

        api.logger?.info?.(
          `complexity-router: agent=${agentId || "?"} tier=${tier} → ${override.providerOverride ?? "?"}/${override.modelOverride ?? "?"}`
        );

        return override;
      } catch (err) {
        api.logger?.warn?.(`complexity-router: ${String(err)} — passthrough`);
        return;
      }
    });
  },
});
