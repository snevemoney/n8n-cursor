import { useEffect, useState } from "react";

export type PanelEvent =
  | { type: "phase.start"; phase: string; objective: string }
  | { type: "phase.end"; phase: string; result: { status: "done" | "skipped" | "error"; reason?: string; payload?: any } }
  | { type: "tools.selected"; matched: string[]; matched_count: number; installed_count: number; rationale: string }
  | { type: "kb.query"; query: string; hitCount: number }
  | { type: "userTools.list"; count: number }
  | { type: "exec.result"; ok: boolean; summary: string };

export function useOpsPipeline(objective: string, context: any) {
  const [events, setEvents] = useState<PanelEvent[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!objective || objective.trim().length === 0) {
      setEvents([]);
      setDone(false);
      return;
    }

    console.log('[useOpsPipeline] Starting pipeline for:', objective);
    setEvents([]);
    setDone(false);

    const url = "/api/ops/pipeline";
    const params = new URLSearchParams({
      payload: JSON.stringify({ objective, context })
    });

    const es = new EventSource(`${url}?${params.toString()}`);

    es.onopen = () => {
      console.log('[useOpsPipeline] EventSource connected');
    };

    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data);
        console.log('[useOpsPipeline] Received event:', event.type, event);
        setEvents((prev) => [...prev, event]);
      } catch (err) {
        console.warn("[useOpsPipeline] Failed to parse event:", err, e.data);
      }
    };

    const handleEnd = () => {
      console.log('[useOpsPipeline] Pipeline ended');
      setDone(true);
      es.close();
    };

    es.addEventListener("end", handleEnd);

    es.onerror = (error) => {
      console.error("[useOpsPipeline] EventSource error:", error);
      setDone(true);
      es.close();
    };

    return () => {
      console.log('[useOpsPipeline] Cleaning up EventSource');
      es.removeEventListener("end", handleEnd);
      es.close();
    };
  }, [objective, JSON.stringify(context)]);

  return { events, done };
}

