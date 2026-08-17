"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FootprintsIcon } from "@/components/icons";
import { DailyEntryBadge } from "@/components/DailyEntryBadge";

const STEPS_COLOR = "#3b82f6";

export function StepsCard({ steps }: { steps: number }) {
  const router = useRouter();
  const [prevSteps, setPrevSteps] = useState(steps);
  const [liveSteps, setLiveSteps] = useState(steps);
  const [value, setValue] = useState(String(steps));

  if (steps !== prevSteps) {
    setPrevSteps(steps);
    setLiveSteps(steps);
    setValue(String(steps));
  }

  function save(event: React.FormEvent) {
    event.preventDefault();
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return;

    setLiveSteps(parsed);

    fetch("/api/steps/manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ steps: parsed }),
    }).then(() => router.refresh());
  }

  return (
    <div className="stat-card flex h-full flex-col justify-between gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div
            className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl"
            style={{ backgroundColor: `${STEPS_COLOR}22`, color: STEPS_COLOR }}
          >
            <FootprintsIcon size={20} />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-2xl font-semibold tracking-tight">{liveSteps.toLocaleString()}</span>
            <span className="text-xs text-muted">Steps today</span>
          </div>
        </div>
        <DailyEntryBadge color={STEPS_COLOR} />
      </div>

      <form onSubmit={save} className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Correct steps"
          className="min-w-0 flex-1 rounded-lg border border-border bg-surface-raised px-2 py-1.5 text-sm outline-none focus:border-navy-light"
        />
        <button
          type="submit"
          className="flex-none rounded-lg px-2.5 py-1.5 text-xs font-medium text-white transition"
          style={{ backgroundColor: STEPS_COLOR }}
        >
          Save
        </button>
      </form>
    </div>
  );
}
