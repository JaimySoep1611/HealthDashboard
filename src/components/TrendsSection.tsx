"use client";

import { useState } from "react";
import { DailyBarChart } from "@/components/DailyBarChart";
import { Sparkline } from "@/components/Sparkline";
import { niceTicks } from "@/lib/chartTicks";
import { FlameIcon, DropletIcon, FootprintsIcon, ScaleIcon, DumbbellIcon } from "@/components/icons";

type DayValue = { date: string; value: number };

type ExerciseTrend = {
  id: string;
  name: string;
  // One point per week the exercise was logged (sparse — skips weeks with
  // nothing logged), ascending by week.
  points: { weekStart: string; kg: number }[];
};

type Props = {
  // Zero-filled, ascending, one entry per calendar day, last entry = today.
  calories: DayValue[];
  caloriesTarget: number;
  water: DayValue[];
  waterTarget: number;
  steps: DayValue[];
  stepsGoal: number | null;
  // Sparse — only days actually logged, ascending.
  weight: DayValue[];
  weightGoal: number | null;
  startingWeightKg: number | null;
  // Length of the zero-filled history window (e.g. 30).
  days: number;
  // Weekly kg history per power-training exercise.
  exerciseTrends: ExerciseTrend[];
};

const METRICS = [
  { key: "calories", label: "Calories", icon: FlameIcon, color: "#fb923c", unit: "kcal" },
  { key: "water", label: "Water", icon: DropletIcon, color: "#06b6d4", unit: "ml" },
  { key: "steps", label: "Steps", icon: FootprintsIcon, color: "var(--navy-light)", unit: "steps" },
  { key: "weight", label: "Weight", icon: ScaleIcon, color: "#8b5cf6", unit: "kg" },
  { key: "training", label: "Training", icon: DumbbellIcon, color: "#f472b6", unit: "kg" },
] as const;

type MetricKey = (typeof METRICS)[number]["key"];

// A distinct color per exercise so multiple stacked charts stay visually
// distinguishable from one another at a glance.
const EXERCISE_COLORS = ["#f472b6", "#60a5fa", "#facc15", "#34d399", "#a78bfa", "#fb7185"];

function groupByWeek(points: { weekStart: string; kg: number }[]): DayValue[] {
  return points
    .map((point) => ({ date: point.weekStart, value: point.kg }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Weekly kg points don't compare cleanly week-to-week (some weeks get
// skipped), so group into calendar months — one bar per month, averaging
// whatever weeks were actually logged that month.
function groupByMonth(points: { weekStart: string; kg: number }[]): DayValue[] {
  const byMonth = new Map<string, { total: number; count: number; firstOfMonth: string }>();
  for (const point of points) {
    const date = new Date(point.weekStart);
    const monthKey = `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
    const existing = byMonth.get(monthKey);
    if (existing) {
      existing.total += point.kg;
      existing.count += 1;
    } else {
      const firstOfMonth = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)).toISOString();
      byMonth.set(monthKey, { total: point.kg, count: 1, firstOfMonth });
    }
  }
  return Array.from(byMonth.values())
    .sort((a, b) => a.firstOfMonth.localeCompare(b.firstOfMonth))
    .map(({ total, count, firstOfMonth }) => ({ date: firstOfMonth, value: total / count }));
}

export function TrendsSection({
  calories,
  caloriesTarget,
  water,
  waterTarget,
  steps,
  stepsGoal,
  weight,
  weightGoal,
  startingWeightKg,
  days,
  exerciseTrends,
}: Props) {
  const [metric, setMetric] = useState<MetricKey>("calories");
  const [range, setRange] = useState<"week" | "month">("week");

  const active = METRICS.find((m) => m.key === metric)!;
  const rangeDays = range === "week" ? 7 : days;

  if (metric === "training") {
    return (
      <div className="tile flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {METRICS.map((m) => (
              <button
                key={m.key}
                onClick={() => setMetric(m.key)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  metric === m.key
                    ? "border-navy-light bg-navy-light/15 text-foreground"
                    : "border-border text-muted hover:text-foreground"
                }`}
              >
                <m.icon size={13} />
                {m.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1 rounded-full border border-border p-1">
            {(["week", "month"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition ${
                  range === r ? "bg-navy text-white" : "text-muted hover:text-foreground"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {exerciseTrends.length === 0 ? (
          <p className="text-sm text-muted">
            Add a power-training exercise via &quot;Edit Goals&quot; and log a few weeks to see its trend here.
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {exerciseTrends.map((exercise, index) => (
              <ExerciseChart
                key={exercise.id}
                name={exercise.name}
                points={exercise.points}
                color={EXERCISE_COLORS[index % EXERCISE_COLORS.length]}
                range={range}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const zeroFilled: Record<"calories" | "water" | "steps", DayValue[]> = { calories, water, steps };
  const target: Partial<Record<MetricKey, number>> = {
    calories: caloriesTarget || undefined,
    water: waterTarget || undefined,
    steps: stepsGoal ?? undefined,
    weight: weightGoal ?? undefined,
  };

  let visible: DayValue[];
  if (metric === "weight") {
    // Derive "today" from the server-supplied data instead of the client clock,
    // since calories is always zero-filled through today.
    const referenceDate = new Date(calories[calories.length - 1].date);
    const cutoff = new Date(referenceDate);
    cutoff.setDate(cutoff.getDate() - (rangeDays - 1));
    visible = weight.filter((point) => new Date(point.date) >= cutoff);
  } else {
    visible = zeroFilled[metric as "calories" | "water" | "steps"].slice(-rangeDays);
  }

  const average =
    visible.length > 0 ? visible.reduce((sum, point) => sum + point.value, 0) / visible.length : 0;

  return (
    <div className="tile flex flex-col gap-5 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {METRICS.map((m) => (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                metric === m.key
                  ? "border-navy-light bg-navy-light/15 text-foreground"
                  : "border-border text-muted hover:text-foreground"
              }`}
            >
              <m.icon size={13} />
              {m.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 rounded-full border border-border p-1">
          {(["week", "month"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition ${
                range === r ? "bg-navy text-white" : "text-muted hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted">
        {range === "week" ? "Last 7 days" : `Last ${days} days`} average:{" "}
        <span className="text-foreground">
          {metric === "weight" ? average.toFixed(1) : Math.round(average).toLocaleString()}
        </span>{" "}
        {active.unit}
        {target[metric] !== undefined && (
          <>
            {" "}
            · target {target[metric]!.toLocaleString()} {active.unit}
            {metric !== "weight" ? "/day" : ""}
          </>
        )}
        {metric === "weight" && startingWeightKg !== null && (
          <>
            {" "}
            · started at {startingWeightKg.toLocaleString()} {active.unit}
            {visible.length > 0 && (
              <>
                {" "}
                (
                {(() => {
                  const delta = visible[visible.length - 1].value - startingWeightKg;
                  return `${delta > 0 ? "+" : ""}${delta.toFixed(1)} kg so far`;
                })()}
                )
              </>
            )}
          </>
        )}
      </p>

      {metric === "weight" ? (
        visible.length > 1 ? (
          <WeightTrendChart
            id={`trend-weight-${range}`}
            points={visible.map((point) => point.value)}
            color={active.color}
            goal={weightGoal}
            startWeight={startingWeightKg}
          />
        ) : (
          <p className="text-sm text-muted">Not enough weigh-ins logged yet in this range.</p>
        )
      ) : (
        <DailyBarChart
          days={visible}
          color={active.color}
          target={target[metric]}
          formatValue={(value) => `${Math.round(value).toLocaleString()} ${active.unit}`}
          showWeekdayLabels={range === "week"}
        />
      )}

      {range === "month" && metric !== "weight" && visible.length > 0 && (
        <div className="flex justify-between text-[10px] text-muted">
          <span>
            {new Date(visible[0].date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </span>
          <span>
            {new Date(visible[visible.length - 1].date).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      )}
    </div>
  );
}

const WEIGHT_CHART_HEIGHT = 170;

function WeightTrendChart({
  id,
  points,
  color,
  goal,
  startWeight,
}: {
  id: string;
  points: number[];
  color: string;
  goal: number | null;
  startWeight: number | null;
}) {
  const rawMin = Math.min(...points, goal ?? Infinity, startWeight ?? Infinity, 0);
  const rawMax = Math.max(...points, goal ?? 0, startWeight ?? 0, 1);
  const ticks = niceTicks(rawMin, rawMax);
  const min = ticks[0];
  const max = ticks[ticks.length - 1];
  const range = max - min || 1;
  const tickStep = ticks.length > 1 ? ticks[1] - ticks[0] : range;
  // A tick sitting within this distance of the goal would visually collide
  // with the goal's own label, so we drop the tick's label there (the goal's
  // bold label already marks that spot — the gridline stays).
  const mergeThreshold = tickStep * 0.4;

  const goalBottom =
    goal !== null ? Math.min(Math.max(((goal - min) / range) * WEIGHT_CHART_HEIGHT, 0), WEIGHT_CHART_HEIGHT) : null;

  return (
    <div className="flex gap-2">
      <div
        className="relative flex-none w-12 text-right text-[9px] text-muted sm:text-[10px]"
        style={{ height: WEIGHT_CHART_HEIGHT }}
      >
        {ticks.map((tick) => {
          if (goal !== null && Math.abs(tick - goal) < mergeThreshold) return null;
          const bottom = ((tick - min) / range) * WEIGHT_CHART_HEIGHT;
          return (
            <span
              key={tick}
              className="absolute right-0 leading-none"
              style={{ bottom: Math.min(Math.max(bottom - 4, 0), WEIGHT_CHART_HEIGHT - 8) }}
            >
              {tick.toFixed(1)}
            </span>
          );
        })}
        {goalBottom !== null && (
          <span
            className="absolute right-0 leading-none font-medium text-foreground"
            style={{ bottom: Math.min(Math.max(goalBottom - 4, 0), WEIGHT_CHART_HEIGHT - 8) }}
          >
            {goal!.toFixed(1)}
          </span>
        )}
      </div>
      <div className="relative flex-1" style={{ height: WEIGHT_CHART_HEIGHT }}>
        {ticks.map((tick) => (
          <div
            key={tick}
            className="pointer-events-none absolute left-0 right-0 border-t border-border/60"
            style={{ bottom: ((tick - min) / range) * WEIGHT_CHART_HEIGHT }}
          />
        ))}
        <Sparkline
          id={id}
          points={points}
          color={color}
          height={WEIGHT_CHART_HEIGHT}
          target={goal ?? undefined}
          secondaryTarget={startWeight ?? undefined}
          scaleMin={min}
          scaleMax={max}
        />
      </div>
    </div>
  );
}

function ExerciseChart({
  name,
  points,
  color,
  range,
}: {
  name: string;
  points: { weekStart: string; kg: number }[];
  color: string;
  range: "week" | "month";
}) {
  const chartPoints = range === "week" ? groupByWeek(points) : groupByMonth(points);
  const average =
    chartPoints.length > 0 ? chartPoints.reduce((sum, p) => sum + p.value, 0) / chartPoints.length : 0;
  const unitLabel = range === "week" ? "week" : "month";

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-sm font-medium" style={{ color }}>
        {name}
      </h4>
      {chartPoints.length > 0 && (
        <p className="text-xs text-muted">
          Last {chartPoints.length} {unitLabel}
          {chartPoints.length === 1 ? "" : "s"} average:{" "}
          <span className="text-foreground">{Math.round(average)}</span> kg
        </p>
      )}

      {chartPoints.length > 0 ? (
        <>
          <DailyBarChart
            days={chartPoints}
            color={color}
            formatValue={(value) => `${Math.round(value)}kg`}
            showWeekdayLabels={range === "week"}
            bottomLabel={(dateIso) =>
              new Date(dateIso).toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" })
            }
          />
          {range === "month" && (
            <div className="flex justify-between text-[10px] text-muted">
              <span>
                {new Date(chartPoints[0].date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </span>
              <span>
                {new Date(chartPoints[chartPoints.length - 1].date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-muted">Not logged yet.</p>
      )}
    </div>
  );
}
