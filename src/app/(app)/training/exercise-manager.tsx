"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type TemplateExercise = {
  id: string;
  exerciseName: string;
  targetSets: number;
  targetReps: number;
};

type TemplateDayWithExercises = {
  id: string;
  exercises: TemplateExercise[];
};

export function ExerciseManager({ day }: { day: TemplateDayWithExercises }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(8);
  const [loading, setLoading] = useState(false);

  async function addExercise(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await fetch("/api/training/exercises", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        templateDayId: day.id,
        exerciseName: name,
        targetSets: sets,
        targetReps: reps,
      }),
    });
    setName("");
    setLoading(false);
    router.refresh();
  }

  async function removeExercise(exerciseId: string) {
    await fetch(`/api/training/exercises/${exerciseId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      {day.exercises.length === 0 && (
        <p className="text-sm text-muted">No exercises yet — add one below.</p>
      )}
      {day.exercises.map((exercise) => (
        <div key={exercise.id} className="flex items-center justify-between text-sm">
          <span>
            {exercise.exerciseName}{" "}
            <span className="text-muted">
              {exercise.targetSets}×{exercise.targetReps}
            </span>
          </span>
          <button onClick={() => removeExercise(exercise.id)} className="text-xs text-muted hover:text-red-400">
            ×
          </button>
        </div>
      ))}

      <form onSubmit={addExercise} className="mt-2 flex flex-wrap items-center gap-2">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Exercise (e.g. Bench Press)"
          className="min-w-0 flex-1 rounded-lg border border-border bg-surface-raised px-2 py-1 text-sm outline-none focus:border-navy-light"
        />
        <input
          type="number"
          min={1}
          value={sets}
          onChange={(event) => setSets(Number(event.target.value))}
          className="w-14 rounded-lg border border-border bg-surface-raised px-2 py-1 text-sm outline-none focus:border-navy-light"
        />
        <span className="text-xs text-muted">×</span>
        <input
          type="number"
          min={1}
          value={reps}
          onChange={(event) => setReps(Number(event.target.value))}
          className="w-14 rounded-lg border border-border bg-surface-raised px-2 py-1 text-sm outline-none focus:border-navy-light"
        />
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="rounded-lg border border-border px-2 py-1 text-xs hover:border-navy-light disabled:opacity-50"
        >
          Add
        </button>
      </form>
    </div>
  );
}
