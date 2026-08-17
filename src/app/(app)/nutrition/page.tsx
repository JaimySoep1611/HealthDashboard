import { getCurrentProfile } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { startOfDay, startOfWeek } from "@/lib/dates";
import { ProgressRing } from "@/components/ProgressRing";
import { TargetForm } from "./target-form";
import { FoodLogger } from "./food-logger";
import { EntryList } from "./entry-list";

export default async function NutritionPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const target = await prisma.nutritionTarget.findUnique({ where: { profileId: profile.id } });

  if (!target) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-xl font-semibold">Nutrition</h1>
        <div className="tile max-w-md p-6">
          <h2 className="mb-3 font-medium">Set your daily target</h2>
          <TargetForm />
        </div>
      </div>
    );
  }

  const today = startOfDay(new Date());
  const weekStart = startOfWeek(new Date());

  const [todayEntries, weekEntries] = await Promise.all([
    prisma.foodEntry.findMany({
      where: { profileId: profile.id, date: today },
      orderBy: { createdAt: "asc" },
    }),
    prisma.foodEntry.findMany({
      where: { profileId: profile.id, date: { gte: weekStart } },
    }),
  ]);

  const totals = todayEntries.reduce(
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
  const weekAvgCalories =
    weekEntries.reduce((sum, entry) => sum + entry.calories, 0) / daysElapsed;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Nutrition</h1>
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

      <div className="tile flex flex-wrap items-center justify-around gap-6 p-6">
        <ProgressRing value={totals.calories} target={target.calories} label="kcal" />
        <ProgressRing value={totals.proteinG} target={target.proteinG} label="protein g" color="#22c55e" />
        <ProgressRing value={totals.carbsG} target={target.carbsG} label="carbs g" color="#eab308" />
        <ProgressRing value={totals.fatG} target={target.fatG} label="fat g" color="#f97316" />
      </div>

      <div className="tile p-6">
        <p className="text-sm text-muted">
          This week (Mon–{daysElapsed === 7 ? "Sun" : "today"}): avg{" "}
          <span className="text-foreground">{Math.round(weekAvgCalories)}</span> kcal/day vs target{" "}
          {target.calories} —{" "}
          {weekAvgCalories <= target.calories
            ? `${Math.round(target.calories - weekAvgCalories)} kcal/day under, room to spare`
            : `${Math.round(weekAvgCalories - target.calories)} kcal/day over`}
        </p>
      </div>

      <div className="tile p-6">
        <h2 className="mb-3 font-medium">Log food</h2>
        <FoodLogger />
      </div>

      <div className="tile p-6">
        <h2 className="mb-3 font-medium">Today</h2>
        <EntryList entries={todayEntries.map((e) => ({ ...e, date: e.date.toISOString() }))} />
      </div>
    </div>
  );
}
