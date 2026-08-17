import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { calories, proteinG, carbsG, fatG } = await request.json();
  if (
    typeof calories !== "number" ||
    typeof proteinG !== "number" ||
    typeof carbsG !== "number" ||
    typeof fatG !== "number"
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const target = await prisma.nutritionTarget.upsert({
    where: { profileId: profile.id },
    update: { calories, proteinG, carbsG, fatG },
    create: { profileId: profile.id, calories, proteinG, carbsG, fatG },
  });

  return NextResponse.json(target);
}
