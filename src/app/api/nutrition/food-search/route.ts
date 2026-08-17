import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/session";

type OffProduct = {
  code?: string;
  product_name?: string;
  nutriments?: Record<string, number>;
};

export async function GET(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query) return NextResponse.json({ results: [] });

  const url = new URL("https://world.openfoodfacts.org/cgi/search.pl");
  url.searchParams.set("search_terms", query);
  url.searchParams.set("search_simple", "1");
  url.searchParams.set("json", "1");
  url.searchParams.set("page_size", "10");
  url.searchParams.set(
    "fields",
    "code,product_name,nutriments"
  );

  const response = await fetch(url, {
    headers: { "User-Agent": "HealthDashboard - personal use" },
  });

  if (!response.ok) {
    return NextResponse.json({ results: [] }, { status: 502 });
  }

  const data = (await response.json()) as { products?: OffProduct[] };

  const results = (data.products ?? [])
    .filter((product) => product.product_name)
    .map((product) => ({
      code: product.code ?? "",
      name: product.product_name ?? "Unknown",
      caloriesPer100g: product.nutriments?.["energy-kcal_100g"] ?? 0,
      proteinPer100g: product.nutriments?.["proteins_100g"] ?? 0,
      carbsPer100g: product.nutriments?.["carbohydrates_100g"] ?? 0,
      fatPer100g: product.nutriments?.["fat_100g"] ?? 0,
    }))
    .filter((product) => product.caloriesPer100g > 0)
    .slice(0, 8);

  return NextResponse.json({ results });
}
