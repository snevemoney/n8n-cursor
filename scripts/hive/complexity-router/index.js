/**
 * complexity-router — Hermes-like model tiers via before_model_resolve.
 *
 * Markers (highest priority): !smart → complex, !fast → simple, !free → free
 * Agent defaults, keywords, and prompt length fill in when no marker matches.
 */
import { definePluginEntry } from "file:///opt/node22/lib/node_modules/openclaw/dist/plugin-sdk/plugin-entry.js";
import { resolveBeforeModel } from "./resolve.js";

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
        const resolved = resolveBeforeModel(prompt, agentId, cfg);
        const override = {
          providerOverride: resolved.providerOverride,
          modelOverride: resolved.modelOverride,
        };

        api.logger?.info?.(
          `complexity-router: agent=${agentId || "?"} tier=${resolved.tier} → ${override.providerOverride ?? "?"}/${override.modelOverride ?? "?"}`
        );

        return override;
      } catch (err) {
        api.logger?.warn?.(`complexity-router: ${String(err)} — passthrough`);
        return;
      }
    });
  },
});
