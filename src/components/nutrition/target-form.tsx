"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Target = {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  waterTargetMl: number;
};

export function TargetForm({
  existing,
  compact = false,
}: {
  existing?: Target;
  compact?: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(!existing);
  const [values, setValues] = useState<Target>(
    existing ?? { calories: 2200, proteinG: 150, carbsG: 220, fatG: 70, waterTargetMl: 2000 }
  );
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    await fetch("/api/nutrition/target", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  if (compact && !editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-xs text-muted hover:text-navy-light"
      >
        Edit target
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <Field label="Calories" value={values.calories} onChange={(v) => setValues({ ...values, calories: v })} />
      <Field label="Protein (g)" value={values.proteinG} onChange={(v) => setValues({ ...values, proteinG: v })} />
      <Field label="Carbs (g)" value={values.carbsG} onChange={(v) => setValues({ ...values, carbsG: v })} />
      <Field label="Fat (g)" value={values.fatG} onChange={(v) => setValues({ ...values, fatG: v })} />
      <Field
        label="Water (L)"
        value={values.waterTargetMl / 1000}
        step={0.1}
        onChange={(v) => setValues({ ...values, waterTargetMl: Math.round(v * 1000) })}
      />
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-navy px-3 py-2 text-sm font-medium text-white transition hover:bg-navy-light disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save target"}
      </button>
      {compact && (
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="text-xs text-muted hover:text-foreground"
        >
          Cancel
        </button>
      )}
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  step,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-muted">
      {label}
      <input
        type="number"
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-24 rounded-lg border border-border bg-surface-raised px-2 py-1 text-sm text-foreground outline-none focus:border-navy-light"
      />
    </label>
  );
}
