"use client";

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

export function EntryList({ entries, onRemove }: { entries: Entry[]; onRemove: (id: string) => void }) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted">Nothing logged yet today.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {entries.map((entry) => (
        <EntryRow key={entry.id} entry={entry} onRemove={() => onRemove(entry.id)} />
      ))}
    </div>
  );
}

function EntryRow({ entry, onRemove }: { entry: Entry; onRemove: () => void }) {
  const [starred, setStarred] = useState(false);
  const [starring, setStarring] = useState(false);

  function star() {
    setStarring(true);
    fetch("/api/nutrition/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: entry.name,
        calories: entry.calories,
        proteinG: entry.proteinG,
        carbsG: entry.carbsG,
        fatG: entry.fatG,
      }),
    })
      .then((response) => {
        if (response.ok) setStarred(true);
      })
      .finally(() => setStarring(false));
  }

  return (
    <div className="flex flex-col gap-1 border-b border-border/60 pb-2 text-sm last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <span className="min-w-0 truncate">{entry.name}</span>
      <div className="flex flex-none items-center gap-3 text-xs text-muted sm:text-sm">
        <span>{Math.round(entry.calories)} kcal</span>
        <span>
          P{Math.round(entry.proteinG)} C{Math.round(entry.carbsG)} F{Math.round(entry.fatG)}
        </span>
        <button
          onClick={star}
          disabled={starred || starring}
          aria-label={starred ? "Added to favorites" : "Add to favorites"}
          title={starred ? "Added to favorites" : "Add to favorites (shared)"}
          className={`transition disabled:cursor-default ${
            starred ? "text-yellow-400" : "hover:text-yellow-400"
          }`}
        >
          <StarIcon size={15} filled={starred} />
        </button>
        <button onClick={onRemove} className="hover:text-red-400">
          ×
        </button>
      </div>
    </div>
  );
}
