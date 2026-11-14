"use client";

import { Globe2, Loader2, MapPin, Waves } from "lucide-react";
import { CURATED_CASES } from "@/data/cachedCases";
import type { DualRegionAnalysisReport } from "@/types/climate";

export type MapRenderMode = "3d" | "2d";

interface MapControlsBarProps {
  report: DualRegionAnalysisReport;
  activePinMode: "A" | "B";
  isAnalyzing: boolean;
  mapMode: MapRenderMode;
  is3dAvailable: boolean;
  onPinModeChange: (mode: "A" | "B") => void;
  onSelectCase: (caseId: string) => void;
  onMapModeChange: (mode: MapRenderMode) => void;
}

const CASE_LABELS: Record<string, { short: string; tag: string; full: string }> = {
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

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-drought-orange";

export default function MapControlsBar({
  report,
  activePinMode,
  isAnalyzing,
  mapMode,
  is3dAvailable,
  onPinModeChange,
  onSelectCase,
  onMapModeChange,
}: MapControlsBarProps) {
  const isLive = report.dataSourceTag === "LIVE_NASA_POWER_V2";

  return (
    <div className="hud-panel-float rounded-xl p-2 flex flex-col gap-1.5">
      {/* Row 1: Curated case quick-pills */}
      <div
        role="toolbar"
        aria-label="Curated climate teleconnection case studies"
        className="flex flex-wrap items-center justify-center gap-1.5"
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
              aria-label={label?.full ?? c.title}
              className={`min-h-[28px] px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition cursor-pointer ${focusRing} ${
                active
                  ? "bg-drought-orange/15 text-drought-orange border border-drought-orange/45"
                  : "hud-well text-ink-secondary hover:text-ink-primary hover:bg-panel-800 border border-white/10"
              }`}
            >
              <span className="font-mono text-[10px] opacity-70">{idx + 1}</span>
              <span>{label?.short ?? c.shortLabel}</span>
              {label ? (
                <span className="hidden sm:inline font-mono text-[9px] uppercase tracking-wider opacity-60">
                  {label.tag}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Row 2: 2D/3D, pin target, feed badge */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <div
          role="group"
          aria-label="Map render mode"
          className="hud-well p-1 rounded-lg flex items-center gap-1"
        >
          {(["3d", "2d"] as const).map((mode) => {
            const active = mapMode === mode;
            const disabled = mode === "3d" && !is3dAvailable;
            return (
              <button
                key={mode}
                type="button"
                aria-pressed={active}
                disabled={disabled}
                title={disabled ? "WebGL is not available in this browser" : undefined}
                onClick={() => onMapModeChange(mode)}
                className={`min-h-[26px] px-2 py-0.5 rounded font-mono text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${focusRing} ${
                  active
                    ? "bg-panel-800 text-ink-primary border border-white/15"
                    : "text-ink-secondary hover:text-ink-primary border border-transparent"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`w-1.5 h-1.5 rounded-full ${
                    active ? "bg-nominal-green shadow-[0_0_6px_#22C55E]" : "bg-slate-600"
                  }`}
                />
                {mode.toUpperCase()}
              </button>
            );
          })}
        </div>

        <div
          role="group"
          aria-label="Map click target pin"
          className="hud-well p-1 rounded-lg flex items-center gap-1"
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
                className={`min-h-[26px] px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1.5 transition cursor-pointer ${
                  isA
                    ? "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-drought-orange"
                    : "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-dipole-cyan"
                } ${
                  active
                    ? `bg-panel-800 text-ink-primary border ${
                        isA ? "border-drought-orange/45" : "border-dipole-cyan/45"
                      }`
                    : "text-ink-secondary hover:text-ink-primary border border-transparent"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`w-2 h-2 rounded-full ${isA ? "bg-drought-orange" : "bg-dipole-cyan"}`}
                />
                <span>Set Region {pin}</span>
              </button>
            );
          })}
        </div>

        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] px-2 py-1 rounded-md bg-canvas-950 border border-white/10 text-ink-secondary">
          {isAnalyzing ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin text-drought-orange" aria-hidden="true" />
              <span className="text-drought-orange">QUERYING NASA POWER v2...</span>
            </>
          ) : (
            <>
              <Globe2
                className={`w-3 h-3 ${isLive ? "text-nominal-green" : "text-dipole-cyan"}`}
                aria-hidden="true"
              />
              <span>{isLive ? "LIVE NASA POWER V2" : "CACHED NASA POWER V2"}</span>
            </>
          )}
        </span>
      </div>

      {/* Row 3: interaction hint + dipole readout */}
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px]">
        <span className="text-ink-secondary flex items-center gap-1">
          <MapPin className="w-3 h-3 text-drought-orange shrink-0" aria-hidden="true" />
          <span>
            {mapMode === "3d" ? "Drag to rotate · click" : "Click"} the map to reposition{" "}
            <strong className="text-ink-primary">Region {activePinMode}</strong>
          </span>
        </span>
        <span className="font-mono tabular-nums text-ink-primary">
          Dipole r = {report.dipoleCorrelationR.toFixed(2)} ·{" "}
          <span className={report.isOppositeDirection ? "text-drought-orange" : "text-dipole-cyan"}>
            {report.isOppositeDirection ? "OPPOSITE-SIGN" : "COUPLED"}
          </span>
        </span>
      </div>

      {report.oceanFallbackNotice ? (
        <div
          role="status"
          className="hud-well rounded-lg px-3 py-1.5 border border-radar-gold/40 text-[11px] text-radar-gold flex items-center gap-2"
        >
          <Waves className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{report.oceanFallbackNotice}</span>
        </div>
      ) : null}
    </div>
  );
}
