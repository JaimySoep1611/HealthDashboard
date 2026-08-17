import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { startOfDay, startOfWeek, addDays, weekdayIndex } from "@/lib/dates";
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
import { StreakBar } from "@/components/StreakBar";
import { FlameIcon, DumbbellIcon, TrendUpIcon } from "@/components/icons";

const TRENDS_DAYS = 30;
const TREND_DAYS = 7;
// ~6 months back, so the monthly training chart has real history to show.
const TRAINING_TREND_WEEKS = 26;

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  if (!profile.onboardedAt) {
    redirect("/onboarding");
  }

  const today = startOfDay(new Date());
  const weekStart = startOfWeek(new Date());
  const trendsRangeStart = addDays(today, -(TRENDS_DAYS - 1));
  const trainingTrendsStart = addDays(weekStart, -7 * (TRAINING_TREND_WEEKS - 1));
  // The streak only looks back as far as the zero-filled TRENDS_DAYS window,
  // so this only needs to cover the weeks that window can touch.
  const streakLogsStart = startOfWeek(trendsRangeStart);

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
    weightExerciseLogs,
    streakExerciseLogs,
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
    prisma.exerciseLog.findMany({
      where: {
        exercise: { profileId: profile.id, kind: "weight" },
        weekStart: { gte: trainingTrendsStart },
      },
      orderBy: { weekStart: "asc" },
    }),
    prisma.exerciseLog.findMany({
      where: { exercise: { profileId: profile.id }, weekStart: { gte: streakLogsStart } },
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
  // "Exercises logged" counts training DAYS complete, not individual exercises —
  // a day with 3 exercises only counts once it's fully logged, matching the
  // green-dot indicator on the weekly schedule strip.
  const scheduledWeekdays = Array.from(new Set(exercises.map((e) => e.weekday)));
  const trainingDaysLogged = scheduledWeekdays.filter((weekday) =>
    exercises.filter((e) => e.weekday === weekday).every((e) => e.log !== null)
  ).length;

  // Weekly kg history per power-training exercise, for the Trends "Training" tab.
  const exerciseTrends = trainingExercises
    .filter((exercise) => exercise.kind === "weight")
    .map((exercise) => ({
      id: exercise.id,
      name: exercise.name,
      points: weightExerciseLogs
        .filter((log) => log.exerciseId === exercise.id && log.kg !== null)
        .map((log) => ({ weekStart: log.weekStart.toISOString(), kg: log.kg! })),
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

  // Streak: consecutive days (ending today) where every goal that's actually
  // been set was hit — water, steps, calories & macros, and training (a day
  // with nothing scheduled always counts as "hit" for training). A goal that
  // was never configured is skipped rather than counted as a miss.
  const dailyMacros = new Map(
    monthFoodEntries.reduce((byDate, entry) => {
      const key = entry.date.toISOString();
      const existing = byDate.get(key) ?? { proteinG: 0, carbsG: 0, fatG: 0 };
      byDate.set(key, {
        proteinG: existing.proteinG + entry.proteinG,
        carbsG: existing.carbsG + entry.carbsG,
        fatG: existing.fatG + entry.fatG,
      });
      return byDate;
    }, new Map<string, { proteinG: number; carbsG: number; fatG: number }>())
  );
  const caloriesByDate = new Map(dailyCalories.map((d) => [d.date, d.value]));
  const waterByDate = new Map(dailyWater.map((d) => [d.date, d.value]));
  const loggedExerciseWeeks = new Set(
    streakExerciseLogs.map((log) => `${log.exerciseId}|${log.weekStart.toISOString()}`)
  );
  const stepsGoal = profile.stepsGoal;

  // Within 10% of target in either direction counts as "hit" — calorie/macro
  // goals aren't a floor like water or steps, so over- and under-shooting both
  // count against it.
  function withinTarget(actual: number, goal: number): boolean {
    return goal <= 0 || Math.abs(actual - goal) <= goal * 0.1;
  }

  function isTrainingDayComplete(day: Date): boolean {
    const scheduled = trainingExercises.filter((exercise) => exercise.weekday === weekdayIndex(day));
    if (scheduled.length === 0) return true;
    const dayWeekStart = startOfWeek(day).toISOString();
    return scheduled.every((exercise) => loggedExerciseWeeks.has(`${exercise.id}|${dayWeekStart}`));
  }

  function isDayComplete(day: Date): boolean {
    const iso = day.toISOString();
    if (target) {
      const macros = dailyMacros.get(iso) ?? { proteinG: 0, carbsG: 0, fatG: 0 };
      if (!withinTarget(caloriesByDate.get(iso) ?? 0, target.calories)) return false;
      if (!withinTarget(macros.proteinG, target.proteinG)) return false;
      if (!withinTarget(macros.carbsG, target.carbsG)) return false;
      if (!withinTarget(macros.fatG, target.fatG)) return false;
      if ((waterByDate.get(iso) ?? 0) < target.waterTargetMl) return false;
    }
    if (stepsGoal !== null && (stepsByDate.get(iso) ?? 0) < stepsGoal) return false;
    if (!isTrainingDayComplete(day)) return false;
    return true;
  }

  let streak = 0;
  for (let i = 0; i < TRENDS_DAYS; i++) {
    const day = addDays(today, -i);
    if (!isDayComplete(day)) break;
    streak++;
  }

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
            <StepsCard steps={todaySteps} goal={profile.stepsGoal} />
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
              value={`${trainingDaysLogged}/${scheduledWeekdays.length || 0}`}
              label="Training days logged this week"
            />
          </div>
        </div>

        <StreakBar streak={streak} />

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
            stepsGoal={profile.stepsGoal}
            weight={dailyWeight}
            weightGoal={profile.goalWeightKg}
            days={TRENDS_DAYS}
            exerciseTrends={exerciseTrends}
          />
        </section>
      </div>
    </FoodEntriesProvider>
  );
}
