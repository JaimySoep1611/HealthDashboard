"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ScaleIcon } from "@/components/icons";
import { Sparkline } from "@/components/Sparkline";
import { DailyEntryBadge } from "@/components/DailyEntryBadge";

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
  const [value, setValue] = useState(latestKg !== null ? String(latestKg) : "");
  const [prevLatestKg, setPrevLatestKg] = useState(latestKg);
  const [liveLatestKg, setLiveLatestKg] = useState(latestKg);
  const [liveTrend, setLiveTrend] = useState(trend);
  const [hasLoggedToday, setHasLoggedToday] = useState(loggedToday);

  if (latestKg !== prevLatestKg) {
    setPrevLatestKg(latestKg);
    setLiveLatestKg(latestKg);
    setLiveTrend(trend);
    setHasLoggedToday(loggedToday);
    setValue(latestKg !== null ? String(latestKg) : "");
  }

  function save() {
    const weightKg = Number(value);
    if (!value.trim() || !Number.isFinite(weightKg) || weightKg <= 0) {
      setValue(liveLatestKg !== null ? String(liveLatestKg) : "");
      return;
    }
    if (weightKg === liveLatestKg) return;

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

  return (
    <div className="stat-card flex h-full flex-col justify-between gap-3 p-4">
      <div className="flex justify-end">
        <DailyEntryBadge color={WEIGHT_COLOR} />
      </div>

      <div className="flex items-center gap-4">
        <div
          className="flex h-16 w-16 flex-none items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${WEIGHT_COLOR}22`, color: WEIGHT_COLOR }}
        >
          <ScaleIcon size={28} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-baseline gap-1">
            <input
              type="number"
              step="0.1"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onFocus={(event) => event.target.select()}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur();
              }}
              onBlur={save}
              placeholder="—"
              aria-label="Weight (kg)"
              className="w-24 min-w-0 bg-transparent text-4xl font-semibold tracking-tight outline-none focus:underline"
            />
            <span className="text-base text-muted">kg</span>
          </div>
          <span className="truncate text-xs text-muted">{goalKg !== null ? `Goal ${goalKg}kg` : "No goal set"}</span>
        </div>
      </div>

      {liveTrend.length > 1 && (
        <div style={{ height: 40 }}>
          <Sparkline id="weight" points={liveTrend} color={WEIGHT_COLOR} height={40} target={goalKg ?? undefined} />
        </div>
      )}
    </div>
  );
}
