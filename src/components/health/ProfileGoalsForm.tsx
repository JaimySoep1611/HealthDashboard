"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProfileGoalsForm({
  existingWeightGoal,
  existingStepsGoal,
  existingStartingWeight,
}: {
  existingWeightGoal: number | null;
  existingStepsGoal: number | null;
  existingStartingWeight: number | null;
}) {
  const router = useRouter();
  const [weightValue, setWeightValue] = useState(existingWeightGoal !== null ? String(existingWeightGoal) : "");
  const [stepsValue, setStepsValue] = useState(existingStepsGoal !== null ? String(existingStepsGoal) : "");
  const [startingWeightValue, setStartingWeightValue] = useState(
    existingStartingWeight !== null ? String(existingStartingWeight) : ""
  );
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    const goalWeightKg = weightValue ? Number(weightValue) : null;
    const stepsGoal = stepsValue ? Number(stepsValue) : null;
    const startingWeightKg = startingWeightValue ? Number(startingWeightValue) : null;
    await fetch("/api/profile/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goalWeightKg, stepsGoal, startingWeightKg }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-xs text-muted">
        Starting weight (kg)
        <input
          type="number"
          step={0.1}
          value={startingWeightValue}
          onChange={(event) => setStartingWeightValue(event.target.value)}
          placeholder="e.g. 90"
          className="w-28 rounded-lg border border-border bg-surface-raised px-2 py-1 text-sm text-foreground outline-none focus:border-navy-light"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-muted">
        Goal weight (kg)
        <input
          type="number"
          step={0.1}
          value={weightValue}
          onChange={(event) => setWeightValue(event.target.value)}
          placeholder="e.g. 80"
          className="w-28 rounded-lg border border-border bg-surface-raised px-2 py-1 text-sm text-foreground outline-none focus:border-navy-light"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-muted">
        Daily steps goal
        <input
          type="number"
          step={100}
          value={stepsValue}
          onChange={(event) => setStepsValue(event.target.value)}
          placeholder="e.g. 8000"
          className="w-28 rounded-lg border border-border bg-surface-raised px-2 py-1 text-sm text-foreground outline-none focus:border-navy-light"
        />
      </label>
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-navy px-3 py-2 text-sm font-medium text-white transition hover:bg-navy-light disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save goals"}
      </button>
    </form>
  );
}
