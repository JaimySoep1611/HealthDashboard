import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  await prisma.profile.update({
    where: { id: profile.id },
    data: { onboardedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
