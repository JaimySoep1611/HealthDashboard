"use client";

import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";

type FoodEntryItem = {
  id: string;
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
};

type ContextValue = {
  entries: FoodEntryItem[];
  setEntries: Dispatch<SetStateAction<FoodEntryItem[]>>;
};

const FoodEntriesContext = createContext<ContextValue | null>(null);

// Shared so the header's "Meals logged today" stat and the Food section's
// rings/logger/entry-list all read the same live entries — without this,
// moving the stat out of FoodLogSection would make it lag behind (only
// updating on the next full refresh) instead of updating instantly.
export function FoodEntriesProvider({
  initialEntries,
  children,
}: {
  initialEntries: FoodEntryItem[];
  children: ReactNode;
}) {
  const [entries, setEntries] = useState(initialEntries);
  return <FoodEntriesContext.Provider value={{ entries, setEntries }}>{children}</FoodEntriesContext.Provider>;
}

export function useFoodEntries() {
  const ctx = useContext(FoodEntriesContext);
  if (!ctx) throw new Error("useFoodEntries must be used within a FoodEntriesProvider");
  return ctx;
}
