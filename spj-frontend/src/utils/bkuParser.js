/**
 * BKU Excel Parser Utility
 * Parses BKU (Buku Kas Umum) Excel files exported from ARKAS
 * 
 * FORMAT VERIFIED: Based on actual ARKAS export
 * Sheet: 'Page1', Range: A1:X365
 * 
 * DATA COLUMNS (terverifikasi dari file asli):
 * ┌──────────────┬──────┬──────────┬─────────────────────────────┐
 * │ Field        │ Col  │ Index    │ Contoh                      │
 * ├──────────────┼──────┼──────────┼─────────────────────────────┤
 * │ TANGGAL      │ A    │ 0        │ "20-01-2026" (DD-MM-YYYY)   │
 * │ KODE KEGIATAN│ D    │ 3        │ "07.12.01." (nullable)      │
 * │ KODE REKENING│ F    │ 5        │ "5.1.02.02.01.0013" (null)  │
 * │ NO. BUKTI    │ I    │ 8        │ "BBU01"/"BNU01"/"BPU01"     │
 * │ URAIAN       │ K    │ 10       │ "Terima Dana BOSP Tahap 1"  │
 * │ PENERIMAAN   │ N    │ 13       │ 82560000 (integer)          │
 * │ PENGELUARAN  │ Q    │ 16       │ 1000000 (integer)           │
 * │ SALDO        │ T    │ 19       │ 82560000 (integer)          │
 * └──────────────┴──────┴──────────┴─────────────────────────────┘
 */

import * as XLSX from 'xlsx';

// ─── Constants ─────────────────────────────────────────────────

const PREFERRED_SHEET_NAMES = ['Page1', 'BKU', 'Sheet1', 'Data'];

// Header fields dari Row 5-13 (1-based), 0-indexed internally
// Label di kolom A (index 0), Value di kolom E (index 4) dengan prefix ": "
const HEADER_ROWS = {
  NPSN:         { row: 4, valueCol: 4 },  // Row 5 (0-indexed: 4)
  NAMA_SEKOLAH: { row: 6, valueCol: 4 },  // Row 7
  ALAMAT:       { row: 8, valueCol: 4 },  // Row 9
  KABUPATEN:    { row: 10, valueCol: 4 }, // Row 11
  PROVINSI:     { row: 12, valueCol: 4 }, // Row 13
};

const DATA_COLUMNS = {
  TANGGAL:       0,  // A
  KODE_KEGIATAN: 3,  // D
  KODE_REKENING: 5,  // F
  NO_BUKTI:      8,  // I
  URAIAN:       10,  // K
  PENERIMAAN:   13,  // N
  PENGELUARAN:  16,  // Q
  SALDO:        19,  // T
};

const HEADER_LABEL_ROW = 14; // Row 15 (0-indexed) — header column labels
const NUMBER_SEPARATOR_ROW = 15; // Row 16 — numbers 1-8
const DATA_START_ROW = 15; // Row 16 (0-indexed) — first data row
const MAX_DATA_ROW = 1000; // Safety limit — tidak ada BKU yang > 1000 baris transaksi

const FOOTER = {
  KEPSEK_COL: 1,  // B
  BENDAHARA_COL: 12, // M
  TEMPAT_COL: 12, // M — kolom tempat/tanggal penutupan
};

// ─── Utility Functions ─────────────────────────────────────────

function getCell(worksheet, row, col) {
  const addr = XLSX.utils.encode_cell({ r: row, c: col });
  const cell = worksheet[addr];
  return cell ? cell.v : null;
}

function getLastRow(worksheet) {
  // Ambil range terakhir dari worksheet (baris non-kosong terakhir)
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
  return range.e.r; // 0-indexed
}

function parseHeaderValue(val) {
  if (!val) return '';
  const str = String(val).trim();
  // Value format di kolom E adalah ": VALUE" → strip ": "
  return str.replace(/^:\s*/, '').trim();
}

function parseTahunAnggaran(val) {
  if (!val) return '';
  const str = String(val);
  // Coba format "TAHUN : 2026" atau "Tahun 2026" atau "2026"
  const matchLabel = str.match(/Tahun\s*[:\s]*\s*(\d{4})/i)
    || str.match(/TA\s*[:\s]*\s*(\d{4})/i)
    || str.match(/THN\s*[:\s]*\s*(\d{4})/i);
  if (matchLabel) return matchLabel[1];
  // Fallback: ambil 4 digit angka pertama yang masuk akal (2000-2099)
  const matchNumber = str.match(/(20\d{2})/);
  return matchNumber ? matchNumber[1] : '';
}

function parseTanggal(val) {
  if (!val) return null;
  // Format: "DD-MM-YYYY"
  if (typeof val === 'string') {
    const parts = val.split('-');
    if (parts.length === 3) {
      const d = parseInt(parts[0]);
      const m = parseInt(parts[1]);
      const y = parseInt(parts[2]);
      if (!isNaN(d) && !isNaN(m) && !isNaN(y) && d >= 1 && d <= 31 && m >= 1 && m <= 12) {
        return { day: d, month: m, year: y };
      }
    }
  }
  // Excel serial date number
  if (typeof val === 'number') {
    const dateInfo = XLSX.SSF.parse_date_code(val);
    if (dateInfo) {
      return { day: dateInfo.d, month: dateInfo.m, year: dateInfo.y };
    }
  }
  return null;
}

function parseNumber(val) {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    // Data dari ARKAS adalah integer murni, tapi ada kemungkinan format ribuan
    const cleaned = val.replace(/[Rp\s]/g, '').replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

// ─── Transaction Type Detection ────────────────────────────────

const TRANSACTION_TYPES = {
  PENERIMAAN_BOSP: 'PENERIMAAN_BOSP',
  PUNGUT_PPH: 'PUNGUT_PPH',
  PERGESERAN_BANK: 'PERGESERAN_BANK',
  SETOR_PAJAK: 'SETOR_PAJAK',
  TARIK_TUNAI: 'TARIK_TUNAI',
  BUNGA_BANK: 'BUNGA_BANK',
  PAJAK_BUNGA: 'PAJAK_BUNGA',
  PEMBAYARAN: 'PEMBAYARAN',
  SALDO_AWAL: 'SALDO_AWAL',
  LAINNYA: 'LAINNYA',
};

const KATEGORI_BELANJA = {
  HONOR: { pattern: /^5\.1\.02\.02/, label: 'Honor/Gaji', color: 'purple' },
  LISTRIK: { pattern: /^5\.2\.05\.01\.01\.0001$/, label: 'Listrik', color: 'orange' },
  ATK: { pattern: /^5\.1\.02\.01\.01\.0024$/, label: 'ATK', color: 'blue' },
  MAMIN: { pattern: /^5\.1\.02\.01\.01\.0052$/, label: 'Makan/Minum', color: 'green' },
  CETAK: { pattern: /^5\.1\.02\.01\.01\.0025$/, label: 'Bahan Cetak', color: 'teal' },
  INTERNET: { pattern: /^5\.1\.02\.02\.01\.0063$/, label: 'Pulsa/Internet', color: 'cyan' },
  PERPUS: { pattern: /^5\.1\.02\.02\.01\.0061$/, label: 'Perpustakaan', color: 'indigo' },
};

function detectTransactionType(tx) {
  const { uraian, noBukti, penerimaan, pengeluaran, kodeKegiatan, kodeRekening } = tx;
  const u = (uraian || '').toLowerCase();
  const nb = (noBukti || '').toUpperCase();

  // 1. SALDO AWAL — uraian mengandung "saldo bank" atau "saldo tunai"
  if (u.includes('saldo bank') || u.includes('saldo tunai')) {
    return TRANSACTION_TYPES.SALDO_AWAL;
  }

  // 2. BUNGA BANK
  if (u.includes('bunga bank')) {
    return TRANSACTION_TYPES.BUNGA_BANK;
  }

  // 3. PAJAK BUNGA
  if (u.includes('pajak bunga')) {
    return TRANSACTION_TYPES.PAJAK_BUNGA;
  }    // 4. PENERIMAAN DANA BOSP — penerimaan dengan BBU (nomor berapa pun)
  if (penerimaan > 0 && (nb.startsWith('BBU') || u.includes('dana bosp') || u.includes('bosp tahap'))) {
    return TRANSACTION_TYPES.PENERIMAAN_BOSP;
  }

  // 5. PUNGUT PPH — penerimaan dari pungutan pajak
  if (penerimaan > 0 && (u.includes('terima pph') || u.includes('pungut pph'))) {
    return TRANSACTION_TYPES.PUNGUT_PPH;
  }

  // 6. PERGESERAN BANK — penerimaan dari pergeseran
  if (penerimaan > 0 && (u.includes('pergeseran') || u.includes('pindah'))) {
    return TRANSACTION_TYPES.PERGESERAN_BANK;
  }

  // 7. SETOR PAJAK — no bukti berawalan BPU
  if (nb.startsWith('BPU') || u.includes('setor pph') || u.includes('setor pajak')) {
    return TRANSACTION_TYPES.SETOR_PAJAK;
  }

  // 8. TARIK TUNAI — pengeluaran tanpa kode kegiatan/rekening
  if (pengeluaran > 0 && !kodeKegiatan && !kodeRekening && (u.includes('tarik') || u.includes('tunai') || u.includes('ambil') || u.includes('penarikan'))) {
    return TRANSACTION_TYPES.TARIK_TUNAI;
  }

  // 9. PEMBAYARAN — pengeluaran dengan kode kegiatan/rekening
  if (pengeluaran > 0 && kodeKegiatan) {
    return TRANSACTION_TYPES.PEMBAYARAN;
  }

  // 10. Juga TARIK TUNAI jika pengeluaran tanpa identitas
  if (pengeluaran > 0 && !kodeKegiatan && !kodeRekening && !nb) {
    return TRANSACTION_TYPES.TARIK_TUNAI;
  }

  return TRANSACTION_TYPES.LAINNYA;
}

function detectKategoriBelanja(kodeRekening) {
  if (!kodeRekening) return null;
  for (const [key, config] of Object.entries(KATEGORI_BELANJA)) {
    if (config.pattern.test(kodeRekening)) {
      return { key, ...config };
    }
  }
  return null;
}

// ─── Main Parsing Functions ────────────────────────────────────

/**
 * Parse header informasi sekolah dari worksheet
 */
function parseHeader(worksheet) {
  const header = {};

  // Parse tahun anggaran dari Row 3 (0-indexed: 2), kolom A
  const tahunRaw = getCell(worksheet, 2, 0);
  header.tahunAnggaran = parseTahunAnggaran(tahunRaw);

  // Parse fields dari Row 5-13 (0-indexed: 4-12)
  // Label di kolom A, Value di kolom E dengan prefix ": "
  for (const [field, cfg] of Object.entries(HEADER_ROWS)) {
    const raw = getCell(worksheet, cfg.row, cfg.valueCol);
    header[field.toLowerCase()] = parseHeaderValue(raw);
  }

  return header;
}

/**
 * Validasi format file BKU
 */
function getBestSheet(workbook) {
  // Cari sheet yang paling cocok
  // Prioritas: Page1 > BKU > Sheet1 > Data > sheet pertama
  for (const name of PREFERRED_SHEET_NAMES) {
    if (workbook.Sheets[name]) return name;
  }
  // Fallback ke sheet pertama yang ada
  if (workbook.SheetNames.length > 0) return workbook.SheetNames[0];
  return null;
}

export function validateBKUFormat(workbook) {
  const errors = [];
  const warnings = [];

  // Cari sheet yang sesuai
  const sheetName = getBestSheet(workbook);
  if (!sheetName) {
    errors.push('Tidak ada sheet yang ditemukan di file Excel');
    return { valid: false, errors, warnings, sheetName: null };
  }
  if (!PREFERRED_SHEET_NAMES.includes(sheetName)) {
    warnings.push(`Sheet "${sheetName}" digunakan (tidak ditemukan sheet Page1/BKU/Sheet1/Data standar ARKAS)`);
  }

  const ws = workbook.Sheets[sheetName];

  // Cek header kolom di row 14 (0-indexed: 13)
  const headerTanggal = getCell(ws, HEADER_LABEL_ROW, DATA_COLUMNS.TANGGAL);
  if (!headerTanggal || String(headerTanggal).trim() !== 'TANGGAL') {
    errors.push('Format header kolom tidak sesuai standar ARKAS (TANGGAL di kolom A)');
  }

  // Cek number separator row
  const num1 = getCell(ws, NUMBER_SEPARATOR_ROW, DATA_COLUMNS.TANGGAL);
  if (num1 !== 1) {
    warnings.push('Row pemisah kolom (angka 1-8) tidak ditemukan atau berbeda format');
  }

  // Cek NPSN
  const npsnRaw = getCell(ws, HEADER_ROWS.NPSN.row, HEADER_ROWS.NPSN.valueCol);
  const npsn = parseHeaderValue(npsnRaw);
  if (npsn && !/^\d{8}$/.test(npsn)) {
    warnings.push(`Format NPSN tidak standar: "${npsn}"`);
  }

  return { valid: errors.length === 0, errors, warnings, npsn, sheetName };
}

/**
 * Parse semua transaksi dari worksheet
 * Workflow:
 * 1. Iterate row 16-340 (0-indexed: 15-339)
 * 2. Skip: header info rows, BKU-ALL section headers, number separator rows
 * 3. Only parse rows with valid date (DD-MM-YYYY)
 * 4. Detect transaction type
 */
function parseTransactions(worksheet) {
  const transactions = [];
  const invalidRows = [];
  const lastRow = Math.min(getLastRow(worksheet), MAX_DATA_ROW);

  for (let row = DATA_START_ROW; row <= lastRow; row++) {
    const tanggalRaw = getCell(worksheet, row, DATA_COLUMNS.TANGGAL);

    // Skip jika tidak ada data di kolom tanggal
    if (tanggalRaw === null || tanggalRaw === undefined) continue;

    // Skip BKU-ALL section headers
    if (typeof tanggalRaw === 'string' && tanggalRaw.includes('BKU-ALL')) continue;

    // Skip number separator row (1, 2, 3, ...)
    if (tanggalRaw === 1 || tanggalRaw === '1') {
      // Verify this is indeed a number row by checking col D=2
      const num2 = getCell(worksheet, row, DATA_COLUMNS.KODE_KEGIATAN);
      if (num2 === 2 || num2 === '2') continue;
    }

    // Parse tanggal
    const parsed = parseTanggal(tanggalRaw);
    if (!parsed) {
      invalidRows.push({ row: row + 1, value: tanggalRaw });
      continue;
    }

    // Ambil data transaksi
    const kodeKegiatan = getCell(worksheet, row, DATA_COLUMNS.KODE_KEGIATAN);
    const kodeRekening = getCell(worksheet, row, DATA_COLUMNS.KODE_REKENING);
    const noBukti = getCell(worksheet, row, DATA_COLUMNS.NO_BUKTI);
    const uraian = getCell(worksheet, row, DATA_COLUMNS.URAIAN);
    const penerimaan = parseNumber(getCell(worksheet, row, DATA_COLUMNS.PENERIMAAN));
    const pengeluaran = parseNumber(getCell(worksheet, row, DATA_COLUMNS.PENGELUARAN));
    const saldo = parseNumber(getCell(worksheet, row, DATA_COLUMNS.SALDO));

    const tx = {
      row: row + 1,
      tanggal: parsed,
      tanggalStr: `${String(parsed.day).padStart(2, '0')}-${String(parsed.month).padStart(2, '0')}-${parsed.year}`,
      tanggalISO: `${parsed.year}-${String(parsed.month).padStart(2, '0')}-${String(parsed.day).padStart(2, '0')}`,
      bulan: parsed.month,
      tahun: parsed.year,
      kodeKegiatan: kodeKegiatan ? String(kodeKegiatan).trim() : '',
      kodeRekening: kodeRekening ? String(kodeRekening).trim() : '',
      noBukti: noBukti ? String(noBukti).trim() : '',
      uraian: uraian ? String(uraian).trim() : '',
      penerimaan,
      pengeluaran,
      saldo,
      // Alias: debet = penerimaan, kredit = pengeluaran
      debet: penerimaan,
      kredit: pengeluaran,
      // Transaction metadata
      tipe: null, // akan diisi setelah deteksi
      kategori: null,
    };

    // Detect transaction type
    tx.tipe = detectTransactionType(tx);
    tx.kategori = detectKategoriBelanja(tx.kodeRekening);

    transactions.push(tx);
  }

  // Deteksi juga BARIS PALING AKHIR yang mungkin bukan transaksi
  // Filter hanya yang memiliki data valid (tanggal terdeteksi)
  return transactions;
}

/**
 * Parse footer signature
 */
function parseFooter(worksheet) {
  const footer = {
    kepalaSekolah: { nama: '', nip: '' },
    bendahara: { nama: '', nip: '' },
    tanggalPenutupan: '',
    tempat: '',
  };

  const lastRow = getLastRow(worksheet);
  const startRow = Math.max(DATA_START_ROW, lastRow - 20);

  let foundSignature = false;

  for (let row = lastRow; row >= startRow; row--) {
    const colB = getCell(worksheet, row, FOOTER.KEPSEK_COL);
    const colM = getCell(worksheet, row, FOOTER.BENDAHARA_COL);

    if (colB && !foundSignature) {
      const val = String(colB).trim();
      if (val.includes('Menyetujui') || val.includes('Kepala Sekolah')) {
        foundSignature = true;
        continue;
      }
      if (foundSignature && val.includes('NIP.')) {
        footer.kepalaSekolah.nip = val.replace('NIP.', '').trim();
      } else if (foundSignature && val && !val.includes('NIP.') && !val.includes('Menyetujui')) {
        footer.kepalaSekolah.nama = val;
      }
    }

    if (colM) {
      const val = String(colM).trim();
      if (foundSignature && val.includes('NIP.')) {
        footer.bendahara.nip = val.replace('NIP.', '').trim();
      } else if (foundSignature && val && !val.includes('NIP.') && !val.includes('Bendahara')) {
        footer.bendahara.nama = val;
      }
      // Tempat/tanggal: cari pola "XX, DD Month YYYY" atau nama kota
      if (val.match(/\d+\s+\w+\s+\d{4}/)) {
        footer.tanggalPenutupan = val;
        const parts = val.split(',');
        if (parts.length > 0) footer.tempat = parts[0].trim();
      }
    }
  }

  return footer;
}

// ─── Public API ────────────────────────────────────────────────

/**
 * Main BKU Excel Parser
 * @param {File} file - File object from file input
 * @returns {Promise<Object>} Parsed BKU data
 */
export function parseBKUExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Validate format
        const validation = validateBKUFormat(workbook);
        if (!validation.valid) {
          reject(new Error(`Format BKU tidak valid: ${validation.errors.join(', ')}`));
          return;
        }

        const sheetName = validation.sheetName || getBestSheet(workbook);
        if (!sheetName) {
          reject(new Error('Tidak dapat menentukan sheet untuk diparse'));
          return;
        }
        const worksheet = workbook.Sheets[sheetName];

        // Parse all sections
        const header = parseHeader(worksheet);
        const transactions = parseTransactions(worksheet);
        const footer = parseFooter(worksheet);

        if (transactions.length === 0) {
          reject(new Error('Tidak ditemukan data transaksi dengan format tanggal DD-MM-YYYY'));
          return;
        }

        // Calculate summaries
        const saldoAkhir = transactions[transactions.length - 1].saldo;

        // Get unique months
        const months = [...new Set(transactions.map(t => t.bulan))].sort((a, b) => a - b);

        // Group by transaction type
        const byType = {};
        transactions.forEach(tx => {
          const type = tx.tipe;
          if (!byType[type]) byType[type] = { count: 0, totalPenerimaan: 0, totalPengeluaran: 0 };
          byType[type].count++;
          byType[type].totalPenerimaan += tx.penerimaan;
          byType[type].totalPengeluaran += tx.pengeluaran;
        });

        // ── PERHITUNGAN RIIL ──
        // Transaksi internal (PPh, Pajak, Pergeseran) tidak dihitung sebagai penerimaan/pengeluaran riil
        // PENERIMAAN RIIL = hanya Dana BOSP (PENERIMAAN_BOSP)
        // PENGELUARAN RIIL = Pembayaran ke pihak ke-3 + Tarik Tunai (yang benar-benar menguras dana)
        const totalPenerimaanRiil = byType[TRANSACTION_TYPES.PENERIMAAN_BOSP]?.totalPenerimaan || 0;
        const totalPengeluaranRiil = (byType[TRANSACTION_TYPES.PEMBAYARAN]?.totalPengeluaran || 0)
          + (byType[TRANSACTION_TYPES.TARIK_TUNAI]?.totalPengeluaran || 0);

        // ── ALL TOTALS (untuk verifikasi balance BKU) ──
        const totalPenerimaanSemua = transactions.reduce((s, t) => s + t.penerimaan, 0);
        const totalPengeluaranSemua = transactions.reduce((s, t) => s + t.pengeluaran, 0);
        const isBKUBalanced = totalPenerimaanSemua === totalPengeluaranSemua;
        const isBalanced = totalPenerimaanRiil === totalPengeluaranRiil;

        // Monthly summaries
        const monthlySummaries = months.map(bulan => {
          const bulanTx = transactions.filter(t => t.bulan === bulan);
          const namaBulan = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
          ][bulan - 1];
          return {
            bulan,
            namaBulan,
            count: bulanTx.length,
            totalPenerimaan: bulanTx.reduce((s, t) => s + t.penerimaan, 0),
            totalPengeluaran: bulanTx.reduce((s, t) => s + t.pengeluaran, 0),
            saldoAwal: bulanTx[0].saldo - bulanTx[0].penerimaan + bulanTx[0].pengeluaran,
            saldoAkhir: bulanTx[bulanTx.length - 1].saldo,
          };
        });

        const result = {
          success: true,
          header,
          transactions,
          footer,
          summary: {
            totalTransactions: transactions.length,
            // RIIL (yang ditampilkan ke user)
            totalPenerimaan: totalPenerimaanRiil,
            totalPengeluaran: totalPengeluaranRiil,
            saldoAkhir,
            isBalanced,
            // ALL (untuk referensi internal)
            totalPenerimaanSemua,
            totalPengeluaranSemua,
            months,
            byType,
            monthlySummaries,
          },
          warnings: validation.warnings,
          parsedAt: new Date().toISOString(),
        };

        resolve(result);
      } catch (error) {
        reject(new Error(`Gagal parsing file BKU: ${error.message}`));
      }
    };

    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Lightweight parser — ONLY reads school profile header from BKU Excel
 * WITHOUT requiring full BKU transaction format validation.
 * Suitable for DataSekolahPage where we only need NPSN, nama sekolah, etc.
 */
export function parseSekolahHeader(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })

        // Find best sheet
        let sheetName = null
        for (const name of PREFERRED_SHEET_NAMES) {
          if (workbook.Sheets[name]) { sheetName = name; break }
        }
        if (!sheetName && workbook.SheetNames.length > 0) {
          sheetName = workbook.SheetNames[0]
        }
        if (!sheetName) {
          reject(new Error('Tidak ada sheet yang ditemukan di file Excel'))
          return
        }

        const ws = workbook.Sheets[sheetName]

        // ── Parse header rows ──
        const header = {}

        // Tahun anggaran dari Row 3 (0-indexed: 2), kolom A
        const tahunRaw = getCell(ws, 2, 0)
        header.tahunAnggaran = parseTahunAnggaran(tahunRaw)

        // Fields dari Row 5-13 (0-indexed: 4-12)
        // Label di kolom A, Value di kolom E (index 4) dengan prefix ": "
        for (const [field, cfg] of Object.entries(HEADER_ROWS)) {
          const raw = getCell(ws, cfg.row, cfg.valueCol)
          header[field.toLowerCase()] = parseHeaderValue(raw)
        }

        // Validate: minimal harus ada NPSN atau nama sekolah
        if (!header.npsn && !header.nama_sekolah) {
          reject(new Error('Tidak ditemukan data sekolah (NPSN / Nama Sekolah) di file. Pastikan file BKU ARKAS valid.'))
          return
        }

        resolve({
          success: true,
          sheetName,
          header,
          parsedAt: new Date().toISOString(),
        })
      } catch (error) {
        reject(new Error(`Gagal membaca file: ${error.message}`))
      }
    }

    reader.onerror = () => reject(new Error('Gagal membaca file'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Filter transaksi berdasarkan bulan
 */
export function filterByMonth(transactions, bulan) {
  if (!bulan || bulan === 'Semua') return transactions;
  return transactions.filter(t => t.bulan === parseInt(bulan));
}

/**
 * Filter transaksi berdasarkan tahun
 */
export function filterByYear(transactions, tahun) {
  if (!tahun) return transactions;
  return transactions.filter(t => t.tahun === tahun);
}

/**
 * Cari transaksi Makan & Minum berdasarkan kode rekening
 */
export function getMaminTransactions(transactions) {
  return transactions.filter(t =>
    t.kodeRekening === '5.1.02.01.01.0052' && t.pengeluaran > 0
  );
}

/**
 * Cari transaksi berdasarkan tipe
 */
export function getTransactionsByType(transactions, type) {
  return transactions.filter(t => t.tipe === type);
}

/**
 * Get transaction type label in Indonesian
 */
export function getTypeLabel(type) {
  const labels = {
    PENERIMAAN_BOSP: 'Penerimaan Dana BOSP',
    PUNGUT_PPH: 'Pungutan PPh',
    PERGESERAN_BANK: 'Pergeseran Bank',
    SETOR_PAJAK: 'Setor Pajak',
    TARIK_TUNAI: 'Tarik Tunai',
    BUNGA_BANK: 'Bunga Bank',
    PAJAK_BUNGA: 'Pajak Bunga',
    PEMBAYARAN: 'Pembayaran',
    SALDO_AWAL: 'Saldo Awal',
    LAINNYA: 'Lainnya',
  };
  return labels[type] || type;
}

export default {
  parseBKUExcel,
  validateBKUFormat,
  filterByMonth,
  filterByYear,
  getMaminTransactions,
  getTransactionsByType,
  getTypeLabel,
  TRANSACTION_TYPES,
};
