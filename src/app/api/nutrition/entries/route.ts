import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { startOfDay } from "@/lib/dates";

// AI-estimated macros sometimes come back null (the model has no confident
// estimate for that field) rather than omitted, even though the field is
// otherwise present — treat that as "0", not as invalid input.
function toNonNegativeNumber(value: unknown): number | null {
  if (value === null || value === undefined) return 0;
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
}

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { name, calories, proteinG, carbsG, fatG, source, sourceRef } = await request.json();

  const numericCalories = toNonNegativeNumber(calories);
  const numericProteinG = toNonNegativeNumber(proteinG);
  const numericCarbsG = toNonNegativeNumber(carbsG);
  const numericFatG = toNonNegativeNumber(fatG);

  if (
    typeof name !== "string" ||
    !name.trim() ||
    numericCalories === null ||
    numericProteinG === null ||
    numericCarbsG === null ||
    numericFatG === null
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const entry = await prisma.foodEntry.create({
    data: {
      profileId: profile.id,
      date: startOfDay(new Date()),
      name: name.trim(),
      calories: numericCalories,
      proteinG: numericProteinG,
      carbsG: numericCarbsG,
      fatG: numericFatG,
      source: typeof source === "string" ? source : "manual",
      sourceRef: typeof sourceRef === "string" ? sourceRef : null,
    },
  });

  return NextResponse.json(entry);
}
