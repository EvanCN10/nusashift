<div align="center">

# 🌍 NusaShift
### Coupled Earth-System Regime & Lag-Cascade Detective

[![NASA Space Apps Challenge 2026](https://img.shields.io/badge/NASA%20Space%20Apps-2026%20Surabaya%20Global-0B3D91?style=for-the-badge&logo=nasa&logoColor=white)](https://www.spaceappschallenge.org/)
[![Challenge](https://img.shields.io/badge/Challenge-Be%20An%20Earth%20System%20Trend%20Detective!-FA4616?style=for-the-badge)](https://www.spaceappschallenge.org/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.4%20(Turbopack)-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9%20Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind%20CSS-v4.3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

*An autonomous Earth-system intelligence platform that detects multi-decade teleconnection dipoles, deseasonalizes climate cycles, and identifies **"Silent Ecological Stress"** via physical water–energy lag-cascades using NASA POWER v2 and GISTEMP v4 satellite observations.*

[Live Interactive Demo](https://nusashift.vercel.app) • [Scientific Proof](#4-mathematical-rigor--statistical-formulation) • [NASA Data Assets](#5-nasa-data-assets--sensor-specifications) • [Peer-Reviewed Literature](#8-peer-reviewed-supporting-literature)

---

</div>

## 1. Executive Summary & Planetary Problem Statement

Traditional Earth observation portals (*NASA Worldview*, *NASA Giovanni*) display single-region rasters or raw time series. However, planetary-scale climate analysis confronts three fundamental barriers:

1. **Teleconnections & Opposite-Sign Regional Trends:** Atmospheric and oceanic circulation drivers—such as the **El Niño–Southern Oscillation (ENSO)** or the **Indian Ocean Dipole (IOD)**—cause Earth system variables to trend upward in one hemisphere while trending downward in another simultaneously. Single-point analyses completely miss this coupled dipole dynamic.
2. **Seasonal Masking Barrier:** Strong wet and dry annual oscillations routinely mask subtle, multi-decade structural warming and drying trends unless time series are mathematically deseasonalized across multi-decade climatology baselines.
3. **The "Silent Ecological Stress" Decoupling:** In critical biomes (tropical peatlands, maritime tropics, semi-arid basins), ecological and agricultural vulnerability typically begins **months before** meteorological drought is declared. Evaporative demand and root-zone moisture depletion occur silently while precipitation figures appear superficially normal.

**NusaShift** resolves these challenges by pairing opposite-sign biomes across the globe, executing deterministic non-parametric statistical tests over a 40-year satellite baseline (1985–2025), and cross-correlating the physical **Water–Energy Lag-Cascade**:
$$\text{Solar Irradiance} \longrightarrow \text{Root-Zone Moisture} \longrightarrow \text{Skin Temperature} \longrightarrow \text{Precipitation}$$

---

## 2. Real-World Environmental Impact

NusaShift is designed as an operational diagnostic instrument for environmental agencies, conservationists, and agricultural planners:

* **Early-Warning Wildfire Prevention in Tropical Peatlands:** By monitoring the optimal lag ($k^* \in [1, 3]\text{ months}$) between root-zone soil wetness (`GWETROOT`) depletion and rainfall reduction, conservationists gain a critical 30-to-90-day intervention window to re-wet peat domes before wildfire season.
* **Trans-Pacific & Trans-Indian Teleconnection Resilience:** Agricultural planners in Southeast Asia and South America can quantify the teleconnection dipole correlation ($r < 0, p < 0.001$) to anticipate opposite-sign crop yield shocks under intensifying ENSO regimes.
* **Regime Shift Attribution for Policy Makers:** Identifying the exact calendar month of climate regime shifts via Pettitt change-point detection provides empirical evidence for municipal water resilience investments.

---

## 3. Core Architectural Capabilities

* **Interactive Full-Bleed 3D Globe (`react-globe.gl` + Three.js):** Real-time planetary sphere rendered with NASA Blue Marble surface textures, atmospheric limb scattering, orbital lighting, great-circle dipole arcs, and pulsating telemetry radar pins.
* **Global Teleconnection Location Search (`/api/places`):** Keyless forward geocoding with instant camera fly-to, allowing researchers to probe any biome or municipality on Earth and assign it to Region A (Drying/Telemetry Probe) or Region B (Dipole Counterpart).
* **Automated Hypothesis Triage Matrix:** Maps high-level environmental symptoms (*Coastal Drought*, *Peatland Fire*, *Flood Dipole*, *Custom Exploration*) directly to essential NASA physical variables across customizable observation windows (40Y, 30Y, 20Y).
* **Curated Teleconnection Reference Baselines:**
  * **Case 1 (ENSO Dipole):** Merauke Wetlands (Indonesia) $\longleftrightarrow$ Central Valley (Chile)
  * **Case 2 (Silent Ecological Stress):** Murray-Darling Basin (Australia) $\longleftrightarrow$ Kalimantan Peatlands (Indonesia)
  * **Case 3 (Water-Energy Cascade):** East Java Basin $\longleftrightarrow$ West Java Highlands
* **Live NASA POWER v2 Satellite Client:** Dual parallel telemetry queries with strict $\le -900$ fill-value sanitization, month-13 annual row filtering, and guaranteed sub-5s fallback execution.
* **Scientific Proof Drawer:** Mathematical breakdown typeset with KaTeX, displaying full statistical matrices, 95% confidence intervals, and dynamic NASA GISTEMP v4 cross-validation.
* **Bounded AI Causal Explainer (`/api/explain`):** Grounded causal narrative engine powered by `@google/genai` (`gemini-3.8-flash`), strictly bounded to pre-computed statistical parameters with zero-failure deterministic fallback.

---

## 4. Mathematical Rigor & Statistical Formulation

NusaShift enforces zero-hallucination, deterministic mathematics implemented in pure TypeScript (`src/lib/statsEngine.ts`):

### 4.1 Monthly Z-Score Deseasonalization
To eliminate seasonal cycle bias without distorting multi-decade secular trends, each monthly observation $X_{y,m}$ is standardized against its 40-year climatological mean $\mu_m$ and standard deviation $\sigma_m$ for that specific month $m \in \{1, \dots, 12\}$:

$$Z_{y,m} = \frac{X_{y,m} - \mu_m}{\sigma_m}$$

$$\text{where} \quad \mu_m = \frac{1}{Y} \sum_{y=1}^{Y} X_{y,m}, \quad \sigma_m = \sqrt{\frac{1}{Y-1} \sum_{y=1}^{Y} (X_{y,m} - \mu_m)^2}$$

### 4.2 Non-Parametric Mann-Kendall Trend Test
Because meteorological time series frequently exhibit non-normal distributions and extreme outliers, monotonic trends are evaluated using the non-parametric Mann-Kendall test:

$$S = \sum_{k=1}^{n-1} \sum_{j=k+1}^{n} \operatorname{sgn}(x_j - x_k)$$

$$\operatorname{sgn}(\theta) = \begin{cases} +1 & \text{if } \theta > 0 \\ 0 & \text{if } \theta = 0 \\ -1 & \text{if } \theta < 0 \end{cases}$$

$$\operatorname{Var}(S) = \frac{n(n-1)(2n+5) - \sum_{t} t(t-1)(2t+5)}{18}$$

The standardized test statistic $Z_{\text{MK}}$ and Kendall's rank correlation coefficient $\tau$ are computed as:

$$Z_{\text{MK}} = \begin{cases} \frac{S - 1}{\sqrt{\operatorname{Var}(S)}} & \text{if } S > 0 \\ 0 & \text{if } S = 0 \\ \frac{S + 1}{\sqrt{\operatorname{Var}(S)}} & \text{if } S < 0 \end{cases}, \qquad \tau = \frac{S}{\frac{1}{2}n(n-1)}$$

Two-tailed significance:
$$p = 2 \left( 1 - \Phi(|Z_{\text{MK}}|) \right)$$

### 4.3 Sen's Slope Estimator with 95% Confidence Intervals
The magnitude of the trend per decade is determined through the median of all pairwise slopes:

$$Q_{i} = \frac{x_j - x_k}{j - k} \quad \text{for } 1 \le k < j \le n$$

$$\beta_{\text{decade}} = \operatorname{median}(Q) \times 120\text{ months}$$

The non-parametric 95% confidence interval $[C_{\text{lower}}, C_{\text{upper}}]$ is calculated via ranks $M_1$ and $M_2$:

$$C_{\alpha} = Z_{1 - \alpha/2} \times \sqrt{\operatorname{Var}(S)}$$

$$M_1 = \left\lfloor \frac{N - C_{\alpha}}{2} \right\rfloor, \quad M_2 = \left\lceil \frac{N + C_{\alpha}}{2} \right\rceil + 1 \quad \text{where } N = \frac{n(n-1)}{2}$$

### 4.4 Pettitt Change-Point Test (Climate Regime Shifts)
To detect the abrupt calendar date of an Earth system regime shift, NusaShift uses Pettitt's rank-based non-parametric test:

$$U_{t, n} = \sum_{i=1}^{t} \sum_{j=t+1}^{n} \operatorname{sgn}(x_i - x_j) \quad \text{for } 1 \le t < n$$

$$K_T = \max_{1 \le t < n} |U_{t, n}|, \qquad \tau^* = \arg\max_{1 \le t < n} |U_{t, n}|$$

$$p \approx 2 \exp\left( \frac{-6 K_T^2}{n^3 + n^2} \right)$$

### 4.5 Water–Energy Lag-Cascade Cross-Correlation
For causal coupling across physical Earth layers, the optimal lead-lag delay $k^*$ ($0 \le k \le 6\text{ months}$) is computed via Pearson cross-correlation of deseasonalized Z-scores:

$$r(k) = \frac{\sum_{t=1}^{n-k} (X_t - \bar{X})(Y_{t+k} - \bar{Y})}{\sqrt{\sum_{t=1}^{n-k} (X_t - \bar{X})^2 \sum_{t=1}^{n-k} (Y_{t+k} - \bar{Y})^2}}$$

$$k^* = \arg\max_{k \in [0, 6]} |r(k)|$$

### 4.6 Mathematical Definition of "Silent Ecological Stress"
A state of **Silent Ecological Stress** is declared if and only if root-zone soil wetness displays a statistically significant multi-decade drying trend while precipitation trends remain statistically non-significant (masked):

$$\text{SilentStress} = \left( p_{\text{GWETROOT}} < 0.01 \land \beta_{\text{GWETROOT}} < 0 \right) \land \left( p_{\text{PRECTOTCORR}} \ge 0.05 \right)$$

---

## 5. NASA Data Assets & Sensor Specifications

NusaShift ingests and processes validated observations from premier NASA satellite missions and atmospheric reanalyses:

| Parameter Code | NASA Physical Variable | Sensor / Source Assimilation | Native Resolution | Physical Role in Diagnostic |
| :--- | :--- | :--- | :--- | :--- |
| **`ALLSKY_SFC_SW_DWN`** | All-Sky Surface Shortwave Downward Irradiance ($\text{MJ/m}^2/\text{day}$) | CERES / FLASHFlux / MERRA-2 | $0.5^\circ \times 0.625^\circ$ | **Energy Influx Driver:** Incident solar radiation driving surface heat budget. |
| **`GWETROOT`** | Root-Zone Soil Wetness ($0\text{--}1$ fraction, $0\text{--}100\text{ cm}$) | MERRA-2 Catchment Land Surface Model | $0.5^\circ \times 0.625^\circ$ | **Ecological Memory:** Available moisture for transpiration and peat stability. |
| **`TS`** | Earth Skin Temperature ($^\circ\text{C}$) | AIRS / MODIS / MERRA-2 | $0.5^\circ \times 0.625^\circ$ | **Thermal Feedback:** Evaporative cooling breakdown and thermal stress indicator. |
| **`PRECTOTCORR`** | Bias-Corrected Total Precipitation ($\text{mm/day}$) | GPM IMERG / MERRA-2 blend | $0.5^\circ \times 0.625^\circ$ | **Hydrological Output:** Conventional rainfall indicator used by meteorologists. |
| **`T2M`** | Near-Surface Air Temperature at $2\text{m}$ ($^\circ\text{C}$) | MERRA-2 Reanalysis | $0.5^\circ \times 0.625^\circ$ | **Atmospheric Reference:** Standard meteorological benchmark. |
| **`GISTEMP v4`** | Global Surface Temperature Anomaly ($1880\text{--}\text{present}$) | NASA Goddard Institute for Space Studies | Global Mean | **Algorithmic Calibration:** Embedded benchmark series for verification. |

*Data access is conducted via the [NASA POWER API v2 (Prediction Of Worldwide Energy Resources)](https://power.larc.nasa.gov/) and [NASA GISS GISTEMP v4](https://data.giss.nasa.gov/gistemp/).*

---

## 6. Algorithmic Verification & GISTEMP v4 Benchmark

To guarantee scientific reproducibility and ensure zero mathematical hallucination, NusaShift features a live self-test mechanism:

* The exact same TypeScript statistical functions (`deseasonalizeMonthlyZScores`, `mannKendallTest`, `sensSlopePerDecade`) run dynamically against an embedded **492-month dataset** (1985–2025) of published **NASA GISTEMP v4** global surface temperature anomaly data.
* **Result:** Computed slope: **$+0.2188^\circ\text{C/decade}$** vs. NASA Published Reference: **$+0.2247^\circ\text{C/decade}$** ($\text{Deviation} = 2.63\% \ll 5\%$, $p < 10^{-15}$, $\tau = 0.7028$).
* This benchmark confirms the numerical validity of the engine before evaluating any paired regional hypothesis.

---

## 7. Technology Stack

* **Framework:** Next.js 16.4 (App Router, Turbopack, `reactCompiler: true`)
* **Runtime:** React 19.3
* **Language:** TypeScript 5.9 (Strict Type Safety, Zero `any`)
* **Styling:** Tailwind CSS v4 (CSS-first `@theme` configuration, zero JS config)
* **Spatial & 3D Visualization:** `react-globe.gl` 2.38, Three.js 0.187, `topojson-client`
* **Charts & Analytics:** Recharts 3.10 (Synchronized ComposedCharts with dynamic ReferenceLines)
* **Mathematical Typesetting:** KaTeX 0.19 (Server and client-side LaTeX formula rendering)
* **AI Cognitive Synthesis:** `@google/genai` 3.3.0 (`gemini-3.8-flash` with deterministic fallback)
* **Accessibility & Motion:** Lenis Smooth Scroll, `prefers-reduced-motion` compliance, WCAG 2.1 AA

---

## 8. Peer-Reviewed Supporting Literature

The physical hypotheses and statistical methodology implemented in NusaShift are grounded in the following peer-reviewed literature:

1. **Soil Moisture–Climate Coupling & Evaporative Stress:**
   * Seneviratne, S. I., Corti, T., Davin, E. L., Hirschi, M., Jaeger, E. B., Lehner, I., Orlowsky, B., & Teuling, A. J. (2010). *Investigating soil moisture–climate interactions in a changing climate: A review.* **Earth-Science Reviews**, 99(3-4), 125–161. [doi:10.1016/j.earscirev.2010.02.004](https://doi.org/10.1016/j.earscirev.2010.02.004)
2. **Indian Ocean Dipole (IOD) Coupled Mode:**
   * Saji, N. H., Goswami, B. N., Vinayachandran, P. N., & Yamagata, T. (1999). *A dipole mode in the tropical Indian Ocean.* **Nature**, 401(6751), 360–363. [doi:10.1038/43854](https://doi.org/10.1038/43854)
3. **El Niño–Southern Oscillation (ENSO) Teleconnections:**
   * Trenberth, K. E. (1997). *The definition of El Niño.* **Bulletin of the American Meteorological Society**, 78(12), 2771–2777. [doi:10.1175/1520-0477(1997)078<2771:TDOEN>2.0.CO;2](https://doi.org/10.1175/1520-0477(1997)078<2771:TDOEN>2.0.CO;2)
4. **NASA MERRA-2 Earth-System Reanalysis:**
   * Gelaro, R., McCarty, W., Suárez, M. J., Todling, R., Molod, A., Takacs, L., Randles, C. A., Darmenov, A., Bosilovich, M. G., Reichle, R., Wargan, K., Coy, L., Cullather, R., Draper, C., Akella, S., Buchard, V., Conaty, A., da Silva, A. M., Gu, W., Kim, G.-K., Koster, R., Lucchesi, R., Merkova, D., Nielsen, J. E., Partyka, G., Pawson, S., Putman, W., Rienecker, M., Schubert, S. D., Sienkiewicz, M., & Zhao, B. (2017). *The Modern-Era Retrospective Analysis for Research and Applications, Version 2 (MERRA-2).* **Journal of Climate**, 30(14), 5419–5454. [doi:10.1175/JCLI-D-16-0758.1](https://doi.org/10.1175/JCLI-D-16-0758.1)
5. **NASA GISTEMP v4 Climate Analysis:**
   * Hansen, J., Ruedy, R., Sato, M., & Lo, K. (2010). *Global surface temperature change.* **Reviews of Geophysics**, 48(4), RG4004. [doi:10.1029/2010RG000345](https://doi.org/10.1029/2010RG000345)
   * Lenssen, N. J., Schmidt, G. A., Hansen, J. E., Menne, M. J., Persin, A., Ruedy, R., & Zyss, D. (2019). *Improvements in the GISTEMP uncertainty model.* **Journal of Geophysical Research: Atmospheres**, 124(12), 6307–6326. [doi:10.1029/2018JD029537](https://doi.org/10.1029/2018JD029537)
6. **Nonparametric Trend and Change-Point Analysis:**
   * Mann, H. B. (1945). *Nonparametric tests against trend.* **Econometrica**, 13(3), 245–259. [doi:10.2307/1907187](https://doi.org/10.2307/1907187)
   * Kendall, M. G. (1975). *Rank Correlation Methods.* Charles Griffin, London.
   * Sen, P. K. (1968). *Estimates of the regression coefficient based on Kendall's tau.* **Journal of the American Statistical Association**, 63(324), 1379–1389. [doi:10.1080/01621459.1968.10480934](https://doi.org/10.1080/01621459.1968.10480934)
   * Pettitt, A. N. (1979). *A non-parametric approach to the change-point problem.* **Journal of the Royal Statistical Society: Series C (Applied Statistics)**, 28(2), 126–135. [doi:10.2307/2346729](https://doi.org/10.2307/2346729)

---

## 9. Reproducibility & Local Setup Guide

### 9.1 Prerequisites
* Node.js $\ge 20.9.0$
* npm $\ge 10.0.0$

### 9.2 Installation
```bash
# Clone the repository
git clone https://github.com/EvanCN10/nusashift.git
cd nusashift

# Install dependencies
npm install

# Setup environment variables (Optional; fallback works offline)
cp .env.example .env.local
```

### 9.3 Environment Variables (`.env.local`)
```env
# Optional: Google Gemini API Key for dynamic AI causal explanation
# If omitted or timeout occurs, NusaShift seamlessly uses its deterministic rule-based fallback
GEMINI_API_KEY=your_gemini_api_key_here
```

### 9.4 Verification Suite
```bash
# Static type checking (TypeScript strict mode)
npm run typecheck

# Code quality and style linting
npm run lint

# Production Next.js build
npm run build

# Start local production server
npm run start
```

---

## 10. NASA Open Science & License

This project is developed for the **NASA International Space Apps Challenge 2026** under the challenge theme *Be An Earth System Trend Detective!*. In alignment with **NASA's Open Science Policy** and **Transform to Open Science (TOPS)** guidelines:

* All statistical algorithms, source code, and mathematical models are freely and openly available under the permissive [MIT License](LICENSE).
* All utilized space agency data assets originate from public-domain NASA missions (NASA POWER, NASA GISS GISTEMP, NASA CERES, GPM IMERG, MERRA-2).

---

<div align="center">

**Developed with scientific precision by Team *4 IT Go To NASA* (Surabaya, Indonesia)**  
*NASA International Space Apps Challenge 2026*

</div>

