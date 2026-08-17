import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { startOfDay } from "@/lib/dates";

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { amountMl } = await request.json();
  if (typeof amountMl !== "number" || amountMl <= 0) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const entry = await prisma.waterEntry.create({
    data: { profileId: profile.id, date: startOfDay(new Date()), amountMl },
  });

  return NextResponse.json(entry);
}

export async function DELETE() {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const last = await prisma.waterEntry.findFirst({
    where: { profileId: profile.id, date: startOfDay(new Date()) },
    orderBy: { createdAt: "desc" },
  });

  if (last) {
    await prisma.waterEntry.delete({ where: { id: last.id } });
  }

  return NextResponse.json({ ok: true });
}
