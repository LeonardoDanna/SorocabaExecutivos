import { NextRequest, NextResponse } from "next/server";

const BIAS_LOCATION = "circle:100000@-23.5015,-47.4526"; // Sorocaba

export async function GET(request: NextRequest) {
  const input = request.nextUrl.searchParams.get("input") ?? "";

  if (!input || input.trim().length < 3) {
    return NextResponse.json({ predictions: [] });
  }

  if (input.length > 200) {
    return NextResponse.json({ predictions: [] });
  }

  const key = process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY;
  if (!key) {
    return NextResponse.json({ predictions: [] }, { status: 500 });
  }

  const params = new URLSearchParams({
    input: input.trim(),
    key,
    language: "pt-BR",
    components: "country:br",
    locationbias: BIAS_LOCATION,
  });

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`,
    { next: { revalidate: 0 } }
  );

  const data = await res.json();

  return NextResponse.json({
    predictions: (data.predictions ?? []).slice(0, 5).map((p: { place_id: string; description: string }) => ({
      place_id: p.place_id,
      description: p.description,
    })),
  });
}
