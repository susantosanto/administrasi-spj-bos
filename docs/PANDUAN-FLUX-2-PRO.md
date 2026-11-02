# PANDUAN — FLUX.2 [pro] untuk spj-app (endpoint, prompt, biaya, integrasi)

> Disusun 31 Okt 2026 dari dokumentasi resmi BFL: `docs.bfl.ai/flux_2/flux2_overview`,
> `docs.bfl.ai/guides/prompting_unified_reference`, `docs.bfl.ai/quick_start/pricing`,
> `docs.bfl.ai/quick_start/generating_images`, `api.bfl.ai/openapi.json`.
> Harga: 1 credit = $0,01. Kurs asumsi Rp 18.100/USD.

---

## 0. Di mana panduan resminya

| Keperluan | Tautan resmi |
|---|---|
| Ikhtisar keluarga FLUX.2 (pro/flex/max/klein) | `https://docs.bfl.ai/flux_2/flux2_overview` |
| Text-to-image FLUX.2 | `https://docs.bfl.ai/flux_2/flux2_text_to_image` |
| Referensi API (parameter & respons) | `https://docs.bfl.ai/api-reference/` |
| Prompting FLUX.2 (aturan per model) | `https://docs.bfl.ai/guides/prompting_unified_reference` |
| JSON prompting | `https://docs.bfl.ai/guides/usecases_t2i_json_prompting` |
| Harga & kalkulator | `https://docs.bfl.ai/quick_start/pricing` · `https://bfl.ai/pricing` |
| Playground (uji tanpa kode) | `https://playground.bfl.ai` |
| Kredit & tagihan | `https://docs.bfl.ai/account_management/credits_billing` |

Catatan: halaman produk `bfl.ai/models/flux-2-pro` **tidak ada** (404). Dokumentasi model
FLUX.2 hanya di `docs.bfl.ai/flux_2/*`, sedangkan halaman produk yang tersedia di
`bfl.ai/models/*` adalah FLUX 3.

---

## 1. Dua endpoint, beda tujuan

| Endpoint | Sifat | Pakai kapan |
|---|---|---|
| `/v1/flux-2-pro-preview` | selalu model terbaru | produksi yang mengejar kualitas |
| `/v1/flux-2-pro` | snapshot tetap | butuh hasil reproducible / audit |

Kontrak request & response **identik**; yang berbeda hanya bobot model.

---

## 2. Parameter (dari OpenAPI, bukan tebakan)

`POST https://api.bfl.ai/v1/flux-2-pro` · header `x-key: <API_KEY>`

| Field | Tipe | Default | Catatan |
|---|---|---|---|
| `prompt` | string | **wajib** | boleh JSON terstruktur (string JSON) |
| `input_image` … `input_image_8` | string | — | URL http(s) atau base64; **bernomor, bukan array** |
| `width`, `height` | int ≥64 | 0 | output; total input+output ≤ **9 MP** |
| `disable_pup` | bool | `false` | prompt upsampling otomatis **aktif** untuk [pro] |
| `seed` | int | null | reproduksibilitas |
| `safety_tolerance` | 0–7 | 2 | 0 paling ketat |
| `output_format` | enum | `jpeg` | `jpeg` / `png` |
| `webhook_url`, `webhook_secret` | string | — | alternatif polling |

Respons: `{ id, polling_url, cost, input_mp, output_mp }` — `cost` dalam **credit**
(1 credit = $0,01), langsung bisa dipakai untuk log biaya.

**Batas penting**

- Referensi: **8** (API) / 10 (playground) untuk [pro]; `input_image` … `input_image_8`.
- **Total input + output ≤ 9 MP**: output 1 MP → maks 8 referensi; output 2 MP → maks 7.
- Edit maks **4 MP**.
- **24 task aktif** per akun → HTTP 429.
- URL hasil `result.sample` berlaku **10 menit**, dan `delivery.*.bfl.ai` **tanpa CORS**.

---

## 3. Prompting FLUX.2 [pro] — 6 aturan yang mengubah hasil

1. **Tidak ada negative prompt.** Kalimat "jangan mengubah wajah" bisa justru menambah yang
   dilarang. Tulis positif: *"wajah setiap orang persis seperti gambar 1, ekspresi natural"*.
2. **Rujuk referensi dengan nomor**: *"gambar 1"*, *"gambar 2"* — sesuai urutan `input_image`.
3. **Prompt upsampling aktif** (`disable_pup=false`). Prompt pendek dan faktual sudah
   diperluas otomatis; jangan menulis paragraf panjang berisi larangan.
4. **JSON terstruktur** untuk produksi:
   ```json
   {"scene":"rapat guru di ruang rapat sekolah dasar, siang",
    "subjects":[{"desc":"guru perempuan mengenakan batik biru","pose":"duduk menghadap meja"}],
    "lighting":"cahaya alami dari jendela samping","camera":{"lens":"35mm","angle":"eye level"},
    "style":"foto dokumentasi jurnalistik, natural, tanpa filter"}
   ```
5. **Teks dalam gambar**: kutip persis, taruh di depan, pendek. Contoh: `papan bertulisan "RAPAT GURU"`.
6. **Warna brand** pakai hex: `#004ac6` (warna UI proyek ini) — bukan deskripsi "biru".

---

## 4. Biaya (formula + tabel)

```
biaya = $0,03 (MP output pertama)
      + $0,015 × (MP output − 1)
      + $0,015 × jumlah referensi        ← tiap referensi dihitung 1 MP
```

| Konfigurasi | $/panggilan | Rp/panggilan | Rp/foto diterima (1,5×) | Rp/tahun (10.800 call) |
|---|---|---|---|---|
| 1 MP, 0 ref | 0,030 | 543 | 814 | 5.864.000 |
| 1 MP + 2 ref | 0,060 | 1.086 | 1.629 | 11.729.000 |
| **1 MP + 3 ref** | **0,075** | **1.358** | **2.036** | **14.661.000** |
| 2 MP + 3 ref | 0,090 | 1.629 | 2.444 | 17.593.000 |
| 4 MP + 3 ref | 0,120 | 2.172 | 3.258 | 23.458.000 |

Pembanding 1K: FLUX 3 Image **Rp 869 flat (referensi gratis)**, FLUX 3 Klein **Rp 163**.
→ Untuk pipeline 3 referensi, FLUX.2 [pro] **1,56× lebih mahal** dari FLUX 3 Image.

Ukuran output yang disarankan: **1152×864** (0,995 MP, 4:3) — tetap dihitung 1 MP.
Jangan 1344×1008 (1,35 MP) karena dibulatkan ke 2 MP → biaya naik 50%.

---

## 5. Kode integrasi (siap tempel)

```js
// src/services/imageGenerator.js — tambahan
const BFL_BASE = 'https://api.bfl.ai/v1'
const BFL_KEY = import.meta.env.VITE_BFL_API_KEY || ''   // demo saja; produksi: main process

const tidur = (ms, signal) => new Promise((ok, tolak) => {
  const t = setTimeout(ok, ms)
  signal?.addEventListener('abort', () => { clearTimeout(t); tolak(new Error('dibatalkan')) }, { once: true })
})

export async function generateWithFlux2Pro({ prompt, images = [], width = 1152, height = 864, signal }) {
  if (!BFL_KEY) throw new Error('Kunci BFL belum diatur')

  const body = { prompt, width, height, output_format: 'jpeg', safety_tolerance: 2 }
  images.slice(0, 8).forEach((img, i) => {
    body[i === 0 ? 'input_image' : `input_image_${i + 1}`] = img
  })

  const res = await fetch(`${BFL_BASE}/flux-2-pro`, {
    method: 'POST',
    headers: { 'x-key': BFL_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  })
  if (!res.ok) {
    if (res.status === 402) throw new Error('Kredit BFL habis')
    if (res.status === 429) throw new Error('Antrean penuh, coba lagi')
    if (res.status === 422) throw new Error('Permintaan ditolak (periksa prompt/referensi)')
    throw new Error(`BFL error ${res.status}`)
  }

  const { polling_url } = await res.json()
  for (let i = 0; i < 90; i++) {
    await tidur(1000, signal)
    const j = await (await fetch(polling_url, { headers: { 'x-key': BFL_KEY }, signal })).json()
    if (j.status === 'Ready') {
      return { url: j.result.sample, cost: j.cost, inputMp: j.input_mp, outputMp: j.output_mp }
    }
    if (j.status === 'Error' || j.status === 'Failed') throw new Error('Generasi gagal')
  }
  throw new Error('Timeout 90 detik')
}
```

Sambungkan ke `generateDocumentationImage()`:

```js
case 'flux2pro': {
  const hasil = await generateWithFlux2Pro({ prompt: promptReferensi, images: inputImages, signal })
  // unduh hasil.url ≤10 menit → dataURL (Electron: net.fetch di main; web: butuh proxy)
  return keDataUrl(hasil.url)
}
```

**Jangan lupa**: `promptReferensi` di `generateDocumentationImage()` masih memakai kalimat
negatif ("jangan mengubah wajah"). Untuk FLUX.2 ubah menjadi positif.

---

## 6. Urutan uji sebelum dipakai produksi

| # | Uji | Lulus jika |
|---|---|---|
| 1 | 1 request t2i 1 MP | keluar gambar, `cost` = 3 credit |
| 2 | 1 request + 1 referensi wajah | wajah mirip, `cost` = 4,5 credit |
| 3 | 1 request + 3 referensi | `input_mp` = 3,00, `cost` = 7,5 credit |
| 4 | 20 prompt kegiatan nyata | ≥70% layak tanpa regenerate |
| 5 | A/B vs FLUX 3 Image 1K | menang jelas pada kemiripan wajah? jika tidak → pakai FLUX 3 Image |
| 6 | Cetak A4 60×40 mm | wajah masih dikenali |

Jika uji 5 tidak menang jelas, keputusan berhenti di situ: FLUX.2 [pro] lebih mahal
dan tidak memberi nilai tambah untuk kasus ini.

---

## 7. Sumber

- `docs.bfl.ai/flux_2/flux2_overview` — [pro] 8 refs (API), 4 MP, preview vs pinned endpoint.
- `docs.bfl.ai/guides/prompting_unified_reference` — FLUX.2: 8 refs, 9 MP total, tanpa negative
  prompt, JSON prompting, hex color, tips tipografi.
- `docs.bfl.ai/quick_start/pricing` — 1 credit = $0,01; [pro] per MP.
- `api.bfl.ai/openapi.json` — field `input_image_1..8`, `disable_pup`, `width/height`,
  `output_format`, `safety_tolerance`; respons `cost/input_mp/output_mp`.
- `bfl.ai/pricing` (data kalkulator) — MP pertama $0,03, berikutnya $0,015, referensi $0,015/MP.
- `docs.bfl.ai/quick_start/generating_images` — polling, URL 10 menit, 24 task aktif, 402.
