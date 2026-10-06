import TemplateEngine from './TemplateEngine'
import SummaryCard from './SummaryCard'
import PeringatanData from './blocks/PeringatanData'
import { TEMPLATE_CONFIGS } from '../../data/templateConfig'
import { bagiPesananPerSeksi } from '../../utils/aturanMamin'

// Sprint 009: pecahan DokumenFormPreview — preview + area cetak Makan & Minum.
// Ekstraksi murni renderMaminPreview (tanpa ubah perilaku); props minimal.
// Revisi 2026-10-06 (task 37): mode printOnly — hanya area cetak formal
// (dipakai form agar cetak tetap ada walau tampilan Ringkasan dihapus).
export default function MaminPreview({ formData, setViewMode, selectedSub, printOnly = false }) {
  const bukuTamuCfg = TEMPLATE_CONFIGS.buku_tamu
  const notulenCfg = TEMPLATE_CONFIGS.notulen
  const rows = (formData.rows || []).map((r, i) => ({ ...r, no: i + 1 }))
  const pesertaNames = rows.map((r) => r.nama).filter(Boolean).join(', ')

  // Sprint 009 Fase A: pesanan dipecah 2 surat (1 logika bagi utk A1/A2/A3)
  const pesanan = bagiPesananPerSeksi(formData)
  const adaPesanan = Boolean(formData.nomorPesanan || formData.kepadaPesanan || (formData.pesananRows || []).length > 0)
  const perihalSeksi = (seksi) => (formData.perihalPesanan ? `${formData.perihalPesanan} — ${seksi}` : seksi)
  const kartuPesanan = (seksi, rowsSeksi) => ({ title: 'Pesanan', fields: [
    { label: 'Nomor', value: formData.nomorPesanan },
    { label: 'Kepada', value: formData.kepadaPesanan },
    { label: 'Perihal', value: perihalSeksi(seksi) },
    { label: 'Kegiatan', value: formData.isiPesanan || formData.acara },
    { label: 'Item', value: rowsSeksi.length },
  ] })

  // Buku Tamu Kedinasan — dari form khusus (formData.bukuTamu)
  const bt = formData.bukuTamu || {}
  const btRows = (bt.rows || []).map((r, i) => ({ ...r, no: i + 1 }))
  const hasBukuTamu = Boolean(bt.noUrut || bt.tanggal || bt.bertemu || btRows.length > 0)
  const bukuTamuData = {
    ...bukuTamuCfg.defaults,
    ...formData,
    noUrut: bt.noUrut || '',
    tanggal: bt.tanggal || formData.tanggal,
    bertemu: bt.bertemu || '',
    tiba: bt.tiba || '',
    kembali: bt.kembali || '',
    diterima: bt.diterima || 'Kepala Sekolah',
    tujuan: bt.tujuan || formData.acara || '',
    uraianKegiatan: bt.uraian || '',
    rows: btRows,
  }
  const notulenData = {
    ...notulenCfg.defaults,
    ...formData,
    nomor: formData.nomor,
    tanggal: formData.tanggal,
    waktu: formData.waktu,
    tempat: formData.tempat,
    acara: formData.acara,
    pimpinan: formData.pimpinan,
    pembuka: formData.pembuka,
    notulen: formData.notulen,
    peserta: formData.peserta || pesertaNames,
    poinPembahasan: Array.isArray(formData.poinPembahasan)
      ? formData.poinPembahasan
      : (formData.resume ? [{ id: 'resume-1', text: formData.resume }] : []),
    rows,
  }

  // ─── Sprint 003 FASE 2: seksi ringkasan Mamin (layar-only, 0 kop 0 TTD) ───
  const HADIR_COLS = [
    { key: 'no', label: 'No' },
    { key: 'nama', label: 'Nama' },
    { key: 'jabatan', label: 'Jabatan' },
  ]
  const maminAcaraSections = () => ([
    { title: 'Detail Acara', fields: [
      { label: 'Nomor Surat', value: formData.nomor },
      { label: 'Tanggal', value: formData.tanggal },
      { label: 'Waktu', value: formData.waktu },
      { label: 'Tempat', value: formData.tempat },
      { label: 'Acara', value: formData.acara },
      { label: 'Resume', value: formData.resume },
    ] },
    { title: `Daftar Hadir (${rows.length})`, table: {
      columns: HADIR_COLS,
      rows: rows.map((r) => ({ id: r.id, no: r.no, nama: r.nama || '', jabatan: r.jabatan || '' })),
    } },
  ])

  const handlePrint = () => {
    const printContainer = document.querySelector('.sk-print-area .print-container')
    if (printContainer) {
      printContainer.classList.remove('portrait', 'landscape')
      printContainer.classList.add('portrait')
    }
    window.print()
  }

  return (
    <div className="space-y-6">
      {!printOnly && (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary">
          <span className="material-symbols-outlined">description</span>
          <span className="text-sm font-bold">Preview: Makan & Minum — {selectedSub?.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('form')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all"
          >
            <span className="material-symbols-outlined text-lg">edit</span>
            Kembali ke Form
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/30 hover:brightness-110 transition-all"
          >
            <span className="material-symbols-outlined text-lg">print</span>
            Cetak
          </button>
        </div>
      </div>
      )}

      {/* Sprint 003 FASE 2: layar = kartu ringkasan (0 kop, 0 TTD).
          Dokumen formal hanya di area cetak Fase 3 di bawah. */}
      {!printOnly && <PeringatanData />}
      {!printOnly && <SummaryCard title="Ringkasan Makan & Minum" icon="list_alt" sections={maminAcaraSections()} />}

      {/* Dokumen 1: Buku Tamu Kedinasan (hanya jika diisi) */}
      {!printOnly && hasBukuTamu && (
        <SummaryCard title="Buku Tamu Kedinasan" icon="import_contacts" sections={[
          { title: 'Kunjungan', fields: [
            { label: 'No Urut', value: bukuTamuData.noUrut },
            { label: 'Tanggal', value: bukuTamuData.tanggal },
            { label: 'Bertemu', value: bukuTamuData.bertemu },
            { label: 'Tiba', value: bukuTamuData.tiba },
            { label: 'Kembali', value: bukuTamuData.kembali },
            { label: 'Diterima', value: bukuTamuData.diterima },
            { label: 'Tujuan', value: bukuTamuData.tujuan },
          ] },
          { title: `Tamu (${btRows.length})`, table: {
            columns: HADIR_COLS,
            rows: btRows.map((r) => ({ id: r.id, no: r.no, nama: r.nama || '', jabatan: r.jabatan || '' })),
          } },
        ]} />
      )}

      {/* Dokumen 2: Notulen / Resume */}
      {!printOnly && (
      <SummaryCard title="Notulen / Resume" icon="description" sections={[
        { title: 'Rapat', fields: [
          { label: 'Nomor', value: notulenData.nomor },
          { label: 'Tanggal', value: notulenData.tanggal },
          { label: 'Waktu', value: notulenData.waktu },
          { label: 'Tempat', value: notulenData.tempat },
          { label: 'Acara', value: notulenData.acara },
          { label: 'Pimpinan', value: notulenData.pimpinan },
          { label: 'Peserta', value: notulenData.peserta },
          { label: 'Poin', value: notulenData.poinPembahasan },
        ] },
      ]} />
      )}

      {/* Dokumen 2b: Daftar Hadir (sudah tercakup di kartu utama) */}

      {/* Dokumen 3: Surat Undangan */}
      {!printOnly && (formData.nomorUndangan || formData.kepadaUndangan || formData.isiUndangan) && (
        <SummaryCard title="Surat Undangan" icon="mail" sections={[
          { title: 'Undangan', fields: [
            { label: 'Nomor', value: formData.nomorUndangan },
            { label: 'Kepada', value: formData.kepadaUndangan },
            { label: 'Tanggal Acara', value: formData.tanggalAcara || formData.tanggal },
            { label: 'Tempat Acara', value: formData.tempatAcara || formData.tempat },
            { label: 'Isi', value: formData.isiUndangan || formData.acara },
          ] },
        ]} />
      )}

      {/* Dokumen 4: Surat Pesanan — pecah 2 per seksi (Sprint 009 Fase A) */}
      {!printOnly && adaPesanan && pesanan.nasi.length === 0 && pesanan.snack.length === 0 && (
        <p className="text-sm text-slate-500 p-6 text-center">
          Tidak ada seksi aktif. Aktifkan Seksi Nasi Box atau Snack Box di form.
        </p>
      )}
      {!printOnly && pesanan.nasi.length > 0 && (
        <SummaryCard title="Surat Pesanan — Nasi Box" icon="shopping_cart" sections={[
          kartuPesanan('Nasi Box', pesanan.nasi),
        ]} />
      )}
      {!printOnly && pesanan.snack.length > 0 && (
        <SummaryCard title="Surat Pesanan — Snack Box" icon="shopping_cart" sections={[
          kartuPesanan('Snack Box', pesanan.snack),
        ]} />
      )}

      {/* ─── Sprint 003 FASE 3: area cetak Mamin = 5 dokumen formal kop→TTD.
          .sk-print-area: hidden di layar, block saat print; tiap .sk-doc-print
          ganti halaman (anti-terpotong). Builder data dipakai ulang apa adanya. */}
      <div className="sk-print-area">
        <div className="sk-doc-print">
          <TemplateEngine templateConfig={TEMPLATE_CONFIGS.undangan_mamin} data={{
            ...TEMPLATE_CONFIGS.undangan_mamin.defaults,
            ...formData,
            tanggalSurat: formData.tanggalSurat || 'Cikalongwetan, ...',
            hariUndangan: formData.hariUndangan || formData.hari || '',
            tanggalAcara: formData.tanggalAcara || formData.tanggal || '',
            tempatAcara: formData.tempatAcara || formData.tempat || '',
            waktuAcara: formData.waktuAcara || formData.waktu || '',
            kegiatan: formData.isiUndangan || formData.acara || '',
          }} mode="print" />
        </div>
        {/* Sprint 009 Fase A: 1 surat pesanan → 2 surat (Nasi dulu, Snack kedua) */}
        {pesanan.nasi.length > 0 && (
        <div className="sk-doc-print">
          <TemplateEngine templateConfig={TEMPLATE_CONFIGS.pesanan_mamin} data={{
            ...TEMPLATE_CONFIGS.pesanan_mamin.defaults,
            ...formData,
            tanggalSurat: formData.tanggalSurat || 'Cikalongwetan, ...',
            perihalPesanan: perihalSeksi('Nasi Box'),
            jenisPesanan: 'Nasi Box',
            kegiatan: formData.isiPesanan || formData.acara || '',
            rows: pesanan.nasi,
          }} mode="print" />
        </div>
        )}
        {pesanan.snack.length > 0 && (
        <div className="sk-doc-print">
          <TemplateEngine templateConfig={TEMPLATE_CONFIGS.pesanan_mamin} data={{
            ...TEMPLATE_CONFIGS.pesanan_mamin.defaults,
            ...formData,
            tanggalSurat: formData.tanggalSurat || 'Cikalongwetan, ...',
            perihalPesanan: perihalSeksi('Snack Box'),
            jenisPesanan: 'Snack Box',
            kegiatan: formData.isiPesanan || formData.acara || '',
            rows: pesanan.snack,
          }} mode="print" />
        </div>
        )}
        <div className="sk-doc-print">
          <TemplateEngine templateConfig={notulenCfg} data={notulenData} mode="print" />
        </div>
        <div className="sk-doc-print">
          <TemplateEngine templateConfig={TEMPLATE_CONFIGS.daftar_hadir} data={{
            ...TEMPLATE_CONFIGS.daftar_hadir.defaults,
            judulAcara: formData.judulDaftarHadir || formData.acara || '',
            rows,
          }} mode="print" />
        </div>
        {hasBukuTamu && (
          <div className="sk-doc-print">
            <TemplateEngine templateConfig={bukuTamuCfg} data={bukuTamuData} mode="print" />
          </div>
        )}
      </div>
    </div>
  )
}
