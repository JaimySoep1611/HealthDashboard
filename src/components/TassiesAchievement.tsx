import { TrophyIcon } from "@/components/icons";

export function TassiesAchievement({
  configured,
  earned,
  allCompleteSoFar,
  completedDays,
  totalDaysSoFar,
}: {
  // False until at least a nutrition/water target is set — can't "hit every
  // goal" if no goals exist yet.
  configured: boolean;
  // True once the whole week (Monday-Sunday) has been checked off.
  earned: boolean;
  allCompleteSoFar: boolean;
  completedDays: number;
  totalDaysSoFar: number;
}) {
  const dayWord = totalDaysSoFar === 1 ? "day" : "days";
  const statusText = !configured
    ? "Set your nutrition and water goals in \"Edit Goals\" to start earning this."
    : earned
      ? "Earned this week — every goal, every day! 🎉"
      : totalDaysSoFar === 0
        ? "New week — hit every goal each day to earn it by Sunday."
        : allCompleteSoFar
          ? `Perfect so far — ${completedDays}/${totalDaysSoFar} ${dayWord}. Keep it up through Sunday!`
          : `${completedDays}/${totalDaysSoFar} ${dayWord} complete this week — missed one, try again next Monday.`;

  return (
    <div className="tile flex flex-col gap-4 p-6">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-14 w-14 flex-none items-center justify-center rounded-2xl transition-colors ${
            earned ? "bg-amber-400/25 text-amber-300" : "bg-amber-400/10 text-amber-400/60"
          }`}
        >
          <TrophyIcon size={26} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className={`font-medium ${earned ? "text-foreground" : "text-muted"}`}>
            Tassies{earned ? " 🏆" : ""}
          </h3>
          <p className="text-sm text-muted">{statusText}</p>
        </div>
      </div>
      <p className="text-xs text-muted">More achievements coming soon.</p>
    </div>
  );
}
