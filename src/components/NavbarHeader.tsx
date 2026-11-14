"use client";

import { useState } from "react";
import { Download, Radar, Share2, Check } from "lucide-react";
import type { DualRegionAnalysisReport, ViewLayerMode } from "@/types/climate";

interface NavbarHeaderProps {
  report: DualRegionAnalysisReport;
  viewMode: ViewLayerMode;
  onViewModeChange: (mode: ViewLayerMode) => void;
  onShareUrl: () => Promise<boolean>;
  onExportBrief: () => void;
}

const VIEW_TABS: Array<{ id: ViewLayerMode; label: string; dotColor: string }> = [
  { id: "overview", label: "Overview & Map", dotColor: "bg-drought-orange" },
  { id: "lag_cascade", label: "Lag-Cascade", dotColor: "bg-radar-gold" },
  { id: "citizen", label: "Citizen View", dotColor: "bg-dipole-cyan" },
  { id: "scientific", label: "Scientific Proof", dotColor: "bg-nominal-green" },
];

export default function NavbarHeader({
  report,
  viewMode,
  onViewModeChange,
  onShareUrl,
  onExportBrief,
}: NavbarHeaderProps) {
  const [copied, setCopied] = useState(false);
  const [statusAnnouncement, setStatusAnnouncement] = useState("");

  const primaryTrend = report.trendsA[report.primaryVariable];
  const calibrationPct = Math.max(
    0,
    Math.min(100, 100 - report.gistempValidation.deviationPct)
  );

  const handleShareClick = async () => {
    const ok = await onShareUrl();
    if (ok) {
      setCopied(true);
      setStatusAnnouncement("Analysis link copied to clipboard.");
      setTimeout(() => {
        setCopied(false);
        setStatusAnnouncement("");
      }, 2200);
    } else {
      setStatusAnnouncement("Unable to access clipboard.");
    }
  };

  return (
    <header className="hud-panel rounded-xl px-3.5 py-2.5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-2.5">
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-2.5 min-w-0 shrink-0">
        <div
          className="w-8 h-8 rounded-lg hud-well flex items-center justify-center border border-drought-orange/35 shrink-0"
          aria-hidden="true"
        >
          <Radar className="w-4 h-4 text-drought-orange" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h1 className="text-sm font-bold tracking-tight text-ink-primary">
              NusaShift
            </h1>
            <span className="text-[10px] font-mono uppercase tracking-[0.06em] px-1.5 py-0.5 rounded bg-canvas-950 border border-white/10 text-ink-secondary">
              POWER v2 · MERRA-2 · GISTEMP v4
            </span>
          </div>
          <p className="text-[11px] text-ink-secondary truncate">
            Coupled Earth-System Regime &amp; Lag-Cascade Detective
          </p>
        </div>
      </div>

      {/* Center: Recessed Pill View Switcher */}
      <nav aria-label="Dashboard perspective selector" className="shrink-0">
        <div
          role="toolbar"
          aria-label="Analysis layer views"
          className="hud-well p-1 rounded-lg flex flex-wrap sm:flex-nowrap items-center gap-1"
        >
          {VIEW_TABS.map((tab) => {
            const active = viewMode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                aria-pressed={active}
                onClick={() => onViewModeChange(tab.id)}
                className={`min-h-[28px] px-2 py-1 rounded-md text-[11px] font-medium whitespace-nowrap flex items-center gap-1.5 transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-drought-orange ${
                  active
                    ? "bg-panel-800 text-ink-primary border border-white/15 shadow-sm"
                    : "text-ink-secondary hover:text-ink-primary hover:bg-panel-850 border border-transparent"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`w-1.5 h-1.5 rounded-full ${
                    active ? tab.dotColor : "bg-ink-muted"
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Right: Top-Level Numeric KPI Strip + Action Buttons */}
      <div className="flex items-center justify-between lg:justify-end gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div
              className={`font-mono tabular-nums text-base font-bold leading-tight ${
                report.isOppositeDirection
                  ? "text-drought-orange"
                  : "text-dipole-cyan"
              }`}
            >
              {report.dipoleCorrelationR.toFixed(2)}
            </div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-ink-secondary">
              Dipole Index (r)
            </div>
          </div>

          <div className="h-7 w-px bg-white/10" aria-hidden="true" />

          <div className="text-right">
            <div className="font-mono tabular-nums text-base font-bold leading-tight text-drought-coral">
              {primaryTrend.changePointDate}
            </div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-ink-secondary">
              Pettitt Regime Shift
            </div>
          </div>

          <div className="h-7 w-px bg-white/10" aria-hidden="true" />

          <div className="text-right">
            <div className="font-mono tabular-nums text-base font-bold leading-tight text-nominal-green">
              {calibrationPct.toFixed(1)}%
            </div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-ink-secondary">
              GISTEMP Calibration
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShareClick}
            className="min-h-[32px] px-2.5 py-1.5 rounded-lg hud-well hover:bg-panel-800 border border-white/10 text-xs font-medium text-ink-primary flex items-center gap-1.5 transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-drought-orange"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-nominal-green" aria-hidden="true" />
            ) : (
              <Share2 className="w-3.5 h-3.5 text-dipole-cyan" aria-hidden="true" />
            )}
            <span>{copied ? "Copied" : "Share URL"}</span>
          </button>

          <button
            type="button"
            onClick={onExportBrief}
            className="min-h-[32px] px-2.5 py-1.5 rounded-lg bg-drought-orange/15 hover:bg-drought-orange/25 border border-drought-orange/40 text-xs font-medium text-drought-orange flex items-center gap-1.5 transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-drought-orange"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Export Brief</span>
          </button>
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {statusAnnouncement}
      </p>
    </header>
  );
}
