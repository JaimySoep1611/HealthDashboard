import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { name } = await request.json();
  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const count = await prisma.trainingGoal.count({ where: { profileId: profile.id } });
  const goal = await prisma.trainingGoal.create({
    data: { profileId: profile.id, name: name.trim(), order: count },
  });

  return NextResponse.json(goal);
}
