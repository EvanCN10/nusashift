"use client";

import { useState } from "react";
import { CheckCircle2, Info, ShieldAlert } from "lucide-react";
import {
  ECOSYSTEM_OPTIONS,
  NASA_VARIABLES,
  SYMPTOM_PRESETS,
  WINDOW_OPTIONS,
} from "@/data/nasaVariables";
import type {
  DualRegionAnalysisReport,
  EcosystemType,
  MonthlyObservation,
  NasaVariableCode,
  SymptomId,
} from "@/types/climate";

interface HypothesisTriageProps {
  report: DualRegionAnalysisReport;
  activeVariable: NasaVariableCode;
  onSelectVariable: (variable: NasaVariableCode) => void;
  onSymptomChange: (symptom: SymptomId) => void;
  onEcosystemChange: (ecosystem: EcosystemType) => void;
  onWindowChange: (startYear: number, endYear: number) => void;
}

const CORE_SENSOR_CODES: NasaVariableCode[] = [
  "ALLSKY_SFC_SW_DWN",
  "GWETROOT",
  "TS",
  "PRECTOTCORR",
];

function buildSparklinePath(series: MonthlyObservation[]): string {
  if (series.length < 2) return "M 0 9 L 56 9";
  // Sample annual chunks (~40 points) for crisp telemetry sparkline
  const step = Math.max(1, Math.floor(series.length / 28));
  const sampled: number[] = [];
  for (let i = 0; i < series.length; i += step) {
    sampled.push(series[i].deseasonalizedZ);
  }
  const min = Math.min(...sampled, -2);
  const max = Math.max(...sampled, 2);
  const range = Math.max(0.1, max - min);

  return sampled
    .map((val, idx) => {
      const x = (idx / Math.max(1, sampled.length - 1)) * 56;
      const y = 16 - ((val - min) / range) * 14;
      return `${idx === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

export default function HypothesisTriage({
  report,
  activeVariable,
  onSelectVariable,
  onSymptomChange,
  onEcosystemChange,
  onWindowChange,
}: HypothesisTriageProps) {
  const [inspectedCode, setInspectedCode] = useState<NasaVariableCode>(
    report.primaryVariable
  );

  const inspectedMeta = NASA_VARIABLES[inspectedCode] ?? NASA_VARIABLES.GWETROOT;
  const gistemp = report.gistempValidation;

  return (
    <aside
      aria-label="Hypothesis triage and NASA sensors"
      className="flex flex-col gap-3.5"
    >
      {/* Section 1: 3-Step Diagnostic Triage */}
      <section className="hud-panel rounded-xl p-3.5 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-secondary flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-drought-orange" aria-hidden="true" />
            <span>Hypothesis Triage &amp; Sensors</span>
          </h2>
          <span className="text-[10px] font-mono text-ink-secondary">
            STEP 1 · AUTO-MAP
          </span>
        </div>

        {/* Q1 Observed Symptom (2x2 Matrix) */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-secondary mb-1.5">
            1. Observed Environmental Symptom
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {(Object.keys(SYMPTOM_PRESETS) as SymptomId[]).map((symId) => {
              const preset = SYMPTOM_PRESETS[symId];
              const active = report.symptom === symId;
              return (
                <button
                  key={symId}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onSymptomChange(symId)}
                  className={`min-h-[34px] px-2.5 py-1.5 rounded-lg text-left text-[11px] font-medium flex items-center gap-1.5 transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-drought-orange ${
                    active
                      ? "bg-panel-800 text-ink-primary border border-drought-orange/50"
                      : "hud-well text-ink-secondary hover:text-ink-primary hover:bg-panel-800"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      active ? "bg-drought-orange" : "bg-ink-muted"
                    }`}
                  />
                  <span className="truncate">{preset.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Q2 Target Ecosystem */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-secondary mb-1.5">
            2. Target Ecosystem Profile
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {ECOSYSTEM_OPTIONS.map((eco) => {
              const active = report.ecosystem === eco.id;
              return (
                <button
                  key={eco.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onEcosystemChange(eco.id)}
                  className={`min-h-[30px] px-2 py-1 rounded-md text-[11px] font-medium text-left flex items-center gap-1.5 transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-dipole-cyan ${
                    active
                      ? "bg-panel-800 text-ink-primary border border-white/20"
                      : "hud-well text-ink-secondary hover:text-ink-primary hover:bg-panel-800"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      active ? "bg-dipole-cyan" : "bg-ink-muted"
                    }`}
                  />
                  <span className="truncate">{eco.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Q3 Historical Window */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-secondary mb-1.5">
            3. Historical Analysis Window
          </p>
          <div className="hud-well p-1 rounded-lg grid grid-cols-3 gap-1">
            {WINDOW_OPTIONS.map((win) => {
              const active = report.startYear === win.startYear;
              return (
                <button
                  key={win.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onWindowChange(win.startYear, win.endYear)}
                  className={`min-h-[28px] px-1.5 py-1 rounded text-[11px] font-mono tabular-nums font-medium transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-drought-orange ${
                    active
                      ? "bg-panel-800 text-ink-primary border border-white/15"
                      : "text-ink-secondary hover:text-ink-primary border border-transparent"
                  }`}
                >
                  {win.id}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 2: Mapped NASA POWER Telemetry Strips (FLEET LIST style) */}
      <section className="hud-panel rounded-xl p-3.5 flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-secondary">
            Active NASA POWER Telemetry
          </h2>
          <span className="text-[10px] font-mono text-ink-secondary">
            REGION A · {report.startYear}–{report.endYear}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          {CORE_SENSOR_CODES.map((code) => {
            const meta = NASA_VARIABLES[code];
            const trend = report.trendsA[code];
            const isSelected = activeVariable === code;
            const isAdverse =
              (code === "GWETROOT" || code === "PRECTOTCORR") &&
              trend.direction === "DECREASING";
            const isThermalSpike =
              (code === "TS" || code === "ALLSKY_SFC_SW_DWN") &&
              trend.direction === "INCREASING";
            const strokeColor =
              !trend.isAvailable
                ? "#5E6778"
                : isAdverse || isThermalSpike
                ? "#F97316"
                : "#22C55E";

            const sigBadge = !trend.isAvailable
              ? { label: "OCEAN N/A", cls: "text-ink-secondary bg-white/5" }
              : trend.significanceLevel === "HIGHLY_SIGNIFICANT"
              ? { label: "p < 0.01", cls: "text-drought-coral bg-drought-coral/15" }
              : trend.significanceLevel === "SIGNIFICANT"
              ? { label: "p < 0.05", cls: "text-radar-gold bg-radar-gold/15" }
              : { label: "Noise", cls: "text-ink-secondary bg-white/5" };

            return (
              <button
                key={code}
                type="button"
                aria-pressed={isSelected}
                onMouseEnter={() => setInspectedCode(code)}
                onFocus={() => setInspectedCode(code)}
                onClick={() => {
                  setInspectedCode(code);
                  onSelectVariable(code);
                }}
                className={`w-full hud-well hover:bg-panel-800 rounded-lg px-2.5 py-2 flex items-center justify-between gap-2 transition text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-drought-orange ${
                  isSelected
                    ? "border-drought-orange/55 bg-panel-800"
                    : "border-white/5"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] font-semibold text-ink-primary">
                      {code === "ALLSKY_SFC_SW_DWN" ? "SW_DWN" : code}
                    </span>
                    <span className="text-[10px] text-ink-secondary truncate">
                      · {meta.shortLabel}
                    </span>
                  </div>
                  <div className="text-[10px] text-ink-secondary truncate">
                    {meta.physicalRole}
                  </div>
                </div>

                {/* Mini Sparkline */}
                <svg
                  width="56"
                  height="18"
                  viewBox="0 0 56 18"
                  aria-hidden="true"
                  className="shrink-0"
                >
                  <path
                    d={buildSparklinePath(trend.series)}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                {/* Slope + Significance LED */}
                <div className="text-right shrink-0">
                  <div className="font-mono tabular-nums text-[11px] font-semibold text-ink-primary">
                    {trend.isAvailable
                      ? `${trend.sensSlopePerDecade > 0 ? "+" : ""}${trend.sensSlopePerDecade.toFixed(3)}`
                      : "N/A"}
                  </div>
                  <span
                    className={`inline-block font-mono text-[9px] px-1.5 py-0.5 rounded ${sigBadge.cls}`}
                  >
                    ■ {sigBadge.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Educational Sensor Definition Box */}
        <div className="hud-well rounded-lg p-2.5 text-[11px] border border-white/10">
          <div className="flex items-center gap-1.5 font-semibold text-ink-primary mb-1">
            <Info className="w-3.5 h-3.5 text-dipole-cyan shrink-0" aria-hidden="true" />
            <span>
              {inspectedMeta.shortLabel} ({inspectedMeta.unit})
            </span>
          </div>
          <p className="text-ink-secondary leading-relaxed">
            {inspectedMeta.studentDefinition}
          </p>
          <p className="mt-1 font-mono text-[10px] text-dipole-cyan">
            Heritage: {inspectedMeta.nasaInstrumentHeritage}
          </p>
        </div>
      </section>

      {/* Section 3: Live NASA GISTEMP v4 Calibration Mini-Card */}
      <section className="hud-panel rounded-xl p-3.5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-secondary">
            GISTEMP v4 Cross-Validation
          </h2>
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-nominal-green bg-nominal-green/15 px-2 py-0.5 rounded-full border border-nominal-green/30">
            <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
            <span>{gistemp.isCalibrated ? "CALIBRATED" : "CHECK"}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 hud-well rounded-lg p-2.5 font-mono tabular-nums text-xs">
          <div>
            <div className="text-[10px] text-ink-secondary font-sans">
              NASA OLS Reference
            </div>
            <div className="text-ink-primary font-semibold">
              +{gistemp.publishedReferenceSlopePerDecade.toFixed(3)} °C/dec
            </div>
          </div>
          <div>
            <div className="text-[10px] text-ink-secondary font-sans">
              Engine Sen&apos;s Slope
            </div>
            <div className="text-nominal-green font-semibold">
              +{gistemp.computedSlopePerDecade.toFixed(3)} °C/dec
            </div>
          </div>
          <div className="col-span-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] text-ink-secondary">
            <span>
              MK τ = {gistemp.mannKendallTau.toFixed(3)} (p &lt; 0.001)
            </span>
            <span className="text-ink-primary">
              Dev: {gistemp.deviationPct.toFixed(2)}%
            </span>
          </div>
        </div>
      </section>
    </aside>
  );
}
