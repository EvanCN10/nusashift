# NusaShift — Team UI & Demo Handoff Guide (17:00 WIB Sync)

**Project:** `NusaShift: Coupled Earth-System Regime & Lag-Cascade Detective`  
**Challenge:** NASA International Space Apps Challenge 2026 — *Be An Earth System Trend Detective!*  
**Stack:** Next.js 16 (`App Router`, `reactCompiler: true`) · React 19 · TypeScript (`strict: true`) · Tailwind CSS v4 · Recharts 3 · `@google/genai` (`gemini-3.8-flash`)

---

## 1. Local Setup (3 Minutes)

```bash
npm install
cp .env.example .env.local   # Add your GEMINI_API_KEY (optional; deterministic fallback works offline)
npm run dev                  # http://localhost:3000
```

Verification scripts before pushing to GitHub / Vercel:

```bash
npm run typecheck            # Runs npx tsc --noEmit
npm run lint                 # Runs eslint .
npm run build                # Production Next.js build
```

---

## 2. Component & File Ownership Map

### Safe UI Surface (`src/components/*` + `src/app/page.tsx`)
| File | Visual Module | Safe to Polish |
| :--- | :--- | :--- |
| `src/components/NavbarHeader.tsx` | Top brand bar, 4-tab view switcher (`Overview & Map`, `Lag-Cascade`, `Citizen View`, `Scientific Proof`), KPI readouts, Share URL & Export Brief actions | Layout, spacing, hover transitions, keyboard focus polish |
| `src/components/HypothesisTriage.tsx` | Left 3-col triage matrix (Symptom, Ecosystem, Window 40Y/30Y/20Y), 4 telemetry rows with SVG sparklines, GISTEMP mini-card | Copy tone (100% English), sparkline stroke visuals, tooltip explanations |
| `src/components/InteractiveWorldMap.tsx` | Full-bleed map viewport switcher: 3D globe (default) or 2D SVG fallback | Switching logic only |
| `src/components/GlobeViewport.tsx` | `react-globe.gl` 3D globe (client-only, code-split): monochrome land, gradient dipole arc, pulsing radar rings, DMS pills, camera fly-to, +/−/recenter buttons, click-to-analyze, WebGL + `prefers-reduced-motion` handling | Colors, camera altitudes, ring/arc animation timing |
| `src/components/FlatMapViewport.tsx` | Legacy 2D equirectangular SVG map (the `2D` mode and the automatic no-WebGL fallback) | Map SVG land path detail, pin labels |
| `src/components/MapControlsBar.tsx` | Floating controls over the globe: curated case pills, `3D / 2D` toggle, `Set Region A/B`, live/cached feed badge, dipole readout, ocean notice | Labels, spacing |
| `src/components/LagCascadePanel.tsx` | Horizontal 4-node Water–Energy causal stepper (`Solar -> Soil Wetness -> Skin Temp -> Precip`) & *Silent Ecological Stress* coral banner | Connector badge layout, mobile stacking, highlight transitions |
| `src/components/BoundedAiBrief.tsx` | Right 3-col circular coupling gauge (`88x88` SVG) + *Identified Regime Risks & Causal Brief* inspector (`POST /api/explain`) | Bullet spacing, skeleton polish, badge typography |
| `src/components/DualRegionCharts.tsx` | Bottom 2-column synchronized Recharts `ComposedChart` (`Z-Score Anomaly` vs `Raw Monthly`) with Pettitt Shift red vertical `ReferenceLine` | Tooltip styling, chart height responsiveness, legend labels |
| `src/components/ScientificProofDrawer.tsx` | Expandable 10-row non-parametric matrix + GISTEMP v4 Cross-Validation card + formulas + NASA archive links | Print/responsive layout, formula formatting |
| `src/app/page.tsx` | Globe hero orchestrator (xl+: HUD panels float over the full-screen globe; below xl: stacked), bottom analytics deck, URL query state (`?case=...` / `?latA=...&lonA=...&latB=...&lonB=...`), Share URL & Markdown `.md` brief export | Citizen View translation copy, spacing, responsive breakpoints |

---

## 3. Tailwind CSS v4 Tactical HUD Design Tokens (`src/app/globals.css`)

Colors and utility classes are registered using `@theme` in `src/app/globals.css`:

- **Surfaces:** `bg-canvas-950` (`#090B0E`), `bg-canvas-900` (`#0E1116`), `bg-panel-850` (`#14181F`), `bg-panel-800` (`#1B2029`), `border-panel-700` (`#262C38`)
- **Typography Colors:** `text-ink-primary` (`#F3F5F8`), `text-ink-secondary` (`#9BA3B2`), `text-ink-muted` (`#5E6778`)
- **Semantic Earth Telemetry Palette:**
  - `drought-orange` (`#F97316`) — Region A / Drying / Stress accent
  - `drought-coral` (`#EF4444`) — `p < 0.01` significance, Pettitt Regime Shift, *Silent Ecological Stress* alert
  - `radar-gold` (`#EAB308`) — `p < 0.05` significance & Lag-Cascade highlight
  - `nominal-green` (`#22C55E`) — Calibrated GISTEMP v4 / Gemini bounded lock
  - `dipole-cyan` (`#06B6D4`) — Region B / Wetting opposite-sign dipole / Ocean telemetry
- **Fonts:** `--font-sans` (`Inter`), `--font-mono` (`JetBrains Mono`) loaded in `src/app/layout.tsx`
- **Panel Utilities:** `.hud-panel`, `.hud-well`, `.tactical-grid-bg`, and responsive stacked `.proof-table` classes inside `src/app/globals.css`
- **Design Rule:** Keep surfaces matte dark with 1px hairline borders; avoid purple gradients or decorative glass blurs that reduce numeric readability.

---

## 4. CRITICAL GUARDRAILS — DO NOT MODIFY WITHOUT REVIEW

The core scientific credibility of **NusaShift** depends on deterministic, zero-hallucination math. While polishing UI/animations, **DO NOT alter formulas, thresholds, or data contracts** in:

- `src/lib/statsEngine.ts` — `deseasonalizeMonthlyZScores`, `mannKendallTest`, `sensSlopePerDecade`, `pettittChangePointTest`, `computeLagCascade`, and `buildDualRegionReport`
- `src/lib/nasaPowerClient.ts` — NASA POWER v2 sanitization (`month === 13` removal, `<= -900` fill filtering, deep ocean `GWETROOT` fallback)
- `src/data/gistempBenchmark.ts` — Real 492-month (1985–2025) NASA GISTEMP v4 series and published OLS reference slope
- `src/data/cachedCases.ts` — Pre-computed curated cases (`iod-surabaya-turkana`, `enso-kalimantan-peru`, `brantas-water-energy`) and `serializeSummaryForAi`
- `src/app/api/analyze/route.ts` & `src/app/api/explain/route.ts` — API timeouts (`4.5s` NASA POWER / `2.8s` Gemini) and `causalFallback.ts` safety guarantees

Wait **not** to expose `.env.local` secrets — `.env.local` stays untracked locally; only `.env.example` should be committed. All UI copy, chart labels, tooltips, and exported reports must stay **100% in English**.

---

## 5. Teammate Sprint Roles (17:00 WIB)

1. **Developer A — Interactive Map & Spatial UI (`GlobeViewport.tsx`, `MapControlsBar.tsx`, `FlatMapViewport.tsx`):** Refine responsive map proportions, radar ring animations (respecting `prefers-reduced-motion`), and mobile touch usability for clicking `Set Region A` / `Set Region B`.
2. **Developer B — Charts & Scientific Matrix (`DualRegionCharts.tsx`, `ScientificProofDrawer.tsx`, `LagCascadePanel.tsx`):** Verify chart readability across 1280px–1920px laptop screens, tooltip legibility, and `Scientific Proof` matrix presentation for judges.
3. **Developer C — Storytelling, 30s Demo Video & NASA Portal Submission:** Record a crisp `<= 30s` English-subtitled screen capture following this exact sequence:
   - `00:00–00:06`: Show hydrated **Case 1 (Surabaya vs. Turkana)** + *Hypothesis Triage*.
   - `00:06–00:14`: Point to side-by-side deseasonalized Recharts showing opposite trends + red vertical **Pettitt Shift** line.
   - `00:14–00:22`: Click **Case 2 (Kalimantan vs. Peru)** -> spotlight **`SILENT ECOLOGICAL STRESS DETECTED`** on `GWETROOT` (`Solar -> Soil Wetness -> Skin Temp -> Precip`).
   - `00:22–00:30`: Click **`Scientific Proof`** tab -> show 10-row Mann-Kendall/Sen/Pettitt table, **NASA GISTEMP v4 Calibration**, and right-hand **Bounded AI Causal Brief**.
