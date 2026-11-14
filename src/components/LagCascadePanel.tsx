"use client";

import { AlertTriangle, ArrowRight, CheckCircle2, Radio } from "lucide-react";
import { NASA_VARIABLES } from "@/data/nasaVariables";
import type { DualRegionAnalysisReport, NasaVariableCode } from "@/types/climate";

interface LagCascadePanelProps {
  report: DualRegionAnalysisReport;
  activeVariable: NasaVariableCode;
  onSelectVariable: (variable: NasaVariableCode) => void;
}

const CASCADE_NODES: NasaVariableCode[] = [
  "ALLSKY_SFC_SW_DWN",
  "GWETROOT",
  "TS",
  "PRECTOTCORR",
];

export default function LagCascadePanel({
  report,
  activeVariable,
  onSelectVariable,
}: LagCascadePanelProps) {
  return (
    <section
      aria-label="Water-energy lag cascade and silent ecological stress detector"
      className="hud-panel rounded-xl p-3.5 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-secondary flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-radar-gold" aria-hidden="true" />
          <span>Water-Energy Lag-Cascade Stepper ({report.regionA.name})</span>
        </h2>
        <span className="font-mono text-[10px] text-ink-secondary">
          LEAD-LAG WINDOW k ∈ [0..6] MONTHS
        </span>
      </div>

      {/* Silent Ecological Stress Alert Banner */}
      {report.silentEcologicalStressDetected ? (
        <div
          role="alert"
          className="rounded-lg px-3 py-2.5 bg-drought-coral/15 border border-drought-coral/50 text-xs text-ink-primary flex items-start gap-2.5"
        >
          <AlertTriangle
            className="w-4 h-4 text-drought-coral shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div>
            <span className="font-mono font-bold uppercase tracking-wider text-drought-coral">
              ⚠ SILENT ECOLOGICAL STRESS DETECTED:
            </span>{" "}
            <span className="text-ink-primary">{report.silentStressReason}</span>
          </div>
        </div>
      ) : (
        <div className="hud-well rounded-lg px-3 py-2 border border-white/10 text-xs text-ink-secondary flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-nominal-green shrink-0" aria-hidden="true" />
          <span>{report.silentStressReason}</span>
        </div>
      )}

      {/* 4-Node Horizontal Waypoint Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2 items-center">
        {CASCADE_NODES.map((code, idx) => {
          const meta = NASA_VARIABLES[code];
          const trend = report.trendsA[code];
          const linkAfter = report.lagCascadeA[idx];
          const isSilentNode =
            code === "GWETROOT" && report.silentEcologicalStressDetected;
          const isSelected = activeVariable === code;

          const ringClass = isSilentNode
            ? "border-drought-coral bg-drought-coral/20 text-drought-coral animate-pulse"
            : trend.significanceLevel === "HIGHLY_SIGNIFICANT"
            ? "border-drought-orange bg-drought-orange/15 text-drought-orange"
            : trend.significanceLevel === "SIGNIFICANT"
            ? "border-radar-gold bg-radar-gold/15 text-radar-gold"
            : "border-white/25 bg-canvas-950 text-ink-secondary";

          return (
            <div key={code} className="contents">
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelectVariable(code)}
                className={`hud-well hover:bg-panel-800 rounded-lg p-2.5 flex flex-col items-center text-center transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-drought-orange ${
                  isSelected
                    ? "border-drought-orange/60 bg-panel-800"
                    : "border-white/10"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full border-2 flex items-center justify-center mb-1.5 ${ringClass}`}
                >
                  {isSilentNode ? (
                    <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <span className="font-mono text-[10px] font-bold">
                      N{idx + 1}
                    </span>
                  )}
                </div>

                <div className="font-mono text-[10px] font-bold text-ink-primary">
                  {code === "ALLSKY_SFC_SW_DWN" ? "SOLAR_SW" : code}
                </div>
                <div className="text-[11px] font-medium text-ink-secondary leading-tight">
                  {meta.shortLabel}
                </div>

                <div className="mt-1.5 pt-1.5 border-t border-white/10 w-full font-mono tabular-nums text-[10px] space-y-0.5">
                  <div className="text-ink-primary">
                    τ = {trend.isAvailable ? trend.mannKendallTau.toFixed(2) : "N/A"}
                  </div>
                  <div className="text-ink-secondary">
                    {trend.isAvailable
                      ? `${trend.sensSlopePerDecade > 0 ? "+" : ""}${trend.sensSlopePerDecade.toFixed(3)}/dec`
                      : "Ocean N/A"}
                  </div>
                  <div className="text-[9px] text-drought-coral">
                    Shift: {trend.changePointDate}
                  </div>
                </div>
              </button>

              {linkAfter && (
                <div className="flex md:flex-col items-center justify-center gap-1 py-1">
                  <div className="hidden md:flex items-center w-full">
                    <div className="h-px flex-1 border-t border-dashed border-white/25" />
                    <ArrowRight
                      className="w-3.5 h-3.5 text-drought-orange shrink-0"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="px-2 py-0.5 rounded-full bg-canvas-950 border border-white/15 font-mono tabular-nums text-[10px] text-ink-primary whitespace-nowrap text-center">
                    <span className="text-radar-gold font-semibold">
                      +{linkAfter.optimalLagMonths} mo
                    </span>{" "}
                    · r={linkAfter.correlationR.toFixed(2)}
                  </div>
                  <div className="font-mono text-[9px] text-ink-secondary">
                    {linkAfter.isSignificant
                      ? linkAfter.pValue < 0.01
                        ? "p < 0.01"
                        : "p < 0.05"
                      : "weak"}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
