"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProfilePicker({ profiles }: { profiles: { id: string; name: string }[] }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  async function selectProfile(profileId: string) {
    setPending(profileId);
    await fetch("/api/profile/select", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId }),
    });
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {profiles.map((profile) => (
        <button
          key={profile.id}
          onClick={() => selectProfile(profile.id)}
          disabled={pending !== null}
          className="tile flex flex-col items-center gap-3 p-8 disabled:opacity-50"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy text-2xl font-semibold text-white">
            {profile.name.slice(0, 1).toUpperCase()}
          </div>
          <span className="text-lg font-medium">
            {pending === profile.id ? "Loading…" : profile.name}
          </span>
        </button>
      ))}
    </div>
  );
}
