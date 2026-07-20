/**
 * contextMap.js — Context Mapping untuk Quick Chips AI
 * 
 * Dipisahkan dari aiHelper.js agar modular.
 * Import di aiHelper.js dan AskAIPanel.jsx
 */

export const CONTEXT_MAP = {
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

export const DEFAULT_CONTEXT = {
  title: 'Aplikasi', icon: 'smart_toy',
  quickChips: [
    { icon: '📊', label: 'Total pengeluaran', question: 'Berapa total pengeluaran?' },
    { icon: '👤', label: 'Jumlah guru honorer', question: 'Berapa jumlah guru honorer?' },
    { icon: '🏫', label: 'Data sekolah', question: 'Tampilkan data sekolah' },
    { icon: '💡', label: 'Apa itu BOSP?', question: 'Apa itu dana BOSP?' },
    { icon: '📋', label: 'Cara buat LPJ', question: 'Bagaimana cara membuat LPJ?' },
  ],
}

export default { CONTEXT_MAP, DEFAULT_CONTEXT }
