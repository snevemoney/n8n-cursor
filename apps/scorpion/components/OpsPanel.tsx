"use client";

import { PhaseBadge } from "./PhaseBadge";
import { useMemo } from "react";
import type { PanelEvent } from "@/lib/useOpsPipeline";

export function OpsPanel({ events }: { events: PanelEvent[] }) {
  const phases = useMemo(() => {
    const map: Record<string, { status: string; reason?: string; payload?: any }> = {};
    for (const e of events) {
      if (e.type === "phase.end") {
        map[e.phase] = e.result;
      }
    }
    return map;
  }, [events]);

  const toolEvt = events.find((e: any) => e.type === "tools.selected") as any;
  const kbEvt = events.find((e: any) => e.type === "kb.query") as any;
  const userToolsEvt = events.find((e: any) => e.type === "userTools.list") as any;
  const execEvt = events.find((e: any) => e.type === "exec.result") as any;

  return (
    <div className="space-y-4 p-4">
      <section>
        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
          Plan
        </h4>
        <PhaseBadge result={phases["plan"] || { status: "pending" }} />
        {phases["plan"]?.payload?.steps && (
          <div className="mt-2 text-xs text-white/60">
            {phases["plan"].payload.steps.length} step{phases["plan"].payload.steps.length !== 1 ? "s" : ""}
          </div>
        )}
      </section>

      <section>
        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
          Council
        </h4>
        <PhaseBadge result={phases["council"] || { status: "pending" }} />
      </section>

      <section>
        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
          Tools
        </h4>
        {toolEvt && (
          <div className="text-xs text-white/80 mb-2">
            Matched <b className="text-emerald-400">{toolEvt.matched_count}</b> of{" "}
            <b className="text-white/60">{toolEvt.installed_count}</b> • {toolEvt.rationale}
          </div>
        )}
        <PhaseBadge result={phases["tools"] || { status: "pending" }} />
      </section>

      <section>
        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
          Knowledge
        </h4>
        {kbEvt && (
          <div className="text-xs text-white/80 mb-2">
            Hits: <b className="text-emerald-400">{kbEvt.hitCount}</b>
          </div>
        )}
        <PhaseBadge result={phases["knowledge"] || { status: "pending" }} />
      </section>

      <section>
        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
          User Tools
        </h4>
        {userToolsEvt && (
          <div className="text-xs text-white/80 mb-2">
            Installed: <b className="text-emerald-400">{userToolsEvt.count}</b>
          </div>
        )}
        <PhaseBadge result={phases["user_tools"] || { status: "pending" }} />
      </section>

      <section>
        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
          Execute
        </h4>
        {execEvt && (
          <div className="text-xs text-white/80 mb-2">
            {execEvt.ok ? "✅" : "❌"} {execEvt.summary}
          </div>
        )}
        <PhaseBadge result={phases["execute"] || { status: "pending" }} />
      </section>
    </div>
  );
}

