"use client";

import { useState } from "react";
import { Layers } from "lucide-react";
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
import {
  buildEvidenceCaption,
  describeTrendDirection,
  FRIENDLY_VARIABLES,
} from "@/lib/narrative";
import type {
  DualRegionAnalysisReport,
  MonthlyObservation,
  NasaVariableCode,
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

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload?: MonthlyObservation;
    value?: number;
  }>;
  label?: string | number;
  trend: TrendAnalysisResult;
  mode: SeriesDisplayMode;
}

/** Hover tooltip preserves formal statistical context while keeping charts jargon-free. */
function CustomChartTooltip({
  active,
  payload,
  label,
  trend,
  mode,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="bg-canvas-950/95 border border-white/15 rounded-lg px-3.5 py-2.5 shadow-xl text-xs font-mono space-y-1">
      <div className="text-ink-primary font-semibold text-[13px]">
        {String(label ?? point.dateLabel)}
      </div>
      <div className="text-ink-secondary">
        Anomaly (Z):{" "}
        <span className="text-ink-primary font-bold">
          <Tex math={`${texNum(point.deseasonalizedZ, 2, true)}\\,\\sigma`} />
        </span>
      </div>
      <div className="text-ink-secondary">
        Monthly value:{" "}
        <span className="text-ink-primary font-bold">
          {point.rawValue.toFixed(3)} {trend.unit}
        </span>
      </div>
      {trend.isAvailable ? (
        <div className="pt-1 border-t border-white/10 text-[11px] text-ink-muted space-y-0.5">
          <div>
            Mann-Kendall <Tex math={`\\tau = ${texNum(trend.mannKendallTau, 3)}`} /> ·{" "}
            <Tex math={texP(trend.pValue)} />
          </div>
          <div>
            Sen&apos;s slope: {trend.sensSlopePerDecade > 0 ? "+" : ""}
            {trend.sensSlopePerDecade.toFixed(4)} {trend.unit}/dec
          </div>
        </div>
      ) : null}
      <div className="text-[11px] text-ink-muted">
        View: {mode === "zscore" ? "Seasonal cycle removed" : `Raw (${trend.unit})`}
      </div>
    </div>
  );
}

interface SingleRegionChartCardProps {
  badgeText: string;
  regionName: string;
  dms: string;
  variable: NasaVariableCode;
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
  variable,
  trend,
  accentColor,
  gradientId,
  mode,
  isLoading,
}: SingleRegionChartCardProps) {
  const dataKey = mode === "zscore" ? "deseasonalizedZ" : "rawValue";
  const directionLabel = trend.isAvailable
    ? describeTrendDirection(variable, trend)
    : "Ocean grid N/A";

  // Flip annotation label inward if change-point falls in the final quarter of the timeline.
  const shiftIdx = trend.series.findIndex((p) => p.dateLabel === trend.changePointDate);
  const labelPosition =
    shiftIdx >= 0 && trend.series.length > 0 && shiftIdx / trend.series.length > 0.72
      ? "insideTopLeft"
      : "insideTopRight";

  return (
    <div className="glass-well rounded-xl p-4 sm:p-5 flex flex-col gap-3.5 min-w-0">
      {/* Clean Plain-English Card Header (No statistics jargon on surface) */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              className="px-2 py-0.5 rounded font-mono text-[11px] font-semibold uppercase tracking-[0.12em] border"
              style={{
                color: accentColor,
                borderColor: `${accentColor}66`,
                backgroundColor: `${accentColor}1A`,
              }}
            >
              {badgeText}
            </span>
            <h3 className="text-base font-semibold text-ink-primary truncate">
              {regionName}
            </h3>
          </div>
          <p className="font-mono text-xs text-ink-muted">{dms}</p>
        </div>

        <span
          className="px-2.5 py-1 rounded-full border text-xs font-medium capitalize shrink-0"
          style={{
            color: trend.isAvailable ? accentColor : "#939DAE",
            borderColor: trend.isAvailable ? `${accentColor}55` : "rgba(255,255,255,0.12)",
            backgroundColor: trend.isAvailable ? `${accentColor}14` : "rgba(255,255,255,0.04)",
          }}
        >
          {directionLabel}
        </span>
      </div>

      {/* Recessed Chart Well */}
      <div className="bg-canvas-950/75 border border-white/[0.06] rounded-lg p-3 h-[268px] w-full min-w-0 relative">
        {isLoading ? (
          <div
            role="status"
            aria-label={`Loading time-series for ${regionName}`}
            className="h-full w-full flex flex-col justify-center gap-3 animate-pulse"
          >
            <div className="h-3 w-1/3 rounded bg-panel-800" />
            <div className="h-36 w-full rounded bg-panel-850" />
            <div className="text-sm font-mono text-dipole-cyan">
              Querying NASA POWER v2 monthly grid…
            </div>
          </div>
        ) : !trend.isAvailable || trend.series.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-center px-6">
            <p className="text-sm leading-relaxed text-ink-secondary max-w-md">
              {FRIENDLY_VARIABLES[variable].name} ({variable}) is available on land
              coordinates only. Select Rainfall or Surface heat to compare this ocean grid.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240} minWidth={0}>
            <ComposedChart
              data={trend.series}
              syncId="nusashift-dual-region"
              margin={{ top: 18, right: 14, left: -4, bottom: 4 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={accentColor} stopOpacity={0.28} />
                  <stop offset="95%" stopColor={accentColor} stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="2 2"
                vertical={false}
              />
              <XAxis
                dataKey="dateLabel"
                stroke="#939DAE"
                tick={{ fill: "#B4BCC9", fontSize: 11, fontFamily: "monospace" }}
                minTickGap={48}
              />
              <YAxis
                stroke="#939DAE"
                tick={{ fill: "#B4BCC9", fontSize: 11, fontFamily: "monospace" }}
                width={50}
              />
              <Tooltip
                content={<CustomChartTooltip trend={trend} mode={mode} />}
              />
              {mode === "zscore" ? (
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
              ) : null}
              <ReferenceLine
                x={trend.changePointDate}
                stroke="#EF4444"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `Regime shift: ${trend.changePointDate}`,
                  position: labelPosition,
                  fill: "#F87171",
                  fontSize: 12,
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
                strokeWidth={1.75}
                dot={false}
                activeDot={{ r: 4, fill: accentColor, stroke: "#05070B" }}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

/** Evidence deck: one friendly-named indicator at a time with 1 regime-shift annotation. */
export default function DualRegionCharts({
  report,
  activeVariable,
  isLoading = false,
  onSelectVariable,
}: DualRegionChartsProps) {
  const [seriesMode, setSeriesMode] = useState<SeriesDisplayMode>("zscore");

  const activeMeta = NASA_VARIABLES[activeVariable];
  const friendlyActive = FRIENDLY_VARIABLES[activeVariable];
  const trendA = report.trendsA[activeVariable];
  const trendB = report.trendsB[activeVariable];
  const captionText = buildEvidenceCaption(report, activeVariable);

  return (
    <div
      aria-label="Synchronized dual-region evidence charts"
      className="glass-panel rounded-xl p-5 sm:p-6 space-y-5"
    >
      {/* Controls Bar: Friendly Variable Switcher + Normalization Mode */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-lg font-semibold text-ink-primary">
              {friendlyActive.name} ({report.startYear}–{report.endYear})
            </h3>
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
              {activeMeta.code} · {activeMeta.unit}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-ink-secondary max-w-2xl">
            {activeMeta.studentDefinition}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Friendly Variable Selector */}
          <div
            role="toolbar"
            aria-label="Choose climate indicator to chart"
            className="glass-well p-1.5 rounded-lg flex flex-wrap items-center gap-1"
          >
            {VARIABLE_ORDER.map((code) => {
              const selected = activeVariable === code;
              const friendly = FRIENDLY_VARIABLES[code];
              return (
                <button
                  key={code}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onSelectVariable(code)}
                  className={`min-h-[34px] px-3 py-1 rounded-md text-left transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-drought-orange ${
                    selected
                      ? "bg-white/[0.12] text-ink-primary border border-drought-orange/55"
                      : "text-ink-secondary hover:text-ink-primary hover:bg-white/[0.05] border border-transparent"
                  }`}
                >
                  <span className="block text-[13px] font-medium leading-tight">
                    {friendly.name}
                  </span>
                  <span className="block font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted leading-tight">
                    {code === "ALLSKY_SFC_SW_DWN" ? "SW_DWN" : code}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Series Normalization Mode */}
          <div
            role="toolbar"
            aria-label="Series display scale"
            className="glass-well p-1.5 rounded-lg flex items-center gap-1"
          >
            <button
              type="button"
              aria-pressed={seriesMode === "zscore"}
              onClick={() => setSeriesMode("zscore")}
              className={`min-h-[34px] px-3 py-1.5 rounded-md text-[13px] font-medium flex items-center gap-1.5 transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dipole-cyan ${
                seriesMode === "zscore"
                  ? "bg-white/[0.12] text-ink-primary border border-dipole-cyan/50"
                  : "text-ink-secondary hover:text-ink-primary border border-transparent"
              }`}
            >
              <Layers className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Seasons removed</span>
            </button>
            <button
              type="button"
              aria-pressed={seriesMode === "raw"}
              onClick={() => setSeriesMode("raw")}
              className={`min-h-[34px] px-3 py-1.5 rounded-md text-[13px] font-medium transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dipole-cyan ${
                seriesMode === "raw"
                  ? "bg-white/[0.12] text-ink-primary border border-dipole-cyan/50"
                  : "text-ink-secondary hover:text-ink-primary border border-transparent"
              }`}
            >
              <span>Raw monthly</span>
            </button>
          </div>
        </div>
      </div>

      {/* Synchronized Dual-Region Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SingleRegionChartCard
          badgeText="REGION A"
          regionName={report.regionA.name}
          dms={formatDMS(report.regionA.lat, report.regionA.lon)}
          variable={activeVariable}
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
          variable={activeVariable}
          trend={trendB}
          accentColor="#06B6D4"
          gradientId="nusashift-grad-b"
          mode={seriesMode}
          isLoading={isLoading}
        />
      </div>

      {/* One-Sentence Plain-English Chart Caption */}
      <p className="text-sm sm:text-[15px] leading-relaxed text-ink-secondary border-t border-white/[0.08] pt-3.5">
        {captionText}
      </p>
    </div>
  );
}
