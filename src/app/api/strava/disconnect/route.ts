import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  await prisma.stravaConnection.deleteMany({ where: { profileId: profile.id } });
  return NextResponse.json({ ok: true });
}
