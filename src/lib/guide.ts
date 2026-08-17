export type GuideSection = {
  title: string;
  items: { name: string; description: string }[];
};

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    title: "Food",
    items: [
      {
        name: "Calorie & macro rings",
        description:
          "Fill up as you log food today, toward the daily targets you set in \"Edit Goals\". The thin line below shows your calories over the last 7 days against your target.",
      },
      {
        name: "Log food",
        description:
          "Type what you ate in plain words (e.g. \"two eggs and toast\") or tap the camera to photograph a meal — AI estimates calories and macros for you to add.",
      },
    ],
  },
  {
    title: "Water",
    items: [
      {
        name: "Water",
        description:
          "Tap +100/+250/+500ml each time you drink water. The bar fills toward your daily goal. \"Undo\" removes your most recent log if you tap by mistake.",
      },
    ],
  },
  {
    title: "Training",
    items: [
      {
        name: "Training schedule",
        description:
          "A week strip, Monday through Sunday — scroll sideways to see every day. Days with nothing assigned show as \"Rest\", and the dot next to a day fills in green once everything for that day is logged; logs reset automatically every Monday. Tap an exercise here to log kg + sets + reps (power training) or km (running) — to add, remove, or move exercises between days, use \"Edit Goals\" instead.",
      },
    ],
  },
  {
    title: "Steps",
    items: [
      {
        name: "Steps",
        description:
          "Today's step count, synced automatically via the Apple Shortcuts automation, or entered manually if it needs correcting. The \"Once/day\" tag is a reminder that this is a single daily number, not something you add to repeatedly like water — but you can still overwrite it any time you want.",
      },
    ],
  },
  {
    title: "Weight",
    items: [
      {
        name: "Weight",
        description:
          "Log your weight once a day — the \"Once/day\" tag is just a reminder of that, you can still update it whenever. The trend line compares your recent weigh-ins to your goal weight, with how far you have left to go.",
      },
    ],
  },
  {
    title: "Trends",
    items: [
      {
        name: "Trends",
        description:
          "Look back over the last week or month for Calories, Water, Steps, or Weight — pick a metric and a range to see the chart and the average for that period.",
      },
      {
        name: "Training (in Trends)",
        description:
          "Every power-training exercise gets its own small chart, each in its own color, stacked so you can compare them side by side — one bar per month you logged it (averaged if you logged it more than once that month). Exercises aren't put on the same chart since kg isn't comparable across different lifts.",
      },
    ],
  },
  {
    title: "General",
    items: [
      {
        name: "Sun/moon icon",
        description: "Switch between dark and light mode. Your choice is remembered on this device.",
      },
      {
        name: "Edit Goals",
        description:
          "Revisit anytime to add, remove, or change your training goals, nutrition targets, water goal, or weight goal.",
      },
      {
        name: "Switch User",
        description: "Change to the other profile without logging out.",
      },
    ],
  },
];
