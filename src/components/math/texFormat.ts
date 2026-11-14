/**
 * Helpers that turn numbers into LaTeX strings for <Tex />.
 * Display-only: they never change the computed statistics.
 */

/** The stats engine clamps p-values at this floor (see mannKendallTest). */
const P_FLOOR = 1e-15;

/** `1.603e-11` → `1.603 \times 10^{-11}` */
export function texSci(value: number, digits = 2): string {
  if (value === 0) return "0";
  const [mantissa, exponent] = value.toExponential(digits).split("e");
  const exp = Number(exponent);
  if (exp === 0) return mantissa;
  return `${mantissa} \\times 10^{${exp}}`;
}

/** Fixed-point number with an explicit sign for positives when `signed` is set. */
export function texNum(value: number, digits: number, signed = false): string {
  const fixed = value.toFixed(digits);
  return signed && value > 0 ? `+${fixed}` : fixed;
}

/** p-value as a relation: `p = 0.0123`, `p = 4.80 \times 10^{-7}`, or `p < 10^{-15}` at the engine floor. */
export function texP(p: number, symbol = "p"): string {
  if (p <= P_FLOOR) return `${symbol} < 10^{-15}`;
  if (p < 0.001) return `${symbol} = ${texSci(p, 2)}`;
  return `${symbol} = ${p.toFixed(4)}`;
}

/** Converts a plain-text number token (`-0.45`, `1.603e-11`, `−0.2`) to LaTeX. */
export function texFromNumericToken(token: string): string {
  const normalized = token.replace(/−/g, "-");
  if (/e/i.test(normalized)) {
    const value = Number(normalized);
    if (Number.isFinite(value)) {
      const [mantissa, exponent] = normalized.toLowerCase().split("e");
      const exp = Number(exponent);
      const cleanMantissa = mantissa.replace(/^\+/, "");
      return cleanMantissa === "1" ? `10^{${exp}}` : `${cleanMantissa} \\times 10^{${exp}}`;
    }
  }
  return normalized;
}

const STAT_SYMBOLS: Record<string, string> = {
  tau: "\\tau",
  Tau: "\\tau",
  τ: "\\tau",
  p: "p",
  r: "r",
  Z: "Z",
  K_T: "K_T",
};

const STAT_RELATIONS: Record<string, string> = {
  "=": "=",
  "<": "<",
  ">": ">",
  "≤": "\\le",
  "≥": "\\ge",
  "<=": "\\le",
  ">=": "\\ge",
};

/**
 * Matches inline statistics in generated prose, e.g. "tau = 0.2033",
 * "p = 1.603e-11", "r=-0.45", "p < 0.01". Groups: symbol, relation, number.
 * Returns a fresh RegExp each call because global regexes are stateful.
 */
export function statTokenPattern(): RegExp {
  return /(?<![A-Za-z_])(tau|Tau|τ|K_T|p|r|Z)\s*(<=|>=|=|<|>|≤|≥)\s*([+\-−]?\d+(?:\.\d+)?(?:[eE][+\-]?\d+)?)(?![\d.])/g;
}

/** Builds the LaTeX for one matched statistic token. */
export function statTokenToTex(symbol: string, relation: string, numeric: string): string {
  // p-values: show the engine floor as "p < 10^{-15}" and tiny decimals in scientific notation.
  if (symbol === "p" && relation === "=") {
    const value = Number(numeric.replace(/−/g, "-"));
    if (Number.isFinite(value) && value >= 0 && value < 0.001) return texP(value);
  }
  return `${STAT_SYMBOLS[symbol] ?? symbol} ${STAT_RELATIONS[relation] ?? relation} ${texFromNumericToken(numeric)}`;
}

/** Rewrites inline statistics in plain text as Markdown math, e.g. `$\tau = 0.2033$`. */
export function withMarkdownMath(text: string): string {
  return text.replace(
    statTokenPattern(),
    (_full, sym: string, rel: string, num: string) => `$${statTokenToTex(sym, rel, num)}$`
  );
}
