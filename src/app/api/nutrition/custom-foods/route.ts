import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const customFoods = await prisma.customFood.findMany({
    where: { profileId: profile.id },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ customFoods });
}
