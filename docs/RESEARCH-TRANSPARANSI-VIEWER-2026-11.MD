# Deep Research: Transparansi Electron + Perbandingan Document Viewer
*2026-11-26 · Metode: audit kode inkdrop-clone (GLASS_ACRYLIC_LOCK + main.cjs + index.css) + audit TemplateEngine/PanelPreview SPJ + baca docs resmi extend.ai DOCX Viewer (fetch langsung berhasil) · Confidence: Tinggi (kode), Sedang ( klaim API extend — dari docs resmi, belum uji install) · 0 kode riset diubah*

---

## BAGIAN 1 — Transparansi & Blur untuk Electron (referensi: inkdrop-clone)

### 1.1 Kunci arsitektur (dari `GLASS_ACRYLIC_LOCK.md` + `electron/main.cjs`)

| Aspek | Windows | macOS |
|---|---|---|
| Material OS | `backgroundMaterial: 'acrylic'` | `vibrancy: 'under-window'` |
| Transparan | `backgroundColor: '#00000000'` + **`transparent` DILARANG** (konflik → material hilang) | `transparent: true` |
| Sinyal ke renderer | query `?acrylic=1` → `body.acrylic-window` | sama |

**Hukum besi #1: CSS `backdrop-filter` TIDAK BISA blur wallpaper desktop.** Blur desktop digambar oleh OS (acrylic/vibrancy). Syaratnya halaman harus **benar-benar transparan** (`html/body/#root/app-shell → transparent`, `body` tanpa background opaque).

**Hukum besi #2: tint translusen, bukan opaque.** Inkdrop memakai tint gelap bertingkat: page `hsl(0 0% 0% / 55%)`, kolom `hsl(0 0% 9% / 62%)`, tanpa beda antar kolom. Cukup gelap agar wallpaper tidak mendominasi (= jawaban atas "agar tidak ber efek warna bg aplikasi di belakangnya").

**Hukum besi #3: yang harus tetap opak dikecualikan eksplisit.** Kertas/dokumen (`qc-card`), editor teks (keterbacaan glyph), dsb. tetap solid — tanpa `backdrop-filter`.

**Hukum besi #4: blur CSS hanya untuk kedalaman antar-lapisan aplikasi** (panel mengambang blur 14px, kartu blur 30px+saturate) — bukan untuk efek kaca desktop.

### 1.2 Penerapan ke SPJ (dark-only, sesuai permintaan)

Status: SPJ belum punya shell Electron (migrasi = Sprint 021, masih planning). Yang diimplementasi sekarang = **kontrak CSS siap-Electron**, aktif hanya bila `<body class="electron-acrylic">` (disematkan shell via `?acrylic=1`, pola persis inkdrop) + tema dark. Tema light: NOL aturan.

```css
html.dark body.electron-acrylic {
  --color-background: transparent;                 /* page tembus → OS blur terlihat */
  --color-surface: rgba(13,20,36,.78);             /* navy SPJ, bukan hitam netral */
  --color-surface-muted: rgba(17,27,48,.72);
  --color-surface-container: rgba(22,35,60,.70);
  --color-surface-container-high: rgba(28,45,76,.75);
}
+ floating layer (sidebar detail, mini panel, dialog, toast, dropdown):
  backdrop-filter: blur(16px) saturate(1.25)  /* kedalaman antar-lapisan */
+ kertas/pratinjau/cetak + toast premium + hero saldo: TETAP opak (guard ada)
```

Kontrak main-process saat migrasi (ditulis di komentar CSS sebagai instruksi):
Windows `backgroundColor:'#00000000'` + `backgroundMaterial:'acrylic'` (tanpa `transparent:true`); macOS `transparent:true` + `vibrancy:'under-window'`.

**Yang TIDAK dilakukan (dan alasannya):**
- Tidak mengubah tampilan web saat ini (class belum disematkan siapa pun → nol efek visual hari ini).
- Tidak memakai `transparent:true` di Windows (menghilangkan material — temuan inkdrop).
- Tidak menerapkan ke light theme (permintaan eksplisit).

### 1.3 Verifikasi kontrak (checklist)

- [ ] `body.electron-acrylic` hanya disematkan saat dark (shell).
- [ ] Kertas A4/F4 tetap `#fff` di semua mode (guard `.panel-a4-paper` + `.sk-print-area`).
- [ ] Toast premium & Saldo hero tetap gradasi opak (bukan kaca).
- [ ] Uji di wallpaper terang & gelap: teks harus lolos kontras (tint ≥75% opacity).
- [ ] `prefers-reduced-motion` tidak terdampak (ini soal blur, bukan gerak).

---

## BAGIAN 2 — Document Viewer: TemplateEngine SPJ vs extend.ai DOCX Viewer

Sumber extend.ai: dibaca langsung dari `https://www.extend.ai/ui/docs/components/docx-viewer` (fetch berhasil 2026-11-26).

### 2.1 extend.ai DOCX Viewer — apa adanya

- **Fungsi:** me-render file `.docx` ARBITRER milik user (upload/drag) — heading, list, tabel, gambar, header/footer, page-break, outline/navigasi section, komentar + tracked-changes, copyable text.
- **Fitur:** zoom numeric/fit-page/fit-width/automatic, tema terang/gelap, toolbar (upload, download, showUpload/showDownload), layout blocks yang bisa di-klik untuk scroll ke sumber (webmcp-ish), dukungan `.doc` terbatas/eksperimental (disarankan konversi).
- **Syarat:** ekosistem shadcn (`pnpm dlx shadcn@latest add @extend/docx-viewer`), React, dependensi `@extend-ai/react-docx`.
- **Kegunaan inti:** *melihat/mereview dokumen Word yang sudah ada* (kontrak, proposal masuk, laporan) — BUKAN membuat dokumen dari data.

### 2.2 SPJ TemplateEngine + PanelPreviewDocument — apa adanya

- **Fungsi:** me-render DATA TERSTRUKTUR milik aplikasi (form state) lewat template JSX per-dokumen (`templateConfig` + blok `UndanganKegiatan`, `SKHonorer`, dst) menjadi **HTML A4/F4 persis-cetak** (mode=print), live-sync dari form.
- **Fitur panel:** skala-agar-muat (ResizeObserver + center), zoom 50–150% + reset, A4/F4 switch, fullscreen + Esc, **centralized print selection** (checklist per dokumen, printPortal terpisah), readiness gate (LENGKAP/N-PERLU-DIISI + sorot field), afterprint reset, foto AI digabung sebagai dokumen.
- **Keunggulan struktural:** nol dependensi viewer, offline penuh, WYSIWYG = piksel cetak (satu sumber render layar & print), terintegrasi prefill BKU + validasi field + snapshot sebelum timpa.

### 2.3 Putusan

| Aspek | SPJ (pertahankan) | extend.ai DOCX Viewer |
|---|---|---|
| Tugas utama SPJ (buat dokumen dari data) | ✅ native — template milik sendiri | ❌ tidak relevan (butuh file .docx jadi) |
| Lihat .docx upload-an user | ❌ tidak ada (upload = PDF/XLSX → parse jadi data) | ✅ satu-satunya alasan pakai |
| Kesesuaian cetak A4/F4 + kop | ✅ piksel-identik (satu renderer) | ⚠️ render umum, bukan template SK |
| Offline / bundle | ✅ nol tambahan | ❌ +registry +parser (ratusan KB) |
| Integrasi (prefill, validasi, checklist cetak) | ✅ sudah dalam | ❌ bangun ulang adaptor |
| Dark mode + zoom + fullscreen | ✅ sudah ada | ✅ setara |
| Komentar/track-changes .docx | ❌ tidak ada | ✅ unggul (tak dibutuhkan SPJ) |

**Rekomendasi: TIDAK mengadopsi extend.ai.** SPJ tidak pernah menampilkan file .docx arbitrER — alurnya adalah data → template → cetak, yang justru lebih kuat dari viewer generik. Mengadopsi berarti menambah dependensi berat untuk kebutuhan yang tidak ada.

**Yang diadopsi dari pola extend.ai (tanpa dependensi):**
1. ✅ Thumbnail/navigasi dokumen — SUDAH ADA (checklist + tab Undangan/Surat Tugas/Daftar Hadir + lompat seksi).
2. ✅ Zoom modes — SUDAH ADA (50–150% + reset + fullscreen).
3. ✅ Status readiness per dokumen — SUDAH ADA (LENGKAP/N-PERLU-DIISI + sorot).
4. Pola "klik outline → scroll ke sumber" — analognya sudah ada (sorotPelanggaran, lompat seksi).

### 2.4 Yang benar-benar diperbaiki dari riset ini (sudah diimplementasikan)

- Kertas pratinjau DIPAKSA putih di dark (`#fff !important` + guard) — sebelumnya mengikuti `dark:bg-slate-900` (abu).
- Wrap panel: blue-wash `.06` + shadow kertas dipertegas → kertas "mengambang" di atas panel, tanpa clash.
- Panel header + toolbar dibiarkan (sudah fungsional).

---

## Key Takeaways

1. Electron glass = konfigurasi OS + halaman transparan + tint gelap; CSS blur saja tidak cukup. Kontrak dark-only sudah ditanam di `index.css`, aktif hanya via `body.electron-acrylic`.
2. Kertas/dokumen/toast/hero = opak, selalu. Itu pagar anti-bocor warna.
3. extend.ai DOCX Viewer unggul HANYA untuk melihat file .docx arbitrER — bukan kebutuhan SPJ. TemplateEngine dipertahankan; pola UX-nya sudah setara/setara-lebih untuk alur SPJ.
4. Verifikasi visual: kertas putih (255,255,255) + wrap blue-wash (148,178,255,.06) di dark — terukur via computed style.

## Sumber

1. `project/inkdrop-clone/GLASS_ACRYLIC_LOCK.md` — kontrak terkunci (dibaca penuh).
2. `project/inkdrop-clone/electron/main.cjs` — recipe acrylic/vibrancy + larangan transparent:true di Windows (dibaca: baris 15-27, 172-182, 406-420).
3. `project/inkdrop-clone/src/index.css` — tint `hsl(0 0% 9% / 62%)`, panel blur 14–30px, pengecualian opak (dibaca: baris 150-230, 292-340).
4. `https://www.extend.ai/ui/docs/components/docx-viewer` — API & fitur DOCX Viewer (difetch langsung).
5. `src/components/templates/{TemplateEngine,PanelPreviewDocument}.jsx` — kapabilitas SPJ (audit kode).
6. `src/data/kategoriLpj.js`, `src/utils/previewDocs.js` — alur preview/print SPJ.

## Metodologi

Sub-pertanyaan: (1) bagaimana inkdrop mengunci acrylic tanpa bocor warna; (2) apa isi panel preview SPJ vs kebutuhan; (3) fitur & syarat extend.ai DOCX Viewer; (4) matriks putuskan pakai/bangun. Websearch gagal (HTTP 402) → diganti fetch langsung (berhasil 1/2 URL) + audit kode lokal baris-per-baris. Klaim API extend.ai = kutipan docs resmi mereka.
