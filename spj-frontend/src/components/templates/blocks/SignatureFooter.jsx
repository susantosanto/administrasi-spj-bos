/**
 * SignatureFooter — TTD Pejabat
 * RESEARCH §2.3
 *
 * Format Excel:
 *   Mengetahui/Menyetujui  |  Dibayar Lunas Tgl.
 *   Kepala                 |  Bendahara BOS,
 *   SDN Pasirhalang,       |  [spasi TTD]
 *   [nama dari Data Sekolah] | [nama dari Data Sekolah]
 *   NIP. ...               |  NIP. ...
 *
 * Format TTD 4 baris (keputusan user 2026-10-06) khusus peran Kepala
 * Sekolah (kepala-sekolah, pimpinan): baris 1 "Kepala", baris 2 nama SD,
 * baris 3 nama orang, baris 4 NIP. Peran lain tetap label/nama/NIP.
 * Preview + cetak memakai komponen yang sama → selalu konsisten.
 */
import { getSignatureRoles, KS_ROLES } from '../../../utils/signatureRoles'
import { formatDate } from '../../../utils/templateHelpers'

/**
 * Identitas penandatangan: 4 baris utk peran KS, 3 baris utk peran lain.
 * Urutan KS: Kepala / nama SD / [SPASI TTD 64px] / nama orang / NIP.
 * SPASI WAJIB di bawah nama sekolah di semua format — satu-satunya spacer
 * ada di sini (TtdIdentitas), pemanggil TIDAK boleh menambah spacer lagi
 * agar tidak ganda / tidak hilang saat cetak. Pakai inline style agar
 * print-safe meski Tailwind purge.
 * Nilai: ketikan user (data) → Data Sekolah (roleConfig) → '' jujur-kosong.
 */
function TtdIdentitas({ role, roleConfig, data, onChange, mode }) {
  const nama = data[`ttd_${role}_nama`] || roleConfig.nama || ''
  const nip = data[`ttd_${role}_nip`] || roleConfig.nip || ''
  const isKS = KS_ROLES.includes(role)
  if (mode === 'edit') {
    return (
      <>
        {isKS ? (
          <>
            <div className="text-xs font-medium">Kepala</div>
            <div className="text-xs font-medium">{roleConfig.sekolah}</div>
          </>
        ) : null}
        {/* SPASI TTD di bawah nama sekolah — JANGAN dihapus/duplikat di pemanggil */}
        <div className="h-16" style={{ height: '64px', minHeight: '64px' }} />
        <input
          className="text-xs text-center w-full border-b border-dashed border-primary/30 outline-none font-bold"
          value={nama}
          placeholder="Nama penandatangan"
          onChange={(e) => onChange(`ttd_${role}_nama`, e.target.value)}
        />
        <input
          className="text-xs text-center w-full border-b border-dashed border-primary/30 outline-none text-gray-500"
          value={nip}
          placeholder="NIP"
          onChange={(e) => onChange(`ttd_${role}_nip`, e.target.value)}
        />
      </>
    )
  }
  return (
    <>
      {isKS ? (
        <>
          <div className="text-xs font-medium">Kepala</div>
          <div className="text-xs font-medium">{roleConfig.sekolah ? `${roleConfig.sekolah},` : ''}</div>
        </>
      ) : null}
      {/* SPASI TTD di bawah nama sekolah — JANGAN dihapus/duplikat di pemanggil */}
      <div className="h-16" style={{ height: '64px', minHeight: '64px' }} />
      <div className="text-xs font-bold">{nama}</div>
      <div className="text-[10px] text-gray-500">{nip}</div>
    </>
  )
}

export default function SignatureFooter({ blockConfig, data = {}, onChange, mode }) {
  const roles = blockConfig.roles || ['kepala-sekolah']
  const tempat = data.tempat || 'Cikalongwetan'
  const tanggal = data.tanggalCetak || formatDate(new Date())

  // Dibaca saat render — sumber nama/NIP pejabat (tanpa fallback hardcoded).
  const signatureRoles = getSignatureRoles()

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
              const roleConfig = signatureRoles[role]
              if (!roleConfig) return null

              return (
                <div key={role} className="text-center w-48">
                  {!KS_ROLES.includes(role) && (
                    <div className="text-xs font-medium mb-4">{roleConfig.label}</div>
                  )}
                  {KS_ROLES.includes(role) && <div className="mb-1" />}

                  {/* Spacer TTD dirender di dalam TtdIdentitas (di bawah
                      nama sekolah) — pemanggil tidak menambah spacer. */}
                  <TtdIdentitas role={role} roleConfig={roleConfig} data={data} onChange={onChange} mode={mode} />
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="flex justify-end">
          {/* ─── Format Single (1 TTD Kepala Sekolah → rata kanan, task 46) ─── */}
          {roles.map((role) => {
            const roleConfig = signatureRoles[role]
            if (!roleConfig) return null

            return (
              <div key={role} className="text-center w-48">
                <div className="text-[10px] text-gray-500 mb-1">Mengetahui/Menyetujui</div>
                {!KS_ROLES.includes(role) && (
                  <div className="text-xs font-medium">{roleConfig.label}</div>
                )}

                {/* Spacer TTD dirender di dalam TtdIdentitas (di bawah
                    nama sekolah) — pemanggil tidak menambah spacer. */}
                <TtdIdentitas role={role} roleConfig={roleConfig} data={data} onChange={onChange} mode={mode} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
