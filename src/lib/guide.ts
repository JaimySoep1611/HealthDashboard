export type GuideSection = {
  title: string;
  items: { name: string; description: string }[];
};

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    title: "Food",
    items: [
      {
        name: "Daily streak",
        description:
          "The small bar above Food counts consecutive days where you hit every goal you've set: water, steps, calories & macros, and training (a day with nothing scheduled always counts as a training day hit). Any goal you haven't set yet — say, no steps goal — is simply skipped rather than counted against you.",
      },
      {
        name: "Calorie & macro rings",
        description:
          "Fill up as you log food today, toward the daily targets you set in \"Edit Goals\". The thin line below shows your calories over the last 7 days against your target. Below the rings, a line of advice for each macro (protein, carbs, fat) you're still short on names a few foods to help close the gap — a simple rule based on today's numbers, not AI, so it's instant and always available. Each line is colored to match its ring (green for protein, yellow for carbs, pink for fat), so it's clear at a glance which advice is for which. Once every macro's covered, it just says so.",
      },
      {
        name: "Log food",
        description:
          "Type what you ate in plain words (e.g. \"two eggs and toast\") or tap the camera to photograph a meal — AI estimates calories and macros for you to add. Prefer not to use AI, or hit its daily limit? Tap \"Or log it manually\" below the input to enter a name, calories, and macros directly, no AI involved.",
      },
      {
        name: "Recent & Favorites (in manual entry)",
        description:
          "Opening \"Log it manually\" shows your recently-logged meals and any saved favorites right above the form — tap one to log it instantly with its saved numbers, no retyping. Check \"Save as favorite\" while adding something to add it to the favorites menu. Favorites are shared between Jaimy and Lisa (one household menu), while \"Recent\" only reflects your own recent logging.",
      },
      {
        name: "Star an entry in Today",
        description:
          "Tap the star next to anything logged in \"Today\" to favorite it — tap the filled star again to unfavorite. It reflects the real shared favorites menu (not just this screen), so it stays filled after a refresh and shows filled for either profile once either of you has favorited that meal.",
      },
    ],
  },
  {
    title: "Water",
    items: [
      {
        name: "Water",
        description:
          "Tap +100/+250/+500ml each time you drink water. The bar fills toward your daily goal. \"Undo\" removes your most recent log if you tap by mistake. The moment you cross your goal for the day, a confetti burst plays and the card turns green with a checkmark — a persistent \"done\" state, not just the one-off animation.",
      },
    ],
  },
  {
    title: "Training",
    items: [
      {
        name: "Training schedule",
        description:
          "A week strip, Monday through Sunday — scroll sideways to see every day. Days with nothing assigned show as \"Rest\", and the dot next to a day fills in green once everything for that day is logged; logs reset automatically every Monday. Tap an exercise here to log kg + sets + reps (power training) or km (running) — tap it again and hit \"Clear\" if you logged it by mistake, which un-counts it (and its day) as logged. To add, remove, or move exercises between days, use \"Edit Goals\" instead.",
      },
      {
        name: "Strava sync",
        description:
          "Connect Strava in \"Edit Goals\" and new runs log in automatically to that weekday's cardio exercise (a \"Run\" exercise is added automatically if you don't already have one scheduled that day). A small orange \"S\" badge appears on a synced exercise — tap it for a details popup with distance, duration, pace, and elevation gain. Editing the number yourself afterward clears the synced details, since they'd no longer match what you typed. Each profile connects their own Strava account separately.",
      },
    ],
  },
  {
    title: "Steps",
    items: [
      {
        name: "Steps",
        description:
          "Today's step count, synced automatically via the Apple Shortcuts automation, or entered manually if it needs correcting. The \"Once/day\" tag is a reminder that this is a single daily number, not something you add to repeatedly like water — but you can still overwrite it any time you want. Set a daily steps goal in \"Edit Goals\" to see it shown here and used in Trends — crossing it (via manual entry or the next automatic sync) plays a confetti burst and turns the card green with a checkmark, a persistent \"done\" state you'll still see on your next visit, not just the animation.",
      },
    ],
  },
  {
    title: "Weight",
    items: [
      {
        name: "Weight",
        description:
          "Log your weight once a day — the \"Once/day\" tag is just a reminder of that, you can still update it whenever. The trend line compares your recent weigh-ins to your goal weight, with how far you have left to go. Set a starting weight in \"Edit Goals\" to see a second, dotted reference line and how much you've moved from it.",
      },
    ],
  },
  {
    title: "Trends",
    items: [
      {
        name: "Trends",
        description:
          "Look back over the last week or month for Calories, Water, Steps, or Weight — pick a metric and a range to see the chart and the average for that period. In Week view, if you have a goal set for that metric, each bar also shows the day's number and a lighter shaded gap up to the goal line on days you fell short — so it's clear both what you logged and how far it was from target, at a glance. (Month view skips this, same reason it skips the day labels — too many bars for it to stay readable.)",
      },
      {
        name: "Training (in Trends)",
        description:
          "Every power-training exercise gets its own small chart, each in its own color, stacked so you can compare them side by side. Switch between \"Week\" (5 weeks shown, one bar per week) and \"Month\" (6 months shown, averaged if you logged it more than once — same as Calories/Water/Steps, bars aren't individually labeled in Month view, just the date range underneath). Weeks/months you didn't log show as an empty bar rather than being skipped, so a single logged week doesn't stretch across the whole chart. Exercises aren't put on the same chart since kg isn't comparable across different lifts.",
      },
    ],
  },
  {
    title: "General",
    items: [
      {
        name: "Add to Home Screen",
        description:
          "On iPhone, Share → Add to Home Screen adds the otter icon to your home screen and opens the dashboard full-screen, without the Safari address bar.",
      },
      {
        name: "Sun/moon icon",
        description: "Switch between dark and light mode. Your choice is remembered on this device.",
      },
      {
        name: "Edit Goals",
        description:
          "Revisit anytime to add, remove, or change your training goals, nutrition targets, water goal, weight goal, starting weight, or steps goal — and to turn daily reminders on or off.",
      },
      {
        name: "Daily reminders",
        description:
          "Turn on in \"Edit Goals\" to get a phone notification in the early evening if you haven't hit your water or steps goal yet that day — skipped entirely if you've already hit both, or if you haven't set a goal for one of them. Works even with the app closed once enabled, including as a Home Screen webapp on iPhone (needs iOS 16.4+).",
      },
      {
        name: "Fun background",
        description:
          "Turn on in \"Edit Goals\" for small otters and dogs drifting across the background behind everything else, purely for fun — it's per-profile, so it doesn't affect the other person's view.",
      },
      {
        name: "Switch User",
        description: "Change to the other profile without logging out.",
      },
    ],
  },
];
