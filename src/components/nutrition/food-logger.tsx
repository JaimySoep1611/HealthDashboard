"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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

type AiFoodItem = {
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
};

type Mode = "search" | "manual" | "describe" | "photo";

const TABS: { mode: Mode; label: string }[] = [
  { mode: "search", label: "Search food" },
  { mode: "describe", label: "Describe" },
  { mode: "photo", label: "Photo" },
  { mode: "manual", label: "Manual entry" },
];

export function FoodLogger() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("search");

  // Search tab state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [grams, setGrams] = useState(100);
  const [customFoods, setCustomFoods] = useState<CustomFood[]>([]);
  const [saving, setSaving] = useState(false);

  // Manual tab state
  const [manualValues, setManualValues] = useState({
    name: "",
    calories: 0,
    proteinG: 0,
    carbsG: 0,
    fatG: 0,
  });

  // Describe tab state
  const [description, setDescription] = useState("");
  const [describeLoading, setDescribeLoading] = useState(false);
  const [describeError, setDescribeError] = useState<string | null>(null);
  const [describedItems, setDescribedItems] = useState<AiFoodItem[]>([]);

  // Photo tab state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoItems, setPhotoItems] = useState<AiFoodItem[]>([]);

  useEffect(() => {
    fetch("/api/nutrition/custom-foods")
      .then((res) => res.json())
      .then((data) => setCustomFoods(data.customFoods ?? []));
  }, []);

  useEffect(() => {
    if (!query.trim() || mode !== "search") {
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
  }, [query, mode]);

  async function logEntry(item: AiFoodItem, source: string) {
    setSaving(true);
    await fetch("/api/nutrition/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, source }),
    });
    setSaving(false);
    router.refresh();
  }

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

  async function analyzeDescription(event: React.FormEvent) {
    event.preventDefault();
    if (!description.trim()) return;
    setDescribeLoading(true);
    setDescribeError(null);
    setDescribedItems([]);
    const response = await fetch("/api/nutrition/parse-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: description }),
    });
    setDescribeLoading(false);
    if (!response.ok) {
      setDescribeError("Couldn't analyze that description — try rephrasing.");
      return;
    }
    const data = await response.json();
    setDescribedItems(data.items ?? []);
  }

  function handlePhotoSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoError(null);
    setPhotoItems([]);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function analyzePhoto() {
    if (!photoPreview) return;
    const [header, base64] = photoPreview.split(",");
    const mediaType = header.match(/data:(.*);base64/)?.[1] ?? "image/jpeg";
    setPhotoLoading(true);
    setPhotoError(null);
    const response = await fetch("/api/nutrition/analyze-photo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: base64, mediaType }),
    });
    setPhotoLoading(false);
    if (!response.ok) {
      setPhotoError("Couldn't recognize this photo — try a clearer shot.");
      return;
    }
    const data = await response.json();
    setPhotoItems(data.items ?? []);
  }

  function resetPhoto() {
    setPhotoPreview(null);
    setPhotoItems([]);
    setPhotoError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4 text-sm">
        {TABS.map((tab) => (
          <button
            key={tab.mode}
            onClick={() => setMode(tab.mode)}
            className={mode === tab.mode ? "text-navy-light" : "text-muted"}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mode === "search" && (
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
      )}

      {mode === "describe" && (
        <div className="flex flex-col gap-3">
          <form onSubmit={analyzeDescription} className="flex flex-col gap-2">
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="e.g. two fried eggs, a slice of buttered toast and a black coffee"
              rows={2}
              className="resize-none rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm outline-none focus:border-navy-light"
            />
            <button
              type="submit"
              disabled={describeLoading || !description.trim()}
              className="self-start rounded-lg bg-navy px-3 py-2 text-sm font-medium text-white transition hover:bg-navy-light disabled:opacity-50"
            >
              {describeLoading ? "Analyzing…" : "Analyze"}
            </button>
          </form>

          {describeError && <p className="text-sm text-red-400">{describeError}</p>}

          {describedItems.length > 0 && (
            <AiItemList
              items={describedItems}
              saving={saving}
              onAdd={(item) => logEntry(item, "ai-text")}
            />
          )}
        </div>
      )}

      {mode === "photo" && (
        <div className="flex flex-col gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoSelected}
            className="hidden"
          />

          {!photoPreview && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex w-fit flex-col items-center gap-2 rounded-lg border border-border px-6 py-5 text-muted transition hover:border-navy-light hover:text-foreground"
              aria-label="Take a photo"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 8h2.5l1.2-2h8.6l1.2 2H20a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
                <circle cx="12" cy="13" r="3.5" />
              </svg>
              <span className="text-xs">Take a photo</span>
            </button>
          )}

          {photoPreview && (
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoPreview}
                alt="Selected food"
                className="h-24 w-24 rounded-lg border border-border object-cover"
              />
              <div className="flex flex-col gap-2">
                <button
                  onClick={analyzePhoto}
                  disabled={photoLoading}
                  className="rounded-lg bg-navy px-3 py-2 text-sm font-medium text-white transition hover:bg-navy-light disabled:opacity-50"
                >
                  {photoLoading ? "Analyzing…" : "Analyze photo"}
                </button>
                <button onClick={resetPhoto} className="text-xs text-muted hover:text-foreground">
                  Clear
                </button>
              </div>
            </div>
          )}

          {photoError && <p className="text-sm text-red-400">{photoError}</p>}

          {photoItems.length > 0 && (
            <AiItemList
              items={photoItems}
              saving={saving}
              onAdd={(item) => logEntry(item, "ai-photo")}
            />
          )}
        </div>
      )}

      {mode === "manual" && (
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

function AiItemList({
  items,
  saving,
  onAdd,
}: {
  items: AiFoodItem[];
  saving: boolean;
  onAdd: (item: AiFoodItem) => void;
}) {
  const [added, setAdded] = useState<Set<number>>(new Set());

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted">Recognized — tap to add</p>
      {items.map((item, index) => (
        <div
          key={index}
          className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
        >
          <div>
            <span>{item.name}</span>{" "}
            <span className="text-muted">
              — {Math.round(item.calories)} kcal · P{Math.round(item.proteinG)} C
              {Math.round(item.carbsG)} F{Math.round(item.fatG)}
            </span>
          </div>
          <button
            onClick={() => {
              onAdd(item);
              setAdded((prev) => new Set(prev).add(index));
            }}
            disabled={saving || added.has(index)}
            className="rounded-lg border border-border px-2 py-1 text-xs hover:border-navy-light disabled:opacity-50"
          >
            {added.has(index) ? "Added" : "Add"}
          </button>
        </div>
      ))}
    </div>
  );
}
