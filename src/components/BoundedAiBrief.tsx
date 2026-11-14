"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { Cpu, ShieldAlert, ShieldCheck, Sparkles } from "lucide-react";
import { serializeSummaryForAi } from "@/data/cachedCases";
import { generateDeterministicCausalBrief } from "@/lib/causalFallback";
import { formatDMS } from "@/lib/nasaPowerClient";
import type {
  CausalExplanationResponse,
  DualRegionAnalysisReport,
} from "@/types/climate";

interface BoundedAiBriefProps {
  report: DualRegionAnalysisReport;
  onBriefChange?: (brief: CausalExplanationResponse) => void;
}

function buildReportSignature(report: DualRegionAnalysisReport): string {
  return [
    report.caseId,
    report.startYear,
    report.endYear,
    report.symptom,
    report.ecosystem,
    report.regionA.lat.toFixed(3),
    report.regionA.lon.toFixed(3),
    report.regionB.lat.toFixed(3),
    report.regionB.lon.toFixed(3),
    report.dipoleCorrelationR.toFixed(4),
  ].join(":");
}

export default function BoundedAiBrief({
  report,
  onBriefChange,
}: BoundedAiBriefProps) {
  const gradientId = useId();
  const signature = buildReportSignature(report);

  const deterministicBrief = useMemo(
    () => generateDeterministicCausalBrief(report),
    [report]
  );

  const [resolved, setResolved] = useState<{
    signature: string;
    brief: CausalExplanationResponse;
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const summary = serializeSummaryForAi(report);

    fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportSummary: summary }),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return (await res.json()) as CausalExplanationResponse;
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        setResolved({ signature, brief: data });
        onBriefChange?.(data);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setResolved({ signature, brief: deterministicBrief });
        onBriefChange?.(deterministicBrief);
      });

    return () => controller.abort();
  }, [report, signature, deterministicBrief, onBriefChange]);

  const isLoading = resolved?.signature !== signature;
  const activeBrief =
    resolved?.signature === signature ? resolved.brief : deterministicBrief;

  const couplingPct = Math.min(
    100,
    Math.max(0, Math.round(Math.abs(report.dipoleCorrelationR) * 100))
  );
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - couplingPct / 100);
  const primaryTrend = report.trendsA[report.primaryVariable];

  return (
    <aside
      aria-label="Dipole coupling gauge and bounded AI causal inspector"
      className="hud-panel rounded-xl p-3.5 flex flex-col gap-3.5"
    >
      {/* Top Module: Dipole Coupling Circular Gauge + Telemetry Metadata */}
      <div className="hud-well rounded-lg p-3 flex items-center gap-3.5">
        <div className="relative w-[88px] h-[88px] shrink-0 flex items-center justify-center">
          <svg
            width="88"
            height="88"
            viewBox="0 0 88 88"
            aria-hidden="true"
            className="block"
          >
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
            <circle
              cx="44"
              cy="44"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="7"
            />
            <circle
              cx="44"
              cy="44"
              r={radius}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 44 44)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-mono text-lg font-bold tabular-nums text-ink-primary leading-none">
              {couplingPct}%
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-secondary mt-1">
              COUPLING
            </span>
          </div>
        </div>

        <dl className="min-w-0 flex-1 space-y-1.5 text-[11px]">
          <div className="flex items-baseline justify-between gap-2">
            <dt className="text-ink-muted shrink-0">Driver:</dt>
            <dd className="font-mono text-ink-primary truncate text-right">
              {report.climateDriverTag}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <dt className="text-ink-muted shrink-0">Regime Mode:</dt>
            <dd
              className={`font-mono font-semibold text-right ${
                report.isOppositeDirection
                  ? "text-drought-orange"
                  : "text-dipole-cyan"
              }`}
            >
              {report.isOppositeDirection
                ? "OPPOSITE-SIGN SEESAW"
                : "SYNCHRONOUS"}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <dt className="text-ink-muted shrink-0">Dipole p-val:</dt>
            <dd className="font-mono tabular-nums text-ink-primary text-right">
              p = {report.dipolePValue.toExponential(2)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <dt className="text-ink-muted shrink-0">Data Feed:</dt>
            <dd className="font-mono text-nominal-green truncate text-right">
              {report.dataSourceTag}
            </dd>
          </div>
        </dl>
      </div>

      {/* Bottom Module: IDENTIFIED REGIME RISKS & CAUSAL BRIEF */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-secondary flex items-center gap-1.5">
            {report.silentEcologicalStressDetected ? (
              <ShieldAlert className="w-3.5 h-3.5 text-drought-coral" aria-hidden="true" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-dipole-cyan" aria-hidden="true" />
            )}
            <span>IDENTIFIED REGIME RISKS &amp; CAUSAL BRIEF</span>
          </h2>
        </div>

        {/* DMS & Shift Metadata Block */}
        <div className="hud-well rounded-lg p-2.5 space-y-1 font-mono text-[11px]">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-drought-orange shrink-0">Region A:</span>
            <span className="text-ink-primary truncate text-right">
              {report.regionA.name} · {formatDMS(report.regionA.lat, report.regionA.lon)}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-dipole-cyan shrink-0">Region B:</span>
            <span className="text-ink-primary truncate text-right">
              {report.regionB.name} · {formatDMS(report.regionB.lat, report.regionB.lon)}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-drought-coral shrink-0">Primary Shift:</span>
            <span className="text-ink-primary text-right">
              {report.primaryVariable} · {primaryTrend.changePointDate} (p ={" "}
              {primaryTrend.pValue.toExponential(2)})
            </span>
          </div>
        </div>

        {/* Headline + Optional Skeleton Pulse While AI Synthesizing */}
        <div className="space-y-1.5">
          {isLoading ? (
            <div
              role="status"
              aria-label="Synthesizing bounded causal explanation"
              className="space-y-1.5 pb-1"
            >
              <div className="h-2.5 w-2/3 rounded bg-panel-800 animate-pulse" />
              <div className="text-[10px] font-mono text-dipole-cyan">
                Refining synthesis via Gemini 3.8 Flash (showing deterministic baseline)...
              </div>
            </div>
          ) : null}

          <h3 className="text-sm font-semibold leading-snug text-ink-primary">
            {activeBrief.headline}
          </h3>
        </div>

        {/* Physical Teleconnection Mechanism */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-mono font-semibold uppercase tracking-[0.1em] text-drought-orange">
            PHYSICAL TELECONNECTION MECHANISM:
          </div>
          <ul className="space-y-1.5 text-xs leading-relaxed text-ink-secondary">
            {activeBrief.physicalMechanism.slice(0, 3).map((point, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className="mt-1.5 w-1.5 h-1.5 rounded-full bg-drought-orange shrink-0"
                />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Regional Mitigation Recommendations */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-mono font-semibold uppercase tracking-[0.1em] text-dipole-cyan">
            REGIONAL MITIGATION RECOMMENDATIONS:
          </div>
          <ul className="space-y-1.5 text-xs leading-relaxed text-ink-secondary">
            {activeBrief.mitigationActions.slice(0, 3).map((action, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className="mt-1.5 w-1.5 h-1.5 rounded-full bg-dipole-cyan shrink-0"
                />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bounded Provenance Footer Badge */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
          {activeBrief.source === "gemini_flash" ||
          activeBrief.source === "gemini_3_8_flash" ? (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-nominal-green">
              <Sparkles className="w-3 h-3 shrink-0" aria-hidden="true" />
              <span>
                ● BOUNDED AI (
                {(activeBrief.modelUsed ?? "gemini-3.5-flash-lite").toUpperCase()} ·
                ZERO-HALLUCINATION LOCK)
              </span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-dipole-cyan">
              <Cpu className="w-3 h-3 shrink-0" aria-hidden="true" />
              <span>● DETERMINISTIC PHYSICS ENGINE</span>
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
