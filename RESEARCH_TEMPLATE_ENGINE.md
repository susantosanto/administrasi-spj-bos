# 🔬 Research Report: Opsi A — React Component Template

*Generated: 2026-07-08 | Focus: Clean Code, Maintainability, Developer Experience*

---

## Executive Summary

Opsi A (React Component Template) adalah pendekatan terbaik untuk menampilkan template DOCX/XLSX sebagai komponen React interaktif dengan preview real-time. Tantangan utamanya adalah: **bagaimana membuat 26+ template tanpa technical debt?** Riset ini menjawab dengan pola arsitektur: **Data-Driven Template Engine** — satu komponen universal yang di-driven oleh konfigurasi, bukan 26 komponen terpisah.

Temuan kunci:
- **Jangan buat 26 komponen terpisah** — gunakan 1 engine + JSON config
- **Atomic Design** untuk building blocks (Header, Table, Signature, dll)
- **Template Config** sebagai single source of truth — developer lain tinggal edit JSON
- **CSS Print** untuk hasil cetak sempurna

---

## 1. Arsitektur Template Engine

### 1.1. Problem: 26+ Komponen = Maintenance Nightmare

Pendekatan naif (26 komponen) akan menghasilkan:
```jsx
// ❌ BURUK — 26 file, banyak duplikasi kode
src/components/templates/
├── SPPDTemplate.jsx        ← 100 baris
├── HonorGuruTemplate.jsx   ← 150 baris
├── HonorTendikTemplate.jsx ← 150 baris (mirip HonorGuru!)
├── HonorPerpusTemplate.jsx ← 150 baris (mirip lagi!)
├── NotulenTemplate.jsx     ← 80 baris
├── BukuTamuTemplate.jsx    ← 90 baris
├── SuratUndanganTemplate.jsx ← 100 baris
└── ... 20+ file lagi
```

**Masalah:**
- Duplikasi kode besar-besaran (Header, Signature, tabel sama)
- Perubahan kecil (misal ganti font) harus edit 26 file
- Developer baru bingung — mana yang beda, mana yang sama?

### 1.2. Solution: Data-Driven Template Engine

Gunakan **1 Engine + 1 Config JSON** untuk semua template:

```jsx
// ✅ BAIK — 1 engine universal + config per template
src/
├── components/
│   └── templates/
│       ├── TemplateEngine.jsx       ← Universal renderer
│       ├── blocks/                  ← Atomic components
│       │   ├── KopSurat.jsx
│       │   ├── HeaderDokumen.jsx
│       │   ├── TabelData.jsx
│       │   ├── SignatureFooter.jsx
│       │   └── FieldEditable.jsx
│       └── index.js
├── data/
│   └── templateConfig.js            ← Single source of truth
└── utils/
    └── templateHelpers.js           ← Formatter, number to words, dll
```

**Template engine bekerja seperti ini:**

```
TemplateConfig (JSON)                     TemplateEngine (JSX)
┌──────────────────────┐               ┌────────────────────────┐
│ {                    │               │                        │
│   kopSurat: true,    │── config ──▶  │ <KopSurat />           │
│   judul: "SPPD",     │               │ <HeaderDokumen .../>   │
│   fields: [...],     │               │ <TabelData {...} />    │
│   signature: "ks+bend"│              │ <SignatureFooter />    │
│ }                    │               │                        │
└──────────────────────┘               └────────────────────────┘
```

---

## 2. Arsitektur Detail

### 2.1. Template Config — Single Source of Truth

File JSON/JS yang mendefinisikan struktur setiap template:

```js
// data/templateConfig.js
export const TEMPLATE_CONFIGS = {
  // ─── PERJALANAN DINAS ───
  sppd: {
    id: 'sppd',
    label: 'Surat Perintah Tugas + SPD',
    category: 'perjalanan-dinas',
    sourceFile: '/templates/Surat Tugas + SPPD_rapat ops_gugus_2026.docx',
    
    // Layout blocks
    blocks: [
      { type: 'kop-surat' },
      { type: 'header', judul: 'SURAT PERINTAH TUGAS', nomor: true },
      { type: 'table-fields', fields: [
        { key: 'nama', label: 'Nama', type: 'text' },
        { key: 'nip', label: 'NIP', type: 'text' },
        { key: 'jabatan', label: 'Jabatan', type: 'text' },
        { key: 'tujuan', label: 'Untuk', type: 'textarea' },
        { key: 'tanggal', label: 'Tanggal', type: 'date' },
        { key: 'tempat', label: 'Tempat', type: 'text' },
      ]},
      { type: 'signature', roles: ['kepala-sekolah'] },
    ],
    
    // Default values
    defaults: {
      nomorSurat: '400.3.7.6/___-SD/2026',
      tempat: 'Cikalongwetan',
    }
  },

  // ─── HONOR ───
  honor_guru: {
    id: 'honor_guru',
    label: 'Honor Guru Tidak Tetap',
    category: 'honorarium',
    sourceFile: '/templates/Form. Honor_2026_SDN lebakleungsir.xlsx',
    
    blocks: [
      { type: 'kop-surat' },
      { type: 'header', judul: 'DAFTAR PENERIMA HONORARIUM/GAJI GURU TIDAK TETAP' },
      { type: 'info-keuangan', fields: ['program', 'kegiatan', 'kodeRekening'] },
      { type: 'table-dinamis', columns: [
        { key: 'no', label: 'No', width: 5 },
        { key: 'nama', label: 'NAMA PTK', width: 25 },
        { key: 'nuptk', label: 'NUPTK', width: 20 },
        { key: 'jabatan', label: 'JABATAN', width: 20 },
        { key: 'jumlah', label: 'JUMLAH (Rp)', width: 15, format: 'currency' },
        { key: 'pph', label: 'PPh 21', width: 10, format: 'currency' },
        { key: 'diterima', label: 'YANG DITERIMA (Rp)', width: 15, format: 'currency' },
      ]},
      { type: 'signature', roles: ['kepala-sekolah', 'bendahara'] },
    ],
    
    defaults: {
      bulan: 'Januari',
      tahun: '2026',
      program: '07 Pengembangan Standar Pembiayaan',
      kegiatan: 'Pembayaran Honor Guru',
      kodeRekening: '5.1.02.02.01.0013',
    }
  },

  // ─── NOTULEN ───
  notulen: {
    id: 'notulen',
    label: 'Notulen Rapat',
    category: 'dokumen-pendukung',
    sourceFile: '/templates/NOTULEN RAPAT.docx',
    
    blocks: [
      { type: 'kop-surat' },
      { type: 'header', judul: 'NOTULA RAPAT' },
      { type: 'table-fields', fields: [
        { key: 'hari', label: 'Hari', type: 'text' },
        { key: 'tanggal', label: 'Tanggal', type: 'date' },
        { key: 'waktu', label: 'Waktu', type: 'text' },
        { key: 'tempat', label: 'Tempat', type: 'text' },
        { key: 'acara', label: 'Acara', type: 'textarea' },
        { key: 'pimpinan', label: 'Pimpinan Rapat', type: 'text' },
        { key: 'notulen', label: 'Notulen', type: 'text' },
      ]},
      { type: 'poin-pembahasan', label: 'Poin Pembahasan' },
      { type: 'signature', roles: ['pimpinan', 'notulen'] },
    ],
    
    defaults: {
      tempat: 'SD NEGERI LEBAKLEUNGSIR',
    }
  },

  // ─── BUKU TAMU ───
  buku_tamu: {
    id: 'buku_tamu',
    label: 'Buku Tamu Kedinasan',
    category: 'mamin',
    sourceFile: '/templates/BUKU TAMU KEDINASAN.docx',
    
    blocks: [
      { type: 'kop-surat' },
      { type: 'header', judul: 'BUKU TAMU KEDINASAN' },
      { type: 'table-fields', fields: [
        { key: 'noUrut', label: 'No. Urut', type: 'number' },
        { key: 'tanggal', label: 'Hari/Tanggal', type: 'date' },
        { key: 'bertemu', label: 'Ingin bertemu dengan', type: 'select', options: ['Kepala Sekolah', 'Guru', 'Tendik'] },
        { key: 'tiba', label: 'Tiba Pukul', type: 'time' },
        { key: 'kembali', label: 'Kembali Pukul', type: 'time' },
      ]},
      { type: 'table-dinamis', columns: [
        { key: 'no', label: 'No.', width: 5 },
        { key: 'nama', label: 'NAMA', width: 25 },
        { key: 'jabatan', label: 'JABATAN', width: 20 },
        { key: 'alamat', label: 'ALAMAT KANTOR', width: 30 },
        { key: 'ttd', label: 'TANDA TANGAN', width: 20 },
      ]},
      { type: 'uraian-kegiatan' },
      { type: 'signature', roles: ['kepala-sekolah'] },
    ],
  },
}
```

### 2.2. Template Engine — Universal Renderer

Engine membaca config → render block-by-block:

```jsx
// components/templates/TemplateEngine.jsx
import { useState } from 'react'
import { KopSurat, HeaderDokumen, TabelDinamis, 
         TabelFields, SignatureFooter, PoinPembahasan, 
         UraianKegiatan, InfoKeuangan } from './blocks'
import { TEMPLATE_CONFIGS } from '../../data/templateConfig'

const BLOCK_RENDERERS = {
  'kop-surat': KopSurat,
  'header': HeaderDokumen,
  'table-fields': TabelFields,
  'table-dinamis': TabelDinamis,
  'info-keuangan': InfoKeuangan,
  'signature': SignatureFooter,
  'poin-pembahasan': PoinPembahasan,
  'uraian-kegiatan': UraianKegiatan,
}

export default function TemplateEngine({ templateId, data, onDataChange, mode = 'edit' }) {
  const config = TEMPLATE_CONFIGS[templateId]
  if (!config) return <ErrorState message={`Template "${templateId}" tidak ditemukan`} />

  return (
    <div className={mode === 'print' ? 'print-container' : 'preview-container'}>
      {/* Render blocks berurutan sesuai config */}
      {config.blocks.map((block, i) => {
        const BlockComponent = BLOCK_RENDERERS[block.type]
        if (!BlockComponent) {
          console.warn(`Block type "${block.type}" tidak dikenal`)
          return null
        }
        return (
          <BlockComponent
            key={`${templateId}-block-${i}`}
            blockConfig={block}
            data={data}
            onChange={(field, value) => onDataChange({ ...data, [field]: value })}
            mode={mode}
          />
        )
      })}
    </div>
  )
}
```

### 2.3. Block Components (Atomic Design)

Setiap block adalah komponen kecil yang independen:

```jsx
// components/templates/blocks/KopSurat.jsx
export default function KopSurat({ data, mode }) {
  return (
    <div className="text-center border-b-2 border-black pb-2 mb-4">
      <div className="text-xs font-semibold uppercase tracking-wider">
        PEMERINTAH KABUPATEN BANDUNG BARAT
      </div>
      <div className="text-sm font-bold">
        SD NEGERI LEBAKLEUNGSIR
      </div>
      <div className="text-[9px] text-gray-600">
        {data.alamatSekolah || 'Alamat : Kp. Lebakleungsir RT 02 RW 10 Desa Mekarjaya Kec. Cikalongwetan Kode Pos 40556'}
      </div>
      <div className="text-[9px] text-gray-600">
        Email: {data.emailSekolah || 'sdn.lebakleungsir@gmail.com'}
      </div>
    </div>
  )
}
```

```jsx
// components/templates/blocks/TabelFields.jsx
// Render form field berdasarkan config → bisa edit langsung
export default function TabelFields({ blockConfig, data, onChange, mode }) {
  return (
    <table className="w-full text-xs mb-4">
      <tbody>
        {blockConfig.fields.map(field => (
          <tr key={field.key} className="border-b border-dashed border-gray-200">
            <td className="w-40 py-1 font-medium text-gray-700">{field.label}</td>
            <td className="w-4 py-1">:</td>
            <td className="py-1">
              {mode === 'edit' ? (
                <EditableField field={field} value={data[field.key]} onChange={v => onChange(field.key, v)} />
              ) : (
                <span>{data[field.key] || <PlaceholderText />}</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// Field input yang menyesuaikan tipe data
function EditableField({ field, value, onChange }) {
  switch (field.type) {
    case 'textarea':
      return <textarea className="w-full border rounded px-2 py-1" value={value || ''} onChange={e => onChange(e.target.value)} rows={3} />
    case 'date':
      return <input type="date" className="border rounded px-2 py-1" value={value || ''} onChange={e => onChange(e.target.value)} />
    case 'select':
      return (
        <select className="border rounded px-2 py-1" value={value || ''} onChange={e => onChange(e.target.value)}>
          <option value="">Pilih...</option>
          {field.options.map(opt => <option key={opt}>{opt}</option>)}
        </select>
      )
    case 'number':
      return <input type="number" className="border rounded px-2 py-1 w-24 text-right" value={value || ''} onChange={e => onChange(e.target.value)} />
    default:
      return <input type="text" className="w-full border-b border-dashed border-blue-300 focus:border-blue-600 outline-none px-1 bg-transparent" value={value || ''} onChange={e => onChange(e.target.value)} />
  }
}
```

```jsx
// components/templates/blocks/TabelDinamis.jsx
// Untuk tabel honor, buku tamu — baris bisa ditambah/dihapus
export default function TabelDinamis({ blockConfig, data, onChange, mode }) {
  const rows = data.rows || []
  
  const addRow = () => {
    const newRow = {}
    blockConfig.columns.forEach(col => { newRow[col.key] = '' })
    onChange('rows', [...rows, { id: Date.now(), ...newRow }])
  }

  const updateRow = (id, key, value) => {
    onChange('rows', rows.map(r => r.id === id ? { ...r, [key]: value } : r))
  }

  const deleteRow = (id) => {
    onChange('rows', rows.filter(r => r.id !== id))
  }

  return (
    <div className="mb-4 overflow-x-auto">
      <table className="w-full text-xs border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            {blockConfig.columns.map(col => (
              <th key={col.key} style={{width: col.width + '%'}} className="border border-gray-300 px-2 py-1 text-left font-semibold">
                {col.label}
              </th>
            ))}
            {mode === 'edit' && <th className="border border-gray-300 px-2 py-1 w-10">#</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {blockConfig.columns.map(col => (
                <td key={col.key} className="border border-gray-300 px-2 py-1">
                  {mode === 'edit' ? (
                    <input 
                      type="text" 
                      className="w-full border-b border-dashed border-blue-200 outline-none bg-transparent"
                      value={row[col.key] || ''} 
                      onChange={e => updateRow(row.id, col.key, e.target.value)}
                    />
                  ) : (
                    col.format === 'currency' ? formatCurrency(row[col.key]) : row[col.key]
                  )}
                </td>
              ))}
              {mode === 'edit' && (
                <td className="border border-gray-300 px-2 py-1 text-center">
                  <button onClick={() => deleteRow(row.id)} className="text-red-500 hover:text-red-700 text-sm">
                    ✕
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {mode === 'edit' && (
        <button onClick={addRow} className="mt-2 text-xs text-blue-600 hover:text-blue-800">
          + Tambah Baris
        </button>
      )}
    </div>
  )
}
```

```jsx
// components/templates/blocks/SignatureFooter.jsx
const SIGNATURE_ROLES = {
  'kepala-sekolah': { label: 'Kepala Sekolah,', defaultName: 'BADRUDDIN, S.Ag.', defaultNip: 'NIP. 197405082014121002' },
  'bendahara': { label: 'Bendahara BOS,', defaultName: 'DEDE GUNAWAN, S.Pd.', defaultNip: 'NIP. 198507172020121003' },
  'pimpinan': { label: 'Pimpinan Rapat/Kepala Sekolah,', defaultName: 'WAHYUDIN, S.Pd.SD.', defaultNip: 'NIP. 197912222014121003' },
  'notulen': { label: 'Notulen,', defaultName: 'DEWI ERMIRAWATI, S.Pd.Gr.', defaultNip: 'NIP. 197607242022212011' },
  'ketua-gugus': { label: 'Ketua Gugus,', defaultName: 'WAHYUDIN, S.Pd.SD.', defaultNip: 'NIP. 197912222014121003' },
}

export default function SignatureFooter({ blockConfig, data, onChange, mode }) {
  return (
    <div className="mt-8">
      <div className="text-xs text-right mb-2">
        {data.tempat || 'Cikalongwetan'}, {data.tanggalCetak || formatDate(new Date())}
      </div>
      <div className="flex justify-between">
        {blockConfig.roles.map(role => {
          const roleConfig = SIGNATURE_ROLES[role]
          return (
            <div key={role} className="text-center w-48">
              <div className="text-xs mb-2">Mengetahui/Menyetujui</div>
              <div className="text-xs font-medium">{roleConfig.label}</div>
              <div className="h-16" /> {/* space for signature */}
              {mode === 'edit' ? (
                <>
                  <input 
                    className="text-xs text-center w-full border-b border-dashed border-blue-300 outline-none" 
                    value={data[`ttd_${role}_nama`] || roleConfig.defaultName}
                    onChange={e => onChange(`ttd_${role}_nama`, e.target.value)}
                  />
                  <input 
                    className="text-xs text-center w-full border-b border-dashed border-blue-300 outline-none text-gray-500" 
                    value={data[`ttd_${role}_nip`] || roleConfig.defaultNip}
                    onChange={e => onChange(`ttd_${role}_nip`, e.target.value)}
                  />
                </>
              ) : (
                <>
                  <div className="text-xs font-bold">{data[`ttd_${role}_nama`] || roleConfig.defaultName}</div>
                  <div className="text-xs text-gray-500">{data[`ttd_${role}_nip`] || roleConfig.defaultNip}</div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

---

## 3. Pola Clean Code yang Harus Diikuti

### 3.1. Separation of Concerns

```
📁 data/templateConfig.js     ← WHAT to render (konfigurasi)
📁 components/templates/      ← HOW to render (komponen)
📁 utils/templateHelpers.js   ← FORMATTING (currency, date, number to words)
📁 pages/dashboard/           ← WHERE to render (halaman, state management)
```

### 3.2. Convention yang Wajib

```js
// ✅ 1. Satu config per template — semua informasi di satu tempat
const sppd = { id, label, category, blocks, defaults }

// ✅ 2. Props naming konsisten
<TemplateEngine templateId="sppd" data={data} onDataChange={setData} mode="edit" />

// ✅ 3. Block type naming konsisten
//    'kop-surat' → KopSurat.jsx
//    'header' → HeaderDokumen.jsx
//    'table-fields' → TabelFields.jsx

// ✅ 4. Field key naming konsisten (camelCase)
//    nama, nip, jabatan, tanggal, jumlahPenerimaan

// ✅ 5. Data flow: satu arah
//    Page → TemplateEngine → Block → onChange → Page → data baru → re-render
```

### 3.3. Error Handling & Edge Cases

```jsx
// 1. Template tidak ditemukan
if (!config) return (
  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
    ⚠️ Template "{templateId}" belum tersedia. 
    <button onClick={() => onSetTemplate('default')} className="underline ml-2">Gunakan template default</button>
  </div>
)

// 2. Field belum diisi
function PlaceholderText() {
  return <span className="text-gray-300 italic">[isi {field.label}]</span>
}

// 3. Data kosong untuk tabel dinamis
{rows.length === 0 && (
  <div className="text-center py-8 text-gray-400">
    <span className="material-symbols-outlined text-3xl">table_rows</span>
    <p>Belum ada data. Klik "+ Tambah Baris" untuk menambahkan.</p>
  </div>
)}

// 4. Loading state
if (!data) return <div className="animate-pulse h-96 bg-gray-100 rounded" />

// 5. Bound input validation
function formatCurrency(value) {
  if (!value || isNaN(value)) return 'Rp0'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
}
```

### 3.4. CSS Print — Hasil Cetak Sempurna

```css
/* index.css — print styles */
@media print {
  body * { visibility: hidden; }
  .print-container, .print-container * { visibility: visible; }
  .print-container { 
    position: absolute; 
    left: 0; top: 0; 
    width: 210mm; /* A4 */
    padding: 20mm 25mm;
  }
  .print-container .edit-mode-only { display: none !important; }
  @page { 
    size: A4; 
    margin: 0; 
  }
}

/* preview — seperti kertas */
.preview-container {
  width: 210mm;
  min-height: 297mm;
  padding: 20mm 25mm;
  background: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  font-family: 'Times New Roman', serif; /* font standar dokumen */
  font-size: 12pt;
  line-height: 1.5;
}
```

### 3.5. Developer Documentation in Code

```jsx
/**
 * TemplateEngine — Universal Document Template Renderer
 * 
 * Cara pakai:
 * ```jsx
 * <TemplateEngine templateId="sppd" data={formData} onDataChange={setFormData} />
 * ```
 * 
 * Cara nambah template baru:
 * 1. Buka data/templateConfig.js
 * 2. Tambah entry baru dengan id unik
 * 3. Tentukan blocks: kop-surat, header, table-fields, signature, dll
 * 4. Selesai! Engine akan render otomatis
 * 
 * Data flow:
 * User input → onChange → page state → data props → TemplateEngine → blocks → DOM
 * 
 * Block types yang tersedia:
 * - kop-surat      : Header pemerintah + sekolah
 * - header         : Judul dokumen + nomor
 * - table-fields   : Form field key-value (Nama: ...)
 * - table-dinamis  : Tabel dengan baris dinamis (Honor, Buku Tamu)
 * - info-keuangan  : Program, Kegiatan, Kode Rekening
 * - poin-pembahasan: Notulen poin-poin
 * - uraian-kegiatan: Text area bebas
 * - signature      : Tanda tangan pejabat
 */
```

---

## 4. Perbandingan dengan Alternatif Lain

| Kriteria | Opsi A (Template Engine) | 26 Komponen Terpisah | Library DOCX generate |
|----------|:------------------------:|:--------------------:|:---------------------:|
| **Jumlah file** | ~8 file | ~30 file | ~35 file |
| **Tambah template baru** | Edit JSON (5 menit) | Buat file baru (2 jam) | Buat file + deklarasi tabel (3 jam) |
| **Ubah format semua template** | Edit 1-3 block | Edit 26 file | Edit 26 file |
| **Developer baru paham** | ✅ Lihat JSON config | ❌ Baca 26 komponen | ❌ Baca library API |
| **Weight** | ~15KB (komponen + config) | ~50KB | ~1MB (library) |
| **Akurasi cetak** | Sangat baik (CSS print) | Sangat baik | Sempurna (DOCX asli) |
| **Interaktif real-time** | ✅ | ✅ | ❌ (generate dulu) |
| **Print browser** | ✅ | ✅ | ❌ (export file) |

---

## 5. Kesimpulan & Rekomendasi

### 🏆 Arsitektur Final

```
src/
├── components/
│   └── templates/
│       ├── TemplateEngine.jsx     ← Universal renderer (100 baris)
│       ├── blocks/                ← Atomic components
│       │   ├── index.js           ← Re-export semua block
│       │   ├── KopSurat.jsx       ← 30 baris
│       │   ├── HeaderDokumen.jsx  ← 30 baris
│       │   ├── TabelFields.jsx    ← 60 baris
│       │   ├── TabelDinamis.jsx   ← 100 baris
│       │   ├── InfoKeuangan.jsx   ← 30 baris
│       │   ├── PoinPembahasan.jsx ← 40 baris
│       │   ├── UraianKegiatan.jsx ← 30 baris
│       │   ├── SignatureFooter.jsx ← 80 baris
│       │   └── EditableField.jsx  ← 50 baris
│       └── index.js              ← export { TemplateEngine }
├── data/
│   ├── templateConfig.js         ← ~50 baris per template × 26 template = ~1300 baris
│   ├── signatureRoles.js         ← Mapping role → nama default
│   └── sekolahData.js            ← Data default sekolah
├── utils/
│   └── templateHelpers.js        ← formatCurrency, formatDate, numberToWords
└── pages/
    └── dashboard/
        └── DokumenSPJPage.jsx    ← Modal: form + TemplateEngine (mode="edit") + cetak (mode="print")
```

### Aturan untuk Developer Selanjutnya

1. **Ingin nambah template baru?** → Buka `data/templateConfig.js`, tambah 1 entry JSON
2. **Ingin ubah format kop surat?** → Edit `components/templates/blocks/KopSurat.jsx` — semua template berubah
3. **Ingin tambah field input baru?** → Tambah di config `fields: [...]`, block otomatis render
4. **Ingin ganti font cetak?** → Edit CSS `@media print` di `index.css`
5. **Ingin custom satu template?** → Set `customComponent: true` di config, buat komponen terpisah

### Total Estimasi Development

| Komponen | Estimasi |
|----------|----------|
| Template Engine + Blocks (8 file) | 2 hari |
| Config untuk 26 template | 2 hari |
| Integrasi modal + state management | 1 hari |
| CSS print + testing | 1 hari |
| **Total** | **~6 hari** |

### Key Takeaways untuk Developer

1. **Config-driven > Component-driven** — 1 engine beats 26 components
2. **JSON is your friend** — non-developer pun bisa edit template config
3. **Atomic blocks** — sekali buat, dipakai semua template
4. **Default values** — template bisa langsung dilihat tanpa isi form
5. **Mode edit vs print** — komponen yang sama, behaviour beda
6. **Documentation in code** — JSDoc + README untuk developer selanjutnya
