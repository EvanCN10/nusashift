"use client";

import { useEffect, useState } from "react";
import { useLenis } from "lenis/react";
import { usePrefersReducedMotion } from "@/components/LenisProvider";

export type DashboardSectionId = "verdict" | "evidence" | "mechanism" | "proof";

const SECTIONS: ReadonlyArray<{ id: DashboardSectionId; label: string }> = [
  { id: "verdict", label: "Verdict" },
  { id: "evidence", label: "Evidence" },
  { id: "mechanism", label: "Mechanism" },
  { id: "proof", label: "Proof" },
];

/**
 * Floating glass mini-nav pill (<= 48px tall) that appears once the user scrolls
 * past #hero, highlights the visible section, and scrolls cleanly via Lenis.
 */
export default function StickySectionNav() {
  const [visible, setVisible] = useState(false);
  const [activeId, setActiveId] = useState<DashboardSectionId>("verdict");
  const lenis = useLenis();
  const reducedMotion = usePrefersReducedMotion();

  // Reveal after #hero leaves the top reading band (including direct anchor jumps to #verdict)
  useEffect(() => {
    const heroEl = document.getElementById("hero");
    if (!heroEl || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-48px 0px 0px 0px" }
    );

    observer.observe(heroEl);
    return () => observer.disconnect();
  }, []);

  // Track currently active section using IntersectionObserver
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const targets = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => Boolean(el)
    );
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length === 0) return;
        visibleEntries.sort(
          (a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top)
        );
        const topId = visibleEntries[0].target.id as DashboardSectionId;
        setActiveId(topId);
      },
      {
        rootMargin: "-22% 0px -58% 0px",
        threshold: 0,
      }
    );

    for (const el of targets) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleNavigate = (id: DashboardSectionId) => {
    const target = document.getElementById(id);
    if (!target) return;
    setActiveId(id);
    if (lenis && !reducedMotion) {
      lenis.scrollTo(target, { offset: 0 });
      return;
    }
    target.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <nav
      aria-label="Investigation sections"
      aria-hidden={!visible}
      inert={!visible || undefined}
      className={`fixed top-3 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 motion-reduce:transition-none motion-reduce:translate-y-0 ${
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 -translate-y-2 pointer-events-none"
      }`}
    >
      <div className="glass-panel rounded-full h-10 px-1.5 flex items-center gap-1 max-w-[calc(100vw-1.5rem)] overflow-x-auto">
        {SECTIONS.map((item) => {
          const active = activeId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              tabIndex={visible ? 0 : -1}
              aria-current={active ? "location" : undefined}
              onClick={() => handleNavigate(item.id)}
              className={`h-7 px-3 sm:px-3.5 rounded-full text-xs sm:text-[13px] font-medium whitespace-nowrap flex items-center gap-1.5 transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-drought-orange ${
                active
                  ? "bg-white/[0.12] text-ink-primary border border-white/15"
                  : "text-ink-secondary hover:text-ink-primary border border-transparent"
              }`}
            >
              <span
                aria-hidden="true"
                className={`w-1.5 h-1.5 rounded-full transition ${
                  active ? "bg-drought-orange" : "bg-transparent"
                }`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
