"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (!response.ok) {
      setError("Incorrect password");
      return;
    }

    router.push("/profile");
    router.refresh();
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="tile w-full max-w-sm p-8 flex flex-col gap-5"
      >
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold">Health Dashboard</h1>
          <p className="text-sm text-muted">Enter the shared password to continue.</p>
        </div>

        <input
          type="password"
          autoFocus
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          className="rounded-lg border border-border bg-surface-raised px-3 py-2 outline-none focus:border-navy-light"
        />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading || !password}
          className="rounded-lg bg-navy px-3 py-2 font-medium text-white transition hover:bg-navy-light disabled:opacity-50"
        >
          {loading ? "Checking…" : "Enter"}
        </button>
      </form>
    </main>
  );
}
