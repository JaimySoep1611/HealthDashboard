"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DropletIcon, MinusIcon, PlusIcon } from "@/components/icons";

const WATER_COLOR = "#06b6d4";
const QUICK_ADD = [100, 250, 500];

export function WaterCard({ totalMl, targetMl }: { totalMl: number; targetMl: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function addWater(amountMl: number) {
    setPending(true);
    await fetch("/api/health/water", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountMl }),
    });
    setPending(false);
    router.refresh();
  }

  async function undo() {
    setPending(true);
    await fetch("/api/health/water", { method: "DELETE" });
    setPending(false);
    router.refresh();
  }

  const ratio = targetMl > 0 ? Math.min(totalMl / targetMl, 1) : 0;
  const liters = (totalMl / 1000).toFixed(2);
  const targetLiters = (targetMl / 1000).toFixed(1);

  return (
    <div className="stat-card flex flex-col gap-4 p-5">
      <div className="flex items-center gap-4">
        <div
          className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${WATER_COLOR}22`, color: WATER_COLOR }}
        >
          <DropletIcon size={22} />
        </div>
        <div className="flex flex-1 flex-col">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-semibold tracking-tight">{liters}</span>
            <span className="text-sm text-muted">/ {targetLiters} L</span>
          </div>
          <span className="text-xs text-muted">Water today</span>
        </div>
      </div>

      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--ring-track)]">
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${ratio * 100}%`, backgroundColor: WATER_COLOR }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {QUICK_ADD.map((amount) => (
          <button
            key={amount}
            onClick={() => addWater(amount)}
            disabled={pending}
            className="flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs transition hover:border-cyan-500/60 hover:text-cyan-400 disabled:opacity-50"
          >
            <PlusIcon size={12} />
            {amount}ml
          </button>
        ))}
        <button
          onClick={undo}
          disabled={pending || totalMl === 0}
          className="ml-auto flex items-center gap-1 rounded-full px-2 py-1.5 text-xs text-muted transition hover:text-foreground disabled:opacity-40"
        >
          <MinusIcon size={12} />
          Undo
        </button>
      </div>
    </div>
  );
}
