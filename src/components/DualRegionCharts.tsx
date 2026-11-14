"use client";

import { useState } from "react";
import { Activity, Layers } from "lucide-react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Tex from "@/components/math/Tex";
import { texNum, texP } from "@/components/math/texFormat";
import { NASA_VARIABLES } from "@/data/nasaVariables";
import { formatDMS } from "@/lib/nasaPowerClient";
import type {
  DualRegionAnalysisReport,
  MonthlyObservation,
  NasaVariableCode,
  SignificanceLevel,
  TrendAnalysisResult,
} from "@/types/climate";

interface DualRegionChartsProps {
  report: DualRegionAnalysisReport;
  activeVariable: NasaVariableCode;
  isLoading?: boolean;
  onSelectVariable: (variable: NasaVariableCode) => void;
}

type SeriesDisplayMode = "zscore" | "raw";

const VARIABLE_ORDER: NasaVariableCode[] = [
  "GWETROOT",
  "PRECTOTCORR",
  "TS",
  "ALLSKY_SFC_SW_DWN",
  "T2M",
];

function formatSignificanceBadge(sig: SignificanceLevel): {
  label: string;
  tex?: string;
  classes: string;
} {
  if (sig === "HIGHLY_SIGNIFICANT") {
    return {
      label: "HIGHLY SIGNIFICANT",
      tex: "p < 0.01",
      classes:
        "bg-drought-coral/20 text-drought-coral border-drought-coral/40",
    };
  }
  if (sig === "SIGNIFICANT") {
    return {
      label: "SIGNIFICANT",
      tex: "p < 0.05",
      classes: "bg-radar-gold/20 text-radar-gold border-radar-gold/40",
    };
  }
  return {
    label: "SEASONAL NOISE",
    classes: "bg-white/5 text-ink-secondary border-white/10",
  };
}


interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload?: MonthlyObservation;
    value?: number;
  }>;
  label?: string | number;
  unit: string;
  mode: SeriesDisplayMode;
}

function CustomChartTooltip({
  active,
  payload,
  label,
  unit,
  mode,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="bg-canvas-950/95 border border-white/15 rounded-lg px-2.5 py-2 shadow-xl text-[11px] font-mono space-y-0.5">
      <div className="text-ink-primary font-semibold">{String(label ?? point.dateLabel)}</div>
      <div className="text-ink-secondary">
        Deseasonalized Z:{" "}
        <span className="text-ink-primary font-bold">
          <Tex math={`${texNum(point.deseasonalizedZ, 2, true)}\\,\\sigma`} />
        </span>
      </div>
      <div className="text-ink-secondary">
        Monthly Observation:{" "}
        <span className="text-ink-primary font-bold">
          {point.rawValue.toFixed(3)} {unit}
        </span>
      </div>
      <div className="text-[10px] text-ink-muted">
        Active plot: {mode === "zscore" ? "Z-Score Anomaly" : `Raw (${unit})`}
      </div>
    </div>
  );
}

interface SingleRegionChartCardProps {
  badgeText: string;
  regionName: string;
  dms: string;
  trend: TrendAnalysisResult;
  accentColor: string;
  gradientId: string;
  mode: SeriesDisplayMode;
  isLoading: boolean;
}

function SingleRegionChartCard({
  badgeText,
  regionName,
  dms,
  trend,
  accentColor,
  gradientId,
  mode,
  isLoading,
}: SingleRegionChartCardProps) {
  const sigBadge = formatSignificanceBadge(trend.significanceLevel);
  const dataKey = mode === "zscore" ? "deseasonalizedZ" : "rawValue";

  return (
    <div className="hud-well rounded-xl p-3 flex flex-col gap-2.5 min-w-0">
      {/* Compact Telemetry Strip */}
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="px-1.5 py-0.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider border"
              style={{
                color: accentColor,
                borderColor: `${accentColor}66`,
                backgroundColor: `${accentColor}1A`,
              }}
            >
              {badgeText}
            </span>
            <h3 className="text-sm font-semibold text-ink-primary truncate">
              {regionName}
            </h3>
            <span className="font-mono text-[11px] text-ink-muted">{dms}</span>
          </div>

          <div className="mt-1.5 flex items-center gap-3 flex-wrap font-mono text-[11px] tabular-nums">
            <span className="text-ink-secondary">
              Mann-Kendall{" "}
              <strong className="text-ink-primary">
                {trend.isAvailable ? (
                  <Tex math={`\\tau = ${texNum(trend.mannKendallTau, 3)}`} />
                ) : (
                  <Tex math="\tau = \text{N/A}" />
                )}
              </strong>
            </span>
            <span className="text-ink-secondary">
              <strong className="text-ink-primary">
                {trend.isAvailable ? <Tex math={texP(trend.pValue)} /> : "p: N/A"}
              </strong>
            </span>
            <span className="text-ink-secondary">
              Sen&apos;s Slope/dec:{" "}
              <strong className="text-ink-primary">
                {trend.isAvailable
                  ? `${trend.sensSlopePerDecade > 0 ? "+" : ""}${trend.sensSlopePerDecade.toFixed(3)} ${trend.unit} [${trend.confidenceInterval95[0].toFixed(3)}, ${trend.confidenceInterval95[1].toFixed(3)}]`
                  : "Ocean grid N/A"}
              </strong>
            </span>
          </div>
        </div>

        <span
          className={`px-2 py-0.5 rounded border font-mono text-[10px] font-bold uppercase tracking-wider shrink-0 ${sigBadge.classes}`}
        >
          {trend.isAvailable ? (
            <>
              {sigBadge.label}
              {sigBadge.tex ? (
                <>
                  {" "}
                  <Tex math={sigBadge.tex} />
                </>
              ) : null}
            </>
          ) : (
            "OCEAN GRID N/A"
          )}
        </span>
      </div>

      {/* Recessed Chart Well */}
      <div className="bg-[#090B0E] border border-white/5 rounded-lg p-3 h-[250px] w-full min-w-0 relative">
        {isLoading ? (
          <div
            role="status"
            aria-label={`Loading time-series for ${regionName}`}
            className="h-full w-full flex flex-col justify-center gap-2.5 animate-pulse"
          >
            <div className="h-3 w-1/3 rounded bg-panel-800" />
            <div className="h-32 w-full rounded bg-panel-850" />
            <div className="text-[11px] font-mono text-dipole-cyan">
              Querying NASA POWER v2 monthly grid...
            </div>
          </div>
        ) : !trend.isAvailable || trend.series.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-center px-4">
            <p className="font-mono text-xs text-ink-secondary">
              {trend.variable} is unavailable for deep ocean coordinates (NASA
              GLDAS land-only parameter). Switch to PRECTOTCORR or TS for ocean
              teleconnection tracking.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={224} minWidth={0}>
            <ComposedChart
              data={trend.series}
              syncId="nusashift-dual-region"
              margin={{ top: 14, right: 12, left: -12, bottom: 2 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={accentColor} stopOpacity={0.28} />
                  <stop offset="95%" stopColor={accentColor} stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="rgba(255,255,255,0.05)"
                strokeDasharray="2 2"
                vertical={false}
              />
              <XAxis
                dataKey="dateLabel"
                stroke="#5E6778"
                tick={{ fill: "#9BA3B2", fontSize: 10, fontFamily: "monospace" }}
                minTickGap={40}
              />
              <YAxis
                stroke="#5E6778"
                tick={{ fill: "#9BA3B2", fontSize: 10, fontFamily: "monospace" }}
                width={46}
              />
              <Tooltip
                content={
                  <CustomChartTooltip unit={trend.unit} mode={mode} />
                }
              />
              {mode === "zscore" ? (
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.22)" />
              ) : null}
              <ReferenceLine
                x={trend.changePointDate}
                stroke="#EF4444"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `Shift: ${trend.changePointDate}`,
                  position: "insideTopRight",
                  fill: "#EF4444",
                  fontSize: 10,
                  fontFamily: "monospace",
                }}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                fill={`url(#${gradientId})`}
                stroke="none"
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={accentColor}
                strokeWidth={1.6}
                dot={false}
                activeDot={{ r: 3.5, fill: accentColor, stroke: "#090B0E" }}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default function DualRegionCharts({
  report,
  activeVariable,
  isLoading = false,
  onSelectVariable,
}: DualRegionChartsProps) {
  const [seriesMode, setSeriesMode] = useState<SeriesDisplayMode>("zscore");

  const activeMeta = NASA_VARIABLES[activeVariable];
  const trendA = report.trendsA[activeVariable];
  const trendB = report.trendsB[activeVariable];

  return (
    <section
      aria-label="Synchronized dual-region time-series analytics deck"
      className="hud-panel rounded-xl p-3.5 space-y-3"
    >
      {/* Header Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-2.5">
        <div className="space-y-0.5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-secondary flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-drought-orange" aria-hidden="true" />
            <span>
              SYNCHRONIZED DUAL-REGION TELEMETRY ({report.startYear}–
              {report.endYear}) · {activeMeta.label}
            </span>
          </h2>
          <p className="text-xs text-ink-secondary">
            {activeMeta.studentDefinition}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Active Variable Selector Pills */}
          <div
            role="toolbar"
            aria-label="Chart NASA variable selector"
            className="hud-well p-1 rounded-lg flex flex-wrap items-center gap-1"
          >
            {VARIABLE_ORDER.map((code) => {
              const selected = activeVariable === code;
              return (
                <button
                  key={code}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onSelectVariable(code)}
                  className={`min-h-[28px] px-2 py-1 rounded text-[11px] font-mono transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-drought-orange ${
                    selected
                      ? "bg-panel-800 text-ink-primary border border-drought-orange/50 font-semibold"
                      : "text-ink-secondary hover:text-ink-primary hover:bg-panel-850 border border-transparent"
                  }`}
                >
                  {code}
                </button>
              );
            })}
          </div>

          {/* Series Mode Toggle */}
          <div
            role="toolbar"
            aria-label="Time-series normalization mode"
            className="hud-well p-1 rounded-lg flex items-center gap-1"
          >
            <button
              type="button"
              aria-pressed={seriesMode === "zscore"}
              onClick={() => setSeriesMode("zscore")}
              className={`min-h-[28px] px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-dipole-cyan ${
                seriesMode === "zscore"
                  ? "bg-panel-800 text-ink-primary border border-dipole-cyan/50"
                  : "text-ink-secondary hover:text-ink-primary border border-transparent"
              }`}
            >
              <Layers className="w-3 h-3" aria-hidden="true" />
              <span>Deseasonalized Z-Score Anomaly</span>
            </button>
            <button
              type="button"
              aria-pressed={seriesMode === "raw"}
              onClick={() => setSeriesMode("raw")}
              className={`min-h-[28px] px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-dipole-cyan ${
                seriesMode === "raw"
                  ? "bg-panel-800 text-ink-primary border border-dipole-cyan/50"
                  : "text-ink-secondary hover:text-ink-primary border border-transparent"
              }`}
            >
              <span>Raw Monthly Observations</span>
            </button>
          </div>
        </div>
      </div>

      {/* Synchronized Dual-Region Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        <SingleRegionChartCard
          badgeText="REGION A"
          regionName={report.regionA.name}
          dms={formatDMS(report.regionA.lat, report.regionA.lon)}
          trend={trendA}
          accentColor="#F97316"
          gradientId="nusashift-grad-a"
          mode={seriesMode}
          isLoading={isLoading}
        />

        <SingleRegionChartCard
          badgeText="REGION B"
          regionName={report.regionB.name}
          dms={formatDMS(report.regionB.lat, report.regionB.lon)}
          trend={trendB}
          accentColor="#06B6D4"
          gradientId="nusashift-grad-b"
          mode={seriesMode}
          isLoading={isLoading}
        />
      </div>
    </section>
  );
}
