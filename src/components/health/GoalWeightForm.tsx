"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function GoalWeightForm({ existing }: { existing: number | null }) {
  const router = useRouter();
  const [value, setValue] = useState(existing !== null ? String(existing) : "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    const goalWeightKg = value ? Number(value) : null;
    await fetch("/api/profile/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goalWeightKg }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-xs text-muted">
        Goal weight (kg)
        <input
          type="number"
          step={0.1}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="e.g. 80"
          className="w-28 rounded-lg border border-border bg-surface-raised px-2 py-1 text-sm text-foreground outline-none focus:border-navy-light"
        />
      </label>
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-navy px-3 py-2 text-sm font-medium text-white transition hover:bg-navy-light disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save goal"}
      </button>
    </form>
  );
}
