type DayValue = { date: string; value: number };

const BAR_AREA_HEIGHT = 110;
const AXIS_WIDTH = "w-10";

export function DailyBarChart({
  days,
  color,
  target,
  formatValue,
  showWeekdayLabels,
}: {
  days: DayValue[];
  color: string;
  // When set, the chart scales against the target (not just its own data) and
  // draws a dashed reference line, so bars show whether you hit, undershot, or
  // overshot it — rather than always filling relative to each other.
  target?: number;
  formatValue: (value: number) => string;
  showWeekdayLabels: boolean;
}) {
  const max = Math.max(...days.map((day) => day.value), target ?? 0, 1);
  const targetBottom = target !== undefined ? Math.min((target / max) * BAR_AREA_HEIGHT, BAR_AREA_HEIGHT) : null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <div
          className={`relative flex-none ${AXIS_WIDTH} text-right text-[9px] text-muted sm:text-[10px]`}
          style={{ height: BAR_AREA_HEIGHT }}
        >
          <span className="absolute right-0 top-0 leading-none">{Math.round(max).toLocaleString()}</span>
          {targetBottom !== null && (
            <span
              className="absolute right-0 leading-none text-foreground"
              style={{ bottom: Math.min(Math.max(targetBottom - 4, 0), BAR_AREA_HEIGHT - 8) }}
            >
              {Math.round(target!).toLocaleString()}
            </span>
          )}
          <span className="absolute right-0 bottom-0 leading-none">0</span>
        </div>

        <div className="relative flex flex-1 items-end gap-1 sm:gap-1.5" style={{ height: BAR_AREA_HEIGHT }}>
          {targetBottom !== null && (
            <div
              className="pointer-events-none absolute left-0 right-0"
              style={{ bottom: targetBottom, borderTop: "1px dashed var(--muted)" }}
              title={`Target: ${formatValue(target!)}`}
            />
          )}
          {days.map((day) => (
            <div key={day.date} className="flex flex-1 items-end">
              <div
                className="w-full rounded-t-md transition-all duration-500"
                style={{
                  height: `${Math.max((day.value / max) * BAR_AREA_HEIGHT, 3)}px`,
                  backgroundColor: color,
                }}
                title={`${new Date(day.date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}: ${formatValue(day.value)}`}
              />
            </div>
          ))}
        </div>
      </div>

      {showWeekdayLabels && (
        <div className="flex gap-2">
          <div className={`${AXIS_WIDTH} flex-none`} />
          <div className="flex flex-1 gap-1 sm:gap-1.5">
            {days.map((day) => (
              <span key={day.date} className="flex-1 text-center text-[9px] text-muted sm:text-[10px]">
                {new Date(day.date).toLocaleDateString(undefined, { weekday: "narrow" })}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
