import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { exchangeStravaCode } from "@/lib/strava";

export async function GET(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.redirect(new URL("/login", request.url));

  const code = request.nextUrl.searchParams.get("code");
  const oauthError = request.nextUrl.searchParams.get("error");
  if (oauthError || !code) {
    return NextResponse.redirect(new URL("/onboarding?strava=error", request.url));
  }

  try {
    const token = await exchangeStravaCode(code);
    if (!token.athlete) throw new Error("Missing athlete in Strava token response");

    const athleteName = [token.athlete.firstname, token.athlete.lastname].filter(Boolean).join(" ") || null;

    await prisma.stravaConnection.upsert({
      where: { profileId: profile.id },
      create: {
        profileId: profile.id,
        athleteId: String(token.athlete.id),
        athleteName,
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        expiresAt: token.expires_at,
      },
      update: {
        athleteId: String(token.athlete.id),
        athleteName,
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        expiresAt: token.expires_at,
      },
    });

    return NextResponse.redirect(new URL("/onboarding?strava=connected", request.url));
  } catch (err) {
    console.error("Strava callback error:", err);
    return NextResponse.redirect(new URL("/onboarding?strava=error", request.url));
  }
}
