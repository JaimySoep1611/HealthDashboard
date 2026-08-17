import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { startOfDay } from "@/lib/dates";

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { name, calories, proteinG, carbsG, fatG, source, sourceRef, saveAsCustom } =
    await request.json();

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof calories !== "number" ||
    typeof proteinG !== "number" ||
    typeof carbsG !== "number" ||
    typeof fatG !== "number"
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const entry = await prisma.foodEntry.create({
    data: {
      profileId: profile.id,
      date: startOfDay(new Date()),
      name: name.trim(),
      calories,
      proteinG,
      carbsG,
      fatG,
      source: typeof source === "string" ? source : "manual",
      sourceRef: typeof sourceRef === "string" ? sourceRef : null,
    },
  });

  if (saveAsCustom) {
    await prisma.customFood.create({
      data: { profileId: profile.id, name: name.trim(), calories, proteinG, carbsG, fatG },
    });
  }

  return NextResponse.json(entry);
}
