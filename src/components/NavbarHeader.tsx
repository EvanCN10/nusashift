"use client";

import { useState } from "react";
import { Check, Download, Share2 } from "lucide-react";
import { CURATED_CASES } from "@/data/cachedCases";
import type { DualRegionAnalysisReport } from "@/types/climate";

interface NavbarHeaderProps {
  report: DualRegionAnalysisReport;
  onShareUrl: () => Promise<boolean>;
  onExportBrief: () => void;
}

/** Minimal hero top bar matching Rev 2 editorial space HUD composition. */
export default function NavbarHeader({
  report,
  onShareUrl,
  onExportBrief,
}: NavbarHeaderProps) {
  const [copied, setCopied] = useState(false);
  const [statusAnnouncement, setStatusAnnouncement] = useState("");

  const caseIndex = CURATED_CASES.findIndex((c) => c.caseId === report.caseId);
  const indexLabel =
    caseIndex >= 0
      ? `${String(caseIndex + 1).padStart(2, "0")} / ${String(
          CURATED_CASES.length
        ).padStart(2, "0")}`
      : "LIVE PROBE";

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
    <header className="relative z-20 h-14 px-5 sm:px-8 lg:px-12 flex items-center justify-between gap-4 border-b border-white/[0.06]">
      {/* Left: Brand */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="font-display text-2xl leading-none tracking-tight text-ink-primary">
          NusaShift
        </span>
        <span className="hidden sm:inline-block h-3.5 w-px bg-white/15" aria-hidden="true" />
        <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted truncate">
          POWER v2 · MERRA-2 · GISTEMP v4
        </span>
      </div>

      {/* Center: Telemetry Sequence Index */}
      <div className="hidden md:flex items-center gap-2 font-mono text-[11px] tracking-[0.16em] text-ink-secondary">
        <span
          aria-hidden="true"
          className={`w-1.5 h-1.5 rounded-full ${
            caseIndex >= 0 ? "bg-drought-orange" : "bg-nominal-green"
          }`}
        />
        <span>{indexLabel}</span>
      </div>

      {/* Right: Quiet Text Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={handleShareClick}
          className="min-h-[32px] px-1.5 py-1 rounded-md inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-secondary hover:text-ink-primary transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-drought-orange"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-nominal-green" aria-hidden="true" />
          ) : (
            <Share2 className="w-3.5 h-3.5 text-dipole-cyan" aria-hidden="true" />
          )}
          <span>{copied ? "Copied" : "Share"}</span>
        </button>

        <span className="h-3.5 w-px bg-white/12" aria-hidden="true" />

        <button
          type="button"
          onClick={onExportBrief}
          className="min-h-[32px] px-1.5 py-1 rounded-md inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-secondary hover:text-drought-orange transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-drought-orange"
        >
          <Download className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Export brief</span>
        </button>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {statusAnnouncement}
      </p>
    </header>
  );
}
