/**
 * SPDForm — SURAT PERJALANAN DINAS (SPD) numbered form (pages 7+ docx)
 * Source: template/Surat Tugas + SPPD_rapat ops_gugus_2026.docx
 *
 * Sprint 002 FASE 3: blok CETAK MURNI — per penerima (perRecipient).
 * Pengeditan data dilakukan di tab form (DokumenFormPreview), bukan di blok.
 * Layout DOCX: butir 1–10 + Dikeluarkan di/Pada tanggal + Kepala Sekolah [TTD]
 * + surat berangkat/tiba.
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

  const section = (num, label, body) => (
    <div className="mb-3">
      <div className="text-xs font-medium text-gray-700">
        <span className="text-gray-800">{num}.</span> {label}
      </div>
      <div className="text-xs text-gray-700 mt-1">{body}</div>
    </div>
  )

  const pengikutRows = data.pengikutRows || []

  return (
    <div className="mb-4">
      {/* Judul */}
      <div className="text-center mb-3">
        <h2 className="text-sm font-bold uppercase tracking-wide">SURAT PERJALANAN DINAS (SPD)</h2>
      </div>

      {/* 1. Pengguna Anggaran */}
      {section('1', 'Pengguna Anggaran/Kuasa Pengguna Anggaran', (
        <div className="grid grid-cols-2 gap-4">
          <div>{val('pengguna', 'Nama Pengguna Anggaran')}</div>
          <div>{val('penggunaInstansi', 'Jabatan / instansi')}</div>
        </div>
      ))}

      {/* 2. Nama PNS + NIP */}
      {section('2', 'Nama PNS dan NIP/PTT yang melaksanakan perjalanan dinas', (
        <div className="grid grid-cols-2 gap-4">
          <div>{val('nama', 'Nama pelaksana perjalanan dinas')}</div>
          <div>{val('sppdNip', 'NIP / PTT')}</div>
        </div>
      ))}

      {/* 3. Pangkat / Jabatan / Tingkat */}
      {section('3', 'Pangkat dan Golongan / Jabatan/Instansi / Tingkat Biaya Perjalanan Dinas', (
        <table className="w-full text-xs border-collapse border border-gray-300">
          <tbody>
            <tr>
              <td className="border border-gray-300 px-2 py-1 w-1/3">{val('sppdPangkat', 'Pangkat / golongan')}</td>
              <td className="border border-gray-300 px-2 py-1 w-1/3">{val('sppdJabatan', 'Jabatan / instansi')}</td>
              <td className="border border-gray-300 px-2 py-1 w-1/3">{val('sppdTingkat', 'Tingkat biaya')}</td>
            </tr>
          </tbody>
        </table>
      ))}

      {/* 4. Maksud */}
      {section('4', 'Maksud Perjalanan Dinas', (
        <div>{val('maksud', 'Maksud perjalanan dinas')}</div>
      ))}

      {/* 5. Alat angkutan */}
      {section('5', 'Alat angkutan yang digunakan', (
        <div>{val('alat', 'Alat angkutan')}</div>
      ))}

      {/* 6. Tempat berangkat / tujuan */}
      {section('6', 'a. Tempat berangkat / b. Tempat tujuan', (
        <div className="grid grid-cols-2 gap-4">
          <div><span className="text-gray-500">a. </span>{val('tempatBerangkat', 'Tempat berangkat')}</div>
          <div><span className="text-gray-500">b. </span>{val('tempatTujuan', 'Tempat tujuan')}</div>
        </div>
      ))}

      {/* 7. Lamanya / tanggal */}
      {section('7', 'a. Lamanya Perjalanan Dinas / b. Tanggal berangkat / c. Tanggal harus kembali/tiba di tempat baru*)', (
        <div className="grid grid-cols-3 gap-4">
          <div><span className="text-gray-500">a. </span>{val('lama', 'Lamanya perjalanan')}</div>
          <div><span className="text-gray-500">b. </span>{val('tanggalBerangkat', 'Tanggal berangkat')}</div>
          <div><span className="text-gray-500">c. </span>{val('tanggalKembali', 'Tanggal kembali')}</div>
        </div>
      ))}

      {/* 8. Pengikut */}
      <div className="mb-3">
        <div className="text-xs font-medium text-gray-700">8. Pengikut :</div>
        <table className="w-full text-xs mt-1 border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
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
      </div>

      {/* 9. Pembebanan Anggaran */}
      {section('9', 'Pembebanan Anggaran', (
        <div className="grid grid-cols-2 gap-4">
          <div><span className="text-gray-500 font-medium">SKPD : </span>{val('skpd', 'SKPD')}</div>
          <div><span className="text-gray-500 font-medium">Akun : </span>{val('akun', 'Akun')}</div>
        </div>
      ))}

      {/* 10. Keterangan lain-lain */}
      {section('10', 'Keterangan lain-lain', (
        <div>{val('keterangan', '')}</div>
      ))}

      {/* Dikeluarkan */}
      <div className="text-xs text-gray-700 mt-4">
        <div className="grid grid-cols-2 gap-4">
          <div><span className="font-medium text-gray-700">Dikeluarkan di : </span>{val('dikeluarkanDi', 'Dikeluarkan di')}</div>
          <div><span className="font-medium text-gray-700">Pada tanggal : </span>{val('padaTanggal', 'Pada tanggal')}</div>
        </div>
      </div>
      <div className="text-center w-56 mx-auto mt-2">
        {/* TTD 4 baris: Kepala / nama SD / [SPASI 64px] / nama orang / NIP */}
        <div className="text-xs font-medium">Kepala</div>
        <div className="text-xs font-medium mb-4">{sekolah ? `${sekolah},` : ''}</div>
        <div className="h-16" style={{ height: '64px', minHeight: '64px' }} />
        <div className="text-xs font-bold">{data.namaPenandatangan}</div>
        <div className="text-[10px] text-gray-500">NIP. {data.nipPenandatangan}</div>
      </div>

      {/* ─── Surat Berangkat / Tiba (per penerima) — break-inside-avoid agar
          kotak TTD tidak terpotong antar halaman cetak (task 4.5) ─── */}
      <div className="mt-8 border-t border-dashed border-gray-300 pt-4 break-inside-avoid-page">
        <div className="text-xs font-medium text-gray-700 mb-2">
          SPD Nomor : <span className="font-bold">{data.nomorSurat || <PlaceholderText label="SPD Nomor" />}</span>
        </div>
        <div className="text-xs text-gray-700 mb-1">
          Berangkat dari : {val('tempatBerangkat', 'Tempat berangkat')}
        </div>
        <div className="text-[10px] text-gray-500 mb-2">(tempat kedudukan)</div>
        <div className="text-xs text-gray-700 mb-1">
          Ke : {val('tempatTujuan', 'Tempat tujuan')}
        </div>
        <div className="text-xs text-gray-700 mb-1">
          Pada tanggal : {val('tanggalBerangkat', 'Tanggal berangkat')}
        </div>
        <div className="text-center w-56 mx-auto mt-2 break-inside-avoid">
          {/* TTD 4 baris: Kepala / nama SD / [SPASI 64px] / nama orang / NIP */}
          <div className="text-xs font-medium">Kepala</div>
          <div className="text-xs font-medium mb-4">{sekolah ? `${sekolah},` : ''}</div>
          <div className="h-16" style={{ height: '64px', minHeight: '64px' }} />
          <div className="text-xs font-bold">{data.namaPenandatangan}</div>
          <div className="text-[10px] text-gray-500">NIP. {data.nipPenandatangan}</div>
        </div>

        <div className="text-xs text-gray-700 mt-4 mb-1">
          Tiba di : {val('tempatTujuan', 'Tempat tujuan')}
        </div>
        <div className="text-xs text-gray-700 mb-1">
          Pada tanggal : {val('tanggalKembali', 'Tanggal')}
        </div>
        <div className="text-center w-56 mx-auto mt-2 break-inside-avoid">
          <div className="text-xs font-medium mb-4">Kepala,</div>
          <div className="h-16" style={{ height: '64px', minHeight: '64px' }} />
          <div className="text-xs font-bold">{data.namaMengetahui}</div>
          <div className="text-[10px] text-gray-500">NIP. {data.nipMengetahui}</div>
        </div>
      </div>

      {/* ─── 3 blok resmi SPD — kalimat PERSIS dokumen sumber (task 4.2–4.4) ─── */}
      <div className="mt-8 break-inside-avoid-page">
        <p className="text-xs text-gray-700 leading-relaxed">
          Telah diperiksa dengan keterangan bahwa perjalanan tersebut atas perintah pejabat yang berwenang dan semata-mata untuk kepentingan jabatan dalam waktu yang sesingkat-singkatnya.
        </p>
        <div className="text-xs font-medium text-gray-700 mt-4 mb-1">Catatan Lain-Lain</div>
        <div className="text-xs text-gray-700 whitespace-pre-wrap">{data.keterangan || ''}</div>
        <div className="mt-6">
          <div className="text-xs font-bold text-gray-700 mb-1">PERHATIAN :</div>
          <p className="text-xs text-gray-700 leading-relaxed">
            Pengguna Anggaran/Kuasa Pengguna Anggaran yang menerbitkan SPD, Kepala Daerah/Wakil Kepala Daerah, Pimpinan dan Anggota DPR, PNS dan PTT yang melakukan perjalanan dinas, para pejabat yang mengesahkan tanggal berangkat/tiba, serta bendahara pengeluaran bertanggungjawab berdasarkan peraturan-peraturan Keuangan Daerah apabila daerah menderita rugi akibat kesalahan dan kelalaian.
          </p>
        </div>
      </div>
    </div>
  )
}
