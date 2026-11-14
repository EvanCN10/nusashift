"use client";

import { useEffect, useMemo, useState } from "react";
import { Cpu, ShieldAlert, ShieldCheck, Sparkles } from "lucide-react";
import MathText from "@/components/math/MathText";
import { serializeSummaryForAi } from "@/data/cachedCases";
import { generateDeterministicCausalBrief } from "@/lib/causalFallback";
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

/** Mechanism sidebar: bounded causal brief (max 3 bullets), actions, and real provenance. */
export default function BoundedAiBrief({
  report,
  onBriefChange,
}: BoundedAiBriefProps) {
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
  const isAiSource = activeBrief.source !== "deterministic_fallback";

  return (
    <aside
      aria-label="Physical teleconnection explanation and local actions"
      className="w-full glass-panel rounded-xl p-5 sm:p-6 flex flex-col justify-between gap-5"
    >
      <div className="space-y-4">
        {/* Eyebrow */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-ink-secondary">
            {report.silentEcologicalStressDetected ? (
              <ShieldAlert
                className="w-4 h-4 text-[#F87171] shrink-0"
                aria-hidden="true"
              />
            ) : (
              <ShieldCheck
                className="w-4 h-4 text-dipole-cyan shrink-0"
                aria-hidden="true"
              />
            )}
            <span className="font-mono text-[11px] uppercase tracking-[0.12em]">
              Bounded synthesis &amp; local actions
            </span>
          </div>
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
            {report.climateDriverTag}
          </span>
        </div>

        {/* Headline */}
        <h3 className="text-lg font-semibold leading-snug text-ink-primary">
          <MathText text={activeBrief.headline} />
        </h3>

        {/* Physical Mechanism (max 3 bullets) */}
        <div className="space-y-2">
          <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-drought-orange">
            Why it happens
          </div>
          <ul className="space-y-2.5 text-sm leading-relaxed text-ink-secondary">
            {activeBrief.physicalMechanism.slice(0, 3).map((point, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span
                  aria-hidden="true"
                  className="mt-2 w-1.5 h-1.5 rounded-full bg-drought-orange shrink-0"
                />
                <span>
                  <MathText text={point} />
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended Actions */}
        <div className="space-y-2 pt-1">
          <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-dipole-cyan">
            Recommended actions
          </div>
          <ul className="space-y-2.5 text-sm leading-relaxed text-ink-secondary">
            {activeBrief.mitigationActions.slice(0, 3).map((action, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span
                  aria-hidden="true"
                  className="mt-2 w-1.5 h-1.5 rounded-full bg-dipole-cyan shrink-0"
                />
                <span>
                  <MathText text={action} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Real Model / Deterministic Provenance Badge */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2 min-h-[36px]">
        {isLoading ? (
          <span
            role="status"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-dipole-cyan animate-pulse motion-reduce:animate-none"
          >
            <span
              aria-hidden="true"
              className="w-1.5 h-1.5 rounded-full bg-dipole-cyan shrink-0"
            />
            <span>REFINING EXPLANATION FROM COMPUTED METRICS…</span>
          </span>
        ) : isAiSource ? (
          <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-nominal-green">
            <span
              aria-hidden="true"
              className="w-1.5 h-1.5 rounded-full bg-nominal-green shrink-0"
            />
            <Sparkles className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>
              BOUNDED AI ({(activeBrief.modelUsed ?? "gemini-flash").toLowerCase()}) ·
              ZERO-HALLUCINATION LOCK
            </span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-dipole-cyan">
            <span
              aria-hidden="true"
              className="w-1.5 h-1.5 rounded-full bg-dipole-cyan shrink-0"
            />
            <Cpu className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>DETERMINISTIC PHYSICS ENGINE</span>
          </span>
        )}
      </div>
    </aside>
  );
}
