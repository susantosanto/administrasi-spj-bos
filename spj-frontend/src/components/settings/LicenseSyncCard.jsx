import { useState, useEffect, useCallback } from 'react'
import { useToast } from '../ui/Toast'
import storageHelper from '../../utils/storageHelper'
import cpApi, { CpError, getStoredLicense } from '../../services/cpClient'
import { push, pull, applyUpdates } from '../../services/syncService'

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

const STATUS_BADGE = {
  TRIAL: 'bg-amber-100 text-amber-700 border-amber-200',
  ACTIVE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  GRACE: 'bg-orange-100 text-orange-700 border-orange-200',
  READ_ONLY: 'bg-slate-200 text-slate-700 border-slate-300',
  SUSPENDED: 'bg-red-100 text-red-700 border-red-200',
  EXPIRED: 'bg-red-100 text-red-700 border-red-200',
}

export default function LicenseSyncCard() {
  const toast = useToast()
  const [licenseCode, setLicenseCode] = useState(() => storageHelper.get('license_code') || '')
  const [inputCode, setInputCode] = useState('')
  const [busy, setBusy] = useState(null) // 'push' | 'pull' | 'connect' | 'refresh'
  const [info, setInfo] = useState(null) // { status, readOnly, validUntil, lastPush, lastPull, schoolId }

  const loadStatus = useCallback(async () => {
    const code = storageHelper.get('license_code')
    if (!code) {
      setLicenseCode('')
      setInfo(null)
      return
    }
    setBusy('refresh')
    try {
      const [hb, sync] = await Promise.all([cpApi.heartbeat(), cpApi.syncStatus()])
      setInfo({
        status: hb.status,
        readOnly: hb.readOnly,
        validUntil: hb.validUntil,
        lastPush: (sync && sync.lastPush) || null,
        lastPull: (sync && sync.lastPull) || null,
        schoolId: (sync && sync.schoolId) || null,
        connected: (sync && sync.connected) ?? true,
      })
    } catch (e) {
      setInfo(null)
      if (e instanceof CpError) toast.error(e.message)
      else toast.error('Gagal memeriksa lisensi: ' + (e.message || e))
    } finally {
      setBusy(null)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadStatus() }, [loadStatus])

  async function onConnect() {
    const code = inputCode.trim().toUpperCase()
    if (!/^ASIK(-[0-9A-F]{4}){3}$/.test(code)) {
      toast.error('Format kode: ASIK-XXXX-XXXX-XXXX (4 blok, 4 karakter hex)')
      return
    }
    setBusy('connect')
    try {
      await cpApi.activate(code)
      storageHelper.set('license_code', code)
      storageHelper.set('license_pending', { licenseCode: code, connectedAt: new Date().toISOString() })
      setLicenseCode(code)
      toast.success('Perangkat berhasil dihubungkan ke ASIK Control Plane')
      setInputCode('')
      await loadStatus()
    } catch (e) {
      toast.error(e instanceof CpError ? e.message : 'Gagal menghubungkan: ' + (e.message || e))
    } finally {
      setBusy(null)
    }
  }

  async function onPush() {
    if (!navigator.onLine) { toast.error('Tidak ada koneksi internet.'); return }
    setBusy('push')
    try {
      await push()
      const meta = storageHelper.get('sync_last_push')
      toast.success(`Konfigurasi tersimpan ke server (${meta.keys.length} kategori)`)
      await loadStatus()
    } catch (e) {
      toast.error(e instanceof CpError ? e.message : 'Gagal menyimpan ke server: ' + (e.message || e))
    } finally {
      setBusy(null)
    }
  }

  async function onPull() {
    if (!navigator.onLine) { toast.error('Tidak ada koneksi internet.'); return }
    setBusy('pull')
    try {
      const res = await pull()
      if (!res.updates || Object.keys(res.updates).length === 0) {
        toast.info('Tidak ada pembaruan untuk diselaraskan')
        return
      }
      const meta = res.serverInfo && res.serverInfo.updatesMeta
      const ok = window.confirm(
        'Ada pembaruan konfigurasi dari perangkat lain di lisensi ini. Terapkan ke aplikasi ini?\n\n' +
          Object.keys(res.updates).map((k) => '• ' + k).join('\n') +
          (meta && meta.pushedAt ? '\n\nDidorong: ' + new Date(meta.pushedAt).toLocaleString('id-ID') : '') +
          '\n\nData BKU/LPJ/dokumen keuangan tidak termasuk.'
      )
      if (!ok) { toast.info('Penyelarasan dibatalkan'); return }
      applyUpdates(res.updates)
      toast.success(`Konfigurasi diselaraskan (${Object.keys(res.updates).length} kategori)`)
      await loadStatus()
    } catch (e) {
      toast.error(e instanceof CpError ? e.message : 'Gagal menyelaraskan: ' + (e.message || e))
    } finally {
      setBusy(null)
    }
  }

  const Badge = ({ s }) => (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_BADGE[s] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
      {s || '—'}
    </span>
  )

  return (
    <div className="bg-surface-container-lowest p-lg rounded-xl shadow-lg border border-outline-variant space-y-md">
      <h3 className="font-headline-sm text-headline-sm font-bold text-text-high flex items-center gap-sm">
        <span className="material-symbols-outlined text-primary">verified</span> Lisensi &amp; Sinkronisasi
      </h3>

      {!licenseCode ? (
        <div className="space-y-3">
          <p className="text-sm text-text-low">
            Belum ada lisensi. Daftar sekolah di halaman <b>Daftar</b> atau tempel kode lisensi yang Anda terima.
          </p>
          <div className="flex gap-sm">
            <input
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="ASIK-XXXX-XXXX-XXXX"
              className="flex-1 h-11 px-4 border border-slate-200 rounded-xl text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2457A7]/10 focus:border-[#2457A7]"
            />
            <button
              onClick={onConnect}
              disabled={busy === 'connect'}
              className="px-6 h-11 bg-[#2457A7] hover:bg-[#1D4688] text-white font-semibold rounded-xl disabled:opacity-60"
            >
              {busy === 'connect' && (
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              Hubungkan
            </button>
          </div>
          <p className="text-xs text-text-low">
            Belum punya kode? Buka halaman Daftar (<span className="font-mono">/daftar</span>) atau hubungi admin pusat.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Status lisensi */}
          <div className="p-md bg-surface-container-low rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-label-md text-text-high font-mono">{licenseCode}</p>
                <p className="text-xs text-text-low">Perangkat: <span className="font-mono">{String(getStoredLicense().deviceFingerprint).slice(0, 13)}…</span></p>
              </div>
              <div className="text-right space-y-1">
                <Badge s={info?.status} />
                {info?.readOnly && <p className="text-xs text-danger">Mode baca aktif — edit LPJ dikunci</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-text-low">
              <p>Berlaku sampai: <b className="text-text-high">{fmtDate(info?.validUntil)}</b></p>
              <p>Koneksi: <b className={info?.connected ? 'text-emerald-600' : 'text-danger'}>{info?.connected ? 'terhubung' : 'tidak terhubung'}</b></p>
              <p>Terakhir disimpan: <b className="text-text-high">{fmtDate(info?.lastPush)}</b></p>
              <p>Terakhir diselaraskan: <b className="text-text-high">{fmtDate(info?.lastPull)}</b></p>
            </div>
          </div>

          {/* Aksi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <button
              onClick={onPush}
              disabled={!!busy}
              className="flex items-center gap-md p-lg bg-surface-container-low rounded-xl hover:bg-surface-container-high transition-colors text-left disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-primary text-3xl">{busy === 'push' ? 'sync_lock' : 'cloud_upload'}</span>
              <div>
                <p className="font-label-md text-text-high">Simpan ke Server (Push)</p>
                <p className="text-text-low text-sm">Kirim konfigurasi sekolah ke ASIK Control Plane</p>
              </div>
            </button>
            <button
              onClick={onPull}
              disabled={!!busy}
              className="flex items-center gap-md p-lg bg-surface-container-low rounded-xl hover:bg-surface-container-high transition-colors text-left disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-primary text-3xl">{busy === 'pull' ? 'sync_lock' : 'cloud_download'}</span>
              <div>
                <p className="font-label-md text-text-high">Penyelarasan Data (Pull)</p>
                <p className="text-text-low text-sm">Tarik pembaruan konfigurasi dari server</p>
              </div>
            </button>
          </div>

          <p className="text-xs text-text-low flex items-start gap-1.5">
            <span className="material-symbols-outlined text-sm mt-0.5">shield</span>
            Yang dikirim/disinkron hanya kategori terbatas: profil &amp; pejabat sekolah, data guru/tendik,
            catatan, nomor surat, identitas pengguna. Data BKU, realisasi, dan dokumen LPJ <b>tidak</b> dikirim.
          </p>
        </div>
      )}
    </div>
  )
}
