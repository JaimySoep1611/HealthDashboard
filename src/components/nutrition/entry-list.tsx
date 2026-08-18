"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { StarIcon } from "@/components/icons";

type Entry = {
  id: string;
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
};

type FavoriteMeal = { id: string; name: string };

export function EntryList({
  entries,
  onRemove,
  favoriteMeals,
}: {
  entries: Entry[];
  onRemove: (id: string) => void;
  favoriteMeals: FavoriteMeal[];
}) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted">Nothing logged yet today.</p>;
  }

  const favoriteIdByName = new Map(favoriteMeals.map((favorite) => [favorite.name.toLowerCase(), favorite.id]));

  return (
    <div className="flex flex-col gap-2">
      {entries.map((entry) => (
        <EntryRow
          key={entry.id}
          entry={entry}
          favoriteId={favoriteIdByName.get(entry.name.toLowerCase()) ?? null}
          onRemove={() => onRemove(entry.id)}
        />
      ))}
    </div>
  );
}

function EntryRow({
  entry,
  favoriteId,
  onRemove,
}: {
  entry: Entry;
  favoriteId: string | null;
  onRemove: () => void;
}) {
  const router = useRouter();
  const [toggling, setToggling] = useState(false);

  // favoriteId comes from the server-fetched favorites list (matched by
  // name), so the starred state always reflects what's actually persisted —
  // it doesn't reset on refresh, and reflects favorites added anywhere else
  // (manual entry, the other profile) too.
  const starred = favoriteId !== null;

  function toggleFavorite() {
    setToggling(true);
    const request = starred
      ? fetch(`/api/nutrition/favorites/${favoriteId}`, { method: "DELETE" })
      : fetch("/api/nutrition/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: entry.name,
            calories: entry.calories,
            proteinG: entry.proteinG,
            carbsG: entry.carbsG,
            fatG: entry.fatG,
          }),
        });

    request.then(() => router.refresh()).finally(() => setToggling(false));
  }

  return (
    <div className="flex flex-col gap-1 border-b border-border/60 pb-2 text-sm last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <span className="min-w-0 truncate">{entry.name}</span>
      <div className="flex flex-none items-center gap-2 text-xs text-muted sm:text-sm">
        <span>{Math.round(entry.calories)} kcal</span>
        <span>
          P{Math.round(entry.proteinG)} C{Math.round(entry.carbsG)} F{Math.round(entry.fatG)}
        </span>
        <button
          onClick={toggleFavorite}
          disabled={toggling}
          aria-label={starred ? "Remove from favorites" : "Add to favorites"}
          title={starred ? "Remove from favorites (shared)" : "Add to favorites (shared)"}
          className={`-m-1.5 flex h-8 w-8 flex-none items-center justify-center rounded-full transition disabled:cursor-default disabled:opacity-50 ${
            starred ? "text-yellow-400" : "hover:bg-surface-raised hover:text-yellow-400"
          }`}
        >
          <StarIcon size={17} filled={starred} />
        </button>
        <button onClick={onRemove} className="-m-1.5 flex h-8 w-8 flex-none items-center justify-center rounded-full hover:bg-surface-raised hover:text-red-400">
          ×
        </button>
      </div>
    </div>
  );
}
