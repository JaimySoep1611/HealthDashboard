import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { templateDayId, exerciseName, targetSets, targetReps } = await request.json();
  if (
    typeof templateDayId !== "string" ||
    typeof exerciseName !== "string" ||
    !exerciseName.trim() ||
    typeof targetSets !== "number" ||
    typeof targetReps !== "number"
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const day = await prisma.templateDay.findUnique({
    where: { id: templateDayId },
    include: { template: true, exercises: true },
  });
  if (!day || day.template.profileId !== profile.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const exercise = await prisma.templateExercise.create({
    data: {
      templateDayId,
      exerciseName: exerciseName.trim(),
      targetSets,
      targetReps,
      order: day.exercises.length,
    },
  });

  return NextResponse.json(exercise);
}
