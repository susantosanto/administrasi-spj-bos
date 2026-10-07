/**
 * SPDForm — SURAT PERJALANAN DINAS (SPD) numbered form (pages 7+ docx)
 * Source: template/Surat Tugas + SPPD_rapat ops_gugus_2026.docx
 *
 * Sprint 002 FASE 3: blok CETAK MURNI — per penerima (perRecipient).
 * Pengeditan data dilakukan di tab form (DokumenFormPreview), bukan di blok.
 * Layout meniru docx:
 *   TABLE3 (11x4, berbingkai): butir 1–10, kolom-4 docx adalah duplikat
 *   isi kolom-3 (tembusan rangkap) sehingga dirender 3 kolom No|Uraian|Isi.
 *   TABLE4 (8x2, berbingkai): kotak Berangkat + pasangan Tiba/Berangkat
 *   berdampingan + Tiba kembali + Telah diperiksa + Catatan + PERHATIAN.
 *
 * Keputusan audit gugus task 41:
 * - G8 (P1): kolom-4 duplikat isi tabel-3 docx SENGAJA dibuang — simplifikasi
 *   tercatat, isi identik sehingga tak ada informasi hilang.
 * - G10 (P1): baris 'Dikeluarkan di / Pada tanggal + TTD Kepala SDN'
 *   DIPERTAHANKAN — format baku SPD Indonesia walau tak eksplisit di tabel-3
 *   docx (nomor SPD + Pokok berangkat ada di tabel-4).
 */
import { PlaceholderText } from '../../../utils/templateHelpers'
import { getSchoolData } from '../../../utils/sekolahData'

export default function SPDForm({ blockConfig, data = {} }) {
  // TTD 4 baris (Kepala / nama SD / nama / NIP) — dibaca live saat render.
  const sekolah = getSchoolData().namaSekolah || ''
  const val = (key, ph) => {
    const value = data[key] || ''
    return <span>{value || <PlaceholderText label={ph || key} />}</span>
  }

  const pengikutRows = data.pengikutRows || []
  const transitRows = data.transitRows || []

  const baris = (no, label, isi) => (
    <tr key={no}>
      <td className="spd-no">{no}.</td>
      <td className="spd-label">{label}</td>
      <td>{isi}</td>
    </tr>
  )

  const ttdKepala = (nama, nip, jabatan = 'Kepala') => (
    <div className="text-center w-56 ml-auto mr-0 mt-2 break-inside-avoid">
      {/* TTD tunggal Kepala Sekolah → rata kanan (task 46) */}
      <div className="text-xs font-medium">{jabatan}</div>
      <div className="text-xs font-medium mb-4">{sekolah ? `${sekolah},` : ''}</div>
      <div className="h-16" style={{ height: '64px', minHeight: '64px' }} />
      <div className="text-xs font-bold">{nama}</div>
      <div className="text-[10px] text-gray-500">NIP. {nip}</div>
    </div>
  )

  // polos=true: kotak kosong tulis tangan — nilai mentah tanpa placeholder.
  const mentah = (key) => data[key] || ''
  const kotakBerangkat = (tibaTanggal, berangkatTanggal, namaSah, nipSah, kunci, polos = false) => {
    const berangkatDari = polos ? mentah('tempatBerangkat') : val('tempatBerangkat', 'Tempat berangkat')
    const keTujuan = polos ? mentah('tempatTujuan') : val('tempatTujuan', 'Tempat tujuan')
    return (
    <div key={kunci} className="spd-kotak break-inside-avoid">
      <div className="mb-1">Berangkat dari : {berangkatDari}</div>
      <div className="text-[10px] text-gray-500 mb-1">(tempat kedudukan)</div>
      <div className="mb-1">Ke : {keTujuan}</div>
      <div className="mb-1">Pada tanggal : {tibaTanggal || (polos ? '' : val('tanggalBerangkat', 'Tanggal berangkat'))}</div>
      {berangkatTanggal ? <div className="mb-1">Berangkat pada tanggal : {berangkatTanggal}</div> : null}
      <div className="text-center w-48 ml-auto mt-2">
        <div className="text-xs font-medium mb-4">Kepala,</div>
        <div className="h-12" style={{ height: '48px', minHeight: '48px' }} />
        <div className="text-xs font-bold">{namaSah || ''}</div>
        <div className="text-[10px] text-gray-500">NIP. {nipSah || ''}</div>
      </div>
    </div>
    )
  }

  const kotakTiba = (tibaDi, tibaTanggal, namaSah, nipSah, kunci, jabatan = 'Kepala,') => (
    <div key={kunci} className="spd-kotak break-inside-avoid">
      <div className="mb-1">Tiba di : {tibaDi || ''}</div>
      <div className="mb-1">Pada tanggal : {tibaTanggal || ''}</div>
      <div className="text-center w-48 ml-auto mt-2">
        <div className="text-xs font-medium mb-4">{jabatan}</div>
        <div className="h-12" style={{ height: '48px', minHeight: '48px' }} />
        <div className="text-xs font-bold">{namaSah || ''}</div>
        <div className="text-[10px] text-gray-500">NIP. {nipSah || ''}</div>
      </div>
    </div>
  )

  return (
    <div className="mb-4">
      {/* Judul */}
      <div className="text-center mb-3">
        <h2 className="text-sm font-bold uppercase tracking-wide">SURAT PERJALANAN DINAS (SPD)</h2>
      </div>

      {/* ─── TABLE3 docx: butir 1–10 berbingkai ─── */}
      <table className="spd-tabel mb-4">
        <tbody>
          {baris('1', 'Pengguna Anggaran/Kuasa Pengguna Anggaran', (
            <>
              <div>Kepala {sekolah || val('pengguna', 'Nama Pengguna Anggaran')}</div>
              <div>{val('penggunaInstansi', 'Jabatan / instansi')}</div>
            </>
          ))}
          {baris('2', 'Nama PNS dan NIP/PTT yang melaksanakan perjalanan dinas', (
            <>
              <div>{val('nama', 'Nama pelaksana perjalanan dinas')}</div>
              <div>{val('sppdNip', 'NIP / PTT')}</div>
            </>
          ))}
          {baris('3', (
            <>
              <div>Pangkat dan Golongan</div>
              <div>Jabatan/Instansi</div>
              <div>Tingkat Biaya Perjalanan Dinas</div>
            </>
          ), (
            <>
              <div>{val('sppdPangkat', 'Pangkat / golongan')}</div>
              <div>{val('sppdJabatan', 'Jabatan / instansi')}{sekolah ? ` / ${sekolah}` : ''}</div>
              <div>{val('sppdTingkat', 'Tingkat biaya')}</div>
            </>
          ))}
          {baris('4', 'Maksud Perjalanan Dinas', (
            <em>{val('maksud', 'Maksud perjalanan dinas')}</em>
          ))}
          {baris('5', 'Alat angkutan yang digunakan', val('alat', 'Alat angkutan'))}
          {baris('6', (
            <>
              <div>a. Tempat berangkat</div>
              <div>b. Tempat tujuan</div>
            </>
          ), (
            <>
              <div>a. {val('tempatBerangkat', 'Tempat berangkat')}</div>
              <div>b. {val('tempatTujuan', 'Tempat tujuan')}</div>
            </>
          ))}
          {baris('7', (
            <>
              <div>a. Lamanya Perjalanan Dinas</div>
              <div>b. Tanggal berangkat</div>
              <div>c. Tanggal harus kembali/tiba di tempat baru*)</div>
            </>
          ), (
            <>
              <div>a. {val('lama', 'Lamanya perjalanan')}</div>
              <div>b. {val('tanggalBerangkat', 'Tanggal berangkat')}</div>
              <div>c. {val('tanggalKembali', 'Tanggal kembali')}</div>
            </>
          ))}
          {/* 8. Pengikut — header Nama|Tanggal lahir|Keterangan + baris tulis */}
          <tr>
            <td className="spd-no">8.</td>
            <td className="spd-label">Pengikut :</td>
            <td className="!p-0">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-300 px-2 py-1 text-left font-semibold text-[10px]">Nama</th>
                    <th className="border border-gray-300 px-2 py-1 text-left font-semibold text-[10px]">Tanggal lahir</th>
                    <th className="border border-gray-300 px-2 py-1 text-left font-semibold text-[10px]">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {(pengikutRows.length ? pengikutRows : [{}, {}, {}]).map((r, i) => (
                    <tr key={i}>
                      <td className="border border-gray-300 px-2 py-2">{r.nama || ''}</td>
                      <td className="border border-gray-300 px-2 py-2">{r.tanggalLahir || ''}</td>
                      <td className="border border-gray-300 px-2 py-2">{r.keterangan || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </td>
          </tr>
          {baris('9', (
            <>
              <div>Pembebanan Anggaran</div>
              <div>SKPD</div>
              <div>Akun</div>
            </>
          ), (
            <>
              <div>{val('skpd', 'SKPD')}</div>
              <div>{val('akun', 'Akun')}</div>
            </>
          ))}
          {baris('10', 'Keterangan lain-lain', val('keterangan', ''))}
        </tbody>
      </table>

      {/* Dikeluarkan (G10: dipertahankan, format baku SPD) */}
      <div className="text-xs text-gray-700 mt-4">
        <div className="grid grid-cols-2 gap-4">
          <div><span className="font-medium text-gray-700">Dikeluarkan di : </span>{val('dikeluarkanDi', 'Dikeluarkan di')}</div>
          <div><span className="font-medium text-gray-700">Pada tanggal : </span>{val('padaTanggal', 'Pada tanggal')}</div>
        </div>
      </div>
      {ttdKepala(data.namaPenandatangan, data.nipPenandatangan)}

      {/* ─── TABLE4 docx: kotak berangkat/tiba berdampingan ─── */}
      <div className="mt-8 break-inside-avoid-page">
        {/* R0: SPD Nomor + berangkat awal + Kepala Sekolah */}
        <div className="spd-kotak break-inside-avoid">
          <div className="mb-1">
            SPD Nomor : <span className="font-bold">{data.nomorSurat || <PlaceholderText label="SPD Nomor" />}</span>
          </div>
          <div className="mb-1">Berangkat dari : {val('tempatBerangkat', 'Tempat berangkat')}</div>
          <div className="text-[10px] text-gray-500 mb-1">(tempat kedudukan)</div>
          <div className="mb-1">Ke : {val('tempatTujuan', 'Tempat tujuan')}</div>
          <div className="mb-1">Pada tanggal : {val('tanggalBerangkat', 'Tanggal berangkat')}</div>
          {ttdKepala(data.namaPenandatangan, data.nipPenandatangan)}
        </div>

        {/* R1: Tiba di tujuan + Berangkat lanjutan (pengesah: pengelola) */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          {kotakTiba(data.tempatTujuan, data.tanggalBerangkat, data.namaMengetahui, data.nipMengetahui, 'tiba-tujuan')}
          {kotakBerangkat(data.tanggalBerangkat, null, data.namaMengetahui, data.nipMengetahui, 'berangkat-lanjut')}
        </div>

        {/* Transit tambahan dari form + 2 pasangan kosong tulis tangan (R2–R4 docx) */}
        {transitRows.map((t, i) => (
          <div key={`transit-${i}`} className="grid grid-cols-2 gap-2 mt-2">
            {kotakTiba(t.tibaDi, t.tibaTanggal, t.namaPengesah, t.nipPengesah, `tiba-${i}`)}
            <div className="spd-kotak break-inside-avoid">
              <div className="mb-1">Berangkat dari : {t.tibaDi || ''}</div>
              <div className="text-[10px] text-gray-500 mb-1">(tempat kedudukan)</div>
              <div className="mb-1">Ke : {val('tempatTujuan', 'Tempat tujuan')}</div>
              <div className="mb-1">Pada tanggal : {t.berangkatTanggal || ''}</div>
              <div className="text-center w-48 ml-auto mt-2">
                <div className="text-xs font-medium mb-4">Kepala,</div>
                <div className="h-12" style={{ height: '48px', minHeight: '48px' }} />
                <div className="text-xs font-bold">{t.namaPengesah || ''}</div>
                <div className="text-[10px] text-gray-500">NIP. {t.nipPengesah || ''}</div>
              </div>
            </div>
          </div>
        ))}
        <div className="grid grid-cols-2 gap-2 mt-2">
          {kotakTiba('', '', '', '', 'kosong-tiba-1')}
          {kotakBerangkat('', '', '', '', 'kosong-berangkat-1', true)}
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {kotakTiba('', '', '', '', 'kosong-tiba-2')}
          {kotakBerangkat('', '', '', '', 'kosong-berangkat-2', true)}
        </div>

        {/* R5: Tiba kembali (Kepala Sekolah) + Telah diperiksa */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="spd-kotak break-inside-avoid">
            <div className="mb-1">Tiba di : {sekolah || val('tempatBerangkat', 'Tempat berangkat')}</div>
            <div className="text-[10px] text-gray-500 mb-1">(tempat kedudukan)</div>
            <div className="mb-1">Pada tanggal : {val('tanggalKembali', 'Tanggal')}</div>
            <div className="text-center w-48 ml-auto mt-2">
              <div className="text-xs font-medium">Kepala Sekolah,</div>
              <div className="text-xs font-medium mb-4">{sekolah ? `${sekolah},` : ''}</div>
              <div className="h-12" style={{ height: '48px', minHeight: '48px' }} />
              <div className="text-xs font-bold">{data.namaPenandatangan}</div>
              <div className="text-[10px] text-gray-500">NIP. {data.nipPenandatangan}</div>
            </div>
          </div>
          <div className="spd-kotak break-inside-avoid">
            <p className="text-xs text-gray-700 leading-relaxed">
              Telah diperiksa dengan keterangan bahwa perjalanan tersebut atas perintah pejabat yang berwenang dan semata-mata untuk kepentingan jabatan dalam waktu yang sesingkat-singkatnya.
            </p>
          </div>
        </div>

        {/* R6: Catatan Lain-Lain */}
        <div className="spd-kotak mt-2 break-inside-avoid">
          <div className="text-xs font-medium text-gray-700 mb-1">Catatan Lain-Lain</div>
          <div className="text-xs text-gray-700 whitespace-pre-wrap min-h-[24px]">{data.keterangan || ''}</div>
        </div>

        {/* R7: PERHATIAN */}
        <div className="spd-kotak mt-2 break-inside-avoid">
          <div className="text-xs font-bold text-gray-700 mb-1">PERHATIAN :</div>
          <p className="text-xs text-gray-700 leading-relaxed">
            Pengguna Anggaran/Kuasa Pengguna Anggaran yang menerbitkan SPD, Kepala Daerah/Wakil Kepala Daerah, Pimpinan dan Anggota DPR, PNS dan PTT yang melakukan perjalanan dinas, para pejabat yang mengesahkan tanggal berangkat/tiba, serta bendahara pengeluaran bertanggungjawab berdasarkan peraturan-peraturan Keuangan Daerah apabila daerah menderita rugi akibat kesalahan dan kelalaian.
          </p>
        </div>
      </div>
    </div>
  )
}
