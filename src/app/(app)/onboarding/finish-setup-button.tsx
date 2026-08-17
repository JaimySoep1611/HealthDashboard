"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function FinishSetupButton({ firstTime }: { firstTime: boolean }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function finish() {
    setSaving(true);
    await fetch("/api/profile/onboard", { method: "POST" });
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={finish}
        disabled={saving}
        className="rounded-lg bg-navy px-4 py-2 font-medium text-white transition hover:bg-navy-light disabled:opacity-50"
      >
        {saving ? "Saving…" : firstTime ? "Finish setup" : "Done"}
      </button>
      {!firstTime && (
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm text-muted hover:text-foreground"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
