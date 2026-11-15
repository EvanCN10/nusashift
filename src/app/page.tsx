"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { ArrowDown, Compass, SlidersHorizontal } from "lucide-react";
import { useLenis } from "lenis/react";
import BoundedAiBrief from "@/components/BoundedAiBrief";
import DualRegionCharts from "@/components/DualRegionCharts";
import FloatingToolsPanel from "@/components/FloatingToolsPanel";
import HypothesisTriage from "@/components/HypothesisTriage";
import InteractiveWorldMap from "@/components/InteractiveWorldMap";
import LagCascadePanel from "@/components/LagCascadePanel";
import { usePrefersReducedMotion } from "@/components/LenisProvider";
import MapControlsBar, { type MapRenderMode } from "@/components/MapControlsBar";
import NavbarHeader from "@/components/NavbarHeader";
import Reveal from "@/components/Reveal";
import ScientificProofDrawer from "@/components/ScientificProofDrawer";
import ScrollCue from "@/components/ScrollCue";
import StickySectionNav from "@/components/StickySectionNav";
import MathText from "@/components/math/MathText";
import Tex from "@/components/math/Tex";
import { texNum, texP, withMarkdownMath } from "@/components/math/texFormat";
import {
  CURATED_CASES,
  getPrecomputedCaseReport,
} from "@/data/cachedCases";
import {
  SYMPTOM_PRESETS,
  WINDOW_OPTIONS,
} from "@/data/nasaVariables";
import { generateDeterministicCausalBrief } from "@/lib/causalFallback";
import { formatDMS } from "@/lib/nasaPowerClient";
import {
  buildVerdictMetrics,
  buildVerdictPlainSummary,
  buildVerdictSentence,
  getVerdictBadge,
} from "@/lib/narrative";
import type {
  CausalExplanationResponse,
  DualRegionAnalysisReport,
  EcosystemType,
  NasaVariableCode,
  SymptomId,
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

const DESKTOP_HERO_QUERY = "(min-width: 1024px)";

function subscribeDesktopHero(cb: () => void) {
  const mql = window.matchMedia(DESKTOP_HERO_QUERY);
  mql.addEventListener("change", cb);
  return () => mql.removeEventListener("change", cb);
}

/** True on lg+ screens, where the hero composes as a single 100dvh full-bleed stage. */
function useIsDesktopHero(): boolean {
  return useSyncExternalStore(
    subscribeDesktopHero,
    () => window.matchMedia(DESKTOP_HERO_QUERY).matches,
    () => false
  );
}

function buildQueryParams(
  report: DualRegionAnalysisReport,
  includeScientificView = false
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
  if (includeScientificView) {
    params.set("view", "scientific");
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
      const ciStr = `$[${texNum(trend.confidenceInterval95[0], 4)},\\ ${texNum(trend.confidenceInterval95[1], 4)}]$`;
      return `| ${code} | ${label} | ${trend.sampleCount} | $${texNum(trend.mannKendallTau, 3)}$ | $${texP(trend.pValue)}$ | $${texNum(trend.sensSlopePerDecade, 4, true)}$ ${trend.unit}/dec | ${ciStr} | ${trend.changePointDate} ($K_T = ${Math.round(trend.pettittStatistic)}$) |`;
    });
  });

  const cascadeLines = report.lagCascadeA.map(
    (link) =>
      `- **${link.fromVariable} -> ${link.toVariable}:** $k^{*} = +${link.optimalLagMonths}$ mo, $r = ${texNum(link.correlationR, 3)}$, $${texP(link.pValue)}$ (${withMarkdownMath(link.interpretation)})`
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
    `- **Dipole Correlation:** $r = ${texNum(report.dipoleCorrelationR, 3)}$, $${texP(report.dipolePValue)}$, Opposite-Sign = ${report.isOppositeDirection ? "YES" : "NO"}`,
    `- **Silent Ecological Stress:** ${report.silentEcologicalStressDetected ? "DETECTED" : "NOT DETECTED"} — ${withMarkdownMath(report.silentStressReason)}`,
    ``,
    `## Causal Synthesis (${brief.source})`,
    `### ${withMarkdownMath(brief.headline)}`,
    ``,
    `### Physical Teleconnection Mechanism`,
    ...brief.physicalMechanism.map((m) => `- ${withMarkdownMath(m)}`),
    ``,
    `### Regional Mitigation Recommendations`,
    ...brief.mitigationActions.map((a) => `- ${withMarkdownMath(a)}`),
    ``,
    `## Water-Energy Lag-Cascade (Region A)`,
    ...cascadeLines,
    ``,
    `## Non-Parametric Statistical Proof Matrix (Deseasonalized Monthly Anomalies)`,
    `| Variable | Region | N | Mann-Kendall $\\tau$ | $p$-value | Sen's Slope $Q_{\\text{dec}}$ | 95% CI | Pettitt Shift ($K_T$) |`,
    `| :--- | :--- | ---: | ---: | ---: | ---: | :--- | :--- |`,
    ...matrixLines,
    ``,
    `## NASA GISTEMP v4 Cross-Validation`,
    `- **Dataset:** ${gv.datasetName} (${gv.period})`,
    `- **Published Reference Slope:** $${texNum(gv.publishedReferenceSlopePerDecade, 4, true)}\\,^{\\circ}\\mathrm{C}\\,\\mathrm{dec}^{-1}$`,
    `- **Engine Computed Slope:** $${texNum(gv.computedSlopePerDecade, 4, true)}\\,^{\\circ}\\mathrm{C}\\,\\mathrm{dec}^{-1}$`,
    `- **Calibration Deviation:** ${gv.deviationPct.toFixed(2)}% (Calibrated: ${gv.isCalibrated ? "YES" : "NO"})`,
    `- **GISTEMP Mann-Kendall:** $\\tau =${texNum(gv.mannKendallTau, 3)}$, $${texP(gv.mannKendallPValue)}$`,
    ``,
  ].join("\n");
}

function SectionEyebrow({ sector, label }: { sector: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px w-6 bg-drought-orange/75 shrink-0" aria-hidden="true" />
      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted">
        Sector {sector} · {label}
      </span>
    </div>
  );
}

const TOOLS_STORAGE_KEY = "nusashift-tools-open";
const TOOLS_EVENT = "nusashift-tools-pref";

function subscribeToolsPreference(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(TOOLS_EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(TOOLS_EVENT, cb);
  };
}

function readDesktopToolsSnapshot(): boolean {
  try {
    return window.localStorage.getItem(TOOLS_STORAGE_KEY) !== "false";
  } catch {
    return true;
  }
}

function writeDesktopToolsPreference(open: boolean) {
  try {
    window.localStorage.setItem(TOOLS_STORAGE_KEY, String(open));
    window.dispatchEvent(new Event(TOOLS_EVENT));
  } catch {
    // Ignore storage access errors
  }
}

export default function NusaShiftDashboardPage() {
  const [report, setReport] = useState<DualRegionAnalysisReport>(() =>
    getPrecomputedCaseReport(CURATED_CASES[0].caseId)
  );
  const [activeVariable, setActiveVariable] = useState<NasaVariableCode>(
    () => SYMPTOM_PRESETS[CURATED_CASES[0].defaultSymptom].primaryVariable
  );
  const [activePinMode, setActivePinMode] = useState<"A" | "B">("A");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isProofOpen, setIsProofOpen] = useState(false);
  const [isProofHighlighted, setIsProofHighlighted] = useState(false);
  const [activeBrief, setActiveBrief] =
    useState<CausalExplanationResponse | null>(null);
  const [mapMode, setMapMode] = useState<MapRenderMode>("3d");
  const [is3dAvailable, setIs3dAvailable] = useState(true);
  const desktopToolsOpen = useSyncExternalStore(
    subscribeToolsPreference,
    readDesktopToolsSnapshot,
    () => true
  );
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);

  const hydratedRef = useRef(false);
  const isDesktopHero = useIsDesktopHero();
  const lenis = useLenis();
  const reducedMotion = usePrefersReducedMotion();

  const handleToggleTools = useCallback(() => {
    if (isDesktopHero) {
      writeDesktopToolsPreference(!desktopToolsOpen);
      return;
    }
    setMobileToolsOpen((prev) => !prev);
  }, [desktopToolsOpen, isDesktopHero]);

  const handleCloseTools = useCallback(() => {
    if (isDesktopHero) {
      writeDesktopToolsPreference(false);
      return;
    }
    setMobileToolsOpen(false);
  }, [isDesktopHero]);

  // Global keyboard shortcuts: `T` toggles floating tools, `Escape` closes mobile sheet.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target?.isContentEditable
      ) {
        return;
      }
      if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        handleToggleTools();
      } else if (e.key === "Escape" && !isDesktopHero && mobileToolsOpen) {
        setMobileToolsOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleToggleTools, isDesktopHero, mobileToolsOpen]);

  const scrollToSection = useCallback(
    (targetId: string, focusHeading = false) => {
      const target = document.getElementById(targetId);
      if (!target) return;
      if (lenis && !reducedMotion) {
        lenis.scrollTo(target, { offset: 0 });
      } else {
        target.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: "start",
        });
      }
      if (focusHeading && targetId === "verdict") {
        document.getElementById("verdict-heading")?.focus({ preventScroll: true });
      }
    },
    [lenis, reducedMotion]
  );

  const handle3dUnsupported = useCallback(() => {
    setIs3dAvailable(false);
    setMapMode("2d");
  }, []);

  const syncUrl = useCallback(
    (nextReport: DualRegionAnalysisReport, scientificOpen = false) => {
      if (typeof window === "undefined") return;
      const query = buildQueryParams(nextReport, scientificOpen);
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
    }) => {
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
        syncUrl(nextReport, isProofOpen);
      } catch {
        // Resilient fallback if client request fails
      } finally {
        setIsAnalyzing(false);
      }
    },
    [isProofOpen, syncUrl]
  );

  // Hydrate shared investigations & legacy ?view= deep links cleanly
  useEffect(() => {
    if (hydratedRef.current || typeof window === "undefined") return;
    hydratedRef.current = true;

    const sp = new URLSearchParams(window.location.search);
    if (sp.toString().length === 0) return;

    const rawView = sp.get("view");
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
    const startYear =
      matchedWin?.startYear ?? Number(sp.get("startYear") || 1985);
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
      if (rawView === "scientific") {
        setIsProofOpen(true);
        setIsProofHighlighted(true);
      }

      if (hasCoords) {
        const resolvedSymptom = symptom ?? "custom_exploration";
        const resolvedEco =
          ecosystem ?? SYMPTOM_PRESETS[resolvedSymptom].defaultEcosystem;
        await runLiveAnalyze({
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
        });
      } else {
        const restored = getPrecomputedCaseReport(
          caseParam,
          Number.isFinite(startYear) ? startYear : 1985,
          Number.isFinite(endYear) ? endYear : 2025,
          symptom,
          ecosystem
        );
        setReport(restored);
        setActiveVariable(restored.primaryVariable);
      }

      if (rawView === "scientific") {
        setTimeout(() => {
          document
            .getElementById("proof")
            ?.scrollIntoView({ behavior: "auto", block: "start" });
        }, 80);
      } else if (rawView === "lag_cascade") {
        setTimeout(() => {
          document
            .getElementById("mechanism")
            ?.scrollIntoView({ behavior: "auto", block: "start" });
        }, 80);
      }
    });
  }, [runLiveAnalyze]);

  const handleSelectCase = useCallback(
    (caseId: string) => {
      const nextReport = getPrecomputedCaseReport(
        caseId,
        report.startYear,
        report.endYear
      );
      setReport(nextReport);
      setActiveVariable(nextReport.primaryVariable);
      syncUrl(nextReport, isProofOpen);
    },
    [isProofOpen, report.endYear, report.startYear, syncUrl]
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
        syncUrl(nextReport, isProofOpen);
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
    [isProofOpen, report, runLiveAnalyze, syncUrl]
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

  const handleSelectLocation = useCallback(
    (
      loc: { name: string; country: string; lat: number; lon: number },
      targetPin: "A" | "B"
    ) => {
      const newPoint = {
        name: loc.name,
        country: loc.country,
        lat: loc.lat,
        lon: loc.lon,
      };
      const regionA = targetPin === "A" ? newPoint : report.regionA;
      const regionB = targetPin === "B" ? newPoint : report.regionB;

      // Automatically switch to the alternate pin so the user can easily select the pair
      setActivePinMode(targetPin === "A" ? "B" : "A");

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
    [report, runLiveAnalyze]
  );

  const handleToggleProof = useCallback(() => {
    setIsProofOpen((prev) => {
      const next = !prev;
      setIsProofHighlighted(false);
      syncUrl(report, next);
      return next;
    });
  }, [report, syncUrl]);

  const handleShareUrl = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined") return false;
    const query = buildQueryParams(report, isProofOpen);
    const fullUrl = `${window.location.origin}${window.location.pathname}${query}`;
    window.history.replaceState(null, "", `${window.location.pathname}${query}`);

    try {
      await navigator.clipboard.writeText(fullUrl);
      return true;
    } catch {
      return legacyExecCopy(fullUrl);
    }
  }, [isProofOpen, report]);

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

  const heroSubtitle = useMemo(() => {
    const pair = `${report.regionA.name} ↔ ${report.regionB.name}`;
    if (report.silentEcologicalStressDetected) {
      return `${pair} · Silent Root-Zone Drying`;
    }
    if (report.isOppositeDirection) {
      return `${pair} · Opposite-Sign Dipole`;
    }
    return `${pair} · Coupled Teleconnection`;
  }, [
    report.isOppositeDirection,
    report.regionA.name,
    report.regionB.name,
    report.silentEcologicalStressDetected,
  ]);

  const yearSpan = Math.max(1, report.endYear - report.startYear);

  const heroSummary = useMemo(() => {
    if (report.silentEcologicalStressDetected) {
      return "Monthly rainfall appears statistically flat while satellite sensors reveal sustained root-zone moisture depletion underneath.";
    }
    if (report.isOppositeDirection) {
      return `Cross-oceanic moisture and surface skin heat swing in opposite directions across ${yearSpan} years of NASA satellite telemetry.`;
    }
    return "Decadal satellite anomalies tracking solar radiation, root-zone water, skin temperature, and rainfall across paired ecosystems.";
  }, [report.isOppositeDirection, report.silentEcologicalStressDetected, yearSpan]);

  const primaryTrendA = report.trendsA[report.primaryVariable];
  const shiftOnset = primaryTrendA?.isAvailable
    ? primaryTrendA.changePointDate
    : "N/A";
  const gistempAlignmentPct = Math.max(
    0,
    100 - report.gistempValidation.deviationPct
  );
  const isLive = report.dataSourceTag === "LIVE_NASA_POWER_V2";

  const verdictBadge = useMemo(() => getVerdictBadge(report), [report]);
  const verdictSentence = useMemo(() => buildVerdictSentence(report), [report]);
  const verdictPlainSummary = useMemo(
    () => buildVerdictPlainSummary(report),
    [report]
  );
  const verdictMetrics = useMemo(() => buildVerdictMetrics(report), [report]);

  const verdictBadgeClasses =
    verdictBadge.variant === "alert"
      ? "bg-drought-coral/15 text-[#F87171] border-drought-coral/50"
      : verdictBadge.variant === "opposite"
      ? "bg-drought-orange/15 text-drought-orange border-drought-orange/45"
      : "bg-dipole-cyan/15 text-dipole-cyan border-dipole-cyan/45";

  const toolsVisible = isDesktopHero ? desktopToolsOpen : mobileToolsOpen;

  return (
    <div className="min-h-screen bg-canvas-950 text-ink-primary">
      <a
        href="#verdict"
        onClick={(e) => {
          e.preventDefault();
          scrollToSection("verdict", true);
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-4 focus:z-50 glass-panel rounded-full px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-drought-orange"
      >
        Skip to verdict
      </a>
      {/* Centered Space Globe Hero + Toggleable Glass Overlays */}
      <section
        id="hero"
        aria-label="Global teleconnection explorer hero"
        className="relative w-full bg-canvas-950 flex flex-col lg:h-dvh lg:min-h-[680px] lg:overflow-hidden"
      >
        <NavbarHeader
          report={report}
          onShareUrl={handleShareUrl}
          onExportBrief={handleExportBrief}
        />

        {/* Centered 3D Globe / 2D Map Stage */}
        <div className="relative h-[46vh] min-h-[296px] max-h-[410px] w-full shrink-0 overflow-hidden lg:absolute lg:inset-0 lg:z-0 lg:h-auto lg:min-h-0 lg:max-h-none">
          <InteractiveWorldMap
            report={report}
            mapMode={mapMode}
            globeFocus="pair"
            globeHorizontalOffset={0}
            globeVerticalOffset={0}
            onMapClickCoordinate={handleMapClickCoordinate}
            on3dUnsupported={handle3dUnsupported}
          />

          <div className="lg:hidden absolute top-3 right-3 z-20">
            <MapControlsBar
              report={report}
              activePinMode={activePinMode}
              isAnalyzing={isAnalyzing}
              mapMode={mapMode}
              is3dAvailable={is3dAvailable}
              onPinModeChange={setActivePinMode}
              onSelectCase={handleSelectCase}
              onMapModeChange={setMapMode}
            />
          </div>
        </div>

        {/* Bottom-only subtle readability scrim on desktop */}
        <div
          aria-hidden="true"
          className="hidden lg:block pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-24 bg-gradient-to-t from-canvas-950/92 via-canvas-950/50 to-transparent"
        />

        {/* Editorial Identity Card: flows below globe on mobile; floats top-left glass card on desktop */}
        <div
          id="hero-brief-panel"
          aria-hidden={isDesktopHero && !desktopToolsOpen ? true : undefined}
          inert={isDesktopHero && !desktopToolsOpen ? true : undefined}
          className={`relative z-10 px-5 pt-4 pb-3 space-y-3.5 lg:absolute lg:top-[4.25rem] lg:left-6 xl:left-8 lg:z-20 lg:w-[272px] xl:w-[344px] lg:glass-panel lg:rounded-xl lg:p-4 xl:p-5 lg:space-y-3 lg:transition-all lg:duration-300 motion-reduce:transition-none motion-reduce:translate-x-0 ${
            desktopToolsOpen
              ? "lg:opacity-100 lg:translate-x-0 lg:pointer-events-auto"
              : "lg:opacity-0 lg:-translate-x-6 lg:pointer-events-none"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="h-px w-5 bg-drought-orange/80 shrink-0" aria-hidden="true" />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-secondary">
              NASA Space Apps 2026 · Trend Detective
            </span>
          </div>

          <div className="space-y-1.5">
            <h1 className="font-display text-4xl lg:text-[1.95rem] xl:text-[2.55rem] leading-[0.95] tracking-[-0.02em] text-ink-primary">
              Two regions.
              <br />
              One climate signal.
            </h1>
            <p className="font-display italic text-base lg:text-[15px] xl:text-lg text-drought-orange/95 leading-snug">
              {heroSubtitle}
            </p>
          </div>

          <p className="text-xs sm:text-[13px] leading-relaxed text-ink-secondary">
            {heroSummary}
          </p>

          <ul className="grid grid-cols-3 gap-3 pt-2.5 border-t border-white/10">
            <li>
              <p className="font-mono text-lg sm:text-xl font-medium tabular-nums tracking-tight text-ink-primary">
                {report.dipoleCorrelationR.toFixed(2)}
              </p>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    report.isOppositeDirection ? "bg-drought-orange" : "bg-dipole-cyan"
                  }`}
                />
                <span>Dipole (r)</span>
              </p>
            </li>
            <li>
              <p className="font-mono text-lg sm:text-xl font-medium tabular-nums tracking-tight text-ink-primary">
                {shiftOnset}
              </p>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted">
                Shift Onset
              </p>
            </li>
            <li>
              <p className="font-mono text-lg sm:text-xl font-medium tabular-nums tracking-tight text-nominal-green">
                {gistempAlignmentPct.toFixed(1)}%
              </p>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted">
                GISTEMP
              </p>
            </li>
          </ul>
        </div>

        {/* Floating Analysis Tools Panel (right glass panel on desktop, drawer sheet on mobile) */}
        <FloatingToolsPanel
          id="hero-tools-panel"
          isDesktop={isDesktopHero}
          desktopOpen={desktopToolsOpen}
          mobileOpen={mobileToolsOpen}
          onClose={handleCloseTools}
          report={report}
          activePinMode={activePinMode}
          isAnalyzing={isAnalyzing}
          mapMode={mapMode}
          is3dAvailable={is3dAvailable}
          onPinModeChange={setActivePinMode}
          onSelectCase={handleSelectCase}
          onSelectLocation={handleSelectLocation}
          onMapModeChange={setMapMode}
          onUpdateParameters={handleUpdateParameters}
        />

        {/* Hero Bottom Dock: Scroll Cue, CTA, Toggle Bar & Status */}
        <div className="relative z-20 px-5 sm:px-8 lg:px-8 pb-4 pt-3 lg:mt-auto flex flex-wrap items-center justify-between gap-3 pointer-events-none">
          <div className="flex items-center gap-3 pointer-events-auto">
            <ScrollCue targetId="verdict" />

            <button
              type="button"
              onClick={() => scrollToSection("verdict", true)}
              className="glass-panel min-h-[34px] inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.13em] text-ink-primary hover:border-white/30 transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-drought-orange"
            >
              <span>Explore evidence</span>
              <ArrowDown className="w-3.5 h-3.5 text-drought-orange" aria-hidden="true" />
            </button>
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            <button
              type="button"
              aria-expanded={toolsVisible}
              aria-controls="hero-tools-panel"
              onClick={handleToggleTools}
              title={
                toolsVisible
                  ? "Hide floating panels (T)"
                  : "Show floating panels (T)"
              }
              className={`min-h-[34px] rounded-full px-3.5 py-1.5 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-drought-orange ${
                toolsVisible
                  ? "glass-panel text-ink-primary border-drought-orange/45 hover:border-drought-orange/70"
                  : "glass-panel text-ink-secondary hover:text-ink-primary hover:border-white/30"
              }`}
            >
              <SlidersHorizontal
                className="w-3.5 h-3.5 text-drought-orange"
                aria-hidden="true"
              />
              <span>{toolsVisible ? "Hide Tools" : "Show Tools"}</span>
              <kbd className="hidden lg:inline-block rounded border border-white/15 bg-white/[0.06] px-1.5 py-0.5 text-[10px] leading-none text-ink-secondary">
                T
              </kbd>
            </button>
          </div>

          <div className="pointer-events-auto flex items-center gap-3">
            <span className="hidden xl:inline font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
              {mapMode === "3d"
                ? `Hover borders · Click globe to probe ${activePinMode}`
                : `Click map to probe ${activePinMode}`}
            </span>

            <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-secondary">
              <span
                aria-hidden="true"
                className={`w-1.5 h-1.5 rounded-full ${
                  isLive
                    ? "bg-nominal-green shadow-[0_0_8px_#22C55E] animate-pulse"
                    : "bg-dipole-cyan"
                }`}
              />
              <span>{isLive ? "LIVE NASA POWER V2" : "CACHED NASA POWER V2"}</span>
              <span className="text-ink-muted" aria-hidden="true">
                ·
              </span>
              <span
                className={
                  verdictBadge.variant === "alert"
                    ? "text-[#F87171]"
                    : verdictBadge.variant === "opposite"
                    ? "text-drought-orange"
                    : "text-dipole-cyan"
                }
              >
                {verdictBadge.label}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Section Mini-Nav (appears after hero exits viewport) */}
      <StickySectionNav />

      {/* Below-Hero Narrative Flow: Verdict -> Evidence -> Mechanism -> Proof */}
      <main className="relative z-10 bg-canvas-900">
        {/* SECTION 1: VERDICT */}
        <section
          id="verdict"
          aria-labelledby="verdict-heading"
          className="py-20 lg:py-28 border-t border-white/[0.08]"
        >
          <div className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-10 space-y-10">
            <Reveal className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <SectionEyebrow sector="01" label="Verdict" />
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border font-mono text-[11px] font-semibold uppercase tracking-[0.12em] ${verdictBadgeClasses}`}
                >
                  <span
                    aria-hidden="true"
                    className="w-1.5 h-1.5 rounded-full bg-current"
                  />
                  <span>{verdictBadge.label}</span>
                </span>
              </div>

              <h2
                id="verdict-heading"
                tabIndex={-1}
                className="font-display text-[clamp(1.75rem,3.4vw,2.75rem)] leading-[1.12] tracking-[-0.015em] text-ink-primary max-w-[30ch] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-drought-orange rounded-sm"
              >
                {verdictSentence}
              </h2>

              <p className="text-sm sm:text-base leading-[1.6] text-ink-secondary max-w-[68ch]">
                <MathText text={verdictPlainSummary} />
              </p>
            </Reveal>

            {/* 3 Plain-Language Key Figures */}
            <Reveal delayMs={70}>
              <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {verdictMetrics.map((item) => (
                  <li
                    key={item.id}
                    className="glass-panel rounded-xl p-5 sm:p-6 flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-ink-secondary">
                        {item.label}
                      </h3>
                      <p className="font-mono text-2xl sm:text-[28px] font-medium tabular-nums tracking-tight text-ink-primary">
                        {item.value}
                      </p>
                      <p className="text-sm leading-relaxed text-ink-secondary">
                        {item.meaning}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-white/[0.08] font-mono text-xs text-ink-muted">
                      {item.captionTex ? (
                        <Tex math={item.captionTex} />
                      ) : (
                        item.captionText
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>

            {/* Compact Question & Friendly Indicator Controls */}
            <Reveal delayMs={140}>
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
            </Reveal>
          </div>
        </section>

        {/* SECTION 2: EVIDENCE */}
        <section
          id="evidence"
          aria-labelledby="evidence-heading"
          className="py-20 lg:py-28 border-t border-white/[0.06]"
        >
          <div className="max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-10 space-y-8">
            <Reveal className="space-y-3">
              <SectionEyebrow sector="02" label="Visual Evidence" />
              <div className="space-y-2">
                <h2
                  id="evidence-heading"
                  className="font-display text-[clamp(1.75rem,3vw,2.75rem)] leading-[1.12] tracking-[-0.015em] text-ink-primary"
                >
                  Forty years side by side
                </h2>
                <p className="text-sm sm:text-base leading-[1.6] text-ink-secondary max-w-[65ch]">
                  One satellite indicator at a time across both locations, with seasonal monsoon swings removed so long-term shifts stand out clearly.
                </p>
              </div>
            </Reveal>

            <Reveal delayMs={80}>
              <DualRegionCharts
                report={report}
                activeVariable={activeVariable}
                isLoading={isAnalyzing}
                onSelectVariable={setActiveVariable}
              />
            </Reveal>
          </div>
        </section>

        {/* SECTION 3: MECHANISM */}
        <section
          id="mechanism"
          aria-labelledby="mechanism-heading"
          className="py-20 lg:py-28 border-t border-white/[0.06]"
        >
          <div className="max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-10 space-y-8">
            <Reveal className="space-y-3">
              <SectionEyebrow sector="03" label="Physical Mechanism" />
              <div className="space-y-2">
                <h2
                  id="mechanism-heading"
                  className="font-display text-[clamp(1.75rem,3vw,2.75rem)] leading-[1.12] tracking-[-0.015em] text-ink-primary"
                >
                  Why underground moisture shifts first
                </h2>
                <p className="text-sm sm:text-base leading-[1.6] text-ink-secondary max-w-[65ch]">
                  Follow how extra sunlight travels down into soil wetness, land surface heat, and rainfall over subsequent months.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
              <Reveal delayMs={60} className="xl:col-span-8 flex">
                <LagCascadePanel
                  report={report}
                  activeVariable={activeVariable}
                  onSelectVariable={setActiveVariable}
                />
              </Reveal>

              <Reveal delayMs={140} className="xl:col-span-4 flex">
                <BoundedAiBrief report={report} onBriefChange={setActiveBrief} />
              </Reveal>
            </div>
          </div>
        </section>

        {/* SECTION 4: PROOF */}
        <section
          id="proof"
          aria-labelledby="proof-heading"
          className="pt-20 lg:pt-28 pb-16 border-t border-white/[0.06]"
        >
          <div className="max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-10 space-y-8">
            <Reveal className="space-y-3">
              <SectionEyebrow sector="04" label="Scientific Proof" />
              <div className="space-y-2">
                <h2
                  id="proof-heading"
                  className="font-display text-[clamp(1.75rem,3vw,2.75rem)] leading-[1.12] tracking-[-0.015em] text-ink-primary"
                >
                  Formal statistics &amp; benchmark check
                </h2>
                <p className="text-sm sm:text-base leading-[1.6] text-ink-secondary max-w-[65ch]">
                  Open the full non-parametric test matrix, confidence intervals, NASA GISTEMP v4 validation, and exact underlying formulas.
                </p>
              </div>
            </Reveal>

            <Reveal delayMs={60}>
              <ScientificProofDrawer
                report={report}
                isOpen={isProofOpen}
                isHighlighted={isProofHighlighted}
                onToggleOpen={handleToggleProof}
              />
            </Reveal>

            {/* Footer Attribution */}
            <footer className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono text-ink-muted">
              <div className="flex items-center gap-2">
                <Compass
                  className="w-4 h-4 text-drought-orange shrink-0"
                  aria-hidden="true"
                />
                <span>
                  NusaShift · NASA International Space Apps Challenge 2026 (Be An
                  Earth System Trend Detective)
                </span>
              </div>
              <span className="sm:text-right">
                NASA POWER v2 (MERRA-2 · CERES · GPM IMERG) · NASA GISTEMP v4 ·
                Earth textures: NASA Blue Marble NG, SRTM Elevation &amp; Natural
                Earth 110m · Place geocoding: BigDataCloud
              </span>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
}
