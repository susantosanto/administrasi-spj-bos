const XLSX = require('xlsx');

const workbook = XLSX.readFile('./template-data/Realisasi Sekolah Buku Kas Umum (BKU) - Manajemen Aplikasi RKAS - 2026.xlsx');
console.log('Sheets:', workbook.SheetNames);

const worksheet = workbook.Sheets['Page1'];
console.log('Worksheet range:', worksheet['!ref']);

// Check header row (row 14, index 14)
console.log('\n=== HEADER ROW (Row 14) ===');
for (let col = 0; col < 25; col++) {
  const cellAddr = XLSX.utils.encode_cell({r: 14, c: col});
  const cell = worksheet[cellAddr];
  if (cell && cell.v) {
    console.log(`  Col ${col} (${XLSX.utils.encode_col(col)}): ${cell.v}`);
  }
}

// Check row 15 (merged header numbers)
console.log('\n=== ROW 15 (Header numbers) ===');
for (let col = 0; col < 25; col++) {
  const cellAddr = XLSX.utils.encode_cell({r: 15, c: col});
  const cell = worksheet[cellAddr];
  if (cell && cell.v) {
    console.log(`  Col ${col} (${XLSX.utils.encode_col(col)}): ${cell.v}`);
  }
}

// Check row 16 (first data row)
console.log('\n=== ROW 16 (First data row) ===');
for (let col = 0; col < 25; col++) {
  const cellAddr = XLSX.utils.encode_cell({r: 16, c: col});
  const cell = worksheet[cellAddr];
  if (cell && cell.v) {
    console.log(`  Col ${col} (${XLSX.utils.encode_col(col)}): ${cell.v}`);
  }
}

// Check row 17
console.log('\n=== ROW 17 ===');
for (let col = 0; col < 25; col++) {
  const cellAddr = XLSX.utils.encode_cell({r: 17, c: col});
  const cell = worksheet[cellAddr];
  if (cell && cell.v) {
    console.log(`  Col ${col} (${XLSX.utils.encode_col(col)}): ${cell.v}`);
  }
}

// Check row 18
console.log('\n=== ROW 18 ===');
for (let col = 0; col < 25; col++) {
  const cellAddr = XLSX.utils.encode_cell({r: 18, c: col});
  const cell = worksheet[cellAddr];
  if (cell && cell.v) {
    console.log(`  Col ${col} (${XLSX.utils.encode_col(col)}): ${cell.v}`);
  }
}

// Check merged cells
console.log('\n=== MERGED CELLS ===');
if (worksheet['!merges']) {
  worksheet['!merges'].forEach(m => {
    console.log(`  ${XLSX.utils.encode_cell(m.s.r, m.s.c)}:${XLSX.utils.encode_cell(m.e.r, m.e.c)}`);
  });
}

// Check more data rows
console.log('\n=== ROW 19 ===');
for (let col = 0; col < 25; col++) {
  const cellAddr = XLSX.utils.encode_cell({r: 19, c: col});
  const cell = worksheet[cellAddr];
  if (cell && cell.v) {
    console.log(`  Col ${col} (${XLSX.utils.encode_col(col)}): ${cell.v}`);
  }
}

console.log('\n=== ROW 20 ===');
for (let col = 0; col < 25; col++) {
  const cellAddr = XLSX.utils.encode_cell({r: 20, c: col});
  const cell = worksheet[cellAddr];
  if (cell && cell.v) {
    console.log(`  Col ${col} (${XLSX.utils.encode_col(col)}): ${cell.v}`);
  }
}

console.log('\n=== ROW 21 ===');
for (let col = 0; col < 25; col++) {
  const cellAddr = XLSX.utils.encode_cell({r: 21, c: col});
  const cell = worksheet[cellAddr];
  if (cell && cell.v) {
    console.log(`  Col ${col} (${XLSX.utils.encode_col(col)}): ${cell.v}`);
  }
}