"use client";

import { BookOpenCheck, ChevronDown, ChevronUp, ExternalLink, FlaskConical } from "lucide-react";
import { NASA_CHALLENGE_RESOURCES, NASA_VARIABLES } from "@/data/nasaVariables";
import { formatDMS } from "@/lib/nasaPowerClient";
import type {
  DualRegionAnalysisReport,
  NasaVariableCode,
  SignificanceLevel,
  ViewLayerMode,
} from "@/types/climate";

interface ScientificProofDrawerProps {
  report: DualRegionAnalysisReport;
  viewMode: ViewLayerMode;
  isOpen: boolean;
  onToggleOpen: () => void;
}

const VARIABLE_LIST: NasaVariableCode[] = [
  "ALLSKY_SFC_SW_DWN",
  "GWETROOT",
  "TS",
  "PRECTOTCORR",
  "T2M",
];

function getSeverityBadgeStyle(sig: SignificanceLevel, isAvailable: boolean): string {
  if (!isAvailable) {
    return "bg-white/5 text-ink-muted border border-white/10";
  }
  if (sig === "HIGHLY_SIGNIFICANT") {
    return "bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40";
  }
  if (sig === "SIGNIFICANT") {
    return "bg-[#EAB308]/20 text-[#EAB308] border border-[#EAB308]/40";
  }
  return "bg-white/5 text-ink-secondary border border-white/15";
}

function formatPVal(p: number): string {
  return p < 0.001 ? p.toExponential(2) : p.toFixed(4);
}

export default function ScientificProofDrawer({
  report,
  viewMode,
  isOpen,
  onToggleOpen,
}: ScientificProofDrawerProps) {
  const expanded = isOpen || viewMode === "scientific";

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
    <section
      id="scientific-proof-section"
      aria-labelledby="scientific-proof-heading"
      className={`hud-panel rounded-xl p-3.5 transition ${
        viewMode === "scientific" ? "ring-1 ring-nominal-green/50" : ""
      }`}
    >
      {/* Header + Quick-Toggle Button */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-nominal-green" aria-hidden="true" />
          <h2
            id="scientific-proof-heading"
            className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-primary"
          >
            Scientific Proof Matrix &amp; NASA GISTEMP v4 Cross-Validation
          </h2>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-canvas-950 border border-white/10 text-ink-secondary">
            10-Row Non-Parametric Audit
          </span>
        </div>

        <button
          type="button"
          aria-expanded={expanded}
          aria-controls="scientific-proof-drawer-body"
          onClick={onToggleOpen}
          className="min-h-[30px] px-3 py-1 rounded-lg hud-well hover:bg-panel-800 border border-white/10 text-xs font-mono text-ink-primary flex items-center gap-1.5 transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-nominal-green"
        >
          <span>{expanded ? "Collapse Statistical Matrix" : "Expand Statistical Matrix"}</span>
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-ink-secondary" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-ink-secondary" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Expandable Scientific Proof Matrix + GISTEMP Panel */}
      {expanded ? (
        <div id="scientific-proof-drawer-body" className="mt-3.5 space-y-4">
          {/* 10-Row Statistical Matrix */}
          <div
            tabIndex={0}
            role="region"
            aria-labelledby="scientific-matrix-caption"
            className="proof-table-wrapper hud-well rounded-lg border border-white/10"
          >
            <table className="proof-table text-left text-[11px]">
              <caption
                id="scientific-matrix-caption"
                className="px-3 py-2 text-left font-mono text-[11px] uppercase tracking-[0.08em] text-ink-secondary border-b border-white/10 bg-canvas-900"
              >
                Full Deseasonalized Mann-Kendall, Sen&apos;s Slope &amp; Pettitt Breakpoint Matrix (5 NASA POWER Variables × 2 Regions)
              </caption>
              <thead>
                <tr className="border-b border-white/10 font-mono text-[10px] uppercase tracking-[0.06em] text-ink-secondary">
                  <th scope="col" className="px-2.5 py-2">
                    Severity &amp; Variable / Heritage
                  </th>
                  <th scope="col" className="px-2.5 py-2">
                    Region &amp; DMS
                  </th>
                  <th scope="col" className="px-2 py-2 whitespace-nowrap">
                    N
                  </th>
                  <th scope="col" className="px-2.5 py-2 whitespace-nowrap">
                    MK Z &amp; p-val
                  </th>
                  <th scope="col" className="px-2.5 py-2">
                    Sen&apos;s Slope / Dec
                  </th>
                  <th scope="col" className="px-2.5 py-2 whitespace-nowrap">
                    95% CI
                  </th>
                  <th scope="col" className="px-2.5 py-2">
                    Pettitt Shift (K_T &amp; Date)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rows.map((row) => {
                  const { trend, meta } = row;
                  const badgeStyle = getSeverityBadgeStyle(
                    trend.significanceLevel,
                    trend.isAvailable
                  );
                  return (
                    <tr
                      key={row.key}
                      className="hover:bg-panel-800/70 transition-colors"
                    >
                      <th
                        scope="row"
                        className="px-2.5 py-2 font-normal border-r border-white/5"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-16 h-7 rounded font-mono text-[11px] font-bold flex items-center justify-center shrink-0 tabular-nums ${badgeStyle}`}
                          >
                            {trend.isAvailable
                              ? `τ=${trend.mannKendallTau.toFixed(2)}`
                              : "N/A"}
                          </span>
                          <div className="min-w-0">
                            <div className="font-mono font-semibold text-ink-primary">
                              {meta.code}
                            </div>
                            <div className="text-[10px] text-ink-muted leading-tight">
                              {meta.nasaInstrumentHeritage}
                            </div>
                          </div>
                        </div>
                      </th>
                      <td
                        data-col-label="Region & DMS"
                        className="px-2.5 py-2"
                      >
                        <div className={`font-semibold leading-tight ${row.accent}`}>
                          {row.regionLabel}: {row.regionName}
                        </div>
                        <div className="font-mono text-[10px] text-ink-muted">
                          {row.dms}
                        </div>
                      </td>
                      <td
                        data-col-label="Sample N"
                        className="px-2 py-2 font-mono tabular-nums text-ink-primary whitespace-nowrap"
                      >
                        {trend.sampleCount} mo
                      </td>
                      <td
                        data-col-label="MK Z & p-val"
                        className="px-2.5 py-2 font-mono tabular-nums whitespace-nowrap"
                      >
                        {trend.isAvailable ? (
                          <div>
                            <div className="text-ink-primary">
                              Z = {trend.zScore > 0 ? "+" : ""}
                              {trend.zScore.toFixed(2)}
                            </div>
                            <div className="text-[10px] text-ink-secondary">
                              p = {formatPVal(trend.pValue)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-ink-muted">Ocean Grid N/A</span>
                        )}
                      </td>
                      <td
                        data-col-label="Sen's Slope"
                        className="px-2.5 py-2 font-mono tabular-nums text-ink-primary whitespace-nowrap"
                      >
                        {trend.isAvailable
                          ? `${trend.sensSlopePerDecade > 0 ? "+" : ""}${trend.sensSlopePerDecade.toFixed(4)} ${trend.unit}`
                          : "—"}
                      </td>
                      <td
                        data-col-label="95% CI"
                        className="px-2.5 py-2 font-mono tabular-nums text-ink-secondary whitespace-nowrap"
                      >
                        {trend.isAvailable
                          ? `[${trend.confidenceInterval95[0].toFixed(4)}, ${trend.confidenceInterval95[1].toFixed(4)}]`
                          : "—"}
                      </td>
                      <td
                        data-col-label="Pettitt Shift"
                        className="px-2.5 py-2 font-mono tabular-nums whitespace-nowrap"
                      >
                        {trend.isAvailable ? (
                          <div>
                            <div className="text-drought-coral font-semibold">
                              {trend.changePointDate}
                            </div>
                            <div className="text-[11px] text-ink-muted">
                              K_T = {Math.round(trend.pettittStatistic).toLocaleString("en-US")}
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
            <div className="lg:col-span-5 hud-well rounded-lg p-3.5 space-y-2.5 border border-nominal-green/25">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-nominal-green font-semibold">
                  NASA GISTEMP v4 CALIBRATION BENCHMARK
                </span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] px-2 py-0.5 rounded bg-nominal-green/15 text-nominal-green border border-nominal-green/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-nominal-green" aria-hidden="true" />
                  <span>{gv.isCalibrated ? "CALIBRATED" : "CHECK"}</span>
                </span>
              </div>

              <p className="text-xs text-ink-secondary leading-relaxed">
                This dashboard executes its exact runtime{" "}
                <code className="font-mono text-ink-primary">mannKendallTest()</code>{" "}
                and{" "}
                <code className="font-mono text-ink-primary">sensSlopePerDecade()</code>{" "}
                algorithms against NASA&apos;s official global surface anomaly record (
                {gv.datasetName}, {gv.period}) to prove zero statistical drift.
              </p>

              <dl className="grid grid-cols-2 gap-2 font-mono text-xs pt-1">
                <div className="bg-canvas-950 rounded p-2 border border-white/5">
                  <dt className="text-[10px] text-ink-muted uppercase">
                    Published Ref Slope
                  </dt>
                  <dd className="text-ink-primary font-bold tabular-nums mt-0.5">
                    +{gv.publishedReferenceSlopePerDecade.toFixed(4)} °C/dec
                  </dd>
                </div>
                <div className="bg-canvas-950 rounded p-2 border border-white/5">
                  <dt className="text-[10px] text-ink-muted uppercase">
                    Engine Computed Slope
                  </dt>
                  <dd className="text-nominal-green font-bold tabular-nums mt-0.5">
                    +{gv.computedSlopePerDecade.toFixed(4)} °C/dec
                  </dd>
                </div>
                <div className="bg-canvas-950 rounded p-2 border border-white/5">
                  <dt className="text-[10px] text-ink-muted uppercase">
                    Deviation %
                  </dt>
                  <dd className="text-ink-primary font-bold tabular-nums mt-0.5">
                    {gv.deviationPct.toFixed(2)}%
                  </dd>
                </div>
                <div className="bg-canvas-950 rounded p-2 border border-white/5">
                  <dt className="text-[10px] text-ink-muted uppercase">
                    GISTEMP Mann-Kendall
                  </dt>
                  <dd className="text-ink-primary font-bold tabular-nums mt-0.5">
                    τ={gv.mannKendallTau.toFixed(3)} · p={formatPVal(gv.mannKendallPValue)}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="lg:col-span-7 hud-well rounded-lg p-3.5 space-y-3">
              <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-secondary font-semibold">
                <BookOpenCheck className="w-3.5 h-3.5 text-dipole-cyan" aria-hidden="true" />
                <span>DETERMINISTIC MATHEMATICAL PIPELINE SUMMARY</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="bg-canvas-950 rounded p-2.5 border border-white/5">
                  <div className="font-mono text-[11px] font-semibold text-drought-orange">
                    1. Monthly Z-Score Deseasonalization
                  </div>
                  <p className="font-mono text-[11px] text-ink-secondary mt-1">
                    Z_(y,m) = (X_(y,m) − μ_m) / σ_m
                  </p>
                  <p className="text-[11px] text-ink-muted mt-0.5">
                    Strips wet/dry monsoon cycles across m ∈ &#123;1..12&#125;.
                  </p>
                </div>

                <div className="bg-canvas-950 rounded p-2.5 border border-white/5">
                  <div className="font-mono text-[11px] font-semibold text-dipole-cyan">
                    2. Mann-Kendall &amp; Sen&apos;s Slope
                  </div>
                  <p className="font-mono text-[11px] text-ink-secondary mt-1">
                    Q_dec = median((x_j − x_i) / (j − i)) × 120
                  </p>
                  <p className="text-[11px] text-ink-muted mt-0.5">
                    Tie-corrected Var(S) and rank-based 95% confidence interval.
                  </p>
                </div>

                <div className="bg-canvas-950 rounded p-2.5 border border-white/5">
                  <div className="font-mono text-[11px] font-semibold text-drought-coral">
                    3. Pettitt Non-Parametric Change-Point
                  </div>
                  <p className="font-mono text-[11px] text-ink-secondary mt-1">
                    U_(t,T) = ΣΣ sgn(x_i − x_j), K_T = max|U|
                  </p>
                  <p className="text-[11px] text-ink-muted mt-0.5">
                    Isolates sharpest historical regime shift month (YYYY-MM).
                  </p>
                </div>

                <div className="bg-canvas-950 rounded p-2.5 border border-white/5">
                  <div className="font-mono text-[11px] font-semibold text-radar-gold">
                    4. Cross-Correlation Lead-Lag Cascade
                  </div>
                  <p className="font-mono text-[11px] text-ink-secondary mt-1">
                    r_XY(k) = corr(X_t, Y_(t+k)), k ∈ [0..6] mo
                  </p>
                  <p className="text-[11px] text-ink-muted mt-0.5">
                    Detects root-zone soil drying before rainfall collapses.
                  </p>
                </div>
              </div>

              {/* Verified Partner & NASA Challenge Resources */}
              <div className="pt-1 flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted">
                  Data &amp; Partner Archives:
                </span>
                {NASA_CHALLENGE_RESOURCES.map((res) => (
                  <a
                    key={res.url}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded bg-canvas-950 border border-white/10 text-dipole-cyan hover:border-dipole-cyan/50 transition"
                  >
                    <span>{res.name}</span>
                    <ExternalLink className="w-2.5 h-2.5" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
