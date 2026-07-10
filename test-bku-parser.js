const XLSX = require('xlsx');

// BKU_STRUCTURE with corrected column mappings
const BKU_STRUCTURE = {
  HEADER: {
    ROWS: {
      NPSN: { row: 0, col: 1 },
      NAMA_SEKOLAH: { row: 1, col: 1 },
      ALAMAT: { row: 2, col: 1 },
      KECAMATAN: { row: 3, col: 1 },
      KABUPATEN: { row: 4, col: 1 },
      PROVINSI: { row: 5, col: 1 },
      KODE_POS: { row: 6, col: 1 },
      STATUS_SEKOLAH: { row: 7, col: 1 },
      BENTUK_PENDIDIKAN: { row: 8, col: 1 },
      TAHUN_AJARAN: { row: 9, col: 1 },
      SEMESTER: { row: 10, col: 1 },
      NAMA_BENDAHARA: { row: 11, col: 1 },
      NIP_BENDAHARA: { row: 12, col: 1 },
    },
    HEADER_ROW: 13, // Row 14 (0-indexed)
    HEADER_COLUMNS: {
      TANGGAL: 'A',
      KODE_KEGIATAN: 'C',
      KODE_REKENING: 'E',
      NO_BUKTI: 'G',
      URAIAN: 'I',
      PENERIMAAN: 'K',
      PENGELUARAN: 'M',
      SALDO: 'O',
    },
  },
  DATA_COLUMNS: {
    TANGGAL: 0,        // A
    KODE_KEGIATAN: 3,  // D
    KODE_REKENING: 5,  // F
    NO_BUKTI: 8,       // I
    URAIAN: 10,        // K
    PENERIMAAN: 13,    // N
    PENGELUARAN: 16,   // Q
    SALDO: 19,         // T
  },
  SECTION_HEADERS: {
    PENERIMAAN_PREFIX: 'PENERIMAAN_',
    PENGELUARAN_PREFIX: 'PENGELUARAN_',
    SALDO_AWAL_PREFIX: 'SALDO_AWAL_',
    SALDO_AKHIR_PREFIX: 'SALDO_AKHIR_',
    MONTHS: [
      'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
      'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
    ],
  },
  FOOTER: {
    SIGNATURE_ROWS: {
      BENDAHARA: { row: 50, col: 1 },
      KEPALA_SEKOLAH: { row: 52, col: 1 },
    },
  },
};

function getCellValue(worksheet, row, col) {
  const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
  const cell = worksheet[cellAddress];
  return cell ? cell.v : null;
}

function getCellValueByColLetter(worksheet, row, colLetter) {
  const col = XLSX.utils.decode_col(colLetter);
  return getCellValue(worksheet, row, col);
}

function parseHeader(worksheet) {
  const header = {};
  const headerRows = BKU_STRUCTURE.HEADER.ROWS;
  
  for (const [key, pos] of Object.entries(headerRows)) {
    header[key] = getCellValue(worksheet, pos.row, pos.col);
  }
  
  // Read header row columns
  const headerRow = BKU_STRUCTURE.HEADER.HEADER_ROW;
  const headerCols = BKU_STRUCTURE.HEADER.HEADER_COLUMNS;
  
  for (const [key, colLetter] of Object.entries(headerCols)) {
    header[`HEADER_${key}`] = getCellValueByColLetter(worksheet, headerRow, colLetter);
  }
  
  return header;
}

function detectSectionHeaders(worksheet) {
  const sections = [];
  const dataCols = BKU_STRUCTURE.DATA_COLUMNS;
  const sectionHeaders = BKU_STRUCTURE.SECTION_HEADERS;
  const headerRow = BKU_STRUCTURE.HEADER.HEADER_ROW;
  
  // Start scanning from row after header row (row 15, 0-indexed = 14)
  let currentRow = headerRow + 2; // Row 16 (0-indexed = 15)
  const maxRows = 1000; // Safety limit
  
  let currentSection = null;
  
  while (currentRow < maxRows) {
    // Check column A (TANGGAL column) for section headers
    const cellA = getCellValue(worksheet, currentRow, dataCols.TANGGAL);
    const cellK = getCellValue(worksheet, currentRow, dataCols.URAIAN);
    
    if (!cellA && !cellK) {
      currentRow++;
      continue;
    }
    
    const cellA_str = cellA ? String(cellA).toUpperCase().trim() : '';
    const cellK_str = cellK ? String(cellK).toUpperCase().trim() : '';
    
    // Check for monthly section headers in column A or K
    let sectionType = null;
    let month = null;
    
    for (const m of sectionHeaders.MONTHS) {
      if (cellA_str.includes(`PENERIMAAN_${m}`) || cellK_str.includes(`PENERIMAAN_${m}`)) {
        sectionType = 'PENERIMAAN';
        month = m;
        break;
      }
      if (cellA_str.includes(`PENGELUARAN_${m}`) || cellK_str.includes(`PENGELUARAN_${m}`)) {
        sectionType = 'PENGELUARAN';
        month = m;
        break;
      }
      if (cellA_str.includes(`SALDO_AWAL_${m}`) || cellK_str.includes(`SALDO_AWAL_${m}`)) {
        sectionType = 'SALDO_AWAL';
        month = m;
        break;
      }
      if (cellA_str.includes(`SALDO_AKHIR_${m}`) || cellK_str.includes(`SALDO_AKHIR_${m}`)) {
        sectionType = 'SALDO_AKHIR';
        month = m;
        break;
      }
    }
    
    // Also check for "Saldo Bank Bulan" and "Saldo Tunai Bulan" patterns
    if (!sectionType) {
      if (cellA_str.includes('SALDO BANK BULAN') || cellK_str.includes('SALDO BANK BULAN')) {
        sectionType = 'SALDO_BANK';
        const match = cellA_str.match(/SALDO BANK BULAN\s+(\w+)/i) || cellK_str.match(/SALDO BANK BULAN\s+(\w+)/i);
        month = match ? match[1].toUpperCase() : 'DESEMBER';
      }
      if (cellA_str.includes('SALDO TUNAI BULAN') || cellK_str.includes('SALDO TUNAI BULAN')) {
        sectionType = 'SALDO_TUNAI';
        const match = cellA_str.match(/SALDO TUNAI BULAN\s+(\w+)/i) || cellK_str.match(/SALDO TUNAI BULAN\s+(\w+)/i);
        month = match ? match[1].toUpperCase() : 'DESEMBER';
      }
    }
    
    if (sectionType) {
      // Save previous section if exists
      if (currentSection) {
        currentSection.endRow = currentRow - 1;
        sections.push(currentSection);
      }
      
      // Start new section
      currentSection = {
        type: sectionType,
        month: month,
        startRow: currentRow + 1, // Data starts after header
        endRow: null,
      };
    }
    
    currentRow++;
  }
  
  // Add last section
  if (currentSection) {
    currentSection.endRow = currentRow - 1;
    sections.push(currentSection);
  }
  
  // If no sections found, create a single section covering all data rows
  if (sections.length === 0) {
    // Find first data row (row with date in column A)
    let firstDataRow = headerRow + 2;
    while (firstDataRow < maxRows) {
      const val = getCellValue(worksheet, firstDataRow, dataCols.TANGGAL);
      if (val && String(val).match(/^\d{2}-\d{2}-\d{4}$/)) {
        break;
      }
      firstDataRow++;
    }
    
    // Find last data row
    let lastDataRow = firstDataRow;
    while (lastDataRow < maxRows) {
      const val = getCellValue(worksheet, lastDataRow, dataCols.TANGGAL);
      if (!val || !String(val).match(/^\d{2}-\d{2}-\d{4}$/)) {
        break;
      }
      lastDataRow++;
    }
    lastDataRow--; // Last valid row
    
    if (firstDataRow <= lastDataRow) {
      sections.push({
        type: 'TRANSAKSI',
        month: 'ALL',
        startRow: firstDataRow,
        endRow: lastDataRow,
      });
    }
  }
  
  return sections;
}

function parseTransactionRows(worksheet, section) {
  const transactions = [];
  const dataCols = BKU_STRUCTURE.DATA_COLUMNS;
  
  for (let row = section.startRow; row <= section.endRow; row++) {
    const tanggal = getCellValue(worksheet, row, dataCols.TANGGAL);
    
    // Skip if no valid date
    if (!tanggal || !String(tanggal).match(/^\d{2}-\d{2}-\d{4}$/)) {
      continue;
    }
    
    const kodeKegiatan = getCellValue(worksheet, row, dataCols.KODE_KEGIATAN);
    const kodeRekening = getCellValue(worksheet, row, dataCols.KODE_REKENING);
    const noBukti = getCellValue(worksheet, row, dataCols.NO_BUKTI);
    const uraian = getCellValue(worksheet, row, dataCols.URAIAN);
    const penerimaan = getCellValue(worksheet, row, dataCols.PENERIMAAN);
    const pengeluaran = getCellValue(worksheet, row, dataCols.PENGELUARAN);
    const saldo = getCellValue(worksheet, row, dataCols.SALDO);
    
    // Parse numbers
    const parseNumber = (val) => {
      if (val === null || val === undefined || val === '') return 0;
      const str = String(val).replace(/[.,]/g, '').replace(/\s/g, '');
      const num = parseFloat(str);
      return isNaN(num) ? 0 : num;
    };
    
    const debet = parseNumber(penerimaan);
    const kredit = parseNumber(pengeluaran);
    const saldoNum = parseNumber(saldo);
    
    transactions.push({
      tanggal: String(tanggal),
      kodeKegiatan: kodeKegiatan ? String(kodeKegiatan).trim() : '',
      kodeRekening: kodeRekening ? String(kodeRekening).trim() : '',
      noBukti: noBukti ? String(noBukti).trim() : '',
      uraian: uraian ? String(uraian).trim() : '',
      debet: debet,
      kredit: kredit,
      saldo: saldoNum,
      sectionType: section.type,
      sectionMonth: section.month,
    });
  }
  
  return transactions;
}

function parseFooter(worksheet) {
  const footer = {};
  const sigRows = BKU_STRUCTURE.FOOTER.SIGNATURE_ROWS;
  
  for (const [role, pos] of Object.entries(sigRows)) {
    footer[role] = getCellValue(worksheet, pos.row, pos.col);
  }
  
  return footer;
}

// Main test
const workbook = XLSX.readFile('template-data/Realisasi Sekolah Buku Kas Umum (BKU) - Manajemen Aplikasi RKAS - 2026.xlsx');
const worksheet = workbook.Sheets['Page1'];

console.log('=== HEADER ===');
const header = parseHeader(worksheet);
console.log(JSON.stringify(header, null, 2));

console.log('\n=== SECTIONS ===');
const sections = detectSectionHeaders(worksheet);
console.log(JSON.stringify(sections, null, 2));

console.log('\n=== TRANSACTIONS ===');
let allTransactions = [];
for (const section of sections) {
  const transactions = parseTransactionRows(worksheet, section);
  console.log(`Section ${section.type} (${section.month}): ${transactions.length} transactions`);
  allTransactions.push(...transactions);
}

console.log(`\nTotal transactions: ${allTransactions.length}`);
if (allTransactions.length > 0) {
  console.log('\nFirst 5 transactions:');
  console.log(JSON.stringify(allTransactions.slice(0, 5), null, 2));
  
  console.log('\nLast 5 transactions:');
  console.log(JSON.stringify(allTransactions.slice(-5), null, 2));
  
  // Summary
  const totalDebet = allTransactions.reduce((sum, t) => sum + t.debet, 0);
  const totalKredit = allTransactions.reduce((sum, t) => sum + t.kredit, 0);
  console.log(`\nTotal Debet (Penerimaan): ${totalDebet.toLocaleString()}`);
  console.log(`Total Kredit (Pengeluaran): ${totalKredit.toLocaleString()}`);
  console.log(`Saldo Akhir: ${allTransactions[allTransactions.length - 1]?.saldo?.toLocaleString() || 0}`);
}

console.log('\n=== FOOTER ===');
const footer = parseFooter(worksheet);
console.log(JSON.stringify(footer, null, 2));