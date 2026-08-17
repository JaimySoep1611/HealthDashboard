import { getCurrentProfile } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { startOfWeek } from "@/lib/dates";
import { GoalList } from "@/components/training/goal-list";
import { TargetForm } from "@/components/nutrition/target-form";
import { FinishSetupButton } from "./finish-setup-button";

export default async function OnboardingPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const weekStart = startOfWeek(new Date());

  const [trainingGoals, target] = await Promise.all([
    prisma.trainingGoal.findMany({
      where: { profileId: profile.id },
      orderBy: { order: "asc" },
      include: { completions: { where: { weekStart } } },
    }),
    prisma.nutritionTarget.findUnique({ where: { profileId: profile.id } }),
  ]);

  const goals = trainingGoals.map((goal) => ({
    id: goal.id,
    name: goal.name,
    completedThisWeek: goal.completions.length > 0,
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
            ? "Pick your training goals and daily nutrition targets. You can change these anytime."
            : "Add, remove, or change your training goals and nutrition targets."}
        </p>
      </div>

      <GoalList goals={goals} />

      <div className="tile p-6">
        <h3 className="mb-3 font-medium">Daily nutrition target</h3>
        <TargetForm existing={target ?? undefined} />
      </div>

      <FinishSetupButton firstTime={firstTime} />
    </div>
  );
}
