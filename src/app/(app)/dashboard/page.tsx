import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { startOfDay, startOfWeek, addDays } from "@/lib/dates";
import { SectionHeader } from "@/components/SectionHeader";
import { StatCard } from "@/components/StatCard";
import { DashboardHero } from "@/components/DashboardHero";
import { TargetForm } from "@/components/nutrition/target-form";
import { FoodLogSection } from "@/components/nutrition/FoodLogSection";
import { FoodEntriesProvider } from "@/components/nutrition/FoodEntriesContext";
import { MealsLoggedStat } from "@/components/nutrition/MealsLoggedStat";
import { WeeklySchedule } from "@/components/training/weekly-schedule";
import { WaterCard } from "@/components/health/WaterCard";
import { StepsCard } from "@/components/health/StepsCard";
import { WeightCard } from "@/components/health/WeightCard";
import { TrendsSection } from "@/components/TrendsSection";
import { FlameIcon, DumbbellIcon, TrendUpIcon, TrophyIcon } from "@/components/icons";

const TRENDS_DAYS = 30;
const TREND_DAYS = 7;

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  if (!profile.onboardedAt) {
    redirect("/onboarding");
  }

  const today = startOfDay(new Date());
  const weekStart = startOfWeek(new Date());
  const trendsRangeStart = addDays(today, -(TRENDS_DAYS - 1));

  const [
    target,
    todayFoodEntries,
    weekFoodEntries,
    monthFoodEntries,
    trainingExercises,
    monthStepEntries,
    todayWater,
    monthWaterEntries,
    weightEntries,
  ] = await Promise.all([
    prisma.nutritionTarget.findUnique({ where: { profileId: profile.id } }),
    prisma.foodEntry.findMany({
      where: { profileId: profile.id, date: today },
      orderBy: { createdAt: "asc" },
    }),
    prisma.foodEntry.findMany({ where: { profileId: profile.id, date: { gte: weekStart } } }),
    prisma.foodEntry.findMany({
      where: { profileId: profile.id, date: { gte: trendsRangeStart } },
    }),
    prisma.trainingExercise.findMany({
      where: { profileId: profile.id },
      orderBy: { order: "asc" },
      include: { logs: { where: { weekStart } } },
    }),
    prisma.stepEntry.findMany({
      where: { profileId: profile.id, date: { gte: trendsRangeStart } },
    }),
    prisma.waterEntry.findMany({ where: { profileId: profile.id, date: today } }),
    prisma.waterEntry.findMany({
      where: { profileId: profile.id, date: { gte: trendsRangeStart } },
    }),
    prisma.weightEntry.findMany({
      where: { profileId: profile.id, date: { gte: trendsRangeStart } },
      orderBy: { date: "asc" },
    }),
  ]);

  const exercises = trainingExercises.map((exercise) => ({
    id: exercise.id,
    name: exercise.name,
    weekday: exercise.weekday,
    kind: exercise.kind as "weight" | "cardio",
    log: exercise.logs[0]
      ? {
          kg: exercise.logs[0].kg,
          sets: exercise.logs[0].sets,
          reps: exercise.logs[0].reps,
          km: exercise.logs[0].km,
        }
      : null,
  }));
  const exercisesLogged = exercises.filter((e) => e.log).length;

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
  const weekTotalCalories = weekFoodEntries.reduce((sum, e) => sum + e.calories, 0);
  const weekTotalExcludingToday = weekTotalCalories - totals.calories;

  // 30-day zero-filled daily totals, shared by the compact "last 7 days" mini
  // chart in the Food card and the full Trends section below.
  const dailyCalories = Array.from({ length: TRENDS_DAYS }, (_, index) => {
    const day = addDays(trendsRangeStart, index);
    return {
      date: day.toISOString(),
      value: monthFoodEntries
        .filter((e) => e.date.getTime() === day.getTime())
        .reduce((sum, e) => sum + e.calories, 0),
    };
  });
  const calorieTrend = dailyCalories.slice(-TREND_DAYS).map((day) => day.value);

  const dailyWater = Array.from({ length: TRENDS_DAYS }, (_, index) => {
    const day = addDays(trendsRangeStart, index);
    return {
      date: day.toISOString(),
      value: monthWaterEntries
        .filter((e) => e.date.getTime() === day.getTime())
        .reduce((sum, e) => sum + e.amountMl, 0),
    };
  });

  const totalWaterMl = todayWater.reduce((sum, entry) => sum + entry.amountMl, 0);

  // Steps calculations
  const stepsByDate = new Map(monthStepEntries.map((entry) => [entry.date.toISOString(), entry.steps]));
  const dailySteps = Array.from({ length: TRENDS_DAYS }, (_, index) => {
    const day = addDays(trendsRangeStart, index);
    return { date: day.toISOString(), value: stepsByDate.get(day.toISOString()) ?? 0 };
  });
  const todaySteps = dailySteps[dailySteps.length - 1].value;

  const dailyWeight = weightEntries.map((entry) => ({
    date: entry.date.toISOString(),
    value: entry.weightKg,
  }));
  const latestWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weightKg : null;
  const weightTrend = weightEntries.map((entry) => entry.weightKg);
  const weightLoggedToday = weightEntries.some((entry) => entry.date.getTime() === today.getTime());

  return (
    <FoodEntriesProvider initialEntries={todayFoodEntries}>
      <div className="flex flex-col gap-8">
        {/* ---------- Header: greeting, quick-glance widgets, today's totals ---------- */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-stretch">
            <div className="sm:col-span-2 lg:col-span-2 lg:h-full">
              <DashboardHero name={profile.name} />
            </div>
            {target && <WaterCard totalMl={totalWaterMl} targetMl={target.waterTargetMl} />}
            <StepsCard steps={todaySteps} />
            <WeightCard
              latestKg={latestWeight}
              goalKg={profile.goalWeightKg}
              trend={weightTrend}
              loggedToday={weightLoggedToday}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <MealsLoggedStat />
            <StatCard
              icon={<DumbbellIcon size={22} />}
              color="var(--navy-light)"
              value={`${exercisesLogged}/${exercises.length || 0}`}
              label="Exercises logged this week"
            />
          </div>
        </div>

        {/* ---------- Achievements ---------- */}
        <div className="flex flex-col items-center gap-3 rounded-[1.25rem] border border-dashed border-border p-6 text-center sm:flex-row sm:gap-4 sm:text-left">
          <div className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400/80">
            <TrophyIcon size={22} />
          </div>
          <div>
            <h3 className="font-medium text-muted">Achievements — coming soon</h3>
            <p className="text-sm text-muted">Badges and streaks once the trackers feel right.</p>
          </div>
        </div>

        {/* ---------- Food ---------- */}
        <section className="flex flex-col gap-4">
          <SectionHeader icon={<FlameIcon size={16} />} title="Food" />

          {!target ? (
            <div className="tile p-6">
              <h3 className="mb-3 font-medium">Set your daily target</h3>
              <TargetForm />
            </div>
          ) : (
            <FoodLogSection
              target={{
                calories: target.calories,
                proteinG: target.proteinG,
                carbsG: target.carbsG,
                fatG: target.fatG,
                waterTargetMl: target.waterTargetMl,
              }}
              calorieTrend={calorieTrend}
              trendDays={TREND_DAYS}
              weekTotalExcludingToday={weekTotalExcludingToday}
              daysElapsed={daysElapsed}
            />
          )}
        </section>

        {/* ---------- Training ---------- */}
        <section className="flex flex-col gap-4">
          <SectionHeader icon={<DumbbellIcon size={16} />} title="Training" />
          <WeeklySchedule exercises={exercises} editable={false} />
        </section>

        {/* ---------- Trends ---------- */}
        <section className="flex flex-col gap-4">
          <SectionHeader icon={<TrendUpIcon size={16} />} title="Trends" />
          <TrendsSection
            calories={dailyCalories}
            caloriesTarget={target?.calories ?? 0}
            water={dailyWater}
            waterTarget={target?.waterTargetMl ?? 0}
            steps={dailySteps}
            weight={dailyWeight}
            weightGoal={profile.goalWeightKg}
            days={TRENDS_DAYS}
          />
        </section>
      </div>
    </FoodEntriesProvider>
  );
}
