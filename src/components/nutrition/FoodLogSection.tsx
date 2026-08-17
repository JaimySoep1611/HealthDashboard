"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ProgressRing } from "@/components/ProgressRing";
import { Sparkline } from "@/components/Sparkline";
import { StatCard } from "@/components/StatCard";
import { FlameIcon } from "@/components/icons";
import { TargetForm } from "@/components/nutrition/target-form";
import { FoodLogger } from "@/components/nutrition/food-logger";
import { EntryList } from "@/components/nutrition/entry-list";

type FoodEntryItem = {
  id: string;
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
};

type AiFoodItem = {
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
};

type Target = {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  waterTargetMl: number;
};

function sumTotals(entries: FoodEntryItem[]) {
  return entries.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.calories,
      proteinG: acc.proteinG + entry.proteinG,
      carbsG: acc.carbsG + entry.carbsG,
      fatG: acc.fatG + entry.fatG,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  );
}

export function FoodLogSection({
  target,
  initialEntries,
  calorieTrend,
  trendDays,
  weekTotalExcludingToday,
  daysElapsed,
}: {
  target: Target;
  initialEntries: FoodEntryItem[];
  calorieTrend: number[];
  trendDays: number;
  weekTotalExcludingToday: number;
  daysElapsed: number;
}) {
  const router = useRouter();
  const [entries, setEntries] = useState(initialEntries);

  const totals = useMemo(() => sumTotals(entries), [entries]);
  const liveTrend = calorieTrend.map((value, index) =>
    index === trendDays - 1 ? totals.calories : value
  );
  const weekAvgCalories = (weekTotalExcludingToday + totals.calories) / daysElapsed;

  function addEntry(item: AiFoodItem, source: string) {
    const tempId = `temp-${Math.random().toString(36).slice(2)}`;
    setEntries((current) => [...current, { id: tempId, ...item }]);

    fetch("/api/nutrition/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, source }),
    })
      .then((response) => response.json())
      .then((created) => {
        let wasRemovedBeforeItArrived = true;
        setEntries((current) => {
          wasRemovedBeforeItArrived = !current.some((entry) => entry.id === tempId);
          return current.map((entry) => (entry.id === tempId ? { ...entry, id: created.id } : entry));
        });
        // If the user removed it locally while the create request was still in flight,
        // the real row now exists in the database with nothing to delete it — clean it up.
        if (wasRemovedBeforeItArrived) {
          fetch(`/api/nutrition/entries/${created.id}`, { method: "DELETE" });
        } else {
          router.refresh();
        }
      })
      .catch(() => {
        setEntries((current) => current.filter((entry) => entry.id !== tempId));
      });
  }

  function removeEntry(id: string) {
    const removed = entries.find((entry) => entry.id === id);
    setEntries((current) => current.filter((entry) => entry.id !== id));

    fetch(`/api/nutrition/entries/${id}`, { method: "DELETE" })
      .then(() => router.refresh())
      .catch(() => {
        if (removed) setEntries((current) => [...current, removed]);
      });
  }

  return (
    <>
      <div className="tile flex flex-col gap-5 p-5 sm:p-6">
        <div className="mx-auto flex w-full max-w-xl flex-wrap items-center justify-around gap-x-4 gap-y-6">
          <ProgressRing
            id="calories"
            value={totals.calories}
            target={target.calories}
            label="kcal"
            color="#fb923c"
            colorTo="#f97316"
            size={112}
            stroke={11}
          />
          <ProgressRing
            id="protein"
            value={totals.proteinG}
            target={target.proteinG}
            label="protein g"
            color="#4ade80"
            colorTo="#16a34a"
          />
          <ProgressRing
            id="carbs"
            value={totals.carbsG}
            target={target.carbsG}
            label="carbs g"
            color="#facc15"
            colorTo="#ca8a04"
          />
          <ProgressRing
            id="fat"
            value={totals.fatG}
            target={target.fatG}
            label="fat g"
            color="#f472b6"
            colorTo="#db2777"
          />
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted">Last {trendDays} days</p>
            <div className="h-14 w-full sm:max-w-xs">
              <Sparkline id="calories-trend" points={liveTrend} color="#fb923c" target={target.calories} />
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end sm:pl-4 sm:text-right">
            <p className="text-xs text-muted">
              Week avg <span className="text-foreground">{Math.round(weekAvgCalories)}</span> /{" "}
              {target.calories} kcal/day
            </p>
            <TargetForm
              existing={{
                calories: target.calories,
                proteinG: target.proteinG,
                carbsG: target.carbsG,
                fatG: target.fatG,
                waterTargetMl: target.waterTargetMl,
              }}
              compact
            />
          </div>
        </div>
      </div>

      <StatCard
        icon={<FlameIcon size={22} />}
        color="#14b8a6"
        value={entries.length}
        label="Meals logged today"
      />

      <div className="tile p-5 sm:p-6">
        <h3 className="mb-3 font-medium">Log food</h3>
        <FoodLogger onAdd={addEntry} />
      </div>

      <div className="tile p-5 sm:p-6">
        <h3 className="mb-3 font-medium">Today</h3>
        <EntryList entries={entries} onRemove={removeEntry} />
      </div>
    </>
  );
}
