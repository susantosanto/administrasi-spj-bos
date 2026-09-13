/**
 * SPDForm — SURAT PERJALANAN DINAS (SPD) numbered form (pages 7+ docx)
 * Source: template/Surat Tugas + SPPD_rapat ops_gugus_2026.docx
 *
 * Per penerima (perRecipient). Layout DOCX:
 *   SURAT PERJALANAN DINAS (SPD)
 *   1. Pengguna Anggaran / Kuasa Pengguna Anggaran
 *   2. Nama PNS dan NIP/PTT yang melaksanakan perjalanan dinas
 *   3. Pangkat dan Golongan | Jabatan/Instansi | Tingkat Biaya Perjalanan Dinas
 *   4. Maksud Perjalanan Dinas
 *   5. Alat angkutan yang digunakan
 *   6. a. Tempat berangkat | b. Tempat tujuan
 *   7. a. Lamanya Perjalanan Dinas | b. Tanggal berangkat | c. Tanggal harus kembali/tiba di tempat baru*)
 *   8. Pengikut : Nama | Tanggal lahir | Keterangan
 *   9. Pembebanan Anggaran | SKPD | Akun
 *   10. Keterangan lain-lain
 *   Dikeluarkan di : ... / Pada tanggal : ... / Kepala Sekolah, [TTD]
 *   [Surat berangkat/tiba] SPD Nomor / Berangkat dari / Ke / Pada tanggal / Kepala Sekolah / Tiba di / Pada tanggal / Kepala
 */
import { PlaceholderText } from '../../../utils/templateHelpers'

export default function SPDForm({ blockConfig, data = {}, onChange, mode }) {
  const val = (key, ph) => {
    const value = data[key] || ''
    return mode === 'edit' ? (
      <input
        type="text"
        className="w-full border-b border-dashed border-primary/30 focus:border-primary outline-none px-1 bg-transparent text-xs"
        value={value}
        onChange={(e) => onChange(key, e.target.value)}
        placeholder={ph}
      />
    ) : (
      <span>{value || <PlaceholderText label={ph || key} />}</span>
    )
  }

  const section = (num, label, body) => (
    <div className="mb-3">
      <div className="text-xs font-medium text-gray-700">
        <span className="text-gray-800">{num}.</span> {label}
      </div>
      <div className="text-xs text-gray-700 mt-1">{body}</div>
    </div>
  )

  return (
    <div className="mb-4">
      {/* Judul */}
      <div className="text-center mb-3">
        <h2 className="text-sm font-bold uppercase tracking-wide">SURAT PERJALANAN DINAS (SPD)</h2>
      </div>

      {/* 1. Pengguna Anggaran */}
      {section('1', 'Pengguna Anggaran/Kuasa Pengguna Anggaran', (
        <div className="grid grid-cols-2 gap-4">
          <div>{val('pengguna', 'Kepala SD NEGERI LEBAKLEUNGSIR')}</div>
          <div>{val('penggunaInstansi', 'Kec. Cikalongwetan Kab. Bandung Barat')}</div>
        </div>
      ))}

      {/* 2. Nama PNS + NIP */}
      {section('2', 'Nama PNS dan NIP/PTT yang melaksanakan perjalanan dinas', (
        <div className="grid grid-cols-2 gap-4">
          <div>{val('nama', 'RISNA MARSELA HARTINI')}</div>
          <div>{val('sppdNip', '-')}</div>
        </div>
      ))}

      {/* 3. Pangkat / Jabatan / Tingkat */}
      {section('3', 'Pangkat dan Golongan / Jabatan/Instansi / Tingkat Biaya Perjalanan Dinas', (
        <table className="w-full text-xs border-collapse border border-gray-300">
          <tbody>
            <tr>
              <td className="border border-gray-300 px-2 py-1 w-1/3">{val('sppdPangkat', '-')}</td>
              <td className="border border-gray-300 px-2 py-1 w-1/3">{val('sppdJabatan', 'Operator Sekolah / SD NEGERI LEBAKLEUNGSIR')}</td>
              <td className="border border-gray-300 px-2 py-1 w-1/3">{val('sppdTingkat', 'Gugus/Kecamatan')}</td>
            </tr>
          </tbody>
        </table>
      ))}

      {/* 4. Maksud */}
      {section('4', 'Maksud Perjalanan Dinas', (
        <div>{val('maksud', 'Rapat Kerja Teknis Operator Sekolah Tingkat Gugus...')}</div>
      ))}

      {/* 5. Alat angkutan */}
      {section('5', 'Alat angkutan yang digunakan', (
        <div>{val('alat', 'Kendaraan darat')}</div>
      ))}

      {/* 6. Tempat berangkat / tujuan */}
      {section('6', 'a. Tempat berangkat / b. Tempat tujuan', (
        <div className="grid grid-cols-2 gap-4">
          <div><span className="text-gray-500">a. </span>{val('tempatBerangkat', 'SD NEGERI LEBAKLEUNGSIR')}</div>
          <div><span className="text-gray-500">b. </span>{val('tempatTujuan', 'SD Negeri Cipada')}</div>
        </div>
      ))}

      {/* 7. Lamanya / tanggal */}
      {section('7', 'a. Lamanya Perjalanan Dinas / b. Tanggal berangkat / c. Tanggal harus kembali/tiba di tempat baru*)', (
        <div className="grid grid-cols-3 gap-4">
          <div><span className="text-gray-500">a. </span>{val('lama', '1 (satu) hari')}</div>
          <div><span className="text-gray-500">b. </span>{val('tanggalBerangkat', '8 Mei 2026')}</div>
          <div><span className="text-gray-500">c. </span>{val('tanggalKembali', '8 Mei 2026')}</div>
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
            {(data.pengikutRows || [{}, {}, {}]).map((r, i) => (
              <tr key={i}>
                <td className="border border-gray-300 px-2 py-2">{mode === 'edit' ? val(`pengikut${i}Nama`, '') : ''}</td>
                <td className="border border-gray-300 px-2 py-2" />
                <td className="border border-gray-300 px-2 py-2" />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 9. Pembebanan Anggaran */}
      {section('9', 'Pembebanan Anggaran', (
        <div className="grid grid-cols-2 gap-4">
          <div><span className="text-gray-500 font-medium">SKPD : </span>{val('skpd', 'BOS Reguler')}</div>
          <div><span className="text-gray-500 font-medium">Akun : </span>{val('akun', '5.1.02.04.01.0003')}</div>
        </div>
      ))}

      {/* 10. Keterangan lain-lain */}
      {section('10', 'Keterangan lain-lain', (
        <div>{val('keterangan', '')}</div>
      ))}

      {/* Dikeluarkan */}
      <div className="text-xs text-gray-700 mt-4">
        <div className="grid grid-cols-2 gap-4">
          <div><span className="font-medium text-gray-700">Dikeluarkan di : </span>{val('dikeluarkanDi', 'Cikalongwetan')}</div>
          <div><span className="font-medium text-gray-700">Pada tanggal : </span>{val('padaTanggal', '8 Mei 2026')}</div>
        </div>
      </div>
      <div className="text-center w-56 mx-auto mt-2">
        <div className="text-xs font-medium mb-4">Kepala Sekolah,</div>
        <div className="h-16" />
        <div className="text-xs font-bold">{data.namaPenandatangan || 'BADRUDDIN, S.Ag.'}</div>
        <div className="text-[10px] text-gray-500">NIP. {data.nipPenandatangan || '197405082014121002'}</div>
      </div>

      {/* ─── Surat Berangkat / Tiba (per penerima) ─── */}
      <div className="mt-8 border-t border-dashed border-gray-300 pt-4">
        <div className="text-xs font-medium text-gray-700 mb-2">
          SPD Nomor : <span className="font-bold">{data.nomorSurat || <PlaceholderText label="SPD Nomor" />}</span>
        </div>
        <div className="text-xs text-gray-700 mb-1">
          Berangkat dari : {val('tempatBerangkat', 'SD NEGERI LEBAKLEUNGSIR')}
        </div>
        <div className="text-[10px] text-gray-500 mb-2">(tempat kedudukan)</div>
        <div className="text-xs text-gray-700 mb-1">
          Ke : {val('tempatTujuan', 'SD Negeri Cipada')}
        </div>
        <div className="text-xs text-gray-700 mb-1">
          Pada tanggal : {val('tanggalBerangkat', '8 Mei 2026')}
        </div>
        <div className="text-center w-56 mx-auto mt-2">
          <div className="text-xs font-medium mb-4">Kepala Sekolah,</div>
          <div className="h-16" />
          <div className="text-xs font-bold">{data.namaPenandatangan || 'BADRUDDIN, S.Ag.'}</div>
          <div className="text-[10px] text-gray-500">NIP. {data.nipPenandatangan || '197405082014121002'}</div>
        </div>

        <div className="text-xs text-gray-700 mt-4 mb-1">
          Tiba di : {val('tempatTujuan', 'SD Negeri Cipada')}
        </div>
        <div className="text-xs text-gray-700 mb-1">
          Pada tanggal : {val('tanggalKembali', '8 Mei 2026')}
        </div>
        <div className="text-center w-56 mx-auto mt-2">
          <div className="text-xs font-medium mb-4">Kepala,</div>
          <div className="h-16" />
          <div className="text-xs font-bold">{data.namaMengetahui || 'WAHYUDIN, S.Pd.SD.'}</div>
          <div className="text-[10px] text-gray-500">NIP. {data.nipMengetahui || '197912222014121003'}</div>
        </div>
      </div>
    </div>
  )
}