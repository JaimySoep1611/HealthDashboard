import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay } from "@/lib/dates";

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

// Public webhook target for the Apple Shortcuts automation — authenticated via
// a shared secret instead of the cookie session, since Shortcuts can't hold cookies.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    // Most common cause: the caller sent an empty or non-JSON body — e.g. a
    // Shortcuts "Get Contents of URL" action whose Request Body isn't
    // actually set to the JSON dictionary.
    return NextResponse.json({ error: "Missing or invalid JSON body" }, { status: 400 });
  }
  const { secret, profileName, date, steps } = body;

  const expectedSecret = process.env.STEPS_WEBHOOK_SECRET ?? "";
  if (!expectedSecret || typeof secret !== "string" || !timingSafeEqualStr(secret, expectedSecret)) {
    // Temporary diagnostic — lengths only, never the actual secret value —
    // to help pin down a live "Unauthorized" report from a Shortcut. Revert
    // once resolved.
    console.log(
      `DIAGNOSTIC steps-webhook auth failed: bodyType=${typeof body} bodyKeys=${
        body && typeof body === "object" ? JSON.stringify(Object.keys(body)) : "n/a"
      } receivedType=${typeof secret} receivedLength=${
        typeof secret === "string" ? secret.length : "n/a"
      } expectedLength=${expectedSecret.length} profileName=${JSON.stringify(profileName)}`
    );
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (typeof profileName !== "string" || typeof steps !== "number") {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const profile = await prisma.profile.findUnique({ where: { name: profileName } });
  if (!profile) {
    return NextResponse.json({ error: "Unknown profile" }, { status: 404 });
  }

  const day = startOfDay(typeof date === "string" ? new Date(date) : new Date());

  const entry = await prisma.stepEntry.upsert({
    where: { profileId_date: { profileId: profile.id, date: day } },
    update: { steps },
    create: { profileId: profile.id, date: day, steps },
  });

  return NextResponse.json(entry);
}
