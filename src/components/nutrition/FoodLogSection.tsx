"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ProgressRing } from "@/components/ProgressRing";
import { Sparkline } from "@/components/Sparkline";
import { TargetForm } from "@/components/nutrition/target-form";
import { FoodLogger } from "@/components/nutrition/food-logger";
import { EntryList } from "@/components/nutrition/entry-list";
import { useFoodEntries } from "@/components/nutrition/FoodEntriesContext";

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

type MacroKey = "proteinG" | "carbsG" | "fatG";

const MACRO_LABELS: Record<MacroKey, string> = {
  proteinG: "protein",
  carbsG: "carbs",
  fatG: "fat",
};

const MACRO_FOOD_IDEAS: Record<MacroKey, string> = {
  proteinG: "chicken, eggs, Greek yogurt, or tofu",
  carbsG: "rice, oats, fruit, or potatoes",
  fatG: "nuts, olive oil, avocado, or peanut butter",
};

// Rule-based on purpose — no AI call, so it's instant and never affected by
// the Gemini quota. Returns null when no target is set at all (nothing to
// advise against), [] once every macro is met, or one line per macro still
// short — sorted so the biggest gap reads first.
function macroAdvice(totals: Record<MacroKey, number>, target: Record<MacroKey, number>): string[] | null {
  const hasAnyTarget = target.proteinG > 0 || target.carbsG > 0 || target.fatG > 0;
  if (!hasAnyTarget) return null;

  const gaps = (Object.keys(MACRO_LABELS) as MacroKey[])
    .map((key) => ({ key, remaining: target[key] - totals[key] }))
    .filter((gap) => gap.remaining > 5) // ignore near-enough/over targets
    .sort((a, b) => b.remaining - a.remaining);

  return gaps.map(
    (gap) => `Still ~${Math.round(gap.remaining)}g ${MACRO_LABELS[gap.key]} to go — try ${MACRO_FOOD_IDEAS[gap.key]}.`
  );
}

export function FoodLogSection({
  target,
  calorieTrend,
  trendDays,
  weekTotalExcludingToday,
  daysElapsed,
}: {
  target: Target;
  calorieTrend: number[];
  trendDays: number;
  weekTotalExcludingToday: number;
  daysElapsed: number;
}) {
  const router = useRouter();
  const { entries, setEntries } = useFoodEntries();
  const [addError, setAddError] = useState<string | null>(null);

  const totals = useMemo(() => sumTotals(entries), [entries]);
  const advice = useMemo(() => macroAdvice(totals, target), [totals, target]);
  const liveTrend = calorieTrend.map((value, index) =>
    index === trendDays - 1 ? totals.calories : value
  );
  const weekAvgCalories = (weekTotalExcludingToday + totals.calories) / daysElapsed;

  function addEntry(item: AiFoodItem, source: string) {
    const tempId = `temp-${Math.random().toString(36).slice(2)}`;
    setAddError(null);
    setEntries((current) => [...current, { id: tempId, ...item }]);

    fetch("/api/nutrition/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, source }),
    })
      .then(async (response) => {
        // The server rejecting this (bad input, not logged in, etc.) is not a
        // network failure — fetch() only rejects on that — so it has to be
        // checked explicitly, or a failed save silently looks like a success.
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error ?? `Save failed (${response.status})`);
        }
        return response.json();
      })
      .then((created) => {
        setEntries((current) => current.map((entry) => (entry.id === tempId ? { ...entry, id: created.id } : entry)));
        router.refresh();
      })
      .catch((error) => {
        setEntries((current) => current.filter((entry) => entry.id !== tempId));
        setAddError(error instanceof Error ? error.message : "Couldn't save this item — try again.");
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

        {advice !== null && (
          <div className="flex flex-col items-center gap-1">
            {advice.length > 0 ? (
              advice.map((line) => (
                <p key={line} className="text-center text-xs text-muted">
                  {line}
                </p>
              ))
            ) : (
              <p className="text-center text-xs text-muted">You&apos;ve hit your macro targets for today — nice work.</p>
            )}
          </div>
        )}

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

      <div className="tile p-5 sm:p-6">
        <h3 className="mb-3 font-medium">Log food</h3>
        <FoodLogger onAdd={addEntry} />
        {addError && <p className="mt-2 text-sm text-red-400">{addError}</p>}
      </div>

      <div className="tile p-5 sm:p-6">
        <h3 className="mb-3 font-medium">Today</h3>
        <EntryList entries={entries} onRemove={removeEntry} />
      </div>
    </>
  );
}
