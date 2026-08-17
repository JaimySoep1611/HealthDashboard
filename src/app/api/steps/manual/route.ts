import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { startOfDay } from "@/lib/dates";

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { steps } = await request.json();
  if (typeof steps !== "number" || steps < 0) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const today = startOfDay(new Date());
  const entry = await prisma.stepEntry.upsert({
    where: { profileId_date: { profileId: profile.id, date: today } },
    update: { steps },
    create: { profileId: profile.id, date: today, steps },
  });

  return NextResponse.json(entry);
}
