import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/session";
import { anthropic, FOOD_ITEMS_TOOL, extractFoodItems } from "@/lib/anthropic";

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { text } = await request.json();
  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const response = await anthropic.messages.create({
    model: "claude-opus-5",
    max_tokens: 1024,
    output_config: { effort: "low" },
    tools: [FOOD_ITEMS_TOOL],
    tool_choice: { type: "tool", name: "log_food_items" },
    messages: [
      {
        role: "user",
        content: `Identify the distinct food/drink items described here and estimate calories and macros (in grams) for the described portion size. If no portion size is given, assume a typical single serving. Description: "${text}"`,
      },
    ],
  });

  if (response.stop_reason === "refusal") {
    return NextResponse.json({ error: "Could not analyze this description" }, { status: 422 });
  }

  const items = extractFoodItems(response.content);
  return NextResponse.json({ items });
}
