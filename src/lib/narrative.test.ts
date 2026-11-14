import assert from "node:assert/strict";
import { CURATED_CASES, getPrecomputedCaseReport } from "@/data/cachedCases";
import {
  buildEvidenceCaption,
  buildVerdictMetrics,
  buildVerdictPlainSummary,
  buildVerdictSentence,
  formatLagPhrase,
  getVerdictBadge,
  pValueBucket,
} from "@/lib/narrative";

export function runNarrativeTests(): void {
  // 1. p-value buckets & plain-English labels
  assert.equal(pValueBucket(0.001).bucket, "Very strong");
  assert.equal(pValueBucket(0.032).bucket, "Strong");
  assert.equal(pValueBucket(0.05).bucket, "Weak");
  assert.equal(pValueBucket(0.18).bucket, "Weak");

  // 2. Plain lag connectors
  assert.equal(formatLagPhrase(0), "Same month");
  assert.equal(formatLagPhrase(1), "+1 month later");
  assert.equal(formatLagPhrase(3), "+3 months later");

  // 3. Curated Case 1: Merauke vs Chile (opposite-sign)
  const case1 = getPrecomputedCaseReport("indo-chile-dipole");
  const badge1 = getVerdictBadge(case1);
  assert.equal(badge1.label, "OPPOSITE-SIGN");
  assert.equal(badge1.variant, "opposite");
  assert.match(buildVerdictSentence(case1), /getting wetter/i);
  assert.match(buildVerdictSentence(case1), /drying/i);

  const metrics1 = buildVerdictMetrics(case1);
  assert.equal(metrics1.length, 3);
  assert.equal(metrics1[0].value, case1.dipoleCorrelationR.toFixed(3));
  assert.equal(metrics1[1].value, case1.trendsA[case1.primaryVariable].changePointDate);
  assert.equal(metrics1[2].value, "Very strong");

  // 4. Curated Case 2: Murray-Darling vs Kalimantan (Silent Ecological Stress)
  const case2 = getPrecomputedCaseReport("silent-murray-kalimantan");
  const badge2 = getVerdictBadge(case2);
  assert.equal(badge2.label, "SILENT STRESS DETECTED");
  assert.equal(badge2.variant, "alert");
  assert.match(buildVerdictSentence(case2), /silently losing root-zone soil wetness/i);

  // 5. Curated Case 3: East vs West Java (coupled)
  const case3 = getPrecomputedCaseReport("java-water-energy");
  const badge3 = getVerdictBadge(case3);
  assert.equal(badge3.label, "COUPLED");
  assert.equal(badge3.variant, "coupled");

  // 6. All curated cases yield valid plain-English summaries & captions
  for (const curated of CURATED_CASES) {
    const report = getPrecomputedCaseReport(curated.caseId);
    const summary = buildVerdictPlainSummary(report);
    const caption = buildEvidenceCaption(report, report.primaryVariable);
    assert.ok(summary.length > 40, `Expected non-empty summary for ${curated.caseId}`);
    assert.ok(caption.length > 40, `Expected non-empty caption for ${curated.caseId}`);
  }
}
