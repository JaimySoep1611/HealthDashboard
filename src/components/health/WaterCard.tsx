"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DropletIcon } from "@/components/icons";
import { Confetti } from "@/components/Confetti";

const WATER_COLOR = "#06b6d4";
const QUICK_ADD = [100, 250, 500];

export function WaterCard({ totalMl, targetMl }: { totalMl: number; targetMl: number }) {
  const router = useRouter();
  const [prevTotalMl, setPrevTotalMl] = useState(totalMl);
  const [liveTotal, setLiveTotal] = useState(totalMl);
  const [addedThisSession, setAddedThisSession] = useState<number[]>([]);
  const [burstKey, setBurstKey] = useState(0);

  if (totalMl !== prevTotalMl) {
    setPrevTotalMl(totalMl);
    setLiveTotal(totalMl);
  }

  function addWater(amountMl: number) {
    const previous = liveTotal;
    const updated = previous + amountMl;
    setLiveTotal(updated);
    setAddedThisSession((current) => [...current, amountMl]);
    if (targetMl > 0 && previous < targetMl && updated >= targetMl) {
      setBurstKey((key) => key + 1);
    }

    fetch("/api/health/water", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountMl }),
    })
      .then(() => router.refresh())
      .catch(() => {
        setLiveTotal((current) => current - amountMl);
        setAddedThisSession((current) => current.slice(0, -1));
      });
  }

  function undo() {
    const last = addedThisSession[addedThisSession.length - 1];
    if (last !== undefined) {
      setLiveTotal((current) => Math.max(0, current - last));
      setAddedThisSession((current) => current.slice(0, -1));
    }

    fetch("/api/health/water", { method: "DELETE" }).then(() => router.refresh());
  }

  const ratio = targetMl > 0 ? Math.min(liveTotal / targetMl, 1) : 0;
  const liters = (liveTotal / 1000).toFixed(2);
  const targetLiters = (targetMl / 1000).toFixed(1);

  return (
    <div className="stat-card flex h-full flex-col justify-between gap-3 p-4">
      <Confetti burstKey={burstKey} />
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${WATER_COLOR}22`, color: WATER_COLOR }}
        >
          <DropletIcon size={20} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-semibold tracking-tight">{liters}</span>
            <span className="text-sm text-muted">/ {targetLiters} L</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted">Water today</span>
            <button
              onClick={undo}
              disabled={liveTotal === 0}
              className="text-[10px] whitespace-nowrap text-muted transition hover:text-foreground disabled:opacity-40"
            >
              − Undo
            </button>
          </div>
        </div>
      </div>

      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--ring-track)]">
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${ratio * 100}%`, backgroundColor: WATER_COLOR }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {QUICK_ADD.map((amount) => (
          <button
            key={amount}
            onClick={() => addWater(amount)}
            className="rounded-full border border-border px-1.5 py-1 text-xs whitespace-nowrap transition hover:border-cyan-500/60 hover:text-cyan-400"
          >
            +{amount}ml
          </button>
        ))}
      </div>
    </div>
  );
}
