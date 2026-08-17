import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay } from "@/lib/dates";
import { getWebPush } from "@/lib/webPush";

// Triggered once a day by Vercel Cron (see vercel.json) — Vercel signs the
// request with this header when CRON_SECRET is set, so this is the only
// auth check needed (no user session involved).
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = startOfDay(new Date());
  const webpush = getWebPush();

  const profiles = await prisma.profile.findMany({
    where: { pushSubscriptions: { some: {} } },
    include: {
      pushSubscriptions: true,
      nutritionTarget: true,
      waterEntries: { where: { date: today } },
      stepEntries: { where: { date: today } },
    },
  });

  let notified = 0;
  let removedSubscriptions = 0;

  for (const profile of profiles) {
    const missing: string[] = [];

    const waterTarget = profile.nutritionTarget?.waterTargetMl ?? 0;
    if (waterTarget > 0) {
      const totalMl = profile.waterEntries.reduce((sum, entry) => sum + entry.amountMl, 0);
      if (totalMl < waterTarget) missing.push("water");
    }

    if (profile.stepsGoal !== null) {
      const steps = profile.stepEntries[0]?.steps ?? 0;
      if (steps < profile.stepsGoal) missing.push("steps");
    }

    if (missing.length === 0) continue;

    const body =
      missing.length === 2
        ? "You haven't hit your water or steps goal yet today — still time!"
        : `You haven't hit your ${missing[0]} goal yet today — still time!`;
    const payload = JSON.stringify({ title: "Soephart & Ligtenberg", body });

    for (const subscription of profile.pushSubscriptions) {
      try {
        await webpush.sendNotification(
          { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
          payload
        );
        notified++;
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: subscription.id } }).catch(() => {});
          removedSubscriptions++;
        }
      }
    }
  }

  return NextResponse.json({ profilesChecked: profiles.length, notified, removedSubscriptions });
}
