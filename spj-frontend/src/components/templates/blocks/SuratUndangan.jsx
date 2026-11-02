/**
 * SuratUndangan — Surat Undangan Gugus (page 1-3 docx)
 * Source: template/Surat Tugas + SPPD_rapat ops_gugus_2026.docx
 *
 * Sprint 002 FASE 3: blok CETAK MURNI.
 * Pengeditan data dilakukan di tab form (DokumenFormPreview), bukan di blok.
 * Layout DOCX:
 *   Nomor / Sifat / Lampiran / Perihal (kiri) + titimangsa (kanan)
 *   Yth. ... / alamat / di / Tempat (kanan)
 *   Dengan hormat, ... (isi)
 *   Hari / Tanggal / Pukul / Tempat
 *   Paragraf penutup 1 & 2
 *   Ketua Gugus, [TTD] ... NIP. ...
 *   Tembusan : list bernomor
 *
 * Revisi audit gugus task 41 (G3, P0): baris Sifat DISEMBUNYIKAN bila nilai
 * '-' / kosong — docx gugus tak punya kolom Sifat. Blok ini eksklusif dipakai
 * template undangan_gugus, jadi kondisional aman tanpa flag template.
 * Revisi task 41 (G4, P1): baris Instansi opsional (form pecah Alamat/Instansi).
 */
import { PlaceholderText } from '../../../utils/templateHelpers'

export default function SuratUndangan({ blockConfig, data = {} }) {
  const F = (label, key) => {
    const value = data[key] || ''
    return (
      <tr>
        <td className="w-36 py-1.5 font-medium text-gray-700">{label}</td>
        <td className="w-3 py-1.5 text-center">:</td>
        <td className="py-1.5">
          <span>{value || <PlaceholderText label={label.toLowerCase()} />}</span>
        </td>
      </tr>
    )
  }

  // Detail acara 4 baris bertumpuk meniru P13–P16 docx.
  const D = (label, key) => {
    const value = data[key] || ''
    return (
      <tr>
        <td className="w-36 py-1.5 font-medium text-gray-700">{label}</td>
        <td className="w-3 py-1.5 text-center">:</td>
        <td className="py-1.5">
          <span>{value || <PlaceholderText label={label.toLowerCase()} />}</span>
        </td>
      </tr>
    )
  }

  const tembusanItems = (data.tembusanItems || []).filter((t) => (t || '').trim())

  return (
    <div className="mb-4">
      {/* Nomor / Sifat / Lampiran / Perihal + kepada */}
      <table className="surat-polos w-full text-xs mb-4 border-collapse">
        <tbody>
          <tr>
            <td className="w-36 py-1.5 font-medium text-gray-700">Nomor</td>
            <td className="w-3 py-1.5 text-center">:</td>
            <td className="py-1.5">
              <span>{data.nomorUndangan || <PlaceholderText label="nomor" />}</span>
            </td>
            <td colSpan={2} className="py-1.5 text-right">
              <span>{data.tanggalSurat || <PlaceholderText label="tanggal" />}</span>
            </td>
          </tr>
          {data.sifatUndangan && data.sifatUndangan !== '-' ? F('Sifat', 'sifatUndangan') : null}
          {F('Lampiran', 'lampiranUndangan')}
          {F('Perihal', 'perihalUndangan')}
          <tr>
            <td colSpan={3} />
            <td colSpan={2} className="py-1.5 text-right font-medium text-gray-700">
              Yth. {data.kepadaUndangan || <PlaceholderText label="Kepada Yth" />}
            </td>
          </tr>
          <tr>
            <td colSpan={3} />
            <td colSpan={2} className="py-1.5 text-right">
              {data.alamatUndangan || <PlaceholderText label="Alamat" />}
            </td>
          </tr>
          {data.instansiUndangan ? (
            <tr>
              <td colSpan={3} />
              <td colSpan={2} className="py-1.5 text-right">
                {data.instansiUndangan}
              </td>
            </tr>
          ) : null}
          <tr>
            <td colSpan={3} />
            <td colSpan={2} className="py-1.5 text-right font-medium text-gray-700">di</td>
          </tr>
          <tr>
            <td colSpan={3} />
            <td colSpan={2} className="py-1.5 text-right">
              {data.tempatUndangan || <PlaceholderText label="Tempat" />}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Isi Undangan */}
      <p className="text-xs text-gray-700 mb-3 whitespace-pre-wrap">
        <span>
          {data.isiUndangan || <PlaceholderText label="isi undangan" />}
        </span>
      </p>

      {/* Detail Acara — 4 baris bertumpuk (Hari/Tanggal/Pukul/Tempat) */}
      <table className="surat-polos w-full text-xs mb-4 border-collapse">
        <tbody>
          {D('Hari', 'hariUndangan')}
          {D('Tanggal', 'tanggalAcara')}
          {D('Pukul', 'pukulUndangan')}
          {D('Tempat', 'tempatAcara')}
        </tbody>
      </table>

      {/* Closing — 2 paragraf terpisah; fallback kalimat resmi docx */}
      <p className="text-xs text-gray-700 mb-2">
        {data.penutupUndangan1 || 'Mengingat pentingnya acara tersebut di atas kami harap kehadiran Operator tepat pada waktu yang telah ditentukan.'}
      </p>
      <p className="text-xs text-gray-700 mb-6">
        {data.penutupUndangan2 || 'Demikian undangan ini kami sampaikan, atas perhatian dan kehadirannya kami ucapkan terima kasih.'}
      </p>

      {/* Ketua Gugus — kanan seperti TABLE1 docx, [SPASI 64px] u/ TTD basah */}
      <div className="text-center w-56 ml-auto mr-0">
        <div className="text-xs font-medium mb-4">Ketua Gugus,</div>
        <div className="h-16" style={{ height: '64px', minHeight: '64px' }} />
        <div className="text-xs font-bold">{data.namaKetuaGugus}</div>
        <div className="text-[10px] text-gray-500">NIP. {data.nipKetuaGugus}</div>
      </div>

      {/* Tembusan — list decimal bernomor */}
      <div className="mt-6 text-xs">
        <div className="font-medium text-gray-700">Tembusan :</div>
        {tembusanItems.length > 0 ? (
          <ol className="mt-1 text-gray-700 list-decimal ml-5">
            {tembusanItems.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ol>
        ) : (
          <div className="mt-1 text-gray-700">
            <PlaceholderText label="tembusan" />
          </div>
        )}
      </div>
    </div>
  )
}
