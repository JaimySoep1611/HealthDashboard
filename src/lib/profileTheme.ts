export type ProfileTheme = { accent: string; accentLight: string };

const THEMES: Record<string, ProfileTheme> = {
  Lisa: { accent: "#0d4429", accentLight: "#22c55e" },
};

const DEFAULT_THEME: ProfileTheme = { accent: "#00008b", accentLight: "#2626c9" };

export function getProfileTheme(name: string): ProfileTheme {
  return THEMES[name] ?? DEFAULT_THEME;
}
