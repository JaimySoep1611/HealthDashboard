import { NextRequest, NextResponse } from "next/server";
import { PROFILE_COOKIE, signToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { profileId } = await request.json();

  if (typeof profileId !== "string") {
    return NextResponse.json({ error: "Missing profileId" }, { status: 400 });
  }

  const profile = await prisma.profile.findUnique({ where: { id: profileId } });
  if (!profile) {
    return NextResponse.json({ error: "Unknown profile" }, { status: 404 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(PROFILE_COOKIE, await signToken(profile.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
