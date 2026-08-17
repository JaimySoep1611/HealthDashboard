// Shared "did this day hit target" rules, used by both the weekly Tassies
// achievement and the long-running challenge — one definition, not two.

export function isWaterGoalMet(waterMl: number, waterTargetMl: number): boolean {
  return waterTargetMl > 0 && waterMl >= waterTargetMl;
}

// Calories aren't a minimum-only threshold like water — over- or undershooting
// by too much shouldn't count as "on target", so we allow a ±15% band.
export function isCalorieGoalMet(calories: number, caloriesTarget: number): boolean {
  return caloriesTarget > 0 && calories >= caloriesTarget * 0.85 && calories <= caloriesTarget * 1.15;
}
