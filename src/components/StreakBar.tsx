import { FlameIcon } from "@/components/icons";

const STREAK_COLOR = "#f97316";

export function StreakBar({ streak }: { streak: number }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
      <div
        className="flex h-9 w-9 flex-none items-center justify-center rounded-xl"
        style={{ backgroundColor: `${STREAK_COLOR}22`, color: STREAK_COLOR }}
      >
        <FlameIcon size={18} />
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="text-sm font-semibold">
          {streak > 0 ? `${streak}-day streak` : "No streak yet"}
        </span>
        <span className="truncate text-xs text-muted">
          {streak > 0
            ? "Every daily goal hit, every day"
            : "Hit every daily goal today to start one"}
        </span>
      </div>
    </div>
  );
}
