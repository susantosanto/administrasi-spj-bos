import { useState } from 'react'
import Topbar from '../../components/layout/Topbar'
import { useToast } from '../../components/ui/Toast'

export default function PengaturanPage() {
  const [tab, setTab] = useState('profil')
  const [siplah, setSiplah] = useState(false)
  const toast = useToast()

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Pengaturan" subtitle="Konfigurasi aplikasi" />

      <div className="p-lg space-y-lg flex-1">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-sm border-b border-outline-variant pb-md">
          {[
            { id: 'profil', label: 'Profil Sekolah', icon: 'school' },
            { id: 'master', label: 'Data Master', icon: 'database' },
            { id: 'backup', label: 'Backup & Restore', icon: 'backup' },
            { id: 'tentang', label: 'Tentang', icon: 'info' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-sm px-lg py-2 rounded-lg font-label-md transition-all ${tab === t.id ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
            >
              <span className="material-symbols-outlined text-lg">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === 'profil' && (
          <div className="bg-surface-container-lowest p-lg rounded-xl shadow-lg border border-outline-variant space-y-md">
            <h3 className="font-headline-sm text-headline-sm font-bold text-text-high flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">school</span> Profil Sekolah
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="space-y-xs">
                <label className="font-label-md text-text-high">Tahun Anggaran</label>
                <select className="w-full px-md py-2 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                  <option>2025</option><option>2024</option><option>2023</option>
                </select>
              </div>
              <div className="space-y-xs">
                <label className="font-label-md text-text-high">Semester</label>
                <select className="w-full px-md py-2 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                  <option>Semester 1 (Ganjil)</option><option>Semester 2 (Genap)</option>
                </select>
              </div>
            </div>
            <button onClick={() => toast.success('Pengaturan profil disimpan')} className="flex items-center gap-sm bg-primary text-on-primary px-lg py-2 rounded-lg hover:brightness-110 shadow-md transition-all active:scale-95 font-label-md">
              <span className="material-symbols-outlined">save</span> Simpan
            </button>
          </div>
        )}

        {tab === 'master' && (
          <div className="bg-surface-container-lowest p-lg rounded-xl shadow-lg border border-outline-variant space-y-md">
            <h3 className="font-headline-sm text-headline-sm font-bold text-text-high flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">database</span> Data Master
            </h3>
            <div className="flex items-center justify-between p-md bg-surface-container-low rounded-lg">
              <div>
                <p className="font-label-md text-text-high">Mode SIPLAH</p>
                <p className="text-text-low text-sm">Aktifkan jika sekolah menggunakan sistem SIPLAH untuk pengadaan</p>
              </div>
              <button
                onClick={() => { setSiplah(!siplah); toast.success(siplah ? 'Mode Non-SIPLAH diaktifkan' : 'Mode SIPLAH diaktifkan'); }}
                className={`w-14 h-7 rounded-full transition-colors relative ${siplah ? 'bg-primary' : 'bg-outline-variant'}`}
              >
                <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${siplah ? 'translate-x-7' : 'translate-x-0.5'}`}></span>
              </button>
            </div>
          </div>
        )}

        {tab === 'backup' && (
          <div className="bg-surface-container-lowest p-lg rounded-xl shadow-lg border border-outline-variant space-y-md">
            <h3 className="font-headline-sm text-headline-sm font-bold text-text-high flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">backup</span> Backup & Restore
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <button onClick={() => toast.success('Data berhasil diexport ke JSON')} className="flex items-center gap-md p-lg bg-surface-container-low rounded-xl hover:bg-surface-container-high transition-colors text-left">
                <span className="material-symbols-outlined text-primary text-3xl">download</span>
                <div>
                  <p className="font-label-md text-text-high">Export Semua Data</p>
                  <p className="text-text-low text-sm">Download seluruh data sekolah + dokumen (.json)</p>
                </div>
              </button>
              <button onClick={() => toast.info('Fitur import akan segera tersedia')} className="flex items-center gap-md p-lg bg-surface-container-low rounded-xl hover:bg-surface-container-high transition-colors text-left">
                <span className="material-symbols-outlined text-primary text-3xl">upload</span>
                <div>
                  <p className="font-label-md text-text-high">Import Data</p>
                  <p className="text-text-low text-sm">Upload file backup sebelumnya (.json)</p>
                </div>
              </button>
              <button onClick={() => toast.warning('Fitur export BKU akan segera tersedia')} className="flex items-center gap-md p-lg bg-surface-container-low rounded-xl hover:bg-surface-container-high transition-colors text-left">
                <span className="material-symbols-outlined text-primary text-3xl">table_view</span>
                <div>
                  <p className="font-label-md text-text-high">Export BKU Saja</p>
                  <p className="text-text-low text-sm">Download data BKU per periode (.xlsx)</p>
                </div>
              </button>
              <button className="flex items-center gap-md p-lg bg-red-50 rounded-xl hover:bg-red-100 transition-colors text-left">
                <span className="material-symbols-outlined text-danger text-3xl">delete_forever</span>
                <div>
                  <p className="font-label-md text-danger">Reset Semua Data</p>
                  <p className="text-red-400 text-sm">Hapus semua data (tidak dapat dibatalkan)</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {tab === 'tentang' && (
          <div className="bg-surface-container-lowest p-lg rounded-xl shadow-lg border border-outline-variant space-y-md">
            <h3 className="font-headline-sm text-headline-sm font-bold text-text-high flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">info</span> Tentang Aplikasi
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-outline-variant">
                <span className="text-text-low">Nama Aplikasi</span>
                <span className="font-label-md text-text-high">LPJ BOS/BOSP</span>
              </div>
              <div className="flex justify-between py-2 border-b border-outline-variant">
                <span className="text-text-low">Versi</span>
                <span className="font-label-md text-text-high">1.0.0</span>
              </div>
              <div className="flex justify-between py-2 border-b border-outline-variant">
                <span className="text-text-low">Tech Stack</span>
                <span className="font-label-md text-text-high">React + Vite + Tailwind CSS</span>
              </div>
              <div className="flex justify-between py-2 border-b border-outline-variant">
                <span className="text-text-low">Developer</span>
                <span className="font-label-md text-text-high">Tim IT Pendidikan</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-text-low">Tahun</span>
                <span className="font-label-md text-text-high">2025</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
