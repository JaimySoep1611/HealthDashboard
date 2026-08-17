export type ChangelogEntry = {
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
};

// Newest first. Add one entry here for every user-facing change —
// this list is the single source of truth for the "What's new" tab.
export const CHANGELOG: ChangelogEntry[] = [
  {
    date: "2026-08-17",
    title: "Removed Tassies/challenge, cleaner training schedule, fixes",
    description:
      "Removed the Tassies achievement and the 75-day challenge (a different approach is planned later). Fixed the \"Once/day\" tag pushing weight/steps content outside the tile. \"Exercises logged\" is now \"Training days logged\" and counts full training days, not individual exercises. Exercises in the training schedule now always start collapsed, so a day with several exercises stays compact instead of stretching the whole row.",
  },
  {
    date: "2026-08-17",
    title: "Personal 75-day challenge",
    description:
      "Start a long-running challenge (75 days by default) from the dashboard — hit your water and calorie targets each day to build a streak. It's a \"soft\" version: missing a day breaks your streak but the challenge keeps counting rather than restarting from day 1. End it anytime from the card.",
  },
  {
    date: "2026-08-17",
    title: "Added the Tassies achievement",
    description:
      "A real first achievement: hit your water and calorie targets and log every scheduled exercise, every day of the week, to earn \"Tassies\". Shown on the Achievements card with live progress, and resets automatically each Monday. Also added a small \"Once/day\" tag to Steps and Weight, since — unlike Water — those are a single daily number you can still edit any time, not something you add to repeatedly.",
  },
  {
    date: "2026-08-17",
    title: "Reset all data for a fresh start",
    description:
      "Cleared all logged entries and goals for both profiles at your request — food, water, weight, steps, training schedule and targets. Both profiles will go through first-time setup again on next login.",
  },
  {
    date: "2026-08-17",
    title: "Fixed spacing issues in Training and Trends",
    description:
      "The training week strip now stretches to fill the full width on tablet/desktop instead of leaving empty space on the right (still scrolls on mobile, where 7 columns wouldn't fit). Fixed the Trends charts' axis labels overlapping when the target sat close to a milestone number, and made the charts taller so they look better now that they're full width.",
  },
  {
    date: "2026-08-17",
    title: "Schedule editing moved to Edit Goals",
    description:
      "Adding or removing training exercises now only happens from \"Edit Goals\" — the dashboard's training schedule is for logging what you did, not changing the plan. Also moved \"Meals logged today\" and \"Exercises logged this week\" up into the header, next to the other quick-glance stats, instead of being buried inside the Food and Training sections.",
  },
  {
    date: "2026-08-17",
    title: "Full-width layout for Training and Achievements",
    description:
      "Weight moved up next to Water and Steps in the header row (banner narrowed to make room). Achievements now sits right below that header row, and the Training schedule and Food section are both full-width instead of squeezed into a half-width column — the training week strip finally has room to breathe.",
  },
  {
    date: "2026-08-17",
    title: "Weekly training strip + layout tweaks",
    description:
      "Training schedule redesigned as a scrollable Monday-to-Sunday strip, with rest days shown explicitly and a status dot per day. Dropped the confusing \"— this week\" from its title (the schedule itself is permanent; only the logged numbers reset weekly). Also fixed the Water card to line up exactly with the greeting banner and Steps card in height.",
  },
  {
    date: "2026-08-17",
    title: "Fixed Water card button wrap",
    description:
      "In its narrower spot next to the greeting banner, the water quick-add buttons could wrap to a second line and leave \"Undo\" stranded far to the right. It now sits directly after the buttons regardless of wrapping.",
  },
  {
    date: "2026-08-17",
    title: "Trimmed the oversized greeting banner",
    description:
      "The greeting banner was stretching tall to match Water/Steps stacked next to it, leaving empty space inside it. Water and Steps now sit side by side instead of stacked, so the banner stays its natural size.",
  },
  {
    date: "2026-08-17",
    title: "Milestone gridlines on Trends charts",
    description:
      "Trend charts now show evenly-spaced, round-number milestones on the side (e.g. 500ml/1000ml/1500ml/2000ml toward a 2L water goal) with faint gridlines, instead of just the top/target/bottom value.",
  },
  {
    date: "2026-08-17",
    title: "Light mode",
    description:
      "Added a beige/sand light theme alongside the original dark theme, with a sun/moon button in the header to switch — your choice is remembered on this device.",
  },
  {
    date: "2026-08-17",
    title: "Layout polish + chart value labels",
    description:
      "Fixed a gap of empty space below the greeting banner on desktop when Water/Steps were taller than it. Trend charts (Calories, Water, Steps, Weight) now show the actual amounts on the side instead of only on hover. Renamed \"Edit setup\" to \"Edit Goals\" and \"Switch\" to \"Switch User\".",
  },
  {
    date: "2026-08-17",
    title: "Fixed timezone bugs + target-anchored trend charts",
    description:
      "The server runs in UTC, which was causing the wrong greeting (e.g. \"Good morning\" in the afternoon) and could misfile very-early-morning entries under the wrong day — both now explicitly use Netherlands time. Also reworked the Calories/Water Trends charts to scale against your target instead of just each other, with a dashed line showing the target, so it's clear whether you hit it, undershot, or overshot.",
  },
  {
    date: "2026-08-17",
    title: "Fixed photo food recognition",
    description:
      "Full-size iPhone camera photos were too large to upload and silently failing. Photos are now resized and compressed on your phone before uploading, and a clear error message shows up if something still goes wrong instead of nothing happening.",
  },
  {
    date: "2026-08-17",
    title: "Water & Steps moved to the top, reps added",
    description:
      "Water and Steps are now compact widgets right next to the greeting banner at the top of the page, since they're logged most often. Power training now tracks reps alongside kg and sets.",
  },
  {
    date: "2026-08-17",
    title: "Clearer sections + Trends",
    description:
      "Food, Water, Training, Steps, and Weight are now separate, clearly labeled sections instead of being grouped together, so it's obvious where to go to log each one. Added a Trends section at the bottom to look back at Calories, Water, Steps, or Weight over the last week or month.",
  },
  {
    date: "2026-08-17",
    title: "Faster logging",
    description:
      "Water, weight, food, and exercise logging now update the screen instantly instead of waiting on a round trip to the server. Also fixed a backend issue that was silently reopening a fresh database connection on every request.",
  },
  {
    date: "2026-08-17",
    title: "Recurring weekly training schedule",
    description:
      "Training is now a repeating schedule instead of a plain checklist: set the day, exercise name, and whether to track kg + sets (power training) or km (running) once — then each week just fill in what you did.",
  },
  {
    date: "2026-08-17",
    title: "Renamed to Soephart & Ligtenberg",
    description:
      "New name and a custom otter logomark in the header, login screen, and browser tab icon.",
  },
  {
    date: "2026-08-17",
    title: "Layout pass & mobile polish",
    description:
      "Reorganized Food and Exercise into side-by-side columns on desktop, tidied up which stats live where, and fixed a few spots (food logger, goal list, entry list, target editor) that didn't line up cleanly on an iPhone screen.",
  },
  {
    date: "2026-08-17",
    title: "Info guide & changelog",
    description: "Added the info button you're looking at right now — a guide to every tile, plus this changelog.",
  },
  {
    date: "2026-08-17",
    title: "Visual redesign + water & weight tracking",
    description:
      "Gradient hero banner, icon stat cards, gradient progress rings, and trend charts. Added water intake (quick-add toward a daily goal) and weight tracking (with a goal weight and trend).",
  },
  {
    date: "2026-08-17",
    title: "First-time setup wizard & profile colors",
    description:
      "New profiles now pick their training goals and nutrition targets before reaching the dashboard, editable anytime via \"Edit setup\". Jaimy is navy, Lisa is dark green.",
  },
  {
    date: "2026-08-17",
    title: "Deployed to Vercel",
    description: "Moved from local-only to a live site with a real Postgres database.",
  },
  {
    date: "2026-08-17",
    title: "Switched AI provider to Gemini",
    description: "Food recognition (text description and photo) now runs on Google Gemini instead of Claude.",
  },
  {
    date: "2026-08-17",
    title: "Weekly goal checklist for training",
    description:
      "Replaced the weekday-by-weekday training schedule and set/rep logging with a simple list of goals (e.g. \"Push day\") you check off each week — resets every Monday.",
  },
  {
    date: "2026-08-17",
    title: "Simplified food logging",
    description: "Down to one text field plus a camera icon — describe a meal or snap a photo, no more tabs to click through.",
  },
  {
    date: "2026-08-17",
    title: "One dashboard page",
    description: "Combined Training, Nutrition, and Steps into a single page instead of separate ones — Food at the top, Exercise below.",
  },
  {
    date: "2026-08-17",
    title: "AI food logging",
    description: "Added describing a meal in your own words or taking a photo of food to auto-fill calories and macros.",
  },
  {
    date: "2026-08-17",
    title: "Launch",
    description:
      "First version: shared login, profile picker, gym training schedule, nutrition tracking, and step tracking.",
  },
];
