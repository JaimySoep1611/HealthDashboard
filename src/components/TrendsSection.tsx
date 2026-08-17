"use client";

import { useState } from "react";
import { DailyBarChart } from "@/components/DailyBarChart";
import { Sparkline } from "@/components/Sparkline";
import { FlameIcon, DropletIcon, FootprintsIcon, ScaleIcon } from "@/components/icons";

type DayValue = { date: string; value: number };

type Props = {
  // Zero-filled, ascending, one entry per calendar day, last entry = today.
  calories: DayValue[];
  caloriesTarget: number;
  water: DayValue[];
  waterTarget: number;
  steps: DayValue[];
  // Sparse — only days actually logged, ascending.
  weight: DayValue[];
  weightGoal: number | null;
  // Length of the zero-filled history window (e.g. 30).
  days: number;
};

const METRICS = [
  { key: "calories", label: "Calories", icon: FlameIcon, color: "#fb923c", unit: "kcal" },
  { key: "water", label: "Water", icon: DropletIcon, color: "#06b6d4", unit: "ml" },
  { key: "steps", label: "Steps", icon: FootprintsIcon, color: "var(--navy-light)", unit: "steps" },
  { key: "weight", label: "Weight", icon: ScaleIcon, color: "#8b5cf6", unit: "kg" },
] as const;

type MetricKey = (typeof METRICS)[number]["key"];

export function TrendsSection({
  calories,
  caloriesTarget,
  water,
  waterTarget,
  steps,
  weight,
  weightGoal,
  days,
}: Props) {
  const [metric, setMetric] = useState<MetricKey>("calories");
  const [range, setRange] = useState<"week" | "month">("week");

  const active = METRICS.find((m) => m.key === metric)!;
  const rangeDays = range === "week" ? 7 : days;

  const zeroFilled: Record<"calories" | "water" | "steps", DayValue[]> = { calories, water, steps };
  const target: Partial<Record<MetricKey, number>> = {
    calories: caloriesTarget || undefined,
    water: waterTarget || undefined,
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
    visible = zeroFilled[metric].slice(-rangeDays);
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
      </p>

      {metric === "weight" ? (
        visible.length > 1 ? (
          <WeightTrendChart
            id={`trend-weight-${range}`}
            points={visible.map((point) => point.value)}
            color={active.color}
            goal={weightGoal}
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

const WEIGHT_CHART_HEIGHT = 140;

function WeightTrendChart({
  id,
  points,
  color,
  goal,
}: {
  id: string;
  points: number[];
  color: string;
  goal: number | null;
}) {
  const max = Math.max(...points, goal ?? 0, 1);
  const min = Math.min(...points, goal ?? Infinity, 0);
  const range = max - min || 1;
  const goalBottom =
    goal !== null ? Math.min(Math.max(((goal - min) / range) * WEIGHT_CHART_HEIGHT, 0), WEIGHT_CHART_HEIGHT) : null;

  return (
    <div className="flex gap-2">
      <div
        className="relative flex-none w-10 text-right text-[9px] text-muted sm:text-[10px]"
        style={{ height: WEIGHT_CHART_HEIGHT }}
      >
        <span className="absolute right-0 top-0 leading-none">{max.toFixed(1)}</span>
        {goalBottom !== null && (
          <span
            className="absolute right-0 leading-none text-foreground"
            style={{ bottom: Math.min(Math.max(goalBottom - 4, 0), WEIGHT_CHART_HEIGHT - 8) }}
          >
            {goal!.toFixed(1)}
          </span>
        )}
        <span className="absolute right-0 bottom-0 leading-none">{min.toFixed(1)}</span>
      </div>
      <div className="flex-1" style={{ height: WEIGHT_CHART_HEIGHT }}>
        <Sparkline id={id} points={points} color={color} height={WEIGHT_CHART_HEIGHT} target={goal ?? undefined} />
      </div>
    </div>
  );
}
