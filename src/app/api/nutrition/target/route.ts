import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { calories, proteinG, carbsG, fatG, waterTargetMl } = await request.json();
  if (
    typeof calories !== "number" ||
    typeof proteinG !== "number" ||
    typeof carbsG !== "number" ||
    typeof fatG !== "number" ||
    (waterTargetMl !== undefined && typeof waterTargetMl !== "number")
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const data = {
    calories,
    proteinG,
    carbsG,
    fatG,
    ...(waterTargetMl !== undefined ? { waterTargetMl } : {}),
  };

  const target = await prisma.nutritionTarget.upsert({
    where: { profileId: profile.id },
    update: data,
    create: { profileId: profile.id, waterTargetMl: 2000, ...data },
  });

  return NextResponse.json(target);
}
