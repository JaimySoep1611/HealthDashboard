import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { name, weekday, kind } = await request.json();
  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof weekday !== "number" ||
    weekday < 0 ||
    weekday > 6 ||
    (kind !== "weight" && kind !== "cardio")
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const count = await prisma.trainingExercise.count({ where: { profileId: profile.id } });
  const exercise = await prisma.trainingExercise.create({
    data: { profileId: profile.id, name: name.trim(), weekday, kind, order: count },
  });

  return NextResponse.json(exercise);
}
