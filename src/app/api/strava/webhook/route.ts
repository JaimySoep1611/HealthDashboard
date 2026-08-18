import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchStravaActivity, getValidStravaAccessToken, isStravaRun, logStravaRun } from "@/lib/strava";

// One-time handshake Strava does when the push subscription is created —
// see the "one-time setup" note in the changelog/guide for how to create it.
export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const verifyToken = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe" && challenge && verifyToken === process.env.STRAVA_WEBHOOK_VERIFY_TOKEN) {
    return NextResponse.json({ "hub.challenge": challenge });
  }
  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

// Strava calls this with no session — self-authenticating is not really
// possible here (Strava doesn't sign these events), so this route is exempted
// from the auth middleware and instead only trusts owner_id lookups against
// profiles that already completed the OAuth connect flow.
export async function POST(request: NextRequest) {
  const event = await request.json().catch(() => null);

  // Always respond 200 quickly — Strava disables the subscription after
  // repeated non-2xx responses or timeouts, so failures are logged and
  // swallowed here rather than surfaced as an error response.
  if (!event || event.object_type !== "activity" || !["create", "update"].includes(event.aspect_type)) {
    return NextResponse.json({ ok: true });
  }

  try {
    const connection = await prisma.stravaConnection.findUnique({
      where: { athleteId: String(event.owner_id) },
    });
    if (connection) {
      const accessToken = await getValidStravaAccessToken(connection);
      const activity = await fetchStravaActivity(accessToken, event.object_id);
      if (isStravaRun(activity)) {
        await logStravaRun(connection.profileId, activity);
      }
    }
  } catch (err) {
    console.error("Strava webhook processing error:", err);
  }

  return NextResponse.json({ ok: true });
}
