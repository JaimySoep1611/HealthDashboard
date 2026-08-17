import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/session";
import { prisma } from "@/lib/prisma";

type IncomingSet = { reps: number; weightKg: number };
type IncomingExercise = {
  templateExerciseId: string;
  exerciseName: string;
  sets: IncomingSet[];
};

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { templateDayId, exercises } = (await request.json()) as {
    templateDayId: string;
    exercises: IncomingExercise[];
  };

  if (typeof templateDayId !== "string" || !Array.isArray(exercises)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const day = await prisma.templateDay.findUnique({
    where: { id: templateDayId },
    include: { template: true },
  });
  if (!day || day.template.profileId !== profile.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const session = await prisma.workoutSession.create({
    data: {
      profileId: profile.id,
      templateDayId,
      loggedExercises: {
        create: exercises.map((exercise, order) => ({
          exerciseName: exercise.exerciseName,
          templateExerciseId: exercise.templateExerciseId || null,
          order,
          sets: {
            create: exercise.sets
              .filter((set) => set.reps > 0 && set.weightKg >= 0)
              .map((set, setIndex) => ({
                setNumber: setIndex + 1,
                reps: set.reps,
                weightKg: set.weightKg,
              })),
          },
        })),
      },
    },
  });

  return NextResponse.json(session);
}
