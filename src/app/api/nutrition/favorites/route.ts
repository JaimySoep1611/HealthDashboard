import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// Shared across both profiles on purpose — see FavoriteMeal in schema.prisma.
export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const favorites = await prisma.favoriteMeal.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ favorites });
}

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { name, calories, proteinG, carbsG, fatG } = await request.json();
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

  const favorite = await prisma.favoriteMeal.create({
    data: { name: name.trim(), calories, proteinG, carbsG, fatG },
  });

  return NextResponse.json(favorite);
}
