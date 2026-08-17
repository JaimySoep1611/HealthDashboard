"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ManualStepsForm({ defaultValue }: { defaultValue: number }) {
  const router = useRouter();
  const [steps, setSteps] = useState(defaultValue);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    await fetch("/api/steps/manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ steps }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3">
      <input
        type="number"
        min={0}
        value={steps}
        onChange={(event) => setSteps(Number(event.target.value))}
        className="w-32 rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm outline-none focus:border-navy-light"
      />
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-navy px-3 py-2 text-sm font-medium text-white transition hover:bg-navy-light disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save today's steps"}
      </button>
    </form>
  );
}
