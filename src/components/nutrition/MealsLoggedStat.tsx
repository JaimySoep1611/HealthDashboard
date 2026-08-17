"use client";

import { StatCard } from "@/components/StatCard";
import { FlameIcon } from "@/components/icons";
import { useFoodEntries } from "@/components/nutrition/FoodEntriesContext";

export function MealsLoggedStat() {
  const { entries } = useFoodEntries();
  return (
    <StatCard icon={<FlameIcon size={22} />} color="#14b8a6" value={entries.length} label="Meals logged today" />
  );
}
