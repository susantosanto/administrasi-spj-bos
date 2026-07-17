/**
 * aiHelper.js — AI Agent untuk Fitur "Ask to AI"
 *
 * ── PENDEKATAN SIMPEL ─────────────────────────────────────────
 * Langsung baca data BKU dari localStorage → format compact → kirim ke AI
 * TANPA query engine — lebih simpel, lebih akurat, lebih stabil.
 *
 * Flow:
 *   1. Cek keyword pertanyaan → tentukan data apa yang perlu
 *   2. Baca data langsung dari localStorage (0 TOKEN)
 *   3. Format compact (ringkasan per bulan + detail terbatas)
 *   4. Kirim data + pertanyaan ke AI (1 call, ~1000-2000 TOKEN)
 *   5. Jika AI gagal → fallback jawab langsung dari data (0 TOKEN)
 *
 * ── MULTI-PROVIDER ────────────────────────────────────────────
 * Primary   : Cerebras (gpt-oss-120b)
 * Fallback  : Groq (llama-3.1-8b-instant) — jika Cerebras error
 *
 * API Keys: VITE_CEREBRAS_API_KEY & VITE_GROQ_API_KEY di .env
 */

// ═══════════════════════════════════════════════════════════════════════════
// 0. IMPORT Referensi Kode
// ═══════════════════════════════════════════════════════════════════════════

import { lookupKegiatan, getNamaKegiatan, lookupRekening, getNamaRekening, KEGIATAN_BOS, REKENING_MAP } from '../data/kodeReferensi'

// ═══════════════════════════════════════════════════════════════════════════
// 1. KONFIGURASI
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
  models: {
    cerebras: import.meta.env.VITE_CEREBRAS_MODEL || 'gpt-oss-120b',
    groq: import.meta.env.VITE_AI_MODEL || 'llama-3.1-8b-instant',
  },
  apiKeys: {
    cerebras: import.meta.env.VITE_CEREBRAS_API_KEY || '',
    groq: import.meta.env.VITE_GROQ_API_KEY || '',
  },
  endpoints: {
    cerebras: '/api/cerebras/chat/completions',
    groq: '/api/groq/chat/completions',
  },
  maxOutputTokens: 800,
}

const BULAN_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

// ═══════════════════════════════════════════════════════════════════════════
// 2a. KODE REKENING MAP — Mapping kode rekening → kategori
//     Digunakan untuk mengelompokkan transaksi BKU
// ═══════════════════════════════════════════════════════════════════════════

const KODE_REKENING_MAP = [
  // Honor & Gaji
  { pattern: /^5\.1\.02\.02\.01\.0013$/, label: 'Honor Guru', key: 'HONOR_GURU' },
  { pattern: /^5\.1\.02\.02\.01\.0061$/, label: 'Perpustakaan', key: 'HONOR_PERpus' },
  { pattern: /^5\.1\.02\.02\.01\.0063$/, label: 'Pulsa/Internet', key: 'INTERNET' },
  { pattern: /^5\.1\.02\.02/, label: 'Honor Lainnya', key: 'HONOR' },

  // Transport
  { pattern: /^5\.1\.02\.04\.01\.0003$/, label: 'Transport Rapat', key: 'TRANSPORT_RAPAT' },
  { pattern: /^5\.1\.02\.04/, label: 'Transport Lainnya', key: 'TRANSPORT' },

  // Makan & Minum
  { pattern: /^5\.1\.02\.01\.01\.0052$/, label: 'Makan & Minum', key: 'MAMIN' },

  // ATK & Cetak
  { pattern: /^5\.1\.02\.01\.01\.0024$/, label: 'ATK', key: 'ATK' },
  { pattern: /^5\.1\.02\.01\.01\.0025$/, label: 'Bahan Cetak', key: 'CETAK' },

  // Listrik
  { pattern: /^5\.2\.05\.01\.01\.0001$/, label: 'Listrik', key: 'LISTRIK' },
]

function detectKategori(kodeRekening) {
  if (!kodeRekening) return null
  for (const m of KODE_REKENING_MAP) {
    if (m.pattern.test(kodeRekening)) return m
  }
  return null
}

// ═══════════════════════════════════════════════════════════════════════════
// 2b. CONTEXT MAP — Untuk quick chips di AskAIPanel.jsx
// ═══════════════════════════════════════════════════════════════════════════

const CONTEXT_MAP = {
  dashboard: {
    title: 'Dashboard', icon: 'home',
    quickChips: [
      { icon: '📊', label: 'Ringkasan keuangan', question: 'Beri ringkasan keuangan bulan ini' },
      { icon: '✅', label: 'Progress LPJ', question: 'Berapa persen progress LPJ?' },
    ],
  },
  bku: {
    title: 'Data BKU', icon: 'account_balance',
    quickChips: [
      { icon: '📊', label: 'Total pengeluaran Januari', question: 'Berapa total pengeluaran bulan Januari?' },
      { icon: '📊', label: 'Total pengeluaran Februari', question: 'Berapa total pengeluaran bulan Februari?' },
      { icon: '💰', label: 'Total penerimaan', question: 'Berapa total penerimaan BOSP tahun ini?' },
    ],
  },
  'dokumen-lpj': {
    title: 'Dokumen LPJ', icon: 'description',
    quickChips: [
      { icon: '🤔', label: 'Template honor guru?', question: 'Template mana untuk honor guru?' },
      { icon: '📑', label: 'Cara buat SPPD?', question: 'Bagaimana cara membuat SPPD?' },
    ],
  },
  'data-guru': {
    title: 'Data Guru & Tendik', icon: 'groups',
    quickChips: [
      { icon: '👤', label: 'Jumlah guru honorer', question: 'Berapa jumlah guru honorer?' },
      { icon: '📊', label: 'Statistik status guru', question: 'Tunjukkan statistik status guru' },
    ],
  },
  'data-sekolah': {
    title: 'Data Sekolah', icon: 'school',
    quickChips: [
      { icon: '🏫', label: 'Siapa kepala sekolah?', question: 'Siapa kepala sekolah?' },
      { icon: '👤', label: 'Siapa bendahara?', question: 'Siapa bendahara?' },
    ],
  },
}

const DEFAULT_CONTEXT = {
  title: 'Aplikasi', icon: 'smart_toy',
  quickChips: [
    { icon: '📊', label: 'Total pengeluaran', question: 'Berapa total pengeluaran?' },
    { icon: '👤', label: 'Jumlah guru honorer', question: 'Berapa jumlah guru honorer?' },
    { icon: '🏫', label: 'Data sekolah', question: 'Tampilkan data sekolah' },
    { icon: '💡', label: 'Apa itu BOSP?', question: 'Apa itu dana BOSP?' },
    { icon: '📋', label: 'Cara buat LPJ', question: 'Bagaimana cara membuat LPJ?' },
  ],
}

export function detectContext(pathname) {
  const cleanPath = pathname.replace('/dashboard/', '').replace('/dashboard', '') || 'dashboard'
  for (const [key, ctx] of Object.entries(CONTEXT_MAP)) {
    if (cleanPath === key || cleanPath.startsWith(key)) return { key, ...ctx }
  }
  return { key: 'default', ...DEFAULT_CONTEXT }
}

export { CONTEXT_MAP, DEFAULT_CONTEXT }

// ═══════════════════════════════════════════════════════════════════════════
// 3. BACA DATA LANGSUNG DARI LOCALSTORAGE
// ═══════════════════════════════════════════════════════════════════════════

const PREFIX = 'spj_'

function storageGet(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

/**
 * Format data BKU compact — ringkasan per bulan + per kategori (kode rekening)
 * Semua transaksi dikelompokkan berdasarkan kode rekening!
 */
function formatBkuCompact() {
  const data = storageGet('bku_data')
  if (!data?.transactions?.length) return null

  const txs = data.transactions
  const lines = []
  const MONTHS = [1,2,3,4,5,6,7,8,9,10,11,12]

  // ─── RINGKASAN PER BULAN ───
  for (const b of MONTHS) {
    const bulanTx = txs.filter(t => t.bulan === b)
    if (bulanTx.length === 0) continue
    const nama = BULAN_NAMES[b - 1]
    lines.push(`─── ${nama} ───`)

    // Penerimaan & Pengeluaran total
    const penerimaan = bulanTx.filter(t => t.tipe === 'PENERIMAAN_BOSP').reduce((s, t) => s + (Number(t.penerimaan) || 0), 0)
    const pengeluaran = bulanTx.filter(t => t.tipe === 'PEMBAYARAN').reduce((s, t) => s + (Number(t.pengeluaran) || 0), 0)
    const pembayaranCount = bulanTx.filter(t => t.tipe === 'PEMBAYARAN').length
    const penerimaanCount = bulanTx.filter(t => t.tipe === 'PENERIMAAN_BOSP').length

    if (penerimaan > 0) lines.push(`  PENERIMAAN: Rp ${penerimaan.toLocaleString('id-ID')} (${penerimaanCount} transaksi)`)
    if (pengeluaran > 0) lines.push(`  PENGELUARAN: Rp ${pengeluaran.toLocaleString('id-ID')} (${pembayaranCount} transaksi)`)

    // Rincian per kategori (kode rekening)
    const byKategori = {}
    bulanTx.filter(t => t.tipe === 'PEMBAYARAN' && t.kodeRekening).forEach(tx => {
      const kat = detectKategori(tx.kodeRekening)
      const key = kat ? kat.label : `Lainnya (${tx.kodeRekening})`
      if (!byKategori[key]) byKategori[key] = { total: 0, count: 0, kegiatan: new Set() }
      byKategori[key].total += Number(tx.pengeluaran) || 0
      byKategori[key].count++
      // Tambah kode kegiatan untuk konteks
      if (tx.kodeKegiatan) byKategori[key].kegiatan.add(tx.kodeKegiatan.replace(/\.$/, ''))
    })

    if (Object.keys(byKategori).length > 0) {
      lines.push(`  RINCIAN PENGELUARAN:`)
      for (const [kategori, info] of Object.entries(byKategori).sort()) {
        const kegiatanList = [...info.kegiatan].slice(0, 3)
        const kegiatanStr = kegiatanList.length > 0 
          ? ` (keg: ${kegiatanList.map(k => getNamaKegiatan(k) || k).join(', ')})`
          : ''
        lines.push(`    - ${kategori}: Rp ${info.total.toLocaleString('id-ID')} (${info.count} tx)${kegiatanStr}`)
      }
    }

    // Saldo Awal
    const saldoTx = bulanTx.find(t => t.tipe === 'SALDO_AWAL')
    if (saldoTx) lines.push(`  SALDO AWAL: Rp ${Number(saldoTx.pengeluaran || saldoTx.saldo || 0).toLocaleString('id-ID')}`)
  }

  // ─── TOTAL KESELURUHAN ───
  const totalPenerimaan = txs.filter(t => t.tipe === 'PENERIMAAN_BOSP').reduce((s, t) => s + (Number(t.penerimaan) || 0), 0)
  const totalPengeluaran = txs.filter(t => t.tipe === 'PEMBAYARAN').reduce((s, t) => s + (Number(t.pengeluaran) || 0), 0)

  lines.push(`\n─── REKAP TOTAL ───`)
  lines.push(`  TOTAL PENERIMAAN: Rp ${totalPenerimaan.toLocaleString('id-ID')}`)
  lines.push(`  TOTAL PENGELUARAN: Rp ${totalPengeluaran.toLocaleString('id-ID')}`)

  // Total per kategori (semua bulan)
  const totalByKategori = {}
  txs.filter(t => t.tipe === 'PEMBAYARAN' && t.kodeRekening).forEach(tx => {
    const kat = detectKategori(tx.kodeRekening)
    const key = kat ? kat.label : `Lainnya (${tx.kodeRekening})`
    if (!totalByKategori[key]) totalByKategori[key] = { total: 0, count: 0 }
    totalByKategori[key].total += Number(tx.pengeluaran) || 0
    totalByKategori[key].count++
  })

  lines.push(`\n  TOTAL PER KATEGORI:`)
  for (const [kategori, info] of Object.entries(totalByKategori).sort()) {
    lines.push(`    - ${kategori}: Rp ${info.total.toLocaleString('id-ID')} (${info.count} tx)`)
  }

  lines.push(`\n  Total transaksi: ${txs.length}`)

  return lines.join('\n')
}

/**
 * Format detail transaksi per bulan — dengan kategori dari kode rekening
 */
function formatBkuDetail() {
  const data = storageGet('bku_data')
  if (!data?.transactions?.length) return null

  const txs = data.transactions
  const lines = []

  const MONTHS = [1,2,3,4,5,6,7,8,9,10,11,12]
  let totalDetail = 0
  const MAX_DETAIL = 100

  for (const b of MONTHS) {
    const bulanTx = txs.filter(t => t.bulan === b)
    if (bulanTx.length === 0) continue
    const nama = BULAN_NAMES[b - 1]
    lines.push(`\n─── ${nama} (${bulanTx.length} transaksi) ───`)

    for (const tx of bulanTx.slice(0, 20)) {
      const kat = detectKategori(tx.kodeRekening)
      const kategoriLabel = kat ? kat.label : '-' 
      let nominal = '-'
      if (tx.tipe === 'PEMBAYARAN') nominal = `Rp ${Number(tx.pengeluaran).toLocaleString('id-ID')}`
      else if (tx.tipe === 'PENERIMAAN_BOSP') nominal = `Rp ${Number(tx.penerimaan).toLocaleString('id-ID')}`
      else if (tx.tipe === 'SALDO_AWAL') nominal = `Rp ${Number(tx.pengeluaran).toLocaleString('id-ID')}`
      const uraian = (tx.uraian || '').substring(0, 40)
      // Tambah nama kegiatan dari kode kegiatan
      const namaKeg = tx.kodeKegiatan ? getNamaKegiatan(tx.kodeKegiatan) : null
      const kegiatanStr = namaKeg && namaKeg !== tx.kodeKegiatan ? ` | kegiatan: ${namaKeg.substring(0, 40)}` : ''
      lines.push(`  [${tx.tipe}] ${tx.tanggalStr || '-'} | ${kategoriLabel} | ${uraian} | ${nominal} | kode: ${tx.kodeRekening || '-'}${kegiatanStr}`)
      totalDetail++
    }
    if (totalDetail >= MAX_DETAIL) {
      lines.push(`\n... dan seterusnya (total ${txs.length} transaksi)`)
      return lines.join('\n')
    }
  }

  return lines.join('\n')
}

function formatGuruCompact() {
  const data = storageGet('data_guru')
  if (!data?.length) return null

  const honorer = data.filter(g => g.status?.toLowerCase().includes('honorer')).length
  return `Jumlah guru: ${data.length} orang (Honorer: ${honorer} orang)`
}

function formatTendikCompact() {
  const data = storageGet('data_tendik')
  if (!data?.length) return null
  return `Jumlah tendik: ${data.length} orang`
}

function formatSekolahCompact() {
  const data = storageGet('data_sekolah')
  if (!data) return null

  const ks = data.pejabat?.ks?.nama || data.pejabat?.ks || '-'
  const bendahara = data.pejabat?.bendahara?.nama || data.pejabat?.bendahara || '-'
  return `Nama: ${data.nama || '-'} | NPSN: ${data.npsn || '-'} | Kepsek: ${ks} | Bendahara: ${bendahara}`
}

/**
 * Kumpulkan semua data yang relevan berdasarkan pertanyaan
 */
function collectRelevantData(question) {
  const q = question.toLowerCase()
  const parts = []

  // Referensi Kegiatan — untuk pertanyaan tentang kode kegiatan / referensi
  if (q.includes('kegiatan') || q.includes('kode kegiatan') || q.includes('referensi') ||
      q.includes('07.12') || q.includes('05.08') || q.includes('03.03') || q.includes('06.05')) {
    parts.push('=== REFERENSI KEGIATAN ===')
    parts.push(`Total ${KEGIATAN_BOS.length} kode kegiatan tersedia.`)
    const found = KEGIATAN_BOS.filter(k => q.includes(k.kode) || q.includes(k.snp.toLowerCase()) || q.includes(k.komponen.toLowerCase().split(' ')[0]))
    if (found.length > 0) {
      found.slice(0, 5).forEach(k => {
        parts.push(`  ${k.kode}: ${k.uraian} (${k.snp} - ${k.komponen})`)
      })
    }
    parts.push('')
  }

  // Referensi Kode Rekening
  if (q.includes('rekening') || q.includes('kode rekening') || q.includes('5.1.')) {
    parts.push('=== REFERENSI REKENING ===')
    parts.push(`Total ${REKENING_MAP.length} kode rekening tersedia.`)
    const found = REKENING_MAP.filter(r => q.includes(r.kode) || q.includes(r.kelompok.toLowerCase().split(' ')[0]))
    if (found.length > 0) {
      found.slice(0, 5).forEach(r => {
        parts.push(`  ${r.kode}: ${r.label} (${r.kelompok})`)
      })
    }
    parts.push('')
  }

  // Data BKU — untuk pertanyaan keuangan/transaksi
  if (q.includes('pengeluaran') || q.includes('penerimaan') || q.includes('pajak') ||
      q.includes('total') || q.includes('transaksi') || q.includes('bku') ||
      q.includes('saldo') || q.includes('bulan') || q.includes('januari') ||
      q.includes('februari') || q.includes('maret') || q.includes('april') ||
      q.includes('mei') || q.includes('juni') || q.includes('juli') ||
      q.includes('agustus') || q.includes('september') || q.includes('oktober') ||
      q.includes('november') || q.includes('desember') || q.includes('anggaran') ||
      q.includes('belanja') || q.includes('realisasi') || q.includes('keuangan') ||
      q.includes('dana') || q.includes('bos') || q.includes('bosp') ||
      q.includes('honor') || q.includes('transport') || q.includes('mamin')) {
    // Ringkasan per bulan — cukup untuk pertanyaan total/aggregate
    const ringkasan = formatBkuCompact()
    if (ringkasan) parts.push('=== RINGKASAN BULANAN BKU ===', ringkasan, '')

    // Detail transaksi — untuk pertanyaan spesifik (pajak, honor, dll)
    if (q.includes('pajak') || q.includes('honor') || q.includes('transport') ||
        q.includes('daftar') || q.includes('rincian') || q.includes('uraian') ||
        q.includes('detail') || q.includes('apa saja')) {
      const detail = formatBkuDetail()
      if (detail) parts.push('=== DETAIL TRANSAKSI BKU ===', detail, '')
    }
  }

  // Data Guru — untuk pertanyaan tentang guru/pegawai
  if (q.includes('guru') || q.includes('honorer') || q.includes('tendik') ||
      q.includes('pegawai') || q.includes('ptk')) {
    const guru = formatGuruCompact()
    if (guru) parts.push('=== DATA GURU ===', guru, '')
    const tendik = formatTendikCompact()
    if (tendik) parts.push('=== DATA TENDIK ===', tendik, '')
  }

  // Data Sekolah — untuk pertanyaan profil sekolah
  if (q.includes('sekolah') || q.includes('kepsek') || q.includes('kepala sekolah') ||
      q.includes('bendahara') || q.includes('npsn') || q.includes('alamat') ||
      q.includes('profil')) {
    const sklh = formatSekolahCompact()
    if (sklh) parts.push('=== DATA SEKOLAH ===', sklh, '')
  }

  return parts.length > 0 ? parts.join('\n') : null
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. PROMPTS
// ═══════════════════════════════════════════════════════════════════════════

const SYSTEM_PROMPT = `Kamu adalah asisten AI untuk aplikasi LPJ BOS/BOSP Indonesia.

TUGAS: Jawab pertanyaan user berdasarkan DATA NYATA yang diberikan di bawah.

=== PANDUAN MEMBACA DATA BKU ===
Data BKU terdiri dari beberapa jenis transaksi:
1. PENERIMAAN_BOSP — dana masuk (dari BBU)
2. PEMBAYARAN — belanja/pengeluaran ke pihak ketiga (punya BPU/BNU)
3. SETOR_PAJAK — setoran PPh/Pajak ke kas negara (tanpa BPU/BNU)
4. PUNGUT_PPH — penerimaan dari pungutan PPh (penerimaan, bukan pengeluaran)
5. SALDO_AWAL — saldo awal kas
6. TARIK_TUNAI — penarikan tunai dari bank
7. BUNGA_BANK, PAJAK_BUNGA — bunga bank dan pajaknya

PENTING: 
- "PENGELUARAN" atau "PEMBAYARAN" = SEMUA transaksi yang punya nilai pengeluaran > 0 (termasuk SETOR_PAJAK, TARIK_TUNAI, dll)
- BUKAN hanya tipe PEMBAYARAN saja! SETOR_PAJAK (PPh23) juga termasuk pengeluaran riil
- "PENERIMAAN" = SEMUA transaksi dengan penerimaan > 0

Semua transaksi PENGELUARAN dikelompokkan berdasarkan KODE REKENING.
Kode rekening menentukan kategori belanja:

KATEGORI BERDASARKAN KODE REKENING:
- 5.1.02.02.01.0013 → Honor Guru
- 5.1.02.02.01.0061 → Perpustakaan
- 5.1.02.02.01.0063 → Pulsa/Internet
- 5.1.02.04.01.0003 → Transport Rapat
- 5.1.02.01.01.0052 → Makan & Minum (Mamin)
- 5.1.02.01.01.0024 → ATK
- 5.1.02.01.01.0025 → Bahan Cetak
- 5.2.05.01.01.0001 → Listrik

CARA MENGIDENTIFIKASI PAJAK/PPh:
- Pajak TIDAK diidentifikasi dari kode rekening (kode rekening tidak konsisten)
- Pajak diidentifikasi dari uraian transaksi yang mengandung "setor pph", "setor pajak", atau "pph 23"
- Cari di tipe PEMBAYARAN ATAU tipe SETOR_PAJAK (keduanya mungkin)
- Pajak yang dimaksud user adalah PPh23, bukan PPh21

Gunakan kode rekening untuk menjawab pertanyaan tentang kategori tertentu!

ATURAN:
- Bahasa Indonesia, RINGKAS (maks 3 kalimat)
- Sertakan angka spesifik dalam Rp (rupiah)
- Jika tidak yakin dengan data, tulis apa yang ada di data
- JANGAN membuat data palsu
- JANGAN menyebut "Asisten" atau "AI" — jawab langsung`

// ═══════════════════════════════════════════════════════════════════════════
// 4b. GENERAL PROMPT — Untuk pertanyaan umum (non-BKU)
// ═══════════════════════════════════════════════════════════════════════════

const GENERAL_PROMPT = `Kamu adalah asisten AI khusus untuk operator sekolah di Indonesia.

KEPRIBADIAN:
- Ramah, sabar, dan membantu seperti rekan kerja yang berpengalaman
- Mengerti dunia pendidikan dan administrasi sekolah di Indonesia
- Selalu menggunakan bahasa Indonesia yang baik dan santun
- Tidak menggurui, tapi memberi penjelasan yang mudah dipahami

KEAHLIAN:
1. DANA BOSP — bisa menjelaskan BOS, BOSP, ARKAS, SIPLAH, LPJ, dan semua hal terkait keuangan sekolah
2. ADMINISTRASI SEKOLAH — surat-menyurat, SK, notulen rapat, SPPD, dokumen guru
3. DAPODIK — mengerti tentang data pokok pendidikan dan GTK
4. PAJAK — PPh21, PPh23, PPN untuk keperluan sekolah
5. PELAPORAN — LPJ, SPJ, RKAS, realisasi anggaran, dan pertanggungjawaban

KEMAMPUAN:
- Bisa diskusi santai dan serius sesuai kebutuhan
- Bisa bertanya balik untuk klarifikasi
- Bisa memberikan saran praktis untuk masalah administrasi sekolah
- Bisa menjelaskan konsep yang rumit dengan cara sederhana
- Jika ada data BKU yang tersimpan, kamu bisa akses informasinya jika ditanya

CONTOH YANG BISA KAMU JAWAB:
- "Apa itu dana BOSP?" → jelaskan BOSP secara lengkap
- "Bagaimana cara membuat LPJ?" → beri panduan langkah demi langkah
- "Apa itu kode rekening 5.1.02.01.01.0052?" → jelaskan (makan & minum rapat)
- "Siapa presiden Indonesia?" → jawab dengan pengetahuan umum
- "Bantu saya buat surat tugas" → bantu dengan template
- "Apa itu SIPLAH?" → jelaskan sistem SIPLAH

ATURAN:
- Jawab dengan ramah dan informatif
- Bahasa Indonesia, maksimal 5-7 kalimat untuk jawaban singkat
- Boleh lebih panjang jika diminta detail
- Jika ditanya di luar keahlianmu, akui saja dengan jujur
- JANGAN menyebut dirimu "Asisten" atau "AI" — cukup jawab langsung
- JANGAN membuat data palsu tentang keuangan — jika tidak tahu, bilang tidak tahu`

// ═══════════════════════════════════════════════════════════════════════════
// 5. API CALL — Multi-Provider: Cerebras → Groq → null
// ═══════════════════════════════════════════════════════════════════════════

async function callProvider(endpoint, apiKey, model, messages) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: CONFIG.maxOutputTokens,
      temperature: 0.3,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 150)}`)
  }

  const data = await res.json()
  return data?.choices?.[0]?.message?.content || ''
}

async function callCerebras(messages) {
  const key = CONFIG.apiKeys.cerebras
  if (!key) throw new Error('API Key Cerebras belum diatur.')
  return callProvider(CONFIG.endpoints.cerebras, key, CONFIG.models.cerebras, messages)
}

async function callGroq(messages) {
  const key = CONFIG.apiKeys.groq
  if (!key) throw new Error('API Key Groq belum diatur.')
  return callProvider(CONFIG.endpoints.groq, key, CONFIG.models.groq, messages)
}

async function callAI(messages) {
  // 1. Coba Cerebras dulu
  if (CONFIG.apiKeys.cerebras) {
    try {
      const result = await callCerebras(messages)
      if (result) return result
    } catch (err) {
      console.warn('⚠️ Cerebras gagal, fallback ke Groq:', err.message)
    }
  }

  // 2. Fallback ke Groq
  if (CONFIG.apiKeys.groq) {
    try {
      return await callGroq(messages)
    } catch (err) {
      console.warn('⚠️ Groq juga gagal:', err.message)
      throw err
    }
  }

  return null
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. MAIN — askAI()
//
// Flow SIMPEL:
//   1. Deteksi keyword → kumpulkan data relevan dari localStorage
//   2. Format data compact → gabung dengan pertanyaan
//   3. Kirim ke AI (1 call)
//   4. Jika AI gagal → jawab langsung dari data (0 token)
// ═══════════════════════════════════════════════════════════════════════════

export async function askAI(question) {
  if (!question?.trim()) return { answer: 'Silakan ketik pertanyaan Anda.' }

  question = question.trim()
  console.log('🤖 askAI:', question)

  // 1. Kumpulkan data relevan dari localStorage
  const dataStr = collectRelevantData(question)

  if (dataStr) {
    // ── Coba fallback lokal DULU untuk keyword spesifik (0 token, lebih akurat) ──
    const q = question.toLowerCase()
    const knownKeywords = ['pajak', 'pph', 'pengeluaran', 'penerimaan', 'belanja', 'pemasukan', 'pembayaran']
    const hasKnownKeyword = knownKeywords.some(k => q.includes(k))
    
    if (hasKnownKeyword) {
      const localAnswer = fallbackLocalAnswer(question)
      if (localAnswer) return { answer: localAnswer }
    }

    // ── Kirim ke AI ──
    const msgs = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `${dataStr}\n\nPertanyaan: ${question}\n\nJawab berdasarkan data di atas. Ringkas.`,
      },
    ]

    try {
      const answer = await callAI(msgs)
      if (answer) return { answer: formatAnswer(answer) }
    } catch (err) {
      console.warn('AI gagal:', err.message)
    }

    // Fallback akhir: coba fallback lokal untuk semua (jika AI gagal)
    const fallback = fallbackLocalAnswer(question)
    if (fallback) return { answer: fallback }
  }

  // 2. Tidak butuh data spesifik (pertanyaan umum)
  try {
    const msgs = [
      { role: 'system', content: GENERAL_PROMPT },
      { role: 'user', content: question },
    ]
    const answer = await callAI(msgs)
    return { answer: formatAnswer(answer || 'Maaf, belum bisa menjawab.') }
  } catch (error) {
    console.error('Ask AI error:', error)
    return { answer: `❌ Gagal: ${error.message || 'Coba lagi.'}` }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 6b. FALLBACK LOKAL — Jawab langsung dari data tanpa AI (0 TOKEN)
// ═══════════════════════════════════════════════════════════════════════════

function formatAnswer(text) {
  if (!text) return 'Maaf, tidak bisa menjawab.'
  return text.trim().replace(/^(Asisten|AI|\:)+\s*/i, '')
}

function fallbackLocalAnswer(question) {
  const q = question.toLowerCase()
  const data = storageGet('bku_data')
  const txs = data?.transactions
  if (!txs?.length) return 'Data BKU belum tersedia. Upload data terlebih dahulu.'

  // Deteksi bulan
  let bulanNum = null
  for (let i = 0; i < BULAN_NAMES.length; i++) {
    if (q.includes(BULAN_NAMES[i].toLowerCase())) { bulanNum = i + 1; break }
  }

  // Filter by bulan and tipe
  const filtered = txs.filter(tx => {
    if (bulanNum && tx.bulan !== bulanNum) return false
    return true
  })

  if (filtered.length === 0) {
    if (bulanNum) return `Data transaksi untuk bulan ${BULAN_NAMES[bulanNum - 1]} tidak ditemukan di BKU.`
    return 'Data transaksi tidak ditemukan di BKU.'
  }

  // Hitung total
  const totalPenerimaan = filtered.reduce((s, t) => s + (Number(t.penerimaan) || 0), 0)
  const totalPengeluaran = filtered.reduce((s, t) => s + (Number(t.pengeluaran) || 0), 0)

  // Jawab spesifik berdasarkan keyword
  if (q.includes('pengeluaran') || q.includes('belanja') || q.includes('pembayaran')) {
    const bulanLabel = bulanNum ? BULAN_NAMES[bulanNum - 1] : 'semua bulan'
    // Hitung SEMUA transaksi dengan pengeluaran > 0 (termasuk SETOR_PAJAK, TARIK_TUNAI, dll)
    const txOut = filtered.filter(t => Number(t.pengeluaran) > 0)
    const total = txOut.reduce((s, t) => s + (Number(t.pengeluaran) || 0), 0)
    return `Total pengeluaran ${bulanLabel}: Rp ${total.toLocaleString('id-ID')} (${txOut.length} transaksi).`
  }

  if (q.includes('penerimaan') || q.includes('pemasukan')) {
    const bulanLabel = bulanNum ? BULAN_NAMES[bulanNum - 1] : 'semua bulan'
    return `Total penerimaan ${bulanLabel}: Rp ${totalPenerimaan.toLocaleString('id-ID')}.`
  }

  if (q.includes('pajak') || q.includes('pph')) {
    // Pajak/PPh23: deteksi dari uraian (kode rekening tidak konsisten)
    // Cari transaksi dengan uraian mengandung 'setor pph', 'setor pajak', 'pph 23', 'pajak'
    // Tipe: PEMBAYARAN (jika punya BPU/BNU) ATAU SETOR_PAJAK (jika tidak punya noBukti)
    const pajakTx = filtered.filter(t => {
      const u = (t.uraian || '').toLowerCase()
      const isPajak = u.includes('setor pph') || u.includes('setor pajak') || 
                      u.includes('pph 23') || u.includes('pajak')
      // Pengeluaran > 0 DAN tipe yang relevan
      return isPajak && t.pengeluaran > 0 && (t.tipe === 'PEMBAYARAN' || t.tipe === 'SETOR_PAJAK')
    })
    if (pajakTx.length > 0) {
      const totalPajak = pajakTx.reduce((s, t) => s + (Number(t.pengeluaran) || 0), 0)
      const bulanLabel = bulanNum ? BULAN_NAMES[bulanNum - 1] : 'semua bulan'
      
      // Pisah PPh21 vs PPh23 untuk detail
      const pph23 = pajakTx.filter(t => (t.uraian || '').toLowerCase().includes('23'))
      const total23 = pph23.reduce((s, t) => s + (Number(t.pengeluaran) || 0), 0)
      
      if (pph23.length > 0 && pph23.length === pajakTx.length) {
        return `Total PPh23 ${bulanLabel}: Rp ${total23.toLocaleString('id-ID')} (${pph23.length} transaksi).`
      }
      return `Total pajak ${bulanLabel}: Rp ${totalPajak.toLocaleString('id-ID')} (${pajakTx.length} transaksi).`
    }
    const bulanLabel = bulanNum ? `di bulan ${BULAN_NAMES[bulanNum - 1]}` : ''
    return `Tidak ada pembayaran pajak yang harus dibayar ${bulanLabel}.`
  }

  if (q.includes('total') || q.includes('semua')) {
    const bulanLabel = bulanNum ? BULAN_NAMES[bulanNum - 1] : 'semua bulan'
    return `Ringkasan ${bulanLabel}: Penerimaan Rp ${totalPenerimaan.toLocaleString('id-ID')}, Pengeluaran Rp ${totalPengeluaran.toLocaleString('id-ID')}, ${filtered.length} transaksi.`
  }

  return null // tidak bisa jawab lokal, perlu AI
}

// ═══════════════════════════════════════════════════════════════════════════
// 7. GENERATE RINGKASAN NOTULEN — Untuk dokumen Notula Rapat Mamin
// ═══════════════════════════════════════════════════════════════════════════

const RINGKASAN_NOTULEN_PROMPT = `Kamu adalah operator sekolah yang menulis notulen rapat.

TUGAS: Berdasarkan NAMA KEGIATAN yang diberikan, buat ringkasan poin pembahasan rapat yang REALISTIS dan sesuai untuk dokumen Notula Rapat di sekolah.

ATURAN:
- Bahasa Indonesia FORMAL
- Mulai dengan kalimat pembuka: "Rapat membahas tentang [kegiatan]..."
- Tulis 3-5 poin pembahasan menggunakan format: a. ... b. ... c. ...
- Tutup dengan: "Demikian ringkasan rapat ini dibuat untuk diketahui dan digunakan sebagaimana mestinya."
- TOTAL maksimal 7 baris
- JANGAN menyebut AI atau Asisten — seolah-olah ini ditulis notulen rapat sungguhan
- Jangan gunakan tanda bintang/asterisk (*) untuk markdown
- Gunakan format teks biasa saja`

export async function generateRingkasanNotulen(acara) {
  if (!acara?.trim()) return null

  const msgs = [
    { role: 'system', content: RINGKASAN_NOTULEN_PROMPT },
    { role: 'user', content: `Nama kegiatan: "${acara}"\n\nBuat ringkasan notulen rapat untuk kegiatan di atas.` },
  ]

  try {
    const raw = await callAI(msgs)
    if (!raw) return null
    return raw.trim().replace(/^(Asisten|AI|\:)+\s*/i, '')
  } catch (err) {
    console.warn('Gagal generate ringkasan notulen:', err.message)
    return null
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 8. EKSPOR
// ═══════════════════════════════════════════════════════════════════════════

export default { askAI, detectContext, CONTEXT_MAP, generateRingkasanNotulen }
