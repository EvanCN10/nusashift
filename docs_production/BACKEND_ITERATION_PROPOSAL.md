# Backend Iteration Proposal (for review, nothing implemented yet)

**Branch:** `ui-iteration` · **Status:** Draft for team review · **Scope:** Ideas only. No backend code has been changed.

The `ui-iteration` branch replaces the flat SVG map with a full-screen 3D globe (`react-globe.gl`) and floats the HUD panels over it. The globe already works with the existing API: clicking it calls `POST /api/analyze` exactly like the old map did. This document lists backend work that would let the globe show **more than two pins and an arc**. It's meant to be agreed on before anyone touches `src/lib`, `src/data` or `src/app/api`.

Every item respects the guardrails in `TEAM_UI_HANDOFF.md` §4. **No formula, threshold, timeout or data contract in `statsEngine.ts`, `nasaPowerClient.ts`, `gistempBenchmark.ts`, `cachedCases.ts` or `causalFallback.ts` changes.** New work goes in new files that *call* those modules.

---

## Current backend at a glance (as of `main` @ `41dbb83`)

| Piece | File | Behavior that matters for the globe |
| :--- | :--- | :--- |
| Analyze endpoint | `src/app/api/analyze/route.ts` | Curated case → precomputed report. Custom coords → two parallel NASA POWER fetches (5.5 s timeout each) + reverse geocode → `buildDualRegionReport`. Falls back to climatology series on timeout. |
| Analyze cache | same file | In-memory `Map`, 15 min TTL, max 120 entries. **Resets on every serverless cold start.** |
| NASA POWER client | `src/lib/nasaPowerClient.ts` | Monthly point API, `community=AG`, default 4.5 s timeout, sanitizes `month 13` and `<= -900` fill values. |
| Reverse geocode | `src/lib/geoResolver.ts` | BigDataCloud client endpoint, 1.6 s timeout. Reverse only (no place search). |
| Explain endpoint | `src/app/api/explain/route.ts` | Gemini with deterministic fallback. Only reads `GEMINI_API_KEY`. |

---

## Proposals (ordered by value for the demo vs. effort)

### P1 — Global trend heatmap layer · `GET /api/globe-layer`
**Why:** The globe looks empty between the two pins. A coarse global layer colored by Sen's slope / Mann-Kendall significance (e.g. "where is root-zone soil drying fastest since 1985?") turns the globe into a discovery tool. It's also the biggest visual upgrade, since judges see the trend field before clicking anything.

**How:**
- An **offline script** (`scripts/build-globe-layer.ts`, run once locally, never at request time) samples NASA POWER on a ~5° grid over land cells (~1,000–1,500 points). It runs the *unchanged* `deseasonalizeMonthlyZScores` → `mannKendallTest` → `sensSlopePerDecade` and writes `src/data/globeLayer.<VAR>.json`.
- The endpoint (or just a static import) serves `{ lat, lng, slopePerDecade, tau, pValue, significance }[]`.
- The globe renders it with `hexBinPointsData` or `pointsData` colored by slope, using the existing semantic tokens: orange = drying/warming, cyan = wetting, muted = not significant.

**Why offline:** a live global scan would be ~1,000+ NASA POWER calls, far over the 5.5 s budget, and it would hammer their API. Precompute + ship JSON keeps request time at ~0 ms.

**Effort:** M (script ~1 day incl. rate-limited fetching; UI layer ~½ day) · **Risk:** low. It's read-only static data · **Guardrails touched:** none (new files only).

**Open question for the team:** which variables? Suggest `GWETROOT` (silent stress story) + `PRECTOTCORR` first, with a toggle in the triage panel.

---

### P2 — Teleconnection partner finder · `POST /api/find-pair`
**Why:** Right now users must already know where Region B should be. Given Region A, the backend could suggest the top-3 opposite-sign partners, and the globe would draw three candidate arcs to click.

**How:** Reuse the P1 grid. Also store each cell's deseasonalized `PRECTOTCORR` z-series (492 months × ~1,200 cells ≈ 2.4 MB gzipped ~0.6 MB, so keep it server-side only). For Region A's nearest cell, compute the correlation against all cells (~1,200 dot products, about 1 ms) and return the most negative `r` with `p < 0.01`, excluding cells within ~1,500 km.

**Contract sketch:**
```jsonc
// request
{ "lat": -7.45, "lon": 112.45, "variable": "PRECTOTCORR", "limit": 3 }
// response
{ "candidates": [ { "lat": 3.0, "lon": 35.0, "r": -0.41, "pValue": 2.1e-9, "place": "Turkana, Kenya" } ] }
```
**Effort:** M · **Risk:** medium. We must label these clearly as *candidate correlations, not proven causation* (consistent with the bounded-AI framing) · **Depends on:** P1.

---

### P3 — Progress streaming for live analysis (SSE)
**Why:** A live custom-pair query takes 2–6 s with a single spinner. Streaming stages (`fetching A → fetching B → geocoding → running stats → done`) would let the globe play a "scanning" animation on each pin as its data arrives. It makes the wait feel intentional.

**How:** A new route `GET /api/analyze/stream?...` returns `text/event-stream`. It wraps the **same** calls as `/api/analyze` (same timeouts, same fallback) and emits events between awaits. The existing `POST /api/analyze` stays as-is for share links and fallback.

**Effort:** S–M · **Risk:** low–medium (Vercel streaming works on the Node runtime; it needs testing on the deployed host) · **Guardrails touched:** none (the timeouts are reused, not changed).

---

### P4 — Persistent analyze cache (Vercel KV / Upstash Redis)
**Why:** The in-memory `analyzeCache` is lost on every cold start, so on Vercel the first judge click after idle always pays full NASA POWER latency. A shared cache makes repeat demo clicks instant and protects us if NASA POWER is slow during judging.

**How:** Keep the exact cache key format already in `route.ts`. Read KV first, then the in-memory map, then NASA POWER, and write back with the same 15 min TTL (or longer, since monthly data is immutable up to 2025; 7 days would be safe). Make it optional: if `KV_REST_API_URL` is unset, behave exactly as today.

**Effort:** S · **Risk:** low · **New env vars:** `KV_REST_API_URL`, `KV_REST_API_TOKEN` (optional).

---

### P5 — Place search / forward geocoding
**Why:** On a 3D globe, typing "Surabaya" and flying there beats hunting for a tiny island. It pairs with the globe's existing `pointOfView` fly-to.

**How:** Add `searchPlace(query)` beside `resolveCoordinatePlace` in `src/lib/geoResolver.ts` (or a new `placeSearch.ts`) using a free forward-geocoding API (e.g. Open-Meteo geocoding: no key, generous limits) with the same short timeout style. New route `GET /api/places?q=`. The UI adds a search box to the map controls bar.

**Effort:** S · **Risk:** low.

---

### P6 — Use the `NASA_EARTHDATA` token (Earthdata Login)
**Why:** The team now has an Earthdata Login bearer token in `.env.local`, but **no code reads it**. NASA POWER needs no auth. The token unlocks other NASA archives with higher resolution or different variables. Examples:
- **GPM IMERG** (half-hourly/daily precipitation, 0.1°) for sharper rainfall anomalies than POWER's MERRA-2/IMERG blend.
- **MERRA-2 / GLDAS** subsets via GES DISC OPeNDAP for soil-moisture layers.
- **SMAP** soil moisture as an independent cross-check of `GWETROOT`. That would be a strong "second sensor" validation, similar in spirit to the GISTEMP calibration card.

**How:** A new server-only module, `src/lib/earthdataClient.ts`, sends `Authorization: Bearer ${process.env.NASA_EARTHDATA}` and is only imported from route handlers. It could first back an *optional* SMAP cross-validation row in the Scientific Proof drawer, and later feed P1.

**Security notes:**
- The token is personal (tied to one Earthdata account) and **expires** (check the `exp` claim). Each teammate deploying should generate their own at urs.earthdata.nasa.gov.
- It must never reach the client bundle: no `NEXT_PUBLIC_` prefix, and no import from `"use client"` files.
- Add `NASA_EARTHDATA=` (empty) to `.env.example`. Never commit the value.

**Effort:** M–L (Earthdata data formats like NetCDF/HDF5 and OPeNDAP subsetting take real work) · **Risk:** medium (format parsing, latency) · **Recommendation:** post-hackathon unless someone already knows OPeNDAP.

---

## Explicit non-goals
- No changes to Mann-Kendall / Sen / Pettitt / lag-cascade math, significance thresholds, or deseasonalization.
- No changes to existing API timeouts (4.5 s / 5.5 s NASA POWER, 2.8 s Gemini) or fallback guarantees.
- No changes to the GISTEMP v4 benchmark series or published reference slope.
- No change to the `DualRegionAnalysisReport` contract. New data uses new types and endpoints.

## Suggested order
1. **P4** (small, protects the live demo) → 2. **P1** (biggest visual payoff on the globe) → 3. **P5** (small UX win) → 4. **P3** → 5. **P2** → 6. **P6** (post-hackathon).

## Decisions needed from the team
- [ ] Approve P1 variables (`GWETROOT`, `PRECTOTCORR`?) and grid resolution (5°?).
- [ ] OK to add a Vercel KV / Upstash dependency (P4)?
- [ ] Who owns the offline grid script run (P1), given it takes ~30–60 min of rate-limited NASA POWER calls?
- [ ] P6 in scope for the hackathon, or post-submission?
