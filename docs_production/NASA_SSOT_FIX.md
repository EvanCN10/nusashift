# SINGLE SOURCE OF TRUTH (SSOT): NusaShift

**Coupled Earth-System Regime & Lag-Cascade Detective**

- **Kompetisi:** NASA International Space Apps Challenge 2026 — Surabaya Online Competition
- **Challenge Resmi:** `Be An Earth System Trend Detective!` (Difficulty: `Advanced` | Subjects: `Earth Science`, `Software`)
- **Tim:** `4 IT Go To Nasa` (4 Anggota — Solo Coding s/d 17:00 WIB, Full Team 17:00 WIB – Selesai)
- **Venue:** GatherTown — _Sophistec Global Space Apps Venue_
- **Waktu Berjalan:** Sabtu, 14 November 2026 (Pukul 12:30 WIB)
- **Deadline Submit Lokal:** Minggu, 15 November 2026, pukul **11:30 WIB** _(Sisa waktu eksekusi: ~23 jam)_

---

## 1. Pengenalan Produk & Visi Strategis

### 1.1 Apa yang Kita Buat?

**NusaShift** adalah platform web intelijen lingkungan berbasis AI dan analisis statistik formal yang mengungkap **"efek jungkat-jungkit iklim Bumi" (_climate teleconnections_)** serta **rantai sebab-akibat air dan energi (_water-energy lag-cascade_)** menggunakan data observasi Bumi jangka panjang NASA selama 40+ tahun ($1985\text{--}2025$).

Berbeda dari dashboard cuaca atau grafik tren biasa yang hanya menampilkan satu lokasi dan satu variabel, **NusaShift** membimbing pengguna layaknya detektif sains melalui alur terstruktur:

1. Memilih gejala kerusakan lingkungan yang diamati (misalnya _kekeringan pesisir mendadak_ atau _stres kelembapan lahan gambut_).
2. Membandingkan **dua wilayah berpasangan** sekaligus—wilayah lokal Indonesia (misalnya Merauke/Papua, Kalimantan Tengah, atau koridor Trans-Jawa) dan wilayah pasangannya di belahan dunia lain (misalnya Central Valley/Santiago, Chile atau Murray-Darling Basin, Australia)—untuk membuktikan bahwa **satu pemicu iklim global (ENSO / IOD) membuat variabel lingkungan bergerak berlawanan arah atau saling terhubung secara bersamaan**.
3. Membersihkan bias siklus musiman (_deseasonalization_), menguji signifikansi perubahan secara matematis (_Mann-Kendall Test_, _Sen's Slope_, dan _Pettitt Change-Point_), serta mendeteksi **"stres ekologis senyap" (_silent ecological stress_)** lewat analisis jeda waktu (_lag_) antar-variabel sebelum bencana ekologis terjadi.

### 1.2 Masalah Nyata NASA yang Diselesaikan

Berdasarkan brief resmi challenge **`Be An Earth System Trend Detective!`** dan dokumen prioritas **_NASA Earth Science Decadal Survey_**, proyek ini menjawab empat kebutuhan mendesak NASA:

1. **Fenomena Tren Berlawanan Arah (_Opposite-Sign Regional Trends_):** NASA secara eksplisit menyoroti bahwa satu variabel sistem Bumi dapat naik tajam di satu wilayah namun turun tajam di wilayah lain akibat proses atmosfer/laut yang sama.
2. **Kebanjiran Variabel (_Variable Overload_):** NASA memiliki ribuan variabel dari satelit (_MODIS, GPM, AIRS, OMI_) dan model (_MERRA-2, GLDAS_). Pengguna non-spesialis kesulitan menentukan variabel mana yang relevan untuk suatu gejala lingkungan.
3. **Bias Siklus Musiman (_Seasonal Masking_):** Tren jangka panjang sering tertutup fluktuasi musim kemarau/hujan sehingga wajib dihapus siklus musimannya terlebih dahulu sebelum diuji signifikansinya.
4. **Keterkaitan Siklus Air & Energi (_Coupling of the Water and Energy Cycles_):** Salah satu dari enam prioritas utama _NASA Earth Science Decadal Survey_—melacak bagaimana anomali radiasi surya memicu penurunan kelembapan tanah akar beberapa bulan kemudian sebelum curah hujan tampak menurun.

### 1.3 Keunggulan Kompetitif vs. Tools NASA & Kompetitor

- **Kompetitor Surabaya Sangat Minim:** Hanya ada **2 tim lawan** di Surabaya pada kategori ini (`AETHER 2.0` dan `Pemula`), dibandingkan 5 tim di kategori game sebelumnya.
- **Melampaui NASA Giovanni & Worldview:** _NASA Worldview_ hanya menampilkan visual satelit tanpa statistik. _NASA Giovanni_ punya modul anomali musiman dan kapabilitas generik "trend detection and analysis" per piksel, tapi belum mengemasnya jadi satu alur uji-signifikansi otomatis (Mann-Kendall/Pettitt) yang mudah dipakai non-spesialis, dan tidak membandingkan dua wilayah berlawanan arah dalam satu layar.
- **Posisi vs. Proyek Kompetitor Lain di Track yang Sama:** Audit publik atas submission lain di challenge ini (per November 2026) menunjukkan beberapa tim _sudah_ memakai Mann-Kendall, Sen's Slope, bahkan validasi silang ke data publikasi resmi (mis. NSIDC, GISTEMP), dan satu di antaranya memakai hook "variabel sama, cerita berlawanan" antar wilayah. Statistik rigor saja karena itu **bukan lagi pembeda mutlak** di track ini—itu sudah jadi standar minimum. Keunggulan nyata NusaShift yang belum ditemukan pada proyek lain yang diaudit: (1) mesin rantai sebab-akibat berjeda waktu (_lag-cascade_) sebagai mekanisme penjelas, bukan sekadar dua grafik berdampingan, dan (2) studi kasus telekoneksi maritim Indonesia (Merauke Papua/Kalimantan/Trans-Jawa vs Chile/Australia) yang tervalidasi pada data asli NASA POWER 1985–2025—sudut pandang regional yang tidak dimiliki proyek lain yang ditemukan (mereka umumnya berfokus pada wilayah lain seperti Bangladesh, atau grid global generik).

### 1.4 Tiga Prinsip Emas Pengembangan Tim

1. **Matematika Deterministik di Atas AI (Anti-Halusinasi):** Seluruh uji statistik (_deseasonalization, Mann-Kendall, Sen's Slope, Pettitt Change-Point, Lead-Lag Cross-Correlation_) dihitung oleh fungsi kode deterministik. AI (**Gemini**) dilarang mengarang angka—AI hanya menerima JSON hasil hitungan statistik untuk merangkai penjelasan kausalitas fisik dan rekomendasi kebijakan.
2. **100% Bahasa Inggris di Produk & Berkas:** Seluruh antarmuka web, label grafik, tooltip edukasi, dan formulir submission wajib berbahasa Inggris agar lolos syarat _Global Judging_.
3. **Zero-Failure Demo Architecture:** Menggabungkan tarikan langsung **NASA POWER API v2** dengan **3 paket studi kasus JSON lokal (_pre-cached_)** agar demo penjurian berjalan instan tanpa risiko _timeout_ atau _rate-limit_.

### 1.5 Catatan Verifikasi Tambahan (Hasil Audit Independen)

- **Buffer Deadline Platform Global:** Panduan resmi submission NASA Space Apps menyebutkan submission platform global biasanya tutup pukul 23:59 waktu lokal, dan local event boleh menetapkan jadwal judging lokal sendiri yang bisa berbeda dari jadwal global. Artinya deadline **11:30 WIB** di atas kemungkinan adalah aturan internal venue Surabaya untuk sesi judging lokal, bukan hard-stop platform NASA itu sendiri. Tetap perlakukan 11:30 WIB sebagai target utama—tapi konfirmasi ke Local Lead mana yang benar-benar mengikat, supaya ada gambaran jaring pengaman kalau terjadi kendala teknis mendadak.
- **Field "Use of Super Intelligence (SI)":** Nama field ini belum bisa dikonfirmasi lewat riset independen karena form submission 2026 baru dirilis 13 November 2026 dan hanya terlihat setelah login ke portal. Cek langsung nama field asli di halaman Project Submission kalian sebelum mengisi; kalau namanya berbeda, sesuaikan draf teks di bagian 7.1.
- **Tech Stack Tervalidasi:** Next.js 16 + React 19.2 + Tailwind v4 + TypeScript 5.9 sudah dikonfirmasi sebagai rilis nyata dan stabil per November 2026 (bukan versi karangan AI)—aman dipakai sebagai acuan AI Coding Agent.
- **Endpoint NASA POWER API Tervalidasi:** Format endpoint di bagian 5.1 sudah dikonfirmasi sesuai dokumentasi resmi NASA POWER (parameter `community=AG`, format tahun `YYYY` untuk `temporal/monthly`).

---

## 2. Bantuan Manual Pengguna (Wajib Dilakukan Sendiri)

Sebagian besar pengkodean, pemrosesan statistik, dan integrasi data akan ditangani oleh AI Coding Agent dan tim. Anda hanya perlu menyiapkan **5 hal manual** berikut:

|  No   | Tugas Manual Anda                                         | Kapan Dilakukan               | Keterangan & Cara Eksekusi                                                                                                                                                                                                                       |
| :---: | :-------------------------------------------------------- | :---------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1** | **Ubah Pilihan Challenge di Portal NASA**                 | **Sekarang (Segera)**         | Login ke `spaceappschallenge.org` $\rightarrow$ **My Team** $\rightarrow$ **Edit Team** $\rightarrow$ ganti challenge tim `4 IT Go To Nasa` menjadi **`Be An Earth System Trend Detective!`**.                                                   |
| **2** | **Ambil `GEMINI_API_KEY` Gratis**                         | **Sekarang (2 Menit)**        | Buka `https://aistudio.google.com/` $\rightarrow$ klik **Get API Key** $\rightarrow$ salin key untuk dimasukkan ke `.env.local`. _(Catatan: **NASA POWER API v2 tidak membutuhkan API key** maupun registrasi—bisa langsung dipanggil gratis!)._ |
| **3** | **Inisialisasi Fresh Repo & `.env.local`**                | **Sekarang (12:35 WIB)**      | Buat folder proyek baru `nusashift`, jalankan `git init` (tercatat resmi di dalam rentang waktu hackathon), buat file `.env.local` berisi `GEMINI_API_KEY=...`, dan pastikan `.env.local` ada di `.gitignore`.                                 |
| **4** | **Catat Teks Tab `Resources` Challenge**                  | **Sabtu Sore / Minggu Pagi**  | Buka halaman detail `Be An Earth System Trend Detective!` di portal Space Apps $\rightarrow$ klik tab **Resources** $\rightarrow$ salin nama dataset resmi di sana untuk ditempel ke kolom **`NASA Data`** saat submission.                      |
| **5** | **Rekam Video Demo $\le 30\text{ Detik}$ & Final Submit** | **Minggu, 10:00 – 11:15 WIB** | Rekam layar aplikasi selama **maksimal 30 detik** (wajib ada subtitle bahasa Inggris, upload YouTube Public/Unlisted), uji semua link di mode _Incognito_, lalu klik **"Submit for Judging"** sebelum **Minggu, 15 Nov pukul 11:30 WIB**.        |

---

## 3. Tech Stack & Tag Arsitektur Terbaru (November 2026)

Seluruh kode aplikasi wajib menggunakan standar versi terbaru per **November 2026** tanpa pola _deprecated_:

| Layer                | Paket & Tag Versi Wajib                                                      | Konfigurasi & Standar Teknis                                                                                                                                                            |
| :------------------- | :--------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**        | **Next.js 16** (`next@^16.0.0`)                                              | App Router + **Turbopack** default bundler. Gunakan `next.config.ts` dengan `reactCompiler: true`. Jangan gunakan `next.config.mjs` atau `middleware.ts`.                               |
| **UI Runtime**       | **React 19.2** (`react@^19.2.0`)                                             | Aktifkan **React Compiler 1.0** (`babel-plugin-react-compiler`). Semua `params` dan `searchParams` pada halaman Next.js 16 bertipe async `Promise<...>`.                                |
| **Bahasa**           | **TypeScript 5.9+** (`typescript@^5.9.0`)                                    | Mode `strict: true` untuk menjamin tipe data deret waktu (_time-series_) dan matriks statistik bebas bug runtime.                                                                       |
| **Styling**          | **Tailwind CSS v4** (`tailwindcss@^4.0.0`, `@tailwindcss/postcss`)           | Konfigurasi **CSS-first** di `src/app/globals.css` menggunakan `@import "tailwindcss";` dan blok `@theme { ... }`. **Dilarang membuat `tailwind.config.ts` atau `tailwind.config.js`.** |
| **Linter**           | **ESLint Flat Config** (`eslint.config.mjs`)                                 | Perintah `"lint": "eslint ."` di `package.json` (`next lint` sudah dihapus di Next.js 16).                                                                                              |
| **Visualisasi Data** | **Recharts** + **3D Globe (`GlobeViewport`) & 2D Flat Map (`FlatMapViewport`)** + **KaTeX** | Grafik _multi-series anomaly_, _lag-cascade timeline_, rumus statistik KaTeX, serta globe 3D & peta dunia interaktif _click-to-analyze_ dengan _reverse geocoding_ (`geoResolver.ts`).                                                             |
| **AI SDK & Model**   | **`@google/genai`** (Official Unified Google GenAI SDK)                      | Gunakan **`gemini-3.5-flash-lite`** sebagai model utama (dengan rantai fallback otomatis ke `gemini-3.6-flash` / `gemini-3.1-flash-lite` + cache 30 menit + _deterministic fallback_ jika offline/timeout).                                 |
| **Deployment**       | **Vercel**                                                                   | Hosting produksi publik tanpa halaman login agar juri dapat langsung menguji aplikasi.                                                                                                  |

---

## 4. Spesifikasi Lengkap Fitur Produk (Terurut End-to-End)

### 4.1 Alur Utama Pengguna (5 Tahap Terintegrasi)

1. **Tahap 1 — Hypothesis Triage (Pemilih Gejala $\rightarrow$ Variabel NASA Otomatis)**
   - Pengguna (siswa, peneliti, maupun juri) tidak langsung dibebani ribuan kode satelit mentah.
   - Pengguna menjawab **3 pertanyaan diagnostik singkat**:
     1. _Gejala lingkungan apa yang diamati?_ (`Coastal & Agricultural Drought`, `Peatland Fire & Soil Drying`, `Extreme Rainfall & Flood Anomaly`, atau `Custom Exploration`).
     2. _Tipe ekosistem target?_ (`Maritime Tropics`, `Semi-Arid Basin`, `Coastal Delta`, `Tropical Peatland`).
     3. _Rentang analisis historis?_ (`1985–2025 [40 Years]`, `1995–2025 [30 Years]`, `2005–2025 [20 Years]`).
   - Sistem secara otomatis memilihkan kombinasi **4 variabel kunci NASA POWER** yang terhubung secara fisik (`ALLSKY_SFC_SW_DWN`, `GWETROOT`, `TS`, `PRECTOTCORR`) beserta definisi sederhana tiap variabel.

2. **Tahap 2 — Interactive World Map & Paired-Region Teleconnection Split-View**
   - Pengguna dapat memilih **1 dari 3 Studi Kasus Terkurasi** sekali klik **ATAU mengklik dua titik koordinat mana saja (`Region A` dan `Region B`) langsung di peta dunia interaktif**.
   - Sistem menarik data historis kedua wilayah secara paralel (`Promise.all`) dan menampilkan perbandingan berdampingan (**Wilayah A vs. Wilayah B**) untuk membuktikan pola **jungkat-jungkit iklim (_opposite-sign trends_)**—misalnya saat kelembapan tanah dan curah hujan di Merauke (Papua) meningkat signifikan selama periode 1985–2025, Central Valley (Santiago, Chile) justru mengalami penurunan curah hujan dan kelembapan tanah yang signifikan pada rentang waktu yang sama.

3. **Tahap 3 — Deseasonalized Statistical Significance Gate**
   - Sebelum menguji tren, mesin statistik menghapus siklus musiman bulanan (_Monthly Z-Score Deseasonalization_) agar variasi musim kemarau/hujan tidak menyamarkan perubahan iklim jangka panjang.
   - Setiap variabel diuji dengan **4 metrik ilmiah formal**:
     - **Mann-Kendall Trend Test ($\tau$ & $p$-value):** Memberikan lencana tegas `STATISTICALLY SIGNIFICANT (p < 0.01)`, `MODERATE (p < 0.05)`, atau `NOT SIGNIFICANT (Seasonal Noise)`.
     - **Sen's Slope Estimator:** Menghitung laju perubahan nyata per dekade (misal: `$-0.034$ wetness index/decade` atau `$+0.24^\circ\text{C/decade}$`).
     - **Pettitt Change-Point Detection:** Menandai tahun spesifik terjadinya **titik balik kerusakan ekosistem (_regime shift / tipping point_)** dengan garis vertikal pada grafik.
     - **Opposite-Sign Dipole Index ($r$):** Mengukur kekuatan korelasi negatif antar-wilayah pasangan.

4. **Tahap 4 — Lag-Cascade Water-Energy Coupling & "Silent Ecological Stress" Detector**
   - Menganalisis urutan kausalitas berjeda waktu (_lead-lag_ dalam satuan bulan, $k \in [0, 6]$ bulan) pada rantai energi–air:
     $$\text{Solar Radiation } (R_s) \xrightarrow{\text{lag } k_1} \text{Root-Zone Soil Wetness } (SM_{\text{root}}) \xrightarrow{\text{lag } k_2} \text{Skin Temperature } (T_s) \xrightarrow{\text{lag } k_3} \text{Precipitation } (P)$$
   - **Detektor Stres Ekologis Senyap (_Silent Ecological Stress Alert_):** Memicu peringatan dini khusus apabila tren curah hujan ($P$) belum menunjukkan penurunan signifikan ($p \ge 0.05$), namun kelembapan tanah zona akar ($SM_{\text{root}}$) sudah mengalami penurunan signifikan ($p < 0.01$)—memberikan waktu peringatan dini berbulan-bulan sebelum gagal panen atau kebakaran gambut terjadi.

5. **Tahap 5 — Dual-Layer UI, Cross-Validation Benchmark & Bounded AI Explainer**
   - **Dual-Layer Toggle (`Citizen / Student View` vs. `Scientific Proof View`):**
     - _Student/Citizen View:_ Menampilkan status risiko dalam bahasa sederhana, diagram panah jeda bulan, dan rekomendasi mitigasi daerah.
     - _Scientific Proof View:_ Membuka tabel statistik lengkap ($\tau$, $Z$-score, $p$-value, Sen's Slope, confidence interval $95\%$), grafik perbandingan data mentah vs. _deseasonalized anomaly_, serta kartu **Cross-Validation Benchmark** yang membandingkan output mesin terhadap tren resmi publikasi **NASA GISTEMP v4** & **NOAA/NASA ONI**.
   - **Bounded AI Causal Synthesizer (`gemini-3.5-flash-lite` + fallback chain):** Menerima hanya JSON angka hasil perhitungan mesin statistik, lalu menyusun ringkasan narasi kausalitas fisik (maksimal 3 poin tajam) beserta aksi mitigasi lingkungan konkret.

### 4.2 Matriks Prioritas Fitur (Scope Guard)

|        Prioritas         | Daftar Fitur                                                                                                                                                                                                                                                          | Target Selesai                            |
| :----------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------- |
|   **P0 (Wajib Hidup)**   | 3 Studi Kasus Pre-Cached JSON lengkap, _Hypothesis Triage_ 3 pertanyaan, _Deseasonalization + Mann-Kendall + Sen's Slope + Pettitt Change-Point Engine_, Grafik perbandingan 2 wilayah berpasangan (Recharts), _Bounded AI Explainer_ (dengan _rule-based fallback_). | **Sabtu, 17:00 WIB** _(Solo Sprint)_      |
|  **P1 (Pembeda Juara)**  | _Lag-Cascade Water-Energy Engine_ & lencana _Silent Ecological Stress_, Peta Dunia Interaktif _Click-to-Analyze_ (live fetch NASA POWER API v2), _Dual-Layer UI Toggle_ (`Student` vs. `Scientific Proof`), Kartu _Cross-Validation Benchmark_ (GISTEMP/ONI).         | **Sabtu, 23:30 WIB** _(Full Team Sprint)_ |
| **P2 (Polish & Export)** | Ekspor _Scientific Briefing Report_ (PDF/Markdown), _Shareable Analysis URL_ (`?latA=...&lonA=...&latB=...&lonB=...`), _Case Study Story Cards_ di halaman beranda, animasi mikro UI.                                                                                 | **Minggu, 09:30 WIB**                     |

---

## 5. Spesifikasi Data, API NASA, & Rumus Statistik

### 5.1 Sumber Data Utama: NASA POWER API v2 (Gratis & Tanpa API Key)

Aplikasi menarik data bulanan deret waktu historis ($1985\text{--}2025$) langsung dari endpoint publik NASA Langley Research Center:

- **Base Endpoint:**
  ```text
  https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=PRECTOTCORR,GWETROOT,TS,ALLSKY_SFC_SW_DWN,T2M&community=AG&longitude={LON}&latitude={LAT}&start=1985&end=2025&format=JSON
  ```
- **Daftar Variabel Resmi yang Digunakan:**

| Kode Parameter NASA | Nama Variabel                                      | Satuan                     | Peran dalam Rantai Fisik & Deteksi Tren                                                                               |
| :------------------ | :------------------------------------------------- | :------------------------- | :-------------------------------------------------------------------------------------------------------------------- |
| `ALLSKY_SFC_SW_DWN` | All-Sky Surface Shortwave Downward Irradiance      | $\text{MJ/m}^2/\text{day}$ | **Pemicu Energi:** Mengukur lonjakan radiasi surya permukaan akibat berkurangnya tutupan awan.                        |
| `GWETROOT`          | Root-Zone Soil Wetness ($0\text{--}100\text{ cm}$) | Fraksi ($0\text{--}1$)     | **Indikator Stres Senyap:** Mendeteksi pengeringan tanah lapisan akar sebelum curah hujan menurun tajam.              |
| `TS`                | Earth Skin Temperature                             | $^\circ\text{C}$           | **Umpan Balik Termal:** Kenaikan suhu permukaan tanah akibat hilangnya pendinginan evaporasi (_evaporative cooling_). |
| `PRECTOTCORR`       | Bias-Corrected Total Precipitation                 | $\text{mm/day}$            | **Indikator Hidrologi:** Mendeteksi defisit/surplus curah hujan berlawanan arah antar-wilayah telekoneksi.            |
| `T2M`               | Air Temperature at 2 Meters                        | $^\circ\text{C}$           | **Validasi Silang:** Digunakan untuk memvalidasi laju pemanasan regional terhadap benchmark **NASA GISTEMP v4**.      |

### 5.2 Tiga Paket Studi Kasus Terkurasi (Pre-Cached JSON Data Asli NASA POWER v2)

Simpan ketiga pasangan data asli ($492\text{ bulan}$, $1985\text{--}2025$) hasil tarikan NASA POWER API di `src/data/realCasesData.json` dan `src/data/cachedCases.ts` (seluruh pasangan berjarak $>200\text{ km}$ agar berada pada sel grid MERRA-2 $0.5^\circ \times 0.625^\circ$ yang terpisah):

1. **Kasus 1 (`indo-chile-dipole`): Merauke Wetlands (Papua) vs. Central Valley Chile (ENSO Seesaw Dipole)**
   - **Region A:** Merauke Wetlands (Papua), Indonesia (`lat: -8.49, lon: 140.40`)
   - **Region B:** Central Valley Basin (Santiago), Chile (`lat: -33.45, lon: -70.66`)
   - **Temuan Ilmiah:** Menunjukkan korelasi negatif signifikan berlawanan arah pada curah hujan (`PRECTOTCORR`, $r \approx -0.225$, $p = 4.80 \times 10^{-7}$) dan kelembapan tanah (`GWETROOT`)—ketika Papua bagian selatan mengalami tren pembasahan signifikan ($\tau_A \approx +0.203$), Central Valley Chile mengalami tren pengeringan signifikan ($\tau_B \approx -0.151$).
2. **Kasus 2 (`silent-murray-kalimantan`): Murray-Darling Basin vs. Central Kalimantan (Silent Ecological Stress)**
   - **Region A:** Murray-Darling Basin (Mildura), Australia (`lat: -34.18, lon: 142.16`)
   - **Region B:** Central Kalimantan (Palangkaraya), Indonesia (`lat: -2.22, lon: 113.91`)
   - **Temuan Ilmiah:** Mendemonstrasikan _Silent Ecological Stress_ nyata di Region A—lonjakan radiasi surya (`ALLSKY_SFC_SW_DWN`) mendahului penurunan kelembapan tanah akar (`GWETROOT`, $\tau = -0.102$, $p = 7.17 \times 10^{-4}$) sebesar $+1\text{ bulan}$ ($r = -0.448$), sementara tren curah hujan (`PRECTOTCORR`, $p = 0.055$) belum signifikan secara statistik.
3. **Kasus 3 (`java-water-energy`): Trans-Java Agricultural Corridor: East Java vs. West Java (630 km Water-Energy Cascade)**
   - **Region A:** East Java Corridor (Surabaya/Sidoarjo), Indonesia (`lat: -7.45, lon: 112.45`)
   - **Region B:** West Java Citarum-Jakarta Corridor, Indonesia (`lat: -6.21, lon: 106.85`)
   - **Temuan Ilmiah:** Berjarak $630\text{ km}$ (sel grid MERRA-2 terpisah), memetakan keterkaitan regional (`PRECTOTCORR` $r \approx 0.495$) serta rantai jeda waktu kuat di Jawa Timur dari lonjakan radiasi surya (`ALLSKY_SFC_SW_DWN`) ke penurunan kelembapan tanah akar (`GWETROOT`) $+1\text{ bulan}$ kemudian ($r = -0.620$).

_(Catatan: ID kasus lama `iod-surabaya-turkana`, `enso-kalimantan-peru`, dan `brantas-water-energy` tetap dipertahankan sebagai legacy alias di `cachedCases.ts`.)_

### 5.3 Benchmark Validasi Silang (_Cross-Validation Reference Data_)

Untuk membuktikan bahwa mesin statistik aplikasi Anda akurat dan terkalibrasi secara ilmiah:

- **Benchmark Referensi:** Dataset ringkas anomali suhu permukaan global/tropis **NASA GISTEMP v4** ($1985\text{--}2025$) dan indeks **NOAA/NASA Oceanic Niño Index (ONI)**.
- **Fungsi di UI:** Pada panel _Scientific Proof_, mesin menjalankan fungsi `mannKendallTest()` dan `sensSlope()` yang sama persis terhadap data referensi GISTEMP dan menampilkan selisih akurasi terhadap nilai publikasi resmi NASA, membuktikan keandalan kode statistik tim Anda.
- **⚠️ Catatan Verifikasi (hasil audit independen):** Jangan hardcode angka referensi laju pemanasan global. Literatur terkini menunjukkan laju pemanasan global terakumulasi lebih cepat di dekade terbaru (sekitar $+0.27$ hingga $+0.35^\circ\text{C}$/dekade untuk periode 2010–2025) dibanding periode 1970–2015 ($\approx +0.18^\circ\text{C}$/dekade), sehingga rata-rata gabungan untuk jendela 1985–2025 kemungkinan lebih tinggi dari angka lama yang sering dikutip ($+0.19^\circ\text{C}$/dekade). Jalankan `sensSlope()` pada data GISTEMP v4 asli yang benar-benar diunduh tim, lalu pakai angka hasil hitungan itu sebagai acuan tampilan—bukan angka tebakan—karena kartu ini adalah bukti kredibilitas statistik tim di depan juri.

### 5.4 Rumus Matematika & Statistik Deterministik (`src/lib/statsEngine.ts`)

1. **Monthly Z-Score Deseasonalization (Penghapusan Siklus Musiman):**
   Untuk setiap observasi bulan $m \in \{1, \dots, 12\}$ pada tahun $y$:
   $$Z_{y,m} = \frac{X_{y,m} - \mu_m}{\sigma_m}$$
   di mana $\mu_m$ dan $\sigma_m$ adalah rata-rata dan simpangan baku klimatologis untuk bulan $m$ sepanjang periode referensi.

2. **Mann-Kendall Trend Statistic ($S$) & Signifikansi ($Z_{\text{MK}}$):**
   $$S = \sum_{i=1}^{n-1} \sum_{j=i+1}^{n} \operatorname{sgn}(Z_j - Z_i), \quad \operatorname{Var}(S) = \frac{n(n-1)(2n+5)}{18}$$
   $$Z_{\text{MK}} = \begin{cases} \dfrac{S - 1}{\sqrt{\operatorname{Var}(S)}} & \text{jika } S > 0 \\ 0 & \text{jika } S = 0 \\ \dfrac{S + 1}{\sqrt{\operatorname{Var}(S)}} & \text{jika } S < 0 \end{cases}$$
   Tren dinyatakan signifikan secara statistik apabila $|Z_{\text{MK}}| > 1.96$ ($p < 0.05$) dan sangat signifikan apabila $|Z_{\text{MK}}| > 2.576$ ($p < 0.01$).

3. **Sen's Slope Estimator ($Q_{\text{decade}}$ — Laju Perubahan per Dekade):**
   $$Q_{\text{decade}} = 120 \times \operatorname{median}\left(\frac{Z_j - Z_i}{j - i}\right), \quad \forall \, 1 \le i < j \le n$$
   _(Faktor pengali $120$ mengonversi kemiringan per bulan menjadi laju perubahan per 10 tahun / dekade)._

4. **Pettitt Change-Point Detection ($K_T$ — Tahun Titik Balik Kerusakan):**
   $$U_{t,T} = \sum_{i=1}^{t} \sum_{j=t+1}^{T} \operatorname{sgn}(Z_i - Z_j), \quad K_T = \max_{1 \le t < T} |U_{t,T}|$$
   Indeks waktu $t^*$ yang memaksimalkan $|U_{t,T}|$ menandai bulan dan tahun terjadinya _regime shift_ paling tajam.

5. **Lead-Lag Cross-Correlation ($r(k)$ untuk Jeda $k \in [0, 6]$ Bulan):**
   $$r_{XY}(k) = \frac{\sum_{t=1}^{n-k} (X_t - \bar{X})(Y_{t+k} - \bar{Y})}{\sqrt{\sum_{t=1}^{n-k} (X_t - \bar{X})^2 \sum_{t=1}^{n-k} (Y_{t+k} - \bar{Y})^2}}$$
   Nilai $|r_{XY}(k^*)|$ tertinggi pada $k^* > 0$ mengidentifikasi berapa bulan variabel pemicu $X$ mendahului respons variabel $Y$.

### 5.5 Skema TypeScript Inti (`src/types/climate.ts`)

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
  deseasonalizedZ: number;
}

export interface TrendAnalysisResult {
  variable: NasaVariableCode;
  variableLabel: string;
  unit: string;
  mannKendallTau: number;
  zScore: number;
  pValue: number;
  significanceLevel: "HIGHLY_SIGNIFICANT" | "SIGNIFICANT" | "NOT_SIGNIFICANT";
  direction: "INCREASING" | "DECREASING" | "STABLE";
  sensSlopePerDecade: number;
  changePointDate: string; // "YYYY-MM"
  pettittStatistic: number;
  series: MonthlyObservation[];
}

export interface LagCascadeLink {
  fromVariable: NasaVariableCode;
  toVariable: NasaVariableCode;
  optimalLagMonths: number; // 0..6
  correlationR: number;
  pValue: number;
  interpretation: string;
}

export interface DualRegionAnalysisReport {
  caseId: string;
  title: string;
  symptom: SymptomId;
  regionA: RegionCoordinates;
  regionB: RegionCoordinates;
  trendsA: Record<NasaVariableCode, TrendAnalysisResult>;
  trendsB: Record<NasaVariableCode, TrendAnalysisResult>;
  dipoleCorrelationR: number;
  isOppositeDirection: boolean;
  lagCascadeA: LagCascadeLink[];
  silentEcologicalStressDetected: boolean;
  silentStressReason: string;
  gistempValidation: {
    referenceSlopePerDecade: number;
    computedSlopePerDecade: number;
    errorMarginPct: number;
  };
}
```

---

## 6. Pembagian Peran Tim (`4 IT Go To Nasa`) & Milestone Per Jam

### 6.1 Pembagian Tugas 4 Anggota

- **Anggota 1 (Anda — Solo Sprint 12:30–17:00 WIB $\rightarrow$ Lead Architect & Stats Engine):** Membangun arsitektur Next.js 16 + Tailwind v4, mesin statistik deterministik (`statsEngine.ts`), tarikan API NASA POWER + cache 3 studi kasus nyata (`realCasesData.json`), reverse geocoding (`geoResolver.ts`), dan endpoint `/api/explain` (`@google/genai` `gemini-3.5-flash-lite` + fallback chain).
- **Anggota 2 (Bergabung 17:00 WIB — Interactive Map & Spatial UI Developer):** Menyempurnakan peta dunia interaktif _click-to-analyze_ (pemilihan koordinat `Region A` & `Region B`), animasi garis koneksi _teleconnection_ antar-benua, serta responsivitas mobile/desktop.
- **Anggota 3 (Bergabung 17:00 WIB — Scientific Charts & Dual-Layer Analytics UI):** Memoles grafik Recharts (_Deseasonalized Anomaly Time-Series_, garis vertikal _Pettitt Change-Point_, diagram panah _Lag-Cascade_, dan panel _Cross-Validation Benchmark_).
- **Anggota 4 (Bergabung 17:00 WIB — Storytelling, Video Demo $\le 30\text{ Detik}$ & Submission Lead):** Menulis seluruh teks bahasa Inggris di UI & portal NASA, merekam & mengedit **Video Demo maksimal 30 detik** dengan subtitle Inggris, menguji semua link di mode _Incognito_, dan memastikan submit tepat waktu.

### 6.2 Timeline & Milestone Wajib (Diselaraskan dengan Rundown Surabaya)

| Hari & Jam (WIB)  | Agenda Resmi Surabaya                    | Target Milestone Tim                                                                                                                                                                | Status              |
| :---------------- | :--------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------ |
| **Sabtu, 12:30**  | _(Sprint Lanjutan)_                      | Ubah challenge di portal ke `Be An Earth System Trend Detective!`, ambil `GEMINI_API_KEY`, buat fresh repo `nusashift`, jalankan setup Next.js 16 + Tailwind v4.                  | **SETUP**           |
| **Sabtu, 13:00**  | Lunch Break                              | Istirahat singkat sambil menjalankan script fetch untuk mengunci JSON 3 studi kasus NASA POWER.                                                                                     | **BREAK & FETCH**   |
| **Sabtu, 14:00**  | **Sprint 2 + Mentor Check-Ins**          | Selesaikan `statsEngine.ts` (Deseasonalization, Mann-Kendall, Sen's Slope, Pettitt). Jika mentor mampir ke booth, paparkan arsitektur **NusaShift**, lalu lanjut bangun UI utama. | **PITCH & CODING**  |
| **Sabtu, 17:00**  | **Full Team Joins (4 Anggota)**          | Seluruh fitur **P0** sudah berjalan di localhost. Briefing 15 menit pembagian tugas Anggota 2, 3, dan 4 untuk fitur **P1**.                                                         | **TEAM SYNC**       |
| **Sabtu, 17:30**  | **Team Progress Check**                  | Laporan progres ke panitia/mentor Surabaya, lanjut makan malam (18:00 WIB).                                                                                                         | **CHECK-IN**        |
| **Sabtu, 19:00**  | **Night Hacking Session**                | Selesaikan fitur **P1**: Peta dunia interaktif _click-to-analyze_, diagram _Lag-Cascade_ & lencana _Silent Ecological Stress_, _Dual-Layer UI_, dan kartu validasi GISTEMP.         | **CODING P1**       |
| **Sabtu, 21:00**  | **Optional Remote Hacking**              | Deploy versi stabil ke **Vercel**, uji coba klik acak di peta dunia + uji fallback AI jika API dimatikan.                                                                           | **DEPLOY**          |
| **Minggu, 09:30** | _(Finalisasi Pagi)_                      | **Code Freeze fitur baru.** Anggota 4 mulai merekam **Video Demo ($\le 30\text{ detik}$)** dengan subtitle bahasa Inggris dan menulis isian form NASA.                              | **FREEZE & RECORD** |
| **Minggu, 10:30** | Final Hacking Sprint                     | Upload video ke YouTube (Public/Unlisted), tempel semua URL ke portal NASA, dan uji buka seluruh link menggunakan **Incognito Browser**.                                            | **QA CHECK**        |
| **Minggu, 11:00** | Final Submission Preparation             | Centang deklarasi _Original Work_ & _Terms_, klik tombol **"Submit for Judging"** paling lambat pukul **11:15 WIB**.                                                                | **SUBMIT**          |
| **Minggu, 11:30** | **SUBMISSION DEADLINE**                  | Portal terkunci. Istirahat makan siang (13:00 WIB) & gladi resik presentasi 3 menit + pembagian jawaban Q&A juri.                                                                   | **PREP PITCH**      |
| **Minggu, 14:00** | **Judging Session**                      | **Presentasi & demo interaktif di depan dosen/juri** di booth GatherTown.                                                                                                           | **JUDGING 1**       |
| **Minggu, 17:30** | Pitch Prep $\rightarrow$ **18:00 Final** | **Presentasi Final** di panggung utama (18:00 WIB) $\rightarrow$ Pengumuman Pemenang (19:00 WIB).                                                                                   | **FINAL PITCH**     |

---

## 7. Checklist Submission Portal NASA & Strategi Pitching

### 7.1 Isian Wajib Form Portal NASA (100% Bahasa Inggris)

- **Project Name:** `NusaShift: Coupled Earth-System Regime & Lag-Cascade Detective`
- **High-Level Project Summary:** Interactive Earth science detective platform that pairs opposite-trending climate regions (e.g., Maritime Indonesia vs. Central Chile/Australia), removes seasonal cycles, proves statistical regime shifts via Mann-Kendall & Pettitt tests, and detects silent ecological drought stress through water-energy lag-cascade analysis.
- **Link to Project Demo:** Link video YouTube/Google Drive publik berdurasi **$\le 30\text{ detik}$** dengan subtitle bahasa Inggris.
- **Link to Final Project:** Live URL Vercel (`https://...vercel.app`) + link repository GitHub publik.
- **Use of Super Intelligence (SI):** _(nama field belum terverifikasi independen—cek ulang nama asli di portal, lihat 1.5)_ Explain clearly that `gemini-3.5-flash-lite` (with automatic Flash fallback chain via `@google/genai` and deterministic physics fallback) is strictly bounded as a causal explainer interpreting pre-computed deterministic statistical outputs—never generating or fabricating scientific numbers.
- **NASA Data:** Cite **NASA POWER API v2** (_Prediction Of Worldwide Energy Resources — MERRA-2 & CERES/GPM assimilated daily/monthly time series_: `PRECTOTCORR`, `GWETROOT`, `TS`, `ALLSKY_SFC_SW_DWN`, `T2M`), **NASA GISTEMP v4** (cross-validation benchmark), and official resources listed on the challenge page.

### 7.2 Poin Kunci Pitching 3 Menit di Depan Juri

1. **Buka dengan Kalimat Kunci Brief NASA:** _"NASA asked us to solve why one Earth variable trends upward in one region and downward in another under the same climate driver—and how to prove those shifts are statistically significant rather than seasonal noise."_
2. **Tunjukkan Bukti Lokal + Global (_Merauke, Papua vs. Central Valley, Chile_):** Perlihatkan bagaimana penghapusan siklus musiman dan uji _Mann-Kendall + Pettitt Change-Point_ langsung membuktikan korelasi terbalik ENSO secara matematis pada data 1985–2025.
3. **Soroti Deteksi "Silent Ecological Stress":** Tunjukkan bahwa pada kasus _Murray-Darling vs. Central Kalimantan_, penurunan kelembapan tanah akar terjadi $+1\text{ bulan}$ setelah lonjakan radiasi surya sementara tren curah hujan belum signifikan—memberikan peringatan dini nyata untuk pencegahan kekeringan dan kebakaran.
4. **Tutup dengan Validasi Silang:** Tunjukkan kartu _Cross-Validation Benchmark_ terhadap publikasi **NASA GISTEMP v4** sebagai bukti bahwa mesin statistik tim Anda terkalibrasi secara ilmiah. Hindari klaim "satu-satunya tim yang melakukan ini"—framingkan sebagai kombinasi lag-cascade + studi kasus Indonesia maritim yang belum ditemukan bersamaan di proyek lain (lihat 1.3), bukan klaim keunikan metode statistik itu sendiri.
