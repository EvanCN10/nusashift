---
description: "Daftar larangan pola generik AI (Anti-Slop) untuk menjaga kualitas visual tactical aerospace HUD dan keaslian platform NusaShift."
globs: ["src/**/*.tsx", "src/**/*.ts", "src/**/*.css"]
alwaysApply: true
---
# Anti-Slop Guidelines (Strictly Forbidden AI Patterns)

Agent AI memiliki kecenderungan default menghasilkan UI SaaS yang klise dan monoton. Seluruh pola berikut **DILARANG KERAS** pada repositori **NusaShift**:

## 1. Dilarang Gradient Ungu-ke-Biru Generik & Neon Cyberpunk

- ❌ **Dilarang:** `bg-gradient-to-r from-purple-500 to-blue-500`, `from-indigo-600 to-purple-600`, atau neon glow berlebihan.
- ✅ **Gunakan:** Kanvas *Matte Graphite & Deep Obsidian* (`#090B0E` – `#14181F`) dari `docs_production/NASA_UIUXDesignBrief.md`, dengan aksen semantik telemetri iklim (`#F97316` Drought/Region A, `#06B6D4` Dipole/Region B, `#22C55E` Calibrated/Nominal, `#EAB308` Radar Gold, `#EF4444` Silent Stress Alert).

## 2. Dilarang Card Monoton Tanpa Crafting HUD

- ❌ **Dilarang:** Card `bg-white shadow-lg rounded-xl` polos, sudut terlalu bulat `rounded-3xl`, atau kontainer tanpa batas visual tegas.
- ✅ **Gunakan:** Panel HUD berlayer (`hud-panel`, `bg-panel-850/90 backdrop-blur-md`), border hairline `1px solid rgba(255,255,255,0.08)`, highlight tipis di sisi atas, sudut kompak (`rounded-xl` / `10px–12px`), serta sumur instrumen `hud-well`.

## 3. Dilarang Hero Section Klise

- ❌ **Dilarang:** Judul raksasa center-aligned + subjudul 2 baris + 2 tombol bersebelahan (*Get Started / Learn More*).
- ✅ **Gunakan:** *Full-bleed 3D Globe / Interactive Map Hero* dengan panel HUD mengambang, reticle orbital/telemetri yang fungsional, serta kontrol instrumen yang langsung dapat diklik.

## 4. Dilarang Ikon Lucide Mentah Tanpa Konteks

- ❌ **Dilarang:** Ikon Lucide ukuran besar tanpa styling, tanpa container/stroke-width yang jelas.
- ✅ **Gunakan:** Ikon proporsional (`w-3.5 h-3.5` atau `w-4 h-4`, `stroke-[1.5]` / `stroke-[1.75]`), dipasangkan dengan status LED dot `6px` atau micro-header `text-[11px] uppercase tracking-[0.12em]`.

## 5. Dilarang Layout Simetris Tengah Seragam

- ❌ **Dilarang:** Menempatkan semua judul, deskripsi, dan metrik rata tengah (`text-center`) secara seragam.
- ✅ **Gunakan:** *Instrument alignment* — header tegas rata kiri, angka koordinat DMS, $p$-value, Mann-Kendall $\tau$, dan Sen's Slope wajib memakai `font-mono tabular-nums` agar sejajar vertikal seperti instrumen kokpit.

## 6. Dilarang Menggunakan Emoji Sebagai Ikon Produksi

- ❌ **Dilarang:** Menaruh emoji (misal: 🚀, 💡, 🔥, ✨, ⚠️) di dalam tombol, header, atau badge UI produksi sebagai pengganti ikon resmi.
- ✅ **Gunakan:** Ikon SVG/Lucide resmi, LED status dot, atau simbol matematis KaTeX/Unicode ilmiah yang tepat.

## 7. Dilarang Teks Pengisi Palsu & Copy Non-Inggris di UI

- ❌ **Dilarang:** *Lorem ipsum*, angka statistik karangan, atau teks antarmuka berbahasa Indonesia.
- ✅ **Gunakan:** 100% bahasa Inggris pada seluruh copy UI, label grafik, dan tooltip, serta angka yang 100% berasal dari mesin statistik deterministik (`statsEngine.ts`) dan data NASA POWER v2 / GISTEMP v4.
