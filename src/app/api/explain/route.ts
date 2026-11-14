import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { generateDeterministicCausalBrief } from "@/lib/causalFallback";
import type {
  CausalExplanationResponse,
  CausalReportSummary,
} from "@/types/climate";

interface ExplainRequestBody {
  reportSummary?: CausalReportSummary;
}

const SYSTEM_INSTRUCTION =
  "You are a NASA Earth System Scientist specializing in coupled water-energy cycles and climate teleconnections. " +
  "Using ONLY the provided statistical numbers (Mann-Kendall tau, p-value, Sen's slope per decade, Pettitt regime shift date, " +
  "dipole correlation r, and lag-cascade months), return JSON `{ headline: string, physicalMechanism: string[3], mitigationActions: string[3] }`. " +
  "Never invent or alter any number.";

// Ordered by observed API reliability & low latency
const MODEL_CANDIDATES: Array<{ model: string; timeoutMs: number }> = [
  { model: "gemini-3.5-flash-lite", timeoutMs: 3200 },
  { model: "gemini-3.6-flash", timeoutMs: 3800 },
  { model: "gemini-3.1-flash-lite", timeoutMs: 3000 },
];

const EXPLAIN_CACHE_TTL_MS = 30 * 60 * 1000;
const explainCache = new Map<
  string,
  { expiresAt: number; payload: CausalExplanationResponse }
>();

function isValidExplanationPayload(
  val: unknown
): val is {
  headline: string;
  physicalMechanism: string[];
  mitigationActions: string[];
} {
  if (!val || typeof val !== "object") return false;
  const obj = val as Record<string, unknown>;
  const isStringArr = (arr: unknown) =>
    Array.isArray(arr) &&
    arr.length >= 2 &&
    arr.every((item) => typeof item === "string" && item.trim().length > 0);

  return (
    typeof obj.headline === "string" &&
    obj.headline.trim().length > 0 &&
    isStringArr(obj.physicalMechanism) &&
    isStringArr(obj.mitigationActions)
  );
}

function buildSummaryCacheKey(summary: CausalReportSummary): string {
  return [
    summary.caseId,
    summary.period,
    summary.symptom,
    summary.ecosystem,
    summary.regionA.lat.toFixed(2),
    summary.regionA.lon.toFixed(2),
    summary.regionB.lat.toFixed(2),
    summary.regionB.lon.toFixed(2),
    summary.dipoleCorrelationR.toFixed(3),
  ].join(":");
}

export async function POST(request: NextRequest) {
  let summary: CausalReportSummary | undefined;

  try {
    const body = (await request.json()) as ExplainRequestBody;
    summary = body.reportSummary;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  if (!summary || !summary.regionA || !summary.trendsA) {
    return NextResponse.json(
      { error: "Missing reportSummary" },
      { status: 400 }
    );
  }

  const cacheKey = buildSummaryCacheKey(summary);
  const cached = explainCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.payload, { status: 200 });
  }

  const fallback = generateDeterministicCausalBrief(summary);
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json(fallback, { status: 200 });
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Synthesize the causal mechanism and regional mitigation brief strictly from this deterministic statistical summary:\n${JSON.stringify(summary)}`;

  for (const candidate of MODEL_CANDIDATES) {
    try {
      const response = await ai.models.generateContent({
        model: candidate.model,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          temperature: 0.2,
          abortSignal: AbortSignal.timeout(candidate.timeoutMs),
        },
      });

      const rawText = response.text?.trim();
      if (!rawText) continue;

      const parsed: unknown = JSON.parse(rawText);
      if (!isValidExplanationPayload(parsed)) continue;

      const result: CausalExplanationResponse = {
        headline: parsed.headline.trim(),
        physicalMechanism: parsed.physicalMechanism.slice(0, 3),
        mitigationActions: parsed.mitigationActions.slice(0, 3),
        source: "gemini_flash",
        modelUsed: candidate.model,
      };

      if (explainCache.size >= 80) {
        const oldestKey = explainCache.keys().next().value;
        if (oldestKey) explainCache.delete(oldestKey);
      }
      explainCache.set(cacheKey, {
        expiresAt: Date.now() + EXPLAIN_CACHE_TTL_MS,
        payload: result,
      });

      return NextResponse.json(result, { status: 200 });
    } catch {
      // Try next Flash model candidate in resilience chain
    }
  }

  return NextResponse.json(fallback, { status: 200 });
}
