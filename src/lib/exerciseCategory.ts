// Rule-based guess at muscle-group category from the exercise's name — no
// extra field to fill in when adding an exercise, at the cost of occasional
// misclassification for unusually-named exercises (e.g. "Hamstring Curl"
// would read as "pull" rather than "legs", since it only contains "curl").
export type MuscleCategory = "push" | "pull" | "legs" | "core";

const CATEGORY_KEYWORDS: { category: MuscleCategory; keywords: string[] }[] = [
  // Checked before push/pull so e.g. "Leg Curl"/"Leg Extension" don't get
  // caught by the more generic "curl"/"extension" keywords below.
  { category: "legs", keywords: ["squat", "lunge", "leg press", "leg curl", "leg extension", "calf", "deadlift", "hip thrust"] },
  { category: "core", keywords: ["crunch", "plank", "sit up", "situp", "ab wheel", "abs", "core"] },
  { category: "pull", keywords: ["pull up", "pullup", "pulldown", "row", "curl", "shrug", "face pull"] },
  { category: "push", keywords: ["press", "push", "dip", "fly", "flye", "extension"] },
];

export function categorizeExercise(name: string): MuscleCategory {
  const lower = name.toLowerCase();
  for (const { category, keywords } of CATEGORY_KEYWORDS) {
    if (keywords.some((keyword) => lower.includes(keyword))) return category;
  }
  return "push";
}

export const CATEGORY_COLORS: Record<MuscleCategory, string> = {
  push: "#60a5fa",
  pull: "#2dd4bf",
  legs: "#fbbf24",
  core: "#f472b6",
};

export const CARDIO_COLOR = "#38bdf8";
