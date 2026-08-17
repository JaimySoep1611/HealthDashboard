"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ExerciseInput = {
  id: string;
  exerciseName: string;
  targetSets: number;
  targetReps: number;
  lastSets: { reps: number; weightKg: number }[];
};

type SetRow = { reps: string; weightKg: string };

function buildInitialSets(exercise: ExerciseInput): SetRow[] {
  const count = Math.max(exercise.targetSets, exercise.lastSets.length, 1);
  return Array.from({ length: count }, (_, index) => {
    const previous = exercise.lastSets[index];
    return {
      reps: previous ? String(previous.reps) : String(exercise.targetReps),
      weightKg: previous ? String(previous.weightKg) : "",
    };
  });
}

export function LogSessionForm({
  dayId,
  exercises,
}: {
  dayId: string;
  exercises: ExerciseInput[];
}) {
  const router = useRouter();
  const [setsByExercise, setSetsByExercise] = useState<Record<string, SetRow[]>>(() =>
    Object.fromEntries(exercises.map((exercise) => [exercise.id, buildInitialSets(exercise)]))
  );
  const [saving, setSaving] = useState(false);

  function updateSet(exerciseId: string, index: number, field: keyof SetRow, value: string) {
    setSetsByExercise((prev) => {
      const rows = [...prev[exerciseId]];
      rows[index] = { ...rows[index], [field]: value };
      return { ...prev, [exerciseId]: rows };
    });
  }

  function addSetRow(exerciseId: string) {
    setSetsByExercise((prev) => ({
      ...prev,
      [exerciseId]: [...prev[exerciseId], { reps: "", weightKg: "" }],
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);

    const payload = {
      templateDayId: dayId,
      exercises: exercises.map((exercise) => ({
        templateExerciseId: exercise.id,
        exerciseName: exercise.exerciseName,
        sets: setsByExercise[exercise.id]
          .filter((row) => row.reps && row.weightKg !== "")
          .map((row) => ({ reps: Number(row.reps), weightKg: Number(row.weightKg) })),
      })),
    };

    await fetch("/api/training/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    router.push("/training");
    router.refresh();
  }

  if (exercises.length === 0) {
    return <p className="text-sm text-muted">Add exercises to this day before logging a session.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {exercises.map((exercise) => (
        <div key={exercise.id} className="tile flex flex-col gap-3 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">{exercise.exerciseName}</h2>
            <span className="text-xs text-muted">
              target {exercise.targetSets}×{exercise.targetReps}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {setsByExercise[exercise.id].map((row, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <span className="w-14 text-muted">Set {index + 1}</span>
                <input
                  type="number"
                  placeholder="kg"
                  value={row.weightKg}
                  onChange={(event) => updateSet(exercise.id, index, "weightKg", event.target.value)}
                  className="w-20 rounded-lg border border-border bg-surface-raised px-2 py-1 outline-none focus:border-navy-light"
                />
                <span className="text-muted">kg ×</span>
                <input
                  type="number"
                  placeholder="reps"
                  value={row.reps}
                  onChange={(event) => updateSet(exercise.id, index, "reps", event.target.value)}
                  className="w-16 rounded-lg border border-border bg-surface-raised px-2 py-1 outline-none focus:border-navy-light"
                />
                <span className="text-muted">reps</span>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addSetRow(exercise.id)}
              className="self-start text-xs text-navy-light hover:underline"
            >
              + Add set
            </button>
          </div>
        </div>
      ))}

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-navy px-4 py-2 font-medium text-white transition hover:bg-navy-light disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save session"}
      </button>
    </form>
  );
}
