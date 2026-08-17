import Link from "next/link";
import { getCurrentProfile } from "@/lib/session";
import { getOrCreateTemplate } from "@/lib/training";
import { WEEKDAY_LABELS } from "@/lib/weekdays";
import { prisma } from "@/lib/prisma";
import { AddDayForm } from "./add-day-form";
import { ExerciseManager } from "./exercise-manager";
import { DeleteDayButton } from "./delete-day-button";
import { TrainingTabs } from "@/components/TrainingTabs";

export default async function TrainingPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const template = await getOrCreateTemplate(profile.id);

  const lastSessions = await prisma.workoutSession.findMany({
    where: { profileId: profile.id, templateDayId: { in: template.days.map((d) => d.id) } },
    orderBy: { date: "desc" },
    include: { loggedExercises: { include: { sets: true } } },
  });

  const lastSessionByDay = new Map<string, (typeof lastSessions)[number]>();
  for (const session of lastSessions) {
    if (session.templateDayId && !lastSessionByDay.has(session.templateDayId)) {
      lastSessionByDay.set(session.templateDayId, session);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <TrainingTabs />

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Power Training — {template.name}</h1>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {template.days.map((day) => {
          const lastSession = lastSessionByDay.get(day.id);
          return (
            <div key={day.id} className="tile flex flex-col gap-4 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-medium">{day.label}</h2>
                  <p className="text-xs text-muted">{WEEKDAY_LABELS[day.weekday]}</p>
                </div>
                <DeleteDayButton dayId={day.id} />
              </div>

              <ExerciseManager day={day} />

              {lastSession && (
                <p className="text-xs text-muted">
                  Last logged {lastSession.date.toLocaleDateString()}
                </p>
              )}

              <Link
                href={`/training/log/${day.id}`}
                className="mt-2 rounded-lg bg-navy px-3 py-2 text-center text-sm font-medium text-white transition hover:bg-navy-light"
              >
                Log session
              </Link>
            </div>
          );
        })}
      </div>

      <div className="tile p-6">
        <h2 className="mb-3 font-medium">Add a training day</h2>
        <AddDayForm />
      </div>
    </div>
  );
}
