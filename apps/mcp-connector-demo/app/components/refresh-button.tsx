"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => router.refresh())}
      disabled={isPending}
      style={{
        padding: "0.4rem 0.85rem",
        fontSize: "0.75rem",
        fontWeight: 500,
        background: isPending ? "#1E1E24" : "#5B8CFF",
        color: isPending ? "#666" : "#FFF",
        border: "none",
        borderRadius: "6px",
        cursor: isPending ? "not-allowed" : "pointer",
        transition: "all 0.2s",
      }}
    >
      {isPending ? "Refreshing…" : "Refresh"}
    </button>
  );
}
