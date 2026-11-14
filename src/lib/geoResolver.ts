interface BigDataCloudResponse {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
  countryName?: string;
  localityInfo?: {
    informative?: Array<{ name?: string; description?: string }>;
  };
}

export interface ResolvedPlace {
  name: string;
  country: string;
}

const geoCache = new Map<string, ResolvedPlace>();

function fallbackOceanOrHemisphereLabel(lat: number, lon: number): ResolvedPlace {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lon >= 0 ? "E" : "W";
  const coordTag = `${Math.abs(lat).toFixed(1)}°${ns}, ${Math.abs(lon).toFixed(1)}°${ew}`;

  // Coarse ocean basin hint when offline
  if (lat > -60 && lat < 30 && lon > 20 && lon < 120) {
    return { name: `Indo-Australasian Sector (${coordTag})`, country: "Regional Grid" };
  }
  if (lon >= 120 || lon <= -70) {
    return { name: `Pacific Sector (${coordTag})`, country: "Regional Grid" };
  }
  return { name: `Global Grid (${coordTag})`, country: "Regional Grid" };
}

/**
 * Resolves human-readable city/province/ocean basin names for clicked coordinates
 * using BigDataCloud's keyless reverse-geocode endpoint with an in-memory cache.
 */
export async function resolveCoordinatePlace(
  lat: number,
  lon: number
): Promise<ResolvedPlace> {
  const cacheKey = `${(Math.round(lat * 4) / 4).toFixed(2)},${(Math.round(lon * 4) / 4).toFixed(2)}`;
  const cached = geoCache.get(cacheKey);
  if (cached) return cached;

  try {
    const url =
      `https://api.bigdatacloud.net/data/reverse-geocode-client` +
      `?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&localityLanguage=en`;

    const res = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "NusaShift/1.0" },
      signal: AbortSignal.timeout(1600),
      cache: "force-cache",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = (await res.json()) as BigDataCloudResponse;
    const country = data.countryName?.trim();

    let resolved: ResolvedPlace;
    if (country) {
      const primaryPlace =
        data.city?.trim() ||
        data.principalSubdivision?.trim() ||
        data.locality?.trim() ||
        country;
      const subdiv = data.principalSubdivision?.trim();
      const label =
        subdiv && primaryPlace !== subdiv && !primaryPlace.includes(subdiv)
          ? `${primaryPlace}, ${subdiv}`
          : primaryPlace;
      resolved = { name: label, country };
    } else {
      const marineName =
        data.locality?.trim() ||
        data.localityInfo?.informative?.[0]?.name?.trim() ||
        "Open Ocean Basin";
      resolved = {
        name: marineName,
        country: "Pelagic Marine Grid",
      };
    }

    if (geoCache.size >= 200) {
      const firstKey = geoCache.keys().next().value;
      if (firstKey) geoCache.delete(firstKey);
    }
    geoCache.set(cacheKey, resolved);
    return resolved;
  } catch {
    return fallbackOceanOrHemisphereLabel(lat, lon);
  }
}
