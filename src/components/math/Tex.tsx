import { useMemo } from "react";
import katex from "katex";

interface TexProps {
  /** LaTeX source, e.g. `\tau = -0.16`. Only pass trusted, app-authored strings. */
  math: string;
  /** Block-level display math (centered, larger operators). */
  display?: boolean;
  className?: string;
}

/**
 * Renders LaTeX with KaTeX. Output includes MathML so screen readers read the
 * expression, and it inherits `currentColor` so it matches surrounding text.
 */
export default function Tex({ math, display = false, className }: TexProps) {
  const html = useMemo(
    () =>
      katex.renderToString(math, {
        displayMode: display,
        throwOnError: false,
        strict: "ignore",
        output: "htmlAndMathml",
      }),
    [math, display]
  );

  return (
    <span
      className={display ? `block ${className ?? ""}` : className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
