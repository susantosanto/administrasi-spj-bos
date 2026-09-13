# DATA-MODEL.MD — Model Data & Relasi

(Backfill dari kondisi aktual saat adopsi workflow 2026-09-13 — ritel 3 Jalur A 27.8.2.
Diekstrak dari docs/STANDAR-TEKNIS.md. Model data saat ini = localStorage-based, tanpa backend.)

## Penyimpanan (as adopted)
- Tidak ada backend/database — semua data di **localStorage browser**, prefix `spj_`
  (prefix JANGAN diubah — backward compatibility)
- formData per template persist di localStorage; data mock di `src/data/mockData.js`

## Entitas & Sumber Data Utama

| Entitas | Lokasi | Catatan |
|---------|--------|---------|
| Template config (13 template) | `spj-frontend/src/data/templateConfig.js` | Definisi: id, card, sub-kategori, source (Excel/DOCX), orientation |
| Konten berulang default (pasal SK honorer) | `spj-frontend/src/data/skPasal.js` | `DEFAULT_*` + `cloneDefault*()` deep clone; tombol "Reset ke Standar" |
| Data sekolah (default) | `spj-frontend/src/utils/sekolahData.js` | SDN Lebakleungsir + kepsek + bendahara (lihat DOMAIN.MD) |
| Peran TTD dokumen | `spj-frontend/src/utils/signatureRoles.js` | `kepala-sekolah`: label + defaultName + defaultNip |
| Data guru/tendik | `spj-frontend/src/pages/dashboard/DataGuruPage.jsx` | Sumber enrich data penerima dokumen |
| Template asli (sumber format cetak) | `template/*.docx`, `template/*.xlsx` | 3 DOCX + 1 Excel (`Form. Honor_2026.xlsx`) |

## Relasi & Aliran Data

```
Data Guru/Tendik ──enrich──► Penerima dokumen (formData)
templateConfig.js ──────────► TemplateEngine.jsx (render blok)
src/data/<nama>.js ──clone──► editor CRUD (formData) ──persist──► localStorage (spj_)
formData ──token {{field}}─► render dokumen formal per penerima
```

- **Enrichment**: data penerima di-enrich otomatis dari Data Guru/Tendik (nama, jabatan,
  NUPTK, NIP, golongan, tempatLahir, tanggalLahir, alamat); field kosong dilengkapi manual
  (write back ke formData).
- **Token isian**: `{{field}}` per penerima diganti saat render (contoh `{{kelasGuru}}`).

## Rencana Ke Depan
- Backend/database masih tahap riset — belum diputuskan (lihat DECISIONS.MD).
  Rujukan riset: `docs/RISET_SUPABASE_VS_ALTERNATIF.md`,
  `docs/KONSEP_EXCEL_PARSER_VS_BACKEND_API.md`
