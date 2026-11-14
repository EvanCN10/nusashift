"use client";

import { AlertTriangle, ArrowDown, ArrowRight, CheckCircle2, Radio } from "lucide-react";
import MathText from "@/components/math/MathText";
import Tex from "@/components/math/Tex";
import { texNum } from "@/components/math/texFormat";
import {
  describeTrendDirection,
  formatLagPhrase,
  FRIENDLY_VARIABLES,
  pValueBucket,
} from "@/lib/narrative";
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

/** Four-step water-energy cascade in plain language plus the single Silent Stress callout. */
export default function LagCascadePanel({
  report,
  activeVariable,
  onSelectVariable,
}: LagCascadePanelProps) {
  return (
    <div
      aria-label="Water-energy lag cascade and silent stress detector"
      className="w-full glass-panel rounded-xl p-5 sm:p-6 flex flex-col gap-5"
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-ink-secondary">
          <Radio className="w-4 h-4 text-radar-gold shrink-0" aria-hidden="true" />
          <span className="font-mono text-[11px] uppercase tracking-[0.12em]">
            Water-energy chain · {report.regionA.name}
          </span>
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
          0–6 month lead-lag test
        </span>
      </div>

      {/* Silent Ecological Stress gets the single red alert callout when active */}
      {report.silentEcologicalStressDetected ? (
        <div
          role="alert"
          className="rounded-xl px-4 py-3.5 bg-drought-coral/15 border border-drought-coral/55 flex items-start gap-3"
        >
          <AlertTriangle
            className="w-5 h-5 text-[#F87171] shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div className="space-y-1">
            <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F87171]">
              Silent Stress Detected
            </div>
            <p className="text-sm sm:text-[15px] leading-relaxed text-ink-primary">
              <MathText text={report.silentStressReason} />
            </p>
          </div>
        </div>
      ) : (
        <div className="glass-well rounded-xl px-4 py-3 border border-white/10 flex items-start gap-2.5">
          <CheckCircle2
            className="w-4 h-4 text-nominal-green shrink-0 mt-1"
            aria-hidden="true"
          />
          <p className="text-sm leading-relaxed text-ink-secondary">
            <MathText text={report.silentStressReason} />
          </p>
        </div>
      )}

      {/* 4 Plain-Language Horizontal Sequence Steps */}
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] gap-2 items-stretch">
        {CASCADE_NODES.map((code, idx) => {
          const friendly = FRIENDLY_VARIABLES[code];
          const trend = report.trendsA[code];
          const linkAfter = report.lagCascadeA[idx];
          const isSilentNode =
            code === "GWETROOT" && report.silentEcologicalStressDetected;
          const isSelected = activeVariable === code;

          const circleClass = isSilentNode
            ? "border-drought-coral bg-drought-coral/20 text-[#F87171]"
            : trend.significanceLevel === "HIGHLY_SIGNIFICANT"
            ? "border-drought-orange bg-drought-orange/15 text-drought-orange"
            : trend.significanceLevel === "SIGNIFICANT"
            ? "border-radar-gold bg-radar-gold/15 text-radar-gold"
            : "border-white/25 bg-canvas-950 text-ink-secondary";

          const directionText = trend.isAvailable
            ? describeTrendDirection(code, trend)
            : "Ocean N/A";

          return (
            <div key={code} className="contents">
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelectVariable(code)}
                className={`min-w-0 glass-well hover:bg-white/[0.06] rounded-xl p-3 flex flex-col justify-between text-left transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-drought-orange ${
                  isSelected
                    ? "border-drought-orange/60 bg-white/[0.08]"
                    : "border-white/10"
                }`}
              >
                <div className="space-y-2.5 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 ${circleClass}`}
                    >
                      {isSilentNode ? (
                        <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                      ) : (
                        <span className="font-mono text-[11px] font-semibold">
                          0{idx + 1}
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted">
                      Step {idx + 1}
                    </span>
                  </div>

                  <div>
                    <div className="text-[15px] font-semibold text-ink-primary leading-snug">
                      {friendly.cascadeLabel}
                    </div>
                    <div className="font-mono text-[11px] uppercase tracking-[0.04em] text-ink-muted mt-0.5">
                      {code === "ALLSKY_SFC_SW_DWN" ? "SW_DWN" : code}
                    </div>
                    <p className="mt-1.5 text-sm text-ink-secondary capitalize leading-snug">
                      {directionText}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/10 font-mono text-[11px] text-ink-muted">
                  <span className="block uppercase tracking-[0.06em] text-[10px]">
                    Shift date
                  </span>
                  <span className="text-ink-secondary">
                    {trend.isAvailable ? trend.changePointDate : "Land-only"}
                  </span>
                </div>
              </button>

              {linkAfter ? (
                <div className="flex md:flex-col items-center justify-center gap-1 py-1 md:py-0 md:max-w-[82px]">
                  <div className="hidden md:flex items-center w-full">
                    <div className="h-px flex-1 border-t border-dashed border-white/25" />
                    <ArrowRight
                      className="w-3.5 h-3.5 text-drought-orange shrink-0"
                      aria-hidden="true"
                    />
                  </div>
                  <ArrowDown
                    className="md:hidden w-3.5 h-3.5 text-drought-orange shrink-0"
                    aria-hidden="true"
                  />
                  <div className="text-[13px] font-medium text-radar-gold text-center leading-tight">
                    {formatLagPhrase(linkAfter.optimalLagMonths)}
                  </div>
                  <div className="font-mono text-[11px] text-ink-muted text-center leading-tight">
                    <Tex math={`r = ${texNum(linkAfter.correlationR, 2)}`} />
                    <span className="block text-[10px] uppercase tracking-[0.06em] mt-0.5">
                      {pValueBucket(linkAfter.pValue).bucket}
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
