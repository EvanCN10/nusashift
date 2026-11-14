# END-TO-END APPLICATION FLOW: NusaShift
**Coupled Earth-System Regime & Lag-Cascade Detective**
* **Challenge:** NASA Space Apps 2026 — `Be An Earth System Trend Detective!` (`Advanced`)
* **Tim:** `4 IT Go To Nasa` (Surabaya)
* **Repository / Brand:** `nusashift` / **NusaShift**
* **Bahasa Antarmuka:** 100% English (wajib untuk *Global Judging*)

---

## 1. Peta Alur Utama (High-Level End-to-End Architecture)

Aplikasi **NusaShift** dirancang dengan prinsip **Zero-Friction & Zero-Failure**: begitu halaman dibuka (tanpa login), pengguna langsung disambut oleh analisis aktif studi kasus unggulan (*Surabaya/East Java vs. Turkana Basin, Kenya*) yang sudah terhitung lengkap, lalu dapat bereksplorasi bebas melalui 6 tahapan terintegrasi berikut:

```text
[STAGE 0: Landing & URL State Hydration]
       │  (Auto-load Default Case 1 atau restore parameter ?case=... / ?latA=...&latB=...)
       ▼
[STAGE 1: Hypothesis Triage (3 Pertanyaan Diagnostik)]
       │  (Gejala Lingkungan + Tipe Ekosistem + Rentang Tahun 1985–2025)
       │  ──► Auto-Map 4 Variabel Fisik NASA POWER + Tooltip Edukasi
       ▼
[STAGE 2: Paired-Region Selection (2 Jalur Eksplorasi)]
       ├──► Jalur A (Instan <20ms): Pilih 1 dari 3 Studi Kasus Terkurasi (Pre-Cached JSON)
       └──► Jalur B (Live Exploration): Klik 2 Titik Bebas (Region A & B) di Peta Dunia SVG
                   │
                   ▼
[STAGE 3: Deterministic Statistical & Lag-Cascade Engine (statsEngine.ts)]
       │  1. Filter nilai kosong (-999) & baris tahunan (month === 13)
       │  2. Monthly Z-Score Deseasonalization (Hapus bias siklus musiman)
       │  3. Mann-Kendall Test (tau, Z, p-value) & Sen's Slope (laju per dekade + 95% CI)
       │  4. Pettitt Change-Point Detection (Tahun titik balik kerusakan / regime shift)
       │  5. Inter-Regional Dipole Correlation (r & deteksi arah berlawanan)
       │  6. Water-Energy Lag-Cascade (jeda k = 0..6 bulan) & Silent Ecological Stress Check
       │  7. NASA GISTEMP v4 Cross-Validation Benchmark (kalibrasi matematis real-time)
       ▼
[STAGE 4: Dual-Layer Interactive Dashboard]
       ├──► Mode 1: Citizen / Student View (Lencana risiko, diagram panah jeda bulan, bahasa awam)
       └──► Mode 2: Scientific Proof View (Tabel tau/p-value/CI, Raw vs Deseasonalized, GISTEMP Card)
       │
       ▼
[STAGE 5: Bounded AI Causal Explainer (/api/explain -> gemini-3.8-flash)]
       │  (Input: HANYA JSON angka hasil hitungan mesin; Output: Mekanisme fisik + Aksi mitigasi)
       │  (Fallback otomatis ke deterministic rule-based jika offline/timeout > 2.8s)
       ▼
[STAGE 6: Shareable Evidence URL & Scientific Briefing Export]
          (Salin link analisis lengkap atau unduh laporan ringkas untuk pengambil keputusan)
```

---

## 2. Rincian Alur Interaksi Per Tahap (Step-by-Step User & System Flow)

### Stage 0: Entry, Zero-Login Access, & URL State Hydration
* **Aktor:** Juri NASA, Siswa, atau Peneliti.
* **Alur Pengguna:** Membuka URL aplikasi (`https://nusashift.vercel.app`) tanpa melewati halaman login atau *onboarding* yang memblokir layar.
* **Alur Sistem:**
  1. Memeriksa *query parameters* pada URL (`?case=...` atau `?latA=...&lonA=...&latB=...&lonB=...&symptom=...`).
  2. Jika URL kosong, sistem otomatis memuat **Studi Kasus #1 (`iod-surabaya-turkana`)** dari cache lokal sehingga seluruh grafik, peta, rantai *lag-cascade*, dan narasi AI langsung tampil penuh dalam waktu $< 100\text{ ms}$.
  3. Menampilkan **Top Navigation Bar** berisi identitas **NusaShift**, tombol switch **`Citizen / Student View` $\leftrightarrow$ `Scientific Proof View`**, serta tombol **`Share Analysis`**.

---

### Stage 1: Hypothesis Triage (Pemetaan Gejala $\rightarrow$ Variabel NASA)
* **Tujuan:** Menyelesaikan masalah *Variable Overload* (pengguna awam tidak tahu kode satelit NASA mana yang harus dipilih).
* **Alur Pengguna:**
  1. Pengguna memilih **Pertanyaan 1 — Observed Environmental Symptom**:
     * `Coastal & Agricultural Drought` *(Default)*
     * `Peatland Fire & Silent Soil Drying`
     * `Extreme Rainfall & Flood Dipole`
     * `Custom Multi-Variable Exploration`
  2. Pengguna memilih **Pertanyaan 2 — Target Ecosystem**:
     * `Maritime Tropics`, `Tropical Peatland`, `Semi-Arid Basin`, atau `Coastal Delta`.
  3. Pengguna memilih **Pertanyaan 3 — Historical Analysis Window**:
     * `1985–2025 (40 Years)`, `1995–2025 (30 Years)`, atau `2005–2025 (20 Years)`.
* **Alur Sistem:**
  * Otomatis mengaktifkan dan menyorot **4 variabel kunci NASA POWER** beserta peran fisiknya:
    1. `ALLSKY_SFC_SW_DWN` *(Energy Driver — Solar Irradiance)*
    2. `GWETROOT` *(Silent Stress Indicator — Root-Zone Soil Wetness)*
    3. `TS` *(Thermal Feedback — Earth Skin Temperature)*
    4. `PRECTOTCORR` *(Hydrological Output — Bias-Corrected Precipitation)*
  * Menampilkan *pill* variabel interaktif; saat diarahkan kursor (*hover/click*), muncul definisi sederhana dan warisan instrumen satelit NASA (*CERES, MERRA-2, GPM*).

---

### Stage 2: Paired-Region Selection (Curated Cases vs. Live World Map Click)
* **Tujuan:** Memungkinkan pengujian fenomena *opposite-sign regional trends* (jungkat-jungkit iklim antar dua wilayah) baik melalui bukti terkurasi maupun koordinat bebas pilihan juri.
* **Alur Pengguna (Dua Opsi Berdampingan):**
  * **Opsi A — Curated Teleconnection Cases (1-Klik):**
    1. *Case 1 (IOD/ENSO Dipole):* **East Java Agricultural Corridor (Surabaya/Sidoarjo)** vs. **Turkana Basin, Kenya**.
    2. *Case 2 (Silent Peatland Drying):* **Central Kalimantan Peatlands (Palangkaraya)** vs. **Piura River Basin, Peru**.
    3. *Case 3 (Watershed Water-Energy Coupling):* **Upper Brantas Watershed (Malang)** vs. **Lower Brantas Delta (Surabaya)**.
  * **Opsi B — Interactive SVG World Map (`Click-to-Analyze`):**
    1. Pengguna memilih mode pin aktif: **`Set Region A (Target)`** atau **`Set Region B (Teleconnection Pair)`**.
    2. Pengguna mengklik titik mana saja di peta dunia SVG.
    3. Peta menempatkan pin koordinat baru, menggambar **garis lengkung telekoneksi (*teleconnection arc*)** yang menghubungkan Region A dan Region B, dan menampilkan indikator *loading* telemetri.
* **Alur Sistem:**
  * Jika Opsi A dipilih: Mengambil data JSON dari `src/data/cachedCases.ts` secara instan.
  * Jika Opsi B dipilih: Mengirim request `POST /api/analyze` yang melakukan *parallel fetch* (`Promise.all`) ke **NASA POWER API v2** untuk koordinat `Region A` dan `Region B` dengan batas waktu `4.5 detik`.

---

### Stage 3: Deterministic Statistical & Lag-Cascade Processing Pipeline
* **Tujuan:** Mengubah deret waktu mentah 40 tahun menjadi bukti ilmiah yang dapat dipertanggungjawabkan tanpa campur tangan AI generatif.
* **Urutan Pemrosesan di `src/lib/statsEngine.ts`:**
  1. **Data Sanitization (`nasaPowerClient.ts`):**
     * Membuang entri ringkasan tahunan (`month === 13`).
     * Memfilter nilai kosong/laut (`value <= -900`). Jika pengguna mengklik titik laut dalam sehingga `GWETROOT` kosong, sistem otomatis beralih menggunakan `PRECTOTCORR` dan `TS` serta menampilkan lencana informasi grid laut.
  2. **Monthly Z-Score Deseasonalization:**
     * Menghitung rata-rata klimatologis ($\mu_m$) dan simpangan baku ($\sigma_m$) untuk setiap bulan kalender $m \in \{1..12\}$, lalu mengubah tiap titik data menjadi anomali ternormalisasi $Z_{y,m} = (X_{y,m} - \mu_m) / \sigma_m$.
  3. **Trend & Significance Testing (Per Variabel di Region A & Region B):**
     * Menjalankan **Mann-Kendall Test** untuk menghasilkan $\tau$, $Z_{\text{MK}}$, dan $p$-value eksak (`HIGHLY_SIGNIFICANT` jika $p < 0.01$, `SIGNIFICANT` jika $p < 0.05$, `NOT_SIGNIFICANT` jika $p \ge 0.05$).
     * Menjalankan **Sen's Slope Estimator** untuk menghitung laju perubahan per dekade ($Q_{\text{decade}}$) beserta *95% Confidence Interval*.
     * Menjalankan **Pettitt Change-Point Detection** untuk menemukan bulan dan tahun spesifik terjadinya *regime shift* paling tajam.
  4. **Inter-Regional Dipole Evaluation:**
     * Menghitung korelasi lintas wilayah ($r_{\text{dipole}}$) antara Region A dan Region B pada variabel utama. Jika tanda kemiringan tren berlawanan dan $r_{\text{dipole}} < 0$ secara signifikan, status **`OPPOSITE-SIGN TELECONNECTION CONFIRMED`** diaktifkan.
  5. **Water-Energy Lag-Cascade & Silent Ecological Stress Check:**
     * Menguji korelasi berjeda waktu $k \in \{0, 1, 2, 3, 4, 5, 6\}$ bulan pada rantai:
       `Solar Radiation (Rs)` $\xrightarrow{k_1}$ `Root-Zone Soil Wetness (SM)` $\xrightarrow{k_2}$ `Skin Temp (Ts)` $\xrightarrow{k_3}$ `Precipitation (P)`.
     * **Pengecekan Stres Senyap:** Jika `GWETROOT` mengalami penurunan signifikan ($p < 0.01$) sementara tren `PRECTOTCORR` belum menunjukkan penurunan signifikan ($p \ge 0.05$), bendera `silentEcologicalStressDetected = true` diaktifkan.
  6. **Dynamic Cross-Validation (`GISTEMP v4`):**
     * Menjalankan fungsi `mannKendallTest()` dan `sensSlope()` yang sama persis terhadap dataset benchmark **NASA GISTEMP v4** (`1985–2025`) untuk menghitung persentase deviasi kalibrasi secara dinamis.

---

### Stage 4: Dual-Layer Interactive Dashboard Exploration
* **Tujuan:** Memenuhi kebutuhan dua kelompok pengguna sekaligus—siswa/masyarakat awam dan juri/peneliti sains—dalam satu layar tanpa *reload*.
* **Alur Pengguna & Tampilan:**
  1. **Panel Perbandingan Wilayah Berpasangan (`DualRegionCharts.tsx`):**
     * Menampilkan kartu **Region A** dan **Region B** berdampingan dengan lencana signifikansi warna-kode (Merah/Amber untuk tren mengering/memanas signifikan, Cyan/Hijau untuk tren membasah/mendingin signifikan, Abu-abu untuk *Seasonal Noise*).
     * Grafik interaktif Recharts menampilkan kurva anomali *deseasonalized* (`Z-score`) lengkap dengan garis putus-putus vertikal bertuliskan **`Pettitt Regime Shift: YYYY-MM`**.
     * Pengguna dapat mengganti variabel yang diplot (`Soil Wetness`, `Precipitation`, `Skin Temp`, `Solar Radiation`) atau beralih antara tampilan **`Deseasonalized Anomaly`** dan **`Raw Monthly Values`**.
  2. **Panel Rantai Sebab-Akibat (`LagCascadePanel.tsx`):**
     * Menampilkan diagram alir 4 simpul dengan label jumlah bulan jeda (`+1 mo lag`, `+2 mo lag`) dan kekuatan korelasi $r$ di setiap panah.
     * Jika `silentEcologicalStressDetected` aktif, muncul **Banner Peringatan Dini** yang menjelaskan bahwa ekosistem sudah mengalami pengeringan lapisan akar sebelum hujan berkurang.
  3. **Pengalih Lapisan Tampilan (`Citizen / Student View` $\leftrightarrow$ `Scientific Proof View`):**
     * Saat **`Citizen / Student View`** aktif: Fokus pada ringkasan visual, arti dampak bagi pertanian/pesisir, dan langkah mitigasi praktis.
     * Saat **`Scientific Proof View`** aktif: Membuka laci pembuktian ilmiah (`ScientificProofDrawer.tsx`) berisi tabel lengkap statistik ($\tau$, $Z$-score, $p$-value, Sen's Slope, 95% CI, Pettitt $K_T$) serta **Kartu Benchmark Validasi Silang NASA GISTEMP v4**.

---

### Stage 5: Bounded AI Causal Explainer (`/api/explain`)
* **Tujuan:** Menerjemahkan angka statistik kompleks menjadi narasi mekanisme fisik yang mudah dicerna pengambil kebijakan tanpa risiko halusinasi AI.
* **Alur Sistem:**
  1. Frontend mengirim ringkasan JSON hasil hitungan deterministik (bukan data mentah) ke `POST /api/explain`.
  2. Server memanggil **`@google/genai`** menggunakan model **`gemini-3.8-flash`** dengan *system instruction* ketat: *"Synthesize the physical climate mechanism and regional mitigation actions strictly from the provided statistical JSON. Never invent or alter numbers."*
  3. Batas waktu (*timeout*) dikunci pada **`2.8 detik`**. Jika `GEMINI_API_KEY` tidak diatur, kuota habis, atau jaringan lambat, server otomatis mengeksekusi `causalFallback.ts` yang menyusun narasi terstruktur berbasis aturan deterministik dari angka `pValue`, `sensSlope`, `optimalLagMonths`, dan `dipoleCorrelationR`.
* **Tampilan UI (`BoundedAiBrief.tsx`):**
  * Menampilkan **Headline Sintesis**, **3 Poin Mekanisme Fisik (IOD/ENSO & Water-Energy Coupling)**, **2 Rekomendasi Aksi Lingkungan**, serta lencana transparan sumber mesin (`Verified Stats + Gemini 3.8 Flash` atau `Verified Stats + Deterministic Engine`).

---

### Stage 6: Sharing & Scientific Briefing Export
* **Alur Pengguna:**
  1. Klik **`Share Analysis URL`** di header $\rightarrow$ menyalin tautan dengan parameter koordinat dan gejala aktif ke *clipboard* sehingga rekan tim atau juri dapat membuka temuan yang sama persis.
  2. Klik **`Export Briefing Report`** $\rightarrow$ mengunduh ringkasan temuan statistik dan rekomendasi mitigasi dalam format Markdown/Print-ready untuk lampiran kebijakan atau dokumentasi riset.

---

## 3. Diagram Alir State & Penanganan Error (System State Machine)

| State Aplikasi | Pemicu (*Trigger*) | Perilaku UI & Data | Jaminan Anti-Gagal (*Resilience*) |
| :--- | :--- | :--- | :--- |
| **`INITIAL_HYDRATED`** | Halaman pertama kali dibuka | Langsung merender Studi Kasus #1 (*Surabaya vs. Turkana*) dari cache lokal | Waktu muat instan ($<100\text{ ms}$), 0 ketergantungan jaringan eksternal |
| **`CACHED_CASE_ACTIVE`** | Pengguna klik salah satu dari 3 tombol Studi Kasus | Mengganti koordinat, menjalankan ulang `statsEngine.ts` + `/api/explain` | Data 40 tahun lengkap (`480 bulan`) tanpa risiko *rate-limit* |
| **`FETCHING_LIVE_NASA`** | Pengguna klik titik baru di Peta Dunia SVG | Menampilkan *skeleton loader* pada grafik & status `"Querying NASA POWER v2..."` | Timeout ketat `4.5s` pada `AbortSignal` |
| **`LIVE_ANALYSIS_READY`** | Respons NASA POWER v2 berhasil diparsing | Menampilkan lencana `LIVE NASA POWER V2` + hasil statistik wilayah pilihan pengguna | Otomatis menangani grid laut (`GWETROOT = -999`) dengan fallback ke variabel atmosfer |
| **`API_FALLBACK_ACTIVE`** | NASA POWER timeout / offline ATAU Gemini timeout $>2.8\text{s}$ | Menampilkan notifikasi halus tanpa layar error merah; tetap menyajikan analisis lengkap | Aplikasi tidak pernah *crash* atau menampilkan HTTP 500 saat demo penjurian |

---

## 4. Skenario Alur Demo 30 Detik (Golden Path untuk Video & Juri)

Gunakan urutan klik berikut saat merekam **Video Demo maksimal 30 detik** (Minggu pagi pukul 09:30 WIB) agar seluruh keunggulan **NusaShift** terlihat dalam sekali jalan:

* **`00:00 – 00:06` (Hook & Hypothesis Triage):** Tunjukkan layar utama **NusaShift** dengan studi kasus *Surabaya/East Java vs. Turkana Basin (Kenya)*. Sorot panel *Hypothesis Triage* yang otomatis memetakan gejala kekeringan pesisir ke 4 variabel NASA POWER.
* **`00:06 – 00:14` (Opposite-Sign Dipole Proof):** Arahkan kursor ke dua grafik *Deseasonalized Anomaly* berdampingan dan garis vertikal *Pettitt Change-Point*, menunjukkan bagaimana curah hujan dan kelembapan tanah di Jawa Timur turun signifikan ($p < 0.01$) sementara wilayah pasangannya di Afrika Timur bergerak berlawanan arah akibat IOD/ENSO.
* **`00:14 – 00:22` (Lag-Cascade & Silent Ecological Stress):** Klik Studi Kasus #2 (*Central Kalimantan Peatlands vs. Piura, Peru*), sorot diagram panah jeda bulan (`Solar Radiation` $\rightarrow$ `Soil Wetness` $\rightarrow$ `Skin Temp`) dan lencana peringatan dini **`SILENT ECOLOGICAL STRESS DETECTED`**.
* **`00:22 – 00:30` (Scientific Proof & Bounded AI):** Klik toggle **`Scientific Proof View`** untuk memperlihatkan tabel statistik formal + kartu kalibrasi **NASA GISTEMP v4**, lalu sorot ringkasan kausalitas dan rekomendasi mitigasi dari **Bounded AI Explainer**.