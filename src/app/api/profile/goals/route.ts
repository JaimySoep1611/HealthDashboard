import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { goalWeightKg, stepsGoal, startingWeightKg } = await request.json();
  if (goalWeightKg !== null && typeof goalWeightKg !== "number") {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  if (stepsGoal !== null && typeof stepsGoal !== "number") {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  if (startingWeightKg !== null && typeof startingWeightKg !== "number") {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const updated = await prisma.profile.update({
    where: { id: profile.id },
    data: { goalWeightKg, stepsGoal, startingWeightKg },
  });

  return NextResponse.json({
    goalWeightKg: updated.goalWeightKg,
    stepsGoal: updated.stepsGoal,
    startingWeightKg: updated.startingWeightKg,
  });
}
