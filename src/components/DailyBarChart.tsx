type DayValue = { date: string; value: number };

export function DailyBarChart({
  days,
  color,
  formatValue,
  showWeekdayLabels,
}: {
  days: DayValue[];
  color: string;
  formatValue: (value: number) => string;
  showWeekdayLabels: boolean;
}) {
  const max = Math.max(...days.map((day) => day.value), 1);

  return (
    <div className="flex items-end gap-1 sm:gap-1.5" style={{ height: 140 }}>
      {days.map((day) => (
        <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
          <div
            className="w-full rounded-t-md transition-all duration-500"
            style={{ height: `${Math.max((day.value / max) * 110, 3)}px`, backgroundColor: color }}
            title={`${new Date(day.date).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}: ${formatValue(day.value)}`}
          />
          {showWeekdayLabels && (
            <span className="text-[9px] text-muted sm:text-[10px]">
              {new Date(day.date).toLocaleDateString(undefined, { weekday: "narrow" })}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
