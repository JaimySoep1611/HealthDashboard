import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic();

export const FOOD_ITEMS_TOOL = {
  name: "log_food_items",
  description: "Record the identified food or drink item(s) with estimated nutrition.",
  strict: true,
  input_schema: {
    type: "object" as const,
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "Short name of the food or drink item" },
            calories: { type: "number", description: "Estimated total calories (kcal)" },
            proteinG: { type: "number", description: "Estimated protein in grams" },
            carbsG: { type: "number", description: "Estimated carbohydrates in grams" },
            fatG: { type: "number", description: "Estimated fat in grams" },
          },
          required: ["name", "calories", "proteinG", "carbsG", "fatG"],
          additionalProperties: false,
        },
      },
    },
    required: ["items"],
    additionalProperties: false,
  },
};

export type FoodItemEstimate = {
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
};

export function extractFoodItems(content: Anthropic.ContentBlock[]): FoodItemEstimate[] {
  const toolUse = content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );
  if (!toolUse) return [];
  const input = toolUse.input as { items?: FoodItemEstimate[] };
  return input.items ?? [];
}
