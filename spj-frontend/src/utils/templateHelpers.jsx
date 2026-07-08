/**
 * Template Helpers — Formatting utilities untuk Template Engine
 * RESEARCH §3.3
 */

// Format currency (Rp 1.000.000)
export function formatCurrency(value) {
  if (!value || isNaN(value)) return 'Rp0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

// Format date (1 Juli 2026)
export function formatDate(dateStr) {
  if (!dateStr) return '___'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Format date short (01/07/2026)
export function formatDateShort(dateStr) {
  if (!dateStr) return '___'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('id-ID')
}

// Number to words ( untuk tanda tangan )
export function numberToWords(num) {
  if (!num || isNaN(num)) return '-'
  const ones = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan']
  const teens = ['sepuluh', 'sebelas', 'dua belas', 'tiga belas', 'empat belas', 'lima belas', 'enam belas', 'tujuh belas', 'delapan belas', 'sembilan belas']
  const tens = ['', '', 'dua puluh', 'tiga puluh', 'empat puluh', 'lima puluh', 'enam puluh', 'tujuh puluh', 'delapan puluh', 'sembilan puluh']

  if (num < 10) return ones[num]
  if (num < 20) return teens[num - 10]
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '')
  if (num < 1000) return ones[Math.floor(num / 100)] + ' ratus' + (num % 100 ? ' ' + numberToWords(num % 100) : '')
  if (num < 10000) return ones[Math.floor(num / 1000)] + ' ribu' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '')
  return formatCurrency(num)
}

// Generate nomor surat
export function generateNomorSurat(template, data = {}) {
  if (!template) return '___/___/___/___/2026'
  let result = template
  Object.entries(data).forEach(([key, value]) => {
    result = result.replace(`{${key}}`, value || '___')
  })
  return result
}

// Placeholder text untuk field kosong
export function PlaceholderText({ label }) {
  const text = label || 'isi'
  return (
    <span className="text-outline italic">
      {'[ '}{text}{']'}
    </span>
  )
}

// Empty state untuk tabel kosong
export function EmptyTableState({ message = 'Belum ada data. Klik "+ Tambah Baris" untuk menambahkan.' }) {
  return (
    <div className="text-center py-8 text-text-low">
      <span className="material-symbols-outlined text-4xl">table_rows</span>
      <p className="text-sm mt-2">{message}</p>
    </div>
  )
}
