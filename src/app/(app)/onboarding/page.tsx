import { getCurrentProfile } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { startOfWeek } from "@/lib/dates";
import { WeeklySchedule } from "@/components/training/weekly-schedule";
import { TargetForm } from "@/components/nutrition/target-form";
import { ProfileGoalsForm } from "@/components/health/ProfileGoalsForm";
import { NotificationsToggle } from "@/components/NotificationsToggle";
import { FinishSetupButton } from "./finish-setup-button";

export default async function OnboardingPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const weekStart = startOfWeek(new Date());

  const [trainingExercises, target] = await Promise.all([
    prisma.trainingExercise.findMany({
      where: { profileId: profile.id },
      orderBy: { order: "asc" },
      include: { logs: { where: { weekStart } } },
    }),
    prisma.nutritionTarget.findUnique({ where: { profileId: profile.id } }),
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

  const firstTime = !profile.onboardedAt;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">
          {firstTime ? `Welcome, ${profile.name} — let's set up your dashboard` : "Your setup"}
        </h1>
        <p className="text-sm text-muted">
          {firstTime
            ? "Set up your weekly training schedule and daily nutrition targets. You can change these anytime."
            : "Add, remove, or change your training schedule and nutrition targets."}
        </p>
      </div>

      <WeeklySchedule exercises={exercises} editable />

      <div className="tile p-6">
        <h3 className="mb-3 font-medium">Daily nutrition &amp; water target</h3>
        <TargetForm existing={target ?? undefined} />
      </div>

      <div className="tile p-6">
        <h3 className="mb-3 font-medium">Body weight &amp; steps goals</h3>
        <ProfileGoalsForm
          existingWeightGoal={profile.goalWeightKg}
          existingStepsGoal={profile.stepsGoal}
          existingStartingWeight={profile.startingWeightKg}
        />
      </div>

      <div className="tile p-6">
        <h3 className="mb-3 font-medium">Daily reminders</h3>
        <NotificationsToggle />
      </div>

      <FinishSetupButton firstTime={firstTime} />
    </div>
  );
}
