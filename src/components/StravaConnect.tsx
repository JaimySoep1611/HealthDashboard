"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function StravaConnect({
  configured,
  connected,
  athleteName,
}: {
  configured: boolean;
  connected: boolean;
  athleteName: string | null;
}) {
  const router = useRouter();
  const [disconnecting, setDisconnecting] = useState(false);

  async function disconnect() {
    setDisconnecting(true);
    await fetch("/api/strava/disconnect", { method: "POST" });
    setDisconnecting(false);
    router.refresh();
  }

  if (!configured) {
    return <p className="text-xs text-muted">Strava isn&apos;t set up for this app yet.</p>;
  }

  if (connected) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm">
          Connected{athleteName ? ` as ${athleteName}` : ""} — new runs log automatically{" "}
          <span className="font-medium text-emerald-400">✓</span>
        </p>
        <button
          onClick={disconnect}
          disabled={disconnecting}
          className="flex-none rounded-lg border border-border px-3 py-1.5 text-xs text-muted transition hover:border-red-400 hover:text-red-400 disabled:opacity-50"
        >
          {disconnecting ? "…" : "Disconnect"}
        </button>
      </div>
    );
  }

  return (
    <a
      href="/api/strava/connect"
      className="inline-flex flex-none items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition"
      style={{ backgroundColor: "#fc4c02" }}
    >
      Connect Strava
    </a>
  );
}
