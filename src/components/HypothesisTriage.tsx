"use client";

import { useState } from "react";
import { Info, SlidersHorizontal } from "lucide-react";
import {
  ECOSYSTEM_OPTIONS,
  NASA_VARIABLES,
  SYMPTOM_PRESETS,
  WINDOW_OPTIONS,
} from "@/data/nasaVariables";
import {
  describeTrendDirection,
  FRIENDLY_VARIABLES,
} from "@/lib/narrative";
import type {
  DualRegionAnalysisReport,
  EcosystemType,
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

/** Compact Verdict hypothesis controls with friendly-first variable labels. */
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

  const displayCode = CORE_SENSOR_CODES.includes(activeVariable)
    ? activeVariable
    : inspectedCode;
  const inspectedMeta = NASA_VARIABLES[displayCode] ?? NASA_VARIABLES.GWETROOT;
  const inspectedFriendly = FRIENDLY_VARIABLES[displayCode];

  return (
    <div
      aria-label="Adjust research question and track satellite indicators"
      className="glass-panel rounded-xl p-5 sm:p-6 space-y-5"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-ink-secondary">
          <SlidersHorizontal
            className="w-4 h-4 text-drought-orange shrink-0"
            aria-hidden="true"
          />
          <span className="font-mono text-[11px] uppercase tracking-[0.12em]">
            Adjust the question · {report.startYear}–{report.endYear}
          </span>
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
          Auto-maps 4 NASA satellite indicators
        </span>
      </div>

      {/* Compact Control Row: Symptom, Ecosystem, Timeframe */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Q1 Symptom */}
        <div className="lg:col-span-5 space-y-2">
          <p
            id="triage-symptom-label"
            className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted"
          >
            1. Observed symptom
          </p>
          <div
            role="group"
            aria-labelledby="triage-symptom-label"
            className="grid grid-cols-2 gap-2"
          >
            {(Object.keys(SYMPTOM_PRESETS) as SymptomId[]).map((symId) => {
              const preset = SYMPTOM_PRESETS[symId];
              const active = report.symptom === symId;
              return (
                <button
                  key={symId}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onSymptomChange(symId)}
                  className={`min-h-[40px] px-3 py-2 rounded-lg text-left text-sm font-medium flex items-center gap-2 transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-drought-orange ${
                    active
                      ? "bg-white/[0.09] text-ink-primary border border-drought-orange/55"
                      : "glass-well text-ink-secondary hover:text-ink-primary hover:bg-white/[0.05] border border-white/10"
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

        {/* Q2 Ecosystem */}
        <div className="lg:col-span-4 space-y-2">
          <p
            id="triage-ecosystem-label"
            className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted"
          >
            2. Target ecosystem
          </p>
          <div
            role="group"
            aria-labelledby="triage-ecosystem-label"
            className="grid grid-cols-2 gap-2"
          >
            {ECOSYSTEM_OPTIONS.map((eco) => {
              const active = report.ecosystem === eco.id;
              return (
                <button
                  key={eco.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onEcosystemChange(eco.id)}
                  className={`min-h-[40px] px-3 py-2 rounded-lg text-left text-sm font-medium flex items-center gap-2 transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dipole-cyan ${
                    active
                      ? "bg-white/[0.09] text-ink-primary border border-dipole-cyan/55"
                      : "glass-well text-ink-secondary hover:text-ink-primary hover:bg-white/[0.05] border border-white/10"
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

        {/* Q3 Window */}
        <div className="lg:col-span-3 space-y-2">
          <p
            id="triage-window-label"
            className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted"
          >
            3. History window
          </p>
          <div
            role="group"
            aria-labelledby="triage-window-label"
            className="glass-well p-1.5 rounded-lg grid grid-cols-3 gap-1.5"
          >
            {WINDOW_OPTIONS.map((win) => {
              const active = report.startYear === win.startYear;
              return (
                <button
                  key={win.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onWindowChange(win.startYear, win.endYear)}
                  className={`min-h-[34px] px-2 py-1.5 rounded-md text-sm font-mono tabular-nums font-medium transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-drought-orange ${
                    active
                      ? "bg-white/[0.12] text-ink-primary border border-white/20"
                      : "text-ink-secondary hover:text-ink-primary border border-transparent"
                  }`}
                >
                  {win.id}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Friendly-First Indicator Pills (NASA codes strictly as captions) */}
      <div className="pt-4 border-t border-white/[0.08] space-y-3">
        <div
          role="group"
          aria-label="Inspect satellite indicators"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5"
        >
          {CORE_SENSOR_CODES.map((code) => {
            const meta = NASA_VARIABLES[code];
            const friendly = FRIENDLY_VARIABLES[code];
            const trendA = report.trendsA[code];
            const selected = activeVariable === code;
            const directionText = trendA.isAvailable
              ? describeTrendDirection(code, trendA)
              : "Ocean N/A";

            return (
              <button
                key={code}
                type="button"
                aria-pressed={selected}
                onMouseEnter={() => setInspectedCode(code)}
                onFocus={() => setInspectedCode(code)}
                onClick={() => {
                  setInspectedCode(code);
                  onSelectVariable(code);
                }}
                className={`rounded-lg px-3.5 py-2.5 text-left transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-drought-orange ${
                  selected
                    ? "bg-white/[0.09] border border-drought-orange/55"
                    : "glass-well border border-white/10 hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-ink-primary">
                    {friendly.name}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                    {code === "ALLSKY_SFC_SW_DWN" ? "SW_DWN" : code}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-2 text-xs text-ink-secondary">
                  <span>{meta.physicalRole}</span>
                  <span className="text-ink-primary font-medium capitalize">
                    {directionText}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Plain-Language Explainer for Active/Inspected Indicator */}
        <div className="glass-well rounded-lg px-4 py-3 flex items-start gap-2.5">
          <Info
            className="w-4 h-4 text-dipole-cyan shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div className="space-y-0.5">
            <p className="text-sm leading-relaxed text-ink-secondary">
              <strong className="font-medium text-ink-primary">
                {inspectedFriendly.name}
              </strong>{" "}
              ({inspectedMeta.unit}): {inspectedMeta.studentDefinition}
            </p>
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
              {inspectedMeta.code} · {inspectedMeta.nasaInstrumentHeritage}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
