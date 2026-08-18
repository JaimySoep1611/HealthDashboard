import { prisma } from "@/lib/prisma";
import { startOfDay, startOfWeek, weekdayIndex } from "@/lib/dates";

const STRAVA_OAUTH_BASE = "https://www.strava.com/oauth";
const STRAVA_API_BASE = "https://www.strava.com/api/v3";

// Only these Strava activity types map onto the training schedule's "cardio"
// (km) exercises — everything else (rides, swims, etc.) is ignored.
const RUN_TYPES = new Set(["Run", "TrailRun", "VirtualRun"]);

export function isStravaConfigured(): boolean {
  return Boolean(process.env.STRAVA_CLIENT_ID && process.env.STRAVA_CLIENT_SECRET);
}

export function getStravaAuthorizeUrl(redirectUri: string): string {
  const clientId = process.env.STRAVA_CLIENT_ID;
  if (!clientId) throw new Error("Strava is not configured");
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    approval_prompt: "auto",
    scope: "activity:read_all",
  });
  return `${STRAVA_OAUTH_BASE}/authorize?${params.toString()}`;
}

type StravaTokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete?: { id: number; firstname?: string; lastname?: string };
};

async function requestStravaToken(body: Record<string, string>): Promise<StravaTokenResponse> {
  const response = await fetch(`${STRAVA_OAUTH_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      ...body,
    }),
  });
  if (!response.ok) {
    throw new Error(`Strava token request failed (${response.status}): ${await response.text()}`);
  }
  return response.json();
}

export function exchangeStravaCode(code: string) {
  return requestStravaToken({ code, grant_type: "authorization_code" });
}

function refreshStravaToken(refreshToken: string) {
  return requestStravaToken({ refresh_token: refreshToken, grant_type: "refresh_token" });
}

// Ensures a usable access token, refreshing (and persisting the refreshed
// tokens) first if the stored one is expired or about to expire.
export async function getValidStravaAccessToken(connection: {
  id: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}): Promise<string> {
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (connection.expiresAt > nowSeconds + 60) {
    return connection.accessToken;
  }
  const refreshed = await refreshStravaToken(connection.refreshToken);
  await prisma.stravaConnection.update({
    where: { id: connection.id },
    data: {
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token,
      expiresAt: refreshed.expires_at,
    },
  });
  return refreshed.access_token;
}

export type StravaActivity = {
  id: number;
  name: string;
  type: string;
  distance: number; // meters
  moving_time: number; // seconds
  total_elevation_gain: number; // meters
  average_speed: number; // meters/second
  start_date: string; // ISO, UTC
};

export async function fetchStravaActivity(
  accessToken: string,
  activityId: number | string
): Promise<StravaActivity> {
  const response = await fetch(`${STRAVA_API_BASE}/activities/${activityId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error(`Failed to fetch Strava activity ${activityId} (${response.status})`);
  return response.json();
}

export function isStravaRun(activity: StravaActivity): boolean {
  return RUN_TYPES.has(activity.type);
}

// Logs a run against that weekday's cardio exercise, reusing one if the
// profile already has one scheduled for that weekday, or creating a single
// reusable one ("Run") if not — so an unplanned run still lands on today's
// schedule instead of being lost, and repeat unplanned runs on the same
// weekday don't each create a new exercise.
export async function logStravaRun(profileId: string, activity: StravaActivity) {
  const day = startOfDay(new Date(activity.start_date));
  const weekday = weekdayIndex(day);
  const weekStart = startOfWeek(day);

  let exercise = await prisma.trainingExercise.findFirst({
    where: { profileId, weekday, kind: "cardio" },
    orderBy: { order: "asc" },
  });

  if (!exercise) {
    const maxOrder = await prisma.trainingExercise.aggregate({
      where: { profileId },
      _max: { order: true },
    });
    exercise = await prisma.trainingExercise.create({
      data: { profileId, weekday, name: "Run", kind: "cardio", order: (maxOrder._max.order ?? 0) + 1 },
    });
  }

  const detail = {
    km: activity.distance / 1000,
    stravaActivityId: String(activity.id),
    movingTimeSec: activity.moving_time,
    elevationGainM: activity.total_elevation_gain,
    avgSpeedMps: activity.average_speed,
  };

  await prisma.exerciseLog.upsert({
    where: { exerciseId_weekStart: { exerciseId: exercise.id, weekStart } },
    create: { exerciseId: exercise.id, weekStart, ...detail },
    update: detail,
  });
}
