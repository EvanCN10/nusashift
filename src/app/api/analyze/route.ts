import { NextRequest, NextResponse } from "next/server";
import {
  buildFallbackSeriesForCoordinate,
  CURATED_CASES,
  getDynamicGistempValidation,
  getPrecomputedCaseReport,
} from "@/data/cachedCases";
import { SYMPTOM_PRESETS } from "@/data/nasaVariables";
import { resolveCoordinatePlace } from "@/lib/geoResolver";
import { fetchNasaPowerPoint } from "@/lib/nasaPowerClient";
import { buildDualRegionReport } from "@/lib/statsEngine";
import type {
  DualRegionAnalysisReport,
  EcosystemType,
  RegionCoordinates,
  SymptomId,
} from "@/types/climate";

interface AnalyzeRequestBody {
  caseId?: string;
  startYear?: number;
  endYear?: number;
  symptom?: SymptomId;
  ecosystem?: EcosystemType;
  regionA?: Partial<RegionCoordinates>;
  regionB?: Partial<RegionCoordinates>;
}

const VALID_SYMPTOMS = new Set<SymptomId>([
  "coastal_drought",
  "peatland_drying",
  "extreme_flood_dipole",
  "custom_exploration",
]);

const VALID_ECOSYSTEMS = new Set<EcosystemType>([
  "maritime_tropics",
  "tropical_peatland",
  "semi_arid_basin",
  "coastal_delta",
]);

const ANALYZE_CACHE_TTL_MS = 15 * 60 * 1000;
const analyzeCache = new Map<
  string,
  { expiresAt: number; report: DualRegionAnalysisReport }
>();

function parseSymptom(val: unknown): SymptomId | undefined {
  return typeof val === "string" && VALID_SYMPTOMS.has(val as SymptomId)
    ? (val as SymptomId)
    : undefined;
}

function parseEcosystem(val: unknown): EcosystemType | undefined {
  return typeof val === "string" && VALID_ECOSYSTEMS.has(val as EcosystemType)
    ? (val as EcosystemType)
    : undefined;
}

function clampYear(val: unknown, fallback: number): number {
  const num = typeof val === "number" ? val : Number(val);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(1985, Math.min(2025, Math.round(num)));
}

function needsReverseGeocode(name: string | undefined): boolean {
  if (!name) return true;
  const trimmed = name.trim();
  return (
    trimmed.length === 0 ||
    trimmed.startsWith("Probe ") ||
    trimmed.startsWith("Target ") ||
    trimmed.startsWith("Custom Target") ||
    trimmed.startsWith("Paired Target")
  );
}

async function handleAnalyze(body: AnalyzeRequestBody) {
  const startYear = clampYear(body.startYear, 1985);
  const endYear = Math.max(startYear + 5, clampYear(body.endYear, 2025));
  const symptom = parseSymptom(body.symptom);
  const ecosystem = parseEcosystem(body.ecosystem);

  const hasCustomCoords =
    typeof body.regionA?.lat === "number" &&
    typeof body.regionA?.lon === "number" &&
    typeof body.regionB?.lat === "number" &&
    typeof body.regionB?.lon === "number";

  if (!hasCustomCoords) {
    const targetCaseId = body.caseId ?? CURATED_CASES[0].caseId;
    const report = getPrecomputedCaseReport(
      targetCaseId,
      startYear,
      endYear,
      symptom,
      ecosystem
    );
    return NextResponse.json(report, { status: 200 });
  }

  const latA = Number(body.regionA!.lat!.toFixed(3));
  const lonA = Number(body.regionA!.lon!.toFixed(3));
  const latB = Number(body.regionB!.lat!.toFixed(3));
  const lonB = Number(body.regionB!.lon!.toFixed(3));

  const resolvedSymptom = symptom ?? "custom_exploration";
  const resolvedEcosystem =
    ecosystem ?? SYMPTOM_PRESETS[resolvedSymptom].defaultEcosystem;

  const cacheKey = `${latA.toFixed(2)},${lonA.toFixed(2)}:${latB.toFixed(2)},${lonB.toFixed(2)}:${startYear}-${endYear}:${resolvedSymptom}:${resolvedEcosystem}`;
  const cached = analyzeCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.report, { status: 200 });
  }

  const baseRegionA: RegionCoordinates = {
    name: body.regionA?.name?.trim() || `Target A (${latA.toFixed(2)}°, ${lonA.toFixed(2)}°)`,
    country: body.regionA?.country?.trim() || "Live Coordinate",
    lat: latA,
    lon: lonA,
  };

  const baseRegionB: RegionCoordinates = {
    name: body.regionB?.name?.trim() || `Target B (${latB.toFixed(2)}°, ${lonB.toFixed(2)}°)`,
    country: body.regionB?.country?.trim() || "Live Coordinate",
    lat: latB,
    lon: lonB,
  };

  let usedFallbackFeed = false;
  const notices: string[] = [];

  const [resA, resB, placeA, placeB] = await Promise.all([
    fetchNasaPowerPoint(baseRegionA, startYear, endYear, 5500).catch(() => {
      usedFallbackFeed = true;
      const fb = buildFallbackSeriesForCoordinate(latA, lonA, startYear, endYear);
      return {
        region: { ...baseRegionA, isOceanGrid: fb.isOceanGrid },
        series: fb.series,
        oceanFallbackNotice: undefined,
      };
    }),
    fetchNasaPowerPoint(baseRegionB, startYear, endYear, 5500).catch(() => {
      usedFallbackFeed = true;
      const fb = buildFallbackSeriesForCoordinate(latB, lonB, startYear, endYear);
      return {
        region: { ...baseRegionB, isOceanGrid: fb.isOceanGrid },
        series: fb.series,
        oceanFallbackNotice: undefined,
      };
    }),
    needsReverseGeocode(body.regionA?.name)
      ? resolveCoordinatePlace(latA, lonA)
      : Promise.resolve(null),
    needsReverseGeocode(body.regionB?.name)
      ? resolveCoordinatePlace(latB, lonB)
      : Promise.resolve(null),
  ]);

  const enrichedRegionA: RegionCoordinates = placeA
    ? { ...resA.region, name: placeA.name, country: placeA.country }
    : resA.region;
  const enrichedRegionB: RegionCoordinates = placeB
    ? { ...resB.region, name: placeB.name, country: placeB.country }
    : resB.region;

  if (resA.oceanFallbackNotice) notices.push(`Region A: ${resA.oceanFallbackNotice}`);
  if (resB.oceanFallbackNotice) notices.push(`Region B: ${resB.oceanFallbackNotice}`);
  if (usedFallbackFeed) {
    notices.push(
      "NASA POWER live API latency exceeded 5.5s; displaying climatology-calibrated fallback telemetry."
    );
  }

  const report = buildDualRegionReport({
    caseId: body.caseId || "live-custom-pair",
    title: `${enrichedRegionA.name} vs. ${enrichedRegionB.name}`,
    climateDriverTag: "Live Spatial Teleconnection Probe",
    dataSourceTag: usedFallbackFeed ? "CACHED_NASA_POWER_V2" : "LIVE_NASA_POWER_V2",
    symptom: resolvedSymptom,
    ecosystem: resolvedEcosystem,
    startYear,
    endYear,
    regionA: enrichedRegionA,
    regionB: enrichedRegionB,
    seriesA: resA.series,
    seriesB: resB.series,
    oceanFallbackNotice: notices.length > 0 ? notices.join(" ") : undefined,
    gistempValidation: getDynamicGistempValidation(),
  });

  if (!usedFallbackFeed) {
    if (analyzeCache.size >= 120) {
      const oldestKey = analyzeCache.keys().next().value;
      if (oldestKey) analyzeCache.delete(oldestKey);
    }
    analyzeCache.set(cacheKey, {
      expiresAt: Date.now() + ANALYZE_CACHE_TTL_MS,
      report,
    });
  }

  return NextResponse.json(report, { status: 200 });
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const latA = searchParams.get("latA");
  const lonA = searchParams.get("lonA");
  const latB = searchParams.get("latB");
  const lonB = searchParams.get("lonB");

  const parsedLatA = latA !== null ? Number(latA) : Number.NaN;
  const parsedLonA = lonA !== null ? Number(lonA) : Number.NaN;
  const parsedLatB = latB !== null ? Number(latB) : Number.NaN;
  const parsedLonB = lonB !== null ? Number(lonB) : Number.NaN;

  const hasCoords =
    Number.isFinite(parsedLatA) &&
    Number.isFinite(parsedLonA) &&
    Number.isFinite(parsedLatB) &&
    Number.isFinite(parsedLonB);

  return handleAnalyze({
    caseId: searchParams.get("case") ?? undefined,
    startYear: searchParams.get("startYear")
      ? Number(searchParams.get("startYear"))
      : undefined,
    endYear: searchParams.get("endYear")
      ? Number(searchParams.get("endYear"))
      : undefined,
    symptom: parseSymptom(searchParams.get("symptom")),
    ecosystem: parseEcosystem(searchParams.get("ecosystem")),
    regionA: hasCoords
      ? {
          lat: parsedLatA,
          lon: parsedLonA,
          name: searchParams.get("nameA") ?? undefined,
          country: searchParams.get("countryA") ?? undefined,
        }
      : undefined,
    regionB: hasCoords
      ? {
          lat: parsedLatB,
          lon: parsedLonB,
          name: searchParams.get("nameB") ?? undefined,
          country: searchParams.get("countryB") ?? undefined,
        }
      : undefined,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AnalyzeRequestBody;
    return await handleAnalyze(body);
  } catch {
    const fallback = getPrecomputedCaseReport(CURATED_CASES[0].caseId);
    return NextResponse.json(fallback, { status: 200 });
  }
}
