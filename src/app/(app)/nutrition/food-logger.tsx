"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SearchResult = {
  code: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
};

type CustomFood = {
  id: string;
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
};

export function FoodLogger() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [grams, setGrams] = useState(100);
  const [customFoods, setCustomFoods] = useState<CustomFood[]>([]);
  const [saving, setSaving] = useState(false);
  const [manual, setManual] = useState(false);
  const [manualValues, setManualValues] = useState({
    name: "",
    calories: 0,
    proteinG: 0,
    carbsG: 0,
    fatG: 0,
  });

  useEffect(() => {
    fetch("/api/nutrition/custom-foods")
      .then((res) => res.json())
      .then((data) => setCustomFoods(data.customFoods ?? []));
  }, []);

  useEffect(() => {
    if (!query.trim() || manual) {
      return;
    }
    const timeout = setTimeout(async () => {
      setSearching(true);
      const response = await fetch(`/api/nutrition/food-search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setResults(data.results ?? []);
      setSearching(false);
    }, 400);
    return () => clearTimeout(timeout);
  }, [query, manual]);

  async function logSelected() {
    if (!selected) return;
    setSaving(true);
    const factor = grams / 100;
    await fetch("/api/nutrition/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `${selected.name} (${grams}g)`,
        calories: Math.round(selected.caloriesPer100g * factor),
        proteinG: Math.round(selected.proteinPer100g * factor),
        carbsG: Math.round(selected.carbsPer100g * factor),
        fatG: Math.round(selected.fatPer100g * factor),
        source: "openfoodfacts",
        sourceRef: selected.code,
      }),
    });
    setSaving(false);
    setSelected(null);
    setQuery("");
    router.refresh();
  }

  async function logCustom(food: CustomFood) {
    setSaving(true);
    await fetch("/api/nutrition/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: food.name,
        calories: food.calories,
        proteinG: food.proteinG,
        carbsG: food.carbsG,
        fatG: food.fatG,
        source: "custom",
      }),
    });
    setSaving(false);
    router.refresh();
  }

  async function logManual(event: React.FormEvent) {
    event.preventDefault();
    if (!manualValues.name.trim()) return;
    setSaving(true);
    await fetch("/api/nutrition/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...manualValues, source: "manual", saveAsCustom: true }),
    });
    setSaving(false);
    setManualValues({ name: "", calories: 0, proteinG: 0, carbsG: 0, fatG: 0 });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 text-sm">
        <button
          onClick={() => setManual(false)}
          className={!manual ? "text-navy-light" : "text-muted"}
        >
          Search food
        </button>
        <button
          onClick={() => setManual(true)}
          className={manual ? "text-navy-light" : "text-muted"}
        >
          Manual entry
        </button>
      </div>

      {!manual ? (
        <div className="flex flex-col gap-3">
          <input
            value={query}
            onChange={(event) => {
              const value = event.target.value;
              setQuery(value);
              setSelected(null);
              if (!value.trim()) setResults([]);
            }}
            placeholder="Search a food, e.g. chicken breast"
            className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm outline-none focus:border-navy-light"
          />

          {searching && <p className="text-xs text-muted">Searching…</p>}

          {!selected && results.length > 0 && (
            <div className="flex flex-col gap-1">
              {results.map((result) => (
                <button
                  key={result.code || result.name}
                  onClick={() => setSelected(result)}
                  className="rounded-lg border border-border px-3 py-2 text-left text-sm hover:border-navy-light"
                >
                  {result.name}{" "}
                  <span className="text-muted">— {Math.round(result.caloriesPer100g)} kcal/100g</span>
                </button>
              ))}
            </div>
          )}

          {selected && (
            <div className="flex items-center gap-3 text-sm">
              <span>{selected.name}</span>
              <input
                type="number"
                value={grams}
                onChange={(event) => setGrams(Number(event.target.value))}
                className="w-20 rounded-lg border border-border bg-surface-raised px-2 py-1 outline-none focus:border-navy-light"
              />
              <span className="text-muted">grams</span>
              <button
                onClick={logSelected}
                disabled={saving}
                className="rounded-lg bg-navy px-3 py-1 text-white transition hover:bg-navy-light disabled:opacity-50"
              >
                Add
              </button>
            </div>
          )}

          {customFoods.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-muted">Your saved foods</p>
              <div className="flex flex-wrap gap-2">
                {customFoods.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => logCustom(food)}
                    disabled={saving}
                    className="rounded-full border border-border px-3 py-1 text-xs hover:border-navy-light disabled:opacity-50"
                  >
                    {food.name} · {Math.round(food.calories)} kcal
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={logManual} className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs text-muted">
            Name
            <input
              value={manualValues.name}
              onChange={(event) => setManualValues({ ...manualValues, name: event.target.value })}
              className="w-40 rounded-lg border border-border bg-surface-raised px-2 py-1 text-sm text-foreground outline-none focus:border-navy-light"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            Calories
            <input
              type="number"
              value={manualValues.calories}
              onChange={(event) =>
                setManualValues({ ...manualValues, calories: Number(event.target.value) })
              }
              className="w-24 rounded-lg border border-border bg-surface-raised px-2 py-1 text-sm text-foreground outline-none focus:border-navy-light"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            Protein (g)
            <input
              type="number"
              value={manualValues.proteinG}
              onChange={(event) =>
                setManualValues({ ...manualValues, proteinG: Number(event.target.value) })
              }
              className="w-20 rounded-lg border border-border bg-surface-raised px-2 py-1 text-sm text-foreground outline-none focus:border-navy-light"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            Carbs (g)
            <input
              type="number"
              value={manualValues.carbsG}
              onChange={(event) =>
                setManualValues({ ...manualValues, carbsG: Number(event.target.value) })
              }
              className="w-20 rounded-lg border border-border bg-surface-raised px-2 py-1 text-sm text-foreground outline-none focus:border-navy-light"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            Fat (g)
            <input
              type="number"
              value={manualValues.fatG}
              onChange={(event) =>
                setManualValues({ ...manualValues, fatG: Number(event.target.value) })
              }
              className="w-20 rounded-lg border border-border bg-surface-raised px-2 py-1 text-sm text-foreground outline-none focus:border-navy-light"
            />
          </label>
          <button
            type="submit"
            disabled={saving || !manualValues.name.trim()}
            className="rounded-lg bg-navy px-3 py-2 text-sm font-medium text-white transition hover:bg-navy-light disabled:opacity-50"
          >
            Add & save for reuse
          </button>
        </form>
      )}
    </div>
  );
}
