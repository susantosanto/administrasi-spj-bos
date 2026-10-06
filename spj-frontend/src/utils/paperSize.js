import storageHelper from './storageHelper'

// Ukuran kertas cetak — dipilih user, berlaku untuk SEMUA dokumen formal.
// A4 = 210 x 297 mm (aturan proyek semula). F4/Folio = 8,5 x 13 inci
// (215,9 x 330,2 mm) meniru kertas dokumen sumber gugus.
// Disimpan di localStorage prefix spj_ (kunci 'kertas'), default 'A4'.

export const PAPER_SIZES = {
  A4: {
    id: 'A4',
    label: 'A4',
    ukuran: '210 × 297 mm',
    widthMm: 210,
    minHeightMm: 297,
    cssWidth: '210mm',
    cssMinHeight: '297mm',
    pageSize: 'A4',
  },
  F4: {
    id: 'F4',
    label: 'F4 (Folio)',
    ukuran: '8,5 × 13 inci',
    widthMm: 215.9,
    minHeightMm: 330.2,
    cssWidth: '215.9mm',
    cssMinHeight: '330mm',
    // @page memakai inci agar Chrome/Firefox pas ke Folio/F4.
    pageSize: '215.9mm 330.2mm',
  },
}

export const PAPER_EVENT = 'spj:kertas-change'

export function getPaperSize() {
  const id = storageHelper.get('kertas', 'A4')
  return PAPER_SIZES[id] ? id : 'A4'
}

export function getPaperDef() {
  return PAPER_SIZES[getPaperSize()]
}

function terapkanAturanPage() {
  if (typeof document === 'undefined') return
  const def = getPaperDef()
  document.body.dataset.paper = def.id
  let el = document.getElementById('spj-paper-page')
  if (!el) {
    el = document.createElement('style')
    el.id = 'spj-paper-page'
    document.head.appendChild(el)
  }
  // @page tak bisa di-scope per elemen — disuntik global sesuai pilihan.
  el.textContent = `@media print { @page { size: ${def.pageSize}; margin: 0; } }`
}

export function setPaperSize(id) {
  if (!PAPER_SIZES[id]) return false
  storageHelper.set('kertas', id)
  terapkanAturanPage()
  if (typeof document !== 'undefined') {
    // Kontainer cetak statis (mis. SKHonorer) ikut tanpa perlu re-render React.
    document.querySelectorAll('.print-container').forEach((el) => {
      el.classList.remove('paper-a4', 'paper-f4')
      el.classList.add(`paper-${id.toLowerCase()}`)
    })
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PAPER_EVENT, { detail: { paper: id } }))
  }
  return true
}

// Dipanggil sekali saat aplikasi dimuat (main.jsx) agar @page benar
// sebelum cetak pertama tanpa harus membuka pemilih kertas dulu.
export function initPaperSize() {
  terapkanAturanPage()
}
