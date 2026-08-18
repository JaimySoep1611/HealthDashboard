import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, amsterdamHourMinute, isAtOrAfterAmsterdamTime } from "@/lib/dates";
import { sendPushToSubscriptions } from "@/lib/notify";

// Vercel Hobby only allows once-daily cron schedules (no "every 15 minutes"),
// so each check below is triggered by TWO fixed once-daily UTC cron entries
// in vercel.json — one for each possible CET/CEST offset (an hour apart).
// Whichever of the two actually lands within the check's window (computed
// from real Amsterdam local time, not the cron's nominal UTC time) is the
// "real" one for today's season; the other lands outside every window and
// no-ops harmlessly. This is what keeps meal times correct across the
// daylight-saving switch without a subscription that violates the Hobby
// once-per-day limit.
const WINDOW_MINUTES = 15;
const CHECKS = [
  // Breakfast: nothing logged yet today at all.
  { label: "breakfast", atHour: 10, atMinute: 0, sinceHour: 0, sinceMinute: 0 },
  // Lunch: nothing logged since 11:45 (an early breakfast shouldn't count).
  { label: "lunch", atHour: 13, atMinute: 0, sinceHour: 11, sinceMinute: 45 },
  // Dinner: nothing logged since 18:00.
  { label: "dinner", atHour: 19, atMinute: 0, sinceHour: 18, sinceMinute: 0 },
] as const;

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const local = amsterdamHourMinute(now);
  const nowMinutes = local.hour * 60 + local.minute;

  const activeCheck = CHECKS.find((check) => {
    const targetMinutes = check.atHour * 60 + check.atMinute;
    return nowMinutes >= targetMinutes && nowMinutes < targetMinutes + WINDOW_MINUTES;
  });

  if (!activeCheck) {
    return NextResponse.json({
      skipped: true,
      localTime: `${String(local.hour).padStart(2, "0")}:${String(local.minute).padStart(2, "0")}`,
    });
  }

  const today = startOfDay(now);
  const profiles = await prisma.profile.findMany({
    where: { pushSubscriptions: { some: {} } },
    include: {
      pushSubscriptions: true,
      foodEntries: { where: { date: today } },
    },
  });

  let notified = 0;
  let removedSubscriptions = 0;

  for (const profile of profiles) {
    const alreadyLogged = profile.foodEntries.some((entry) =>
      isAtOrAfterAmsterdamTime(entry.createdAt, activeCheck.sinceHour, activeCheck.sinceMinute)
    );
    if (alreadyLogged) continue;

    const payload = JSON.stringify({
      title: "Soephart & Ligtenberg",
      body: `Don't forget to log ${activeCheck.label}!`,
    });
    const result = await sendPushToSubscriptions(profile.pushSubscriptions, payload);
    notified += result.notified;
    removedSubscriptions += result.removed;
  }

  return NextResponse.json({ check: activeCheck.label, profilesChecked: profiles.length, notified, removedSubscriptions });
}
