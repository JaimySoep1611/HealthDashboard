import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { startOfDay } from "@/lib/dates";

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const days = typeof body.days === "number" && body.days > 0 ? Math.round(body.days) : 75;

  const challenge = await prisma.challenge.upsert({
    where: { profileId: profile.id },
    update: { startDate: startOfDay(new Date()), days },
    create: { profileId: profile.id, startDate: startOfDay(new Date()), days },
  });

  return NextResponse.json(challenge);
}

export async function DELETE() {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  await prisma.challenge.deleteMany({ where: { profileId: profile.id } });
  return NextResponse.json({ ok: true });
}
