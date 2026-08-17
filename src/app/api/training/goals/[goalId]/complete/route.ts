import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { startOfWeek } from "@/lib/dates";

async function findOwnedGoal(goalId: string, profileId: string) {
  const goal = await prisma.trainingGoal.findUnique({ where: { id: goalId } });
  if (!goal || goal.profileId !== profileId) return null;
  return goal;
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ goalId: string }> }
) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { goalId } = await params;
  const goal = await findOwnedGoal(goalId, profile.id);
  if (!goal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const weekStart = startOfWeek(new Date());
  const completion = await prisma.goalCompletion.upsert({
    where: { goalId_weekStart: { goalId, weekStart } },
    update: {},
    create: { goalId, weekStart },
  });

  return NextResponse.json(completion);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ goalId: string }> }
) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { goalId } = await params;
  const goal = await findOwnedGoal(goalId, profile.id);
  if (!goal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const weekStart = startOfWeek(new Date());
  await prisma.goalCompletion.deleteMany({ where: { goalId, weekStart } });

  return NextResponse.json({ ok: true });
}
