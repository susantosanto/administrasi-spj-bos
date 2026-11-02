/**
 * exportPajakExcel — Generate file Excel Laporan Rincian Pajak
 * Format persis identik dengan template/Contoh template Rincian Pajak Sekolah Dasar Negeri.xlsx
 * (sheet "SD_SMP", A4 landscape, 16 kolom A..P, header 2 tingkat, rumus SUM).
 *
 * Sumber: xlsx.js (SheetJS) — sudah ada di project.
 * Rumus: Excel akan menghitung saat file dibuka di Excel desktop.
 */
import * as XLSX from 'xlsx'
import { deteksiJenisPajak } from './dokPajak.js'
import { getNamaKegiatan } from '../data/kodeReferensi.js'

// Lebar kolom A..P (sumber: openpyxl, satuan = karakter xlsx ≈ pixel/7)
const COL_WIDTHS = [4, 12, 8, 10, 50, 8, 6, 6, 6, 6, 8, 10, 10, 18, 16, 10]

function encodeCell(r, c) {
  return XLSX.utils.encode_cell({ r, c })
}

function s2ab(s) {
  const buf = new ArrayBuffer(s.length)
  const view = new Uint8Array(buf)
  for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF
  return buf
}

export function exportPajakExcel(rows = [], opts = {}) {
  const tahun = String(opts.tahun || '')
  const namaSekolah = String(opts.namaSekolah || 'SD Negeri Pasirhalang')
  const jenjang = String(opts.jenjang || 'Sekolah Dasar')
  const catatanAtas = String(opts.catatanAtas || 'Catatan : tanggal diisi dengan format tanggal')
  const ketBawah = String(opts.ketBawah || 'Ket : Pajak yang di bayar oleh sekolah (tidak dari SIPLAH)')

  const wb = XLSX.utils.book_new()
  const ws = { '!ref': 'A1:P35' }

  // ── Style helper ──
  const thin = { style: 'thin', color: { rgb: '000000' } }
  const medium = { style: 'medium', color: { rgb: '000000' } }
  const borderAll = { top: thin, bottom: thin, left: thin, right: thin }
  const borderMedium = { top: medium, bottom: medium, left: medium, right: medium }
  const borderHeader = { top: medium, bottom: thin, left: medium, right: medium }
  const fontBold = { bold: true }
  const fontTitle = { bold: true, sz: 11, name: 'Calibri' }
  const fontHeader = { bold: true, sz: 8, name: 'Arial' }
  const fontNormal = { sz: 8, name: 'Arial' }
  const alignC = { horizontal: 'center', vertical: 'center', wrapText: true }
  const alignL = { horizontal: 'left', vertical: 'center', wrapText: true }
  const alignR = { horizontal: 'right', vertical: 'center', wrapText: true }
  const fillHeader = { fgColor: { rgb: 'F2F2F2' }, patternType: 'solid' } // abu-abu muda

  // ── Row 1: Judul (A1) ──
  ws[encodeCell(0, 0)] = {
    v: `RINCIAN PAJAK SEKOLAH  ${tahun ? `TA ${tahun}` : ''}`.trim(),
    t: 's',
    s: { font: fontTitle, alignment: alignL }
  }

  // ── Row 2: Catatan kanan (L2 = M2 dengan merge) ──
  ws[encodeCell(1, 11)] = {
    v: catatanAtas,
    t: 's',
    s: { font: fontNormal, alignment: alignR }
  }

  // ── Row 3-4: Header 2 tingkat ──
  const h1Labels = [
    'NO', 'Nama Sekolah', 'Jenjang', 'BULAN PAJAK', 'URAIAN PAJAK', 'NILAI BELANJA',
    'JUMLAH/JENIS SETORAN PAJAK', null, null, null,
    'Total', 'TANGGAL BAYAR', 'TANGGAL NTPN', 'NTPN', 'NOMOR KODE BILLING', 'KETERANGAN'
  ]
  const h1Spans = [1, 1, 1, 1, 1, 1, 4, null, null, null, 1, 1, 1, 1, 1, 1]
  const h2Labels = [null, null, null, null, null, null, 'PPh 21', 'PPh 22', 'PPh 23', 'PPN', null, null, null, null, null, null]

  // Header baris 3 (row index 2)
  for (let i = 0; i < 16; i++) {
    if (h1Labels[i] !== null) {
      const span = h1Spans[i] || 1
      ws[encodeCell(2, i)] = {
        v: h1Labels[i],
        t: 's',
        s: {
          font: fontHeader,
          alignment: alignC,
          border: borderHeader,
          fill: fillHeader
        }
      }
      if (span > 1) {
        if (!ws['!merges']) ws['!merges'] = []
        ws['!merges'].push({ s: { r: 2, c: i }, e: { r: 2, c: i + span - 1 } })
      }
    }
  }

  // Header baris 4 (row index 3) — sub-header PPh
  for (let i = 0; i < 16; i++) {
    if (h2Labels[i] !== null) {
      ws[encodeCell(3, i)] = {
        v: h2Labels[i],
        t: 's',
        s: {
          font: fontHeader,
          alignment: alignC,
          border: borderHeader,
          fill: fillHeader
        }
      }
    }
  }

  // Merge A3:A4, B3:B4, C3:C4, D3:D4, E3:E4, F3:F4, K3:K4, L3:L4, M3:M4, N3:N4, O3:O4, P3:P4
  if (!ws['!merges']) ws['!merges'] = []
  const mergePairs = [[0, 2, 3], [1, 2, 3], [2, 2, 3], [3, 2, 3], [4, 2, 3], [5, 2, 3],
    [10, 2, 3], [11, 2, 3], [12, 2, 3], [13, 2, 3], [14, 2, 3], [15, 2, 3]]
  mergePairs.forEach(([c, r1, r2]) => {
    ws['!merges'].push({ s: { r: r1, c }, e: { r: r2, c } })
  })

  // ── Row 5: Nomor kolom 1..16 ──
  for (let i = 0; i < 16; i++) {
    ws[encodeCell(4, i)] = {
      v: i + 1,
      t: 'n',
      s: { font: fontHeader, alignment: alignC, border: borderAll, fill: fillHeader }
    }
  }

  // ── Data rows (baris 6+) ──
  const dataStartRow = 5 // 0-indexed = baris 6
  rows.forEach((r, idx) => {
    const row = dataStartRow + idx
    // Uraian tampil = nama kegiatan dari kodeKegiatan (sama dengan panel preview)
    let uraian = r.uraian || ''
    if (r._kodeKegiatan) {
      const nama = getNamaKegiatan(r._kodeKegiatan)
      if (nama && nama !== r._kodeKegiatan) uraian = nama
    }
    const jenis = deteksiJenisPajak(r.uraian) || ''
    const nilai = Number(r.pengeluaran || r.nilai || 0)

    // A: NO
    ws[encodeCell(row, 0)] = { v: idx + 1, t: 'n', s: { font: fontNormal, alignment: alignC, border: borderAll } }
    // B: Nama Sekolah
    ws[encodeCell(row, 1)] = { v: namaSekolah, t: 's', s: { font: fontNormal, alignment: alignL, border: borderAll } }
    // C: Jenjang
    ws[encodeCell(row, 2)] = { v: jenjang, t: 's', s: { font: fontNormal, alignment: alignL, border: borderAll } }
    // D: BULAN PAJAK
    ws[encodeCell(row, 3)] = { v: r.bulan || '', t: 's', s: { font: fontNormal, alignment: alignL, border: borderAll } }
    // E: URAIAN PAJAK
    ws[encodeCell(row, 4)] = { v: uraian, t: 's', s: { font: fontNormal, alignment: alignL, border: borderAll } }
    // F: NILAI BELANJA (kosong)
    ws[encodeCell(row, 5)] = { v: '', t: 's', s: { font: fontNormal, alignment: alignR, border: borderAll } }

    // G-J: PPh 21/22/23/PPN
    const isPph21 = jenis === 'PPh 21'
    const isPph22 = jenis === 'PPh 22'
    const isPph23 = jenis === 'PPh 23'
    const isPpn = jenis === 'PPN'

    ws[encodeCell(row, 6)] = { v: isPph21 ? nilai : '', t: isPph21 ? 'n' : 's', s: { font: fontNormal, alignment: alignR, border: borderAll } }
    ws[encodeCell(row, 7)] = { v: isPph22 ? nilai : '', t: isPph22 ? 'n' : 's', s: { font: fontNormal, alignment: alignR, border: borderAll } }
    ws[encodeCell(row, 8)] = { v: isPph23 ? nilai : '', t: isPph23 ? 'n' : 's', s: { font: fontNormal, alignment: alignR, border: borderAll } }
    ws[encodeCell(row, 9)] = { v: isPpn ? nilai : '', t: isPpn ? 'n' : 's', s: { font: fontNormal, alignment: alignR, border: borderAll } }

    // K: Total = formula ke kolom pajak yang aktif (sesuai template: =I6 untuk PPh 23)
    const totalFormula = isPph21 ? `=G${row+1}` : isPph22 ? `=H${row+1}` : isPph23 ? `=I${row+1}` : isPpn ? `=J${row+1}` : ''
    ws[encodeCell(row, 10)] = totalFormula ? { f: totalFormula, t: 'n', s: { font: fontNormal, alignment: alignR, border: borderAll } } : { v: '', t: 's', s: { font: fontNormal, alignment: alignR, border: borderAll } }

    // L: TANGGAL BAYAR
    ws[encodeCell(row, 11)] = { v: r.tglBayar || '', t: 's', s: { font: fontNormal, alignment: alignC, border: borderAll } }
    // M: TANGGAL NTPN
    ws[encodeCell(row, 12)] = { v: r.tglNtpn || '', t: 's', s: { font: fontNormal, alignment: alignC, border: borderAll } }
    // N: NTPN
    ws[encodeCell(row, 13)] = { v: r.ntpn || '', t: 's', s: { font: fontNormal, alignment: alignL, border: borderAll } }
    // O: NOMOR KODE BILLING
    ws[encodeCell(row, 14)] = { v: r.kodeBilling || '', t: 's', s: { font: fontNormal, alignment: alignL, border: borderAll } }
    // P: KETERANGAN
    ws[encodeCell(row, 15)] = { v: r.keterangan || '', t: 's', s: { font: fontNormal, alignment: alignL, border: borderAll } }
  })

  // ── Baris Total ──
  const totalRow = dataStartRow + rows.length
  const firstData = dataStartRow + 1 // Excel 1-indexed row number
  const lastData = totalRow // Excel 1-indexed

  // A:F merge "Total"
  ws[encodeCell(totalRow, 0)] = { v: 'Total', t: 's', s: { font: fontBold, alignment: alignC, border: borderMedium } }
  if (!ws['!merges']) ws['!merges'] = []
  ws['!merges'].push({ s: { r: totalRow, c: 0 }, e: { r: totalRow, c: 5 } })

  // G-K: Rumus SUM (termasuk I yang aslinya kosong di template — kita tambahkan)
  const sumCols = ['G', 'H', 'I', 'J', 'K']
  sumCols.forEach((col, i) => {
    const c = 6 + i
    ws[encodeCell(totalRow, c)] = {
      f: `=SUM(${col}${firstData}:${col}${lastData})`,
      t: 'n',
      s: { font: fontBold, alignment: alignR, border: borderMedium }
    }
  })

  // L-P: kosong (border medium)
  for (let c = 11; c <= 15; c++) {
    ws[encodeCell(totalRow, c)] = { v: '', t: 's', s: { border: borderMedium } }
  }

  // ── Catatan bawah ──
  const noteRow = totalRow + 3
  ws[encodeCell(noteRow, 0)] = { v: ketBawah, t: 's', s: { font: fontBold, alignment: alignL } }

  // ── Column widths ──
  ws['!cols'] = COL_WIDTHS.map((w) => ({ wch: w }))

  // ── Page setup: landscape, A4 ──
  ws['!pageSetup'] = {
    orientation: 'landscape',
    paperSize: 9, // A4
    fitToWidth: 1,
    fitToHeight: 1,
    scale: 45 // 45% seperti template
  }

  // ── Print area ──
  ws['!printArea'] = [`A1:P${noteRow + 1}`]

  XLSX.utils.book_append_sheet(wb, ws, 'SD_SMP')

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' })
  const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' })

  const filename = `Rincian_Pajak_${tahun || 'Sekolah'}_${new Date().toISOString().slice(0, 10)}.xlsx`
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default exportPajakExcel
