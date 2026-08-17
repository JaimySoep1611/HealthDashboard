"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Goal = {
  id: string;
  name: string;
  completedThisWeek: boolean;
};

export function GoalList({ goals }: { goals: Goal[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function addGoal(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setAdding(true);
    await fetch("/api/training/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setName("");
    setAdding(false);
    router.refresh();
  }

  async function toggle(goal: Goal) {
    setPendingId(goal.id);
    await fetch(`/api/training/goals/${goal.id}/complete`, {
      method: goal.completedThisWeek ? "DELETE" : "POST",
    });
    setPendingId(null);
    router.refresh();
  }

  async function removeGoal(goalId: string) {
    if (!confirm("Remove this training goal?")) return;
    await fetch(`/api/training/goals/${goalId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="tile flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Power Training — this week</h3>
      </div>

      {goals.length === 0 ? (
        <p className="text-sm text-muted">
          Add your training goals below (e.g. Push, Pull, Legs) — check them off each week.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
            >
              <button
                onClick={() => toggle(goal)}
                disabled={pendingId === goal.id}
                className="flex items-center gap-3 text-left disabled:opacity-50"
              >
                <span
                  className={`flex h-5 w-5 flex-none items-center justify-center rounded border ${
                    goal.completedThisWeek
                      ? "border-navy-light bg-navy-light text-white"
                      : "border-border"
                  }`}
                >
                  {goal.completedThisWeek && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 13l4 4L19 7"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <span className={goal.completedThisWeek ? "text-muted line-through" : ""}>
                  {goal.name}
                </span>
              </button>
              <button
                onClick={() => removeGoal(goal.id)}
                className="text-xs text-muted hover:text-red-400"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={addGoal} className="flex items-center gap-2">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Push day"
          className="flex-1 rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm outline-none focus:border-navy-light"
        />
        <button
          type="submit"
          disabled={adding || !name.trim()}
          className="flex-none rounded-lg bg-navy px-3 py-2 text-sm font-medium text-white transition hover:bg-navy-light disabled:opacity-50"
        >
          Add goal
        </button>
      </form>
    </div>
  );
}
