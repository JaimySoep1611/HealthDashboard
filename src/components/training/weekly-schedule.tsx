"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { WEEKDAY_LABELS } from "@/lib/weekdays";
import { DumbbellIcon, FootprintsIcon } from "@/components/icons";

type Log = { kg: number | null; sets: number | null; km: number | null };
type Exercise = {
  id: string;
  name: string;
  weekday: number;
  kind: "weight" | "cardio";
  log: Log | null;
};

export function WeeklySchedule({ exercises }: { exercises: Exercise[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [weekday, setWeekday] = useState("0");
  const [kind, setKind] = useState<"weight" | "cardio">("weight");
  const [adding, setAdding] = useState(false);

  async function addExercise(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setAdding(true);
    await fetch("/api/training/exercises", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, weekday: Number(weekday), kind }),
    });
    setName("");
    setAdding(false);
    router.refresh();
  }

  async function removeExercise(exerciseId: string) {
    if (!confirm("Remove this exercise from the schedule?")) return;
    await fetch(`/api/training/exercises/${exerciseId}`, { method: "DELETE" });
    router.refresh();
  }

  const byDay = new Map<number, Exercise[]>();
  for (const exercise of exercises) {
    const list = byDay.get(exercise.weekday) ?? [];
    list.push(exercise);
    byDay.set(exercise.weekday, list);
  }
  const activeDays = Array.from(byDay.keys()).sort((a, b) => a - b);

  return (
    <div className="tile flex flex-col gap-4 p-6">
      <h3 className="font-medium">Training schedule — this week</h3>

      {activeDays.length === 0 ? (
        <p className="text-sm text-muted">
          Add exercises below — pick a day, a name, and whether to track kg (power training) or
          km (running). It repeats every week.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {activeDays.map((day) => (
            <div key={day} className="flex flex-col gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                {WEEKDAY_LABELS[day]}
              </p>
              <div className="flex flex-col gap-2">
                {(byDay.get(day) ?? []).map((exercise) => (
                  <ExerciseRow
                    key={exercise.id}
                    exercise={exercise}
                    onRemove={() => removeExercise(exercise.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={addExercise} className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Bench press"
          className="min-w-0 flex-1 rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm outline-none focus:border-navy-light"
        />
        <select
          value={weekday}
          onChange={(event) => setWeekday(event.target.value)}
          className="rounded-lg border border-border bg-surface-raised px-2 py-2 text-sm outline-none focus:border-navy-light"
        >
          {WEEKDAY_LABELS.map((label, index) => (
            <option key={label} value={index}>
              {label}
            </option>
          ))}
        </select>
        <select
          value={kind}
          onChange={(event) => setKind(event.target.value as "weight" | "cardio")}
          className="rounded-lg border border-border bg-surface-raised px-2 py-2 text-sm outline-none focus:border-navy-light"
        >
          <option value="weight">Power training (kg)</option>
          <option value="cardio">Running (km)</option>
        </select>
        <button
          type="submit"
          disabled={adding || !name.trim()}
          className="flex-none rounded-lg bg-navy px-3 py-2 text-sm font-medium text-white transition hover:bg-navy-light disabled:opacity-50"
        >
          Add
        </button>
      </form>
    </div>
  );
}

function ExerciseRow({ exercise, onRemove }: { exercise: Exercise; onRemove: () => void }) {
  const router = useRouter();
  const [editing, setEditing] = useState(!exercise.log);
  const [kg, setKg] = useState(exercise.log?.kg?.toString() ?? "");
  const [sets, setSets] = useState(exercise.log?.sets?.toString() ?? "");
  const [km, setKm] = useState(exercise.log?.km?.toString() ?? "");
  const [liveLog, setLiveLog] = useState(exercise.log);

  function save() {
    const payload = {
      kg: kg ? Number(kg) : null,
      sets: sets ? Number(sets) : null,
      km: km ? Number(km) : null,
    };
    setLiveLog(payload);
    setEditing(false);

    fetch(`/api/training/exercises/${exercise.id}/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(() => router.refresh());
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="flex-none text-muted">
          {exercise.kind === "weight" ? <DumbbellIcon size={16} /> : <FootprintsIcon size={16} />}
        </span>
        <span className="truncate text-sm">{exercise.name}</span>
      </div>

      {editing ? (
        <div className="flex flex-none items-center gap-2">
          {exercise.kind === "weight" ? (
            <>
              <input
                type="number"
                inputMode="decimal"
                value={kg}
                onChange={(event) => setKg(event.target.value)}
                placeholder="kg"
                className="w-16 rounded-lg border border-border bg-surface-raised px-2 py-1.5 text-sm outline-none focus:border-navy-light"
              />
              <input
                type="number"
                inputMode="numeric"
                value={sets}
                onChange={(event) => setSets(event.target.value)}
                placeholder="sets"
                className="w-16 rounded-lg border border-border bg-surface-raised px-2 py-1.5 text-sm outline-none focus:border-navy-light"
              />
            </>
          ) : (
            <input
              type="number"
              inputMode="decimal"
              value={km}
              onChange={(event) => setKm(event.target.value)}
              placeholder="km"
              className="w-16 rounded-lg border border-border bg-surface-raised px-2 py-1.5 text-sm outline-none focus:border-navy-light"
            />
          )}
          <button
            onClick={save}
            className="flex-none rounded-lg bg-navy px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-navy-light"
          >
            Log
          </button>
        </div>
      ) : (
        <div className="flex flex-none items-center gap-3 text-xs">
          <span className="text-foreground">
            {exercise.kind === "weight"
              ? [
                  liveLog?.kg != null ? `${liveLog.kg}kg` : null,
                  liveLog?.sets != null ? `${liveLog.sets} sets` : null,
                ]
                  .filter(Boolean)
                  .join(" × ")
              : `${liveLog?.km}km`}
          </span>
          <button onClick={() => setEditing(true)} className="text-muted hover:text-foreground">
            Edit
          </button>
        </div>
      )}

      <button onClick={onRemove} className="flex-none text-xs text-muted hover:text-red-400">
        Remove
      </button>
    </div>
  );
}
