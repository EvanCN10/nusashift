import type {
  DualRegionAnalysisReport,
  EcosystemType,
  GistempBenchmarkResult,
  LagCascadeLink,
  MonthlyObservation,
  NasaVariableCode,
  RawMonthlyPoint,
  RegionCoordinates,
  RegionVariableSeries,
  SignificanceLevel,
  SymptomId,
  TrendAnalysisResult,
  TrendDirection,
} from "@/types/climate";

const VARIABLE_META_FALLBACK: Record<
  NasaVariableCode,
  { label: string; unit: string }
> = {
  ALLSKY_SFC_SW_DWN: {
    label: "Solar Surface Irradiance",
    unit: "MJ/m²/day",
  },
  GWETROOT: {
    label: "Root-Zone Soil Wetness",
    unit: "fraction (0–1)",
  },
  TS: {
    label: "Earth Skin Temperature",
    unit: "°C",
  },
  PRECTOTCORR: {
    label: "Bias-Corrected Precipitation",
    unit: "mm/day",
  },
  T2M: {
    label: "Air Temperature (2m)",
    unit: "°C",
  },
};

export interface MannKendallOutput {
  s: number;
  tau: number;
  varianceS: number;
  zScore: number;
  pValue: number;
  significanceLevel: SignificanceLevel;
  direction: TrendDirection;
}

export interface SensSlopeOutput {
  slopePerDecade: number;
  confidenceInterval95: [number, number];
}

export interface PettittOutput {
  changePointDate: string;
  pettittStatistic: number;
}

/**
 * Abramowitz & Stegun 7.1.26 complementary error function approximation (max error ~1.5e-7).
 */
export function erfc(x: number): number {
  if (x < 0) return 2 - erfc(-x);
  if (x === 0) return 1;
  if (x > 8) return 0;

  const p = 0.3275911;
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;

  const t = 1 / (1 + p * x);
  const poly = t * (a1 + t * (a2 + t * (a3 + t * (a4 + t * a5))));
  return Math.max(0, Math.min(1, poly * Math.exp(-x * x)));
}

/**
 * Log-gamma function via Lanczos approximation for exact Student-t p-values.
 */
function logGamma(z: number): number {
  const coeffs = [
    76.18009172947146,
    -86.50532032941677,
    24.01409824083091,
    -1.231739572450155,
    0.1208650973866179e-2,
    -0.5395239384953e-5,
  ];
  let y = z;
  let tmp = z + 5.5;
  tmp -= (z + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < coeffs.length; j += 1) {
    y += 1;
    ser += coeffs[j] / y;
  }
  return -tmp + Math.log((2.5066282746310005 * ser) / z);
}

/**
 * Continued fraction evaluator for regularized incomplete beta function I_x(a, b).
 */
function betaContinuedFraction(a: number, b: number, x: number): number {
  const maxIter = 120;
  const eps = 3e-14;
  const fpMin = 1e-30;

  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < fpMin) d = fpMin;
  d = 1 / d;
  let h = d;

  for (let m = 1; m <= maxIter; m += 1) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < fpMin) d = fpMin;
    c = 1 + aa / c;
    if (Math.abs(c) < fpMin) c = fpMin;
    d = 1 / d;
    h *= d * c;

    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < fpMin) d = fpMin;
    c = 1 + aa / c;
    if (Math.abs(c) < fpMin) c = fpMin;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < eps) break;
  }

  return h;
}

function regularizedIncompleteBeta(a: number, b: number, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  const bt = Math.exp(
    logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x)
  );

  if (x < (a + 1) / (a + b + 2)) {
    return (bt * betaContinuedFraction(a, b, x)) / a;
  }
  return 1 - (bt * betaContinuedFraction(b, a, 1 - x)) / b;
}

/**
 * Two-tailed Student-t p-value for Pearson correlation r with sample count n.
 */
export function pearsonCorrelationWithPValue(
  xs: number[],
  ys: number[]
): { r: number; pValue: number } {
  const n = Math.min(xs.length, ys.length);
  if (n < 4) return { r: 0, pValue: 1 };

  let sumX = 0;
  let sumY = 0;
  for (let i = 0; i < n; i += 1) {
    sumX += xs[i];
    sumY += ys[i];
  }
  const meanX = sumX / n;
  const meanY = sumY / n;

  let cov = 0;
  let varX = 0;
  let varY = 0;
  for (let i = 0; i < n; i += 1) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    cov += dx * dy;
    varX += dx * dx;
    varY += dy * dy;
  }

  const denom = Math.sqrt(varX * varY);
  if (denom <= 1e-12) return { r: 0, pValue: 1 };

  const r = Math.max(-0.999999, Math.min(0.999999, cov / denom));
  if (Math.abs(r) < 1e-12) return { r: 0, pValue: 1 };

  const df = n - 2;
  const tSq = (r * r * df) / Math.max(1e-12, 1 - r * r);
  const p = regularizedIncompleteBeta(df / 2, 0.5, df / (df + tSq));
  return {
    r: Number(r.toFixed(4)),
    pValue: Math.max(1e-15, Math.min(1, p)),
  };
}

/**
 * Removes seasonal wet/dry cycle bias by computing per-calendar-month Z-score anomalies:
 * Z_{y,m} = (X_{y,m} - mu_m) / sigma_m
 */
export function deseasonalizeMonthlySeries(
  rawPoints: RawMonthlyPoint[]
): MonthlyObservation[] {
  if (rawPoints.length === 0) return [];

  const buckets = new Map<number, number[]>();
  for (let m = 1; m <= 12; m += 1) {
    buckets.set(m, []);
  }
  for (const pt of rawPoints) {
    buckets.get(pt.month)?.push(pt.rawValue);
  }

  const statsByMonth = new Map<number, { mean: number; std: number }>();
  for (const [m, vals] of buckets.entries()) {
    if (vals.length === 0) {
      statsByMonth.set(m, { mean: 0, std: 1 });
      continue;
    }
    const mean = vals.reduce((acc, v) => acc + v, 0) / vals.length;
    if (vals.length === 1) {
      statsByMonth.set(m, { mean, std: 1 });
      continue;
    }
    const variance =
      vals.reduce((acc, v) => acc + (v - mean) * (v - mean), 0) / (vals.length - 1);
    const std = Math.max(Math.sqrt(variance), 1e-6);
    statsByMonth.set(m, { mean, std });
  }

  return rawPoints.map((pt) => {
    const stat = statsByMonth.get(pt.month) ?? { mean: pt.rawValue, std: 1 };
    const z = (pt.rawValue - stat.mean) / stat.std;
    return {
      ...pt,
      deseasonalizedZ: Number(z.toFixed(4)),
    };
  });
}

/**
 * Computes physical-unit anomalies (X_{y,m} - mu_m) so Sen's Slope retains exact units without seasonal endpoint skew.
 */
function computePhysicalAnomalies(rawPoints: RawMonthlyPoint[]): number[] {
  const sums = new Float64Array(13);
  const counts = new Int32Array(13);

  for (const pt of rawPoints) {
    sums[pt.month] += pt.rawValue;
    counts[pt.month] += 1;
  }

  return rawPoints.map((pt) => {
    const count = counts[pt.month];
    const mean = count > 0 ? sums[pt.month] / count : pt.rawValue;
    return pt.rawValue - mean;
  });
}

/**
 * Non-parametric Mann-Kendall trend test with tie adjustment and continuity correction.
 */
export function mannKendallTest(values: number[]): MannKendallOutput {
  const n = values.length;
  if (n < 4) {
    return {
      s: 0,
      tau: 0,
      varianceS: 0,
      zScore: 0,
      pValue: 1,
      significanceLevel: "NOT_SIGNIFICANT",
      direction: "STABLE",
    };
  }

  let s = 0;
  for (let i = 0; i < n - 1; i += 1) {
    const vi = values[i];
    for (let j = i + 1; j < n; j += 1) {
      const diff = values[j] - vi;
      if (diff > 1e-12) s += 1;
      else if (diff < -1e-12) s -= 1;
    }
  }

  const tieCounts = new Map<number, number>();
  for (let i = 0; i < n; i += 1) {
    const rounded = Math.round(values[i] * 1e6);
    tieCounts.set(rounded, (tieCounts.get(rounded) ?? 0) + 1);
  }

  let tieAdjustment = 0;
  for (const t of tieCounts.values()) {
    if (t > 1) {
      tieAdjustment += t * (t - 1) * (2 * t + 5);
    }
  }

  const varianceS = Math.max(1e-9, (n * (n - 1) * (2 * n + 5) - tieAdjustment) / 18);
  const stdS = Math.sqrt(varianceS);

  let zScore = 0;
  if (s > 0) zScore = (s - 1) / stdS;
  else if (s < 0) zScore = (s + 1) / stdS;

  const pValue = Math.max(1e-15, Math.min(1, erfc(Math.abs(zScore) / Math.SQRT2)));
  const tau = (2 * s) / (n * (n - 1));

  let significanceLevel: SignificanceLevel = "NOT_SIGNIFICANT";
  if (pValue < 0.01) significanceLevel = "HIGHLY_SIGNIFICANT";
  else if (pValue < 0.05) significanceLevel = "SIGNIFICANT";

  let direction: TrendDirection = "STABLE";
  if (s > 0) direction = "INCREASING";
  else if (s < 0) direction = "DECREASING";

  return {
    s,
    tau: Number(tau.toFixed(4)),
    varianceS,
    zScore: Number(zScore.toFixed(4)),
    pValue,
    significanceLevel,
    direction,
  };
}

/**
 * Theil-Sen median slope estimator converted to change per decade (x 120 months) with 95% confidence interval.
 */
export function sensSlopePerDecade(
  values: number[],
  varianceSOverride?: number
): SensSlopeOutput {
  const n = values.length;
  if (n < 4) {
    return { slopePerDecade: 0, confidenceInterval95: [0, 0] };
  }

  const pairCount = (n * (n - 1)) / 2;
  const slopes = new Float64Array(pairCount);
  let idx = 0;

  for (let i = 0; i < n - 1; i += 1) {
    const xi = values[i];
    for (let j = i + 1; j < n; j += 1) {
      slopes[idx] = (values[j] - xi) / (j - i);
      idx += 1;
    }
  }

  slopes.sort();

  const mid = Math.floor(pairCount / 2);
  const medianMonthly =
    pairCount % 2 === 1 ? slopes[mid] : (slopes[mid - 1] + slopes[mid]) / 2;

  const varianceS =
    varianceSOverride ?? (n * (n - 1) * (2 * n + 5)) / 18;
  const cAlpha = 1.96 * Math.sqrt(Math.max(1e-9, varianceS));
  const lowerIdx = Math.max(0, Math.min(pairCount - 1, Math.floor((pairCount - cAlpha) / 2)));
  const upperIdx = Math.max(
    lowerIdx,
    Math.min(pairCount - 1, Math.ceil((pairCount + cAlpha) / 2) - 1)
  );

  return {
    slopePerDecade: Number((medianMonthly * 120).toFixed(4)),
    confidenceInterval95: [
      Number((slopes[lowerIdx] * 120).toFixed(4)),
      Number((slopes[upperIdx] * 120).toFixed(4)),
    ],
  };
}

/**
 * O(n log n) rank-sum Pettitt Change-Point Detection to locate the sharpest regime shift date.
 */
export function pettittChangePoint(
  deseasonalizedZ: number[],
  dateLabels: string[]
): PettittOutput {
  const n = deseasonalizedZ.length;
  if (n < 6 || dateLabels.length !== n) {
    return {
      changePointDate: dateLabels[0] ?? "N/A",
      pettittStatistic: 0,
    };
  }

  // Assign average 1-based ranks for ties
  const indexed = deseasonalizedZ.map((val, idx) => ({ val, idx }));
  indexed.sort((a, b) => a.val - b.val);

  const ranks = new Float64Array(n);
  let i = 0;
  while (i < n) {
    let j = i;
    while (j + 1 < n && Math.abs(indexed[j + 1].val - indexed[i].val) <= 1e-12) {
      j += 1;
    }
    const avgRank = (i + 1 + (j + 1)) / 2;
    for (let k = i; k <= j; k += 1) {
      ranks[indexed[k].idx] = avgRank;
    }
    i = j + 1;
  }

  let runningRankSum = 0;
  let maxAbsU = -1;
  let bestIndex = 0;

  for (let t = 1; t < n; t += 1) {
    runningRankSum += ranks[t - 1];
    const u = 2 * runningRankSum - t * (n + 1);
    const absU = Math.abs(u);
    if (absU > maxAbsU) {
      maxAbsU = absU;
      bestIndex = t - 1;
    }
  }

  return {
    changePointDate: dateLabels[bestIndex] ?? "N/A",
    pettittStatistic: Math.round(maxAbsU),
  };
}

/**
 * Runs complete statistical evaluation for one NASA variable series.
 */
export function analyzeVariableSeries(
  variable: NasaVariableCode,
  rawPoints: RawMonthlyPoint[]
): TrendAnalysisResult {
  const meta = VARIABLE_META_FALLBACK[variable];
  if (rawPoints.length < 24) {
    return {
      variable,
      variableLabel: meta.label,
      unit: meta.unit,
      sampleCount: rawPoints.length,
      mannKendallTau: 0,
      zScore: 0,
      pValue: 1,
      significanceLevel: "NOT_SIGNIFICANT",
      direction: "STABLE",
      sensSlopePerDecade: 0,
      confidenceInterval95: [0, 0],
      changePointDate: "N/A",
      pettittStatistic: 0,
      series: [],
      isAvailable: false,
    };
  }

  const series = deseasonalizeMonthlySeries(rawPoints);
  const zValues = series.map((pt) => pt.deseasonalizedZ);
  const dateLabels = series.map((pt) => pt.dateLabel);
  const physicalAnomalies = computePhysicalAnomalies(rawPoints);

  const mk = mannKendallTest(zValues);
  const sen = sensSlopePerDecade(physicalAnomalies, mk.varianceS);
  const pettitt = pettittChangePoint(zValues, dateLabels);

  return {
    variable,
    variableLabel: meta.label,
    unit: meta.unit,
    sampleCount: series.length,
    mannKendallTau: mk.tau,
    zScore: mk.zScore,
    pValue: mk.pValue,
    significanceLevel: mk.significanceLevel,
    direction: mk.direction,
    sensSlopePerDecade: sen.slopePerDecade,
    confidenceInterval95: sen.confidenceInterval95,
    changePointDate: pettitt.changePointDate,
    pettittStatistic: pettitt.pettittStatistic,
    series,
    isAvailable: true,
  };
}

function alignObservationMaps(
  seriesX: MonthlyObservation[],
  seriesY: MonthlyObservation[]
): { xs: number[]; ys: number[] } {
  const yMap = new Map<string, number>();
  for (const pt of seriesY) {
    yMap.set(pt.dateLabel, pt.deseasonalizedZ);
  }
  const xs: number[] = [];
  const ys: number[] = [];
  for (const pt of seriesX) {
    const yVal = yMap.get(pt.dateLabel);
    if (yVal !== undefined) {
      xs.push(pt.deseasonalizedZ);
      ys.push(yVal);
    }
  }
  return { xs, ys };
}

function buildLagInterpretation(
  fromVar: NasaVariableCode,
  toVar: NasaVariableCode,
  lag: number,
  r: number,
  isSignificant: boolean
): string {
  const dir = r < 0 ? "inverse" : "positive";
  if (!isSignificant) {
    return `Weak ${dir} coupling (r = ${r.toFixed(2)}) at +${lag} mo lag between ${fromVar} and ${toVar}.`;
  }
  if (fromVar === "ALLSKY_SFC_SW_DWN" && toVar === "GWETROOT") {
    return `Increased solar irradiance precedes root-zone soil drying by ${lag} mo (r = ${r.toFixed(2)}).`;
  }
  if (fromVar === "GWETROOT" && toVar === "TS") {
    return `Root-zone soil moisture loss reduces evaporative cooling, driving surface warming +${lag} mo later (r = ${r.toFixed(2)}).`;
  }
  return `Surface thermal feedback shifts precipitation anomalies after +${lag} mo (r = ${r.toFixed(2)}).`;
}

/**
 * Computes the 4-node Water-Energy Lag-Cascade (lags 0..6 months) and evaluates Silent Ecological Stress.
 */
export function computeLagCascade(
  trendsA: Record<NasaVariableCode, TrendAnalysisResult>
): {
  links: LagCascadeLink[];
  silentEcologicalStressDetected: boolean;
  silentStressReason: string;
} {
  const pairs: Array<{
    from: NasaVariableCode;
    to: NasaVariableCode;
  }> = [
    { from: "ALLSKY_SFC_SW_DWN", to: "GWETROOT" },
    { from: "GWETROOT", to: "TS" },
    { from: "TS", to: "PRECTOTCORR" },
  ];

  const links: LagCascadeLink[] = pairs.map(({ from, to }) => {
    const trendFrom = trendsA[from];
    const trendTo = trendsA[to];
    const fromLabel = VARIABLE_META_FALLBACK[from].label;
    const toLabel = VARIABLE_META_FALLBACK[to].label;

    if (!trendFrom.isAvailable || !trendTo.isAvailable) {
      return {
        fromVariable: from,
        fromLabel,
        toVariable: to,
        toLabel,
        optimalLagMonths: 0,
        correlationR: 0,
        pValue: 1,
        isSignificant: false,
        interpretation: `Insufficient land observations for ${from} → ${to} link.`,
      };
    }

    const { xs, ys } = alignObservationMaps(trendFrom.series, trendTo.series);
    let bestLag = 0;
    let bestR = 0;
    let bestP = 1;

    for (let lag = 0; lag <= 6; lag += 1) {
      if (xs.length - lag < 24) continue;
      const xSlice = xs.slice(0, xs.length - lag);
      const ySlice = ys.slice(lag);
      const { r, pValue } = pearsonCorrelationWithPValue(xSlice, ySlice);
      if (Math.abs(r) > Math.abs(bestR)) {
        bestR = r;
        bestP = pValue;
        bestLag = lag;
      }
    }

    const isSignificant = bestP < 0.05;
    return {
      fromVariable: from,
      fromLabel,
      toVariable: to,
      toLabel,
      optimalLagMonths: bestLag,
      correlationR: Number(bestR.toFixed(3)),
      pValue: bestP,
      isSignificant,
      interpretation: buildLagInterpretation(from, to, bestLag, bestR, isSignificant),
    };
  });

  const soil = trendsA.GWETROOT;
  const precip = trendsA.PRECTOTCORR;
  const solarToSoil = links[0];

  const soilDeclining =
    soil.isAvailable && soil.direction === "DECREASING" && soil.pValue < 0.01;
  const precipNotDeclining =
    precip.direction !== "DECREASING" || precip.pValue >= 0.05;
  const strongSolarLead =
    solarToSoil.optimalLagMonths >= 1 &&
    solarToSoil.isSignificant &&
    precip.pValue >= 0.01;

  const silentEcologicalStressDetected = Boolean(
    soilDeclining && (precipNotDeclining || strongSolarLead)
  );

  let silentStressReason =
    "No silent ecological decoupling detected: root-zone soil wetness and precipitation evolve synchronously.";
  if (!soil.isAvailable) {
    silentStressReason =
      "Root-zone soil wetness (GWETROOT) is unavailable over this ocean grid cell; silent terrestrial stress check bypassed.";
  } else if (silentEcologicalStressDetected) {
    silentStressReason =
      `Root-zone soil wetness (GWETROOT) is declining sharply (τ = ${soil.mannKendallTau.toFixed(2)}, ` +
      `p = ${soil.pValue.toExponential(2)}) +${solarToSoil.optimalLagMonths} mo after solar irradiance spikes, ` +
      `while total precipitation trend remains non-significant (p = ${precip.pValue.toFixed(3)}).`;
  } else if (soilDeclining) {
    silentStressReason =
      `Both root-zone soil wetness (p = ${soil.pValue.toExponential(2)}) and precipitation ` +
      `(p = ${precip.pValue.toExponential(2)}) show concurrent statistically significant drying.`;
  }

  return {
    links,
    silentEcologicalStressDetected,
    silentStressReason,
  };
}

/**
 * Evaluates NASA GISTEMP v4 reference series dynamically using the exact same statistical engine.
 * (In Session 2, this is invoked with the real GISTEMP_V4_MONTHLY_1985_2025 series.)
 */
export function runGistempCrossValidation(
  gistempPoints: RawMonthlyPoint[],
  publishedReferenceSlopePerDecade = 0.23
): GistempBenchmarkResult {
  if (gistempPoints.length < 24) {
    return {
      datasetName: "NASA GISTEMP v4 Global Surface Temperature Anomaly",
      period: "1985–2025",
      computedSlopePerDecade: 0,
      publishedReferenceSlopePerDecade,
      mannKendallTau: 0,
      mannKendallPValue: 1,
      deviationPct: 0,
      isCalibrated: false,
    };
  }

  const values = gistempPoints.map((pt) => pt.rawValue);
  const mk = mannKendallTest(values);
  const sen = sensSlopePerDecade(values, mk.varianceS);

  const denom = Math.max(Math.abs(publishedReferenceSlopePerDecade), 1e-6);
  const deviationPct = Number(
    ((Math.abs(sen.slopePerDecade - publishedReferenceSlopePerDecade) / denom) * 100).toFixed(2)
  );

  const firstYear = gistempPoints[0].year;
  const lastYear = gistempPoints[gistempPoints.length - 1].year;

  return {
    datasetName: "NASA GISTEMP v4 Global Surface Temperature Anomaly",
    period: `${firstYear}–${lastYear}`,
    computedSlopePerDecade: sen.slopePerDecade,
    publishedReferenceSlopePerDecade,
    mannKendallTau: mk.tau,
    mannKendallPValue: mk.pValue,
    deviationPct,
    isCalibrated: mk.pValue < 0.001 && deviationPct <= 15,
  };
}

function getPrimaryVariableForSymptom(
  symptom: SymptomId,
  gwetAvailableA: boolean,
  gwetAvailableB: boolean
): NasaVariableCode {
  if (symptom === "peatland_drying") {
    return gwetAvailableA && gwetAvailableB ? "GWETROOT" : "TS";
  }
  if (symptom === "extreme_flood_dipole") {
    return "PRECTOTCORR";
  }
  if (symptom === "custom_exploration") {
    return "TS";
  }
  return "PRECTOTCORR";
}

export interface BuildReportParams {
  caseId: string;
  title: string;
  climateDriverTag: string;
  dataSourceTag: "CACHED_NASA_POWER_V2" | "LIVE_NASA_POWER_V2";
  symptom: SymptomId;
  ecosystem: EcosystemType;
  startYear: number;
  endYear: number;
  regionA: RegionCoordinates;
  regionB: RegionCoordinates;
  seriesA: RegionVariableSeries;
  seriesB: RegionVariableSeries;
  oceanFallbackNotice?: string;
  gistempValidation?: GistempBenchmarkResult;
}

/**
 * Orchestrates full deterministic analysis across Region A and Region B.
 */
export function buildDualRegionReport(
  params: BuildReportParams
): DualRegionAnalysisReport {
  const codes: NasaVariableCode[] = [
    "ALLSKY_SFC_SW_DWN",
    "GWETROOT",
    "TS",
    "PRECTOTCORR",
    "T2M",
  ];

  const trendsA = {} as Record<NasaVariableCode, TrendAnalysisResult>;
  const trendsB = {} as Record<NasaVariableCode, TrendAnalysisResult>;

  for (const code of codes) {
    trendsA[code] = analyzeVariableSeries(code, params.seriesA[code]);
    trendsB[code] = analyzeVariableSeries(code, params.seriesB[code]);
  }

  const primaryVariable = getPrimaryVariableForSymptom(
    params.symptom,
    trendsA.GWETROOT.isAvailable,
    trendsB.GWETROOT.isAvailable
  );

  const alignedDipole = alignObservationMaps(
    trendsA[primaryVariable].series,
    trendsB[primaryVariable].series
  );
  const { r: dipoleCorrelationR, pValue: dipolePValue } =
    pearsonCorrelationWithPValue(alignedDipole.xs, alignedDipole.ys);

  const dirA = trendsA[primaryVariable].direction;
  const dirB = trendsB[primaryVariable].direction;
  const oppositeSlopes =
    dirA !== "STABLE" && dirB !== "STABLE" && dirA !== dirB;
  const negativeDipole = dipoleCorrelationR < -0.2 && dipolePValue < 0.05;
  const isOppositeDirection = oppositeSlopes || negativeDipole;

  const cascade = computeLagCascade(trendsA);

  const defaultGistemp: GistempBenchmarkResult = params.gistempValidation ?? {
    datasetName: "NASA GISTEMP v4 Global Surface Temperature Anomaly",
    period: `${params.startYear}–${params.endYear}`,
    computedSlopePerDecade: 0,
    publishedReferenceSlopePerDecade: 0.23,
    mannKendallTau: 0,
    mannKendallPValue: 1,
    deviationPct: 0,
    isCalibrated: false,
  };

  return {
    caseId: params.caseId,
    title: params.title,
    climateDriverTag: params.climateDriverTag,
    dataSourceTag: params.dataSourceTag,
    symptom: params.symptom,
    ecosystem: params.ecosystem,
    startYear: params.startYear,
    endYear: params.endYear,
    regionA: params.regionA,
    regionB: params.regionB,
    trendsA,
    trendsB,
    primaryVariable,
    dipoleCorrelationR,
    dipolePValue,
    isOppositeDirection,
    lagCascadeA: cascade.links,
    silentEcologicalStressDetected: cascade.silentEcologicalStressDetected,
    silentStressReason: cascade.silentStressReason,
    oceanFallbackNotice: params.oceanFallbackNotice,
    gistempValidation: defaultGistemp,
  };
}
