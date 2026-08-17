"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { TargetIcon } from "@/components/icons";

type Props =
  | { active: false }
  | {
      active: true;
      dayNumber: number;
      totalDays: number;
      completedDays: number;
      currentStreak: number;
      finished: boolean;
    };

export function ChallengeCard(props: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  function start() {
    setPending(true);
    fetch("/api/challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ days: 75 }),
    }).then(() => {
      setPending(false);
      router.refresh();
    });
  }

  function end() {
    if (!confirm("End your current challenge? This can't be undone.")) return;
    setPending(true);
    fetch("/api/challenge", { method: "DELETE" }).then(() => {
      setPending(false);
      router.refresh();
    });
  }

  if (!props.active) {
    return (
      <div className="tile flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-navy-light/15 text-navy-light">
            <TargetIcon size={26} />
          </div>
          <div>
            <h3 className="font-medium">75-day challenge</h3>
            <p className="text-sm text-muted">
              Hit your water + calorie targets every day for 75 days straight.
            </p>
          </div>
        </div>
        <button
          onClick={start}
          disabled={pending}
          className="flex-none rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white transition hover:bg-navy-light disabled:opacity-50"
        >
          Start
        </button>
      </div>
    );
  }

  const { dayNumber, totalDays, completedDays, currentStreak, finished } = props;
  const progressRatio = Math.min(dayNumber / totalDays, 1);

  return (
    <div className="tile flex flex-col gap-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-navy-light/15 text-navy-light">
            <TargetIcon size={26} />
          </div>
          <div>
            <h3 className="font-medium">{finished ? "Challenge complete!" : `Day ${dayNumber} of ${totalDays}`}</h3>
            <p className="text-sm text-muted">
              {completedDays}/{dayNumber} days on target · streak {currentStreak}
            </p>
          </div>
        </div>
        <button
          onClick={end}
          disabled={pending}
          className="flex-none text-xs text-muted transition hover:text-red-400 disabled:opacity-50"
        >
          End challenge
        </button>
      </div>

      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--ring-track)]">
        <div
          className="h-full rounded-full bg-navy-light transition-[width] duration-700 ease-out"
          style={{ width: `${progressRatio * 100}%` }}
        />
      </div>

      {finished && (
        <button
          onClick={start}
          disabled={pending}
          className="self-start rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white transition hover:bg-navy-light disabled:opacity-50"
        >
          Start another
        </button>
      )}
    </div>
  );
}
