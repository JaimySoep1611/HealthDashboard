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
        name: "Water",
        description:
          "Tap +100/+250/+500ml each time you drink water. The bar fills toward your daily goal. \"Undo\" removes your most recent log if you tap by mistake.",
      },
      {
        name: "Log food",
        description:
          "Type what you ate in plain words (e.g. \"two eggs and toast\") or tap the camera to photograph a meal — AI estimates calories and macros for you to add.",
      },
    ],
  },
  {
    title: "Exercise",
    items: [
      {
        name: "Steps",
        description:
          "Today's step count, synced automatically via the Apple Shortcuts automation, or entered manually below the 14-day chart if needed.",
      },
      {
        name: "Weight",
        description:
          "Log your weight once a day. The trend line compares your recent weigh-ins to your goal weight, with how far you have left to go.",
      },
      {
        name: "Training goals",
        description:
          "Your list of weekly training goals (e.g. \"Push day\"). Check one off once you've done it — the list resets automatically every Monday.",
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
