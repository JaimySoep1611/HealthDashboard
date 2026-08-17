import { getCurrentProfile } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { startOfDay, startOfWeek, addDays } from "@/lib/dates";
import { ProgressRing } from "@/components/ProgressRing";
import { TargetForm } from "@/components/nutrition/target-form";
import { FoodLogger } from "@/components/nutrition/food-logger";
import { EntryList } from "@/components/nutrition/entry-list";
import { GoalList } from "@/components/training/goal-list";
import { ManualStepsForm } from "@/components/steps/manual-steps-form";

const STEPS_DAYS_TO_SHOW = 14;

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const today = startOfDay(new Date());
  const weekStart = startOfWeek(new Date());
  const stepsRangeStart = addDays(today, -(STEPS_DAYS_TO_SHOW - 1));

  const [target, todayFoodEntries, weekFoodEntries, trainingGoals, stepEntries] =
    await Promise.all([
      prisma.nutritionTarget.findUnique({ where: { profileId: profile.id } }),
      prisma.foodEntry.findMany({
        where: { profileId: profile.id, date: today },
        orderBy: { createdAt: "asc" },
      }),
      prisma.foodEntry.findMany({ where: { profileId: profile.id, date: { gte: weekStart } } }),
      prisma.trainingGoal.findMany({
        where: { profileId: profile.id },
        orderBy: { order: "asc" },
        include: { completions: { where: { weekStart } } },
      }),
      prisma.stepEntry.findMany({
        where: { profileId: profile.id, date: { gte: stepsRangeStart } },
      }),
    ]);

  const goals = trainingGoals.map((goal) => ({
    id: goal.id,
    name: goal.name,
    completedThisWeek: goal.completions.length > 0,
  }));

  // Nutrition calculations
  const totals = todayFoodEntries.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.calories,
      proteinG: acc.proteinG + entry.proteinG,
      carbsG: acc.carbsG + entry.carbsG,
      fatG: acc.fatG + entry.fatG,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  );
  const daysElapsed = Math.min(
    Math.max(Math.floor((today.getTime() - weekStart.getTime()) / 86_400_000) + 1, 1),
    7
  );
  const weekAvgCalories = weekFoodEntries.reduce((sum, e) => sum + e.calories, 0) / daysElapsed;

  // Steps calculations
  const stepsByDate = new Map(stepEntries.map((entry) => [entry.date.toISOString(), entry.steps]));
  const stepsDays = Array.from({ length: STEPS_DAYS_TO_SHOW }, (_, index) => {
    const date = addDays(stepsRangeStart, index);
    return { date, steps: stepsByDate.get(date.toISOString()) ?? 0 };
  });
  const maxSteps = Math.max(...stepsDays.map((day) => day.steps), 1000);
  const todaySteps = stepsDays[stepsDays.length - 1].steps;

  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-xl font-semibold">Welcome back, {profile.name}</h1>

      {/* ---------- Food ---------- */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted">Food</h2>

        {!target ? (
          <div className="tile max-w-md p-6">
            <h3 className="mb-3 font-medium">Set your daily target</h3>
            <TargetForm />
          </div>
        ) : (
          <>
            <div className="tile flex flex-wrap items-center justify-around gap-6 p-6">
              <ProgressRing value={totals.calories} target={target.calories} label="kcal" />
              <ProgressRing
                value={totals.proteinG}
                target={target.proteinG}
                label="protein g"
                color="#22c55e"
              />
              <ProgressRing
                value={totals.carbsG}
                target={target.carbsG}
                label="carbs g"
                color="#eab308"
              />
              <ProgressRing value={totals.fatG} target={target.fatG} label="fat g" color="#f97316" />
            </div>

            <div className="tile flex items-center justify-between gap-4 p-6">
              <p className="text-sm text-muted">
                This week (Mon–{daysElapsed === 7 ? "Sun" : "today"}): avg{" "}
                <span className="text-foreground">{Math.round(weekAvgCalories)}</span> kcal/day vs
                target {target.calories} —{" "}
                {weekAvgCalories <= target.calories
                  ? `${Math.round(target.calories - weekAvgCalories)} kcal/day under, room to spare`
                  : `${Math.round(weekAvgCalories - target.calories)} kcal/day over`}
              </p>
              <TargetForm
                existing={{
                  calories: target.calories,
                  proteinG: target.proteinG,
                  carbsG: target.carbsG,
                  fatG: target.fatG,
                }}
                compact
              />
            </div>

            <div className="tile p-6">
              <h3 className="mb-3 font-medium">Log food</h3>
              <FoodLogger />
            </div>

            <div className="tile p-6">
              <h3 className="mb-3 font-medium">Today</h3>
              <EntryList entries={todayFoodEntries.map((e) => ({ ...e, date: e.date.toISOString() }))} />
            </div>
          </>
        )}
      </section>

      {/* ---------- Exercise ---------- */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted">Exercise</h2>

        <GoalList goals={goals} />

        <h3 className="mt-2 text-sm font-medium text-muted">Cardio (Steps)</h3>
        <div className="tile flex flex-col gap-2 p-6">
          <span className="text-3xl font-semibold">{todaySteps.toLocaleString()}</span>
          <span className="text-sm text-muted">steps today</span>
        </div>

        <div className="tile flex items-end gap-2 p-6" style={{ height: 180 }}>
          {stepsDays.map((day) => (
            <div key={day.date.toISOString()} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t bg-navy-light"
                style={{ height: `${Math.max((day.steps / maxSteps) * 120, 2)}px` }}
                title={`${day.steps.toLocaleString()} steps`}
              />
              <span className="text-[10px] text-muted">
                {day.date.toLocaleDateString(undefined, { weekday: "narrow" })}
              </span>
            </div>
          ))}
        </div>

        <div className="tile p-6">
          <h3 className="mb-2 font-medium">Manual step override</h3>
          <p className="mb-3 text-sm text-muted">
            Once the Shortcuts automation is set up, today&apos;s steps sync automatically. Use
            this to correct today&apos;s count if needed.
          </p>
          <ManualStepsForm defaultValue={todaySteps} />
        </div>

        <div className="tile flex flex-col gap-2 p-6 opacity-60">
          <h3 className="font-medium">Achievements</h3>
          <p className="text-sm text-muted">Coming later — once the trackers feel right.</p>
        </div>
      </section>
    </div>
  );
}
