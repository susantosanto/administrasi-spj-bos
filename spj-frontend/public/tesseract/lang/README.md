# Aset OCR (tesseract.js)

## `lang/ind.traineddata`

Model bahasa Indonesia untuk Tesseract (LSTM-only, `tessdata_best`).

**Isi file ini adalah data GZIP** (magic byte `1F 8B`), sengaja tanpa
ekstensi `.gz`.

### Kenapa bukan `ind.traineddata.gz`?

Ekstensi `.gz` di-intercept extension browser. IDM "Advanced Integration"
(terbukti di Edge profil sekolah) membalas **204 + body kosong** untuk
permintaan `.gz`:

```
GET /tesseract/lang/ind.traineddata.gz  → 204, 0 byte   (di-intercept IDM)
GET /tesseract/lang/ind.traineddata     → 200, 3.847.026 byte
```

Tesseract lalu menulis body kosong itu ke `./ind.traineddata` di WASM FS
dan gagal dengan `Error opening data file ./ind.traineddata` — pesan teknis
yang tidak bisa ditindaklanjuti bendahara.

### Kenapa isi gzip tetap aman?

`tesseract.js` memeriksa magic number gzip sendiri sebelum decompress
(`src/worker-script/index.js:161-166`):

```js
const isGzip = (data[0] === 31 && data[1] === 139) || (data[1] === 31 && data[0] === 139);
if (isGzip) { data = adapter.gunzip(data); }
```

Karena itu `gzip: false` + `langPath: '/tesseract/lang'` aman: Tesseract
mengambil `ind.traineddata`, mengenali isinya gzip, lalu decompress.

### Aturan

- **Jangan** mengganti nama file menjadi `.gz` — kembali ke masalah IDM.
- **Jangan** menyalakan `cacheMethod` bawaan: respons 204 lolos diam-diam
  (`resp.ok === true` untuk 2xx) dan body kosong ikut ter-cache selamanya.
- Sumber model: `@tesseract.js-data/ind` (versi 4.0.0_best_int).
