import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ goalId: string }> }
) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { goalId } = await params;
  const goal = await prisma.trainingGoal.findUnique({ where: { id: goalId } });
  if (!goal || goal.profileId !== profile.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.goalCompletion.deleteMany({ where: { goalId } });
  await prisma.trainingGoal.delete({ where: { id: goalId } });

  return NextResponse.json({ ok: true });
}
