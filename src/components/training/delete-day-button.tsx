"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteDayButton({ dayId }: { dayId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this training day and its exercises?")) return;
    setLoading(true);
    await fetch(`/api/training/days/${dayId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs text-muted hover:text-red-400"
    >
      Remove
    </button>
  );
}
