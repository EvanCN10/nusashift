export type NasaVariableCode =
  | "ALLSKY_SFC_SW_DWN"
  | "GWETROOT"
  | "TS"
  | "PRECTOTCORR"
  | "T2M";

export type SymptomId =
  | "coastal_drought"
  | "peatland_drying"
  | "extreme_flood_dipole"
  | "custom_exploration";

export type EcosystemType =
  | "maritime_tropics"
  | "tropical_peatland"
  | "semi_arid_basin"
  | "coastal_delta";

export type ViewLayerMode = "overview" | "lag_cascade" | "citizen" | "scientific";

export type PhysicalRole =
  | "Energy Driver"
  | "Silent Stress Indicator"
  | "Thermal Feedback"
  | "Hydrological Output"
  | "Cross-Validation";

export interface NasaVariableMeta {
  code: NasaVariableCode;
  label: string;
  shortLabel: string;
  unit: string;
  physicalRole: PhysicalRole;
  studentDefinition: string;
  nasaInstrumentHeritage: string;
}

export interface SymptomPreset {
  id: SymptomId;
  label: string;
  shortLabel: string;
  description: string;
  defaultEcosystem: EcosystemType;
  primaryVariable: NasaVariableCode;
  mappedVariables: NasaVariableCode[];
}

export interface RegionCoordinates {
  name: string;
  country: string;
  lat: number;
  lon: number;
  isOceanGrid?: boolean;
}

export interface RawMonthlyPoint {
  year: number;
  month: number; // 1..12
  dateLabel: string; // "YYYY-MM"
  rawValue: number;
}

export interface MonthlyObservation extends RawMonthlyPoint {
  deseasonalizedZ: number; // Monthly Z-score anomaly
}

export type SignificanceLevel =
  | "HIGHLY_SIGNIFICANT"
  | "SIGNIFICANT"
  | "NOT_SIGNIFICANT";

export type TrendDirection = "INCREASING" | "DECREASING" | "STABLE";

export interface TrendAnalysisResult {
  variable: NasaVariableCode;
  variableLabel: string;
  unit: string;
  sampleCount: number;
  mannKendallTau: number;
  zScore: number;
  pValue: number;
  significanceLevel: SignificanceLevel;
  direction: TrendDirection;
  sensSlopePerDecade: number;
  confidenceInterval95: [number, number];
  changePointDate: string; // "YYYY-MM"
  pettittStatistic: number;
  series: MonthlyObservation[];
  isAvailable: boolean;
}

export interface LagCascadeLink {
  fromVariable: NasaVariableCode;
  fromLabel: string;
  toVariable: NasaVariableCode;
  toLabel: string;
  optimalLagMonths: number; // 0..6
  correlationR: number;
  pValue: number;
  isSignificant: boolean;
  interpretation: string;
}

export interface GistempBenchmarkResult {
  datasetName: string;
  period: string;
  computedSlopePerDecade: number;
  publishedReferenceSlopePerDecade: number;
  mannKendallTau: number;
  mannKendallPValue: number;
  deviationPct: number;
  isCalibrated: boolean;
}

export interface DualRegionAnalysisReport {
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
  trendsA: Record<NasaVariableCode, TrendAnalysisResult>;
  trendsB: Record<NasaVariableCode, TrendAnalysisResult>;
  primaryVariable: NasaVariableCode;
  dipoleCorrelationR: number;
  dipolePValue: number;
  isOppositeDirection: boolean;
  lagCascadeA: LagCascadeLink[];
  silentEcologicalStressDetected: boolean;
  silentStressReason: string;
  oceanFallbackNotice?: string;
  gistempValidation: GistempBenchmarkResult;
}

export interface CausalExplanationResponse {
  headline: string;
  physicalMechanism: string[];
  mitigationActions: string[];
  source: "gemini_flash" | "gemini_3_8_flash" | "deterministic_fallback";
  modelUsed?: string;
}

export interface TrendSummary {
  isAvailable: boolean;
  mannKendallTau: number;
  pValue: number;
  significanceLevel: SignificanceLevel;
  direction: TrendDirection;
  sensSlopePerDecade: number;
  unit: string;
  changePointDate: string;
}

export interface CausalReportSummary {
  caseId: string;
  title: string;
  climateDriverTag: string;
  symptom: SymptomId;
  ecosystem: EcosystemType;
  period: string;
  regionA: RegionCoordinates;
  regionB: RegionCoordinates;
  primaryVariable: NasaVariableCode;
  dipoleCorrelationR: number;
  dipolePValue: number;
  isOppositeDirection: boolean;
  silentEcologicalStressDetected: boolean;
  silentStressReason: string;
  lagCascadeA: LagCascadeLink[];
  trendsA: Record<NasaVariableCode, TrendSummary>;
  trendsB: Record<NasaVariableCode, TrendSummary>;
  gistempValidation: GistempBenchmarkResult;
}

export type RegionVariableSeries = Record<NasaVariableCode, RawMonthlyPoint[]>;
