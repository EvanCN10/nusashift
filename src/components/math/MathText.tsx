import { Fragment } from "react";
import Tex from "@/components/math/Tex";
import { statTokenPattern, statTokenToTex } from "@/components/math/texFormat";

/**
 * Renders free text with inline statistics typeset as LaTeX, so
 * "tau = 0.2033, p = 1.603e-11" reads as  τ = 0.2033, p = 1.603 × 10⁻¹¹.
 * The rest of the text is left untouched.
 */
export default function MathText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let last = 0;

  for (const match of text.matchAll(statTokenPattern())) {
    const [full, sym, rel, num] = match;
    const start = match.index ?? 0;
    if (start > last) parts.push(text.slice(last, start));
    parts.push(<Tex math={statTokenToTex(sym, rel, num)} />);
    last = start + full.length;
  }
  if (last < text.length) parts.push(text.slice(last));

  return (
    <>
      {parts.map((part, idx) => (
        <Fragment key={idx}>{part}</Fragment>
      ))}
    </>
  );
}
