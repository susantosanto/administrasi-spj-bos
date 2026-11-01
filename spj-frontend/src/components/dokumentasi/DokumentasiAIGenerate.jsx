/**
 * DokumentasiAIGenerate.jsx — Generate Foto Dokumentasi AI (Sprint 019 revisi)
 *
 * ═══════════════════════════════════════════════════════════════════════
 * REVISI USER 2026-10-23:
 * 1. Foto hasil generate TIDAK lagi punya panel A4 sendiri — masuk ke
 *    Panel Preview utama (Zona B) lewat state bersama `useFotoDokumen`.
 *    Komponen ini hanya: konfigurasi → generate → foto masuk daftar bersama.
 * 2. Tombol disamakan dengan desain tombol aplikasi (blue-only #004ac6 +
 *    slate, rounded-xl, font-bold) — sebelumnya violet/amber/emerald
 *    (pelanggaran aturan warna). Pembeda premium: gradient primary→blue +
 *    ikon auto_awesome + chip "AI" (keluarga tombol Cetak panel).
 * ═══════════════════════════════════════════════════════════════════════
 * 🟢 MVP: Puter.js (GRATIS, tanpa API key) · 🔴 FUTURE: Flux Pro via fal.ai
 */
import { useState, useCallback, useEffect, useRef } from 'react'
import { generateDocumentationImage, generatePlaceholderImage, ACTIVITY_PROMPTS, preloadPuter, cekSigninPuter, masukPuter, resizeImage } from '../../services/imageGenerator'
import { tambahAkunDariSesi, generateDenganRotasi, adalahErrorKuota, pasangSupresiDialogPuter } from '../../services/puterAkun'
import PuterAkunManager from '../ai/PuterAkunManager'
import storageHelper from '../../utils/storageHelper'

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS — opsi chip: satu gaya (slate netral / primary terpilih)
// ═══════════════════════════════════════════════════════════════════

const PERSONEL_KEY = 'personel_photos'
// Foto ruangan referensi (Data Sekolah → Foto Referensi → Ruangan) — Sprint 020 revisi
const RUANGAN_KEY = 'ruangan_photos'
// Sprint 023 (R-3): foto ruang per transaksi (lokal, tidak ubah global).
// Bentuk: { [rowKey]: { [slot]: { dataUrl, name, uploadedAt } } } — prefix spj_.
const RUANG_LOKAL_KEY = 'spj_ruang_lokal'
// Foto owner pihak luar per aktivitas (upload langsung di kartu ini) — prefix spj_
const OWNER_KEY = 'spj_dok_ai_owner'
// Slot owner yang relevan per aktivitas (sesuai kebutuhan; aktivitas lain tanpa slot)
const OWNER_SLOT_PER_AKTIVITAS = {
  mamin: { label: 'Owner Warung Makan / Katering', labelPrompt: 'pemilik warung makan yang menyerahkan pesanan' },
  atk: { label: 'Owner Toko Alat Tulis', labelPrompt: 'pemilik toko alat tulis yang menyerahkan barang' },
}
// Set foto yang dibutuhkan per aktivitas (konsep TERKUNCI user 2026-10-24 rev2):
// mamin & atk = 3 foto (penyerahan, rapat, produk barang) — konsep mamin
// diadaptasi penuh ke ATK; aktivitas lain = 1 foto (rapat).
// Kunci konsep (wajib konsisten di SEMUA hasil generate):
//   (1) foto rapat WAJIB memuat wajah guru yang diupload (referensi wajah);
//   (2) foto produk barang WAJIB berlatar ruang rapat sesuai foto ruangan
//       yang diupload (input image ruangan, bukan latar imajinasi);
//   (3) foto penyerahan WAJIB ada guru terupload sebagai PENERIMA barang
//       dari owner (owner = penyerah, guru = penerima — peran eksplisit).
// Tiap slot = 1 panggilan AI (kuota per slot).
const SET_FOTO_PER_AKTIVITAS = {
  mamin: [
    { id: 'penyerahan', label: 'Foto Penyerahan', icon: 'handshake', butuhOrang: true, butuhOwner: true, butuhItems: true },
    { id: 'rapat', label: 'Foto Rapat di Ruangan', icon: 'meeting_room', butuhOrang: true, butuhRuang: true },
    { id: 'box', label: 'Foto Nasi Box & Snack Box', icon: 'lunch_dining', butuhItems: true, butuhRuang: true },
  ],
  atk: [
    { id: 'penyerahan', label: 'Foto Penyerahan', icon: 'handshake', butuhOrang: true, butuhOwner: true, butuhItems: true },
    { id: 'rapat', label: 'Foto Rapat di Ruangan', icon: 'meeting_room', butuhOrang: true, butuhRuang: true },
    { id: 'atk_beli', label: 'Foto ATK yang Dibeli', icon: 'edit_document', butuhItems: true, butuhRuang: true },
  ],
}
const SET_FOTO_DEFAULT = [
  { id: 'rapat', label: 'Foto Rapat di Ruangan', icon: 'meeting_room', butuhOrang: true, butuhRuang: true },
]
// Rincian item & jumlah per baris BKU (diketik/ditempel user dari surat perencanaan)
const ITEMS_KEY = 'spj_dok_ai_items'
// Mapping suasana → slot foto ruangan (id PersonelFotoTab RUANGAN_TYPES)
const SUASANA_KE_RUANGAN = { ruang_rapat: 'ruang_rapat', aula: 'aula', kantor: 'ruang_kantor' }

const PAKAIAN_OPTIONS = [
  { id: 'formal', label: 'Formal', icon: 'checkroom' },
  { id: 'batik', label: 'Batik', icon: 'palette' },
  { id: 'casual', label: 'Casual', icon: 'checkroom' },
  { id: 'seragam', label: 'Seragam', icon: 'badge' },
]

const SUASANA_OPTIONS = [
  { id: 'ruang_rapat', label: 'Ruang Rapat', icon: 'meeting_room' },
  { id: 'outdoor', label: 'Outdoor', icon: 'park' },
  { id: 'aula', label: 'Aula', icon: 'stadium' },
  { id: 'kantor', label: 'Kantor', icon: 'corporate_fare' },
]

const KATEGORI_TO_ACTIVITY = {
  MAMIN: 'mamin', ATK: 'atk', CETAK: 'pemeliharaan', HONOR: 'rapat',
  LISTRIK: 'pemeliharaan', INTERNET: 'pemeliharaan', PERPUS: 'rapat',
}

// Sprint 020 revisi (laporan user 2026-10-24): baris "Konsumsi (makan) Kegiatan …"
// (SSH konsumsi kegiatan 5.1.02.02.01.0001) terklasifikasi HONOR oleh bkuParser
// (pattern prefix 5.1.02.02 lebih luas & dicek lebih dulu) → kartu AI jatuh ke
// aktivitas 'rapat' (1 slot, TANPA upload owner warung). Deteksi ulang DI SINI —
// cakup kartu AI saja, klasifikasi BKU global tidak diubah:
//   (1) kode rekening konsumsi kegiatan → mamin (otoritatif, SSH);
//   (2) fallback uraian berawalan Konsumsi/Makan/Minum/Snack saat kategori
//       memetakan ke 'rapat' (HONOR/PERPUS/belum dipetakan).
const KONSUMSI_REKENING = /^5\.1\.02\.02\.01\.0001/
const KONSUMSI_URAIAN = /^(konsumsi|makan|minum|snack)\b/i

function deteksiAktivitas(transaction) {
  const key = KATEGORI_TO_ACTIVITY[transaction?.kategori?.key] || 'rapat'
  const rek = String(transaction?.kodeRekening || '').replace(/\s+/g, '')
  if (KONSUMSI_REKENING.test(rek)) return 'mamin'
  if (key === 'rapat' && KONSUMSI_URAIAN.test(String(transaction?.uraian || ''))) return 'mamin'
  return key
}

/** Chip pilihan (pakaian/suasana) — gaya tombol aplikasi, blue-only. */
function ChipOpsi({ opt, aktif, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
        aktif
          ? 'bg-primary border-primary text-white shadow-md shadow-primary/25'
          : 'bg-white border-slate-300 text-slate-600 hover:border-blue-400 hover:text-primary'
      }`}
    >
      <span className="material-symbols-outlined text-xl">{opt.icon}</span>
      <span className="text-[10px] font-bold">{opt.label}</span>
    </button>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function DokumentasiAIGenerate({
  transaction,
  fotoAi = [],
  onFotoBaru,
  onRegenerasiFoto,
  onHapusFoto,
}) {
  const [pakaian, setPakaian] = useState('formal')
  const [suasana, setSuasana] = useState('ruang_rapat')
  const [selectedOrang, setSelectedOrang] = useState({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)
  // Info rotasi akun (kuota habis di satu akun → lanjut akun berikutnya)
  const [infoRotasi, setInfoRotasi] = useState(null)
  const [suksesId, setSuksesId] = useState(null) // id foto terakhir yang berhasil
  // Status sign-in Puter: 'cek' (preload berjalan) | 'ya' | 'belum'
  const [signin, setSignin] = useState('cek')
  const [signinBusy, setSigninBusy] = useState(false)
  // Stop generate: hasil proses yang sudah jalan diabaikan (tidak disimpan)
  const batalRef = useRef(false)
  const genIdRef = useRef(0)
  const [dibatalkan, setDibatalkan] = useState(false)
  const fileOwnerRef = useRef(null)
  // Versi foto owner (localStorage bukan state → counter picu re-render)
  const [ownerVersi, setOwnerVersi] = useState(0)
  // Sprint 023 (R-3): upload/hapus ruang per transaksi — pola sama dengan owner.
  const fileRuangRef = useRef(null)
  const [ruangVersi, setRuangVersi] = useState(0)
  // Slot upload tertunda (bila upload untuk slot selain suasana aktif)
  const slotUploadRef = useRef(null)
  // Multi-akun Puter (rotasi kuota otomatis) — UI kelola ada di komponen
  // bersama PuterAkunManager (juga di tab "Akun AI" halaman Pengaturan).
  // Counter ini hanya sinyal refresh ke manager setelah auto-capture token.
  const [akunVersi, setAkunVersi] = useState(0)
  // Set foto per kegiatan: slot yang sedang digenerate + progress "Generate Semua"
  const [slotAktif, setSlotAktif] = useState(null) // id slot yang sedang digenerate
  const [slotSelesai, setSlotSelesai] = useState([]) // id slot selesai (feedback)
  const [progressSemua, setProgressSemua] = useState(null) // {i, n, label}
  // Rincian item & jumlah (dari surat perencanaan, ditempel user) — persist per baris BKU
  const rowKey = String(transaction?.row ?? transaction?.noBukti ?? 'x')
  const [items, setItems] = useState(() => {
    const semua = (() => { try { return JSON.parse(localStorage.getItem(ITEMS_KEY) || '{}') } catch { return {} } })()
    return semua[rowKey] || ''
  })
  const setItemsPersist = (v) => {
    setItems(v)
    const semua = (() => { try { return JSON.parse(localStorage.getItem(ITEMS_KEY) || '{}') } catch { return {} } })()
    if (v) semua[rowKey] = v; else delete semua[rowKey]
    localStorage.setItem(ITEMS_KEY, JSON.stringify(semua))
  }

  // Preload puter.js + cek sign-in saat kartu dibuka — memperpendek rantai
  // async antara klik Generate dan window.open popup auth, agar aktivasi
  // klik user tidak kedaluwarsa (popup auth tidak diblokir browser).
  useEffect(() => {
    let hidup = true
    // Supresi dialog "Low Balance" bawaan puter.js — rotasi akun yang
    // menangani kuota habis, dialognya hanya gangguan (idempotent)
    pasangSupresiDialogPuter()
    preloadPuter()
      .then(() => cekSigninPuter())
      .then((ok) => {
        if (!hidup) return
        setSignin(ok ? 'ya' : 'belum')
        // Sesi sudah ada → simpan sebagai akun rotasi pertama (sekali saja;
        // panggilan berikutnya no-op bila token sudah terdaftar)
        if (ok) tambahAkunDariSesi().catch(() => {})
      })
      .catch(() => { if (hidup) setSignin('belum') })
    return () => { hidup = false }
  }, [])

  const personelPhotos = (() => { try { return JSON.parse(localStorage.getItem(PERSONEL_KEY) || '{}') } catch { return {} } })()
  const ruanganPhotos = (() => { try { return JSON.parse(localStorage.getItem(RUANGAN_KEY) || '{}') } catch { return {} } })()
  // Foto owner pihak luar (warung makan / toko ATK) — per aktivitas, persist
  // localStorage (prefix spj_ sesuai konstitusi): { mamin: dataUrl, atk: dataUrl }
  const ownerPhotos = (() => { try { return JSON.parse(localStorage.getItem(OWNER_KEY) || '{}') } catch { return {} } })()
  const guruList = storageHelper.get('data_guru', []) || []
  const orangWithPhotos = guruList.filter((g) => personelPhotos[g.nama]?.dataUrl)
  const orangHasPhotos = Object.keys(personelPhotos).length > 0

  // Foto ruangan yang terpakai — Sprint 023 (R-3): prioritas ruang LOKAL
  // transaksi ini (spj_ruang_lokal[rowKey][slot]) → fallback foto global
  // (ruangan_photos) slot sesuai suasana → fallback foto global pertama → null.
  // Hapus/upload lokal TIDAK mengubah global.
  const slotRuangan = SUASANA_KE_RUANGAN[suasana] || null
  const ruangLokalRow = (() => {
    try { return JSON.parse(localStorage.getItem(RUANG_LOKAL_KEY) || '{}')[rowKey] || {} } catch { return {} }
  })()
  const ruangFoto = (slotRuangan && ruangLokalRow[slotRuangan]?.dataUrl)
    || (slotRuangan && ruanganPhotos[slotRuangan]?.dataUrl)
    || Object.values(ruanganPhotos).find((r) => r?.dataUrl)?.dataUrl
    || null
  // true bila foto terpakai berasal dari upload lokal transaksi ini.
  const ruangDariLokal = !!(slotRuangan && ruangLokalRow[slotRuangan]?.dataUrl)
  // Slot lokal lain yang tersimpan untuk transaksi ini (untuk tombol hapus).
  const slotLokalLain = Object.keys(ruangLokalRow).filter((s) => s !== slotRuangan)

  const activityKey = deteksiAktivitas(transaction)
  const activityConfig = ACTIVITY_PROMPTS[activityKey]
  const selectedOrangList = Object.keys(selectedOrang).filter((k) => selectedOrang[k])
  // Slot owner yang relevan untuk aktivitas ini (null = tidak ditampilkan)
  const ownerSlot = OWNER_SLOT_PER_AKTIVITAS[activityKey] || null
  const ownerFoto = ownerSlot ? (ownerPhotos[activityKey]?.dataUrl || null) : null
  // Set foto yang dibutuhkan per aktivitas (mamin=3, atk=2, lainnya=1 rapat)
  const setFoto = SET_FOTO_PER_AKTIVITAS[activityKey] || SET_FOTO_DEFAULT

  /**
   * Prompt per slot set foto — konsep TERKUNCI (rev2 2026-10-24):
   * penyerahan = owner menyerahkan → guru penerima (wajah referensi wajib);
   * rapat = semua guru terupload HARUS tampak; produk barang = latar ruang
   * rapat sesuai foto ruangan terupload. orangList = daftar guru yang foto
   * wajahnya benar-benar dipakai (fallback otomatis bila belum dipilih).
   */
  const buildPromptSlot = useCallback((slot, orangList) => {
    const pakaianLabel = PAKAIAN_OPTIONS.find((p) => p.id === pakaian)?.label || 'Formal'
    const suasanaLabel = SUASANA_OPTIONS.find((s) => s.id === suasana)?.label || 'Ruang Rapat'
    const uraian = transaction?.uraian || 'Kegiatan sekolah'
    const guruStr = (orangList || []).join(', ') || 'guru sekolah'
    const itemsStr = items.trim() || 'pesanan yang dibeli'
    const gaya = 'Gaya foto dokumentasi resmi sekolah, natural, tidak staged.'
    const latarRuang = 'Latar ruangan HARUS persis sesuai foto ruangan terlampir (ruang rapat sekolah asli).'
    if (slot.id === 'penyerahan') {
      const penyerah = ownerFoto && ownerSlot
        ? `${ownerSlot.labelPrompt} (wajah persis sesuai foto referensi TERAKHIR terlampir)`
        : 'pemilik warung/toko'
      const tempat = activityKey === 'atk' ? 'di depan toko alat tulis (luar ruangan sekolah)' : 'di depan warung makan (luar ruangan sekolah)'
      return `Foto dokumentasi serah terima barang DI LUAR RUANGAN SEKOLAH: ${penyerah} menyerahkan ${itemsStr} kepada salah satu guru (${guruStr}) yang menerimanya — guru penerima WAJIB tampak jelas dalam foto dengan wajah persis sesuai foto referensi terlampir (jangan mengubah wajah, jangan mengganti peran). ${tempat}. Pakaian: ${pakaianLabel}. Kegiatan: ${uraian}. ${gaya}`
    }
    if (slot.id === 'box') {
      return `Foto produk dokumentasi: ${itemsStr} tersusun rapi di atas meja ruang rapat sekolah, terlihat jelas jumlah dan isi boxnya, tanpa orang. ${latarRuang} Kegiatan: ${uraian}. ${gaya}`
    }
    if (slot.id === 'atk_beli') {
      return `Foto produk dokumentasi: barang belanja (${itemsStr}) tersusun rapi di atas meja ruang rapat sekolah, terlihat jelas setiap itemnya, tanpa orang. ${latarRuang} Kegiatan: ${uraian}. ${gaya}`
    }
    // rapat (default) — kunci: SEMUA guru terpilih/terfallback HARUS tampak
    return `Foto dokumentasi rapat di ${suasanaLabel}: guru ${guruStr} duduk mengelilingi meja rapat, SEMUA guru yang disebut HARUS tampak dalam foto dengan wajah masing-masing persis sesuai foto referensi terlampir (jangan mengubah wajah, jangan menambah orang imajiner), suasana diskusi kegiatan sekolah. Pakaian: ${pakaianLabel}. Kegiatan: ${uraian}. ${latarRuang} ${gaya}`
  }, [pakaian, suasana, activityKey, transaction, ownerFoto, ownerSlot, items])

  /** Petakan error puter.js → pesan ramah bahasa Indonesia (kode auth dikenali). */
  const pesanErrorPuter = (err) => {
    const kode = err?.error?.code || err?.code || err?.error || ''
    const teks = err?.message || err?.msg || ''
    if (kode === 'popup_blocked' || /popup was blocked/i.test(teks)) {
      return 'Popup sign-in Puter diblokir browser. Izinkan popup untuk situs ini (ikon di address bar), lalu klik Generate lagi.'
    }
    if (kode === 'auth_window_closed' || kode === 'auth_canceled' || /window was closed/i.test(teks)) {
      return 'Sign-in Puter dibatalkan. Klik Generate lagi untuk masuk — sekali saja, setelah itu tidak diminta lagi.'
    }
    if (kode === 'insufficient_funds' || /insufficient/i.test(teks)) {
      return 'Kuota AI Puter habis untuk akun ini. Coba lagi nanti atau pakai akun Puter lain.'
    }
    // Semua akun rotasi habis (generateDenganRotasi melempar error kuota
    // terakhir setelah seluruh daftar dicoba) → ajak tambah akun baru
    if (adalahErrorKuota(err)) {
      return 'Kuota AI Puter habis untuk semua akun tersimpan. Tambahkan akun Puter lain lewat tombol "+ Tambah akun" di bagian Akun Puter, atau coba lagi nanti (kuota bisa reset).'
    }
    return teks || 'Gagal generate gambar'
  }

  /** Generate satu slot set foto. timpaId = id foto lama yang ditimpa (regenerate). */
  const handleGenerateSlot = async (slot, timpaId = null) => {
    setIsGenerating(true)
    setError(null)
    setInfoRotasi(null)
    setDibatalkan(false)
    setSlotAktif(slot.id)
    batalRef.current = false
    const genId = ++genIdRef.current
    // KUNCI KONSEP (rev2): slot berorang WAJIB memakai foto wajah guru yang
    // diupload — bila user belum memilih siapa pun, otomatis pakai guru
    // pertama yang punya foto (jangan pernah generate tanpa referensi wajah).
    let orangTerpakai = [...selectedOrangList]
    if (slot.butuhOrang && orangTerpakai.length === 0 && orangWithPhotos.length > 0) {
      orangTerpakai = [orangWithPhotos[0].nama]
    }
    // Input images per slot: wajah personel terpilih + owner (penyerahan),
    // foto ruangan (rapat & produk barang — kunci latar ruang rapat asli).
    const faceImages = slot.butuhOrang
      ? orangTerpakai.map((n) => personelPhotos[n]?.dataUrl).filter(Boolean)
      : []
    if (slot.butuhOwner && ownerFoto) faceImages.push(ownerFoto)
    const metaFoto = {
      prompt: buildPromptSlot(slot, orangTerpakai),
      tipeFoto: slot.id,
      tipeLabel: slot.label,
      pakaian: PAKAIAN_OPTIONS.find((p) => p.id === pakaian)?.label,
      suasana: SUASANA_OPTIONS.find((s) => s.id === suasana)?.label,
      orangList: orangTerpakai,
      pakaiRuang: !!(slot.butuhRuang && ruangFoto),
      pakaiOwner: !!(slot.butuhOwner && ownerFoto),
      timestamp: Date.now(),
    }
    try {
      // Belum sign-in Puter → buka popup sign-in LANGSUNG dari klik ini
      // (gesture murni → browser menjamin popup tidak diblokir). Sekali
      // berhasil, token tersimpan dan generate berikutnya tanpa popup.
      if (signin === 'belum') {
        await masukPuter()
        setSignin('ya')
        // Token sesi baru → daftarkan sebagai akun rotasi (bila belum ada)
        await tambahAkunDariSesi().catch(() => {})
        setAkunVersi((v) => v + 1)
      }
      // Rotasi kuota otomatis: kena limit di akun aktif → pindah akun
      // berikutnya → retry (lihat services/puterAkun.js). Semua akun habis
      // → throw → pesan ajak tambah akun. onRotasi = info ramah di UI.
      const image = await generateDenganRotasi(() => generateDocumentationImage({
        prompt: metaFoto.prompt,
        activity: activityKey,
        faceImages,
        ruangImage: slot.butuhRuang ? ruangFoto : null,
      }), {
        onRotasi: (labelGagal, labelSukses) => {
          setInfoRotasi(`Kuota akun "${labelGagal}" habis — foto dibuat dengan akun "${labelSukses}".`)
        },
      })
      // Dibatalkan user / generate baru dimulai → hasil diabaikan (tidak disimpan)
      if (batalRef.current || genId !== genIdRef.current) return
      simpanFoto({ ...metaFoto, dataUrl: image, fallback: false }, timpaId)
      setSlotSelesai((prev) => [...new Set([...prev, slot.id])])
    } catch (err) {
      if (batalRef.current || genId !== genIdRef.current) return
      // Gagal (offline/error Puter/sign-in dibatalkan) → error jujur + fallback
      // placeholder berlabel (R-3.2) — aplikasi tetap menghasilkan sesuatu.
      setError(pesanErrorPuter(err))
      try {
        const image = await generatePlaceholderImage(metaFoto.prompt)
        if (batalRef.current || genId !== genIdRef.current) return
        simpanFoto({ ...metaFoto, dataUrl: image, fallback: true }, timpaId)
        setSlotSelesai((prev) => [...new Set([...prev, slot.id])])
      } catch {
        /* placeholder canvas tidak bisa gagal realistis; error utama sudah tampil */
      }
    } finally {
      if (genId === genIdRef.current && !batalRef.current) {
        setIsGenerating(false)
        setSlotAktif(null)
      }
    }
  }

  /** Generate semua slot set foto berurutan (progress per slot, bisa di-Stop). */
  const handleGenerateSemua = async () => {
    for (let i = 0; i < setFoto.length; i++) {
      if (batalRef.current) break
      const slot = setFoto[i]
      setProgressSemua({ i: i + 1, n: setFoto.length, label: slot.label })
      await handleGenerateSlot(slot)
      if (batalRef.current) break
    }
    setProgressSemua(null)
  }

  /** Stop generate: proses di belakang diabaikan, hasilnya tidak disimpan. */
  const handleBatal = () => {
    batalRef.current = true
    setIsGenerating(false)
    setSlotAktif(null)
    setProgressSemua(null)
    setDibatalkan(true)
  }

  /** Upload foto owner pihak luar → resize 512 → persist per aktivitas. */
  const handleUploadOwner = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !ownerSlot) return
    try {
      const dataUrl = await resizeImage(await bacaFileDataUrl(file), 512)
      const semua = (() => { try { return JSON.parse(localStorage.getItem(OWNER_KEY) || '{}') } catch { return {} } })()
      semua[activityKey] = { dataUrl, name: file.name, uploadedAt: Date.now() }
      localStorage.setItem(OWNER_KEY, JSON.stringify(semua))
      setOwnerVersi((v) => v + 1) // picu re-render (localStorage bukan state)
    } catch {
      setError('Gagal memuat foto owner — coba file gambar lain (JPG/PNG).')
    }
  }

  /** Hapus foto owner aktivitas ini. */
  const handleHapusOwner = () => {
    const semua = (() => { try { return JSON.parse(localStorage.getItem(OWNER_KEY) || '{}') } catch { return {} } })()
    delete semua[activityKey]
    localStorage.setItem(OWNER_KEY, JSON.stringify(semua))
    setOwnerVersi((v) => v + 1)
  }

  /**
   * Sprint 023 (R-3): upload foto ruang untuk transaksi ini → resize 512 →
   * persist di spj_ruang_lokal[rowKey][slot]. Global ruangan_photos TIDAK diubah.
   */
  const handleUploadRuang = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const slot = slotUploadRef.current || slotRuangan || 'umum'
    slotUploadRef.current = null
    try {
      const dataUrl = await resizeImage(await bacaFileDataUrl(file), 512)
      const semua = (() => { try { return JSON.parse(localStorage.getItem(RUANG_LOKAL_KEY) || '{}') } catch { return {} } })()
      semua[rowKey] = { ...(semua[rowKey] || {}), [slot]: { dataUrl, name: file.name, uploadedAt: Date.now() } }
      localStorage.setItem(RUANG_LOKAL_KEY, JSON.stringify(semua))
      setRuangVersi((v) => v + 1)
    } catch {
      setError('Gagal memuat foto ruang — coba file gambar lain (JPG/PNG).')
    }
  }

  /** Hapus foto ruang lokal satu slot (khusus transaksi ini, global utuh). */
  const handleHapusRuang = (slot) => {
    const semua = (() => { try { return JSON.parse(localStorage.getItem(RUANG_LOKAL_KEY) || '{}') } catch { return {} } })()
    if (semua[rowKey]) {
      delete semua[rowKey][slot]
      if (Object.keys(semua[rowKey]).length === 0) delete semua[rowKey]
      localStorage.setItem(RUANG_LOKAL_KEY, JSON.stringify(semua))
      setRuangVersi((v) => v + 1)
    }
  }

  // ── Multi-akun Puter (rotasi kuota otomatis) ──────────────────────────
  // UI kelola = <PuterAkunManager variant="card" /> di bawah (komponen
  // bersama dengan tab "Akun AI" halaman Pengaturan).

  /** Baca File → dataURL (untuk resizeImage). */
  const bacaFileDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Gagal membaca file'))
    reader.readAsDataURL(file)
  })

  /** Simpan foto: timpaId = regenerate (timpa foto lama), null = foto baru. */
  const simpanFoto = (foto, timpaId = null) => {
    if (timpaId) {
      onRegenerasiFoto(timpaId, foto)
      setSuksesId(timpaId)
    } else {
      const id = onFotoBaru(foto)
      setSuksesId(id)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-primary/25 shadow-sm overflow-hidden">
      {/* Header — premium: aksen gradient primary + chip AI */}
      <div className="px-5 py-4 bg-gradient-to-r from-primary/5 to-blue-50/60 border-b border-primary/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-md shadow-primary/30">
            <span className="material-symbols-outlined text-white text-xl">auto_awesome</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
              Generate Foto Dokumentasi AI
              <span className="px-1.5 py-0.5 rounded-md bg-primary text-white text-[9px] font-bold tracking-wider">AI</span>
            </p>
            <p className="text-[10px] text-slate-500">Fitur premium — foto langsung masuk Panel Preview</p>
          </div>
          {fotoAi.length > 0 && (
            <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold">{fotoAi.length} foto</span>
          )}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Aktivitas */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Aktivitas:</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
            <span className="material-symbols-outlined text-xs">{activityConfig?.icon || 'auto_awesome'}</span>
            {activityConfig?.name || 'Dokumentasi'}
          </span>
        </div>

        {/* Langkah 1: Pakaian */}
        <div>
          <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">1</span>
            Pilih Pakaian
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {PAKAIAN_OPTIONS.map((opt) => (
              <ChipOpsi key={opt.id} opt={opt} aktif={pakaian === opt.id} onClick={() => setPakaian(opt.id)} />
            ))}
          </div>
        </div>

        {/* Langkah 2: Suasana */}
        <div>
          <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">2</span>
            Pilih Suasana
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {SUASANA_OPTIONS.map((opt) => (
              <ChipOpsi key={opt.id} opt={opt} aktif={suasana === opt.id} onClick={() => setSuasana(opt.id)} />
            ))}
          </div>
          {/* Status foto ruangan referensi — dipakai sebagai input image (Sprint 020 revisi).
              Sprint 023 (R-3): upload/hapus ruang per transaksi (lokal). */}
          {suasana !== 'outdoor' && (
            ruangFoto ? (
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-xl p-2">
                  <img src={ruangFoto} alt="Foto ruangan referensi" className="w-9 h-9 rounded-lg object-cover ring-1 ring-primary/30 flex-shrink-0" />
                  <span className="text-[10px] text-primary leading-tight flex-1">
                    <span className="font-bold">Foto ruangan terpakai{ruangDariLokal ? ' (transaksi ini)' : ''}</span> — latar foto rapat &amp; foto produk barang mengikuti ruangan asli sekolah.
                  </span>
                  <button type="button" onClick={() => { slotUploadRef.current = slotRuangan; fileRuangRef.current?.click() }} className="text-[9px] px-2 py-1 rounded-lg bg-white text-primary border border-primary/30 font-bold hover:bg-primary/10 transition-colors flex-shrink-0">Ganti</button>
                  {ruangDariLokal && (
                    <button type="button" onClick={() => handleHapusRuang(slotRuangan)} title="Hapus foto ruang transaksi ini" className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 flex-shrink-0">
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  )}
                </div>
                {slotLokalLain.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[9px] text-slate-400">Ruang lain transaksi ini:</span>
                    {slotLokalLain.map((s) => (
                      <span key={s} className="inline-flex items-center gap-1 text-[9px] font-semibold bg-slate-100 text-slate-600 rounded-full pl-2 pr-1 py-0.5">
                        {s}
                        <button type="button" onClick={() => handleHapusRuang(s)} title={`Hapus ruang ${s} transaksi ini`} className="p-0.5 rounded-full hover:bg-slate-300 hover:text-slate-800">
                          <span className="material-symbols-outlined text-[12px]">close</span>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <button type="button" onClick={() => { slotUploadRef.current = slotRuangan; fileRuangRef.current?.click() }} className="w-full flex items-center justify-center gap-2 min-h-[36px] rounded-xl border border-dashed border-slate-300 bg-slate-50 text-[10px] font-semibold text-slate-500 hover:border-primary/40 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-sm">upload</span>
                  Upload foto ruang lain untuk transaksi ini
                </button>
                <input ref={fileRuangRef} type="file" accept="image/*" onChange={handleUploadRuang} className="hidden" />
              </div>
            ) : (
              <div className="mt-2 space-y-1.5">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-[10px] text-slate-500 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-slate-400">info</span>
                  Foto ruangan belum diupload — hasil AI pakai latar imajinasi. Upload di Data Sekolah → Foto Referensi → Ruangan untuk latar asli.
                </div>
                <button type="button" onClick={() => { slotUploadRef.current = slotRuangan; fileRuangRef.current?.click() }} className="w-full flex items-center justify-center gap-2 min-h-[36px] rounded-xl border border-dashed border-slate-300 bg-slate-50 text-[10px] font-semibold text-slate-500 hover:border-primary/40 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-sm">upload</span>
                  Upload foto ruang untuk transaksi ini
                </button>
                <input ref={fileRuangRef} type="file" accept="image/*" onChange={handleUploadRuang} className="hidden" />
              </div>
            )
          )}
        </div>

        {/* Langkah 3: Orang yang hadir */}
        <div>
          <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">3</span>
            Pilih Orang yang Hadir
            <span className="text-[9px] font-normal text-slate-400 ml-1">(opsional)</span>
          </h4>
          {!orangHasPhotos ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-slate-400">info</span>
              Upload foto personel di Data Sekolah → Tab Foto Personel terlebih dahulu
            </div>
          ) : (
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              <div className="flex gap-1.5 mb-2">
                <button type="button" onClick={() => {
                  const all = {}
                  orangWithPhotos.forEach((g) => { all[g.nama] = true })
                  setSelectedOrang(all)
                }} className="text-[9px] px-2 py-1 rounded-lg bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors">Pilih Semua</button>
                <button type="button" onClick={() => setSelectedOrang({})} className="text-[9px] px-2 py-1 rounded-lg bg-slate-100 text-slate-500 font-bold hover:bg-slate-200 transition-colors">Hapus Semua</button>
              </div>
              {orangWithPhotos.map((g) => (
                <label key={g.nama} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all ${
                  selectedOrang[g.nama] ? 'bg-primary/10 border border-primary/40' : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                }`}>
                  <img src={personelPhotos[g.nama]?.dataUrl} alt={g.nama} className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200" />
                  <span className="text-xs font-semibold text-slate-700 flex-1">{g.nama}</span>
                  <span className="text-[9px] text-slate-400">{g.jabatan || 'Guru'}</span>
                  <input type="checkbox" checked={!!selectedOrang[g.nama]} onChange={() => setSelectedOrang((prev) => ({ ...prev, [g.nama]: !prev[g.nama] }))} className="w-4 h-4 rounded border-slate-300 accent-[#004ac6]" />
                </label>
              )              )}
            </div>
          )}
          {orangHasPhotos && selectedOrangList.length === 0 && (
            <p className="text-[9px] text-slate-400 mt-1.5">
              Belum ada yang dipilih — foto penyerahan &amp; rapat otomatis memakai foto guru pertama yang tersedia (wajah guru tetap masuk foto).
            </p>
          )}
        </div>

        {/* Langkah 4: Foto owner pihak luar (sesuai kebutuhan aktivitas) */}
        {ownerSlot && (
          <div>
            <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">4</span>
              Foto {ownerSlot.label}
              <span className="text-[9px] font-normal text-slate-400 ml-1">(opsional)</span>
            </h4>
            {ownerFoto ? (
              <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-xl p-2">
                <img src={ownerFoto} alt={ownerSlot.label} className="w-9 h-9 rounded-lg object-cover ring-1 ring-primary/30 flex-shrink-0" />
                <span className="text-[10px] text-primary leading-tight flex-1">
                  <span className="font-bold">{ownerSlot.label}</span> ikut dalam foto sebagai penyerah.
                </span>
                <button type="button" onClick={() => fileOwnerRef.current?.click()} className="text-[9px] px-2 py-1 rounded-lg bg-white text-primary border border-primary/30 font-bold hover:bg-primary/10 transition-colors flex-shrink-0">Ganti</button>
                <button type="button" onClick={handleHapusOwner} title="Hapus foto owner" className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 flex-shrink-0">
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileOwnerRef.current?.click()} className="w-full flex items-center justify-center gap-2 min-h-[40px] rounded-xl border border-dashed border-slate-300 bg-slate-50 text-[11px] font-semibold text-slate-500 hover:border-primary/40 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-base">upload</span>
                Upload foto {ownerSlot.label}
              </button>
            )}
            <input ref={fileOwnerRef} type="file" accept="image/*" onChange={handleUploadOwner} className="hidden" />
          </div>
        )}

        {/* Langkah 5: Rincian item & jumlah (dari surat perencanaan) — dipakai slot box/ATK */}
        {setFoto.some((s) => s.butuhItems) && (
          <div>
            <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">5</span>
              Rincian Item &amp; Jumlah
              <span className="text-[9px] font-normal text-slate-400 ml-1">(dari surat perencanaan)</span>
            </h4>
            <textarea
              value={items}
              onChange={(e) => setItemsPersist(e.target.value)}
              placeholder={activityKey === 'atk'
                ? 'Contoh: 2 lusin spidol, 5 rim kertas HVS A4, 1 dus pulpen'
                : 'Contoh: 6 nasi box, 4 snack box, 10 minuman botol'}
              rows={2}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-700 placeholder:text-slate-400 focus:border-primary/40 focus:bg-white focus:outline-none resize-none"
            />
            <p className="text-[9px] text-slate-400 mt-1">Salin rincian dari surat perencanaan yang diupload — dipakai di foto penyerahan &amp; foto produk.</p>
          </div>
        )}

        {/* Set foto yang dibutuhkan per kegiatan — generate per slot */}
        <div>
          <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-primary">photo_library</span>
            Set Foto yang Dibutuhkan
            <span className="text-[9px] font-normal text-slate-400 ml-1">({setFoto.length} foto · {setFoto.length}x kuota AI)</span>
          </h4>
          <div className="space-y-1.5">
            {setFoto.map((slot) => {
              const nAda = fotoAi.filter((f) => f.tipeFoto === slot.id).length
              const sedang = slotAktif === slot.id && isGenerating
              return (
                <div key={slot.id} className={`flex items-center gap-2 rounded-xl p-2 border transition-all ${
                  sedang ? 'bg-primary/10 border-primary/40' : nAda > 0 ? 'bg-primary/5 border-primary/20' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className={`material-symbols-outlined text-base flex-shrink-0 ${nAda > 0 ? 'text-primary' : 'text-slate-400'}`}>{slot.icon}</span>
                  <span className="text-[11px] font-semibold text-slate-700 flex-1 min-w-0 truncate">{slot.label}</span>
                  {nAda > 0 && <span className="text-[9px] text-primary font-bold flex-shrink-0">✓ {nAda}</span>}
                  <button
                    type="button"
                    disabled={isGenerating}
                    onClick={() => handleGenerateSlot(slot)}
                    className="text-[9px] px-2.5 py-1.5 rounded-lg bg-primary text-white font-bold hover:brightness-110 transition-all disabled:opacity-40 flex-shrink-0"
                  >
                    {sedang ? '...' : 'Generate'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-slate-50 border border-slate-300 text-slate-700 p-3 rounded-xl text-[11px] flex items-start gap-2">
            <span className="material-symbols-outlined text-sm shrink-0 text-slate-500">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Info rotasi akun — kuota habis di satu akun, lanjut akun berikutnya */}
        {infoRotasi && !isGenerating && (
          <div className="bg-primary/5 border border-primary/20 text-primary p-3 rounded-xl text-[11px] flex items-start gap-2">
            <span className="material-symbols-outlined text-sm shrink-0">swap_horiz</span>
            <span>{infoRotasi}</span>
          </div>
        )}

        {/* Sukses — foto sudah masuk Panel Preview */}
        {suksesId && !isGenerating && (
          <div className="bg-primary/5 border border-primary/20 text-primary p-3 rounded-xl text-[11px] flex items-start gap-2">
            <span className="material-symbols-outlined text-sm shrink-0">check_circle</span>
            <span>Foto masuk ke <span className="font-bold">Panel Preview Document</span> — lihat di panel sebelah kanan.</span>
          </div>
        )}

        {/* Peringatan fallback — foto placeholder, bukan foto AI (R-3.2 jujur) */}
        {error && fotoAi.some((f) => f.fallback) && !isGenerating && (
          <div className="bg-slate-50 border border-slate-300 text-slate-600 p-3 rounded-xl text-[11px] flex items-start gap-2">
            <span className="material-symbols-outlined text-sm shrink-0 text-slate-400">image</span>
            <span>Foto <span className="font-bold">placeholder</span> dibuat sebagai cadangan (AI tidak tersedia). Coba Generate lagi saat koneksi membaik.</span>
          </div>
        )}

        {/* Status sign-in Puter — popup dibuka dari klik Generate (gesture murni) */}
        {signin === 'belum' && !isGenerating && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-start gap-2">
            <span className="material-symbols-outlined text-sm text-primary shrink-0 mt-0.5">login</span>
            <span className="text-[11px] text-slate-600 leading-snug">
              Belum masuk ke <span className="font-bold text-primary">Puter</span> — klik Generate di bawah, jendela sign-in akan terbuka (sekali saja, akun gratis, tanpa API key).
            </span>
          </div>
        )}

        {/* Multi-akun Puter — rotasi kuota otomatis (Sprint 020 tambahan):
            kuota habis di akun aktif → Generate otomatis pindah akun berikutnya.
            Kelola lengkap juga tersedia di Pengaturan → tab "Akun AI". */}
        {signin === 'ya' && !isGenerating && (
          <PuterAkunManager variant="card" refreshKey={akunVersi} />
        )}

        {/* Tombol Generate Semua / Stop — keluarga tombol aplikasi + pembeda premium */}
        {isGenerating ? (
          <button
            type="button"
            onClick={handleBatal}
            className="w-full flex items-center justify-center gap-2 min-h-[44px] rounded-xl text-sm font-bold text-slate-700
                       bg-slate-200 ring-1 ring-slate-300 hover:bg-slate-300 transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-lg">stop_circle</span>
            Stop Generate
          </button>
        ) : (
          <button
            type="button"
            onClick={handleGenerateSemua}
            className="w-full flex items-center justify-center gap-2 min-h-[44px] rounded-xl text-sm font-bold text-white
                       bg-gradient-to-r from-primary to-blue-600 shadow-lg shadow-primary/30
                       ring-1 ring-primary/20 hover:brightness-110 transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-lg">auto_awesome</span>
            Generate Semua Foto ({setFoto.length})
            <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[9px] font-bold tracking-wider">AI</span>
          </button>
        )}

        {/* Generating */}
        {isGenerating && (
          <div className="flex flex-col items-center py-4">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent mb-3" />
            <p className="text-sm font-semibold text-slate-700">
              {progressSemua
                ? `Foto ${progressSemua.i}/${progressSemua.n} — ${progressSemua.label}...`
                : 'Generating foto dokumentasi...'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Tunggu 10-60 detik — foto dibuat oleh AI</p>
          </div>
        )}

        {/* Dibatalkan — jujur: proses di belakang diabaikan, kuota bisa terpakai */}
        {dibatalkan && !isGenerating && (
          <div className="bg-slate-50 border border-slate-300 text-slate-600 p-3 rounded-xl text-[11px] flex items-start gap-2">
            <span className="material-symbols-outlined text-sm shrink-0 text-slate-400">stop_circle</span>
            <span>Generate <span className="font-bold">dibatalkan</span> — foto tidak disimpan. Proses yang sudah berjalan di server mungkin tetap memakai kuota.</span>
          </div>
        )}

        {/* Hint sign-in Puter (User-Pays, akun gratis) — jujur sejak awal */}
        {!isGenerating && (
          <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-xs">info</span>
            Pemakaian pertama dapat memunculkan popup sign-in Puter (akun gratis)
          </p>
        )}

        {/* Daftar foto AI (regenerate per slot tipe) — hapus lewat daftar gabungan di atas */}
        {fotoAi.length > 0 && !isGenerating && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Foto AI di Panel Preview</p>
            {fotoAi.map((f) => {
              const slotTipe = setFoto.find((s) => s.id === f.tipeFoto)
              return (
                <div key={f.id} className="flex items-center gap-2 rounded-xl p-2 border bg-slate-50 border-slate-200">
                  <img src={f.dataUrl} alt={f.caption || 'Foto AI'} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                  <span className="text-[11px] text-slate-600 flex-1 min-w-0 truncate">
                    <span className="font-bold text-slate-700">{f.tipeLabel || slotTipe?.label || 'Foto'}</span>
                    {f.orangList?.length ? ` · ${f.orangList.length} orang` : ''}
                    {f.fallback && <span className="ml-1.5 px-1 py-0.5 rounded bg-slate-200 text-slate-500 text-[9px] font-bold">placeholder</span>}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleGenerateSlot(slotTipe || SET_FOTO_DEFAULT[0], f.id)}
                    title="Regenerate foto ini (menimpa)"
                    className="p-1.5 rounded-lg text-primary hover:bg-primary/10 flex-shrink-0"
                  >
                    <span className="material-symbols-outlined text-sm">refresh</span>
                  </button>
                  <button type="button" onClick={() => onHapusFoto && onHapusFoto(f.id)} title="Hapus" className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 flex-shrink-0">
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
