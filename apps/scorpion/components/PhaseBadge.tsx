import { PhaseStatus } from "@/lib/orchestrator/phases";
import { CheckCircle, XCircle, SkipForward } from "lucide-react";

interface PhaseBadgeProps {
  result: PhaseStatus | { status: string; reason?: string; error?: { message?: string } };
  className?: string;
}

export function PhaseBadge({ result, className = "" }: PhaseBadgeProps) {
  if (!result || result.status === "pending") {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30 ${className}`}>
        Pending
      </span>
    );
  }

  if (result.status === "done") {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 ${className}`}>
        <CheckCircle className="w-3 h-3" />
        Done
      </span>
    );
  }
  
  if (result.status === "skipped") {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 ${className}`} title={result.reason}>
        <SkipForward className="w-3 h-3" />
        Skipped: {result.reason || "No reason provided"}
      </span>
    );
  }
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30 ${className}`} title={result.error?.message}>
      <XCircle className="w-3 h-3" />
      Error: {result.error?.message || "Unknown error"}
    </span>
  );
}

