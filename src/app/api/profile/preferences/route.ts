import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { funBackground } = await request.json();
  if (typeof funBackground !== "boolean") {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const updated = await prisma.profile.update({
    where: { id: profile.id },
    data: { funBackground },
  });

  return NextResponse.json({ funBackground: updated.funBackground });
}
