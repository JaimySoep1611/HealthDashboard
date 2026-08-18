"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FootprintsIcon, CheckIcon } from "@/components/icons";
import { DailyEntryBadge } from "@/components/DailyEntryBadge";
import { Confetti } from "@/components/Confetti";

const STEPS_COLOR = "#3b82f6";
// Same green used for the training schedule's "day complete" dot, so "goal
// met" reads the same way across the app.
const GOAL_MET_COLOR = "#34d399";

export function StepsCard({ steps, goal }: { steps: number; goal: number | null }) {
  const router = useRouter();
  const [prevSteps, setPrevSteps] = useState(steps);
  const [liveSteps, setLiveSteps] = useState(steps);
  const [value, setValue] = useState(String(steps));
  const [burstKey, setBurstKey] = useState(0);

  if (steps !== prevSteps) {
    if (goal !== null && prevSteps < goal && steps >= goal) {
      setBurstKey((key) => key + 1);
    }
    setPrevSteps(steps);
    setLiveSteps(steps);
    setValue(String(steps));
  }

  function save() {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setValue(String(liveSteps));
      return;
    }
    if (parsed === liveSteps) return;

    setLiveSteps(parsed);
    fetch("/api/steps/manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ steps: parsed }),
    }).then(() => router.refresh());
  }

  const goalMet = goal !== null && liveSteps >= goal;
  const activeColor = goalMet ? GOAL_MET_COLOR : STEPS_COLOR;

  return (
    <div className="stat-card flex h-full flex-col justify-between gap-3 p-4">
      <Confetti burstKey={burstKey} />
      <div className="flex justify-end">
        <DailyEntryBadge color={STEPS_COLOR} />
      </div>

      <div className="flex items-center gap-4">
        <div
          className="flex h-16 w-16 flex-none items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${activeColor}22`, color: activeColor }}
        >
          {goalMet ? <CheckIcon size={28} /> : <FootprintsIcon size={28} />}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <input
            type="number"
            min={0}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onFocus={(event) => event.target.select()}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
            }}
            onBlur={save}
            aria-label="Steps today"
            className="w-full min-w-0 bg-transparent text-4xl font-semibold tracking-tight outline-none focus:underline"
          />
          <span className={`truncate text-xs ${goalMet ? "font-medium text-emerald-400" : "text-muted"}`}>
            {goalMet ? "Goal reached" : goal !== null ? `Goal ${goal.toLocaleString()} steps` : "Steps today"}
          </span>
        </div>
      </div>
    </div>
  );
}
