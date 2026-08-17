"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { WEEKDAY_LABELS } from "@/lib/weekdays";
import { ExerciseManager } from "./exercise-manager";
import { DeleteDayButton } from "./delete-day-button";
import { LogSessionForm } from "./log-session-form";

type TemplateExercise = {
  id: string;
  exerciseName: string;
  targetSets: number;
  targetReps: number;
};

type Day = {
  id: string;
  label: string;
  weekday: number;
  exercises: TemplateExercise[];
};

export function DayCard({
  day,
  lastSetsByExercise,
  lastLoggedDate,
}: {
  day: Day;
  lastSetsByExercise: Record<string, { reps: number; weightKg: number }[]>;
  lastLoggedDate: string | null;
}) {
  const router = useRouter();
  const [logging, setLogging] = useState(false);

  return (
    <div className="tile flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">{day.label}</h3>
          <p className="text-xs text-muted">{WEEKDAY_LABELS[day.weekday]}</p>
        </div>
        <DeleteDayButton dayId={day.id} />
      </div>

      <ExerciseManager day={day} />

      {lastLoggedDate && <p className="text-xs text-muted">Last logged {lastLoggedDate}</p>}

      {!logging ? (
        <button
          onClick={() => setLogging(true)}
          disabled={day.exercises.length === 0}
          className="rounded-lg bg-navy px-3 py-2 text-center text-sm font-medium text-white transition hover:bg-navy-light disabled:opacity-50"
        >
          Log session
        </button>
      ) : (
        <LogSessionForm
          dayId={day.id}
          exercises={day.exercises.map((exercise) => ({
            id: exercise.id,
            exerciseName: exercise.exerciseName,
            targetSets: exercise.targetSets,
            targetReps: exercise.targetReps,
            lastSets: lastSetsByExercise[exercise.id] ?? [],
          }))}
          onSaved={() => {
            setLogging(false);
            router.refresh();
          }}
          onCancel={() => setLogging(false)}
        />
      )}
    </div>
  );
}
