"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WEEKDAY_LABELS } from "@/lib/weekdays";

export function AddDayForm() {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [weekday, setWeekday] = useState(1);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!label.trim()) return;
    setLoading(true);
    await fetch("/api/training/days", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, weekday }),
    });
    setLabel("");
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3">
      <input
        value={label}
        onChange={(event) => setLabel(event.target.value)}
        placeholder="e.g. Push, Pull, Legs"
        className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm outline-none focus:border-navy-light"
      />
      <select
        value={weekday}
        onChange={(event) => setWeekday(Number(event.target.value))}
        className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm outline-none focus:border-navy-light"
      >
        {WEEKDAY_LABELS.map((name, index) => (
          <option key={name} value={index}>
            {name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={loading || !label.trim()}
        className="rounded-lg bg-navy px-3 py-2 text-sm font-medium text-white transition hover:bg-navy-light disabled:opacity-50"
      >
        Add day
      </button>
    </form>
  );
}
