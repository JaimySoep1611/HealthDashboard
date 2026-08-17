import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { goalWeightKg } = await request.json();
  if (goalWeightKg !== null && typeof goalWeightKg !== "number") {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const updated = await prisma.profile.update({
    where: { id: profile.id },
    data: { goalWeightKg },
  });

  return NextResponse.json({ goalWeightKg: updated.goalWeightKg });
}
