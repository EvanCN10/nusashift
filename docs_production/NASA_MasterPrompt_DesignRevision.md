# MASTER PROMPTS PER SESI — DESIGN REVISION (`NusaShift` Rev 2)
**Cinematic Earth + Narrative Dashboard**

* **Dokumen acuan desain:** `docs_production/NASA_UIUXDesignBrief.md` (Rev 2). Dokumen ini hanya berisi cara mengeksekusinya per sesi.
* **Sumber kebenaran data dan klaim:** `docs_production/NASA_SSOT_FIX.md`.
* **Stack:** Next.js 16 (App Router, `reactCompiler: true`), React 19, TypeScript `strict`, Tailwind CSS v4 (CSS-first), Recharts, `react-globe.gl` + `three`. **Satu-satunya dependensi baru: `lenis`.**
* **Bahasa produk:** 100% English pada UI. Instruksi manual di dokumen ini berbahasa Indonesia.

---

## Panduan Eksekusi

1. **Jalankan berurutan: Sesi 1 → 2 → 3 → 4.** Satu sesi per percakapan baru. Jangan gabungkan sesi.
2. **Aturan baca wajib di awal setiap sesi (sudah tertanam di tiap prompt):** baca seluruh `docs_production/` terlebih dahulu, baru `.agent/` (`anti-slop.md`, lalu `ponytail.md`).
3. **Commit per sesi** (Conventional Commits) di branch kerja baru sebelum lanjut, contoh: `feat(ui): ...`. Jangan menumpuk seluruh revisi dalam satu commit.
4. **Gerbang verifikasi setiap sesi:** `npm run typecheck`, `npm run lint`, `npm run build` harus exit code 0. Laporkan hasil apa adanya, termasuk yang gagal.
5. **Area terlarang di semua sesi:** `src/lib/statsEngine.ts`, `src/lib/nasaPowerClient.ts`, `src/lib/geoResolver.ts`, `src/lib/causalFallback.ts`, `src/app/api/**`, `src/data/**`, `src/types/climate.ts`. Bila UI membutuhkan helper tampilan baru, taruh di file baru (mis. `src/lib/narrative.ts`).
6. **Perilaku yang harus tetap berfungsi di setiap akhir sesi:** pilih 3 kasus terkurasi, klik globe untuk analisis koordinat bebas (`POST /api/analyze`), ringkasan AI (`POST /api/explain`), Share URL, Export brief, URL param `?case=`, `?latA=&lonA=&latB=&lonB=`, `?view=`.

---

## SESI 1 — Foundation: Token, Font, Lenis, Reveal

```text
[INSTRUKSI MANUAL SEBELUM PASTE SESI 1:
1. Buat branch baru dari main yang sudah ter-pull: git checkout -b feat/design-revision
2. Pastikan npm install sudah dijalankan dan `npm run build` hijau di kondisi awal (catat hasil awal).
3. Paste prompt di bawah ke chat baru.]
```

### Master Prompt Sesi 1

```markdown
You are a senior front-end engineer. Work in the existing repository `nusashift`.

READ FIRST, in this exact order, fully, before writing any code:
1. Every file in `docs_production/` — especially `NASA_UIUXDesignBrief.md` (Rev 2), `NASA_SSOT_FIX.md`, `NASA_PRD.md`, `NASA_APP_FLOW.md`, `NASA_MasterPrompt_DesignRevision.md`.
2. Then `.agent/anti-slop.md` and `.agent/ponytail.md` (smallest complete change; no speculative abstractions).
3. Then the files you will touch: `src/app/layout.tsx`, `src/app/globals.css`, `package.json`.

SESSION 1 SCOPE — foundation only. Do NOT redesign components or the hero yet.

Tasks:
1. Install `lenis` (`npm install lenis`). No other new dependency.
2. `src/app/layout.tsx`: replace Inter with `Instrument_Serif` (`weight: "400"`, `style: ["normal","italic"]`, variable `--font-instrument-serif`) and `Geist` (variable `--font-geist`) from `next/font/google`; keep JetBrains Mono (`--font-jetbrains-mono`). Apply all three variable classes on `<html>`. Update `<body>` to use the sans font. Keep `lang="en"` and the existing metadata.
3. `src/app/globals.css`: apply the Rev 2 token values and the `.glass-panel`, `.glass-well`, `.reveal` / `.is-visible`, reduced-motion and `@supports not (backdrop-filter)` rules from Section 2 of the brief. Add `--font-display`. KEEP the existing class names `.hud-panel`, `.hud-panel-float`, `.hud-well`, `.tactical-grid-bg`, `.hud-scroll`, and the proof-table/KaTeX rules, but retarget `.hud-*` to the new glass look so current components still render correctly.
4. Create `src/components/LenisProvider.tsx` ("use client"): wraps children with smooth scrolling via `lenis/react` (`ReactLenis root`). Disable smoothing when `prefers-reduced-motion: reduce`. Mount it in `layout.tsx`.
5. Create `src/components/Reveal.tsx` ("use client"): a small wrapper using `IntersectionObserver` (threshold ~0.15, rootMargin `0px 0px -8% 0px`) that adds `is-visible` once. Props: `as?`, `delayMs?`, `className?`, `children`. Animate only opacity/transform.
6. Do not change any other component. Do not touch forbidden areas listed in the brief (stats engine, API routes, data, types).

Constraints: English-only UI copy, TypeScript strict, no `any`, no new animation library, no emoji icons, no purple/blue gradients.

Verification (run and report exact results): `npm run typecheck`, `npm run lint`, `npm run build`. Then start the app and confirm: fonts load (serif and Geist are available as CSS variables), page still renders as before, no console errors, Lenis scroll is smooth, and with `prefers-reduced-motion` enabled it is not smoothed.

Finish with 1–2 lines: what you skipped and any risk.
```

**Kriteria selesai Sesi 1:** build hijau; tampilan lama tidak rusak; font baru tersedia; Lenis aktif; tidak ada error konsol.
**Commit disarankan:** `feat(ui): add Rev 2 design tokens, new fonts, Lenis provider, and reveal primitive`.

---

## SESI 2 — Hero + Realistic Globe

```text
[INSTRUKSI MANUAL SEBELUM PASTE SESI 2:
1. Unduh tekstur Bumi dari NASA Visible Earth / Blue Marble (domain publik) ke folder public/textures/ :
   - day.jpg  (warna siang, lebar maks 2048px)
   - bump.jpg (relief/topografi, hitam-putih)
   - specular.jpg (lautan terang, daratan gelap) — opsional
   - (opsional/stretch) night.jpg dari NASA Black Marble untuk lampu kota
   Kompres (JPG/WebP) sehingga total <= ~3 MB.
2. Buat public/textures/CREDITS.md berisi URL sumber dan kredit NASA untuk tiap file.
3. Bila tidak sempat mengunduh, tulis di prompt: "textures are missing; implement with the globe's existing material and make texture URLs easy to drop in" — jangan biarkan agent mengarang URL.
4. Paste prompt di bawah ke chat baru. Lampirkan docs_production/design_reference/hero_reference_mercury.jpg.]
```

### Master Prompt Sesi 2

```markdown
You are a senior front-end and WebGL engineer. Work in the existing repository `nusashift`. Sessions 1 is already merged.

READ FIRST, in this exact order, fully, before writing any code:
1. Every file in `docs_production/` — especially `NASA_UIUXDesignBrief.md` (Rev 2: Sections 4, 5, 6.2), `NASA_SSOT_FIX.md`, `NASA_PRD.md`, `NASA_APP_FLOW.md`, `NASA_MasterPrompt_DesignRevision.md`, and look at `docs_production/design_reference/hero_reference_mercury.jpg`.
2. Then `.agent/anti-slop.md` and `.agent/ponytail.md`.
3. Then the code: `src/app/page.tsx`, `src/components/GlobeViewport.tsx`, `src/components/InteractiveWorldMap.tsx`, `src/components/MapControlsBar.tsx`, `src/components/NavbarHeader.tsx`.

SESSION 2 SCOPE — the one-viewport hero and a realistic globe. Do NOT build the dashboard sections yet (that is Session 3).

Tasks:
1. Hero layout exactly as brief Section 4: `h-dvh`, top bar, left editorial column (eyebrow, serif Display XL title, serif italic subtitle derived from the active report, short description, three key figures from the active report, primary `Explore the evidence` action, curated-case pills), globe on the right allowed to bleed off the edge, bottom-edge micro labels and the feed badge. Remove the Hypothesis Triage and AI Brief panels from the hero for now (render them below the hero in a temporary plain block so nothing is lost until Session 3). Remove the 4-tab view-mode switcher from the top bar.
2. `GlobeViewport.tsx`: realistic globe per brief Section 5 — remove the monochrome country polygons layer; use a Phong material with `map`/`bumpMap`/`specularMap` from `/textures/*`; soft cyan-blue atmosphere; lightweight starfield via a single `THREE.Points`; keep click-to-coordinate through `onGlobeClick`; keep Region A/B markers, rings, arc and DMS pills but raise contrast so they stay readable on bright land; keep fly-in and pair/regionA focus; keep wheel zoom disabled.
3. Performance gates: cap pixel ratio at 1.75; pause rendering when the hero is off-screen and when the tab is hidden; lazy-load textures; keep `ssr: false` dynamic import and the existing WebGL-unavailable fallback to `FlatMapViewport`; honor `prefers-reduced-motion`.
4. `ScrollCue` (new `src/components/ScrollCue.tsx`): `SCROLL` label + bouncing chevron button that smooth-scrolls to the dashboard anchor `#verdict` (create an empty anchor if the section does not exist yet). Hide after ~80px scroll. No bounce under reduced motion. Decorative arrow is `aria-hidden`; the button has an accessible name.
5. Keep all handlers and URL state in `page.tsx` working (`?case=`, `?latA=...`, Share URL, Export brief).

Hard rules: do not touch forbidden areas (stats engine, API routes, data, types). English-only copy. No emoji icons. No purple/blue gradients. No new dependency. If textures are missing, do not invent URLs; implement the material so textures can be dropped into `public/textures/` and tell me exactly which files are expected.

Verification (report exact results): `npm run typecheck`, `npm run lint`, `npm run build`. Then run the production build and check at 1440×900 that the hero fits in one viewport with no page scroll inside it, clicking the globe still triggers analysis and updates the markers, the three case pills switch cases, the scroll cue scrolls, and there are no console errors. Also check a 390px-wide viewport: the hero stacks and nothing overflows horizontally.

Finish with 1–2 lines: what you skipped and any risk (state the measured globe frame-rate impression honestly if you could not measure it).
```

**Kriteria selesai Sesi 2:** hero pas 1 viewport di 1440px; globe fotorealistis; klik globe tetap menganalisis; panah scroll berfungsi; build hijau.
**Commit disarankan:** `feat(ui): add editorial hero and photorealistic globe with starfield`.

---

## SESI 3 — Narrative Dashboard

```text
[INSTRUKSI MANUAL SEBELUM PASTE SESI 3:
1. Pastikan Sesi 2 sudah di-commit dan hijau.
2. Siapkan 1 jawaban atas pertanyaan ini bila mau diubah: kalimat Verdict dibuat deterministik dari data (bukan dari AI). Default: ya.
3. Paste prompt di bawah ke chat baru.]
```

### Master Prompt Sesi 3

```markdown
You are a senior front-end engineer and information designer. Work in the existing repository `nusashift`. Sessions 1–2 are merged.

READ FIRST, in this exact order, fully, before writing any code:
1. Every file in `docs_production/` — especially `NASA_UIUXDesignBrief.md` (Rev 2: Sections 1, 3, 6.3, 7, 8), `NASA_SSOT_FIX.md`, `NASA_PRD.md`, `NASA_APP_FLOW.md`, `NASA_MasterPrompt_DesignRevision.md`.
2. Then `.agent/anti-slop.md` and `.agent/ponytail.md`.
3. Then the code: `src/app/page.tsx` and the components you will restyle: `HypothesisTriage`, `DualRegionCharts`, `LagCascadePanel`, `BoundedAiBrief`, `ScientificProofDrawer`, `NavbarHeader`, plus `src/types/climate.ts` (read-only).

SESSION 3 SCOPE — turn everything below the hero into a story: Verdict → Evidence → Mechanism → Proof. One message per section.

Tasks:
1. Add anchors `#verdict`, `#evidence`, `#mechanism`, `#proof`. Each section: eyebrow pattern (`── SECTOR n · NAME`), Display M serif title, generous spacing, wrapped in `Reveal` with staggered children.
2. New `src/lib/narrative.ts` (pure functions, no side effects, with a few assert-based self-checks or a tiny test): builds the Verdict sentence, the status badge (`OPPOSITE-SIGN` / `COUPLED` / `SILENT STRESS DETECTED`), the three key figures with plain-language labels, and the p-value bucket label (`Very strong` / `Strong` / `Weak`). It must only READ numbers from the report; never invent or round away precision that the Scientific Proof table shows.
3. Section 1 Verdict: Verdict sentence, badge, three key figures (mono, ≥ 24px) with a plain label and a one-line meaning, plus the compact symptom/ecosystem/window controls (reuse `HypothesisTriage` logic; show friendly variable names first, NASA codes as captions).
4. Section 2 Evidence: `DualRegionCharts` with one variable at a time, exactly one annotation (Pettitt marker `Regime shift: YYYY-MM`), jargon only in tooltips, chart text ≥ 11–12px, one-sentence caption.
5. Section 3 Mechanism: `LagCascadePanel` as 4 plain-language steps (`Sunlight → Soil wetness → Surface heat → Rainfall`, `+N month(s) later`, `r` as caption; Silent Ecological Stress is the only red callout) next to `BoundedAiBrief` (max 3 bullets, recommended actions, provenance badge showing the real `modelUsed` or the deterministic engine).
6. Section 4 Proof: `ScientificProofDrawer` as an accordion CLOSED by default, titled `Scientific proof: full statistics`, with `data-lenis-prevent` on its scroll area. Keep the 10-row matrix, GISTEMP calibration card, KaTeX formulas, NASA links, and responsive table behavior.
7. New `src/components/StickySectionNav.tsx`: glass pill (≤ 48px) that appears after the hero, with anchors Verdict · Evidence · Mechanism · Proof, active-section highlight via IntersectionObserver, smooth scroll via Lenis with an offset equal to its height, fully keyboard accessible.
8. Retire `viewMode` as a UI concept. Keep URL compatibility: `?view=scientific` opens the Proof accordion and scrolls to it; `?view=lag_cascade` scrolls to Mechanism; `?view=citizen` is ignored gracefully. Plain-English copy is the default (remove the separate Citizen View block by merging its message into Verdict).
9. Body text ≥ 14px everywhere; micro labels (11px uppercase) only for metadata.

Hard rules: do not touch forbidden areas (stats engine, API routes, data, types). English-only copy. No emoji icons. No purple/blue gradients. No new dependency. No layout-shifting animation (opacity/transform only).

Verification (report exact results): `npm run typecheck`, `npm run lint`, `npm run build`. Then run the production build and verify for all three curated cases: each section renders with real numbers consistent with the Scientific Proof table, Proof is closed by default, mini-nav tracks sections, `?view=scientific` and `?view=lag_cascade` deep links work, Share URL still round-trips, and a free-coordinate globe click still produces a full report. No console errors.

Finish with 1–2 lines: what you skipped and any risk.
```

**Kriteria selesai Sesi 3:** tiap section satu pesan; angka sama dengan tabel Proof; Proof tertutup default; mini-nav dan deep link berfungsi.
**Commit disarankan:** `feat(ui): restructure dashboard into verdict, evidence, mechanism, and proof sections`.

---

## SESI 4 — Glass Polish + QA

```text
[INSTRUKSI MANUAL SEBELUM PASTE SESI 4:
1. Pastikan Sesi 3 sudah di-commit dan hijau.
2. Siapkan Chrome untuk menjalankan Lighthouse (DevTools > Lighthouse) pada build produksi (npm run build && npm run start).
3. Paste prompt di bawah ke chat baru.]
```

### Master Prompt Sesi 4

```markdown
You are a senior front-end engineer focused on polish, accessibility and performance. Work in the existing repository `nusashift`. Sessions 1–3 are merged.

READ FIRST, in this exact order, fully:
1. Every file in `docs_production/` — especially `NASA_UIUXDesignBrief.md` (Rev 2: Sections 1, 2, 9), `NASA_SSOT_FIX.md`, `NASA_PRD.md`, `NASA_APP_FLOW.md`, `NASA_MasterPrompt_DesignRevision.md`.
2. Then `.agent/anti-slop.md` and `.agent/ponytail.md`.
3. Then all files under `src/components/` and `src/app/`.

SESSION 4 SCOPE — consistency, accessibility, performance. No new features.

Tasks:
1. Glass consistency: every card uses `.glass-panel` / `.glass-well` with the same radius, hairline and spacing rhythm. Remove leftover `.hud-panel`, `.hud-panel-float`, `.hud-well`, `.tactical-grid-bg` usages and then delete those aliases from `globals.css` ONLY after confirming with a search that nothing references them.
2. Contrast: verify body ≥ 4.5:1 and large text ≥ 3:1, including text over glass panels on the brightest part of the globe; adjust panel alpha or text tokens if needed.
3. Keyboard and focus: visible focus ring everywhere; complete keyboard path through the hero case pills, scroll cue, mini-nav, controls, charts' variable switcher and the Proof accordion.
4. Motion: confirm `prefers-reduced-motion` disables Lenis smoothing, reveals, the bounce cue, ring pulses and arc dash animation.
5. Performance: confirm the globe render loop pauses off-screen and when the tab is hidden; confirm no layout shift from reveals (CLS); remove unused imports/components/CSS.
6. Footer: NASA POWER v2, GISTEMP v4, Earth texture credits (from `public/textures/CREDITS.md`).
7. Copy audit: all UI text in English; no leftover references to Turkana, Piura, Brantas, `gemini-3.8-flash`, or Inter anywhere in `src/`.

Hard rules: do not touch forbidden areas (stats engine, API routes, data, types). No new dependency.

Verification (report exact numbers, not impressions): `npm run typecheck`, `npm run lint`, `npm run build`. Run Lighthouse on the production build (desktop): report Performance, Accessibility, Best Practices, CLS. Targets: Performance ≥ 80, Accessibility ≥ 95, CLS < 0.05. If a target is missed, state the actual number and the cause; do not claim success. Test viewports 1440×900, 1024×768, 390×844. Test all three curated cases, a free-coordinate click, Share URL, Export brief, `?view=scientific`.

Finish with 1–2 lines: what you skipped and any risk.
```

**Kriteria selesai Sesi 4:** target Lighthouse tercapai atau dilaporkan jujur; tidak ada sisa class/copy lama; build hijau.
**Commit disarankan:** `chore(ui): unify glass styling and finalize accessibility and performance pass`.

---

## Catatan Risiko untuk Pemilik Proyek

* **Tekstur NASA harus diunduh manual** (Sesi 2). Tanpa itu agent hanya bisa menyiapkan material, bukan hasil akhirnya.
* **Performa globe di perangkat lemah** adalah risiko terbesar. Bila FPS buruk, turunkan resolusi tekstur atau matikan starfield sebelum menambah efek.
* **Mode `viewMode` dihapus dari UI.** Link lama `?view=` tetap dihormati, tetapi tab 4-mode tidak ada lagi.
* **Deadline lokal Minggu 11:30 WIB.** Sesi 3 bergantung pada Sesi 2 (panel Triage dan AI Brief dikeluarkan dari hero di Sesi 2). Bila waktu mepet, jalankan Sesi 2 versi minimal (hero editorial + globe yang sudah ada, tanpa tekstur dan starfield), lalu **utamakan Sesi 3**, karena PIC menekankan kemudahan memahami dashboard. Tekstur dan starfield bisa menyusul.
