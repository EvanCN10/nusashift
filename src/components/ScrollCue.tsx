"use client";

import { useEffect, useState } from "react";
import { useLenis } from "lenis/react";
import { ChevronDown } from "lucide-react";
import { usePrefersReducedMotion } from "@/components/LenisProvider";

interface ScrollCueProps {
  targetId?: string;
}

/** Bottom-left hero scroll cue with gentle vertical bobbing; hides after ~80px scroll. */
export default function ScrollCue({ targetId = "verdict" }: ScrollCueProps) {
  const [hidden, setHidden] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const lenis = useLenis((instance) => {
    setHidden(instance.scroll > 80);
  });

  useEffect(() => {
    const onScroll = () => {
      setHidden(window.scrollY > 80);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = () => {
    const target = document.getElementById(targetId);
    if (!target) return;
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
    <button
      type="button"
      onClick={handleClick}
      aria-label="Scroll down to dashboard verdict"
      aria-hidden={hidden}
      tabIndex={hidden ? -1 : 0}
      className={`group min-h-[32px] py-1 px-1 rounded-md inline-flex items-center gap-2.5 text-ink-secondary hover:text-ink-primary transition-opacity duration-300 motion-reduce:transition-none cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-drought-orange ${
        hidden ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <span className="font-mono text-[10px] tracking-[0.2em] uppercase">
        Scroll
      </span>
      <span className="h-4 w-px bg-white/15" aria-hidden="true" />
      <ChevronDown
        aria-hidden="true"
        className={`w-4 h-4 stroke-[1.5] text-ink-primary group-hover:text-drought-orange transition-colors ${
          reducedMotion ? "" : "animate-cue-bob"
        }`}
      />
    </button>
  );
}
