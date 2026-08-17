import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ dayId: string }> }
) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { dayId } = await params;
  const day = await prisma.templateDay.findUnique({
    where: { id: dayId },
    include: { template: true },
  });
  if (!day || day.template.profileId !== profile.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.templateExercise.deleteMany({ where: { templateDayId: dayId } });
  await prisma.templateDay.delete({ where: { id: dayId } });

  return NextResponse.json({ ok: true });
}
