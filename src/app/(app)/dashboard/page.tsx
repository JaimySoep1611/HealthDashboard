import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { startOfDay, startOfWeek, addDays } from "@/lib/dates";
import { SectionHeader } from "@/components/SectionHeader";
import { StatCard } from "@/components/StatCard";
import { DashboardHero } from "@/components/DashboardHero";
import { TargetForm } from "@/components/nutrition/target-form";
import { FoodLogSection } from "@/components/nutrition/FoodLogSection";
import { WeeklySchedule } from "@/components/training/weekly-schedule";
import { ManualStepsForm } from "@/components/steps/manual-steps-form";
import { WeightCard } from "@/components/health/WeightCard";
import { FlameIcon, FootprintsIcon, DumbbellIcon, TrophyIcon } from "@/components/icons";

const STEPS_DAYS_TO_SHOW = 14;
const TREND_DAYS = 7;

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  if (!profile.onboardedAt) {
    redirect("/onboarding");
  }

  const today = startOfDay(new Date());
  const weekStart = startOfWeek(new Date());
  const stepsRangeStart = addDays(today, -(STEPS_DAYS_TO_SHOW - 1));
  const trendRangeStart = addDays(today, -(TREND_DAYS - 1));
  const weightRangeStart = addDays(today, -29);

  const [
    target,
    todayFoodEntries,
    weekFoodEntries,
    trendFoodEntries,
    trainingExercises,
    stepEntries,
    todayWater,
    weightEntries,
  ] = await Promise.all([
    prisma.nutritionTarget.findUnique({ where: { profileId: profile.id } }),
    prisma.foodEntry.findMany({
      where: { profileId: profile.id, date: today },
      orderBy: { createdAt: "asc" },
    }),
    prisma.foodEntry.findMany({ where: { profileId: profile.id, date: { gte: weekStart } } }),
    prisma.foodEntry.findMany({
      where: { profileId: profile.id, date: { gte: trendRangeStart } },
    }),
    prisma.trainingExercise.findMany({
      where: { profileId: profile.id },
      orderBy: { order: "asc" },
      include: { logs: { where: { weekStart } } },
    }),
    prisma.stepEntry.findMany({
      where: { profileId: profile.id, date: { gte: stepsRangeStart } },
    }),
    prisma.waterEntry.findMany({ where: { profileId: profile.id, date: today } }),
    prisma.weightEntry.findMany({
      where: { profileId: profile.id, date: { gte: weightRangeStart } },
      orderBy: { date: "asc" },
    }),
  ]);

  const exercises = trainingExercises.map((exercise) => ({
    id: exercise.id,
    name: exercise.name,
    weekday: exercise.weekday,
    kind: exercise.kind as "weight" | "cardio",
    log: exercise.logs[0]
      ? { kg: exercise.logs[0].kg, sets: exercise.logs[0].sets, km: exercise.logs[0].km }
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

  const calorieTrend = Array.from({ length: TREND_DAYS }, (_, index) => {
    const day = addDays(trendRangeStart, index);
    return trendFoodEntries
      .filter((e) => e.date.getTime() === day.getTime())
      .reduce((sum, e) => sum + e.calories, 0);
  });

  const totalWaterMl = todayWater.reduce((sum, entry) => sum + entry.amountMl, 0);

  // Steps calculations
  const stepsByDate = new Map(stepEntries.map((entry) => [entry.date.toISOString(), entry.steps]));
  const stepsDays = Array.from({ length: STEPS_DAYS_TO_SHOW }, (_, index) => {
    const date = addDays(stepsRangeStart, index);
    return { date, steps: stepsByDate.get(date.toISOString()) ?? 0 };
  });
  const maxSteps = Math.max(...stepsDays.map((day) => day.steps), 1000);
  const todaySteps = stepsDays[stepsDays.length - 1].steps;

  const latestWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weightKg : null;
  const weightTrend = weightEntries.map((entry) => entry.weightKg);
  const weightLoggedToday = weightEntries.some((entry) => entry.date.getTime() === today.getTime());

  return (
    <div className="flex flex-col gap-8">
      <DashboardHero name={profile.name} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start lg:gap-6">
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
              totalWaterMl={totalWaterMl}
              initialEntries={todayFoodEntries}
              calorieTrend={calorieTrend}
              trendDays={TREND_DAYS}
              weekTotalExcludingToday={weekTotalExcludingToday}
              daysElapsed={daysElapsed}
            />
          )}
        </section>

        {/* ---------- Exercise ---------- */}
        <section className="flex flex-col gap-4">
          <SectionHeader icon={<DumbbellIcon size={16} />} title="Exercise" />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <StatCard
              icon={<FootprintsIcon size={22} />}
              color="#3b82f6"
              value={todaySteps.toLocaleString()}
              label="Steps today"
            />
            <StatCard
              icon={<DumbbellIcon size={22} />}
              color="var(--navy-light)"
              value={`${exercisesLogged}/${exercises.length || 0}`}
              label="Exercises logged this week"
            />
          </div>

          <WeightCard
            latestKg={latestWeight}
            goalKg={profile.goalWeightKg}
            trend={weightTrend}
            loggedToday={weightLoggedToday}
          />

          <WeeklySchedule exercises={exercises} />

          <div className="tile p-5 sm:p-6">
            <h3 className="mb-4 font-medium">Cardio — last {STEPS_DAYS_TO_SHOW} days</h3>
            <div className="flex items-end gap-1.5 sm:gap-2" style={{ height: 140 }}>
              {stepsDays.map((day) => (
                <div key={day.date.toISOString()} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-[var(--navy)] to-[var(--navy-light)] transition-all duration-500"
                    style={{ height: `${Math.max((day.steps / maxSteps) * 110, 3)}px` }}
                    title={`${day.steps.toLocaleString()} steps`}
                  />
                  <span className="text-[9px] text-muted sm:text-[10px]">
                    {day.date.toLocaleDateString(undefined, { weekday: "narrow" })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="tile p-5 sm:p-6">
            <h3 className="mb-2 font-medium">Manual step override</h3>
            <p className="mb-3 text-sm text-muted">
              Once the Shortcuts automation is set up, today&apos;s steps sync automatically. Use
              this to correct today&apos;s count if needed.
            </p>
            <ManualStepsForm defaultValue={todaySteps} />
          </div>

          <div className="flex items-center gap-4 rounded-[1.25rem] border border-dashed border-border p-5 sm:p-6">
            <div className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400/80">
              <TrophyIcon size={22} />
            </div>
            <div>
              <h3 className="font-medium text-muted">Achievements — coming soon</h3>
              <p className="text-sm text-muted">Badges and streaks once the trackers feel right.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
