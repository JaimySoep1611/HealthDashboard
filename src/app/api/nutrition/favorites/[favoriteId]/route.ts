import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ favoriteId: string }> }) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { favoriteId } = await params;
  await prisma.favoriteMeal.deleteMany({ where: { id: favoriteId } });

  return NextResponse.json({ ok: true });
}
