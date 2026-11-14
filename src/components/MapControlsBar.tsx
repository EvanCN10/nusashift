"use client";

import { Loader2, Waves } from "lucide-react";
import { CURATED_CASES } from "@/data/cachedCases";
import type { DualRegionAnalysisReport } from "@/types/climate";

export type MapRenderMode = "3d" | "2d";

export const CASE_LABELS: Record<
  string,
  { short: string; tag: string; full: string }
> = {
  "indo-chile-dipole": {
    short: "Merauke ↔ Chile",
    tag: "ENSO",
    full: "Case 1: Merauke ↔ Chile [ENSO Dipole]",
  },
  "silent-murray-kalimantan": {
    short: "Murray-Darling ↔ Kalimantan",
    tag: "Silent Stress",
    full: "Case 2: Murray-Darling ↔ Kalimantan [Silent Stress]",
  },
  "java-water-energy": {
    short: "East ↔ West Java",
    tag: "Water-Energy",
    full: "Case 3: East Java ↔ West Java [Water-Energy]",
  },
};

interface MapControlsBarProps {
  report: DualRegionAnalysisReport;
  activePinMode: "A" | "B";
  isAnalyzing: boolean;
  mapMode: MapRenderMode;
  is3dAvailable: boolean;
  showCases?: boolean;
  embedded?: boolean;
  onPinModeChange: (mode: "A" | "B") => void;
  onSelectCase: (caseId: string) => void;
  onMapModeChange: (mode: MapRenderMode) => void;
}

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-drought-orange";

/** Compact hero map controls (pin target A/B, 3D/2D switch, loading & ocean notice). */
export default function MapControlsBar({
  report,
  activePinMode,
  isAnalyzing,
  mapMode,
  is3dAvailable,
  showCases = false,
  embedded = false,
  onPinModeChange,
  onSelectCase,
  onMapModeChange,
}: MapControlsBarProps) {
  return (
    <div
      className={`flex flex-col gap-2 ${embedded ? "items-stretch" : "items-end"}`}
    >
      {showCases ? (
        <div
          role="toolbar"
          aria-label="Curated climate teleconnection case studies"
          className="glass-panel rounded-full p-1.5 flex flex-wrap items-center justify-end gap-1"
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
                className={`min-h-[28px] px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1.5 transition cursor-pointer ${focusRing} ${
                  active
                    ? "bg-drought-orange/15 text-drought-orange border border-drought-orange/45"
                    : "text-ink-secondary hover:text-ink-primary hover:bg-white/[0.06] border border-transparent"
                }`}
              >
                <span className="font-mono text-[10px] opacity-70">{idx + 1}</span>
                <span>{label?.short ?? c.shortLabel}</span>
                {label?.tag ? (
                  <span className="sr-only"> ({label.tag})</span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}

      <div
        role="toolbar"
        aria-label="Map probe target and dimension mode"
        className={`${
          embedded
            ? "glass-well rounded-lg px-2 py-1.5 justify-between"
            : "glass-panel rounded-full px-2 py-1.5"
        } flex flex-wrap items-center gap-1.5`}
      >
        <div
          role="group"
          aria-label="Map click target pin"
          className="flex items-center gap-1"
        >
          {(["A", "B"] as const).map((pin) => {
            const active = activePinMode === pin;
            const isA = pin === "A";
            return (
              <button
                key={pin}
                type="button"
                aria-pressed={active}
                onClick={() => onPinModeChange(pin)}
                className={`min-h-[28px] px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1.5 transition cursor-pointer ${
                  isA
                    ? "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-drought-orange"
                    : "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dipole-cyan"
                } ${
                  active
                    ? `bg-white/[0.09] text-ink-primary border ${
                        isA ? "border-drought-orange/60" : "border-dipole-cyan/60"
                      }`
                    : "text-ink-secondary hover:text-ink-primary border border-transparent"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`w-2 h-2 rounded-full ${
                    isA ? "bg-drought-orange" : "bg-dipole-cyan"
                  }`}
                />
                <span>Set {pin}</span>
              </button>
            );
          })}
        </div>

        <span
          role="separator"
          aria-orientation="vertical"
          className="h-4 w-px bg-white/10"
        />

        <div
          role="group"
          aria-label="Map render mode"
          className="flex items-center gap-0.5"
        >
          {(["3d", "2d"] as const).map((mode) => {
            const active = mapMode === mode;
            const disabled = mode === "3d" && !is3dAvailable;
            return (
              <button
                key={mode}
                type="button"
                aria-pressed={active}
                aria-disabled={disabled || undefined}
                title={disabled ? "WebGL is not available in this browser" : undefined}
                onClick={() => {
                  if (disabled) return;
                  onMapModeChange(mode);
                }}
                className={`min-h-[28px] px-2.5 py-1 rounded-full font-mono text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer aria-disabled:cursor-not-allowed aria-disabled:opacity-40 ${focusRing} ${
                  active
                    ? "bg-white/[0.1] text-ink-primary border border-white/20"
                    : "text-ink-secondary hover:text-ink-primary border border-transparent"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`w-1.5 h-1.5 rounded-full ${
                    active ? "bg-nominal-green shadow-[0_0_6px_#22C55E]" : "bg-ink-muted"
                  }`}
                />
                {mode.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {isAnalyzing ? (
        <div
          role="status"
          aria-live="polite"
          className="glass-well rounded-lg px-3 py-1.5 border-dipole-cyan/40 text-[11px] font-mono text-dipole-cyan flex items-center gap-2"
        >
          <Loader2
            className="w-3.5 h-3.5 animate-spin motion-reduce:animate-none shrink-0"
            aria-hidden="true"
          />
          <span className="truncate">
            Querying NASA POWER v2 ({report.startYear}–{report.endYear})…
          </span>
        </div>
      ) : null}

      {report.oceanFallbackNotice ? (
        <div
          role="status"
          className="glass-well rounded-lg px-3 py-2 border-radar-gold/40 text-[11px] text-radar-gold flex items-start gap-2"
        >
          <Waves className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{report.oceanFallbackNotice}</span>
        </div>
      ) : null}
    </div>
  );
}
