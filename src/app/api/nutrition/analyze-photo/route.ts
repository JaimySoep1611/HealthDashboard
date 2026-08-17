import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/session";
import { genAI, FOOD_ITEMS_SCHEMA, parseFoodItems, describeGeminiError } from "@/lib/gemini";

const ALLOWED_MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

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

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: "Identify the food or drink item(s) in this photo and estimate calories and macros (in grams) for the visible portion.",
            },
            { inlineData: { mimeType: mediaType, data: imageBase64 } },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: FOOD_ITEMS_SCHEMA,
      },
    });

    const items = parseFoodItems(response.text);
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Gemini analyze-photo error:", error);
    const { message, status } = describeGeminiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
