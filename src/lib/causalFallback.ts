import type {
  CausalExplanationResponse,
  CausalReportSummary,
  DualRegionAnalysisReport,
} from "@/types/climate";

type ReportOrSummary = DualRegionAnalysisReport | CausalReportSummary;

function formatP(p: number): string {
  return p < 0.001 ? p.toExponential(2) : p.toFixed(3);
}

function selectMitigationActions(report: ReportOrSummary): string[] {
  if (report.regionA.isOceanGrid || report.regionB.isOceanGrid) {
    return [
      "Track coupled sea-skin temperature (TS) anomalies and pelagic rainfall gradients across the ocean-atmosphere boundary using NASA POWER / GPM IMERG feeds.",
      "Pre-position coastal precipitation and storm-surge advisories along downwind shorelines linked to this maritime heating corridor.",
      "Pair ocean surface thermal monitoring with coastal terrestrial watershed gauges where land root-zone moisture (GWETROOT) responds with 1–2 month lag.",
    ];
  }

  if (
    report.caseId === "silent-murray-kalimantan" ||
    report.caseId === "enso-kalimantan-peru"
  ) {
    return [
      `Trigger irrigation allocation and soil-moisture conservation in ${report.regionA.name} when GWETROOT anomalies drop below Z = -1.0, rather than waiting for monthly precipitation indices to confirm drought.`,
      "Deploy ground evapotranspiration buffers (residue mulching, sub-surface drip) +1 mo after elevated solar irradiance (ALLSKY_SFC_SW_DWN) spikes.",
      `Cross-track Maritime Continent convective moisture buildup in ${report.regionB.name} to anticipate opposing basin pressure regimes across the Indo-Australian corridor.`,
    ];
  }

  if (
    report.caseId === "java-water-energy" ||
    report.caseId === "brantas-water-energy" ||
    report.ecosystem === "coastal_delta"
  ) {
    return [
      `Synchronize reservoir releases between ${report.regionA.name} and ${report.regionB.name} using +1 mo solar-to-soil lead warnings ahead of peak dry-season thermal demand.`,
      "Deploy heat-stress and evaporative-loss advisories for East and West Java paddy corridors when root-zone soil wetness falls sharply while skin temperature (TS) rises.",
      "Schedule drought-tolerant crop rotation windows around positive irradiance anomalies captured in NASA POWER telemetry.",
    ];
  }

  if (report.ecosystem === "tropical_peatland") {
    return [
      "Trigger peatland canal-blocking and groundwater rewetting +1 mo after elevated solar irradiance (ALLSKY_SFC_SW_DWN) appears, before rainfall deficits materialize.",
      "Establish high-frequency fire-hotspot patrols over peat domes where root-zone wetness (GWETROOT) drops below its Pettitt regime threshold.",
      "Coordinate water-table monitoring with ENSO / IOD teleconnection advisories to preserve subsurface moisture prior to dry-season onset.",
    ];
  }

  if (report.silentEcologicalStressDetected) {
    return [
      `Activate early drought buffer measures in ${report.regionA.name} immediately based on GWETROOT depletion without waiting for monthly precipitation averages to collapse.`,
      "Prioritize soil-moisture retention mulching and micro-irrigation scheduling to reduce surface skin heating (TS) during high-irradiance anomalies.",
      "Integrate root-zone satellite wetness thresholds into local watershed contingency plans alongside traditional rainfall gauges.",
    ];
  }

  return [
    `Couple ${report.regionA.name} drought contingency reserves with ${report.climateDriverTag} teleconnection forecasts tracked against ${report.regionB.name}.`,
    "Shift reservoir storage and agricultural planting calendars ahead of the post-breakpoint dry-regime acceleration window.",
    "Cross-reference local irrigation telemetry with NASA POWER deseasonalized anomalies to distinguish long-term regime shifts from normal seasonal cycles.",
  ];
}

/**
 * Deterministic physics-based causal narrative generator used when GEMINI_API_KEY is absent,
 * rate-limited, or exceeds the 2.8s latency ceiling. Never invents statistical numbers.
 */
export function generateDeterministicCausalBrief(
  report: ReportOrSummary
): CausalExplanationResponse {
  const primary = report.primaryVariable;
  const tA = report.trendsA[primary];
  const tB = report.trendsB[primary];
  const gwetA = report.trendsA.GWETROOT;
  const linkSolarSoil = report.lagCascadeA[0];
  const linkSoilTs = report.lagCascadeA[1];

  const regimeText = report.isOppositeDirection
    ? "Opposite-Sign Climate Dipole Confirmed"
    : "Coupled Water-Energy Regime Shift";

  const headline = report.silentEcologicalStressDetected
    ? `Silent Ecological Stress in ${report.regionA.name} Precedes Rainfall Decline (${regimeText})`
    : `${regimeText}: ${report.regionA.name} vs. ${report.regionB.name}`;

  const mechanism1 =
    `Deseasonalized Mann-Kendall analysis of ${primary} shows a ${tA.direction.toLowerCase()} trajectory in ${report.regionA.name} ` +
    `(τ = ${tA.mannKendallTau.toFixed(3)}, Sen's slope = ${tA.sensSlopePerDecade > 0 ? "+" : ""}${tA.sensSlopePerDecade.toFixed(3)} ${tA.unit}/decade, ` +
    `p = ${formatP(tA.pValue)}) with a Pettitt change-point at ${tA.changePointDate}.`;

  const mechanism2 = report.isOppositeDirection
    ? `Across the paired teleconnection, ${report.regionB.name} exhibits an inverse response ` +
      `(τ = ${tB.mannKendallTau.toFixed(3)}, p = ${formatP(tB.pValue)}), producing an inter-regional dipole correlation of ` +
      `r = ${report.dipoleCorrelationR.toFixed(3)} (p = ${formatP(report.dipolePValue)}) under ${report.climateDriverTag}.`
    : `Paired analysis with ${report.regionB.name} yields synchronous regional coupling ` +
      `(r = ${report.dipoleCorrelationR.toFixed(3)}, p = ${formatP(report.dipolePValue)}) with ${report.regionB.name} ` +
      `trending ${tB.direction.toLowerCase()} (τ = ${tB.mannKendallTau.toFixed(3)}).`;

  const mechanism3 = gwetA.isAvailable && linkSolarSoil && linkSoilTs
    ? `Water-energy lag-cascade analysis confirms solar irradiance anomalies lead root-zone wetness (GWETROOT) by ` +
      `+${linkSolarSoil.optimalLagMonths} mo (r = ${linkSolarSoil.correlationR.toFixed(2)}), while declining soil wetness ` +
      `(τ = ${gwetA.mannKendallTau.toFixed(3)}, p = ${formatP(gwetA.pValue)}) amplifies skin temperature +${linkSoilTs.optimalLagMonths} mo later ` +
      `(r = ${linkSoilTs.correlationR.toFixed(2)}).`
    : `Thermal-hydrological coupling across ${report.regionA.name} remains anchored to ${report.climateDriverTag} energy forcing ` +
      `over the ${"period" in report ? report.period : `${report.startYear}-${report.endYear}`} record.`;

  return {
    headline,
    physicalMechanism: [mechanism1, mechanism2, mechanism3],
    mitigationActions: selectMitigationActions(report),
    source: "deterministic_fallback",
  };
}
