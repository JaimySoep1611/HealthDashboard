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
    title: "Edit Goals is schedule-only, clearer \"done\" days, full names",
    description:
      "Three fixes to the training schedule: Edit Goals no longer shows logging controls on each exercise (just the name and a remove button) — it's for changing the plan, logging still only happens on the dashboard. A day now turns green with a checkmark once it's done, including rest days (previously only training days got any \"complete\" indicator, and it was a barely-visible dot). And exercise names that don't fit now wrap onto a second line instead of getting cut off on narrow screens.",
  },
  {
    date: "2026-08-17",
    title: "Color and icons for the training schedule",
    description:
      "The training schedule was looking a bit flat, so each exercise now gets an icon and color guessed from its name — push (blue), pull (teal), legs (amber), or core (pink) — and running exercises get their own distinct icon/color too. Rest days now show a small moon icon instead of just plain text.",
  },
  {
    date: "2026-08-17",
    title: "Meal reminders: breakfast, lunch, and dinner",
    description:
      "Three new reminders (once daily reminders are enabled): 10:00 if nothing's logged yet today, 13:00 if nothing's logged since 11:45, and 19:00 if nothing's logged since 18:00 — nudges for breakfast, lunch, and dinner respectively. All times are Amsterdam local time, correctly adjusted for CET/CEST.",
  },
  {
    date: "2026-08-17",
    title: "Simplified the Weight card's goal line",
    description:
      "The Weight card now just shows \"Goal 80kg\" instead of also appending the exact gap (e.g. \"· +2.0kg\") — the trend chart already shows progress toward the goal visually.",
  },
  {
    date: "2026-08-17",
    title: "Bigger Steps/Weight numbers, no spinner arrows",
    description:
      "Removed the up/down spinner arrows on the editable Steps and Weight numbers (and every other number field in the app) — tidier, and they weren't needed for typing a value directly. Also enlarged the icon and number on both cards so they fill the tile better now that the separate input row underneath is gone.",
  },
  {
    date: "2026-08-17",
    title: "Edit Steps/Weight by tapping the number itself",
    description:
      "The big number on the Steps and Weight cards is now directly editable — tap it, type the new value, and tap away or hit Enter to save. Removed the separate correction field and Save/Log button underneath, since they did the same thing.",
  },
  {
    date: "2026-08-17",
    title: "Fixed the favorite star: real toggle, bigger target, persists",
    description:
      "Three fixes to the star button on logged entries: it now reflects the actual shared favorites list (so it stays filled after a refresh, instead of always resetting), tapping a filled star unfavorites it (a real toggle, not add-only), and the tap target is bigger so it's easier to hit precisely.",
  },
  {
    date: "2026-08-17",
    title: "Trends bars show the day's number and gap to goal",
    description:
      "In Trends' Week view, Calories/Water/Steps bars now show the day's actual number above them, and a lighter shaded segment extends up to the goal line on days that fell short — so you can see both the number and how far it was from target without hovering. Only applies where a goal is set, and only in Week view (Month view stays as-is, same reason it already skips day labels there).",
  },
  {
    date: "2026-08-17",
    title: "Strava sync for runs",
    description:
      "Connect your Strava account from \"Edit Goals\" — new runs now log in automatically to that weekday's cardio exercise in the training schedule (a \"Run\" exercise is created automatically if nothing was scheduled that day, so an unplanned run still gets captured). Tap the orange \"S\" badge on a synced exercise to see a details popup with distance, duration, pace, and elevation gain. Each profile connects Strava separately — Jaimy's runs go to Jaimy's schedule, Lisa's to Lisa's.",
  },
  {
    date: "2026-08-17",
    title: "Star an already-logged meal to favorite it",
    description:
      "Every entry in \"Today\" now has a star button — tap it to add that meal to the shared favorites menu directly, without retyping it in manual entry first.",
  },
  {
    date: "2026-08-17",
    title: "Recent meals + a shared favorites menu",
    description:
      "\"Log it manually\" now shows your recently-logged meals and a favorites menu right above the form — tap one to log it instantly with its saved numbers. Add a \"★ Save as favorite\" checkbox while manually logging something to add it to the favorites menu, which both Jaimy and Lisa see and pick from (one shared list). Recent meals stay per-profile, since they reflect your own logging history.",
  },
  {
    date: "2026-08-17",
    title: "Fun background: moving otters & dogs",
    description:
      "New toggle in \"Edit Goals\" — turn it on for small otters and dogs drifting slowly across the background behind the whole app, just for fun. Off by default, and it's a per-profile setting.",
  },
  {
    date: "2026-08-17",
    title: "Color-matched macro advice",
    description:
      "Each macro advice line below the food rings is now colored the same as its ring (green for protein, yellow for carbs, pink for fat), so it's obvious at a glance which piece of advice is about which nutrient.",
  },
  {
    date: "2026-08-17",
    title: "Advice for every short macro, and a persistent \"goal met\" state",
    description:
      "Macro advice below the food rings now lists every nutrient you're still short on today (not just the single biggest gap), each with its own food ideas. Also, hitting your water or steps goal now does more than the one-off confetti burst — the card itself turns green with a checkmark and stays that way for the rest of the day, so you can see it's done at a glance without needing to catch the animation.",
  },
  {
    date: "2026-08-17",
    title: "What to eat next, based on today's macros",
    description:
      "Below the calorie/macro rings, a short line now names whichever macro you're furthest from your target on today, with a few food ideas to help close the gap (e.g. \"Still ~40g protein to go — try chicken, eggs, Greek yogurt, or tofu\"). Rule-based on today's numbers, not AI, so it's instant and unaffected by the Gemini quota.",
  },
  {
    date: "2026-08-17",
    title: "Manual food entry + fixed training charts with only one bar",
    description:
      "Added \"Or log it manually\" below the food input — a popup to enter a name, calories, and macros directly, no AI needed (handy for hitting the daily AI limit, or just faster for things you know by heart). Also fixed the Training trend charts always showing a single bar stretched across the full width when only one week/month was logged — they now always show 5 weeks or 6 months of bars, with unlogged ones shown empty rather than skipped.",
  },
  {
    date: "2026-08-17",
    title: "Clearer message when AI food recognition hits its daily limit",
    description:
      "\"Couldn't analyze\" was showing for any failure, including hitting Gemini's free-tier daily limit on food recognition (20 requests/day) — which looks nothing like an unclear description and won't be fixed by rephrasing. That case now says so directly, so it's clear it's a limit, not you.",
  },
  {
    date: "2026-08-17",
    title: "Fixed food entries deleting themselves right after saving",
    description:
      "Found the real cause of food not sticking: after saving, a safety check meant to catch \"you removed this before it finished saving\" was misfiring almost every time, so the app deleted the food entry it had just created, moments later. Removed that check — entries you add now stay added.",
  },
  {
    date: "2026-08-17",
    title: "Fixed silently-failed food saves",
    description:
      "Tapping \"Add\" on a recognized food item could fail to save without telling you — if the AI left one of the macro fields blank/uncertain, the save was rejected and the item just quietly disappeared. Missing macro fields now count as 0 instead of failing, and any save that still fails now shows an actual error message instead of failing silently.",
  },
  {
    date: "2026-08-17",
    title: "Confetti, starting weight, and daily reminders",
    description:
      "Hitting your water or steps goal for the day now pops a small confetti burst. Added a starting weight, settable in \"Edit Goals\" next to your goal weight, shown as a dotted reference line on the Weight trend alongside how far you've come. Also added optional daily reminders (\"Edit Goals\" → Daily reminders): once turned on, you'll get a phone notification in the early evening if you haven't hit your water or steps goal yet that day — nothing sent if you've already hit both, or if a goal isn't set. Works even with the app closed, including installed as a Home Screen webapp on iPhone.",
  },
  {
    date: "2026-08-17",
    title: "Real app icon on iPhone + training chart consistency",
    description:
      "Saving the dashboard to your iPhone home screen (Share → Add to Home Screen) now shows the actual otter logo instead of a generic icon, and opens full-screen without the Safari address bar. Also restyled the Training trend charts to match Calories/Water/Steps: same \"Last N average\" caption style, and bars aren't individually labeled in Month view anymore (just the date range underneath) — same as the other metrics.",
  },
  {
    date: "2026-08-17",
    title: "Daily streak bar + a daily steps goal",
    description:
      "Added a small streak bar above Food showing how many days in a row you've hit every goal you've set — water, steps, calories & macros, and training (rest days always count for training). Also added a daily steps goal, settable in \"Edit Goals\" alongside your weight goal, shown on the Steps card and as a target line in Trends.",
  },
  {
    date: "2026-08-17",
    title: "Week/month toggle for training trends",
    description:
      "The Training tab in Trends now has the same Week/Month toggle as Calories, Water, Steps, and Weight. \"Week\" shows one bar per week you logged that exercise; \"Month\" averages weeks into one bar per month, useful for spotting the longer-term trend.",
  },
  {
    date: "2026-08-17",
    title: "Fixed badge overlap + clear a logged exercise",
    description:
      "The \"Once/day\" badge on Steps and Weight no longer overlaps the number when it's wide. Tap a logged exercise in the training schedule and hit \"Clear\" to remove it if you logged it by mistake — the day correctly goes back to not-logged, and \"Training days logged this week\" updates to match.",
  },
  {
    date: "2026-08-17",
    title: "Monthly training trends, side by side",
    description:
      "Reworked the Training tab in Trends: instead of picking one exercise at a time, every power-training exercise now shows as its own small monthly chart (one bar per month), stacked together in a distinct color so you can compare their progress at a glance. Also extended the history window to roughly 6 months.",
  },
  {
    date: "2026-08-17",
    title: "Training weight trend in Trends",
    description:
      "Added a new \"Training\" tab in Trends showing how the kg you've logged for a power-training exercise has progressed over the last several months — pick which exercise with the pills above the chart. Each bar is a week you actually logged it, not a fixed daily/weekly grid, since exercise logs don't work that way.",
  },
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
