import { getCurrentProfile } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { addDays, startOfDay } from "@/lib/dates";
import { ManualStepsForm } from "./manual-steps-form";
import { TrainingTabs } from "@/components/TrainingTabs";

const DAYS_TO_SHOW = 14;

export default async function StepsPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const today = startOfDay(new Date());
  const rangeStart = addDays(today, -(DAYS_TO_SHOW - 1));

  const entries = await prisma.stepEntry.findMany({
    where: { profileId: profile.id, date: { gte: rangeStart } },
  });
  const stepsByDate = new Map(entries.map((entry) => [entry.date.toISOString(), entry.steps]));

  const days = Array.from({ length: DAYS_TO_SHOW }, (_, index) => {
    const date = addDays(rangeStart, index);
    return { date, steps: stepsByDate.get(date.toISOString()) ?? 0 };
  });

  const maxSteps = Math.max(...days.map((day) => day.steps), 1000);
  const todaySteps = days[days.length - 1].steps;

  return (
    <div className="flex flex-col gap-6">
      <TrainingTabs />

      <h1 className="text-xl font-semibold">Cardio (Steps)</h1>

      <div className="tile flex flex-col gap-2 p-6">
        <span className="text-3xl font-semibold">{todaySteps.toLocaleString()}</span>
        <span className="text-sm text-muted">steps today</span>
      </div>

      <div className="tile flex items-end gap-2 p-6" style={{ height: 200 }}>
        {days.map((day) => (
          <div key={day.date.toISOString()} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t bg-navy-light"
              style={{ height: `${Math.max((day.steps / maxSteps) * 140, 2)}px` }}
              title={`${day.steps.toLocaleString()} steps`}
            />
            <span className="text-[10px] text-muted">
              {day.date.toLocaleDateString(undefined, { weekday: "narrow" })}
            </span>
          </div>
        ))}
      </div>

      <div className="tile p-6">
        <h2 className="mb-2 font-medium">Manual override</h2>
        <p className="mb-3 text-sm text-muted">
          Once the Shortcuts automation is set up, today&apos;s steps sync automatically. Use this
          to correct today&apos;s count if needed.
        </p>
        <ManualStepsForm defaultValue={todaySteps} />
      </div>
    </div>
  );
}
