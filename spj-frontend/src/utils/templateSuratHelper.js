/**
 * Template Surat Helper
 * Fitur: Template Surat Cerdas dengan Auto-Fill
 */

import storageHelper from './storageHelper';

const { get, set } = storageHelper;

// ============================================
// CONSTANTS
// ============================================

const STORAGE_KEYS = {
  DRAFT_SURAT: 'spj_draft_surat',
  SETTINGS: 'spj_template_surat_settings'
};

// Template Surat Definitions
export const TEMPLATES = {
  surat_tugas: {
    id: 'surat_tugas',
    nama: 'Surat Tugas',
    icon: '📋',
    deskripsi: 'Surat tugas untuk guru/staf melaksanakan tugas tertentu',
    kode: 'STS',
    kategori: 'umum',
    fields: [
      { id: 'yangBertugas', label: 'Yang Ditugaskan', type: 'text', placeholder: 'Nama guru/staf yang ditugaskan', required: true },
      { id: 'nipYangDitugaskan', label: 'NIP', type: 'text', placeholder: 'NIP yang ditugaskan', required: true },
      { id: 'tugas', label: 'Tugas Yang Diberikan', type: 'textarea', placeholder: 'Jelaskan tugas yang harus dilaksanakan', required: true },
      { id: 'waktuPelaksanaan', label: 'Waktu Pelaksanaan', type: 'text', placeholder: 'Contoh: 10-15 Juli 2026', required: true },
      { id: 'tempatPelaksanaan', label: 'Tempat Pelaksanaan', type: 'text', placeholder: 'Tempat pelaksanaan tugas', required: false }
    ]
  },
  surat_keterangan: {
    id: 'surat_keterangan',
    nama: 'Surat Keterangan',
    icon: '📄',
    deskripsi: 'Surat keterangan untuk keperluan tertentu',
    kode: 'SK',
    kategori: 'umum',
    fields: [
      { id: 'keperluan', label: 'Keperluan', type: 'text', placeholder: 'Untuk keperluan apa surat ini diterbitkan', required: true },
      { id: 'keterangan', label: 'Keterangan', type: 'textarea', placeholder: 'Isi keterangan yang diberikan', required: true },
      { id: 'untuk', label: 'Untuk', type: 'text', placeholder: 'Nama yang menerima surat keterangan', required: true }
    ]
  },
  surat_undangan: {
    id: 'surat_undangan',
    nama: 'Surat Undangan',
    icon: '💌',
    deskripsi: 'Surat undangan rapat atau acara',
    kode: 'SU',
    kategori: 'umum',
    fields: [
      { id: 'acara', label: 'Acara', type: 'text', placeholder: 'Nama acara/rapat', required: true },
      { id: 'waktuAcara', label: 'Waktu Acara', type: 'text', placeholder: 'Contoh: Senin, 14 Juli 2026, pukul 08.00 WIB', required: true },
      { id: 'tempatAcara', label: 'Tempat Acara', type: 'text', placeholder: 'Tempat pelaksanaan acara', required: true },
      { id: 'undangan', label: 'Diundang', type: 'textarea', placeholder: 'Siapa saja yang diundang', required: true }
    ]
  },
  surat_pernyataan: {
    id: 'surat_pernyataan',
    nama: 'Surat Pernyataan',
    icon: '📝',
    deskripsi: 'Surat pernyataan resmi',
    kode: 'SP',
    kategori: 'umum',
    fields: [
      { id: 'isiPernyataan', label: 'Isi Pernyataan', type: 'textarea', placeholder: 'Tulis pernyataan yang ingin dibuat', required: true },
      { id: 'untuk', label: 'Untuk', type: 'text', placeholder: 'Pihak yang menerima pernyataan', required: true }
    ]
  },
  surat_kuasa: {
    id: 'surat_kuasa',
    nama: 'Surat Kuasa',
    icon: '🏛️',
    deskripsi: 'Surat kuasa untuk mewakili',
    kode: 'SKU',
    kategori: 'keuangan',
    fields: [
      { id: 'yangDikuasakan', label: 'Yang Dikuasakan', type: 'text', placeholder: 'Nama yang diberi kuasa', required: true },
      { id: 'nipDikuasakan', label: 'NIP', type: 'text', placeholder: 'NIP yang dikuasakan', required: true },
      { id: 'untukKeperluan', label: 'Untuk Keperluan', type: 'textarea', placeholder: 'Keperluan pemberian kuasa', required: true },
      { id: 'waktuKuasa', label: 'Waktu Kuasa', type: 'text', placeholder: 'Contoh: 10-20 Juli 2026', required: true }
    ]
  }
};

// ============================================
// DATA SOURCE FUNCTIONS
// ============================================

/**
 * Get data sekolah untuk auto-fill
 */
export function getDataSekolah() {
  const data = get('data_sekolah');
  return {
    namaSekolah: data?.namaSekolah || data?.nama || '',
    alamat: data?.alamat || '',
    telepon: data?.telepon || data?.telp || '',
    email: data?.email || '',
    website: data?.website || '',
    logo: data?.logo || null,
    // Tambahan untuk kop surat
    kabupaten: data?.kabupaten || data?.kota || '',
    provinsi: data?.provinsi || '',
    kodePos: data?.kodePos || '',
    npsn: data?.npsn || ''
  };
}

/**
 * Get data pejabat untuk auto-fill
 */
export function getDataPejabat() {
  const data = get('pejabat_sekolah');
  
  // Handle different data structures
  let kepsek = null;
  let bendahara = null;
  
  if (data) {
    // If data is array
    if (Array.isArray(data)) {
      kepsek = data.find(p => p.jabatan === 'Kepala Sekolah' || p.role === 'kepsek');
      bendahara = data.find(p => p.jabatan === 'Bendahara' || p.role === 'bendahara');
    }
    // If data is object with kepsek/bendahara keys
    else {
      kepsek = data.kepsek || data.kepalaSekolah;
      bendahara = data.bendahara;
    }
  }
  
  return {
    namaKepsek: kepsek?.nama || '',
    nipKepsek: kepsek?.nip || '',
    jabatanKepsek: kepsek?.jabatan || 'Kepala Sekolah',
    
    namaBendahara: bendahara?.nama || '',
    nipBendahara: bendahara?.nip || '',
    jabatanBendahara: bendahara?.jabatan || 'Bendahara BOS'
  };
}

/**
 * Check if data auto-fill is available
 */
export function isAutoFillAvailable() {
  const sekolah = getDataSekolah();
  const pejabat = getDataPejabat();
  
  return {
    hasSekolah: !!sekolah.namaSekolah,
    hasKepsek: !!pejabat.namaKepsek,
    hasBendahara: !!pejabat.namaBendahara,
    isComplete: !!sekolah.namaSekolah && !!pejabat.namaKepsek
  };
}

// ============================================
// TEMPLATE FUNCTIONS
// ============================================

/**
 * Get all templates
 */
export function getAllTemplates() {
  return Object.values(TEMPLATES);
}

/**
 * Get template by ID
 */
export function getTemplate(templateId) {
  return TEMPLATES[templateId] || null;
}

/**
 * Generate default values for template
 */
export function generateDefaultValues(templateId) {
  const template = getTemplate(templateId);
  if (!template) return {};
  
  const sekolah = getDataSekolah();
  const pejabat = getDataPejabat();
  
  const defaultValues = {
    // Auto-fill data sekolah
    namaSekolah: sekolah.namaSekolah,
    alamat: sekolah.alamat,
    telepon: sekolah.telepon,
    email: sekolah.email,
    logo: sekolah.logo,
    
    // Auto-fill pejabat
    namaKepsek: pejabat.namaKepsek,
    nipKepsek: pejabat.nipKepsek,
    jabatanKepsek: pejabat.jabatanKepsek,
    
    namaBendahara: pejabat.namaBendahara,
    nipBendahara: pejabat.nipBendahara,
    jabatanBendahara: pejabat.jabatanBendahara,
    
    // Default fields
    nomorSurat: '',
    kota: sekolah.kabupaten || 'Bandung'
  };
  
  // Add template-specific defaults
  template.fields.forEach(field => {
    defaultValues[field.id] = '';
  });
  
  return defaultValues;
}

// ============================================
// SURAT GENERATION
// ============================================

/**
 * Generate isi surat berdasarkan template
 */
export function generateIsiSurat(templateId, values) {
  const template = getTemplate(templateId);
  if (!template) return '';
  
  switch (templateId) {
    case 'surat_tugas':
      return generateSuratTugas(values);
    case 'surat_keterangan':
      return generateSuratKeterangan(values);
    case 'surat_undangan':
      return generateSuratUndangan(values);
    case 'surat_pernyataan':
      return generateSuratPernyataan(values);
    case 'surat_kuasa':
      return generateSuratKuasa(values);
    default:
      return '';
  }
}

function generateSuratTugas(v) {
  return `Yang bertugas untuk melaksanakan tugas sebagai berikut:

1. Nama   : ${v.yangBertugas || '...................'}
   NIP    : ${v.nipYangDitugaskan || '...................'}

2. Tugas Yang Diberikan:
${v.tugas || '...................'}

3. Waktu Pelaksanaan: ${v.waktuPelaksanaan || '...................'}
4. Tempat           : ${v.tempatPelaksanaan || '...................'}

Demikian surat tugas ini dibuat untuk dapat dilaksanakan sebagaimana mestinya.`;
}

function generateSuratKeterangan(v) {
  return `Yang bersangkutan:

Nama : ${v.untuk || '...................'}
Jabatan: ${v.jabatanUntuk || '...................'}

Dengan ini menerangkan bahwa yang bersangkutan adalah benar ${
  v.keperluan || '...................'
}.

${v.keterangan || '...................'}

Demikian surat keterangan ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.`;
}

function generateSuratUndangan(v) {
  return `Dengan hormat,

Yth. ${v.undangan || '...................'}

Dengan ini kami mengundang Bapak/Ibu untuk menghadiri acara:

Acara  : ${v.acara || '...................'}
Waktu  : ${v.waktuAcara || '...................'}
Tempat : ${v.tempatAcara || '...................'}

Atas kehadiran dan perhatiannya, kami ucapkan terima kasih.`;
}

function generateSuratPernyataan(v) {
  return `Dengan ini saya yang bertanda tangan di bawah ini:

Nama : ${v.namaKepsek || '...................'}
Jabatan : ${v.jabatanKepsek || '...................'}

Dengan sesungguhnya menyatakan bahwa:

${v.isiPernyataan || '...................'}

Surat pernyataan ini saya buat dengan sebenarnya dalam keadaan sadar dan tanpa paksaan dari pihak manapun.

Untuk keperluan: ${v.untuk || '...................'}`;
}

function generateSuratKuasa(v) {
  return `Yang bertanda tangan di bawah ini:

Nama : ${v.namaKepsek || '...................'}
Jabatan : ${v.jabatanKepsek || '...................'}

Dengan ini memberikan kuasa kepada:

Nama : ${v.yangDikuasakan || '...................'}
NIP  : ${v.nipDikuasakan || '...................'}

Untuk melaksanakan keperluan:
${v.untukKeperluan || '...................'}

Waktu kuasa: ${v.waktuKuasa || '...................'}

Demikian surat kuasa ini dibuat untuk dapat dipergunakan sebagaimana mestinya.`;
}

// ============================================
// DRAFT FUNCTIONS
// ============================================

/**
 * Save draft surat
 */
export function saveDraftsurat(draft) {
  const drafts = get(STORAGE_KEYS.DRAFT_SURAT) || [];
  const newDraft = {
    id: `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...draft,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  drafts.unshift(newDraft);
  set(STORAGE_KEYS.DRAFT_SURAT, drafts);
  return newDraft;
}

/**
 * Get all drafts
 */
export function getAllDrafts() {
  return get(STORAGE_KEYS.DRAFT_SURAT) || [];
}

/**
 * Get draft by ID
 */
export function getDraftById(id) {
  const drafts = getAllDrafts();
  return drafts.find(d => d.id === id) || null;
}

/**
 * Update draft
 */
export function updateDraft(id, updates) {
  const drafts = getAllDrafts();
  const index = drafts.findIndex(d => d.id === id);
  if (index !== -1) {
    drafts[index] = {
      ...drafts[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    set(STORAGE_KEYS.DRAFT_SURAT, drafts);
    return drafts[index];
  }
  return null;
}

/**
 * Delete draft
 */
export function deleteDraft(id) {
  const drafts = getAllDrafts();
  const filtered = drafts.filter(d => d.id !== id);
  set(STORAGE_KEYS.DRAFT_SURAT, filtered);
}

// ============================================
// EXPORT HTML
// ============================================

/**
 * Generate HTML untuk print/download
 */
export function generateSuratHTML(templateId, values) {
  const template = getTemplate(templateId);
  if (!template) return '';
  
  const sekolah = getDataSekolah();
  const pejabat = getDataPejabat();
  
  const nomorSurat = values.nomorSurat || '...........';
  const kota = values.kota || sekolah.kabupaten || 'Bandung';
  
  // Get date from BKU if available, otherwise use placeholder
  const tanggal = values.tanggalSurat || '..........., ...... 2026';
  
  const isiSurat = generateIsiSurat(templateId, values);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <title>${template.nama} - ${nomorSurat}</title>
  <style>
    @page {
      size: A4;
      margin: 3cm 2.5cm 3cm 4cm;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #000;
      margin: 0;
      padding: 0;
    }
    .kop-surat {
      text-align: center;
      border-bottom: 3px double #000;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .kop-surat .logo {
      width: 100px;
      height: auto;
      margin-bottom: 5px;
    }
    .kop-surat .nama-instansi {
      font-size: 14pt;
      font-weight: bold;
      text-transform: uppercase;
      margin: 5px 0;
    }
    .kop-surat .nama-sekolah {
      font-size: 14pt;
      font-weight: bold;
      text-transform: uppercase;
      margin: 5px 0;
    }
    .kop-surat .alamat {
      font-size: 10pt;
      margin: 3px 0;
    }
    .nomor-surat {
      margin-bottom: 20px;
    }
    .isi-surat {
      text-align: justify;
      margin-bottom: 30px;
      white-space: pre-wrap;
    }
    .tanda-tangan {
      text-align: right;
      margin-top: 40px;
    }
    .tanda-tangan .jabatan {
      font-weight: bold;
      text-transform: uppercase;
    }
    .tanda-tangan .nama {
      margin-top: 60px;
      font-weight: bold;
      text-decoration: underline;
    }
    .tanda-tangan .nip {
      font-size: 10pt;
    }
  </style>
</head>
<body>
  <div class="kop-surat">
    ${sekolah.logo ? `<img src="${sekolah.logo}" class="logo" alt="Logo" />` : ''}
    <div class="nama-instansi">PEMERINTAH KOTA ${kota.toUpperCase()}</div>
    <div class="nama-instansi">DINAS PENDIDIKAN</div>
    <div class="nama-sekolah">${sekolah.namaSekolah || 'NAMA SEKOLAH'}</div>
    <div class="alamat">${sekolah.alamat || 'Alamat Sekolah'}${sekolah.telepon ? ` Telp. ${sekolah.telepon}` : ''}</div>
    ${sekolah.npsn ? `<div class="alamat">NPSN: ${sekolah.npsn}</div>` : ''}
  </div>
  
  <div class="nomor-surat">
    Nomor: ${nomorSurat}
  </div>
  
  <div class="isi-surat">${isiSurat}</div>
  
  <div class="tanda-tangan">
    <div>${kota}, ${tanggal}</div>
    <div class="jabatan">${pejabat.jabatanKepsek || 'KEPALA SEKOLAH'}</div>
    <div class="nama">${pejabat.namaKepsek || '...................'}</div>
    <div class="nip">NIP. ${pejabat.nipKepsek || '...................'}</div>
  </div>
</body>
</html>`;
}

/**
 * Download surat sebagai HTML (bisa di-print ke PDF)
 */
export function downloadSuratHTML(templateId, values) {
  const html = generateSuratHTML(templateId, values);
  const template = getTemplate(templateId);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${template?.nama || 'Surat'}_${values.nomorSurat || 'draft'}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Print surat
 */
export function printSurat(templateId, values) {
  const html = generateSuratHTML(templateId, values);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
}

export default {
  TEMPLATES,
  getAllTemplates,
  getTemplate,
  getDataSekolah,
  getDataPejabat,
  isAutoFillAvailable,
  generateDefaultValues,
  generateIsiSurat,
  generateSuratHTML,
  downloadSuratHTML,
  printSurat,
  saveDraftsurat,
  getAllDrafts,
  getDraftById,
  updateDraft,
  deleteDraft
};
