import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/session";
import { anthropic, FOOD_ITEMS_TOOL, extractFoodItems } from "@/lib/anthropic";

const ALLOWED_MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
type AllowedMediaType = (typeof ALLOWED_MEDIA_TYPES)[number];

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { imageBase64, mediaType } = await request.json();
  if (
    typeof imageBase64 !== "string" ||
    !imageBase64 ||
    !ALLOWED_MEDIA_TYPES.includes(mediaType)
  ) {
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
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType as AllowedMediaType,
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: "Identify the food or drink item(s) in this photo and estimate calories and macros (in grams) for the visible portion.",
          },
        ],
      },
    ],
  });

  if (response.stop_reason === "refusal") {
    return NextResponse.json({ error: "Could not analyze this photo" }, { status: 422 });
  }

  const items = extractFoodItems(response.content);
  return NextResponse.json({ items });
}
