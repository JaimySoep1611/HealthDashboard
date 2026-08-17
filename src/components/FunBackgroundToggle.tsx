"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function FunBackgroundToggle({ existing }: { existing: boolean }) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(existing);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    const next = !enabled;
    setEnabled(next);
    setSaving(true);
    await fetch("/api/profile/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ funBackground: next }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <label className="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={toggle}
        disabled={saving}
        className={`relative h-6 w-11 flex-none rounded-full transition disabled:opacity-50 ${
          enabled ? "bg-navy" : "bg-surface-raised"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            enabled ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
      <span className="text-sm">
        🦦🐶 Cute moving otters &amp; dogs in the background
      </span>
    </label>
  );
}
