/**
 * SignatureFooter — TTD Pejabat
 * RESEARCH §2.3
 *
 * Format Excel:
 *   Mengetahui/Menyetujui  |  Dibayar Lunas Tgl.
 *   Kepala Sekolah,         |  Bendahara BOS,
 *   [spasi TTD]            |  [spasi TTD]
 *   BADRUDDIN, S.Ag.       |  DEDE GUNAWAN, S.Pd.
 *   NIP. ...               |  NIP. ...
 */
import { SIGNATURE_ROLES } from '../../../utils/signatureRoles'
import { formatDate } from '../../../utils/templateHelpers'

export default function SignatureFooter({ blockConfig, data = {}, onChange, mode }) {
  const roles = blockConfig.roles || ['kepala-sekolah']
  const tempat = data.tempat || 'Cikalongwetan'
  const tanggal = data.tanggalCetak || formatDate(new Date())

  // Cek apakah signature menggunakan format 2-kolom (untuk Honor/Transport)
  // atau format single column (untuk SPPD, Notulen, dll)
  const useTwoColumn = roles.length === 2

  return (
    <div className="mt-8">
      {/* Tempat, Tanggal */}
      <div className="text-xs text-right mb-4">
        {mode === 'edit' ? (
          <>
            <input
              type="text"
              className="border-b border-dashed border-primary/30 outline-none text-xs w-32 bg-transparent"
              value={data.tempat || ''}
              onChange={(e) => onChange('tempat', e.target.value)}
              placeholder="Cikalongwetan"
            />
            <span>, </span>
            <input
              type="date"
              className="border-b border-dashed border-primary/30 outline-none text-xs bg-transparent"
              value={data.tanggalCetak || ''}
              onChange={(e) => onChange('tanggalCetak', e.target.value)}
            />
          </>
        ) : (
          <span>{tempat}, {tanggal}</span>
        )}
      </div>

      {useTwoColumn ? (
        <div>
          {/* ─── Format 2-Kolom (Honor, Transport, Upah, Pulsa) ─── */}
          {/* Header row: Mengetahui/Menyetujui | Dibayar Lunas Tgl. */}
          <div className="flex justify-between mb-1">
            <div className="text-center w-48">
              <div className="text-[10px] text-gray-500">Mengetahui/Menyetujui</div>
            </div>
            {blockConfig.showDibayarLunas !== false && (
              <div className="text-center w-48">
                <div className="text-[10px] text-gray-500">
                  Dibayar Lunas{' '}
                  {mode === 'edit' ? (
                    <input
                      type="date"
                      className="border-b border-dashed border-primary/30 outline-none text-[10px] w-24 bg-transparent"
                      value={data.tanggalBayar || ''}
                      onChange={(e) => onChange('tanggalBayar', e.target.value)}
                    />
                  ) : (
                    <span>Tgl. {data.tanggalBayar || '___'}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Signature blocks row */}
          <div className="flex justify-between">
            {roles.map((role) => {
              const roleConfig = SIGNATURE_ROLES[role]
              if (!roleConfig) return null

              return (
                <div key={role} className="text-center w-48">
                  <div className="text-xs font-medium mb-4">{roleConfig.label}</div>

                  {/* Space for signature */}
                  <div className="h-16" />

                  {mode === 'edit' ? (
                    <>
                      <input
                        className="text-xs text-center w-full border-b border-dashed border-primary/30 outline-none font-bold"
                        value={data[`ttd_${role}_nama`] || roleConfig.defaultName}
                        onChange={(e) => onChange(`ttd_${role}_nama`, e.target.value)}
                      />
                      <input
                        className="text-xs text-center w-full border-b border-dashed border-primary/30 outline-none text-gray-500"
                        value={data[`ttd_${role}_nip`] || roleConfig.defaultNip}
                        onChange={(e) => onChange(`ttd_${role}_nip`, e.target.value)}
                      />
                    </>
                  ) : (
                    <>
                      <div className="text-xs font-bold">
                        {data[`ttd_${role}_nama`] || roleConfig.defaultName}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {data[`ttd_${role}_nip`] || roleConfig.defaultNip}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="flex justify-between">
          {/* ─── Format Single (SPPD, Notulen, Buku Tamu) ─── */}
          {roles.map((role) => {
            const roleConfig = SIGNATURE_ROLES[role]
            if (!roleConfig) return null

            return (
              <div key={role} className="text-center w-48">
                <div className="text-[10px] text-gray-500 mb-1">Mengetahui/Menyetujui</div>
                <div className="text-xs font-medium">{roleConfig.label}</div>

                {/* Space for signature */}
                <div className="h-16" />

                {mode === 'edit' ? (
                  <>
                    <input
                      className="text-xs text-center w-full border-b border-dashed border-primary/30 outline-none font-bold"
                      value={data[`ttd_${role}_nama`] || roleConfig.defaultName}
                      onChange={(e) => onChange(`ttd_${role}_nama`, e.target.value)}
                    />
                    <input
                      className="text-xs text-center w-full border-b border-dashed border-primary/30 outline-none text-gray-500"
                      value={data[`ttd_${role}_nip`] || roleConfig.defaultNip}
                      onChange={(e) => onChange(`ttd_${role}_nip`, e.target.value)}
                    />
                  </>
                ) : (
                  <>
                    <div className="text-xs font-bold">
                      {data[`ttd_${role}_nama`] || roleConfig.defaultName}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {data[`ttd_${role}_nip`] || roleConfig.defaultNip}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
