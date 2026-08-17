import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/session";
import { genAI, FOOD_ITEMS_SCHEMA, parseFoodItems, describeGeminiError } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { text } = await request.json();
  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Identify the distinct food/drink items described here and estimate calories and macros (in grams) for the described portion size. If no portion size is given, assume a typical single serving. Description: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: FOOD_ITEMS_SCHEMA,
      },
    });

    const items = parseFoodItems(response.text);
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Gemini parse-text error:", error);
    const { message, status } = describeGeminiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
