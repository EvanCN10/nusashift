# PRODUCT REQUIREMENT DOCUMENT (PRD) — AGENT-READY SPECIFICATION

## Project: NusaShift: Coupled Earth-System Regime & Lag-Cascade Detective

- **Competition:** NASA International Space Apps Challenge 2026 — Surabaya Online Competition
- **Official Challenge:** `Be An Earth System Trend Detective!` (Difficulty: `Advanced` | Subjects: `Earth Science`, `Software`)
- **Team:** `4 IT Go To Nasa` (Surabaya, Indonesia)
- **Document Purpose:** Self-contained, end-to-end engineering specification for Autonomous AI Coding Agent (**Anti Gravity**) to generate a complete, zero-error, production-ready, Vercel-deployable web application in one continuous build.
- **Language Mandate:** **100% English** across all UI copy, chart labels, scientific tooltips, error messages, and reports (mandatory for NASA Global Judging eligibility).

---

## 1. Executive Summary & Core Product Goals

### 1.1 Problem Statement

NASA's challenge asks participants to solve three real barriers in Earth science data exploration:

1. **Opposite-Sign Regional Trends (Teleconnections):** One climate driver (e.g., _Indian Ocean Dipole [IOD]_ or _El Niño-Southern Oscillation [ENSO]_) causes Earth system variables to trend upward in one region and downward in another simultaneously.
2. **Variable Overload & Seasonal Masking:** Non-specialists are overwhelmed by thousands of satellite variables, and long-term climate trends are hidden behind seasonal wet/dry cycles unless mathematically deseasonalized first.
3. **Lack of Causal Lag & Early Warning:** Existing portals (_NASA Worldview_, _NASA Giovanni_) plot single-region maps or raw time series without testing formal statistical significance or detecting **water-energy lag-cascades** (_"Silent Ecological Stress"_, where root-zone soil moisture drops significantly months before precipitation shows a significant decline).

### 1.2 Success Criteria (Definition of Done)

| Goal                                | Measurable Acceptance Criterion                                                                                                                                                                                                                                                                                                                         |
| :---------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Prove Opposite-Sign Dipole**      | At least 2 curated paired-region cases demonstrate statistically significant opposite-direction trends ($p < 0.05$) with negative inter-regional dipole correlation ($r < 0$).                                                                                                                                                                          |
| **Detect Silent Ecological Stress** | Lag-Cascade engine computes optimal monthly lead-lag ($k^* \in [0, 6]$ months) across `Solar Radiation -> Root-Zone Soil Wetness -> Skin Temperature -> Precipitation` and triggers a `SILENT ECOLOGICAL STRESS DETECTED` badge when soil wetness declines significantly ($p < 0.01$) while precipitation trend remains non-significant ($p \ge 0.05$). |
| **Verifiable Scientific Rigor**     | Cross-Validation Benchmark card dynamically runs the exact same `mannKendallTest()` and `sensSlope()` functions on embedded **NASA GISTEMP v4** reference data (`1985–2025`) and displays computed slope vs. NASA reference slope (never hardcoded).                                                                                                    |
| **Zero-Failure Demo & Deploy**      | Runs out-of-the-box with zero API keys required (via pre-cached NASA POWER datasets + deterministic AI fallback), passes `npx tsc --noEmit`, `npx eslint .`, and `npm run build` with exit code `0`.                                                                                                                                                    |

---

## 2. Modern Tech Stack Mandate (November 2026 — ZERO Deprecated Patterns)

The Coding Agent **MUST** strictly follow these November 2026 standards:

| Layer              | Mandatory Standard                                                         | Strict Rules & Forbidden Legacy Patterns                                                                                                                                                                                                                                  |
| :----------------- | :------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Framework**      | **Next.js 16** (`next@^16.0.0`, App Router)                                | **Turbopack** is the default bundler. Use native TypeScript `next.config.ts` with `reactCompiler: true`. Do **NOT** create `next.config.mjs` or legacy `middleware.ts`.                                                                                                   |
| **UI Runtime**     | **React 19.2** (`react@^19.2.0`) + **React Compiler 1.0**                  | Include `babel-plugin-react-compiler`. Remember Next.js 16 `params` and `searchParams` are async `Promise<...>`.                                                                                                                                                          |
| **Language**       | **TypeScript 5.9+** (`strict: true`)                                       | Zero `any` types; full type safety across statistical arrays and NASA POWER API responses.                                                                                                                                                                                |
| **Styling**        | **Tailwind CSS v4** (`tailwindcss@^4.0.0`, `@tailwindcss/postcss`)         | **CSS-first configuration** in `src/app/globals.css` via `@import "tailwindcss";` and `@theme { ... }`. **Do NOT create `tailwind.config.ts` or `tailwind.config.js`.**                                                                                                   |
| **Linting**        | **ESLint Flat Config** (`eslint.config.mjs`)                               | Set `"lint": "eslint ."` in `package.json` (`next lint` was removed in Next.js 16).                                                                                                                                                                                       |
| **Charts & Maps**  | **`recharts`** + **Custom Interactive SVG World Map** + **`lucide-react`** | Build a self-contained, dependency-free interactive SVG World Map (`InteractiveWorldMap.tsx`) with accurate continent vectors, lat/lon grid, click-anywhere coordinate picker, and teleconnection arc—avoiding React 19 peer-dependency breaks from legacy map libraries. |
| **AI SDK & Model** | **`@google/genai`** (Official Unified Google GenAI SDK)                    | Use **`gemini-3.8-flash`** (NOT deprecated `@google/generative-ai` or `gemini-1.5`/`2.5`) with `AbortSignal.timeout(2800)` and an instant deterministic fallback.                                                                                                         |

### Required Boilerplate Config Files

**`next.config.ts`:**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
};

export default nextConfig;
```

**`postcss.config.mjs`:**

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

**`src/app/globals.css` (Tailwind v4 CSS-First `@theme`):**

```css
@import "tailwindcss";

@theme {
  --color-obsidian-950: #050912;
  --color-obsidian-900: #0B1221;
  --color-obsidian-800: #111C33;
  --color-ocean-cyan: #06B6D4;
  --color-emerald-signal: #10B981;
  --color-amber-drought: #F59E0B;
  --color-crimson-shift: #F43F5E;
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, monospace;
}
```

---

## 3. Exact Repository & File Structure

```text
nusashift/
├── .env.example
├── eslint.config.mjs
├── next.config.ts
├── postcss.config.mjs
├── package.json
├── tsconfig.json
└── src/
    ├── app/
    │   ├── layout.tsx                    # Root layout, dark scientific theme, Inter + JetBrains Mono, NASA attribution footer
    │   ├── page.tsx                      # Main interactive dashboard orchestrating Triage -> Map -> Analysis -> AI Brief
    │   ├── globals.css                   # @import "tailwindcss"; + @theme design tokens
    │   └── api/
    │       ├── analyze/
    │       │   └── route.ts              # Fetches live NASA POWER API v2 in parallel (Region A & B) + runs statsEngine + cached fallback
    │       └── explain/
    │           └── route.ts              # Bounded AI Causal Explainer using @google/genai (gemini-3.8-flash) + rule-based fallback
    ├── types/
    │   └── climate.ts                    # All TypeScript interfaces & types
    ├── data/
    │   ├── nasaVariables.ts              # Metadata, units, physical roles, and student-friendly definitions for the 5 NASA POWER variables
    │   ├── cachedCases.ts                # 3 complete, realistic 1985–2025 monthly datasets for instant offline/demo execution
    │   └── gistempBenchmark.ts           # Embedded NASA GISTEMP v4 annual/monthly global temperature anomaly series (1985–2025)
    ├── lib/
    │   ├── statsEngine.ts                # Pure TypeScript deterministic math: Deseasonalization, Mann-Kendall, Sen's Slope, Pettitt, Lag-Cascade
    │   ├── nasaPowerClient.ts            # NASA POWER API v2 parser (filters -999 missing/ocean values cleanly)
    │   └── causalFallback.ts             # Deterministic physics-based causal narrative generator when GEMINI_API_KEY is absent/slow
    └── components/
        ├── NavbarHeader.tsx              # Brand header ("NusaShift: Coupled Earth-System Regime & Lag-Cascade Detective"), Dual-Layer View Toggle, Share URL button
        ├── HypothesisTriage.tsx          # FR-1: 3-step diagnostic symptom selector -> auto-maps relevant NASA variables
        ├── InteractiveWorldMap.tsx       # FR-2: Click-anywhere SVG world map with Region A/B pins, teleconnection arc, and 3 curated case buttons
        ├── DualRegionCharts.tsx          # FR-3, FR-4, FR-5, FR-6: Synchronized Region A vs Region B Recharts time-series + Pettitt change-point line
        ├── LagCascadePanel.tsx           # FR-7 & FR-8: Water-energy causal chain diagram with optimal lag (months) & Silent Ecological Stress alert
        ├── ScientificProofDrawer.tsx     # FR-9 & FR-10: Full statistical table (tau, Z, p-value, Sen's Slope, 95% CI) + GISTEMP Cross-Validation card
        └── BoundedAiBrief.tsx            # FR-11: Evidence-bound AI causal explanation & regional mitigation action card
```

---

## 4. Complete TypeScript Data Models (`src/types/climate.ts`)

```ts
export type NasaVariableCode =
  | "ALLSKY_SFC_SW_DWN"
  | "GWETROOT"
  | "TS"
  | "PRECTOTCORR"
  | "T2M";

export type SymptomId =
  | "coastal_drought"
  | "peatland_drying"
  | "extreme_flood_dipole"
  | "custom_exploration";

export type EcosystemType =
  | "maritime_tropics"
  | "tropical_peatland"
  | "semi_arid_basin"
  | "coastal_delta";

export type ViewLayerMode = "citizen" | "scientific";

export interface NasaVariableMeta {
  code: NasaVariableCode;
  label: string;
  shortLabel: string;
  unit: string;
  physicalRole:
    | "Energy Driver"
    | "Silent Stress Indicator"
    | "Thermal Feedback"
    | "Hydrological Output"
    | "Cross-Validation";
  studentDefinition: string;
  nasaInstrumentHeritage: string;
}

export interface RegionCoordinates {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

export interface MonthlyObservation {
  year: number;
  month: number; // 1..12
  dateLabel: string; // "YYYY-MM"
  rawValue: number;
  deseasonalizedZ: number; // Monthly Z-score anomaly
}

export interface TrendAnalysisResult {
  variable: NasaVariableCode;
  variableLabel: string;
  unit: string;
  sampleCount: number;
  mannKendallTau: number;
  zScore: number;
  pValue: number;
  significanceLevel: "HIGHLY_SIGNIFICANT" | "SIGNIFICANT" | "NOT_SIGNIFICANT";
  direction: "INCREASING" | "DECREASING" | "STABLE";
  sensSlopePerDecade: number;
  confidenceInterval95: [number, number];
  changePointDate: string; // "YYYY-MM"
  pettittStatistic: number;
  series: MonthlyObservation[];
}

export interface LagCascadeLink {
  fromVariable: NasaVariableCode;
  fromLabel: string;
  toVariable: NasaVariableCode;
  toLabel: string;
  optimalLagMonths: number; // 0..6
  correlationR: number;
  pValue: number;
  isSignificant: boolean;
  interpretation: string;
}

export interface GistempBenchmarkResult {
  datasetName: string;
  period: string;
  computedSlopePerDecade: number;
  publishedReferenceSlopePerDecade: number;
  mannKendallPValue: number;
  deviationPct: number;
  isCalibrated: boolean;
}

export interface DualRegionAnalysisReport {
  caseId: string;
  title: string;
  climateDriverTag: string;
  dataSourceTag: "CACHED_NASA_POWER_V2" | "LIVE_NASA_POWER_V2";
  symptom: SymptomId;
  startYear: number;
  endYear: number;
  regionA: RegionCoordinates;
  regionB: RegionCoordinates;
  trendsA: Record<NasaVariableCode, TrendAnalysisResult>;
  trendsB: Record<NasaVariableCode, TrendAnalysisResult>;
  primaryVariable: NasaVariableCode;
  dipoleCorrelationR: number;
  dipolePValue: number;
  isOppositeDirection: boolean;
  lagCascadeA: LagCascadeLink[];
  silentEcologicalStressDetected: boolean;
  silentStressReason: string;
  gistempValidation: GistempBenchmarkResult;
}

export interface CausalExplanationResponse {
  headline: string;
  physicalMechanism: string[];
  mitigationActions: string[];
  source: "gemini_3_8_flash" | "deterministic_fallback";
}
```

---

## 5. NASA Data Specifications & Edge-Case Rules (`src/data/` & `src/lib/nasaPowerClient.ts`)

### 5.1 NASA POWER API v2 Endpoint (Free, No API Key Required)

```text
https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=PRECTOTCORR,GWETROOT,TS,ALLSKY_SFC_SW_DWN,T2M&community=AG&longitude={LON}&latitude={LAT}&start={START_YEAR}&end={END_YEAR}&format=JSON
```

### 5.2 Critical Data Guardrails (MUST Implement in `nasaPowerClient.ts`)

1. **Missing Value & Ocean Grid Filtering (`-999`):** NASA POWER returns `-999` for missing observations and for `GWETROOT` (root-zone soil wetness) over ocean cells. Filter out any month where `value <= -900` or `Number.isNaN(value)`. If a user clicks deep ocean on the map where `GWETROOT` is empty, gracefully fall back to `PRECTOTCORR` and `TS` for surface analysis and display a clean notice badge (`"Ocean grid cell: Root-zone soil wetness unavailable; analyzing atmospheric & skin temperature variables"`).
2. **Month `13` Filtering:** NASA POWER monthly JSON includes month `13` (`YYYY13`) representing the annual average. **MUST filter out `month === 13`** so only `01..12` are processed in deseasonalization!
3. **Inland Agricultural Coordinates for Curated Cases:** Use inland land-grid coordinates so `GWETROOT` has 100% complete data:
   - **Case 1 (`iod-surabaya-turkana`):** _East Java Agricultural Corridor, Surabaya/Sidoarjo_ (`lat: -7.45, lon: 112.45`) vs. _Turkana Basin, Kenya_ (`lat: 3.12, lon: 35.60`) — Driver: _Indian Ocean Dipole (IOD) & ENSO_.
   - **Case 2 (`enso-kalimantan-peru`):** _Central Kalimantan Peatland Basin, Palangkaraya_ (`lat: -2.22, lon: 113.91`) vs. _Piura River Basin, Northern Peru_ (`lat: -5.19, lon: -80.63`) — Driver: _ENSO / Pacific-Maritime Teleconnection_ (demonstrates **Silent Ecological Stress** where `GWETROOT` drops significantly while `PRECTOTCORR` shows non-significant linear trend).
   - **Case 3 (`brantas-water-energy`):** _Upper Brantas Watershed, Malang/Batu_ (`lat: -7.97, lon: 112.63`) vs. _Lower Brantas Delta, Surabaya_ (`lat: -7.35, lon: 112.72`) — Driver: _Regional Water-Energy Coupling_.
4. **Pre-Cached Datasets (`src/data/cachedCases.ts`):** Generate realistic, statistically consistent 40-year (`1985–2025`, 480 monthly points) seed datasets for all 3 cases so clicking any curated case renders in `< 20ms` without waiting on external network latency. Live map clicks call `/api/analyze` with `AbortSignal.timeout(4500)` and automatic fallback if NASA POWER is unreachable.

---

## 6. Deterministic Statistical Engine (`src/lib/statsEngine.ts`)

Implement all 5 statistical algorithms in pure TypeScript with **zero external native dependencies**:

1. **Monthly Z-Score Deseasonalization:**
   - Group raw monthly values by calendar month $m \in \{1..12\}$. Compute $\mu_m$ and $\sigma_m$ ($\sigma_m = \max(\sigma_m, 10^{-6})$).
   - Compute $Z_{y,m} = (X_{y,m} - \mu_m) / \sigma_m$.
2. **Mann-Kendall Trend Test ($\tau$, $Z_{\text{MK}}$, and two-tailed $p$-value):**
   - Compute $S = \sum_{i=1}^{n-1} \sum_{j=i+1}^{n} \operatorname{sgn}(Z_j - Z_i)$, $\tau = \frac{2S}{n(n-1)}$, $\operatorname{Var}(S) = \frac{n(n-1)(2n+5)}{18}$.
   - Compute $Z_{\text{MK}}$ with continuity correction ($\pm 1$) and exact standard normal survival function via complementary error function `erfc(|Z_MK| / Math.SQRT2)` so `pValue` is mathematically exact (`0 < pValue <= 1`).
   - Classify: `pValue < 0.01` $\rightarrow$ `'HIGHLY_SIGNIFICANT'`; `pValue < 0.05` $\rightarrow$ `'SIGNIFICANT'`; else `'NOT_SIGNIFICANT'`.
3. **Sen's Slope Estimator ($Q_{\text{decade}}$) & 95% Confidence Interval:**
   - Compute all pairwise slopes $d_{ij} = \frac{X_j - X_i}{j - i}$ for $1 \le i < j \le n$ on raw anomaly values (preserving physical units like $^\circ\text{C}$ or $\text{mm/day}$), sort ascending, take the median, and multiply by `120` (120 months = 1 decade).
   - Compute 95% CI bounds using $C_\alpha = 1.96 \sqrt{\operatorname{Var}(S)}$ indices on the sorted pairwise slopes array.
4. **Pettitt Change-Point Detection ($K_T$):**
   - Compute $U_{t,T} = \sum_{i=1}^{t} \sum_{j=t+1}^{T} \operatorname{sgn}(Z_i - Z_j)$ (optimizable to $O(n^2)$ or $O(n \log n)$ via rank sums: $U_t = 2 \sum_{i=1}^t R_i - t(T + 1)$ where $R_i$ is the rank of $Z_i$!). Using the rank-sum formula makes Pettitt $O(n \log n)$ and instantaneous for $n = 480$!
   - Find $t^* = \arg\max_t |U_t|$ and record `changePointDate = series[t*].dateLabel`.
5. **Lead-Lag Cross-Correlation ($k \in \{0, 1, 2, 3, 4, 5, 6\}$ months):**
   - Evaluate the 3 physical links in `Region A`:
     1. `ALLSKY_SFC_SW_DWN` $\rightarrow$ `GWETROOT`
     2. `GWETROOT` $\rightarrow$ `TS`
     3. `TS` $\rightarrow$ `PRECTOTCORR`
   - For each lag $k \in [0, 6]$, compute Pearson correlation $r_{XY}(k)$ between $X_t$ and $Y_{t+k}$ along with student-$t$ $p$-value, selecting $k^*$ with maximum $|r_{XY}(k)|$.
6. **GISTEMP Cross-Validation (`runGistempCrossValidation`):**
   - Run the exact same `mannKendallTest()` and `sensSlope()` functions on `GISTEMP_REFERENCE_SERIES` (`src/data/gistempBenchmark.ts`), compare against the published NASA GISTEMP v4 decadal trend value stored in metadata, and return `GistempBenchmarkResult` dynamically.

---

## 7. Functional Requirements & UI/UX Layout (`src/components/`)

1. **Top Navigation Bar (`NavbarHeader.tsx`):**
   - Title: **`NusaShift`** | Subtitle: **`Coupled Earth-System Regime & Lag-Cascade Detective`**.
   - **Dual-Layer View Switcher (FR-9):** Pill toggle switching between **`Citizen / Student View`** (plain-English risk badges, simplified definitions, actionable insights) and **`Scientific Proof View`** (full $\tau$, $Z$-score, $p$-value, Sen's Slope 95% CI tables, raw vs. deseasonalized toggle, and GISTEMP Cross-Validation card).
   - **Share Analysis URL Button:** Encodes current case/coordinates into query string (`?case=...` or `?latA=...&lonA=...&latB=...&lonB=...&symptom=...`) and copies to clipboard with toast confirmation.
2. **Step 1 — Hypothesis Triage Bar (`HypothesisTriage.tsx`, FR-1):**
   - Interactive 3-question selector (`Observed Symptom`, `Target Ecosystem`, `Historical Window: 1985–2025 / 1995–2025 / 2005–2025`).
   - Displays the auto-selected NASA POWER variables as interactive pills with plain-English tooltips (`studentDefinition` & `nasaInstrumentHeritage`).
3. **Step 2 — Interactive World Map & Curated Case Selector (`InteractiveWorldMap.tsx`, FR-2):**
   - 3 one-click preset buttons for the curated cases (`Surabaya vs. Turkana [IOD]`, `Kalimantan vs. Peru [ENSO]`, `Brantas Water-Energy Coupling`).
   - Custom SVG World Map where clicking anywhere sets `Region A` or `Region B` (with toggle `"Click Map to Set: [Region A] / [Region B]"`), draws a glowing curved teleconnection arc between the two pins, and triggers `/api/analyze`.
4. **Step 3 — Dual-Region Synchronized Charts (`DualRegionCharts.tsx`, FR-3, FR-4, FR-5, FR-6):**
   - Side-by-side cards for **Region A** and **Region B** showing significance badge (`HIGHLY SIGNIFICANT p < 0.01`), Sen's Slope per decade, and Pettitt Change-Point year.
   - Recharts `ComposedChart` / `LineChart` displaying `deseasonalizedZ` (with toggle to view `rawValue`), zero-baseline reference line, and vertical dashed `ReferenceLine` marking the exact **Pettitt Change-Point Date**.
   - Central **Climate Dipole Badge** displaying `dipoleCorrelationR`, `dipolePValue`, and `OPPOSITE-SIGN TELECONNECTION CONFIRMED` vs `SYNCHRONOUS TREND`.
5. **Step 4 — Lag-Cascade & Silent Ecological Stress Panel (`LagCascadePanel.tsx`, FR-7, FR-8):**
   - Visual 4-node horizontal pipeline diagram: `Solar Radiation (Rs)` $\xrightarrow{+k_1\text{ mo}}$ `Root Soil Wetness (SM)` $\xrightarrow{+k_2\text{ mo}}$ `Skin Temp (Ts)` $\xrightarrow{+k_3\text{ mo}}$ `Precipitation (P)` showing correlation $r$ and lag months on each arrow.
   - Prominent **Silent Ecological Stress Alert Banner** when `silentEcologicalStressDetected === true`.
6. **Step 5 — Bounded AI Causal Explainer (`BoundedAiBrief.tsx`, FR-11) & Scientific Proof Drawer (`ScientificProofDrawer.tsx`, FR-10):**
   - Calls `POST /api/explain` sending **only** the computed `DualRegionAnalysisReport` summary numbers (never raw arrays). Uses `@google/genai` (`gemini-3.8-flash`) with `AbortSignal.timeout(2800)` and automatic `causalFallback.ts` so it never fails.
   - `ScientificProofDrawer` displays the complete multi-variable statistical table and the **NASA GISTEMP v4 Cross-Validation Benchmark** card.

---

## 8. Final Agent Build & Verification Checklist

Before finishing, the AI Coding Agent **MUST** execute and verify:

1. [ ] All files in Section 3 are implemented completely with zero `// TODO` placeholders.
2. [ ] `next.config.ts` uses `reactCompiler: true`, `src/app/globals.css` uses Tailwind v4 `@import "tailwindcss";` + `@theme`, and `@google/genai` uses `gemini-3.8-flash`.
3. [ ] Run `npx tsc --noEmit` $\rightarrow$ **0 errors**.
4. [ ] Run `npx eslint .` $\rightarrow$ **0 errors**.
5. [ ] Run `npm run build` (Turbopack production build) $\rightarrow$ exits with **code 0**.
