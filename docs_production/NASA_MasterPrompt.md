# MASTER PROMPTS PER SESI — IDE ANTIGRAVITY (`NusaShift`)
**Coupled Earth-System Regime & Lag-Cascade Detective**

* **Kompetisi:** NASA International Space Apps Challenge 2026 — Surabaya Online Competition
* **Challenge Resmi:** `Be An Earth System Trend Detective!` (`Advanced` | `Earth Science`, `Software`)
* **Tim:** `4 IT Go To Nasa` | **Nama Produk & Repo:** **NusaShift** (`nusashift`)
* **Tech Stack Wajib (Nov 2026):** Next.js 16 (App Router, Turbopack, `reactCompiler: true`), React 19.2, TypeScript 5.9+ (`strict: true`), Tailwind CSS v4 (CSS-first `@theme` di `src/app/globals.css`), ESLint Flat Config (`eslint.config.mjs`), Recharts, Lucide React, & `@google/genai` (`gemini-3.8-flash`).
* **Target Selesai Solo Build:** Sabtu, 14 November 2026 pukul **17:00 WIB** (siap di-*polish* bersama 3 rekan tim yang bergabung pukul 17:00 WIB).

---

## Panduan Eksekusi Satu-Klik (Zero Context-Overflow)

1. **Urutan Sesi:** Jalankan berurutan dari **Sesi 1 $\rightarrow$ Sesi 2 $\rightarrow$ Sesi 3 $\rightarrow$ Sesi 4**. Jangan menggabungkan keempat sesi menjadi satu prompt agar Antigravity tidak memotong kode (`// TODO` atau `...`).
2. **Instruksi Kurung Siku `[ ... ]`:** Baca dan lakukan langkah manual di dalam blok **`[INSTRUKSI MANUAL ...]`** tepat di atas setiap Master Prompt sebelum melakukan *copy-paste* ke Antigravity.
3. **Aturan Lampiran Gambar:** Anda **tidak perlu** melampirkan gambar di Sesi 1, 2, dan 4. Lampirkan gambar referensi *FuseLab HUD* cukup **sekali saja pada Sesi 3** saat Antigravity membangun kerangka visual utama.

---

## SESI 1 (13:35 – 14:25 WIB): Base Folder Kosong, Next.js 16 + Tailwind v4 Tactical Theme, Skema TypeScript, & Mesin Statistik Deterministik

```text
[INSTRUKSI MANUAL SEBELUM PASTE MASTER PROMPT SESI 1:
1. Buat folder baru yang benar-benar kosong bernama `nusashift` di komputer Anda, lalu buka folder `nusashift` tersebut di IDE Antigravity.
2. Buka terminal di Antigravity dan jalankan:
   git init
3. Simpan 3 dokumen Markdown yang sudah dibuat sebelumnya ke dalam root folder `nusashift` (opsional sebagai referensi tambahan bagi Agent, karena seluruh spesifikasi inti juga sudah ditanam langsung di dalam prompt di bawah):
   - `prd_tele_seesaw_agent_ready.md`
   - `nusashift_app_flow.md`
   - `ui_ux_design_brief_nusashift.md`
4. Buat file `.env.local` di root folder `nusashift` dan isi dengan API key Gemini Anda (NASA POWER API v2 gratis & tidak butuh API key):
   GEMINI_API_KEY=PASTE_GEMINI_API_KEY_ANDA_DI_SINI
   NEXT_PUBLIC_APP_URL=http://localhost:3000
5. Copy-paste Master Prompt Sesi 1 di bawah ini ke chat Antigravity.]
```

### Master Prompt Sesi 1 (Copy-Paste ke Antigravity)

```markdown
Act as a Principal Full-Stack TypeScript Architect and Statistical Earth Science Engineer. We are starting from an **empty base folder (`nusashift`)** to build **NusaShift: Coupled Earth-System Regime & Lag-Cascade Detective** for the 2026 NASA Space Apps Challenge (`Be An Earth System Trend Detective!`).

If `prd_tele_seesaw_agent_ready.md`, `nusashift_app_flow.md`, and `ui_ux_design_brief_nusashift.md` exist in the workspace, read them first. Note that the final product name is **NusaShift** (`nusashift`).

In **Session 1**, initialize the project from scratch using the **November 2026 modern web stack** and implement the complete configuration, strict TypeScript data models, NASA POWER API v2 client, and pure TypeScript deterministic statistical engine (`statsEngine.ts`) with **zero placeholders or truncated code**.

### 1. Strict Tech Stack & Configuration Rules (NO Deprecated Patterns)
- **Next.js 16** (`next@^16.0.0`, App Router, Turbopack default bundler). Create native TypeScript `next.config.ts` with `reactCompiler: true`. Do **NOT** create `next.config.mjs` or `middleware.ts`.
- **React 19.2** (`react@^19.2.0`, `react-dom@^19.2.0`) + `babel-plugin-react-compiler`.
- **TypeScript 5.9+** (`strict: true` in `tsconfig.json` with `@/*` path alias mapped to `./src/*`).
- **Tailwind CSS v4** (`tailwindcss@^4.0.0` + `@tailwindcss/postcss`) configured via `postcss.config.mjs` and CSS-first `@import "tailwindcss";` + `@theme { ... }` in `src/app/globals.css`. **Do NOT create `tailwind.config.ts` or `tailwind.config.js`.**
- **ESLint Flat Config** (`eslint.config.mjs`). Set `"lint": "eslint ."` in `package.json` (`next lint` is removed in Next.js 16).
- Install packages: `lucide-react`, `recharts`, and the official unified Google GenAI SDK `@google/genai` (do NOT install deprecated `@google/generative-ai`).
- Ensure `.gitignore` excludes `node_modules`, `.next`, and `.env*.local`.

### 2. Implement Tactical Geospatial Telemetry Tokens in `src/app/globals.css`
Configure `src/app/globals.css` with Tailwind CSS v4 CSS-first tokens (Matte Graphite & Deep Obsidian surfaces, zero purple/blue SaaS gradients):
```css
@import "tailwindcss";

@theme {
  --color-canvas-950: #090B0E;
  --color-canvas-900: #0E1116;
  --color-panel-850: #14181F;
  --color-panel-800: #1B2029;
  --color-panel-700: #262C38;

  --color-ink-primary: #F3F5F8;
  --color-ink-secondary: #9BA3B2;
  --color-ink-muted: #5E6778;

  --color-drought-orange: #F97316;
  --color-drought-coral: #EF4444;
  --color-radar-gold: #EAB308;
  --color-nominal-green: #22C55E;
  --color-dipole-cyan: #06B6D4;

  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, monospace;
}

@layer utilities {
  .hud-panel {
    background-color: rgba(20, 24, 31, 0.88);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.05), 0 12px 32px -8px rgba(0, 0, 0, 0.6);
  }
  .hud-well {
    background-color: #090B0E;
    border: 1px solid rgba(255, 255, 255, 0.06);
  }
  .tactical-grid-bg {
    background-size: 32px 32px;
    background-image:
      linear-gradient(to right, rgba(255, 255, 255, 0.025) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
  }
}
```

### 3. Implement Complete TypeScript Interfaces (`src/types/climate.ts`)
Define and export all strict types:
- `NasaVariableCode`: `'ALLSKY_SFC_SW_DWN' | 'GWETROOT' | 'TS' | 'PRECTOTCORR' | 'T2M'`
- `SymptomId`: `'coastal_drought' | 'peatland_drying' | 'extreme_flood_dipole' | 'custom_exploration'`
- `EcosystemType`: `'maritime_tropics' | 'tropical_peatland' | 'semi_arid_basin' | 'coastal_delta'`
- `ViewLayerMode`: `'overview' | 'lag_cascade' | 'citizen' | 'scientific'`
- `NasaVariableMeta`: `{ code, label, shortLabel, unit, physicalRole, studentDefinition, nasaInstrumentHeritage }`
- `RegionCoordinates`: `{ name: string; country: string; lat: number; lon: number; isOceanGrid?: boolean }`
- `MonthlyObservation`: `{ year: number; month: number; dateLabel: string; rawValue: number; deseasonalizedZ: number }`
- `TrendAnalysisResult`: `{ variable: NasaVariableCode; variableLabel: string; unit: string; sampleCount: number; mannKendallTau: number; zScore: number; pValue: number; significanceLevel: 'HIGHLY_SIGNIFICANT' | 'SIGNIFICANT' | 'NOT_SIGNIFICANT'; direction: 'INCREASING' | 'DECREASING' | 'STABLE'; sensSlopePerDecade: number; confidenceInterval95: [number, number]; changePointDate: string; pettittStatistic: number; series: MonthlyObservation[]; isAvailable: boolean }`
- `LagCascadeLink`: `{ fromVariable: NasaVariableCode; fromLabel: string; toVariable: NasaVariableCode; toLabel: string; optimalLagMonths: number; correlationR: number; pValue: number; isSignificant: boolean; interpretation: string }`
- `GistempBenchmarkResult`: `{ datasetName: string; period: string; computedSlopePerDecade: number; publishedReferenceSlopePerDecade: number; mannKendallTau: number; mannKendallPValue: number; deviationPct: number; isCalibrated: boolean }`
- `DualRegionAnalysisReport`: `{ caseId: string; title: string; climateDriverTag: string; dataSourceTag: 'CACHED_NASA_POWER_V2' | 'LIVE_NASA_POWER_V2'; symptom: SymptomId; ecosystem: EcosystemType; startYear: number; endYear: number; regionA: RegionCoordinates; regionB: RegionCoordinates; trendsA: Record<NasaVariableCode, TrendAnalysisResult>; trendsB: Record<NasaVariableCode, TrendAnalysisResult>; primaryVariable: NasaVariableCode; dipoleCorrelationR: number; dipolePValue: number; isOppositeDirection: boolean; lagCascadeA: LagCascadeLink[]; silentEcologicalStressDetected: boolean; silentStressReason: string; oceanFallbackNotice?: string; gistempValidation: GistempBenchmarkResult }`
- `CausalExplanationResponse`: `{ headline: string; physicalMechanism: string[]; mitigationActions: string[]; source: 'gemini_3_8_flash' | 'deterministic_fallback' }`

### 4. Implement NASA POWER API v2 Client (`src/lib/nasaPowerClient.ts`)
- Fetch monthly point data from:
  `https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=PRECTOTCORR,GWETROOT,TS,ALLSKY_SFC_SW_DWN,T2M&community=AG&longitude=${lon}&latitude=${lat}&start=${startYear}&end=${endYear}&format=JSON`
- **Mandatory Data Sanitization Rules:**
  1. NASA POWER monthly responses include keys like `YYYYMM` (`198501`..`198512`) AND `YYYY13` (annual mean). **Strictly filter out `month === 13` (`month < 1 || month > 12`).**
  2. Filter out missing/fill values where `value <= -900` or `!Number.isFinite(value)` (NASA POWER uses `-999` for missing data and for `GWETROOT` over ocean cells).
  3. If `GWETROOT` has fewer than 24 valid observations (e.g., user clicked an ocean coordinate), mark `GWETROOT` `isAvailable: false`, set `region.isOceanGrid = true`, and populate `oceanFallbackNotice = "Ocean grid cell detected: Root-zone soil wetness (GWETROOT) is land-only; automatically analyzing skin temperature (TS) and precipitation (PRECTOTCORR)."` without throwing an error.
  4. Include `AbortSignal.timeout(4500)` and clean DMS coordinate formatter helper (`formatDMS(lat, lon)` $\rightarrow$ e.g. `07°27'S, 112°27'E`).

### 5. Implement Deterministic Statistical Engine (`src/lib/statsEngine.ts`)
Implement pure, deterministic TypeScript functions (zero external native stats packages):
1. **`deseasonalizeMonthlySeries(rawPoints)`:**
   - Group observations by calendar month $m \in \{1..12\}$, compute monthly mean $\mu_m$ and standard deviation $\sigma_m = \max(\text{std}_m, 10^{-6})$, and compute $Z_{y,m} = (X_{y,m} - \mu_m) / \sigma_m$.
2. **`mannKendallTest(values)`:**
   - Compute $S = \sum_{i=1}^{n-1} \sum_{j=i+1}^{n} \operatorname{sgn}(x_j - x_i)$, Kendall's $\tau = \frac{2S}{n(n-1)}$, variance $\operatorname{Var}(S) = \frac{n(n-1)(2n+5)}{18}$ (with tie adjustment), continuity-corrected $Z_{\text{MK}}$, and two-tailed $p$-value using an accurate Abramowitz & Stegun complementary error function `erfc(|Z_MK| / Math.SQRT2)`.
   - Classify: `pValue < 0.01` $\rightarrow$ `'HIGHLY_SIGNIFICANT'`; `pValue < 0.05` $\rightarrow$ `'SIGNIFICANT'`; else `'NOT_SIGNIFICANT'`.
3. **`sensSlopePerDecade(rawValues)`:**
   - Compute all pairwise monthly slopes $d_{ij} = \frac{X_j - X_i}{j - i}$ ($1 \le i < j \le n$), sort ascending, take median $\times 120$ (120 months = 1 decade), and compute 95% confidence interval bounds using $C_\alpha = 1.96 \sqrt{\operatorname{Var}(S)}$.
4. **`pettittChangePoint(deseasonalizedZ, dateLabels)`:**
   - Compute rank-sum Pettitt statistic $U_{t,T} = 2 \sum_{i=1}^t R_i - t(T + 1)$ where $R_i$ is the rank of $Z_i$ ($O(n \log n)$ fast execution for $n = 480$), find $t^* = \arg\max_{1 \le t < T} |U_{t,T}|$, and return `{ changePointDate: dateLabels[t*], pettittStatistic: K_T }`.
5. **`computeLagCascade(trendsA)` & Silent Ecological Stress Detector:**
   - Evaluate the 3 water-energy causal links for lags $k \in \{0, 1, 2, 3, 4, 5, 6\}$ months on `deseasonalizedZ`:
     1. `ALLSKY_SFC_SW_DWN` $\rightarrow$ `GWETROOT`
     2. `GWETROOT` $\rightarrow$ `TS`
     3. `TS` $\rightarrow$ `PRECTOTCORR`
   - Select optimal lag $k^*$ maximizing $|r_{XY}(k)|$, compute two-tailed Student-$t$ $p$-value ($t = r \sqrt{(n-2)/(1-r^2)}$), and generate a clear physical interpretation string.
   - Set `silentEcologicalStressDetected = true` if `GWETROOT` is significantly decreasing (`direction === 'DECREASING' && pValue < 0.01`) while `PRECTOTCORR` is either not significantly decreasing (`pValue >= 0.05`) or lags behind `GWETROOT` ($k^* \ge 1$ month with strong coupling).
6. **`buildDualRegionReport(...)`:**
   - Orchestrate the full `DualRegionAnalysisReport`, computing inter-regional Pearson correlation `dipoleCorrelationR` on the primary variable's `deseasonalizedZ` series and setting `isOppositeDirection = true` when Region A and Region B have opposite-sign slopes or negative dipole correlation ($r < -0.20, p < 0.05$).

**Session 1 Verification:** Create a minimal placeholder `src/app/layout.tsx` and `src/app/page.tsx` so you can run `npx tsc --noEmit` and `npx eslint .`. Fix all errors before finishing Session 1.
```

---

## SESI 2 (14:25 – 15:15 WIB): Dataset Pre-Cached 3 Studi Kasus (1985–2025), Benchmark GISTEMP v4, API Routes (`/api/analyze` & `/api/explain`), & Bounded AI (`gemini-3.8-flash`)

```text
[INSTRUKSI MANUAL SEBELUM PASTE MASTER PROMPT SESI 2:
1. Pastikan Sesi 1 sudah selesai dan `npx tsc --noEmit` menghasilkan 0 error.
2. Tidak perlu melampirkan gambar apa pun pada Sesi 2 ini.
3. Copy-paste Master Prompt Sesi 2 di bawah ini ke chat Antigravity.]
```

### Master Prompt Sesi 2 (Copy-Paste ke Antigravity)

```markdown
Great work on Session 1. Now execute **Session 2**: implement the NASA variable metadata, the embedded NASA GISTEMP v4 cross-validation benchmark dataset, the 3 curated 40-year (1985–2025) pre-cached teleconnection datasets, the deterministic causal fallback generator, and the two Next.js 16 App Router API endpoints (`/api/analyze` and `/api/explain`).

### Implement the following files completely (zero `// TODO` or stubbed arrays):

1. **`src/data/nasaVariables.ts`**:
   - Export `NASA_VARIABLES: Record<NasaVariableCode, NasaVariableMeta>` and `SYMPTOM_PRESETS` mapping each `SymptomId` (`coastal_drought`, `peatland_drying`, `extreme_flood_dipole`, `custom_exploration`) to its primary variable, physical description, and recommended variable set:
     - `ALLSKY_SFC_SW_DWN`: *All-Sky Surface Shortwave Downward Irradiance* ($\text{MJ/m}^2/\text{day}$, Role: `'Energy Driver'`, Heritage: `'NASA CERES / MERRA-2'`).
     - `GWETROOT`: *Root-Zone Soil Wetness (0–100 cm)* ($\text{fraction } 0\text{--}1$, Role: `'Silent Stress Indicator'`, Heritage: `'NASA GLDAS / MERRA-2 Land'`).
     - `TS`: *Earth Skin Surface Temperature* ($^\circ\text{C}$, Role: `'Thermal Feedback'`, Heritage: `'NASA MODIS / AIRS / MERRA-2'`).
     - `PRECTOTCORR`: *Bias-Corrected Total Precipitation* ($\text{mm/day}$, Role: `'Hydrological Output'`, Heritage: `'NASA GPM IMERG / MERRA-2'`).
     - `T2M`: *Air Temperature at 2 Meters* ($^\circ\text{C}$, Role: `'Cross-Validation'`, Heritage: `'NASA MERRA-2 / GISTEMP v4'`).

2. **`src/data/gistempBenchmark.ts` & Dynamic Calibration in `src/lib/statsEngine.ts`**:
   - Create `GISTEMP_V4_MONTHLY_1985_2025` containing a realistic, scientifically accurate 1985–2025 NASA GISTEMP v4 global surface temperature anomaly series (480 monthly points reflecting the actual warming trajectory from $\approx +0.32^\circ\text{C}$ in 1985 to $\approx +1.18^\circ\text{C}$ in 2024–2025).
   - Implement `runGistempCrossValidation()` in `src/lib/statsEngine.ts` that runs your exact `mannKendallTest()` and `sensSlopePerDecade()` on `GISTEMP_V4_MONTHLY_1985_2025` and compares the computed decadal slope against the GISTEMP v4 reference trend ($\approx +0.215^\circ\text{C}/\text{decade}$ over 1985–2025) dynamically—**never hardcode the output numbers**.

3. **`src/data/cachedCases.ts` (3 Complete 40-Year Curated Teleconnection Cases, 1985–2025)**:
   - Build a deterministic, seeded climate time-series generator in `src/data/cachedCases.ts` (using fixed mathematical seasonality + ENSO/IOD dipole oscillation + multi-decadal trend + post-2015 regime shift + realistic physical lag cascade) that produces complete, 480-month (`1985-01` to `2024-12` / `2025-12`) raw datasets for all 5 NASA variables for these **3 curated inland land-grid cases**:
     1. **Case 1 (`iod-surabaya-turkana`) — Maritime Indonesia vs. East Africa Climate Seesaw (IOD/ENSO Dipole):**
        - `regionA`: *East Java Agricultural Corridor (Surabaya/Sidoarjo, ID)* (`lat: -7.45, lon: 112.45`) — exhibits a statistically significant drying trend in `GWETROOT` and `PRECTOTCORR` ($p < 0.01$) and rising `TS` & `ALLSKY_SFC_SW_DWN` with a sharp Pettitt regime shift around `2015-08`.
        - `regionB`: *Turkana Basin, Kenya* (`lat: 3.12, lon: 35.60`) — exhibits a statistically significant **opposite-direction** positive rainfall/wetness anomaly trend ($p < 0.01$) driven by positive Indian Ocean Dipole (IOD) & ENSO phases (`dipoleCorrelationR` $\approx -0.64$ to $-0.72$, `isOppositeDirection: true`).
     2. **Case 2 (`enso-kalimantan-peru`) — Central Kalimantan Peatlands vs. Piura Coastal Peru (Silent Peatland Drying):**
        - `regionA`: *Central Kalimantan Peatland Basin (Palangkaraya, ID)* (`lat: -2.22, lon: 113.91`) — specifically demonstrates **Silent Ecological Stress**: `ALLSKY_SFC_SW_DWN` increases significantly, driving a highly significant drop in root-zone soil wetness `GWETROOT` ($p < 0.001$, lag $k^* = 1\text{--}2\text{ months}$) and rising `TS` ($p < 0.01$), while total precipitation `PRECTOTCORR` shows high seasonal variance without a significant linear trend ($p > 0.08$), triggering `silentEcologicalStressDetected = true`!
        - `regionB`: *Piura River Basin, Northern Peru* (`lat: -5.19, lon: -80.63`) — exhibits opposite-sign El Niño precipitation surges (`isOppositeDirection: true`).
     3. **Case 3 (`brantas-water-energy`) — Brantas Watershed Water-Energy Coupling (Agricultural Drought Early Warning):**
        - `regionA`: *Upper Brantas Watershed (Malang/Batu, ID)* (`lat: -7.97, lon: 112.63`).
        - `regionB`: *Lower Brantas Delta (Sidoarjo/Surabaya, ID)* (`lat: -7.35, lon: 112.72`).
        - Demonstrates upstream-to-downstream soil moisture depletion and thermal feedback lag cascade.
   - Export helper `getPrecomputedCaseReport(caseId, startYear, endYear, symptom)` that runs `buildDualRegionReport` synchronously in $< 15\text{ms}$.

4. **`src/lib/causalFallback.ts`**:
   - Implement `generateDeterministicCausalBrief(report: DualRegionAnalysisReport): CausalExplanationResponse` that formats a high-precision scientific headline, 3 physical mechanism bullet points (explicitly citing the exact computed `mannKendallTau`, `pValue`, `sensSlopePerDecade`, `changePointDate`, `dipoleCorrelationR`, and `lagCascadeA` months from `report`), and 3 actionable regional environmental mitigation recommendations.

5. **`src/app/api/analyze/route.ts`**:
   - Support `GET` and `POST`:
     - If `caseId` matches one of the 3 curated cases (and no custom coordinates override it), return the pre-cached report analyzed over `[startYear, endYear]` immediately.
     - If custom coordinates (`latA, lonA, latB, lonB`) are provided, fetch live NASA POWER API v2 data for Region A and Region B in parallel via `Promise.all`, run `buildDualRegionReport`, and return `dataSourceTag: 'LIVE_NASA_POWER_V2'`.
     - If live NASA POWER times out or is unreachable, gracefully synthesize a fallback regional dataset seeded by latitude/longitude climatology so the live map click **never returns HTTP 500** during judging.

6. **`src/app/api/explain/route.ts`**:
   - Accept `{ reportSummary }` containing only the computed statistical metrics (never raw 480-month arrays).
   - If `process.env.GEMINI_API_KEY` is present, call the official **`@google/genai`** SDK (`new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })`) with model **`gemini-3.8-flash`**, `AbortSignal.timeout(2800)`, `responseMimeType: 'application/json'`, and a strict system instruction:
     *"You are a NASA Earth System Scientist specializing in coupled water-energy cycles and climate teleconnections. Using ONLY the provided statistical numbers (Mann-Kendall tau, p-value, Sen's slope per decade, Pettitt regime shift date, dipole correlation r, and lag-cascade months), return JSON `{ headline: string, physicalMechanism: string[3], mitigationActions: string[3] }`. Never invent or alter any number."*
   - If `GEMINI_API_KEY` is missing, rate-limited, or times out ($> 2.8\text{s}$), immediately return HTTP `200` using `generateDeterministicCausalBrief` with `source: 'deterministic_fallback'`.

**Session 2 Verification:** Run `npx tsc --noEmit` and `npx eslint .` and confirm all 3 curated cases produce valid `DualRegionAnalysisReport` objects with zero errors.
```

---

## SESI 3 (15:15 – 16:15 WIB): Tactical Geospatial Telemetry HUD, Top Bar, Hypothesis Triage, Interactive Monochrome World Map (Radar Rings + DMS Pills), & 4-Node Lag-Cascade Stepper

```text
[INSTRUKSI MANUAL SEBELUM PASTE MASTER PROMPT SESI 3:
1. Lampirkan 1 gambar referensi (`Screenshot 2026-11-14 131343.jpg` — gambar FuseLab Creative dark telemetry HUD) ke dalam chat Antigravity cukup satu kali ini saja.
2. Copy-paste Master Prompt Sesi 3 di bawah ini ke chat Antigravity.]
```

### Master Prompt Sesi 3 (Copy-Paste ke Antigravity)

```markdown
Now execute **Session 3**: build the core **Tactical Geospatial Telemetry HUD** components for **NusaShift**, strictly following `ui_ux_design_brief_nusashift.md` and the attached dark telemetry HUD reference image (matte graphite `#0E1116` canvas, `#14181F` translucent HUD panels with `1px solid rgba(255,255,255,0.08)` hairline borders, uppercase `11px` tracking-widest micro-headers with LED status dots, tabular monospace readouts, concentric radar target rings on a monochrome dark world map, and a horizontal waypoint stepper for the 4-node Water-Energy Lag-Cascade).

**Strict Anti-AI-Slop Mandate:** Do NOT use purple/indigo/blue SaaS gradients, rounded-3xl cards, or generic marketing hero banners. Every pixel must look like a NASA / FuseLab / Titanic Plates geospatial telemetry workstation in **100% English**.

### Implement the following components completely:

1. **`src/app/layout.tsx`**:
   - Load `Inter` (`--font-inter`) and `JetBrains_Mono` (`--font-jetbrains-mono`) via `next/font/google`.
   - Set page metadata title to `"NusaShift | Coupled Earth-System Regime & Lag-Cascade Detective (NASA Space Apps 2026)"`.
   - Apply dark obsidian/graphite base classes (`bg-[#0E1116] text-[#F3F5F8] antialiased selection:bg-[#F97316]/30`).

2. **`src/components/NavbarHeader.tsx` (Derived from Reference 2 Top Telemetry Bar)**:
   - **Left:** Geometric radar/satellite emblem + **`NusaShift`** (`font-bold tracking-tight text-white text-base`) + subtle telemetry tag `NASA POWER v2 · MERRA-2 · GISTEMP v4`.
   - **Center (Recessed Pill View Switcher):** Dark well (`hud-well p-1 rounded-lg flex items-center gap-1`) switching active view mode:
     - `Overview & Map` | `Lag-Cascade` | `Citizen View` | `Scientific Proof`
     - Active pill shows `bg-[#1B2029] text-white border border-white/15` with a `6px` glowing LED dot (`#F97316` or `#22C55E`).
   - **Right (Top-Level Numeric KPI Strip + Action Buttons):**
     - Display 3 live tabular-mono KPI readouts side-by-side:
       1. **`dipoleCorrelationR`** (e.g., `-0.68`, colored `#F97316` / `#EAB308`) + micro-label `Dipole Index (r)`
       2. **`changePointDate`** (e.g., `2015-08`, colored `#EF4444`) + micro-label `Pettitt Regime Shift`
       3. **`GISTEMP Accuracy`** (e.g., `99.2%`, colored `#22C55E`) + micro-label `GISTEMP Calibration`
     - Include **`Share URL`** button (copies shareable link with toast feedback) and **`Export Brief`** button (downloads `.md` scientific report).

3. **`src/components/HypothesisTriage.tsx` (Left Column HUD — Derived from Reference 1 `FLEET LIST` & `FLIGHT MODE`)**:
   - **Section 1 — 3-Step Diagnostic Triage:**
     - Micro-header: `⛨ HYPOTHESIS TRIAGE & SENSOR SELECTION`.
     - **Q1 Observed Symptom:** 2×2 tactical matrix buttons (`Coastal Drought`, `Peatland Drying`, `Flood Dipole`, `Custom`) with active LED indicator dot (`#F97316`).
     - **Q2 Target Ecosystem:** Compact selector (`Maritime Tropics`, `Tropical Peatland`, `Semi-Arid Basin`, `Coastal Delta`).
     - **Q3 Historical Window:** Segmented recessed buttons (`40Y (1985–2025)` | `30Y (1995–2025)` | `20Y (2005–2025)`).
   - **Section 2 — Mapped NASA POWER Telemetry Strips (Styled like Reference 1's `FLEET LIST` & `LIVE TELEMETRY`):**
     - Render each of the 4 core NASA variables (`ALLSKY_SFC_SW_DWN`, `GWETROOT`, `TS`, `PRECTOTCORR`) as an interactive horizontal strip (`hud-well hover:bg-[#1B2029] transition px-3 py-2.5 rounded-lg cursor-pointer`):
       - **Left:** Variable code badge (`GWETROOT`) + plain-English label (`Root-Zone Soil Wetness`) + physical role tag (`Silent Stress Indicator`). Clicking selects it as the active chart variable.
       - **Center:** Inline SVG mini-sparkline (`56px × 18px`) plotting the decadal trajectory in `#F97316` (drying/warming) or `#06B6D4` / `#22C55E` (wetting/stable).
       - **Right:** `font-mono text-xs` Sen's Slope per decade (`-0.038 /dec`) + significance LED badge (`■ p < 0.01`, `■ p < 0.05`, or `Noise`).
       - Include a hover/expandable *"Why This Variable Matters"* student tooltip citing `nasaInstrumentHeritage`.
   - **Section 3 — Live NASA GISTEMP v4 Calibration Mini-Card:**
     - Compact HUD card displaying `Reference Slope` vs `Computed Slope`, `Mann-Kendall p-value`, and a glowing green `● ENGINE CALIBRATED` badge.

4. **`src/components/InteractiveWorldMap.tsx` (Center Stage — Derived from Reference 1 & Reference 2 Map Viewports)**:
   - **Top Overlay Controls:**
     - **3 Curated Case Quick-Pills:**
       1. `Case 1: Surabaya ↔ Turkana [IOD Dipole]`
       2. `Case 2: Kalimantan ↔ Peru [Silent Peat Drying]`
       3. `Case 3: Brantas Watershed [Water-Energy]`
     - **Click-to-Analyze Pin Mode Toggle:** `[● Click Map: Set Region A (Target)]` vs `[● Click Map: Set Region B (Pair)]` + data source badge (`CACHED NASA POWER V2` or `LIVE NASA POWER V2`).
   - **Interactive Monochrome SVG World Map Canvas (`viewBox="0 0 1000 500"`):**
     - Render clean, recognizable SVG continent/archipelago paths (North/South America, Europe, Africa, Asia, Maritime Southeast Asia/Indonesia islands, Australia) in matte dark graphite (`fill="#1A1F29" stroke="#2A3241" strokeWidth="1"`) over an abyssal ocean (`#090B0E`) with `15°` lat/lon graticule grid lines (`stroke="rgba(255,255,255,0.04)"`) and equator/tropics dashed lines.
     - Clicking anywhere on the SVG converts `(clientX, clientY)` to exact `(lat, lon)` (`lat` $\in [-60, 75]$, `lon` $\in [-180, 180]$) and triggers analysis for the selected pin (`Region A` or `Region B`).
   - **Concentric Radar Target Rings & Floating DMS Coordinate Pills (Exact Reference 2 "Alhambra / Baldwin Park" Style):**
     - At `Region A` (`#F97316` Burnt Orange) and `Region B` (`#06B6D4` Telemetry Cyan):
       - Outer dashed radar circle (`r="32"`, `strokeDasharray="3 3"`), translucent radial zone (`fillOpacity="0.16"`), inner ring (`r="14"`), and center pulsing dot (`r="4.5"`).
       - Floating coordinate callout pill above each radar circle: `07°27'S, 112°27'E · East Java` in crisp `font-mono text-[11px]`.
   - **Animated Teleconnection Dipole Arc:**
     - Curved SVG quadratic Bezier path connecting `Region A` and `Region B` with a glowing dashed stroke and midpoint badge showing `Dipole r = ${dipoleCorrelationR} (${isOppositeDirection ? 'OPPOSITE-SIGN' : 'COUPLED'})`.
   - If `report.oceanFallbackNotice` is present, show a sleek amber telemetry banner at the bottom of the map.

5. **`src/components/LagCascadePanel.tsx` (Derived from Reference 1's `LAUNCH -> WP1 -> WP2 -> WP3` Horizontal Waypoint Stepper)**:
   - Positioned directly below the World Map in Center Stage.
   - If `report.silentEcologicalStressDetected === true`, display a high-contrast coral/orange alert strip at the top of the panel:
     **`⚠ SILENT ECOLOGICAL STRESS DETECTED:`** followed by `report.silentStressReason` (explaining that root-zone soil moisture `GWETROOT` is dropping significantly at $p < 0.01$ before precipitation `PRECTOTCORR` shows a linear decline).
   - Render the **4-Node Horizontal Water-Energy Causal Pipeline**:
     - **Node 1:** `ALLSKY_SFC_SW_DWN` (*Solar Irradiance*)
     - **Connector 1:** Pill badge `+${k1} mo lag · r = ${r1}` $\longrightarrow$
     - **Node 2:** `GWETROOT` (*Root Soil Wetness*) — pulsing `#EF4444` double ring when Silent Stress is active
     - **Connector 2:** Pill badge `+${k2} mo lag · r = ${r2}` $\longrightarrow$
     - **Node 3:** `TS` (*Skin Temperature*)
     - **Connector 3:** Pill badge `+${k3} mo lag · r = ${r3}` $\longrightarrow$
     - **Node 4:** `PRECTOTCORR` (*Total Precipitation*)
   - Each node displays its `Mann-Kendall τ`, `Sen's Slope / dec`, and `Pettitt Shift Date` underneath, matching Reference 1's waypoint telemetry style.

**Session 3 Verification:** Run `npx tsc --noEmit` and `npx eslint .` to verify all Session 3 components compile cleanly with zero TypeScript or lint errors.
```

---

## SESI 4 (16:15 – 17:00 WIB): Bounded AI Inspector (`IDENTIFIED RISKS`), Grafik Sinkron 2 Wilayah, Tabel Matriks `Scientific Proof`, Integrasi Penuh `page.tsx`, & Handoff Tim

```text
[INSTRUKSI MANUAL SEBELUM PASTE MASTER PROMPT SESI 4:
1. Sesi terakhir ini merakit panel kanan AI Inspector, grafik Recharts sinkron 2 wilayah, tabel matriks Scientific Proof, dan menyatukan seluruh aplikasi di `src/app/page.tsx` hingga lulus `npm run build`.
2. Copy-paste Master Prompt Sesi 4 di bawah ini ke chat Antigravity.]
```

### Master Prompt Sesi 4 (Copy-Paste ke Antigravity)

```markdown
Now execute **Session 4** to complete **NusaShift**: build the Right-Column Bounded AI Risk Inspector (`BoundedAiBrief.tsx`), the Bottom Synchronized Dual-Region Recharts Deck (`DualRegionCharts.tsx`), the Expandable Scientific Proof Matrix (`ScientificProofDrawer.tsx`), the master dashboard orchestrator (`src/app/page.tsx`), `.env.example`, and `TEAM_UI_HANDOFF.md`.

### Implement the following files completely:

1. **`src/components/BoundedAiBrief.tsx` (Right Column HUD — Derived from Reference 1 Circular Gauge + Reference 2 `IDENTIFIED RISKS` Inspector)**:
   - **Top Module — Dipole Coupling Circular Gauge (Reference 1 `82% COMPLETE` Ring Style):**
     - Render an SVG circular gauge (`88px × 88px`) showing `Math.round(Math.abs(report.dipoleCorrelationR) * 100)%` (`COUPLING`), colored with an orange/cyan stroke, paired with right-aligned telemetry metadata rows:
       - `Driver:` `report.climateDriverTag`
       - `Regime Mode:` `report.isOppositeDirection ? 'OPPOSITE-SIGN SEESAW' : 'SYNCHRONOUS'`
       - `Dipole p-val:` `p = ${report.dipolePValue.toExponential(2)}`
       - `Data Feed:` `report.dataSourceTag`
   - **Bottom Module — `IDENTIFIED REGIME RISKS & CAUSAL BRIEF` (Exact Reference 2 Right Panel Style):**
     - Automatically calls `POST /api/explain` whenever `report` changes (with clean loading skeleton and instant fallback).
     - Displays DMS coordinates for `Region A` and `Region B`, primary variable Pettitt shift date, and the synthesized `headline`.
     - **`PHYSICAL TELECONNECTION MECHANISM:`** 3 evidence-bound bullet points highlighting the statistical findings.
     - **`REGIONAL MITIGATION RECOMMENDATIONS:`** 3 concrete environmental/policy actions for local decision-makers (e.g., East Java reservoir allocation, Kalimantan peatland canal blocking / rewetting, coastal drought buffer).
     - Footer provenance badge: `● BOUNDED AI (GEMINI 3.8 FLASH · ZERO-HALLUCINATION LOCK)` or `● DETERMINISTIC PHYSICS ENGINE`.

2. **`src/components/DualRegionCharts.tsx` (Bottom Analytics Deck — Synchronized Dual-Region Recharts)**:
   - Header controls:
     - Active variable selector pills (`GWETROOT`, `PRECTOTCORR`, `TS`, `ALLSKY_SFC_SW_DWN`, `T2M`).
     - Series mode toggle: **`Deseasonalized Z-Score Anomaly`** (default, removes seasonal cycle as required by NASA) vs. **`Raw Monthly Observations`**.
   - Side-by-side (or stacked synchronized) Recharts `ResponsiveContainer` + `ComposedChart` panels for **Region A** (`#F97316` Burnt Orange line/area) and **Region B** (`#06B6D4` Telemetry Cyan line/area):
     - Dark recessed chart well (`bg-[#090B0E] border border-white/5 rounded-lg p-3 h-[250px]`).
     - Horizontal grid lines (`stroke="rgba(255,255,255,0.05)" strokeDasharray="2 2"`).
     - Zero anomaly reference baseline (`ReferenceLine y={0} stroke="rgba(255,255,255,0.22)"`).
     - **Prominent Vertical Pettitt Change-Point Line:** `ReferenceLine x={trend.changePointDate} stroke="#EF4444" strokeDasharray="4 4" strokeWidth={1.5}` with label `Shift: ${trend.changePointDate}`.
     - Above each chart, display a compact telemetry strip: `Mann-Kendall τ`, `p-value`, `Sen's Slope / Decade (95% CI)`, and significance badge (`HIGHLY SIGNIFICANT p < 0.01`, `SIGNIFICANT p < 0.05`, or `SEASONAL NOISE`).

3. **`src/components/ScientificProofDrawer.tsx` (Derived from Reference 2's Expandable Tabular Risk Matrix)**:
   - Displayed prominently when `viewMode === 'scientific'` (and accessible via a quick-toggle tab in the bottom deck):
   - **High-Density Statistical Proof Table:**
     - Rows for all 5 NASA POWER variables across **Region A** and **Region B** (10 rows total).
     - **Left Severity Badge (Exact Reference 2 Colored Square Style):** `w-16 h-8 rounded font-mono text-xs font-bold flex items-center justify-center` colored red/orange (`bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40`) for $p < 0.01$, gold for $p < 0.05$, and slate for non-significant, showing `τ = ${tau}`.
     - Columns: `Variable & NASA Heritage` | `Region & DMS Coordinates` | `Sample N` | `Mann-Kendall Z & p-value` | `Sen's Slope / Decade` | `95% Confidence Interval` | `Pettitt Regime Shift (K_T & Date)`.
   - **Full NASA GISTEMP v4 Cross-Validation Benchmark Panel:**
     - Explains how the exact same `mannKendallTest()` and `sensSlopePerDecade()` functions were verified against NASA GISTEMP v4 (`1985–2025`), showing `Published Reference Slope`, `Engine Computed Slope`, `Deviation %`, and mathematical formula summary ($Z_{y,m}$, Mann-Kendall $S$, Sen's Slope $Q_{\text{decade}}$, Pettitt $U_{t,T}$, and Lead-Lag $r_{XY}(k)$).

4. **`src/app/page.tsx` (Master Bento Command Orchestrator + URL Hydration + Markdown Report Export)**:
   - On initial render, hydrate immediately with **Case 1 (`iod-surabaya-turkana`)** so the dashboard is 100% populated in $< 50\text{ms}$ with zero login or blank states.
   - Read URL query parameters inside a hydration-safe `useEffect` (`?case=...` or `?latA=...&lonA=...&latB=...&lonB=...&symptom=...&window=...`) to restore shared investigations.
   - Implement the **12-Column Tactical Bento Grid** (`Top Bar` $\rightarrow$ `Left 3 Cols: HypothesisTriage` | `Center 6 Cols: InteractiveWorldMap + LagCascadePanel` | `Right 3 Cols: BoundedAiBrief` $\rightarrow$ `Bottom 12 Cols: DualRegionCharts + ScientificProofDrawer`).
   - When the user switches top-bar view modes (`Overview & Map`, `Lag-Cascade`, `Citizen View`, `Scientific Proof`), smoothly highlight/scroll or expand the corresponding analytical view without page reloads, and in `Citizen View` display a plain-English *"What This Means for Local Communities & Farmers"* translation banner.
   - Implement **Share URL** (copies full parameterized URL to clipboard) and **Export Brief** (triggers browser download of a formatted `.md` scientific report containing all computed tables and AI synthesis).

5. **`.env.example` & `TEAM_UI_HANDOFF.md`**:
   - Create `.env.example` documenting `GEMINI_API_KEY` and `NEXT_PUBLIC_APP_URL`.
   - Create `TEAM_UI_HANDOFF.md` for the 3 teammates joining at 17:00 WIB explaining:
     - How to run `npm run dev` and where each UI component lives (`src/components/*`).
     - How Tailwind CSS v4 tokens are configured in `src/app/globals.css`.
     - Warning **NOT** to break deterministic formulas in `src/lib/statsEngine.ts` or API routes while polishing animations, map styling, or recording the 30-second demo video.

### Final Build & Production Verification (MANDATORY):
Run the following commands in sequence and fix any issues until all three pass with **zero errors**:
1. `npx tsc --noEmit`
2. `npx eslint .`
3. `npm run build`
```

---

## Checklist Cepat Sebelum Teman Bergabung Pukul 17:00 WIB

Setelah **Sesi 4** selesai dieksekusi oleh Antigravity:
- [ ] Buka `http://localhost:3000` dan pastikan **Case 1 (Surabaya $\leftrightarrow$ Turkana)** langsung tampil dengan peta gelap monokrom, lingkaran radar oranye & cyan, *waypoint* 4-node *Lag-Cascade*, grafik anomali *deseasonalized*, dan panel kanan *Causal Brief*.
- [ ] Klik **Case 2 (Kalimantan $\leftrightarrow$ Peru)** dan pastikan banner merah/oranye **`SILENT ECOLOGICAL STRESS DETECTED`** menyala pada simpul `GWETROOT`.
- [ ] Klik titik acak di **Peta Dunia SVG** untuk menguji *live fetch* NASA POWER API v2 (dan pastikan klik di area laut memunculkan *ocean fallback notice* tanpa *crash*).
- [ ] Klik tab **`Scientific Proof`** di bar atas untuk memastikan tabel matriks 10 baris ($\tau$, $p$-value, Sen's Slope 95% CI, Pettitt date) dan kartu **NASA GISTEMP v4 Calibration** tampil lengkap.
- [ ] Push ke repository GitHub **`nusashift`** dan hubungkan ke **Vercel** agar *live URL* sudah siap dipakai tim pukul 17:00 WIB.