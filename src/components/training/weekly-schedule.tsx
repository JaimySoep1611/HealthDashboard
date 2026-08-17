"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { WEEKDAY_LABELS, WEEKDAY_SHORT } from "@/lib/weekdays";
import { DumbbellIcon, FootprintsIcon } from "@/components/icons";

type Log = { kg: number | null; sets: number | null; reps: number | null; km: number | null };
type Exercise = {
  id: string;
  name: string;
  weekday: number;
  kind: "weight" | "cardio";
  log: Log | null;
};

function useTodayWeekday() {
  // Computed client-side from the browser's own clock (correct for whoever's
  // looking at it) — starts null and fills in post-mount to avoid a
  // server/client render mismatch, same pattern as the theme toggle.
  const [today, setToday] = useState<number | null>(null);
  useEffect(() => {
    const jsDay = new Date().getDay();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(jsDay === 0 ? 6 : jsDay - 1);
  }, []);
  return today;
}

export function WeeklySchedule({ exercises }: { exercises: Exercise[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [weekday, setWeekday] = useState("0");
  const [kind, setKind] = useState<"weight" | "cardio">("weight");
  const [adding, setAdding] = useState(false);
  const todayWeekday = useTodayWeekday();

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

  return (
    <div className="tile flex flex-col gap-4 p-6">
      <h3 className="font-medium">Training schedule</h3>

      <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1">
        {WEEKDAY_SHORT.map((label, day) => {
          const dayExercises = byDay.get(day) ?? [];
          const isToday = day === todayWeekday;
          const isComplete = dayExercises.length > 0 && dayExercises.every((exercise) => exercise.log);

          return (
            <div
              key={day}
              className={`flex w-28 flex-none snap-start flex-col gap-2 rounded-xl border p-3 transition-colors ${
                isToday ? "border-navy-light bg-navy-light/10" : "border-border bg-surface"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wide ${
                    isToday ? "text-foreground" : "text-muted"
                  }`}
                >
                  {label}
                </span>
                {dayExercises.length > 0 && (
                  <span
                    className={`h-1.5 w-1.5 flex-none rounded-full ${
                      isComplete ? "bg-emerald-400" : "border border-muted"
                    }`}
                  />
                )}
              </div>

              {dayExercises.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border py-5 text-center text-[10px] text-muted">
                  Rest
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {dayExercises.map((exercise) => (
                    <ExerciseChip
                      key={exercise.id}
                      exercise={exercise}
                      onRemove={() => removeExercise(exercise.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

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

function ExerciseChip({ exercise, onRemove }: { exercise: Exercise; onRemove: () => void }) {
  const router = useRouter();
  const [editing, setEditing] = useState(!exercise.log);
  const [kg, setKg] = useState(exercise.log?.kg?.toString() ?? "");
  const [sets, setSets] = useState(exercise.log?.sets?.toString() ?? "");
  const [reps, setReps] = useState(exercise.log?.reps?.toString() ?? "");
  const [km, setKm] = useState(exercise.log?.km?.toString() ?? "");
  const [liveLog, setLiveLog] = useState(exercise.log);

  function save() {
    const payload = {
      kg: kg ? Number(kg) : null,
      sets: sets ? Number(sets) : null,
      reps: reps ? Number(reps) : null,
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

  const inputClass =
    "w-full min-w-0 rounded-md border border-border bg-surface-raised px-1.5 py-1 text-[10px] outline-none focus:border-navy-light";

  return (
    <div className="rounded-lg border border-border bg-surface-raised p-2">
      <div className="mb-1.5 flex items-center gap-1">
        <span className="flex-none text-muted">
          {exercise.kind === "weight" ? <DumbbellIcon size={11} /> : <FootprintsIcon size={11} />}
        </span>
        <span className="min-w-0 flex-1 truncate text-[11px] font-medium">{exercise.name}</span>
        <button onClick={onRemove} className="flex-none text-[11px] leading-none text-muted hover:text-red-400">
          ×
        </button>
      </div>

      {editing ? (
        <div className="flex flex-col gap-1">
          {exercise.kind === "weight" ? (
            <>
              <input
                type="number"
                inputMode="decimal"
                value={kg}
                onChange={(event) => setKg(event.target.value)}
                placeholder="kg"
                className={inputClass}
              />
              <input
                type="number"
                inputMode="numeric"
                value={sets}
                onChange={(event) => setSets(event.target.value)}
                placeholder="sets"
                className={inputClass}
              />
              <input
                type="number"
                inputMode="numeric"
                value={reps}
                onChange={(event) => setReps(event.target.value)}
                placeholder="reps"
                className={inputClass}
              />
            </>
          ) : (
            <input
              type="number"
              inputMode="decimal"
              value={km}
              onChange={(event) => setKm(event.target.value)}
              placeholder="km"
              className={inputClass}
            />
          )}
          <button
            onClick={save}
            className="w-full rounded-md bg-navy py-1 text-[10px] font-medium text-white transition hover:bg-navy-light"
          >
            Log
          </button>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="w-full rounded-md border border-border py-1 text-[10px] text-foreground transition hover:border-navy-light"
        >
          {exercise.kind === "weight"
            ? [
                liveLog?.kg != null ? `${liveLog.kg}kg` : null,
                liveLog?.sets != null && liveLog?.reps != null
                  ? `${liveLog.sets}×${liveLog.reps}`
                  : liveLog?.sets != null
                    ? `${liveLog.sets} sets`
                    : null,
              ]
                .filter(Boolean)
                .join(" · ")
            : `${liveLog?.km}km`}
        </button>
      )}
    </div>
  );
}
