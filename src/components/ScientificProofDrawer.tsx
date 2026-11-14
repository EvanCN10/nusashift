"use client";

import {
  BookOpenCheck,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FlaskConical,
} from "lucide-react";
import { NASA_CHALLENGE_RESOURCES, NASA_VARIABLES } from "@/data/nasaVariables";
import Tex from "@/components/math/Tex";
import { texNum, texP } from "@/components/math/texFormat";
import { formatDMS } from "@/lib/nasaPowerClient";
import type {
  DualRegionAnalysisReport,
  NasaVariableCode,
  SignificanceLevel,
} from "@/types/climate";

interface ScientificProofDrawerProps {
  report: DualRegionAnalysisReport;
  isOpen: boolean;
  isHighlighted?: boolean;
  onToggleOpen: () => void;
}

const VARIABLE_LIST: NasaVariableCode[] = [
  "ALLSKY_SFC_SW_DWN",
  "GWETROOT",
  "TS",
  "PRECTOTCORR",
  "T2M",
];

function getSeverityBadgeStyle(
  sig: SignificanceLevel,
  isAvailable: boolean
): string {
  if (!isAvailable) {
    return "bg-white/5 text-ink-muted border border-white/10";
  }
  if (sig === "HIGHLY_SIGNIFICANT") {
    return "bg-[#EF4444]/15 text-[#F87171] border border-[#EF4444]/40";
  }
  if (sig === "SIGNIFICANT") {
    return "bg-[#EAB308]/20 text-[#EAB308] border border-[#EAB308]/40";
  }
  return "bg-white/5 text-ink-secondary border border-white/15";
}

const DEG_C_PER_DECADE = "\\,^{\\circ}\\mathrm{C}\\,\\mathrm{dec}^{-1}";

interface FormulaCard {
  title: string;
  accent: string;
  wide?: boolean;
  equations: string[];
  note: React.ReactNode;
}

/**
 * Formal statements of exactly what src/lib/statsEngine.ts computes.
 * Keep these in sync with that file if the engine ever changes.
 */
const FORMULA_CARDS: FormulaCard[] = [
  {
    title: "1. Monthly Z-Score Deseasonalization",
    accent: "text-drought-orange",
    equations: [
      "Z_{y,m} = \\dfrac{X_{y,m} - \\bar{X}_m}{s_m}, \\quad m \\in \\{1, \\dots, 12\\}",
      "s_m = \\sqrt{\\dfrac{1}{N_m - 1} \\sum_{y} \\left(X_{y,m} - \\bar{X}_m\\right)^2}",
    ],
    note: "Per-calendar-month mean and sample standard deviation remove the wet/dry monsoon cycle before any trend test.",
  },
  {
    title: "2. Theil–Sen Slope & 95% CI",
    accent: "text-dipole-cyan",
    equations: [
      "Q_{\\text{dec}} = 120 \\cdot \\operatorname*{median}_{1 \\le i < j \\le n} \\left( \\dfrac{x_j - x_i}{j - i} \\right)",
      "C_\\alpha = 1.96 \\sqrt{\\operatorname{Var}(S)}, \\quad \\left[\\, Q_{(\\lfloor (N - C_\\alpha)/2 \\rfloor)},\\; Q_{(\\lceil (N + C_\\alpha)/2 \\rceil)} \\,\\right]",
    ],
    note: (
      <>
        <Tex math="N = n(n-1)/2" /> ordered pairwise slopes;{" "}
        <Tex math="\times 120" /> converts months to decades.
      </>
    ),
  },
  {
    title: "3. Mann–Kendall Trend Test (tie-corrected)",
    accent: "text-nominal-green",
    wide: true,
    equations: [
      "S = \\sum_{i=1}^{n-1} \\sum_{j=i+1}^{n} \\operatorname{sgn}\\!\\left(x_j - x_i\\right), \\qquad \\tau = \\dfrac{2S}{n(n-1)}",
      "\\operatorname{Var}(S) = \\dfrac{1}{18} \\left[ n(n-1)(2n+5) - \\sum_{g} t_g (t_g - 1)(2t_g + 5) \\right]",
      "Z = \\dfrac{S - \\operatorname{sgn}(S)}{\\sqrt{\\operatorname{Var}(S)}}, \\qquad p = \\operatorname{erfc}\\!\\left( \\dfrac{|Z|}{\\sqrt{2}} \\right)",
    ],
    note: (
      <>
        <Tex math="t_g" /> is the size of tied group <Tex math="g" />. Significance
        tiers: <Tex math="p < 0.01" /> (highly significant),{" "}
        <Tex math="p < 0.05" /> (significant).
      </>
    ),
  },
  {
    title: "4. Pettitt Non-Parametric Change-Point",
    accent: "text-drought-coral",
    equations: [
      "U_t = 2 \\sum_{i=1}^{t} R_i - t\\,(n+1)",
      "K_T = \\max_{1 \\le t < n} \\left| U_t \\right|, \\qquad \\hat{t} = \\operatorname*{arg\\,max}_{t} \\left| U_t \\right|",
    ],
    note: (
      <>
        <Tex math="R_i" /> is the rank of <Tex math="Z_i" /> (ties get average
        ranks); <Tex math="\hat{t}" /> is the regime-shift month (YYYY-MM).
      </>
    ),
  },
  {
    title: "5. Lead–Lag Cascade & Dipole Correlation",
    accent: "text-radar-gold",
    equations: [
      "r_{XY}(k) = \\operatorname{corr}\\!\\left(X_t,\\, Y_{t+k}\\right), \\qquad k^{*} = \\operatorname*{arg\\,max}_{0 \\le k \\le 6} \\left| r_{XY}(k) \\right|",
      "t = r \\sqrt{\\dfrac{n-2}{1-r^2}} \\;\\sim\\; t_{\\,n-2}",
    ],
    note: "Two-sided Pearson test on deseasonalized anomalies; detects root-zone drying months before rainfall collapses.",
  },
];

/** Closed-by-default statistical audit accordion with Lenis wheel isolation. */
export default function ScientificProofDrawer({
  report,
  isOpen,
  isHighlighted = false,
  onToggleOpen,
}: ScientificProofDrawerProps) {
  const rows = VARIABLE_LIST.flatMap((code) => [
    {
      key: `${code}-A`,
      regionLabel: "Region A",
      regionName: report.regionA.name,
      dms: formatDMS(report.regionA.lat, report.regionA.lon),
      accent: "text-drought-orange",
      trend: report.trendsA[code],
      meta: NASA_VARIABLES[code],
    },
    {
      key: `${code}-B`,
      regionLabel: "Region B",
      regionName: report.regionB.name,
      dms: formatDMS(report.regionB.lat, report.regionB.lon),
      accent: "text-dipole-cyan",
      trend: report.trendsB[code],
      meta: NASA_VARIABLES[code],
    },
  ]);

  const gv = report.gistempValidation;

  return (
    <div
      id="scientific-proof-section"
      aria-labelledby="scientific-proof-heading"
      className={`glass-panel rounded-xl p-5 sm:p-6 transition ${
        isHighlighted ? "ring-1 ring-nominal-green/55" : ""
      }`}
    >
      {/* Accordion Header */}
      <button
        type="button"
        id="scientific-proof-heading"
        aria-expanded={isOpen}
        aria-controls="scientific-proof-drawer-body"
        onClick={onToggleOpen}
        className="w-full min-h-[44px] flex items-center justify-between gap-4 text-left cursor-pointer rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-nominal-green"
      >
        <div className="flex items-center gap-3 flex-wrap min-w-0">
          <FlaskConical
            className="w-4 h-4 text-nominal-green shrink-0"
            aria-hidden="true"
          />
          <span className="text-base sm:text-lg font-medium text-ink-primary">
            Scientific proof: full statistics
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] px-2.5 py-0.5 rounded-full glass-well border border-white/10 text-ink-secondary">
            10 sensor tests · GISTEMP v4 · 5 formulas
          </span>
        </div>

        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-secondary shrink-0">
          <span>{isOpen ? "Hide audit" : "Expand audit"}</span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-ink-secondary" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-4 h-4 text-ink-secondary" aria-hidden="true" />
          )}
        </span>
      </button>

      {/* Expandable Scientific Proof Matrix + GISTEMP Panel */}
      {isOpen ? (
        <div
          id="scientific-proof-drawer-body"
          data-lenis-prevent
          className="mt-6 space-y-5 border-t border-white/10 pt-5"
        >
          {/* 10-Row Statistical Matrix */}
          <div
            tabIndex={0}
            role="region"
            aria-labelledby="scientific-matrix-caption"
            data-lenis-prevent
            className="proof-table-wrapper glass-well glass-scroll rounded-xl border border-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dipole-cyan"
          >
            <table className="proof-table text-left text-xs">
              <caption
                id="scientific-matrix-caption"
                className="px-4 py-3 text-left font-mono text-[11px] uppercase tracking-[0.1em] text-ink-secondary border-b border-white/10 bg-canvas-950/80"
              >
                Full Deseasonalized Mann-Kendall, Sen&apos;s Slope &amp; Pettitt Breakpoint Matrix (5 NASA POWER Variables × 2 Regions)
              </caption>
              <thead>
                <tr className="border-b border-white/10 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-secondary">
                  <th scope="col" className="px-3 py-2.5">
                    Severity &amp; Variable / Heritage
                  </th>
                  <th scope="col" className="px-3 py-2.5">
                    Region &amp; DMS
                  </th>
                  <th scope="col" className="px-2.5 py-2.5 whitespace-nowrap">
                    N
                  </th>
                  <th scope="col" className="px-3 py-2.5 whitespace-nowrap">
                    MK <Tex math="Z" /> &amp; <Tex math="p" />
                  </th>
                  <th scope="col" className="px-3 py-2.5">
                    Sen&apos;s Slope / Dec
                  </th>
                  <th scope="col" className="px-3 py-2.5 whitespace-nowrap">
                    95% CI
                  </th>
                  <th scope="col" className="px-3 py-2.5">
                    Pettitt Shift (<Tex math="K_T" /> &amp; Date)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {rows.map((row) => {
                  const { trend, meta } = row;
                  const badgeStyle = getSeverityBadgeStyle(
                    trend.significanceLevel,
                    trend.isAvailable
                  );
                  return (
                    <tr
                      key={row.key}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      <th
                        scope="row"
                        className="px-3 py-2.5 font-normal border-r border-white/[0.06]"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-[72px] h-7 rounded font-mono text-xs font-bold flex items-center justify-center shrink-0 tabular-nums ${badgeStyle}`}
                          >
                            {trend.isAvailable ? (
                              <Tex math={`\\tau = ${texNum(trend.mannKendallTau, 2)}`} />
                            ) : (
                              "N/A"
                            )}
                          </span>
                          <div className="min-w-0">
                            <div className="font-mono font-semibold text-ink-primary">
                              {meta.code}
                            </div>
                            <div className="font-mono text-[11px] text-ink-muted leading-tight">
                              {meta.nasaInstrumentHeritage}
                            </div>
                          </div>
                        </div>
                      </th>
                      <td
                        data-col-label="Region & DMS"
                        className="px-3 py-2.5"
                      >
                        <div className={`font-semibold leading-tight ${row.accent}`}>
                          {row.regionLabel}: {row.regionName}
                        </div>
                        <div className="font-mono text-[11px] text-ink-muted">
                          {row.dms}
                        </div>
                      </td>
                      <td
                        data-col-label="Sample N"
                        className="px-2.5 py-2.5 font-mono tabular-nums text-ink-primary whitespace-nowrap"
                      >
                        {trend.sampleCount} mo
                      </td>
                      <td
                        data-col-label="MK Z & p-val"
                        className="px-3 py-2.5 font-mono tabular-nums whitespace-nowrap"
                      >
                        {trend.isAvailable ? (
                          <div>
                            <div className="text-ink-primary">
                              <Tex math={`Z = ${texNum(trend.zScore, 2, true)}`} />
                            </div>
                            <div className="text-[11px] text-ink-secondary">
                              <Tex math={texP(trend.pValue)} />
                            </div>
                          </div>
                        ) : (
                          <span className="text-ink-muted">Ocean Grid N/A</span>
                        )}
                      </td>
                      <td
                        data-col-label="Sen's Slope"
                        className="px-3 py-2.5 font-mono tabular-nums text-ink-primary whitespace-nowrap"
                      >
                        {trend.isAvailable
                          ? `${trend.sensSlopePerDecade > 0 ? "+" : ""}${trend.sensSlopePerDecade.toFixed(4)} ${trend.unit}`
                          : "—"}
                      </td>
                      <td
                        data-col-label="95% CI"
                        className="px-3 py-2.5 font-mono tabular-nums text-ink-secondary whitespace-nowrap"
                      >
                        {trend.isAvailable
                          ? `[${trend.confidenceInterval95[0].toFixed(4)}, ${trend.confidenceInterval95[1].toFixed(4)}]`
                          : "—"}
                      </td>
                      <td
                        data-col-label="Pettitt Shift"
                        className="px-3 py-2.5 font-mono tabular-nums whitespace-nowrap"
                      >
                        {trend.isAvailable ? (
                          <div>
                            <div className="text-[#F87171] font-semibold">
                              {trend.changePointDate}
                            </div>
                            <div className="text-[11px] text-ink-muted">
                              <Tex
                                math={`K_T = ${Math.round(trend.pettittStatistic).toLocaleString("en-US").replace(/,/g, "{,}")}`}
                              />
                            </div>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Full NASA GISTEMP v4 Cross-Validation Benchmark & Methodology Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5 glass-well rounded-xl p-4 sm:p-5 space-y-3 border border-nominal-green/25">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-nominal-green font-semibold">
                  NASA GISTEMP v4 calibration
                </span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase px-2.5 py-0.5 rounded-full bg-nominal-green/15 text-nominal-green border border-nominal-green/40">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-nominal-green"
                    aria-hidden="true"
                  />
                  <span>{gv.isCalibrated ? "CALIBRATED" : "CHECK"}</span>
                </span>
              </div>

              <p className="text-sm leading-relaxed text-ink-secondary">
                This dashboard runs its exact{" "}
                <code className="font-mono text-ink-primary">mannKendallTest()</code>{" "}
                and{" "}
                <code className="font-mono text-ink-primary">
                  sensSlopePerDecade()
                </code>{" "}
                routines against NASA&apos;s global temperature anomaly benchmark (
                {gv.datasetName}, {gv.period}) to confirm zero calculation drift.
              </p>

              <dl className="grid grid-cols-2 gap-2.5 font-mono text-xs pt-1">
                <div className="bg-canvas-950/80 rounded-lg p-2.5 border border-white/[0.06]">
                  <dt className="text-[11px] text-ink-muted uppercase">
                    Published Ref Slope
                  </dt>
                  <dd className="text-ink-primary font-bold tabular-nums mt-1 text-sm">
                    <Tex
                      math={`${texNum(gv.publishedReferenceSlopePerDecade, 4, true)}${DEG_C_PER_DECADE}`}
                    />
                  </dd>
                </div>
                <div className="bg-canvas-950/80 rounded-lg p-2.5 border border-white/[0.06]">
                  <dt className="text-[11px] text-ink-muted uppercase">
                    Engine Slope
                  </dt>
                  <dd className="text-nominal-green font-bold tabular-nums mt-1 text-sm">
                    <Tex
                      math={`${texNum(gv.computedSlopePerDecade, 4, true)}${DEG_C_PER_DECADE}`}
                    />
                  </dd>
                </div>
                <div className="bg-canvas-950/80 rounded-lg p-2.5 border border-white/[0.06]">
                  <dt className="text-[11px] text-ink-muted uppercase">
                    Deviation %
                  </dt>
                  <dd className="text-ink-primary font-bold tabular-nums mt-1 text-sm">
                    <Tex math={`${gv.deviationPct.toFixed(2)}\\%`} />
                  </dd>
                </div>
                <div className="bg-canvas-950/80 rounded-lg p-2.5 border border-white/[0.06]">
                  <dt className="text-[11px] text-ink-muted uppercase">
                    GISTEMP Kendall
                  </dt>
                  <dd className="text-ink-primary font-bold tabular-nums mt-1 text-sm">
                    <Tex
                      math={`\\tau = ${texNum(gv.mannKendallTau, 3)},\\; ${texP(gv.mannKendallPValue)}`}
                    />
                  </dd>
                </div>
              </dl>
            </div>

            <div className="lg:col-span-7 glass-well rounded-xl p-4 sm:p-5 space-y-3.5">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-secondary font-semibold">
                <BookOpenCheck
                  className="w-4 h-4 text-dipole-cyan shrink-0"
                  aria-hidden="true"
                />
                <span>Deterministic mathematical formulas</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {FORMULA_CARDS.map((card) => (
                  <div
                    key={card.title}
                    className={`bg-canvas-950/80 rounded-lg p-3 border border-white/[0.06] min-w-0 ${
                      card.wide ? "sm:col-span-2" : ""
                    }`}
                  >
                    <div
                      className={`font-mono text-xs font-semibold ${card.accent}`}
                    >
                      {card.title}
                    </div>
                    <div
                      data-lenis-prevent
                      className="mt-2 space-y-1.5 overflow-x-auto overflow-y-hidden text-ink-primary glass-scroll"
                    >
                      {card.equations.map((eq) => (
                        <Tex key={eq} math={eq} display />
                      ))}
                    </div>
                    <p className="text-xs text-ink-secondary mt-2 leading-relaxed">
                      {card.note}
                    </p>
                  </div>
                ))}
              </div>

              {/* Verified Partner & NASA Challenge Resources */}
              <div className="pt-2 flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
                  Data &amp; archives:
                </span>
                {NASA_CHALLENGE_RESOURCES.map((res) => (
                  <a
                    key={res.url}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-mono text-[11px] px-2.5 py-1 rounded-md bg-canvas-950/80 border border-white/10 text-dipole-cyan hover:border-dipole-cyan/50 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dipole-cyan"
                  >
                    <span>{res.name}</span>
                    <ExternalLink className="w-3 h-3" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
