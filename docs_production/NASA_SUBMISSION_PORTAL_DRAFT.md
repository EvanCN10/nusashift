# NASA International Space Apps Challenge 2026 — Official Submission Draft

**Project Name:** `NusaShift: Coupled Earth-System Regime & Lag-Cascade Detective`  
**Challenge:** `Be An Earth System Trend Detective!` (Difficulty: *Advanced* | Category: *Earth Science & Software*)  
**Team Name:** `4 IT Go To NASA` (Surabaya, Indonesia)  
**Live Demo:** `https://nusashift.vercel.app`  
**GitHub Repository:** `https://github.com/EvanCN10/nusashift`  

---

## 1. Project Overview & Elevator Pitch (Max 100 Words)

> Planetary climate change is not experienced in isolation; atmospheric and oceanic circulations couple distant biomes into opposite-sign teleconnection dipoles, while seasonal noise and superficial rainfall readings mask impending ecological crises. NusaShift is an autonomous Earth-system intelligence platform that pairs opposite-sign biomes worldwide, deseasonalizes 40-year satellite records (1985–2025), and cross-correlates the physical Water–Energy Lag-Cascade to detect "Silent Ecological Stress" (root-zone soil drying before precipitation deficits register). Validated against NASA GISTEMP v4, NusaShift provides environmental conservationists and policymakers with a 30-to-90-day early-warning window to prevent wildfires and mitigate climate shocks.

---

## 2. Detailed Project Description (NASA Submission Fields)

### Field A: How does your project address the challenge?
Conventional Earth observation platforms (like NASA Worldview or Giovanni) plot single-point rasters or raw time series without statistical trend verification or inter-regional coupling. NusaShift addresses the core barriers highlighted by NASA:
1. **Opposite-Sign Teleconnections (Dipoles):** Identifies how macro-climate drivers (ENSO, IOD) simultaneously cause wetting in one region and drying in another.
2. **Seasonal Masking Removal:** Implements monthly Z-score deseasonalization across a 40-year climatology baseline to uncover underlying multi-decade signals hidden behind annual wet/dry cycles.
3. **The "Silent Ecological Stress" Discovery:** Tracks the physical water–energy cascade ($\text{Solar Irradiance} \rightarrow \text{Root-Zone Soil Wetness} \rightarrow \text{Skin Temperature} \rightarrow \text{Precipitation}$). When soil moisture exhibits statistically significant drying ($p < 0.01$) while rainfall shows no significant decline ($p \ge 0.05$), NusaShift sounds an early alarm before agricultural and peatland collapse.

### Field B: What Space Agency Data did you use, and how?
1. **NASA POWER API v2 (Prediction Of Worldwide Energy Resources):**
   - Ingests 492 monthly records (1985–2025) of assimilated satellite and reanalysis data:
     - `ALLSKY_SFC_SW_DWN` (CERES/FLASHFlux shortwave solar radiation).
     - `GWETROOT` (MERRA-2 Catchment Land Surface Model root-zone soil wetness, 0–100 cm).
     - `TS` (AIRS/MODIS/MERRA-2 surface skin temperature).
     - `PRECTOTCORR` (GPM IMERG and MERRA-2 bias-corrected precipitation).
     - `T2M` (Near-surface air temperature reference).
2. **NASA GISS GISTEMP v4 (Goddard Institute for Space Studies):**
   - Embedded real 492-month global surface temperature anomaly data used for dynamic self-validation of our Mann-Kendall and Sen’s slope algorithms, achieving $< 3\%$ deviation from published reference values.

### Field C: How did you develop this project? (Architecture & Technologies)
- **Frontend & Runtime:** Next.js 16 (App Router + Turbopack), React 19, TypeScript (Strict).
- **Styling & HUD:** Tailwind CSS v4 with custom dark matte tactical telemetry tokens.
- **Planetary Spatial UI:** 3D interactive globe powered by Three.js and `react-globe.gl` with NASA Blue Marble textures, plus an automatic 2D SVG fallback.
- **Statistical Engine:** Non-parametric Mann-Kendall, Sen’s slope with 95% confidence intervals, Pettitt change-point test, and lead-lag cross-correlation ($k^* \in [0, 6]\text{ months}$) implemented in pure deterministic TypeScript.
- **AI Interpretation:** Google Gemini Flash (`@google/genai`) bounded strictly to computed statistics, backed by a deterministic rule-based fallback for 100% reliability.

---

## 3. Strict 30-Second Video Demo Script & Storyboard

*Total runtime: exactly 28–30 seconds. Crisp English subtitles.*

| Time | Visual on Screen | Voiceover / On-Screen Subtitle Text |
| :--- | :--- | :--- |
| **00:00 – 00:06** | **Hero 3D Globe:** Show the rotating globe with the glowing arc connecting **Merauke (Indonesia)** and **Central Valley (Chile)**. Telemetry pins pulsing. | *"Earth system trends don't happen in isolation. One climate driver couples distant biomes into opposite-sign teleconnections."* |
| **00:06 – 00:13** | **Deseasonalized Charts:** Scroll to side-by-side Recharts showing opposite Sen's slopes and the red vertical **Pettitt Regime Shift** line. | *"NusaShift deseasonalizes 40 years of NASA POWER satellite data, revealing true secular trends and abrupt regime shift years."* |
| **00:13 – 00:21** | **Case 2 Selection & Lag-Cascade:** Click **Case 2 (Murray-Darling ↔ Kalimantan)**. Spotlight the pulsing red alert banner: **`SILENT ECOLOGICAL STRESS DETECTED`**. | *"In tropical peatlands, root-zone soil drying precedes rainfall deficits by months—detecting silent ecological stress before wildfire disaster."* |
| **00:21 – 00:30** | **Scientific Proof Drawer:** Open the Scientific Proof Drawer showing the 10-row Mann-Kendall matrix, KaTeX equations, and the **NASA GISTEMP v4 Calibration Card**. | *"Backed by deterministic non-parametric math, NASA GISTEMP calibration, and bounded AI. NusaShift: Trend detective for a resilient planet."* |

---

## 4. Key Tags for NASA Portal
`Earth Science`, `Software`, `NASA POWER`, `GISTEMP v4`, `MERRA-2`, `Teleconnections`, `Climate Resilience`, `Drought Early Warning`, `Open Science`.
