"use client";

import { ReactLenis } from "lenis/react";
import { useMemo, useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(cb: () => void) {
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  mql.addEventListener("change", cb);
  return () => mql.removeEventListener("change", cb);
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false
  );
}

/** Root smooth-scroll provider powered by Lenis; disables wheel smoothing under reduced motion. */
export default function LenisProvider({ children }: { children: React.ReactNode }) {
  const reducedMotion = usePrefersReducedMotion();

  const options = useMemo(
    () => ({
      lerp: 0.1,
      autoRaf: !reducedMotion,
      smoothWheel: !reducedMotion,
      allowNestedScroll: true,
      respectReducedMotion: true,
    }),
    [reducedMotion]
  );

  return (
    <ReactLenis root options={options}>
      {children}
    </ReactLenis>
  );
}
