import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/session";
import { getStravaAuthorizeUrl, isStravaConfigured } from "@/lib/strava";

export async function GET(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.redirect(new URL("/login", request.url));

  if (!isStravaConfigured()) {
    return NextResponse.json({ error: "Strava is not configured yet" }, { status: 503 });
  }

  const redirectUri = new URL("/api/strava/callback", request.nextUrl.origin).toString();
  return NextResponse.redirect(getStravaAuthorizeUrl(redirectUri));
}
