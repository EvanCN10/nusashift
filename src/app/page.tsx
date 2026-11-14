"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Compass, Loader2, Sprout } from "lucide-react";
import BoundedAiBrief from "@/components/BoundedAiBrief";
import DualRegionCharts from "@/components/DualRegionCharts";
import HypothesisTriage from "@/components/HypothesisTriage";
import InteractiveWorldMap from "@/components/InteractiveWorldMap";
import LagCascadePanel from "@/components/LagCascadePanel";
import NavbarHeader from "@/components/NavbarHeader";
import ScientificProofDrawer from "@/components/ScientificProofDrawer";
import {
  CURATED_CASES,
  getPrecomputedCaseReport,
} from "@/data/cachedCases";
import {
  NASA_VARIABLES,
  SYMPTOM_PRESETS,
  WINDOW_OPTIONS,
} from "@/data/nasaVariables";
import { generateDeterministicCausalBrief } from "@/lib/causalFallback";
import { formatDMS } from "@/lib/nasaPowerClient";
import type {
  CausalExplanationResponse,
  DualRegionAnalysisReport,
  EcosystemType,
  NasaVariableCode,
  SymptomId,
  ViewLayerMode,
} from "@/types/climate";

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

const VALID_VIEWS = new Set<ViewLayerMode>([
  "overview",
  "lag_cascade",
  "citizen",
  "scientific",
]);

function buildQueryParams(
  report: DualRegionAnalysisReport,
  viewMode: ViewLayerMode
): string {
  const params = new URLSearchParams();
  const isCurated = CURATED_CASES.some((c) => c.caseId === report.caseId);

  if (isCurated) {
    params.set("case", report.caseId);
  } else {
    params.set("latA", report.regionA.lat.toFixed(2));
    params.set("lonA", report.regionA.lon.toFixed(2));
    params.set("latB", report.regionB.lat.toFixed(2));
    params.set("lonB", report.regionB.lon.toFixed(2));
  }

  params.set("symptom", report.symptom);
  params.set("ecosystem", report.ecosystem);
  params.set("startYear", String(report.startYear));
  params.set("endYear", String(report.endYear));
  if (viewMode !== "overview") {
    params.set("view", viewMode);
  }

  return `?${params.toString()}`;
}

function legacyExecCopy(text: string): boolean {
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.cssText = "position:fixed;inset-block-start:0;opacity:0";
  document.body.append(field);
  field.select();
  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    field.remove();
  }
}

function buildMarkdownBrief(
  report: DualRegionAnalysisReport,
  brief: CausalExplanationResponse
): string {
  const varOrder: NasaVariableCode[] = [
    "ALLSKY_SFC_SW_DWN",
    "GWETROOT",
    "TS",
    "PRECTOTCORR",
    "T2M",
  ];

  const matrixLines = varOrder.flatMap((code) => {
    const entries = [
      { label: `Region A (${report.regionA.name})`, trend: report.trendsA[code] },
      { label: `Region B (${report.regionB.name})`, trend: report.trendsB[code] },
    ];
    return entries.map(({ label, trend }) => {
      if (!trend.isAvailable) {
        return `| ${code} | ${label} | ${trend.sampleCount} | N/A | N/A | Ocean Grid N/A | — | — |`;
      }
      const pStr =
        trend.pValue < 0.001 ? trend.pValue.toExponential(2) : trend.pValue.toFixed(4);
      const ciStr = `[${trend.confidenceInterval95[0].toFixed(4)}, ${trend.confidenceInterval95[1].toFixed(4)}]`;
      return `| ${code} | ${label} | ${trend.sampleCount} | ${trend.mannKendallTau.toFixed(3)} | ${pStr} | ${trend.sensSlopePerDecade.toFixed(4)} ${trend.unit}/dec | ${ciStr} | ${trend.changePointDate} (K=${Math.round(trend.pettittStatistic)}) |`;
    });
  });

  const cascadeLines = report.lagCascadeA.map(
    (link) =>
      `- **${link.fromVariable} -> ${link.toVariable}:** +${link.optimalLagMonths} mo lag, r = ${link.correlationR.toFixed(3)}, p = ${link.pValue.toExponential(2)} (${link.interpretation})`
  );

  const gv = report.gistempValidation;

  return [
    `# NusaShift Scientific Briefing Report`,
    ``,
    `- **Investigation:** ${report.title}`,
    `- **Case ID:** ${report.caseId}`,
    `- **Climate Driver:** ${report.climateDriverTag}`,
    `- **Observation Window:** ${report.startYear}–${report.endYear}`,
    `- **Data Feed:** ${report.dataSourceTag}`,
    `- **Region A (Target):** ${report.regionA.name} (${formatDMS(report.regionA.lat, report.regionA.lon)})`,
    `- **Region B (Paired):** ${report.regionB.name} (${formatDMS(report.regionB.lat, report.regionB.lon)})`,
    `- **Dipole Correlation:** r = ${report.dipoleCorrelationR.toFixed(3)}, p = ${report.dipolePValue.toExponential(2)}, Opposite-Sign = ${report.isOppositeDirection ? "YES" : "NO"}`,
    `- **Silent Ecological Stress:** ${report.silentEcologicalStressDetected ? "DETECTED" : "NOT DETECTED"} — ${report.silentStressReason}`,
    ``,
    `## Causal Synthesis (${brief.source})`,
    `### ${brief.headline}`,
    ``,
    `### Physical Teleconnection Mechanism`,
    ...brief.physicalMechanism.map((m) => `- ${m}`),
    ``,
    `### Regional Mitigation Recommendations`,
    ...brief.mitigationActions.map((a) => `- ${a}`),
    ``,
    `## Water-Energy Lag-Cascade (Region A)`,
    ...cascadeLines,
    ``,
    `## Non-Parametric Statistical Proof Matrix (Deseasonalized Monthly Anomalies)`,
    `| Variable | Region | N | Mann-Kendall tau | p-value | Sen's Slope / Decade | 95% CI | Pettitt Shift |`,
    `| :--- | :--- | ---: | ---: | ---: | ---: | :--- | :--- |`,
    ...matrixLines,
    ``,
    `## NASA GISTEMP v4 Cross-Validation`,
    `- **Dataset:** ${gv.datasetName} (${gv.period})`,
    `- **Published Reference Slope:** +${gv.publishedReferenceSlopePerDecade.toFixed(4)} °C/decade`,
    `- **Engine Computed Slope:** +${gv.computedSlopePerDecade.toFixed(4)} °C/decade`,
    `- **Calibration Deviation:** ${gv.deviationPct.toFixed(2)}% (Calibrated: ${gv.isCalibrated ? "YES" : "NO"})`,
    `- **GISTEMP Mann-Kendall tau:** ${gv.mannKendallTau.toFixed(3)} (p = ${gv.mannKendallPValue.toExponential(2)})`,
    ``,
  ].join("\n");
}

function buildCitizenTakeaway(report: DualRegionAnalysisReport): string {
  const gwetA = report.trendsA.GWETROOT;
  const precA = report.trendsA.PRECTOTCORR;
  const primaryA = report.trendsA[report.primaryVariable];

  if (report.silentEcologicalStressDetected) {
    return (
      `Even though monthly rain charts in ${report.regionA.name} still swing up and down like normal seasons ` +
      `(rainfall change is not statistically clear yet, p = ${precA.pValue.toFixed(2)}), satellite root-zone sensors show ` +
      `soil water 1 meter underground has already been drying significantly since ${gwetA.changePointDate}. ` +
      `Farmers and water managers cannot wait for an empty rain gauge before conserving soil moisture or rewetting peatlands.`
    );
  }

  if (report.isOppositeDirection) {
    return (
      `While ${report.regionA.name} shifted toward hotter, drier conditions around ${primaryA.changePointDate} ` +
      `(${NASA_VARIABLES[report.primaryVariable].shortLabel}), ${report.regionB.name} across the ocean moved in the opposite direction ` +
      `(dipole correlation r = ${report.dipoleCorrelationR.toFixed(2)}). When Indian Ocean or Pacific climate swings intensify, ` +
      `communities on the drying side should lock in reservoir storage early rather than relying on last year's planting calendar.`
    );
  }

  return (
    `Satellite records over ${report.startYear}–${report.endYear} show ${report.regionA.name} and ${report.regionB.name} ` +
    `experiencing coupled water-energy stress centered around ${primaryA.changePointDate}. Tracking root-zone moisture alongside ` +
    `surface skin heat gives local watersheds an earlier seasonal warning than rainfall totals alone.`
  );
}

export default function NusaShiftDashboardPage() {
  const [report, setReport] = useState<DualRegionAnalysisReport>(() =>
    getPrecomputedCaseReport(CURATED_CASES[0].caseId)
  );
  const [activeVariable, setActiveVariable] = useState<NasaVariableCode>(
    () => SYMPTOM_PRESETS[CURATED_CASES[0].defaultSymptom].primaryVariable
  );
  const [viewMode, setViewMode] = useState<ViewLayerMode>("overview");
  const [activePinMode, setActivePinMode] = useState<"A" | "B">("A");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isProofOpen, setIsProofOpen] = useState(false);
  const [activeBrief, setActiveBrief] = useState<CausalExplanationResponse | null>(
    null
  );
  const hydratedRef = useRef(false);

  const syncUrl = useCallback(
    (nextReport: DualRegionAnalysisReport, nextView: ViewLayerMode) => {
      if (typeof window === "undefined") return;
      const query = buildQueryParams(nextReport, nextView);
      window.history.replaceState(null, "", `${window.location.pathname}${query}`);
    },
    []
  );

  const runLiveAnalyze = useCallback(
    async (payload: {
      caseId?: string;
      startYear: number;
      endYear: number;
      symptom: SymptomId;
      ecosystem: EcosystemType;
      regionA?: { name: string; country: string; lat: number; lon: number };
      regionB?: { name: string; country: string; lat: number; lon: number };
    }, targetView?: ViewLayerMode) => {
      setIsAnalyzing(true);
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const nextReport = (await res.json()) as DualRegionAnalysisReport;
        setReport(nextReport);
        setActiveVariable(nextReport.primaryVariable);
        syncUrl(nextReport, targetView ?? viewMode);
      } catch {
        // Resilient fallback if client request fails
      } finally {
        setIsAnalyzing(false);
      }
    },
    [syncUrl, viewMode]
  );

  // Hydrate shared investigations from URL query parameters on mount
  useEffect(() => {
    if (hydratedRef.current || typeof window === "undefined") return;
    hydratedRef.current = true;

    const sp = new URLSearchParams(window.location.search);
    if (sp.toString().length === 0) return;

    const rawView = sp.get("view") as ViewLayerMode | null;
    const restoredView: ViewLayerMode =
      rawView && VALID_VIEWS.has(rawView) ? rawView : "overview";

    const rawSymptom = sp.get("symptom") as SymptomId | null;
    const symptom: SymptomId | undefined =
      rawSymptom && VALID_SYMPTOMS.has(rawSymptom) ? rawSymptom : undefined;

    const rawEcosystem = sp.get("ecosystem") as EcosystemType | null;
    const ecosystem: EcosystemType | undefined =
      rawEcosystem && VALID_ECOSYSTEMS.has(rawEcosystem)
        ? rawEcosystem
        : undefined;

    const winParam = sp.get("window");
    const matchedWin = WINDOW_OPTIONS.find((w) => w.id === winParam);
    const startYear = matchedWin?.startYear ?? Number(sp.get("startYear") || 1985);
    const endYear = matchedWin?.endYear ?? Number(sp.get("endYear") || 2025);

    const latA = Number(sp.get("latA"));
    const lonA = Number(sp.get("lonA"));
    const latB = Number(sp.get("latB"));
    const lonB = Number(sp.get("lonB"));
    const hasCoords =
      sp.has("latA") &&
      sp.has("lonA") &&
      sp.has("latB") &&
      sp.has("lonB") &&
      Number.isFinite(latA) &&
      Number.isFinite(lonA) &&
      Number.isFinite(latB) &&
      Number.isFinite(lonB);

    const caseParam = sp.get("case") ?? CURATED_CASES[0].caseId;

    void Promise.resolve().then(async () => {
      if (restoredView !== "overview") {
        setViewMode(restoredView);
        if (restoredView === "scientific") setIsProofOpen(true);
      }

      if (hasCoords) {
        const resolvedSymptom = symptom ?? "custom_exploration";
        const resolvedEco =
          ecosystem ?? SYMPTOM_PRESETS[resolvedSymptom].defaultEcosystem;
        await runLiveAnalyze(
          {
            caseId: "live-custom-pair",
            startYear,
            endYear,
            symptom: resolvedSymptom,
            ecosystem: resolvedEco,
            regionA: {
              name: `Target A (${latA.toFixed(2)}°, ${lonA.toFixed(2)}°)`,
              country: "Shared Coordinate",
              lat: latA,
              lon: lonA,
            },
            regionB: {
              name: `Target B (${latB.toFixed(2)}°, ${lonB.toFixed(2)}°)`,
              country: "Shared Coordinate",
              lat: latB,
              lon: lonB,
            },
          },
          restoredView
        );
        return;
      }

      const restored = getPrecomputedCaseReport(
        caseParam,
        Number.isFinite(startYear) ? startYear : 1985,
        Number.isFinite(endYear) ? endYear : 2025,
        symptom,
        ecosystem
      );
      setReport(restored);
      setActiveVariable(restored.primaryVariable);
    });
  }, [runLiveAnalyze]);

  const handleViewModeChange = useCallback(
    (mode: ViewLayerMode) => {
      setViewMode(mode);
      syncUrl(report, mode);
      if (mode === "scientific") {
        setIsProofOpen(true);
      }

      if (typeof window !== "undefined") {
        const reduced = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;
        const behavior: ScrollBehavior = reduced ? "auto" : "smooth";

        if (mode === "scientific") {
          setTimeout(() => {
            document
              .getElementById("scientific-proof-section")
              ?.scrollIntoView({ behavior, block: "nearest" });
          }, 40);
        } else if (mode === "lag_cascade") {
          document
            .getElementById("lag-cascade-section")
            ?.scrollIntoView({ behavior, block: "nearest" });
        }
      }
    },
    [report, syncUrl]
  );

  const handleSelectCase = useCallback(
    (caseId: string) => {
      const nextReport = getPrecomputedCaseReport(
        caseId,
        report.startYear,
        report.endYear
      );
      setReport(nextReport);
      setActiveVariable(nextReport.primaryVariable);
      syncUrl(nextReport, viewMode);
    },
    [report.endYear, report.startYear, syncUrl, viewMode]
  );

  const handleUpdateParameters = useCallback(
    (updates: {
      symptom?: SymptomId;
      ecosystem?: EcosystemType;
      startYear?: number;
      endYear?: number;
    }) => {
      const nextSymptom = updates.symptom ?? report.symptom;
      const nextEcosystem =
        updates.ecosystem ??
        (updates.symptom
          ? SYMPTOM_PRESETS[updates.symptom].defaultEcosystem
          : report.ecosystem);
      const nextStart = updates.startYear ?? report.startYear;
      const nextEnd = updates.endYear ?? report.endYear;

      const isCurated = CURATED_CASES.some((c) => c.caseId === report.caseId);
      if (isCurated) {
        const nextReport = getPrecomputedCaseReport(
          report.caseId,
          nextStart,
          nextEnd,
          nextSymptom,
          nextEcosystem
        );
        setReport(nextReport);
        if (updates.symptom) {
          setActiveVariable(nextReport.primaryVariable);
        }
        syncUrl(nextReport, viewMode);
        return;
      }

      void runLiveAnalyze({
        caseId: report.caseId,
        startYear: nextStart,
        endYear: nextEnd,
        symptom: nextSymptom,
        ecosystem: nextEcosystem,
        regionA: report.regionA,
        regionB: report.regionB,
      });
    },
    [report, runLiveAnalyze, syncUrl, viewMode]
  );

  const handleMapClickCoordinate = useCallback(
    (lat: number, lon: number) => {
      const newPoint = {
        name: `Probe ${activePinMode} (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
        country: "NASA POWER Live Grid",
        lat,
        lon,
      };
      const regionA = activePinMode === "A" ? newPoint : report.regionA;
      const regionB = activePinMode === "B" ? newPoint : report.regionB;

      void runLiveAnalyze({
        caseId: "live-custom-pair",
        startYear: report.startYear,
        endYear: report.endYear,
        symptom: report.symptom,
        ecosystem: report.ecosystem,
        regionA,
        regionB,
      });
    },
    [activePinMode, report, runLiveAnalyze]
  );

  const handleShareUrl = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined") return false;
    const query = buildQueryParams(report, viewMode);
    const fullUrl = `${window.location.origin}${window.location.pathname}${query}`;
    window.history.replaceState(null, "", `${window.location.pathname}${query}`);

    try {
      await navigator.clipboard.writeText(fullUrl);
      return true;
    } catch {
      return legacyExecCopy(fullUrl);
    }
  }, [report, viewMode]);

  const effectiveBrief = useMemo(
    () => activeBrief ?? generateDeterministicCausalBrief(report),
    [activeBrief, report]
  );

  const handleExportBrief = useCallback(() => {
    const markdown = buildMarkdownBrief(report, effectiveBrief);
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nusashift-${report.caseId}-${report.startYear}-${report.endYear}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [effectiveBrief, report]);

  return (
    <div className="min-h-screen tactical-grid-bg bg-canvas-900 text-ink-primary">
      <main className="max-w-[1600px] mx-auto px-3 sm:px-4 py-3.5 space-y-3.5">
        {/* Top Command Header */}
        <NavbarHeader
          report={report}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          onShareUrl={handleShareUrl}
          onExportBrief={handleExportBrief}
        />

        {/* Live Telemetry Query Status */}
        {isAnalyzing ? (
          <div
            role="status"
            aria-live="polite"
            className="hud-panel rounded-lg px-3.5 py-2 border border-dipole-cyan/40 text-xs font-mono text-dipole-cyan flex items-center gap-2"
          >
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" aria-hidden="true" />
            <span>
              Querying NASA POWER API v2 ({report.startYear}–{report.endYear}) for
              dual-region monthly Earth-system telemetry...
            </span>
          </div>
        ) : null}

        {/* Plain-English Citizen / Community Impact Banner */}
        {viewMode === "citizen" ? (
          <section
            aria-label="Citizen and community climate translation"
            className="hud-panel rounded-xl px-4 py-3 border border-dipole-cyan/40 flex items-start gap-3"
          >
            <Sprout
              className="w-5 h-5 text-dipole-cyan shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-dipole-cyan">
                  What This Means for Local Communities &amp; Farmers
                </h2>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-canvas-950 border border-white/10 text-ink-secondary">
                  CITIZEN VIEW · PLAIN-ENGLISH TRANSLATION
                </span>
              </div>
              <p className="text-xs sm:text-sm text-ink-primary leading-relaxed">
                {buildCitizenTakeaway(report)}
              </p>
            </div>
          </section>
        ) : null}

        {/* 12-Column Tactical Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
          {/* Left 3 Cols: Hypothesis Triage & NASA Sensors */}
          <div className="lg:col-span-3 min-w-0">
            <HypothesisTriage
              report={report}
              activeVariable={activeVariable}
              onSelectVariable={setActiveVariable}
              onSymptomChange={(symptom) => handleUpdateParameters({ symptom })}
              onEcosystemChange={(ecosystem) =>
                handleUpdateParameters({ ecosystem })
              }
              onWindowChange={(startYear, endYear) =>
                handleUpdateParameters({ startYear, endYear })
              }
            />
          </div>

          {/* Center 6 Cols: Interactive World Map + 4-Node Lag Cascade */}
          <div className="lg:col-span-6 min-w-0 flex flex-col gap-3.5">
            <InteractiveWorldMap
              report={report}
              activePinMode={activePinMode}
              isAnalyzing={isAnalyzing}
              onPinModeChange={setActivePinMode}
              onSelectCase={handleSelectCase}
              onMapClickCoordinate={handleMapClickCoordinate}
            />

            <div
              id="lag-cascade-section"
              className={`rounded-xl transition ${
                viewMode === "lag_cascade"
                  ? "ring-1 ring-radar-gold/60"
                  : ""
              }`}
            >
              <LagCascadePanel
                report={report}
                activeVariable={activeVariable}
                onSelectVariable={setActiveVariable}
              />
            </div>
          </div>

          {/* Right 3 Cols: Dipole Coupling Ring + Bounded AI Brief */}
          <div className="lg:col-span-3 min-w-0">
            <BoundedAiBrief
              report={report}
              onBriefChange={setActiveBrief}
            />
          </div>
        </div>

        {/* Bottom 12 Cols: Synchronized Dual-Region Recharts + Scientific Proof Drawer */}
        <div className="space-y-3.5">
          <DualRegionCharts
            report={report}
            activeVariable={activeVariable}
            isLoading={isAnalyzing}
            onSelectVariable={setActiveVariable}
          />

          <ScientificProofDrawer
            report={report}
            viewMode={viewMode}
            isOpen={isProofOpen}
            onToggleOpen={() => setIsProofOpen((prev) => !prev)}
          />
        </div>

        {/* Footer Attribution */}
        <footer className="pt-1 pb-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-ink-muted">
          <div className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-drought-orange" aria-hidden="true" />
            <span>
              NusaShift · NASA International Space Apps Challenge 2026 (Be An
              Earth System Trend Detective)
            </span>
          </div>
          <span>
            NASA POWER API v2 (MERRA-2 · CERES · GPM IMERG) · NASA GISTEMP v4
            Calibrated
          </span>
        </footer>
      </main>
    </div>
  );
}
