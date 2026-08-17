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
          "Fill up as you log food today, toward the daily targets you set in \"Edit setup\". The thin line below shows your calories over the last 7 days against your target.",
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
          "Set up once: which day, which exercises, and whether to track kg + sets + reps (power training) or km (running). It repeats every week — you can add as many exercises to a day as you like (e.g. chest, legs, and back all on Monday) and they'll keep showing up every week. Each week you just fill in what you actually did, which resets automatically every Monday.",
      },
    ],
  },
  {
    title: "Steps",
    items: [
      {
        name: "Steps",
        description:
          "Today's step count, synced automatically via the Apple Shortcuts automation, or entered manually if it needs correcting.",
      },
    ],
  },
  {
    title: "Weight",
    items: [
      {
        name: "Weight",
        description:
          "Log your weight once a day. The trend line compares your recent weigh-ins to your goal weight, with how far you have left to go.",
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
    ],
  },
  {
    title: "General",
    items: [
      {
        name: "Edit setup",
        description:
          "Revisit anytime to add, remove, or change your training goals, nutrition targets, water goal, or weight goal.",
      },
      {
        name: "Switch",
        description: "Change to the other profile without logging out.",
      },
    ],
  },
];
