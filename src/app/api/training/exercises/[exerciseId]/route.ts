import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ exerciseId: string }> }
) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { exerciseId } = await params;
  const exercise = await prisma.templateExercise.findUnique({
    where: { id: exerciseId },
    include: { templateDay: { include: { template: true } } },
  });
  if (!exercise || exercise.templateDay.template.profileId !== profile.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.templateExercise.delete({ where: { id: exerciseId } });
  return NextResponse.json({ ok: true });
}
