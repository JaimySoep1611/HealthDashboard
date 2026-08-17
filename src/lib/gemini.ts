import { GoogleGenAI, Type } from "@google/genai";

export const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const FOOD_ITEMS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Short name of the food or drink item" },
          calories: { type: Type.NUMBER, description: "Estimated total calories (kcal)" },
          proteinG: { type: Type.NUMBER, description: "Estimated protein in grams" },
          carbsG: { type: Type.NUMBER, description: "Estimated carbohydrates in grams" },
          fatG: { type: Type.NUMBER, description: "Estimated fat in grams" },
        },
        required: ["name", "calories", "proteinG", "carbsG", "fatG"],
      },
    },
  },
  required: ["items"],
};

export type FoodItemEstimate = {
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
};

export function parseFoodItems(responseText: string | undefined): FoodItemEstimate[] {
  if (!responseText) return [];
  try {
    const parsed = JSON.parse(responseText) as { items?: FoodItemEstimate[] };
    return parsed.items ?? [];
  } catch {
    return [];
  }
}

// Surfaces the Gemini free-tier daily quota limit as its own message —
// otherwise it looks identical to "couldn't understand this" to the user,
// when actually retrying (today) won't help at all.
export function describeGeminiError(error: unknown): { message: string; status: number } {
  const status = (error as { status?: number })?.status;
  if (status === 429) {
    return {
      message: "Hit today's AI food-recognition limit (Gemini's free daily quota) — try again tomorrow, or log it manually for now.",
      status: 429,
    };
  }
  return { message: "Could not analyze this — try again.", status: 422 };
}
