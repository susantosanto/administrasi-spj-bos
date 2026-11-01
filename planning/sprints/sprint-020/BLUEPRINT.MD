# BLUEPRINT — Sprint 020: Generate Foto Dokumentasi AI Sungguhan

> Dependency: **0 baru**. `@heyputer/puter.js@2.5.4` (terpasang, `package.json:12`).
> React 18 + Vite + Tailwind — versi pinned mengikuti `package.json` existing, tidak diubah.

## 1. File yang Diubah

| File | Perubahan | Perkiraan delta |
|---|---|---|
| `src/services/imageGenerator.js` | Tulis ulang `generateWithPuter` → panggilan riil `puter.ai.txt2img`; canvas placeholder jadi fungsi fallback `_canvasPlaceholder()`; helper konversi hasil → dataURL | ±60 baris berubah |
| `src/components/dokumentasi/DokumentasiAIGenerate.jsx` | Kirim foto personel terpilih sebagai input image; teks loading; hint sign-in; pesan fallback | ±25 baris |

**TIDAK diubah:** `useFotoDokumen.js`, `FotoDokumenPaper.jsx`, `BKUSidebar.jsx`,
`BKUSidebarDokumentasi.jsx`, `PanelPreviewDocument.jsx`, `templateConfig.js`, `package.json`.

## 2. Desain Teknis imageGenerator.js

```
generateDocumentationImage({ prompt, activity, faceImages = [], provider })
  ├─ provider 'puter' (default) → generateWithPuter(finalPrompt, faceImages)
  │    ├─ _getPuter()                    (existing, :59-64 — tetap)
  │    ├─ puter.ai.txt2img(finalPrompt, options)
  │    │     options: { input_image?, input_image_mime_type? }   ← lihat V-1
  │    ├─ hasil (<img> element | URL — V-2) → _toDataUrl(result)
  │    └─ catch → throw ke pemanggil (fallback diputuskan di UI, R-3.2)
  └─ catch semua → pemanggil memanggil _canvasPlaceholder(finalPrompt) (existing :88-164)
```

- `faceImages` = **array** dataURL foto personel terpilih (perubahan dari `faceImage`
  tunggal). R-2.2: multi-input mengikuti hasil V-5.
- `_toDataUrl(result)`: bila `<img>` element → ambil `.src`; bila blob:/http URL →
  fetch → blob → FileReader dataURL; bila sudah dataURL → langsung. Canvas fallback
  menghasilkan dataURL (existing `toDataURL('image/jpeg', 0.9)`).
- Blok Flux Pro (:179-209) **dibiarkan** sebagai komentar upgrade-path (bukan scope hapus).
- `ACTIVITY_PROMPTS`, `resizeImage` tidak berubah.

## 3. Desain Teknis DokumentasiAIGenerate.jsx

- `handleGenerate` (:98-126): kumpulkan `faceImages = selectedOrangList.map(n =>
  personelPhotos[n]?.dataUrl).filter(Boolean)`; kirim ke `generateDocumentationImage`.
- Gagal jaringan/Puter → `catch` → tampilkan error + generate ulang otomatis via
  `_canvasPlaceholder` dengan flag `fallback: true` di meta foto (label jujur di daftar foto).
- Teks loading :276 → "Tunggu 10-60 detik — foto dibuat oleh AI".
- Hint sign-in: 1 baris kecil di bawah tombol (slate, tidak menambah blok baru).

## 4. Verifikasi Wajib Saat Implementasi (belum bisa dikunci dari dokumen)

| ID | Yang diverifikasi | Cara |
|---|---|---|
| V-1 | Nama param image-to-image (`input_image` + `input_image_mime_type`) | docs.puter.com/AI/txt2img + playground image-to-image |
| V-2 | Return type txt2img (`<img>` element vs URL) | uji langsung di browser console |
| V-3 | Perilaku data-URI >1 MiB (upload temp file Puter) | docs + uji dengan foto personel asli |
| V-4 | Popup sign-in Puter: kapan muncul, apa yang terlihat user | uji browser incognito/profil bersih |
| V-5 | Multi input image didukung atau tidak | docs + uji; bila tidak → R-2.2 fallback |

Hasil verifikasi V-1…V-5 WAJIB dicatat di BUILD-REPORT.MD (bukti, bukan klaim).

## 5. Gate Anti-Regresi

- G-1 `templateConfig.js` 0 diff.
- G-2 File tabu 0 diff (`bkuParser.js`, `SummaryCard.jsx`, `DokumenSPJPage.jsx`,
  `DokumenKelengkapanPage.jsx`).
- G-3 `useFotoDokumen.js` + `FotoDokumenPaper.jsx` + `PanelPreviewDocument.jsx` 0 diff
  (alur Sprint 019 revisi tidak disentuh).
- G-4 `package.json` 0 diff (0 dependency baru).
- G-5 Grep warna terlarang di 2 file yang diubah = 0 hit
  (`violet|amber|emerald|rose|cyan|indigo` — kecuali komentar bersejarah yang sudah ada).
- G-6 Build `npm run build` exit 0.
