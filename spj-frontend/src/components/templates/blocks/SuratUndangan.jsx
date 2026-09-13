/**
 * SuratUndangan — Surat Undangan Gugus (page 1-3 docx)
 * Source: template/Surat Tugas + SPPD_rapat ops_gugus_2026.docx
 *
 * Layout DOCX:
 *   Nomor / Lampiran / Perihal (kiri) + Cikalongwetan, ... (kanan)
 *   Yth. Kepala Sekolah SD ... se-gugus K.H Dewantara di Tempat
 *   Dengan hormat, Ketua gugus ... dapat menghadirkan ... pada:
 *   Hari / Tanggal / Pukul / Tempat
 *   Mengingat pentingnya acara ... tepat pada waktu yang telah ditentukan.
 *   Demikian undangan ini kami sampaikan, atas perhatian ... terima kasih.
 *   Ketua Gugus, [TTD] WAHYUDIN, S.Pd.SD. NIP. ...
 *   Tembusan : ...
 */
import { PlaceholderText } from '../../../utils/templateHelpers'

export default function SuratUndangan({ blockConfig, data = {}, onChange, mode }) {
  const F = (label, key, ph) => {
    const value = data[key] || ''
    return (
      <tr className="border-b border-dashed border-outline-variant">
        <td className="w-36 py-1.5 font-medium text-gray-700">{label}</td>
        <td className="w-3 py-1.5 text-center">:</td>
        <td className="py-1.5">
          {mode === 'edit' ? (
            <input
              type="text"
              className="w-full border-b border-dashed border-primary/30 focus:border-primary outline-none px-1 bg-transparent text-xs"
              value={value}
              onChange={(e) => onChange(key, e.target.value)}
              placeholder={ph}
            />
          ) : (
            <span>{value || <PlaceholderText label={label} />}</span>
          )}
        </td>
      </tr>
    )
  }

  const rightCell = (key, label) => (
    <td className="py-1.5 text-right font-medium text-gray-700">
      {label ? <span className="text-gray-700">{label} </span> : null}
      {mode === 'edit' ? (
        <input
          type="text"
          className="border-b border-dashed border-primary/30 focus:border-primary outline-none px-1 bg-transparent text-xs text-right"
          value={data[key] || ''}
          onChange={(e) => onChange(key, e.target.value)}
        />
      ) : (
        <span>{data[key] || <PlaceholderText label={label || key} />}</span>
      )}
    </td>
  )

  return (
    <div className="mb-4">
      {/* Nomor / Lampiran / Perihal + kepada */}
      <table className="w-full text-xs mb-4 border-collapse">
        <tbody>
          <tr className="border-b border-dashed border-outline-variant">
            <td className="w-36 py-1.5 font-medium text-gray-700">Nomor</td>
            <td className="w-3 py-1.5 text-center">:</td>
            <td className="py-1.5">
              {mode === 'edit' ? (
                <input
                  type="text"
                  className="w-full border-b border-dashed border-primary/30 focus:border-primary outline-none px-1 bg-transparent text-xs"
                  value={data.nomorUndangan || ''}
                  onChange={(e) => onChange('nomorUndangan', e.target.value)}
                  placeholder="400.3.7.6/018/G-KHD/2026"
                />
              ) : (
                <span>{data.nomorUndangan || <PlaceholderText label="Nomor" />}</span>
              )}
            </td>
            <td colSpan={2} className="py-1.5 text-right">
              {mode === 'edit' ? (
                <input
                  type="text"
                  className="border-b border-dashed border-primary/30 focus:border-primary outline-none px-1 bg-transparent text-xs text-right"
                  value={data.tanggalSurat || ''}
                  onChange={(e) => onChange('tanggalSurat', e.target.value)}
                  placeholder="Cikalongwetan, 7 Mei 2026"
                />
              ) : (
                <span>{data.tanggalSurat || <PlaceholderText label="Tanggal" />}</span>
              )}
            </td>
          </tr>
          {F('Lampiran', 'lampiranUndangan', '-')}
          {F('Perihal', 'perihalUndangan', 'Undangan Rapat Operator')}
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
          <tr>
            <td colSpan={3} />
            <td colSpan={2} className="py-1.5 text-right font-medium text-gray-700">di</td>
          </tr>
          <tr>
            <td colSpan={3} />
            {rightCell('tempatUndangan', '')}
          </tr>
        </tbody>
      </table>

      {/* Isi Undangan */}
      <p className="text-xs text-gray-700 mb-3 whitespace-pre-wrap">
        {mode === 'edit' ? (
          <textarea
            className="w-full border border-outline-variant rounded px-2 py-1 text-xs focus:ring-1 focus:ring-primary outline-none"
            value={data.isiUndangan || ''}
            onChange={(e) => onChange('isiUndangan', e.target.value)}
            rows={3}
            placeholder="Dengan hormat, Ketua gugus K.H. Dewantara melalui Kepala Sekolah dapat menghadirkan Operator Sekolah untuk mengikuti..."
          />
        ) : (
          <span>
            {data.isiUndangan || <PlaceholderText label="isi undangan" />}
          </span>
        )}
      </p>

      {/* Detail Acara */}
      <table className="w-full text-xs mb-4 border-collapse">
        <tbody>
          <tr className="border-b border-dashed border-outline-variant">
            <td className="w-36 py-1.5 font-medium text-gray-700">Hari</td>
            <td className="w-3 py-1.5 text-center">:</td>
            <td className="py-1.5 pr-6">
              {mode === 'edit' ? (
                <input
                  type="text"
                  className="w-full border-b border-dashed border-primary/30 focus:border-primary outline-none px-1 bg-transparent text-xs"
                  value={data.hariUndangan || ''}
                  onChange={(e) => onChange('hariUndangan', e.target.value)}
                  placeholder="Jumat"
                />
              ) : (
                <span>{data.hariUndangan || <PlaceholderText label="Hari" />}</span>
              )}
            </td>
            <td className="w-36 py-1.5 font-medium text-gray-700">Tanggal</td>
            <td className="w-3 py-1.5 text-center">:</td>
            <td className="py-1.5 pr-6">
              {mode === 'edit' ? (
                <input
                  type="text"
                  className="w-full border-b border-dashed border-primary/30 focus:border-primary outline-none px-1 bg-transparent text-xs"
                  value={data.tanggalAcara || ''}
                  onChange={(e) => onChange('tanggalAcara', e.target.value)}
                  placeholder="8 Mei 2026"
                />
              ) : (
                <span>{data.tanggalAcara || <PlaceholderText label="Tanggal" />}</span>
              )}
            </td>
          </tr>
          <tr className="border-b border-dashed border-outline-variant">
            <td className="w-36 py-1.5 font-medium text-gray-700">Pukul</td>
            <td className="w-3 py-1.5 text-center">:</td>
            <td className="py-1.5 pr-6">
              {mode === 'edit' ? (
                <input
                  type="text"
                  className="w-full border-b border-dashed border-primary/30 focus:border-primary outline-none px-1 bg-transparent text-xs"
                  value={data.pukulUndangan || ''}
                  onChange={(e) => onChange('pukulUndangan', e.target.value)}
                  placeholder="11.00 s.d selesai"
                />
              ) : (
                <span>{data.pukulUndangan || <PlaceholderText label="Pukul" />}</span>
              )}
            </td>
            <td className="w-36 py-1.5 font-medium text-gray-700">Tempat</td>
            <td className="w-3 py-1.5 text-center">:</td>
            <td className="py-1.5">
              {mode === 'edit' ? (
                <input
                  type="text"
                  className="w-full border-b border-dashed border-primary/30 focus:border-primary outline-none px-1 bg-transparent text-xs"
                  value={data.tempatAcara || ''}
                  onChange={(e) => onChange('tempatAcara', e.target.value)}
                  placeholder="SD Negeri Cipada"
                />
              ) : (
                <span>{data.tempatAcara || <PlaceholderText label="Tempat" />}</span>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Closing */}
      <p className="text-xs text-gray-700 mb-2">
        Mengingat pentingnya acara tersebut di atas kami harap kehadiran Operator tepat pada waktu yang telah ditentukan.
      </p>
      <p className="text-xs text-gray-700 mb-6">
        Demikian undangan ini kami sampaikan, atas perhatian dan kehadirannya kami ucapkan terima kasih.
      </p>

      {/* Ketua Gugus */}
      <div className="text-center w-56 mx-auto">
        <div className="text-xs font-medium mb-4">Ketua Gugus,</div>
        <div className="h-16" />
        <div className="text-xs font-bold">{data.namaKetuaGugus || 'WAHYUDIN, S.Pd.SD.'}</div>
        <div className="text-[10px] text-gray-500">NIP. {data.nipKetuaGugus || '197912222014121003'}</div>
      </div>

      {/* Tembusan */}
      <div className="mt-6 text-xs">
        <div className="font-medium text-gray-700">Tembusan :</div>
        <div className="mt-1 text-gray-700 whitespace-pre-wrap">
          {mode === 'edit' ? (
            <textarea
              className="w-full border border-outline-variant rounded px-2 py-1 text-xs focus:ring-1 focus:ring-primary outline-none"
              value={data.tembusan || ''}
              onChange={(e) => onChange('tembusan', e.target.value)}
              rows={2}
              placeholder="Yth. Pengawas Bina Satuan Pendidikan SD Kecamatan Cikalongwetan"
            />
          ) : (
            <span>
              {data.tembusan || <PlaceholderText label="tembusan" />}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}