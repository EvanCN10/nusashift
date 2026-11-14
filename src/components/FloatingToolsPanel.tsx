"use client";

import { SlidersHorizontal, X } from "lucide-react";
import MapControlsBar, {
  CASE_LABELS,
  type MapRenderMode,
} from "@/components/MapControlsBar";
import { CURATED_CASES } from "@/data/cachedCases";
import {
  ECOSYSTEM_OPTIONS,
  SYMPTOM_PRESETS,
  WINDOW_OPTIONS,
} from "@/data/nasaVariables";
import { formatDMS } from "@/lib/nasaPowerClient";
import type {
  DualRegionAnalysisReport,
  EcosystemType,
  SymptomId,
} from "@/types/climate";

interface FloatingToolsPanelProps {
  id: string;
  isDesktop: boolean;
  desktopOpen: boolean;
  mobileOpen: boolean;
  onClose: () => void;
  report: DualRegionAnalysisReport;
  activePinMode: "A" | "B";
  isAnalyzing: boolean;
  mapMode: MapRenderMode;
  is3dAvailable: boolean;
  onPinModeChange: (mode: "A" | "B") => void;
  onSelectCase: (caseId: string) => void;
  onMapModeChange: (mode: MapRenderMode) => void;
  onUpdateParameters: (updates: {
    symptom?: SymptomId;
    ecosystem?: EcosystemType;
    startYear?: number;
    endYear?: number;
  }) => void;
}

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-drought-orange";

/** Floating glassmorphism tools sidebar on desktop and collapsible bottom sheet on mobile. */
export default function FloatingToolsPanel({
  id,
  isDesktop,
  desktopOpen,
  mobileOpen,
  onClose,
  report,
  activePinMode,
  isAnalyzing,
  mapMode,
  is3dAvailable,
  onPinModeChange,
  onSelectCase,
  onMapModeChange,
  onUpdateParameters,
}: FloatingToolsPanelProps) {
  const isHiddenOnDesktop = isDesktop && !desktopOpen;

  const mobileVisibilityClass = mobileOpen
    ? "fixed inset-x-3 bottom-3 z-40 max-h-[78dvh]"
    : "hidden";

  const desktopMotionClass = desktopOpen
    ? "lg:opacity-100 lg:translate-x-0 lg:pointer-events-auto"
    : "lg:opacity-0 lg:translate-x-6 lg:pointer-events-none";

  const pinnedRegions = [
    {
      pin: "A" as const,
      dotClass: "bg-drought-orange",
      borderClass: "border-drought-orange/50",
      region: report.regionA,
    },
    {
      pin: "B" as const,
      dotClass: "bg-dipole-cyan",
      borderClass: "border-dipole-cyan/50",
      region: report.regionB,
    },
  ];

  return (
    <>
      {!isDesktop && mobileOpen ? (
        <div
          aria-hidden="true"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-canvas-950/65 backdrop-blur-[2px] lg:hidden"
        />
      ) : null}

      <aside
        id={id}
        aria-label="Analysis tools and globe controls"
        aria-hidden={isHiddenOnDesktop || undefined}
        inert={isHiddenOnDesktop || undefined}
        className={`${mobileVisibilityClass} lg:block lg:absolute lg:top-[4.25rem] lg:right-6 xl:right-8 lg:z-20 lg:w-[290px] xl:w-[336px] lg:max-h-[calc(100dvh-8.75rem)] overflow-y-auto glass-scroll glass-panel rounded-xl p-3.5 space-y-2.5 transition-all duration-300 motion-reduce:transition-none motion-reduce:translate-x-0 ${desktopMotionClass}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
          <div className="flex items-center gap-2 text-ink-primary">
            <SlidersHorizontal
              className="w-3.5 h-3.5 text-drought-orange shrink-0"
              aria-hidden="true"
            />
            <span className="font-mono text-[11px] uppercase tracking-[0.14em]">
              Analysis Tools
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Hide analysis tools"
            title="Hide analysis tools (T)"
            className={`min-h-[28px] min-w-[28px] px-1.5 rounded-md inline-flex items-center justify-center text-ink-secondary hover:text-ink-primary hover:bg-white/[0.06] transition cursor-pointer ${focusRing}`}
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        {/* Probe Target & 3D/2D Mode */}
        <MapControlsBar
          report={report}
          activePinMode={activePinMode}
          isAnalyzing={isAnalyzing}
          mapMode={mapMode}
          is3dAvailable={is3dAvailable}
          embedded
          onPinModeChange={onPinModeChange}
          onSelectCase={onSelectCase}
          onMapModeChange={onMapModeChange}
        />

        {/* Pinned A / B Quick Coordinates */}
        <div role="group" aria-label="Pinned regions" className="grid grid-cols-1 gap-1">
          {pinnedRegions.map(({ pin, dotClass, borderClass, region }) => {
            const selected = activePinMode === pin;
            return (
              <button
                key={pin}
                type="button"
                aria-pressed={selected}
                onClick={() => onPinModeChange(pin)}
                className={`glass-well min-h-[28px] px-2.5 py-1 rounded-lg text-left flex items-center justify-between gap-2 transition cursor-pointer ${focusRing} ${
                  selected ? borderClass : "hover:border-white/20"
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span
                    aria-hidden="true"
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`}
                  />
                  <span className="font-mono text-[10px] text-ink-muted shrink-0">
                    {pin}
                  </span>
                  <span className="text-[11px] font-medium text-ink-primary truncate">
                    {region.name}
                  </span>
                </span>
                <span className="font-mono text-[10px] tabular-nums text-ink-secondary shrink-0">
                  {formatDMS(region.lat, region.lon)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Curated Cases */}
        <div className="space-y-1">
          <p
            id="tools-cases-label"
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
          >
            Teleconnection Case
          </p>
          <div
            role="group"
            aria-labelledby="tools-cases-label"
            className="grid grid-cols-1 gap-1"
          >
            {CURATED_CASES.map((c, idx) => {
              const active = report.caseId === c.caseId;
              const label = CASE_LABELS[c.caseId];
              return (
                <button
                  key={c.caseId}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onSelectCase(c.caseId)}
                  title={label?.full ?? c.title}
                  className={`min-h-[28px] px-2.5 py-1 rounded-lg text-left text-[11px] font-medium flex items-center justify-between gap-2 transition cursor-pointer ${focusRing} ${
                    active
                      ? "bg-drought-orange/15 text-drought-orange border border-drought-orange/50"
                      : "glass-well text-ink-secondary hover:text-ink-primary hover:bg-white/[0.06]"
                  }`}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-[10px] opacity-75 shrink-0">
                      0{idx + 1}
                    </span>
                    <span className="truncate">{label?.short ?? c.shortLabel}</span>
                    {label?.tag ? (
                      <span className="sr-only"> ({label.tag})</span>
                    ) : null}
                  </span>
                  {label?.tag ? (
                    <span className="font-mono text-[9.5px] uppercase tracking-wider opacity-80 shrink-0">
                      {label.tag}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Observation Window */}
        <div className="space-y-1">
          <p
            id="tools-window-label"
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
          >
            Observation Window
          </p>
          <div
            role="group"
            aria-labelledby="tools-window-label"
            className="grid grid-cols-3 gap-1"
          >
            {WINDOW_OPTIONS.map((w) => {
              const active =
                report.startYear === w.startYear && report.endYear === w.endYear;
              return (
                <button
                  key={w.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    onUpdateParameters({
                      startYear: w.startYear,
                      endYear: w.endYear,
                    })
                  }
                  className={`min-h-[28px] px-2 py-1 rounded-lg font-mono text-[11px] font-medium transition cursor-pointer ${focusRing} ${
                    active
                      ? "bg-white/[0.1] text-ink-primary border border-drought-orange/55"
                      : "glass-well text-ink-secondary hover:text-ink-primary hover:bg-white/[0.06]"
                  }`}
                >
                  {w.id}
                  <span className="sr-only">
                    {" "}
                    ({w.startYear} to {w.endYear})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Observed Symptom */}
        <div className="space-y-1">
          <p
            id="tools-symptom-label"
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
          >
            Observed Symptom
          </p>
          <div
            role="group"
            aria-labelledby="tools-symptom-label"
            className="grid grid-cols-2 gap-1"
          >
            {(Object.keys(SYMPTOM_PRESETS) as SymptomId[]).map((symId) => {
              const preset = SYMPTOM_PRESETS[symId];
              const active = report.symptom === symId;
              return (
                <button
                  key={symId}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onUpdateParameters({ symptom: symId })}
                  className={`min-h-[28px] px-2.5 py-1 rounded-lg text-left text-[11px] font-medium truncate transition cursor-pointer ${focusRing} ${
                    active
                      ? "bg-white/[0.1] text-ink-primary border border-drought-orange/55"
                      : "glass-well text-ink-secondary hover:text-ink-primary hover:bg-white/[0.06]"
                  }`}
                >
                  {preset.shortLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Ecosystem */}
        <div className="space-y-1">
          <p
            id="tools-ecosystem-label"
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
          >
            Ecosystem Biome
          </p>
          <div
            role="group"
            aria-labelledby="tools-ecosystem-label"
            className="grid grid-cols-2 gap-1"
          >
            {ECOSYSTEM_OPTIONS.map((eco) => {
              const active = report.ecosystem === eco.id;
              return (
                <button
                  key={eco.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onUpdateParameters({ ecosystem: eco.id })}
                  className={`min-h-[28px] px-2.5 py-1 rounded-lg text-left text-[11px] font-medium truncate transition cursor-pointer ${focusRing} ${
                    active
                      ? "bg-white/[0.1] text-ink-primary border border-dipole-cyan/55"
                      : "glass-well text-ink-secondary hover:text-ink-primary hover:bg-white/[0.06]"
                  }`}
                >
                  {eco.label}
                </button>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}
