import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { startOfWeek } from "@/lib/dates";

async function findOwnedExercise(exerciseId: string, profileId: string) {
  const exercise = await prisma.trainingExercise.findUnique({ where: { id: exerciseId } });
  if (!exercise || exercise.profileId !== profileId) return null;
  return exercise;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ exerciseId: string }> }
) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { exerciseId } = await params;
  const exercise = await findOwnedExercise(exerciseId, profile.id);
  if (!exercise) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const kg = exercise.kind === "weight" && typeof body.kg === "number" ? body.kg : null;
  const sets = exercise.kind === "weight" && typeof body.sets === "number" ? body.sets : null;
  const km = exercise.kind === "cardio" && typeof body.km === "number" ? body.km : null;

  const weekStart = startOfWeek(new Date());
  const log = await prisma.exerciseLog.upsert({
    where: { exerciseId_weekStart: { exerciseId, weekStart } },
    update: { kg, sets, km, loggedAt: new Date() },
    create: { exerciseId, weekStart, kg, sets, km },
  });

  return NextResponse.json(log);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ exerciseId: string }> }
) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { exerciseId } = await params;
  const exercise = await findOwnedExercise(exerciseId, profile.id);
  if (!exercise) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const weekStart = startOfWeek(new Date());
  await prisma.exerciseLog.deleteMany({ where: { exerciseId, weekStart } });

  return NextResponse.json({ ok: true });
}
