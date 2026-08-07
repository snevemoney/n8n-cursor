"use client";

import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { useRetryableFetch } from "@/hooks/useRetryableFetch";
import { AsyncState } from "@/components/ui/AsyncState";
import { useBrainPanel } from "@/contexts/BrainPanelContext";

interface ConversionData {
  range?: string;
  counts: {
    total: number;
    proposalSent: number;
    approved: number;
    buildStarted: number;
    buildCompleted: number;
    won: number;
    lost: number;
  };
  rates: {
    proposalSentRate: number;
    approvedRate: number;
    buildStartRate: number;
    buildCompleteRate: number;
    winRate: number;
  };
  medianMs: {
    created_to_proposalSent: number | null;
    proposalSent_to_approved: number | null;
    approved_to_buildStarted: number | null;
    buildStarted_to_buildCompleted: number | null;
  };
}

type RangeKey = "this_week" | "last_4_weeks" | "last_12_weeks" | "all";

const RANGES: Array<{ key: RangeKey; label: string }> = [
  { key: "this_week", label: "This week" },
  { key: "last_4_weeks", label: "Last 4 weeks" },
  { key: "last_12_weeks", label: "Last 12 weeks" },
  { key: "all", label: "All time" },
];

function formatMs(ms: number | null): string {
  if (ms == null) return "—";
  if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3600_000) return `${(ms / 60_000).toFixed(1)}m`;
  return `${(ms / 3600_000).toFixed(1)}h`;
}

export default function ConversionPage() {
  const { setPageData } = useBrainPanel();
  const [range, setRange] = useState<RangeKey>("all");
  const { data, loading, error, refetch } = useRetryableFetch<ConversionData>(
    `/api/metrics/conversion?range=${range}`,
  );

  useEffect(() => {
    if (loading || !data) return;
    const c = data.counts ?? {};
    const r = data.rates ?? {};
    const total = c.total ?? 0;
    const won = c.won ?? 0;
    const proposalSent = c.proposalSent ?? 0;
    const buildCompleted = c.buildCompleted ?? 0;
    const winRate = (r.winRate ?? 0) * 100;
    setPageData(
      `Conversion (${range}): ${total} leads, ${won} won (${winRate.toFixed(0)}% win rate), ${proposalSent} proposals sent, ${buildCompleted} builds completed.`,
    );
  }, [data, loading, range, setPageData]);

  const counts = data?.counts ?? {
    total: 0,
    proposalSent: 0,
    approved: 0,
    buildStarted: 0,
    buildCompleted: 0,
    won: 0,
    lost: 0,
  };
  const rates = data?.rates ?? {
    proposalSentRate: 0,
    approvedRate: 0,
    buildStartRate: 0,
    buildCompleteRate: 0,
    winRate: 0,
  };
  const medianMs = data?.medianMs ?? {
    created_to_proposalSent: null,
    proposalSent_to_approved: null,
    approved_to_buildStarted: null,
    buildStarted_to_buildCompleted: null,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6" /> Conversion funnel
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Intake + pipeline leads → proposal sent → approved → build → won/lost
          </p>
        </div>
        <div className="flex flex-wrap gap-1 rounded-lg border border-neutral-800 p-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRange(r.key)}
              className={`rounded-md px-2.5 py-1 text-xs ${
                range === r.key
                  ? "bg-neutral-100 text-neutral-900"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <AsyncState
        loading={loading}
        error={error}
        empty={!loading && !error && !data}
        emptyMessage="No conversion data"
        onRetry={refetch}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total leads", value: counts.total },
            { label: "Proposal sent", value: counts.proposalSent },
            { label: "Approved", value: counts.approved },
            { label: "Build started", value: counts.buildStarted },
            { label: "Build completed", value: counts.buildCompleted },
            { label: "Won", value: counts.won, color: "text-emerald-400" },
            { label: "Lost", value: counts.lost, color: "text-red-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="border border-neutral-800 rounded-lg p-4">
              <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                {label}
              </div>
              <div className={`text-2xl font-semibold mt-1 ${color ?? ""}`}>{value}</div>
            </div>
          ))}
        </div>

        <div className="border border-neutral-800 rounded-lg p-4">
          <h2 className="text-sm font-semibold mb-3">Conversion rates</h2>
          <div className="space-y-2">
            {[
              { label: "Proposal sent / total", rate: rates.proposalSentRate },
              { label: "Approved / proposal sent", rate: rates.approvedRate },
              { label: "Build started / approved", rate: rates.buildStartRate },
              { label: "Build completed / started", rate: rates.buildCompleteRate },
              { label: "Win rate (won / approved)", rate: rates.winRate },
            ].map(({ label, rate }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-48 text-sm text-neutral-400">{label}</div>
                <div className="flex-1 h-5 bg-neutral-900 rounded overflow-hidden">
                  <div className="h-full bg-neutral-600 rounded" style={{ width: `${rate * 100}%` }} />
                </div>
                <span className="text-sm font-medium w-12">{(rate * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-neutral-800 rounded-lg p-4">
          <h2 className="text-sm font-semibold mb-3">Median time between stages</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="text-sm">
              Created → Proposal sent: {formatMs(medianMs.created_to_proposalSent)}
            </div>
            <div className="text-sm">
              Proposal sent → Approved: {formatMs(medianMs.proposalSent_to_approved)}
            </div>
            <div className="text-sm">
              Approved → Build started: {formatMs(medianMs.approved_to_buildStarted)}
            </div>
            <div className="text-sm">
              Build started → Completed: {formatMs(medianMs.buildStarted_to_buildCompleted)}
            </div>
          </div>
        </div>
      </AsyncState>
    </div>
  );
}
