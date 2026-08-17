import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { LogSessionForm } from "./log-session-form";

export default async function LogSessionPage({
  params,
}: {
  params: Promise<{ dayId: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const { dayId } = await params;

  const day = await prisma.templateDay.findUnique({
    where: { id: dayId },
    include: { template: true, exercises: { orderBy: { order: "asc" } } },
  });

  if (!day || day.template.profileId !== profile.id) {
    notFound();
  }

  const lastSession = await prisma.workoutSession.findFirst({
    where: { profileId: profile.id, templateDayId: dayId },
    orderBy: { date: "desc" },
    include: { loggedExercises: { include: { sets: true } } },
  });

  const lastSetsByExercise = new Map<string, { reps: number; weightKg: number }[]>();
  if (lastSession) {
    for (const logged of lastSession.loggedExercises) {
      if (logged.templateExerciseId) {
        lastSetsByExercise.set(
          logged.templateExerciseId,
          logged.sets.map((s) => ({ reps: s.reps, weightKg: s.weightKg }))
        );
      }
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Log: {day.label}</h1>
      <LogSessionForm
        dayId={day.id}
        exercises={day.exercises.map((exercise) => ({
          id: exercise.id,
          exerciseName: exercise.exerciseName,
          targetSets: exercise.targetSets,
          targetReps: exercise.targetReps,
          lastSets: lastSetsByExercise.get(exercise.id) ?? [],
        }))}
      />
    </div>
  );
}
