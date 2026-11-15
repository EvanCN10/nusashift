import { NextRequest, NextResponse } from "next/server";

export interface GeocodedPlace {
  id: number;
  name: string;
  admin1?: string;
  country: string;
  latitude: number;
  longitude: number;
  label: string;
}

interface OpenMeteoResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}

interface OpenMeteoResponse {
  results?: OpenMeteoResult[];
}

const placesCache = new Map<string, { expiresAt: number; results: GeocodedPlace[] }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const cacheKey = q.toLowerCase();
  const cached = placesCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return NextResponse.json({ results: cached.results });
  }

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      q
    )}&count=6&language=en&format=json`;

    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "NusaShift-NASA-SpaceApps/1.0",
      },
      signal: AbortSignal.timeout(2600),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Geocoding upstream responded with HTTP ${res.status}` },
        { status: 502 }
      );
    }

    const data = (await res.json()) as OpenMeteoResponse;
    const rawList = data.results ?? [];

    const results: GeocodedPlace[] = rawList.map((item) => {
      const parts = [item.name];
      if (item.admin1 && item.admin1 !== item.name) {
        parts.push(item.admin1);
      }
      if (item.country) {
        parts.push(item.country);
      }
      return {
        id: item.id,
        name: item.name,
        admin1: item.admin1,
        country: item.country || "Global Region",
        latitude: item.latitude,
        longitude: item.longitude,
        label: parts.join(", "),
      };
    });

    if (placesCache.size >= 150) {
      const firstKey = placesCache.keys().next().value;
      if (firstKey) placesCache.delete(firstKey);
    }
    placesCache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, results });

    return NextResponse.json({ results });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Geocoding lookup failed";
    return NextResponse.json({ error: message, results: [] }, { status: 504 });
  }
}

