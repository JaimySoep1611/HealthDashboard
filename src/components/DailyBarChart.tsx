import { niceTicks } from "@/lib/chartTicks";

type DayValue = { date: string; value: number };

const BAR_AREA_HEIGHT = 170;
const AXIS_WIDTH = "w-12";

export function DailyBarChart({
  days,
  color,
  target,
  formatValue,
  showWeekdayLabels,
  bottomLabel,
}: {
  days: DayValue[];
  color: string;
  // When set, the chart scales against the target (not just its own data) and
  // draws a dashed reference line, so bars show whether you hit, undershot, or
  // overshot it — rather than always filling relative to each other.
  target?: number;
  formatValue: (value: number) => string;
  showWeekdayLabels: boolean;
  // Override the bottom-row label per bar — defaults to a single weekday
  // letter, but callers charting non-daily data (e.g. one bar per week) can
  // supply their own short label instead.
  bottomLabel?: (dateIso: string) => string;
}) {
  const rawMax = Math.max(...days.map((day) => day.value), target ?? 0, 1);
  const ticks = niceTicks(0, rawMax);
  const max = ticks[ticks.length - 1];
  const tickStep = ticks.length > 1 ? ticks[1] - ticks[0] : max;
  // A tick sitting within this distance of the target would visually collide
  // with the target's own label, so we drop the tick's label there (the
  // target's bold label already marks that spot — the gridline stays).
  const mergeThreshold = tickStep * 0.4;

  const targetBottom = target !== undefined ? Math.min((target / max) * BAR_AREA_HEIGHT, BAR_AREA_HEIGHT) : null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <div
          className={`relative flex-none ${AXIS_WIDTH} text-right text-[9px] text-muted sm:text-[10px]`}
          style={{ height: BAR_AREA_HEIGHT }}
        >
          {ticks.map((tick) => {
            if (target !== undefined && Math.abs(tick - target) < mergeThreshold) return null;
            const bottom = (tick / max) * BAR_AREA_HEIGHT;
            return (
              <span
                key={tick}
                className="absolute right-0 leading-none"
                style={{ bottom: Math.min(Math.max(bottom - 4, 0), BAR_AREA_HEIGHT - 8) }}
              >
                {Math.round(tick).toLocaleString()}
              </span>
            );
          })}
          {targetBottom !== null && (
            <span
              className="absolute right-0 leading-none font-medium text-foreground"
              style={{ bottom: Math.min(Math.max(targetBottom - 4, 0), BAR_AREA_HEIGHT - 8) }}
            >
              {Math.round(target!).toLocaleString()}
            </span>
          )}
        </div>

        <div className="relative flex flex-1 items-end gap-1 sm:gap-1.5" style={{ height: BAR_AREA_HEIGHT }}>
          {ticks.map((tick) => (
            <div
              key={tick}
              className="pointer-events-none absolute left-0 right-0 border-t border-border/60"
              style={{ bottom: (tick / max) * BAR_AREA_HEIGHT }}
            />
          ))}
          {targetBottom !== null && (
            <div
              className="pointer-events-none absolute left-0 right-0"
              style={{ bottom: targetBottom, borderTop: "1px dashed var(--muted)" }}
              title={`Target: ${formatValue(target!)}`}
            />
          )}
          {days.map((day) => {
            const barHeight = Math.max((day.value / max) * BAR_AREA_HEIGHT, 3);
            // With a goal set, show how far this day fell short of it — a
            // lighter "ghost" segment from the actual bar up to the goal
            // line, plus the day's own number labeled above it. Days that
            // already hit/passed the goal just show the plain solid bar.
            // Gated on showWeekdayLabels (few enough bars to have room) —
            // a 30-bar month view would just overlap labels otherwise, same
            // reason that view already skips the weekday-letter labels.
            const showGoalDetail = target !== undefined && showWeekdayLabels;
            const showGap = showGoalDetail && day.value < target!;
            const totalHeight = showGap ? targetBottom! : barHeight;
            const dayTitle = `${new Date(day.date).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}: ${formatValue(day.value)}`;

            return (
              <div key={day.date} className="relative flex flex-1 flex-col items-center justify-end">
                {showGoalDetail && (
                  <span
                    className="absolute whitespace-nowrap text-[8px] leading-none text-muted sm:text-[9px]"
                    style={{ bottom: Math.min(totalHeight + 3, BAR_AREA_HEIGHT - 4) }}
                  >
                    {Math.round(day.value).toLocaleString()}
                  </span>
                )}
                <div className="relative w-full" style={{ height: totalHeight }} title={dayTitle}>
                  {showGap && (
                    <div
                      className="absolute inset-x-0 top-0 rounded-t-md"
                      style={{ height: Math.max(targetBottom! - barHeight, 0), backgroundColor: color, opacity: 0.25 }}
                    />
                  )}
                  <div
                    className={`absolute inset-x-0 bottom-0 w-full transition-all duration-500 ${
                      showGap ? "" : "rounded-t-md"
                    }`}
                    style={{ height: barHeight, backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showWeekdayLabels && (
        <div className="flex gap-2">
          <div className={`${AXIS_WIDTH} flex-none`} />
          <div className="flex flex-1 gap-1 sm:gap-1.5">
            {days.map((day) => (
              <span key={day.date} className="flex-1 text-center text-[9px] text-muted sm:text-[10px]">
                {bottomLabel
                  ? bottomLabel(day.date)
                  : new Date(day.date).toLocaleDateString(undefined, { weekday: "narrow" })}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
