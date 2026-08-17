"use client";

import { useRouter } from "next/navigation";

type Entry = {
  id: string;
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
};

export function EntryList({ entries }: { entries: Entry[] }) {
  const router = useRouter();

  async function removeEntry(id: string) {
    await fetch(`/api/nutrition/entries/${id}`, { method: "DELETE" });
    router.refresh();
  }

  if (entries.length === 0) {
    return <p className="text-sm text-muted">Nothing logged yet today.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {entries.map((entry) => (
        <div key={entry.id} className="flex items-center justify-between text-sm">
          <span>{entry.name}</span>
          <div className="flex items-center gap-3 text-muted">
            <span>{Math.round(entry.calories)} kcal</span>
            <span>
              P{Math.round(entry.proteinG)} C{Math.round(entry.carbsG)} F{Math.round(entry.fatG)}
            </span>
            <button onClick={() => removeEntry(entry.id)} className="hover:text-red-400">
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
