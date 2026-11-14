import realCasesRaw from "@/data/realCasesData.json";
import {
  GISTEMP_PUBLISHED_OLS_SLOPE_1985_2025,
  GISTEMP_V4_MONTHLY_1985_2025,
} from "@/data/gistempBenchmark";
import { SYMPTOM_PRESETS } from "@/data/nasaVariables";
import {
  buildDualRegionReport,
  runGistempCrossValidation,
} from "@/lib/statsEngine";
import type {
  CausalReportSummary,
  DualRegionAnalysisReport,
  EcosystemType,
  NasaVariableCode,
  RawMonthlyPoint,
  RegionCoordinates,
  RegionVariableSeries,
  SymptomId,
  TrendSummary,
} from "@/types/climate";

type CaseRawArrays = Record<NasaVariableCode, number[]>;

interface RealCasesJsonShape {
  [caseId: string]: {
    seriesA: CaseRawArrays;
    seriesB: CaseRawArrays;
  };
}

const REAL_CASES_JSON = realCasesRaw as RealCasesJsonShape;

export interface CuratedCaseDefinition {
  caseId: string;
  shortLabel: string;
  title: string;
  climateDriverTag: string;
  defaultSymptom: SymptomId;
  defaultEcosystem: EcosystemType;
  regionA: RegionCoordinates;
  regionB: RegionCoordinates;
  buildSeries: (startYear: number, endYear: number) => {
    seriesA: RegionVariableSeries;
    seriesB: RegionVariableSeries;
  };
}

function sliceRealMonthlyPoints(
  values: number[],
  startYear: number,
  endYear: number,
  baseStartYear = 1985
): RawMonthlyPoint[] {
  const points: RawMonthlyPoint[] = [];
  for (let i = 0; i < values.length; i += 1) {
    const year = baseStartYear + Math.floor(i / 12);
    const month = (i % 12) + 1;
    if (year < startYear || year > endYear) continue;
    points.push({
      year,
      month,
      dateLabel: `${year}-${String(month).padStart(2, "0")}`,
      rawValue: values[i],
    });
  }
  return points;
}

function buildRealSeriesFromJson(
  caseId: string,
  startYear: number,
  endYear: number
): {
  seriesA: RegionVariableSeries;
  seriesB: RegionVariableSeries;
} {
  const entry = REAL_CASES_JSON[caseId];
  if (!entry) {
    throw new Error(`Missing real NASA POWER dataset for curated case: ${caseId}`);
  }

  const toRegionSeries = (raw: CaseRawArrays): RegionVariableSeries => ({
    ALLSKY_SFC_SW_DWN: sliceRealMonthlyPoints(raw.ALLSKY_SFC_SW_DWN, startYear, endYear),
    GWETROOT: sliceRealMonthlyPoints(raw.GWETROOT, startYear, endYear),
    TS: sliceRealMonthlyPoints(raw.TS, startYear, endYear),
    PRECTOTCORR: sliceRealMonthlyPoints(raw.PRECTOTCORR, startYear, endYear),
    T2M: sliceRealMonthlyPoints(raw.T2M, startYear, endYear),
  });

  return {
    seriesA: toRegionSeries(entry.seriesA),
    seriesB: toRegionSeries(entry.seriesB),
  };
}

export const CURATED_CASES: CuratedCaseDefinition[] = [
  {
    caseId: "indo-chile-dipole",
    shortLabel: "Case 1: Merauke ↔ Chile [ENSO Dipole]",
    title: "Eastern Indonesia Wetlands vs. Central Valley Chile (ENSO Opposite-Sign Dipole)",
    climateDriverTag: "El Niño–Southern Oscillation (ENSO) Trans-Pacific Dipole",
    defaultSymptom: "coastal_drought",
    defaultEcosystem: "maritime_tropics",
    regionA: {
      name: "Merauke Wetlands (Papua)",
      country: "Indonesia",
      lat: -8.49,
      lon: 140.40,
    },
    regionB: {
      name: "Central Valley Basin (Santiago)",
      country: "Chile",
      lat: -33.45,
      lon: -70.66,
    },
    buildSeries: (startYear, endYear) =>
      buildRealSeriesFromJson("indo-chile-dipole", startYear, endYear),
  },
  {
    caseId: "silent-murray-kalimantan",
    shortLabel: "Case 2: Murray-Darling ↔ Kalimantan [Silent Stress]",
    title: "Murray-Darling Basin vs. Central Kalimantan (Silent Root-Zone Stress vs. Wetting Tropics)",
    climateDriverTag: "Subtropical Drying vs. Maritime Tropical Convection",
    defaultSymptom: "peatland_drying",
    defaultEcosystem: "semi_arid_basin",
    regionA: {
      name: "Murray-Darling Basin (Mildura)",
      country: "Australia",
      lat: -34.18,
      lon: 142.16,
    },
    regionB: {
      name: "Central Kalimantan (Palangkaraya)",
      country: "Indonesia",
      lat: -2.22,
      lon: 113.91,
    },
    buildSeries: (startYear, endYear) =>
      buildRealSeriesFromJson("silent-murray-kalimantan", startYear, endYear),
  },
  {
    caseId: "java-water-energy",
    shortLabel: "Case 3: East Java ↔ West Java [Water-Energy]",
    title: "Trans-Java Agricultural Corridor: East Java vs. West Java (630 km Water-Energy Cascade)",
    climateDriverTag: "Maritime Continent Monsoon & Solar-Soil Coupling",
    defaultSymptom: "coastal_drought",
    defaultEcosystem: "coastal_delta",
    regionA: {
      name: "East Java Corridor (Surabaya/Sidoarjo)",
      country: "Indonesia",
      lat: -7.45,
      lon: 112.45,
    },
    regionB: {
      name: "West Java Citarum-Jakarta Corridor",
      country: "Indonesia",
      lat: -6.21,
      lon: 106.85,
    },
    buildSeries: (startYear, endYear) =>
      buildRealSeriesFromJson("java-water-energy", startYear, endYear),
  },
];

const LEGACY_CASE_ALIASES: Record<string, string> = {
  "iod-surabaya-turkana": "indo-chile-dipole",
  "enso-kalimantan-peru": "silent-murray-kalimantan",
  "brantas-water-energy": "java-water-energy",
};

let cachedGistempBenchmark: ReturnType<typeof runGistempCrossValidation> | null = null;
const reportMemo = new Map<string, DualRegionAnalysisReport>();

export function getDynamicGistempValidation() {
  if (!cachedGistempBenchmark) {
    cachedGistempBenchmark = runGistempCrossValidation(
      GISTEMP_V4_MONTHLY_1985_2025,
      GISTEMP_PUBLISHED_OLS_SLOPE_1985_2025
    );
  }
  return cachedGistempBenchmark;
}

export function getPrecomputedCaseReport(
  caseId: string,
  startYear = 1985,
  endYear = 2025,
  symptomOverride?: SymptomId,
  ecosystemOverride?: EcosystemType
): DualRegionAnalysisReport {
  const canonicalId = LEGACY_CASE_ALIASES[caseId] ?? caseId;
  const matched =
    CURATED_CASES.find((c) => c.caseId === canonicalId) ?? CURATED_CASES[0];
  const symptom = symptomOverride ?? matched.defaultSymptom;
  const ecosystem =
    ecosystemOverride ?? SYMPTOM_PRESETS[symptom].defaultEcosystem;

  const cacheKey = `${matched.caseId}:${startYear}:${endYear}:${symptom}:${ecosystem}`;
  const memoized = reportMemo.get(cacheKey);
  if (memoized) return memoized;

  const { seriesA, seriesB } = matched.buildSeries(startYear, endYear);

  const report = buildDualRegionReport({
    caseId: matched.caseId,
    title: matched.title,
    climateDriverTag: matched.climateDriverTag,
    dataSourceTag: "CACHED_NASA_POWER_V2",
    symptom,
    ecosystem,
    startYear,
    endYear,
    regionA: matched.regionA,
    regionB: matched.regionB,
    seriesA,
    seriesB,
    gistempValidation: getDynamicGistempValidation(),
  });
  reportMemo.set(cacheKey, report);
  return report;
}

/**
 * Generates an emergency climatology-based series ONLY when live NASA POWER API v2 fails/times out offline.
 */
export function buildFallbackSeriesForCoordinate(
  lat: number,
  lon: number,
  startYear = 1985,
  endYear = 2025
): { series: RegionVariableSeries; isOceanGrid: boolean } {
  const absLat = Math.abs(lat);
  const tropicFactor = Math.max(0, Math.cos((absLat * Math.PI) / 180));
  const isSouthern = lat < 0;
  const phaseShift = isSouthern ? 0 : Math.PI;
  const seedPhase = ((lon + 180) / 360) * Math.PI * 2;

  const sw: number[] = [];
  const gw: number[] = [];
  const ts: number[] = [];
  const pr: number[] = [];
  const t2m: number[] = [];

  for (let year = 1985; year <= 2025; year += 1) {
    for (let m = 0; m < 12; m += 1) {
      const idx = (year - 1985) * 12 + m;
      const progress = idx / 492;
      const season = Math.cos((2 * Math.PI * m) / 12 + phaseShift);
      const interannual = Math.sin((2 * Math.PI * (idx / 12)) / 3.7 + seedPhase);

      const baseTemp = 27.5 * tropicFactor + 4.0;
      const tsVal = baseTemp + 3.2 * (1 - tropicFactor) * season + 0.72 * progress;
      sw.push(17 + 4.5 * tropicFactor + 2.2 * season + 0.35 * progress);
      gw.push(Math.min(0.95, Math.max(0.18, 0.52 + 0.16 * season - 0.025 * interannual)));
      ts.push(tsVal);
      pr.push(Math.max(0.05, 4.5 * tropicFactor + 2.8 * season + 0.9 * interannual));
      t2m.push(tsVal - 0.6);
    }
  }

  return {
    isOceanGrid: false,
    series: {
      ALLSKY_SFC_SW_DWN: sliceRealMonthlyPoints(sw, startYear, endYear),
      GWETROOT: sliceRealMonthlyPoints(gw, startYear, endYear),
      TS: sliceRealMonthlyPoints(ts, startYear, endYear),
      PRECTOTCORR: sliceRealMonthlyPoints(pr, startYear, endYear),
      T2M: sliceRealMonthlyPoints(t2m, startYear, endYear),
    },
  };
}

export function serializeSummaryForAi(
  report: DualRegionAnalysisReport
): CausalReportSummary {
  const summarizeTrends = (
    trends: DualRegionAnalysisReport["trendsA"]
  ): Record<NasaVariableCode, TrendSummary> => {
    const keys: NasaVariableCode[] = [
      "ALLSKY_SFC_SW_DWN",
      "GWETROOT",
      "TS",
      "PRECTOTCORR",
      "T2M",
    ];
    return Object.fromEntries(
      keys.map((k) => {
        const t = trends[k];
        return [
          k,
          {
            isAvailable: t.isAvailable,
            mannKendallTau: t.mannKendallTau,
            pValue: Number(t.pValue.toExponential(3)),
            significanceLevel: t.significanceLevel,
            direction: t.direction,
            sensSlopePerDecade: t.sensSlopePerDecade,
            unit: t.unit,
            changePointDate: t.changePointDate,
          },
        ];
      })
    ) as Record<NasaVariableCode, TrendSummary>;
  };

  return {
    caseId: report.caseId,
    title: report.title,
    climateDriverTag: report.climateDriverTag,
    symptom: report.symptom,
    ecosystem: report.ecosystem,
    period: `${report.startYear}-${report.endYear}`,
    regionA: report.regionA,
    regionB: report.regionB,
    primaryVariable: report.primaryVariable,
    dipoleCorrelationR: report.dipoleCorrelationR,
    dipolePValue: Number(report.dipolePValue.toExponential(3)),
    isOppositeDirection: report.isOppositeDirection,
    silentEcologicalStressDetected: report.silentEcologicalStressDetected,
    silentStressReason: report.silentStressReason,
    lagCascadeA: report.lagCascadeA,
    trendsA: summarizeTrends(report.trendsA),
    trendsB: summarizeTrends(report.trendsB),
    gistempValidation: report.gistempValidation,
  };
}
