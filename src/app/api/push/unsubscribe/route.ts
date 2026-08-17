import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { endpoint } = await request.json();
  if (typeof endpoint !== "string") {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  await prisma.pushSubscription.deleteMany({ where: { endpoint, profileId: profile.id } });

  return NextResponse.json({ ok: true });
}
