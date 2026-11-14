# UI/UX DESIGN BRIEF & VISUAL SYSTEM SPECIFICATION: NusaShift
**Coupled Earth-System Regime & Lag-Cascade Detective**

* **Target IDE / Agent:** Antigravity Autonomous Coding Agent
* **Framework & Styling:** Next.js 16 (App Router) + React 19.2 + **Tailwind CSS v4** (CSS-first `@theme` in `src/app/globals.css`) + Recharts + Lucide React
* **Visual Paradigm:** **Tactical Geospatial Telemetry & Precision Earth Intelligence** (combining Reference 1: *FuseLab Tactical Telemetry HUD* + Reference 2: *Titanic Plates Seismic & Geospatial Risk Analyzer*)
* **Language Mandate:** 100% English UI copy, micro-labels, tooltips, and telemetry readouts.

---

## 1. Core Aesthetic Philosophy & "Anti-AI-Slop" Guardrails

To ensure **NusaShift** looks like an enterprise NASA/Defense geospatial intelligence platform rather than a generic AI-generated template, the Coding Agent **MUST strictly enforce** the following visual rules:

1. **NO Generic Purple/Blue SaaS Gradients:** Never use `bg-gradient-to-r from-purple-600 to-blue-600` or neon cyberpunk glow. The base canvas is **Matte Graphite & Deep Obsidian (`#0B0D11` to `#181B22`)**, allowing semantic climate telemetry colors (Burnt Amber/Terracotta, Phosphor Emerald, Solar Gold, and Telemetry Cyan) to stand out with surgical precision.
2. **Monochrome Topographic Map + High-Contrast Radar Overlays:** Just like Reference 2 (*Titanic Plates*), the interactive world map must use a desaturated dark graphite landmass (`#1A1E26`) over an abyssal ocean (`#090B0E`) with subtle `1px` lat/lon graticule lines (`rgba(255,255,255,0.05)`). Only the active **Region A & Region B Radar Rings**, **Coordinate Callout Pills**, and **Teleconnection Dipole Arc** carry vibrant semantic color.
3. **1px Hairline Borders & Translucent HUD Panels:** Replicate Reference 1 (*FuseLab*) by framing every card with a crisp `1px solid rgba(255, 255, 255, 0.08)` border, subtle inner top highlight (`inset 0 1px 0 rgba(255, 255, 255, 0.05)`), dark translucent fill (`bg-[#12151B]/90 backdrop-blur-md`), and compact `10px–12px` (`rounded-xl`) corner radii—never bubbly `rounded-3xl` cards or heavy drop shadows.
4. **Strict Typographic Hierarchy (Editorial Sans + Tabular Monospace):**
   * **Micro-Headers:** Uppercase, `10px–11px` (`text-[11px]`), `font-semibold`, wide tracking (`tracking-[0.12em]`), muted slate (`text-[#8A94A6]`), paired with a tiny `12px` Lucide icon or `6px` status LED dot.
   * **Numeric Readouts & Coordinates:** Always use `font-mono tabular-nums` (`JetBrains Mono`) so coordinates (`07°27'00"S, 112°27'00"E`), $p$-values (`p = 0.0018`), Mann-Kendall $\tau$, and Sen's Slope (`-0.038 /dec`) align vertically like cockpit instruments.
5. **LED Status Dots & Segmented Controls:** Every mode selector and variable pill uses a dark recessed housing (`bg-[#0B0D11] border border-white/10`) with a glowing `6px` status dot (`#22C55E` active, `#F97316` warning, `#475569` inactive) inspired directly by the `NAV | ALT | SPD` panel in Reference 1.

---

## 2. Tailwind CSS v4 Design Tokens (`src/app/globals.css`)

Copy this exact CSS-first configuration into `src/app/globals.css` (do **NOT** create `tailwind.config.ts`):

```css
@import "tailwindcss";

@theme {
  /* Base Matte Graphite & Obsidian Surfaces (From Ref 1 & Ref 2) */
  --color-canvas-950: #090B0E;       /* Deepest map ocean & recessed wells */
  --color-canvas-900: #0E1116;       /* Primary application background */
  --color-panel-850: #14181F;        /* Standard HUD card surface */
  --color-panel-800: #1B2029;        /* Hover / elevated card surface */
  --color-panel-700: #262C38;        /* Subtle hairline dividers & grid lines */

  /* Typography Colors */
  --color-ink-primary: #F3F5F8;      /* Crisp white-silver for primary metrics */
  --color-ink-secondary: #9BA3B2;    /* Muted metallic gray for body & descriptions */
  --color-ink-muted: #5E6778;        /* Dimmed slate for axis ticks & micro-labels */

  /* Semantic Telemetry Accents (From Ref 1 Orange/Green & Ref 2 Radar Gold/Coral) */
  --color-drought-orange: #F97316;   /* Drying / Warming / Positive Thermal Anomaly */
  --color-drought-coral: #EF4444;    /* Critical Regime Shift / Silent Stress Alert */
  --color-radar-gold: #EAB308;       /* Active Coordinate Radar Ring & Moderate Shift */
  --color-nominal-green: #22C55E;    /* Statistically Validated / Wetness / Calibrated */
  --color-dipole-cyan: #06B6D4;      /* Region B Counter-Trend / Hydrological Surplus */

  /* Fonts */
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, monospace;
}

/* Custom Tactical Utilities */
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

---

## 3. Master Viewport & Grid Architecture (Bento Command Layout)

Following the exact spatial structure of **Reference 1 (3-Column HUD over Map + Bottom Timeline)** and **Reference 2 (Top Global Bar + Split Analytical View)**:

```text
+--------------------------------------------------------------------------------------------------+
| TOP TELEMETRY BAR (h-14): [Brand: NusaShift] | [View Mode Pill Switcher] | [4 Global KPI Metrics] |
+---------------------------+------------------------------------------+---------------------------+
| LEFT COLUMN (3 cols / 28%)| CENTER STAGE (6 cols / 44%)              | RIGHT COLUMN (3 cols / 28%|
|                           |                                          |                           |
| 1. HYPOTHESIS TRIAGE HUD  | 3. INTERACTIVE MONOCHROME WORLD MAP      | 5. IDENTIFIED REGIME      |
|    - 3 Diagnostic Selects |    - Curated Case Quick-Pills (Top-Left) |    SHIFTS & AI BRIEF      |
|    - 4 Mapped NASA POWER  |    - Concentric Radar Rings on Reg A & B |    - Coordinate Header    |
|      Variable Rows with   |    - Glowing Dashed Teleconnection Arc   |    - Opposite-Sign Dipole |
|      Mini Sparklines &    |    - Floating DMS Coordinate Callout     |      Circular Gauge       |
|      LED Status Dots      |                                          |    - Bounded AI Physical  |
|                           +------------------------------------------+      Mechanism & Bullet   |
| 2. GISTEMP BENCHMARK CARD | 4. 4-NODE LAG-CASCADE WAYPOINT STEPPER   |      Mitigation Actions   |
|    - Live Calibration     |    [Solar Rad] -> [Soil Wet] -> [Skin T] |    - Silent Stress Banner |
|      vs NASA GISTEMP v4   |    (Styled like Ref 1 WP1->WP2->WP3 bar) |                           |
+---------------------------+------------------------------------------+---------------------------+
| BOTTOM ANALYTICS DECK (Full Width / 12 cols):                                                    |
| - Mode A (Default): Synchronized Dual-Region Deseasonalized Z-Score Charts + Pettitt Shift Line  |
| - Mode B (Scientific Proof Tab): High-Density Expandable Statistical Matrix (Ref 2 Table Style)  |
+--------------------------------------------------------------------------------------------------+
```

* **Desktop (`lg` and `xl`):** 12-column CSS Grid (`grid-cols-12 gap-3.5 p-3.5`) where the top operational workspace fits cleanly in view and the Bottom Analytics Deck sits immediately below without cluttered nested scrollbars.
* **Tablet / Mobile (`< lg`):** Stacks gracefully in logical investigation order (`Top Bar` $\rightarrow$ `Hypothesis Triage` $\rightarrow$ `Interactive Map` $\rightarrow$ `Lag-Cascade Stepper` $\rightarrow$ `Dual-Region Charts` $\rightarrow$ `AI Brief & Scientific Table`).

---

## 4. Component-by-Component Visual Mapping from References

### 4.1 `NavbarHeader.tsx` — Derived from Reference 2 ("Titanic plates" Top Bar)
* **Left:** Compact geometric radar/globe icon + **`NusaShift`** in bold tracking-tight white + subtle badge `NASA POWER v2 · MERRA-2`.
* **Center (Pill Navigation Switcher):** Recessed dark pill container (`bg-[#090B0E] p-1 rounded-lg border border-white/10`) containing:
  * `Overview & Map` | `Lag-Cascade` | `Citizen View` | `Scientific Proof`
  * Active tab uses `bg-[#1B2029] text-white border border-white/15 shadow-sm` with a `6px` glowing dot.
* **Right (Top-Level Numeric KPI Strip — Exact Reference 2 Pattern):**
  * Display 3 high-impact summary metrics side-by-side before the `Share URL` button:
    1. **`-0.68`** *(Yellow/Orange `font-mono text-lg font-bold`)* + stacked label `Dipole Index (r)`
    2. **`2015-08`** *(Coral `font-mono text-lg font-bold`)* + stacked label `Pettitt Regime Shift`
    3. **`99.1%`** *(Emerald `font-mono text-lg font-bold`)* + stacked label `GISTEMP Calibration`

### 4.2 `HypothesisTriage.tsx` — Derived from Reference 1 ("FLEET LIST" & "FLIGHT MODE" Panels)
* **Header:** `⛨ HYPOTHESIS TRIAGE & SENSORS` (`text-[11px] uppercase tracking-[0.12em] text-[#8A94A6]`).
* **Symptom & Window Controls:** Styled like Reference 1's `FLIGHT MODE` recessed matrix buttons (`Coastal Drought`, `Peatland Drying`, `Flood Dipole`, `Custom`) with an indicator LED dot (`#F97316` when selected) and window selector pills (`40Y | 30Y | 20Y`).
* **Mapped NASA Variables List (Styled like Reference 1's `FLEET LIST` & `LIVE TELEMETRY` rows):**
  * Each of the 4 NASA POWER variables (`ALLSKY_SFC_SW_DWN`, `GWETROOT`, `TS`, `PRECTOTCORR`) renders as a sleek horizontal telemetry strip (`bg-[#0E1116] hover:bg-[#1B2029] border border-white/5 rounded-lg px-3 py-2 flex items-center justify-between`):
    * **Left:** Variable code badge (`GWETROOT`) + plain-English label (`Root-Zone Soil Wetness`).
    * **Center:** Mini SVG sparkline (`48px × 16px`) colored in `#F97316` (decreasing/drying) or `#22C55E` (increasing/wetting).
    * **Right:** Sen's Slope readout (`-0.042/dec`) + status LED square (`■ p < 0.01`).

### 4.3 `InteractiveWorldMap.tsx` — Derived from Reference 1 & Reference 2 Map Viewports
* **Map Canvas:** Dark monochrome SVG world vector map (`#181C24` continents, `#262C38` coastlines, `#090B0E` ocean, subtle `15°` lat/lon grid lines).
* **Top-Left Overlay Controls (Like Reference 1's `2D | 3D` + Scale Bar):**
  * Pin selector toggle: **`[● Set Region A: Maritime ID]`** vs **`[● Set Region B: Teleconnection Pair]`** + 3 quick-load Case Pills (`Case 1: Surabaya ↔ Turkana`, `Case 2: Kalimantan ↔ Peru`, `Case 3: Brantas Basin`).
* **Concentric Radar Target Overlays (Exact Reference 2 "Alhambra / Baldwin Park" Style):**
  * Around **Region A** and **Region B**, render:
    * Outer dashed SVG circle (`r="36"`, `stroke="#F97316"` for Region A, `stroke="#06B6D4"` for Region B, `stroke-dasharray="3 3"`).
    * Translucent radial fill (`fill="rgba(249, 115, 22, 0.14)"` for Region A; `fill="rgba(6, 182, 212, 0.14)"` for Region B).
    * Center pulsing `5px` target dot.
  * **Floating Coordinate Callout Pill (Exact Reference 2 Style):** Positioned above the radar circle: `bg-[#0E1116]/95 border border-white/15 rounded-full px-2.5 py-1 font-mono text-[11px] text-white shadow-lg` displaying `07°27'S, 112°27'E · East Java`.
* **Teleconnection Arc:** A curved quadratic Bezier SVG path connecting Region A and Region B with an animated dashed stroke (`stroke="url(#dipoleGradient)" strokeDasharray="6 4"`).

### 4.4 `LagCascadePanel.tsx` — Derived from Reference 1's Horizontal Waypoint Bar (`LAUNCH -> WP1 -> WP2 -> WP3`)
* Position directly beneath the map canvas (just like the `LAUNCH — WP1 — WP2 — WP3 — WP4 — RTB` progress bar in Reference 1!).
* Render a 4-node horizontal causal pipeline connected by dashed telemetry lines:
  1. **Node 1:** `ALLSKY_SFC_SW_DWN` (*Solar Irradiance Driver*)
  2. **Connector 1:** Glowing pill badge `+1 mo lag · r = -0.64 (p < 0.01)` $\rightarrow$
  3. **Node 2:** `GWETROOT` (*Root-Zone Soil Wetness*) — **Highlights with a pulsing Coral/Orange ring if `silentEcologicalStressDetected === true`**
  4. **Connector 2:** Glowing pill badge `+1 mo lag · r = -0.71 (p < 0.01)` $\rightarrow$
  5. **Node 3:** `TS` (*Earth Skin Temperature*)
  6. **Connector 3:** Glowing pill badge `+2 mo lag · r = -0.52 (p < 0.05)` $\rightarrow$
  7. **Node 4:** `PRECTOTCORR` (*Total Precipitation*)
* Each node uses a circular double-ring indicator (`w-8 h-8 rounded-full border-2`) with a check/warning icon inside, matching Reference 1's waypoint rings.

### 4.5 `BoundedAiBrief.tsx` — Derived from Reference 2's Right Inspector (`IDENTIFIED RISKS`) & Reference 1's Circular Gauge
* **Top Section — Dipole Strength Circular Gauge (Like Reference 1's `82% COMPLETE` Ring):**
  * SVG circular progress ring showing `|dipoleCorrelationR| * 100` (e.g., `68% DIPOLE COUPLING`) with a warm orange-to-gold stroke gradient, paired with right-aligned metadata rows:
    * `Driver:` `IOD / ENSO Teleconnection`
    * `Direction:` `OPPOSITE-SIGN CONFIRMED`
    * `Silent Stress:` `ACTIVE (Root Zone Drying)`
* **Bottom Section — Structured Risk & Mitigation Brief (Exact Reference 2 `IDENTIFIED RISKS` Layout):**
  * Bold uppercase section header: `CAUSAL MECHANISM & POLICY TRIAGE`
  * Key-value metadata block in `font-mono text-xs`:
    * `Region A:` `East Java Corridor (-7.45°, 112.45°)`
    * `Region B:` `Turkana Basin, Kenya (3.12°, 35.60°)`
    * `Primary Shift:` `Pettitt Breakpoint at 2015-08 (p = 0.002)`
  * **`Physical Mechanism:`** 2–3 concise evidence-bound bullet points citing the exact computed slopes and lag months.
  * **`Recommendations:`** Bulleted actionable mitigation steps (styled identically to Reference 2's bottom-right `Recommendations:` list) + transparent provenance badge (`Verified Stats + Gemini 3.8 Flash` or `Deterministic Rule Engine`).

### 4.6 `DualRegionCharts.tsx` & `ScientificProofDrawer.tsx` — Derived from Reference 1 Bottom Bar Chart & Reference 2 Stacked Oscilloscope + Expandable Table
* **Synchronized Dual-Region Time-Series Deck (Reference 1 & 2 Chart Style):**
  * Top-right chart controls: Variable selector tabs + `Deseasonalized Z-Score` vs `Raw Monthly` pill toggle.
  * Two stacked or side-by-side synchronized Recharts `ComposedChart` panels (`Region A` in `#F97316` Burnt Orange; `Region B` in `#06B6D4` Telemetry Cyan or `#22C55E` Phosphor Green):
    * Dark recessed chart canvas (`bg-[#090B0E] rounded-lg p-3 border border-white/5`).
    * Subtle horizontal grid lines (`stroke="rgba(255,255,255,0.05)" strokeDasharray="2 2"`).
    * Zero anomaly baseline (`ReferenceLine y={0} stroke="rgba(255,255,255,0.2)"`).
    * **Pettitt Change-Point Vertical Marker:** Prominent vertical dashed line (`stroke="#EF4444" strokeWidth={1.5} strokeDasharray="4 4"`) with top badge `Regime Shift: YYYY-MM`.
* **Scientific Proof Table (`ScientificProofDrawer.tsx` — Exact Reference 2 Expandable Table Style):**
  * When `Scientific Proof View` is active, display a high-density tabular matrix where each row represents a variable pair across Region A & Region B:
    * **Left Severity Badge:** Rounded square (`w-11 h-8 rounded-md font-mono font-bold text-xs flex items-center justify-center`) colored by significance (`bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40` for `p < 0.01`, `bg-[#EAB308]/20 text-[#EAB308]` for `p < 0.05`, `bg-white/5 text-[#8A94A6]` for noise) displaying `τ = -0.31`.
    * **Columns:** `Variable & NASA Sensor` | `Region` | `Coordinates` | `Mann-Kendall Z & p-value` | `Sen's Slope / Decade (95% CI)` | `Pettitt Shift Date`.
    * Include the **NASA GISTEMP v4 Cross-Validation Benchmark Card** right alongside the table showing `Reference Slope` vs `Engine Computed Slope` and `Deviation %` with a green `CALIBRATED` LED indicator.

---

## 5. Prompt Snippet to Paste into Antigravity IDE

When starting your build in Antigravity, attach `prd_tele_seesaw_agent_ready.md`, `nusashift_app_flow.md`, and this `ui_ux_design_brief_nusashift.md`, then use this instruction:

> *"Read `prd_tele_seesaw_agent_ready.md`, `nusashift_app_flow.md`, and `ui_ux_design_brief_nusashift.md`. Build the **NusaShift** web application (`Be An Earth System Trend Detective!`) strictly following the Tactical Geospatial Telemetry visual system in `ui_ux_design_brief_nusashift.md` (matte graphite `#0E1116` surfaces, 1px hairline HUD borders, monochrome SVG world map with concentric radar target overlays and floating DMS coordinate pills, Reference 1's horizontal waypoint stepper for the 4-node Water-Energy Lag-Cascade, Reference 2's top KPI strip and right-hand Identified Risks inspector for the Bounded AI Brief, and synchronized deseasonalized anomaly charts). Use Next.js 16, React 19.2 (`reactCompiler: true`), and Tailwind CSS v4 `@theme` tokens in `src/app/globals.css` with zero purple gradients or generic AI templates."*