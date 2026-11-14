import type {
  NasaVariableCode,
  RawMonthlyPoint,
  RegionCoordinates,
  RegionVariableSeries,
} from "@/types/climate";

export const ALL_NASA_VARIABLES: NasaVariableCode[] = [
  "ALLSKY_SFC_SW_DWN",
  "GWETROOT",
  "TS",
  "PRECTOTCORR",
  "T2M",
];

interface NasaPowerApiResponse {
  properties?: {
    parameter?: Partial<Record<NasaVariableCode, Record<string, number>>>;
  };
}

export interface NasaPowerFetchResult {
  region: RegionCoordinates;
  series: RegionVariableSeries;
  oceanFallbackNotice?: string;
}

/**
 * Formats decimal latitude and longitude into Degree-Minute-Second style (e.g. "07°27'S, 112°27'E").
 */
export function formatDMS(lat: number, lon: number): string {
  const formatPart = (value: number, posHemi: string, negHemi: string, padDeg: number): string => {
    const hemi = value >= 0 ? posHemi : negHemi;
    const abs = Math.abs(value);
    let deg = Math.floor(abs);
    let mins = Math.round((abs - deg) * 60);
    if (mins === 60) {
      deg += 1;
      mins = 0;
    }
    const degStr = String(deg).padStart(padDeg, "0");
    const minStr = String(mins).padStart(2, "0");
    return `${degStr}°${minStr}'${hemi}`;
  };

  return `${formatPart(lat, "N", "S", 2)}, ${formatPart(lon, "E", "W", 3)}`;
}

/**
 * Sanitizes a raw NASA POWER monthly parameter map into chronological monthly observations.
 * Filters out month === 13 (annual summary) and fill/missing values <= -900.
 */
export function sanitizeNasaParameterMap(
  rawMap: Record<string, number> | undefined,
  startYear: number,
  endYear: number
): RawMonthlyPoint[] {
  if (!rawMap) return [];

  const points: RawMonthlyPoint[] = [];

  for (const [key, value] of Object.entries(rawMap)) {
    if (key.length !== 6) continue;
    const year = Number.parseInt(key.slice(0, 4), 10);
    const month = Number.parseInt(key.slice(4, 6), 10);

    // Strictly skip NASA POWER month 13 annual summary rows and invalid months
    if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
      continue;
    }
    if (year < startYear || year > endYear) {
      continue;
    }
    // Filter NASA POWER fill values (-999) and non-finite entries
    if (typeof value !== "number" || !Number.isFinite(value) || value <= -900) {
      continue;
    }

    const monthPadded = String(month).padStart(2, "0");
    points.push({
      year,
      month,
      dateLabel: `${year}-${monthPadded}`,
      rawValue: value,
    });
  }

  points.sort((a, b) => a.year * 100 + a.month - (b.year * 100 + b.month));
  return points;
}

/**
 * Parses a full NASA POWER API v2 JSON payload and evaluates ocean-grid fallback status.
 */
export function parseNasaPowerResponse(
  payload: NasaPowerApiResponse,
  region: RegionCoordinates,
  startYear: number,
  endYear: number
): NasaPowerFetchResult {
  const paramBag = payload.properties?.parameter ?? {};

  const series: RegionVariableSeries = {
    ALLSKY_SFC_SW_DWN: sanitizeNasaParameterMap(paramBag.ALLSKY_SFC_SW_DWN, startYear, endYear),
    GWETROOT: sanitizeNasaParameterMap(paramBag.GWETROOT, startYear, endYear),
    TS: sanitizeNasaParameterMap(paramBag.TS, startYear, endYear),
    PRECTOTCORR: sanitizeNasaParameterMap(paramBag.PRECTOTCORR, startYear, endYear),
    T2M: sanitizeNasaParameterMap(paramBag.T2M, startYear, endYear),
  };

  const isOcean = series.GWETROOT.length < 24;
  const sanitizedRegion: RegionCoordinates = {
    ...region,
    isOceanGrid: isOcean,
  };

  const oceanFallbackNotice = isOcean
    ? "Ocean grid cell detected: Root-zone soil wetness (GWETROOT) is land-only; automatically analyzing skin temperature (TS) and precipitation (PRECTOTCORR)."
    : undefined;

  return {
    region: sanitizedRegion,
    series,
    oceanFallbackNotice,
  };
}

/**
 * Fetches live monthly climate telemetry from NASA POWER API v2 (free, no API key required).
 */
export async function fetchNasaPowerPoint(
  region: RegionCoordinates,
  startYear = 1985,
  endYear = 2025,
  timeoutMs = 4500
): Promise<NasaPowerFetchResult> {
  const clampedLat = Math.max(-89.5, Math.min(89.5, region.lat));
  const clampedLon = Math.max(-179.5, Math.min(179.5, region.lon));
  const params = ALL_NASA_VARIABLES.join(",");

  const url =
    `https://power.larc.nasa.gov/api/temporal/monthly/point` +
    `?parameters=${params}` +
    `&community=AG` +
    `&longitude=${clampedLon.toFixed(4)}` +
    `&latitude=${clampedLat.toFixed(4)}` +
    `&start=${startYear}` +
    `&end=${endYear}` +
    `&format=JSON`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "User-Agent": "NusaShift/1.0",
    },
    signal: AbortSignal.timeout(timeoutMs),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`NASA POWER API v2 responded with status ${response.status}`);
  }

  const json = (await response.json()) as NasaPowerApiResponse;
  return parseNasaPowerResponse(
    json,
    { ...region, lat: clampedLat, lon: clampedLon },
    startYear,
    endYear
  );
}
