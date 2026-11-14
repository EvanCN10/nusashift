import { texNum, texP } from "@/components/math/texFormat";
import { NASA_VARIABLES } from "@/data/nasaVariables";
import type {
  DualRegionAnalysisReport,
  NasaVariableCode,
  TrendAnalysisResult,
} from "@/types/climate";

export interface FriendlyVariableCopy {
  code: NasaVariableCode;
  name: string;
  cascadeLabel: string;
  metricPhrase: string;
}

export const FRIENDLY_VARIABLES: Record<NasaVariableCode, FriendlyVariableCopy> = {
  ALLSKY_SFC_SW_DWN: {
    code: "ALLSKY_SFC_SW_DWN",
    name: "Sunlight",
    cascadeLabel: "Sunlight",
    metricPhrase: "surface sunlight",
  },
  GWETROOT: {
    code: "GWETROOT",
    name: "Soil wetness",
    cascadeLabel: "Soil wetness",
    metricPhrase: "root-zone soil wetness",
  },
  TS: {
    code: "TS",
    name: "Surface heat",
    cascadeLabel: "Surface heat",
    metricPhrase: "surface skin temperature",
  },
  PRECTOTCORR: {
    code: "PRECTOTCORR",
    name: "Rainfall",
    cascadeLabel: "Rainfall",
    metricPhrase: "monthly rainfall",
  },
  T2M: {
    code: "T2M",
    name: "Air temperature",
    cascadeLabel: "Air temperature",
    metricPhrase: "near-surface air temperature",
  },
};

export type PValueBucketLabel = "Very strong" | "Strong" | "Weak";

export interface PValueBucketResult {
  bucket: PValueBucketLabel;
  pTex: string;
  meaning: string;
}

/** Maps a formal p-value to plain confidence tier while keeping exact LaTeX notation. */
export function pValueBucket(pValue: number): PValueBucketResult {
  const pTex = texP(pValue);
  if (pValue < 0.01) {
    return {
      bucket: "Very strong",
      pTex,
      meaning: "Under 1% chance this long-term trend happened by random seasonal luck.",
    };
  }
  if (pValue < 0.05) {
    return {
      bucket: "Strong",
      pTex,
      meaning: "Statistically clear multi-decade trend outside normal year-to-year swings.",
    };
  }
  return {
    bucket: "Weak",
    pTex,
    meaning: "Cannot yet be separated from ordinary year-to-year seasonal variation.",
  };
}

export type VerdictBadgeVariant = "alert" | "opposite" | "coupled";

export interface VerdictStatusBadge {
  label: "SILENT STRESS DETECTED" | "OPPOSITE-SIGN" | "COUPLED";
  variant: VerdictBadgeVariant;
}

/** Determines single primary verdict badge; red alert is reserved for Silent Stress. */
export function getVerdictBadge(
  report: DualRegionAnalysisReport
): VerdictStatusBadge {
  if (report.silentEcologicalStressDetected) {
    return { label: "SILENT STRESS DETECTED", variant: "alert" };
  }
  if (report.isOppositeDirection) {
    return { label: "OPPOSITE-SIGN", variant: "opposite" };
  }
  return { label: "COUPLED", variant: "coupled" };
}

/** Translates trend direction for a given variable into plain-English verb phrase. */
export function describeTrendDirection(
  variable: NasaVariableCode,
  trend: TrendAnalysisResult
): string {
  if (!trend.isAvailable) return "outside land soil coverage";
  if (variable === "GWETROOT" || variable === "PRECTOTCORR") {
    if (trend.direction === "INCREASING") return "getting wetter";
    if (trend.direction === "DECREASING") return "drying";
    return "holding steady";
  }
  if (variable === "TS" || variable === "T2M") {
    if (trend.direction === "INCREASING") return "warming";
    if (trend.direction === "DECREASING") return "cooling";
    return "holding steady";
  }
  if (trend.direction === "INCREASING") return "receiving more sunlight";
  if (trend.direction === "DECREASING") return "receiving less sunlight";
  return "holding steady";
}

/** Deterministic Display M headline answering what the two regions are doing. */
export function buildVerdictSentence(
  report: DualRegionAnalysisReport
): string {
  if (report.silentEcologicalStressDetected) {
    return `${report.regionA.name} is silently losing root-zone soil wetness before rainfall gauges signal drought.`;
  }

  const primary = report.primaryVariable;
  const trendA = report.trendsA[primary];
  const trendB = report.trendsB[primary];

  if (!trendA.isAvailable || !trendB.isAvailable) {
    return `${report.regionA.name} and ${report.regionB.name} show ${
      report.isOppositeDirection ? "opposing" : "paired"
    } climate swings across ${report.startYear}–${report.endYear}.`;
  }

  const verbA = describeTrendDirection(primary, trendA);
  const verbB = describeTrendDirection(primary, trendB);

  if (!report.isOppositeDirection && trendA.direction === trendB.direction && trendA.direction !== "STABLE") {
    return `Both ${report.regionA.name} and ${report.regionB.name} are ${verbA}.`;
  }

  return `${report.regionA.name} is ${verbA} while ${report.regionB.name} is ${verbB}.`;
}

/**
 * Merges plain-English community/citizen interpretation directly into Verdict
 * using exact computed values from `report` (replaces separate Citizen View banner).
 */
export function buildVerdictPlainSummary(
  report: DualRegionAnalysisReport
): string {
  const gwetA = report.trendsA.GWETROOT;
  const precA = report.trendsA.PRECTOTCORR;
  const primary = report.primaryVariable;
  const primaryA = report.trendsA[primary];
  const primaryB = report.trendsB[primary];
  const activeShift = primaryA.isAvailable ? primaryA : primaryB;
  const varName = FRIENDLY_VARIABLES[primary].metricPhrase;

  if (report.silentEcologicalStressDetected) {
    return (
      `Even though ${report.regionA.name}'s monthly rainfall still looks statistically flat (` +
      `p = ${precA.pValue.toFixed(4)}), satellite sensors measure steady drying 1 meter below ground since ` +
      `${gwetA.changePointDate} (p = ${gwetA.pValue < 0.001 ? gwetA.pValue.toExponential(2) : gwetA.pValue.toFixed(4)}). ` +
      `Water managers and farmers can act early on soil moisture rather than waiting for an empty rain gauge.`
    );
  }

  if (report.isOppositeDirection) {
    return (
      `Across ${report.startYear}–${report.endYear} of deseasonalized NASA satellite records, ${varName} shifted around ` +
      `${activeShift.changePointDate} with opposing multi-decade trends between ${report.regionA.name} and ` +
      `${report.regionB.name} (coupling r = ${texNum(report.dipoleCorrelationR, 3)}). Communities on the drying side ` +
      `can size reservoir and planting buffers early whenever cross-basin climate swings intensify.`
    );
  }

  return (
    `Over ${report.startYear}–${report.endYear}, NASA satellite records track paired changes in ${varName} across ` +
    `${report.regionA.name} and ${report.regionB.name}, with the strongest turning point in ${activeShift.changePointDate}. ` +
    `Monitoring underground wetness alongside surface skin temperature gives watersheds earlier warning than rainfall totals alone.`
  );
}

export interface VerdictMetricItem {
  id: "coupling" | "shift" | "confidence";
  label: string;
  value: string;
  meaning: string;
  captionTex?: string;
  captionText?: string;
}

/** Three Verdict key figures aligned strictly with `report` and Proof precision. */
export function buildVerdictMetrics(
  report: DualRegionAnalysisReport
): VerdictMetricItem[] {
  const primary = report.primaryVariable;
  const trendA = report.trendsA[primary];
  const trendB = report.trendsB[primary];
  const refTrend = trendA.isAvailable ? trendA : trendB;
  const shiftDate = refTrend.isAvailable ? refTrend.changePointDate : "N/A";
  const ktFormatted = refTrend.isAvailable
    ? Math.round(refTrend.pettittStatistic).toLocaleString("en-US").replace(/,/g, "{,}")
    : "0";
  const bucketInfo = pValueBucket(
    refTrend.isAvailable ? refTrend.pValue : report.dipolePValue
  );

  return [
    {
      id: "coupling",
      label: "Coupling strength",
      value: texNum(report.dipoleCorrelationR, 3),
      meaning: report.isOppositeDirection
        ? "When one region gains moisture or cools, its partner swings the opposite way."
        : "Both regions fluctuate in lockstep across multi-decade satellite anomalies.",
      captionTex: `r = ${texNum(report.dipoleCorrelationR, 3)},\\; ${texP(report.dipolePValue)}`,
    },
    {
      id: "shift",
      label: "Regime shift date",
      value: shiftDate,
      meaning: `Sharpest change-point in ${FRIENDLY_VARIABLES[primary].name.toLowerCase()} for ${
        trendA.isAvailable ? report.regionA.name : report.regionB.name
      }.`,
      captionTex: refTrend.isAvailable
        ? `\\text{Pettitt } K_T = ${ktFormatted}`
        : undefined,
      captionText: refTrend.isAvailable ? undefined : "Land grid unavailable",
    },
    {
      id: "confidence",
      label: "Statistical confidence",
      value: bucketInfo.bucket,
      meaning: bucketInfo.meaning,
      captionTex: `\\text{${NASA_VARIABLES[primary].shortLabel}}\\;(${bucketInfo.pTex})`,
    },
  ];
}

/** Plain-language 1-sentence caption underneath the dual Evidence charts. */
export function buildEvidenceCaption(
  report: DualRegionAnalysisReport,
  variable: NasaVariableCode
): string {
  const friendly = FRIENDLY_VARIABLES[variable].metricPhrase;
  const trendA = report.trendsA[variable];
  const trendB = report.trendsB[variable];

  if (!trendA.isAvailable || !trendB.isAvailable) {
    return `${FRIENDLY_VARIABLES[variable].name} is a land-surface satellite measure unavailable on deep ocean coordinates; switch to rainfall or surface heat to compare both locations.`;
  }

  const dirA = describeTrendDirection(variable, trendA);
  const dirB = describeTrendDirection(variable, trendB);
  const sigA = pValueBucket(trendA.pValue).bucket.toLowerCase();
  const sigB = pValueBucket(trendB.pValue).bucket.toLowerCase();

  return (
    `Look at the dashed shift markers: after ${trendA.changePointDate} (${sigA} shift), ${report.regionA.name} moves toward ${dirA} ` +
    `${friendly}, while ${report.regionB.name} shifts around ${trendB.changePointDate} (${sigB}) toward ${dirB}.`
  );
}

/** Formats plain-English lag connector label (`+1 month later`, `Same month`). */
export function formatLagPhrase(months: number): string {
  if (months === 0) return "Same month";
  return `+${months} ${months === 1 ? "month" : "months"} later`;
}
