"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/components/LenisProvider";

type RevealElement = "div" | "section" | "article" | "header" | "footer";

interface RevealProps {
  as?: RevealElement;
  delayMs?: number;
  className?: string;
  children: React.ReactNode;
}

/** One-shot viewport entrance animation using opacity and transform only (CLS = 0). */
export default function Reveal({
  as = "div",
  delayMs = 0,
  className = "",
  children,
}: RevealProps) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const node = elementRef.current;
    if (!node || reducedMotion || hasIntersected) return;
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setHasIntersected(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion, hasIntersected]);

  const isVisible =
    reducedMotion || hasIntersected || typeof IntersectionObserver === "undefined";

  const combinedClassName = `reveal${isVisible ? " is-visible" : ""}${
    className ? ` ${className}` : ""
  }`;

  const style =
    !reducedMotion && delayMs > 0
      ? { transitionDelay: `${delayMs}ms` }
      : undefined;

  const setRef = (node: HTMLElement | null) => {
    elementRef.current = node as HTMLDivElement | null;
  };

  switch (as) {
    case "section":
      return (
        <section ref={setRef} className={combinedClassName} style={style}>
          {children}
        </section>
      );
    case "article":
      return (
        <article ref={setRef} className={combinedClassName} style={style}>
          {children}
        </article>
      );
    case "header":
      return (
        <header ref={setRef} className={combinedClassName} style={style}>
          {children}
        </header>
      );
    case "footer":
      return (
        <footer ref={setRef} className={combinedClassName} style={style}>
          {children}
        </footer>
      );
    default:
      return (
        <div ref={setRef} className={combinedClassName} style={style}>
          {children}
        </div>
      );
  }
}
