"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ScaleIcon } from "@/components/icons";
import { Sparkline } from "@/components/Sparkline";

const WEIGHT_COLOR = "#8b5cf6";

export function WeightCard({
  latestKg,
  goalKg,
  trend,
  loggedToday,
}: {
  latestKg: number | null;
  goalKg: number | null;
  trend: number[];
  loggedToday: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState(latestKg ? String(latestKg) : "");
  const [prevLatestKg, setPrevLatestKg] = useState(latestKg);
  const [liveLatestKg, setLiveLatestKg] = useState(latestKg);
  const [liveTrend, setLiveTrend] = useState(trend);
  const [hasLoggedToday, setHasLoggedToday] = useState(loggedToday);

  if (latestKg !== prevLatestKg) {
    setPrevLatestKg(latestKg);
    setLiveLatestKg(latestKg);
    setLiveTrend(trend);
    setHasLoggedToday(loggedToday);
  }

  function logWeight(event: React.FormEvent) {
    event.preventDefault();
    const weightKg = Number(value);
    if (!weightKg || weightKg <= 0) return;

    setLiveLatestKg(weightKg);
    setLiveTrend((current) =>
      hasLoggedToday ? [...current.slice(0, -1), weightKg] : [...current, weightKg]
    );
    setHasLoggedToday(true);

    fetch("/api/health/weight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weightKg }),
    }).then(() => router.refresh());
  }

  const delta = liveLatestKg !== null && goalKg !== null ? liveLatestKg - goalKg : null;

  return (
    <div className="stat-card flex flex-col gap-4 p-5">
      <div className="flex items-center gap-4">
        <div
          className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${WEIGHT_COLOR}22`, color: WEIGHT_COLOR }}
        >
          <ScaleIcon size={22} />
        </div>
        <div className="flex flex-1 flex-col">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-semibold tracking-tight">
              {liveLatestKg !== null ? liveLatestKg : "—"}
            </span>
            <span className="text-sm text-muted">kg</span>
          </div>
          <span className="text-xs text-muted">
            {goalKg !== null
              ? `Goal ${goalKg}kg${delta !== null ? ` · ${delta > 0 ? "+" : ""}${delta.toFixed(1)}kg to go` : ""}`
              : "No goal weight set"}
          </span>
        </div>
      </div>

      {liveTrend.length > 1 && (
        <div style={{ height: 48 }}>
          <Sparkline id="weight" points={liveTrend} color={WEIGHT_COLOR} height={48} target={goalKg ?? undefined} />
        </div>
      )}

      <form onSubmit={logWeight} className="flex items-center gap-2">
        <input
          type="number"
          step="0.1"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Log today's weight"
          className="min-w-0 flex-1 rounded-lg border border-border bg-surface-raised px-3 py-1.5 text-sm outline-none focus:border-navy-light"
        />
        <button
          type="submit"
          disabled={!value}
          className="flex-none rounded-lg px-3 py-1.5 text-xs font-medium text-white transition disabled:opacity-50"
          style={{ backgroundColor: WEIGHT_COLOR }}
        >
          Log
        </button>
      </form>
    </div>
  );
}
