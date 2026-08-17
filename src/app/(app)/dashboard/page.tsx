import Link from "next/link";
import { getCurrentProfile } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ProgressRing } from "@/components/ProgressRing";
import { startOfDay, startOfWeek } from "@/lib/dates";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const today = startOfDay(new Date());
  const weekStart = startOfWeek(new Date());

  const [target, todayFoodEntries, weekFoodEntries, todaySteps, lastSession] = await Promise.all([
    prisma.nutritionTarget.findUnique({ where: { profileId: profile.id } }),
    prisma.foodEntry.findMany({ where: { profileId: profile.id, date: { gte: today } } }),
    prisma.foodEntry.findMany({ where: { profileId: profile.id, date: { gte: weekStart } } }),
    prisma.stepEntry.findUnique({ where: { profileId_date: { profileId: profile.id, date: today } } }),
    prisma.workoutSession.findFirst({
      where: { profileId: profile.id },
      orderBy: { date: "desc" },
      include: { templateDay: true },
    }),
  ]);

  const todayCalories = todayFoodEntries.reduce((sum, entry) => sum + entry.calories, 0);
  const weekAvgCalories =
    weekFoodEntries.length > 0
      ? weekFoodEntries.reduce((sum, entry) => sum + entry.calories, 0) /
        Math.max(1, daysElapsedInWeek(weekStart))
      : 0;

  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-xl font-semibold">Welcome back, {profile.name}</h1>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted">Training</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/training" className="tile flex flex-col gap-4 p-6">
            <h3 className="font-medium">Power Training</h3>
            {lastSession ? (
              <p className="text-sm text-muted">
                Last session: {lastSession.templateDay?.label ?? "Ad-hoc"} on{" "}
                {lastSession.date.toLocaleDateString()}
              </p>
            ) : (
              <p className="text-sm text-muted">No sessions logged yet.</p>
            )}
            <span className="text-sm text-navy-light">Open →</span>
          </Link>

          <Link href="/steps" className="tile flex flex-col gap-4 p-6">
            <h3 className="font-medium">Cardio (Steps)</h3>
            <p className="text-2xl font-semibold">{todaySteps?.steps.toLocaleString() ?? "—"}</p>
            <p className="text-sm text-muted">steps today</p>
            <span className="text-sm text-navy-light">Open →</span>
          </Link>

          <div className="tile flex flex-col gap-4 p-6 opacity-60">
            <h3 className="font-medium">Achievements</h3>
            <p className="text-sm text-muted">Coming later — once the trackers feel right.</p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted">Nutrition</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/nutrition" className="tile flex flex-col items-center gap-4 p-6">
            <h3 className="self-start font-medium">Nutrition</h3>
            {target ? (
              <div className="flex gap-4">
                <ProgressRing value={todayCalories} target={target.calories} label="kcal today" />
              </div>
            ) : (
              <p className="text-sm text-muted">Set a daily target to start tracking.</p>
            )}
            {target && (
              <p className="text-xs text-muted">
                Week avg: {Math.round(weekAvgCalories)} / {target.calories} kcal/day
              </p>
            )}
            <span className="text-sm text-navy-light">Open →</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

function daysElapsedInWeek(weekStart: Date): number {
  const today = startOfDay(new Date());
  const diff = Math.floor((today.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return Math.min(Math.max(diff, 1), 7);
}
