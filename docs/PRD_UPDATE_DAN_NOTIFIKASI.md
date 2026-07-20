# 📋 PRD: Sistem Update & Notifikasi Real-Time Aplikasi SPJ Electron

*Dibuat: 19 Juli 2026 | Versi: 1.0 | Status: PLAN*

---

## 📌 Executive Summary

**Masalah:**
- Saat ini aplikasi 100% SPA browser — setiap update harus deploy ulang di server dev
- Operator sekolah non-IT kesulitan melakukan update manual (download installer, uninstall, install ulang)
- Tidak ada mekanisme notifikasi jika ada pembaruan atau informasi penting dari pengembang
- Banyak sekolah di daerah dengan internet terbatas — butuh mode update offline via flashdisk
- Tidak ada history notifikasi — informasi penting (perubahan kode rekening, jadwal pemeliharaan) tidak terdokumentasi di dalam aplikasi

**Solusi:**
Sistem update dan notifikasi terintegrasi penuh di Electron:

1. **Auto-Update** — `electron-updater` + GitHub Releases, download silent di background, banner restart ramah
2. **Notifikasi In-App** — Panel notifikasi + banner + toast, sumber dari file JSON di GitHub (gratis, tanpa server)
3. **Update Offline** — Deteksi installer di flashdisk untuk sekolah tanpa internet
4. **Semua data tetap aman** — Update tidak menghapus database SQLite

---

## 🎯 Tujuan

1. **Zero-friction update** — Operator sekolah cukup klik 1 tombol "Restart Sekarang"
2. **Notifikasi real-time** — Informasi penting sampai ke semua pengguna dalam 6 jam
3. **Offline-first** — Update tetap bisa dilakukan tanpa internet (via flashdisk)
4. **Biaya Rp 0** — Semua infrastruktur gratis (GitHub Releases, GitHub RAW)
5. **User-friendly untuk non-IT** — Bahasa Indonesia, tanpa istilah teknis
6. **Data aman** — Database SQLite tidak tersentuh saat update

---

## 🏗️ Arsitektur

### Diagram Sistem Update

```
                      GITHUB RELEASES
                    (Gratis, Unlimited)
                          │
                          │ electron-updater check
                          │ (background tiap startup)
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│                     ELECTRON APP (Main Process)                   │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  autoUpdater.checkForUpdatesAndNotify()                    │  │
│  │                                                             │  │
│  │  ├── checkForUpdates → fetch latest.yml dari GitHub        │  │
│  │  ├── update-available → download .exe di background        │  │
│  │  ├── download-progress → IPC ke renderer (progress bar)    │  │
│  │  └── update-downloaded → IPC "siap restart"                │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  NotificationService.js                                     │  │
│  │                                                             │  │
│  │  ├── checkForNews() → fetch from GitHub RAW (notif.json)   │  │
│  │  ├── cache ke SQLite → table `notifications`               │  │
│  │  └── send to renderer via IPC                               │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────┬───────────────────────────────┘
                                   │ IPC
                                   ▼
┌──────────────────────────────────────────────────────────────────┐
│                     RENDERER (React UI)                          │
│                                                                   │
│  ┌────────────────────┐  ┌────────────────────────────────────┐  │
│  │ NotificationBell   │  │ NotificationPanel                  │  │
│  │ (Topbar, selalu    │  │ (Dropdown daftar notifikasi)       │  │
│  │  visible)          │  │                                    │  │
│  │  🔔 [3]            │  │ ✅ Update v1.2 tersedia            │  │
│  └────────┬───────────┘  │ 📢 Pemutakhiran data referensi    │  │
│           │              │ ⚠️ Pemeliharaan server             │  │
│  ┌────────▼───────────┐  └────────────────────────────────────┘  │
│  │ NotificationBanner │  ┌────────────────────────────────────┐  │
│  │ (Banner update)    │  │ NotificationToast                  │  │
│  │ ✨ Update siap!    │  │ (Popup sementara)                   │  │
│  │ [Restart Sekarang] │  │ ✅ Backup berhasil                 │  │
│  └────────────────────┘  └────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Diagram Sumber Notifikasi

```
┌─────────────────────────────────────────────────────────────────┐
│                      PENGEMBANG (ANDA)                           │
│                                                                  │
│  1. Buat release baru di GitHub                                 │
│     → Auto-trigger: electron-updater                            │
│                                                                  │
│  2. Edit file `notifications.json` di GitHub web UI             │
│     → Notifikasi berita/pengumuman                              │
│     → Bisa dari HP!                                              │
│                                                                  │
│  3. Upload installer ke GitHub Releases                         │
│     → Untuk update offline via flashdisk                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Data Model

### Tabel SQLite untuk Notifikasi

```sql
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'news',           -- 'update' | 'news' | 'maintenance'
  title TEXT NOT NULL,
  message TEXT,
  severity TEXT DEFAULT 'info',                -- 'info' | 'warning' | 'critical'
  is_read INTEGER DEFAULT 0,                   -- 0=belum dibaca, 1=sudah
  is_dismissed INTEGER DEFAULT 0,              -- 0=aktif, 1=dismiss
  date TEXT,                                    -- Tanggal notifikasi
  action_url TEXT,                              -- URL untuk "Lihat Detail"
  version TEXT,                                 -- Versi (khusus tipe 'update')
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_unread ON notifications(is_read);
CREATE INDEX idx_notifications_date ON notifications(date DESC);
```

### File `notifications.json` (di GitHub repo — gratis, no server)

```json
{
  "latestNotificationId": 5,
  "notifications": [
    {
      "id": 5,
      "type": "update",
      "title": "✨ Update SPJ v1.2.0",
      "message": "Aplikasi lebih cepat dengan perbaikan cetak dokumen dan template honor kegiatan baru.",
      "severity": "info",
      "date": "2026-07-19",
      "version": "1.2.0",
      "actionUrl": null
    },
    {
      "id": 4,
      "type": "news",
      "title": "📢 Pemutakhiran Kode Rekening ARKAS",
      "message": "Kode rekening ARKAS 2026 telah diperbarui. Silakan cek di menu Referensi Kode untuk memastikan data sesuai.",
      "severity": "info",
      "date": "2026-07-15"
    },
    {
      "id": 3,
      "type": "maintenance",
      "title": "🔧 Server AI dalam Perbaikan",
      "message": "Server AI akan diperbaiki pada 20 Juli 2026 pukul 02.00-04.00 WIB. Fitur Tanya AI tidak bisa digunakan sementara.",
      "severity": "warning",
      "date": "2026-07-14"
    },
    {
      "id": 2,
      "type": "news",
      "title": "📋 Pengingat LPJ Semester 2",
      "message": "Jangan lupa selesaikan dokumen LPJ Semester 2 sebelum batas waktu 31 Juli 2026.",
      "severity": "info",
      "date": "2026-07-10"
    },
    {
      "id": 1,
      "type": "news",
      "title": "🎉 Selamat Datang di SPJ App",
      "message": "Aplikasi SPJ versi desktop siap membantu Bapak/Ibu mengelola administrasi BOS/BOSP dengan lebih mudah.",
      "severity": "info",
      "date": "2026-07-01"
    }
  ]
}
```

### Struktur SQLite untuk Status Update

```sql
CREATE TABLE update_status (
  key TEXT PRIMARY KEY,                        -- 'last_version_checked' | 'last_update_available'
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🎨 UX Flow & Wireframe

### Flow Update

```
					FLOW: UPDATE TERSEDIA

┌──────────────┐     ┌────────────────┐     ┌──────────────────┐
│  USER BUKA   │────→│  AUTO CHECK     │────→│  UPDATE TERSEDIA? │
│  APLIKASI    │     │  (background)   │     │                  │
└──────────────┘     └────────────────┘     └──────┬───────────┘
		                     │
                     ┌───────────────┴────────────┐
                     ▼                            ▼
            ┌──────────────────────┐    ┌──────────────────┐
            │ DOWNLOAD SILENT      │    │ TIDAK ADA UPDATE │
            │ (0% interupsi kerja) │    │ (diam tidak      │
            │                      │    │  tampil apa-apa) │
            └──────────┬───────────┘    └──────────────────┘
                       │
                       ▼
            ┌──────────────────────────────────────┐
            │ BANNER UPDATE SIAP                    │
            │                                      │
            │ ✨ Update v1.2 sudah siap!            │
            │ Aplikasi akan lebih cepat.           │
            │ Butuh restart 2-3 detik.             │
            │ Data aman tersimpan.                 │
            │                                      │
            │        [Nanti]  [Restart Sekarang]   │
            └──────────────────────────────────────┘
```

```
					FLOW: UPDATE OFFLINE VIA FLASHDISK

┌──────────────┐     ┌────────────────┐     ┌──────────────────┐
│  COLOCK      │────→│  DETEKSI FILE   │────→│  FILE INSTALLER  │
│  FLASHDISK   │     │  SPJ-Update/    │     │  DITEMUKAN?      │
└──────────────┘     └────────────────┘     └──────┬───────────┘
		                     │
                     ┌───────────────┴────────────┐
                     ▼                            ▼
            ┌──────────────────────┐    ┌──────────────────┐
            │ BANNER: Update       │    │ Tidak ada file   │
            │ ditemukan di         │    │ → diam           │
            │ flashdisk!           │    └──────────────────┘
            │ [Update Sekarang]    │
            └──────────┬───────────┘
                       │
                       ▼
            ┌──────────────────────────────────────┐
            │ PROSES INSTALL OTOMATIS              │
            │                                      │
            │ ⏳ Memasang update...                 │
            │ ████████████░░░░  60%                │
            │                                      │
            │ Jangan cabut flashdisk.               │
            └──────────────────────────────────────┘
```

### Wireframe UI

#### 1. Ikon Bel Notifikasi di Topbar

```
┌──────────────────────────────────────────────────────────────┐
│  📋 SPJ BOS/BOSP                     [🔔] [⚙️] [👤 Admin]  │
│                                         │                     │
│  ┌─[🏠] Dashboard──[📁] BKU──[📄] Dokumen──[⚙] Pengaturan   │
│  └───────────────────────────────────────────────────────────│
│                                                               │
│  [Konten halaman...]                                          │
└──────────────────────────────────────────────────────────────┘
```

#### 2. Panel Notifikasi (Dropdown)

```
┌──────────────────────────────────────────────────────────────┐
│  🔔 Notifikasi                      [Tandai Semua Dibaca]  │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ● ✨ Update v1.2.0 Tersedia         19 Jul 2026             │
│    Aplikasi lebih cepat dengan perbaikan cetak dokumen...   │
│    [Lihat Detail]                                             │
│                                                               │
│  ● 📢 Pemutakhiran Kode Rekening     15 Jul 2026             │
│    Kode rekening ARKAS 2026 telah diperbarui...              │
│                                                               │
│  ○ 🔧 Server AI dalam Perbaikan      14 Jul 2026             │
│    Server AI akan diperbaiki...                              │
│                                                               │
│  ○ 📋 Pengingat LPJ Semester 2       10 Jul 2026             │
│    Jangan lupa selesaikan dokumen LPJ...                     │
│                                                               │
│  ──────────────────────────────────────────────────           │
│  [🗂 Lihat Semua Notifikasi]     [⚙ Pengaturan Notif]       │
└──────────────────────────────────────────────────────────────┘
```

#### 3. Banner Update Tersedia

```
┌──────────────────────────────────────────────────────────────┐
│ ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■  │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ ✨ Update v1.2.0 sudah siap!                              │ │
│ │   Aplikasi lebih cepat dan stabil.                       │ │
│ │   Restart kapan pun Bapak/Ibu senggang.                  │ │
│ │                                  [Nanti Saja] [Restart]  │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                               │
│  [🏠 Dashboard]                                                │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

#### 4. Modal Konfirmasi Restart

```
┌──────────────────────────────────────────────────────┐
│                                                       │
│  ┌────────────────────────────────────────────────┐  │
│  │  ✨ Pembaruan Berhasil!                        │  │
│  │                                                │  │
│  │  Aplikasi SPJ sudah diperbarui ke versi 1.2.0 │  │
│  │  dengan perbaikan dan fitur baru.              │  │
│  │                                                │  │
│  │  Klik "Restart Sekarang" untuk merasakan      │  │
│  │  perubahannya.                                 │  │
│  │                                                │  │
│  │  ⏱ Proses hanya 2-3 detik.                    │  │
│  │                                                │  │
│  │         [Nanti]  [Restart Sekarang]           │  │
│  └────────────────────────────────────────────────┘  │
│                                                       │
└──────────────────────────────────────────────────────┘
```

#### 5. Toast Notifikasi

```
┌──────────────────────────────────────────────────┐
│                                                  │
│  ┌──────────────────────────────────────────┐    │
│  │ ✅ SPJ berhasil backup data ke flashdisk │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 📋 Fitur Detail

### A. Sistem Auto-Update

| Fitur | Prioritas | Keterangan |
|-------|-----------|------------|
| A.1 Check update otomatis saat startup | P0 | Panggil `autoUpdater.checkForUpdatesAndNotify()` |
| A.2 Download silent di background | P0 | Download tanpa interupsi, user tetap kerja |
| A.3 Staged rollout | P1 | Rilis bertahap (10% → 50% → 100%) via `stagingPercentage` |
| A.4 Progress bar download | P1 | Tampilkan progress untuk update besar (>50MB) |
| A.5 Banner update siap restart | P0 | Banner non-intrusif di atas halaman |
| A.6 Modal konfirmasi restart | P0 | Modal dengan opsi "Restart Sekarang" / "Nanti" |
| A.7 Force update untuk critical | P2 | Untuk security patch — user harus update |
| A.8 Halaman "Tentang" dengan versi | P1 | Menu Settings → Tentang → lihat versi + cek update manual |
| A.9 Log update di file | P1 | Simpan log update untuk debugging |

### B. Update Offline via Flashdisk

| Fitur | Prioritas | Keterangan |
|-------|-----------|------------|
| B.1 Deteksi file installer di flashdisk | P1 | Scan drive D:, E:, F: untuk file `SPJ-*.exe` |
| B.2 Bandingkan versi | P1 | Jika versi di flashdisk > versi terinstall → tawarkan update |
| B.3 Jalankan installer | P1 | Buka file .exe installer |
| B.4 Notifikasi flashdisk terdeteksi | P1 | Banner: "Update ditemukan di flashdisk" |
| B.5 Abaikan jika versi sama | P2 | Jangan tawarkan update jika versi sudah sama |

### C. Notifikasi In-App

| Fitur | Prioritas | Keterangan |
|-------|-----------|------------|
| C.1 Ikon bel di topbar | P0 | 🔔 dengan badge jumlah notifikasi belum dibaca |
| C.2 Panel dropdown notifikasi | P0 | Daftar notifikasi dengan ikon, judul, tanggal |
| C.3 Tandai sudah dibaca | P0 | Klik notifikasi → mark as read |
| C.4 Tandai semua dibaca | P1 | Tombol "Tandai Semua Dibaca" |
| C.5 Fetch notifikasi dari GitHub JSON | P0 | Interval 6 jam, simpan ke SQLite |
| C.6 Banner notifikasi critical | P1 | Untuk update keamanan, maintenance urgent |
| C.7 Toast notifikasi | P2 | Untuk notifikasi ringan, hilang otomatis 5 detik |
| C.8 Halaman history notifikasi | P2 | "Lihat Semua Notifikasi" → halaman penuh |
| C.9 Filter notifikasi (type/severity) | P2 | Tab: Update, Berita, Maintenance |
| C.10 Settings notifikasi | P2 | Atur interval cek, jenis notifikasi |

---

## 📁 Struktur File

```
spj-frontend/
├── electron/
│   ├── main.js                       ← + autoUpdater + NotificationService
│   ├── preload.js                    ← + expose notifikasi API
│   ├── db.js                         ← + table notifications
│   └── notificationService.js        ← BARU: fetch notifikasi dari GitHub
├── src/
│   ├── components/
│   │   ├── notification/
│   │   │   ├── NotificationBell.jsx        ← BARU
│   │   │   ├── NotificationPanel.jsx       ← BARU
│   │   │   ├── NotificationBanner.jsx      ← BARU
│   │   │   ├── NotificationToast.jsx       ← BARU
│   │   │   ├── UpdateModal.jsx             ← BARU
│   │   │   └── NotificationSettings.jsx    ← BARU
│   │   ├── layout/
│   │   │   └── Topbar.jsx                  ← UPDATE: + NotificationBell
│   │   └── settings/
│   │       └── AboutPage.jsx               ← BARU atau di PengaturanPage
│   └── utils/
│       └── electronNotif.js                ← BARU: helper IPC notifikasi
├── notifications.json                 ← BARU: file notifikasi di root repo
└── electron-builder.yml               ← UPDATE: + publish config
```

---

## 🔧 Spesifikasi Teknis

### A. Implementasi Auto-Update

**Package dependencies:**
```json
{
  "dependencies": {
    "electron-updater": "^6.0.0",
    "electron-log": "^5.0.0"
  }
}
```

**Konfigurasi electron-builder.yml:**
```yaml
appId: com.spj.app
productName: Aplikasi SPJ
directories:
  output: dist-electron
win:
  target:
    - target: nsis
      arch: [x64]
publish:
  - provider: github
    owner: susantosanto
    repo: administrasi-spj-bos
nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
  createDesktopShortcut: true
  shortcutName: Aplikasi SPJ
  deleteAppDataOnUninstall: false    # ← PENTING: jangan hapus database!
```

**Main process — autoUpdater:**
```javascript
const { autoUpdater } = require('electron-updater')
const log = require('electron-log')

autoUpdater.logger = log
autoUpdater.autoDownload = true

// Event: update tersedia → download otomatis
autoUpdater.on('update-available', (info) => {
  mainWindow.webContents.send('update:available', {
    version: info.version,
    releaseDate: info.releaseDate,
  })
})

// Event: progress download
autoUpdater.on('download-progress', (progress) => {
  mainWindow.webContents.send('update:progress', {
    percent: progress.percent,
    bytesPerSecond: progress.bytesPerSecond,
  })
})

// Event: update siap diinstall
autoUpdater.on('update-downloaded', (info) => {
  mainWindow.webContents.send('update:ready', {
    version: info.version,
    releaseNotes: info.releaseNotes,
  })
})

// Event: error
autoUpdater.on('error', (err) => {
  log.error('Update error:', err.message)
  mainWindow.webContents.send('update:error', {
    message: err.message,
  })
})

// Call saat app siap
app.whenReady().then(() => {
  autoUpdater.checkForUpdatesAndNotify()
})
```

**Renderer — respon user action:**
```javascript
// preload.js — contextBridge
contextBridge.exposeInMainWorld('electronAPI', {
  // Update
  onUpdateAvailable: (callback) => ipcRenderer.on('update:available', (_, d) => callback(d)),
  onUpdateProgress: (callback) => ipcRenderer.on('update:progress', (_, d) => callback(d)),
  onUpdateReady: (callback) => ipcRenderer.on('update:ready', (_, d) => callback(d)),
  onUpdateError: (callback) => ipcRenderer.on('update:error', (_, d) => callback(d)),
  restartApp: () => ipcRenderer.send('app:restart'),
  
  // Notifikasi
  onNotification: (callback) => ipcRenderer.on('notification:news', (_, d) => callback(d)),
  getNotifications: () => ipcRenderer.invoke('notif:getAll'),
  markAsRead: (id) => ipcRenderer.invoke('notif:markRead', id),
  markAllAsRead: () => ipcRenderer.invoke('notif:markAllRead'),
})
```

```javascript
// electron/main.js — IPC handler restart
ipcMain.on('app:restart', () => {
  autoUpdater.quitAndInstall()
})
```

### B. Implementasi NotificationService

```javascript
// electron/notificationService.js
class NotificationService {
  constructor(mainWindow, db) {
    this.mainWindow = mainWindow
    this.db = db
    this.interval = 6 * 60 * 60 * 1000  // Cek setiap 6 jam
    this.notifUrl = 'https://raw.githubusercontent.com/susantosanto/administrasi-spj-bos/main/notifications.json'
  }

  async start() {
    await this.check()
    setInterval(() => this.check(), this.interval)
  }

  async check() {
    try {
      const res = await fetch(this.notifUrl)
      const data = await res.json()

      // Ambil last ID dari SQLite
      const lastId = await this.db.getSetting('last_notification_id') || 0
      const newNotifs = data.notifications.filter(n => n.id > lastId)

      for (const notif of newNotifs) {
        // Simpan ke SQLite
        await this.db.run(
          `INSERT OR IGNORE INTO notifications (id, type, title, message, severity, date, action_url, version)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [notif.id, notif.type, notif.title, notif.message, notif.severity, notif.date, notif.actionUrl || null, notif.version || null]
        )

        // Kirim ke renderer
        this.mainWindow.webContents.send('notification:news', notif)
      }

      // Update last ID
      await this.db.setSetting('last_notification_id', data.latestNotificationId)
    } catch (err) {
      console.warn('Gagal cek notifikasi:', err.message)
    }
  }
}

module.exports = NotificationService
```

### C. Implementasi Update Flashdisk

```javascript
// electron/flashdiskUpdater.js
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const { app } = require('electron')

class FlashdiskUpdater {
  constructor(mainWindow) {
    this.mainWindow = mainWindow
    this.currentVersion = app.getVersion()
    this.scanInterval = 30000  // Scan setiap 30 detik
  }

  async start() {
    setInterval(() => this.scan(), this.scanInterval)
  }

  async scan() {
    const drives = this.getRemovableDrives()  // D:, E:, F:, dll
    for (const drive of drives) {
      const installerPath = this.findInstaller(drive)
      if (installerPath) {
        const installerVersion = this.parseVersion(installerPath)
        if (this.compareVersions(installerVersion, this.currentVersion) > 0) {
          // Ada update! Kirim notifikasi ke renderer
          this.mainWindow.webContents.send('flashdisk:update-available', {
            installerPath,
            version: installerVersion,
            currentVersion: this.currentVersion,
          })
          return  // Hanya proses 1 update
        }
      }
    }
  }

  findInstaller(drive) {
    const dir = path.join(drive, 'SPJ-Update')
    if (!fs.existsSync(dir)) return null
    const files = fs.readdirSync(dir)
    const installer = files.find(f => f.startsWith('SPJ-App-Setup-') && f.endsWith('.exe'))
    return installer ? path.join(dir, installer) : null
  }

  install(installerPath) {
    exec(`"${installerPath}" /S`, (err) => {
      if (err) {
        this.mainWindow.webContents.send('flashdisk:update-error', { message: err.message })
      }
    })
  }
}
```

---

## 📋 Definisi Selesai (Definition of Done)

### Fase 1: Auto-Update (P0)
- [ ] `electron-updater` terinstall dan terkonfigurasi
- [ ] Auto check saat startup berjalan
- [ ] Download silent di background berhasil
- [ ] Banner "Update siap restart" muncul
- [ ] Klik "Restart Sekarang" → restart + install
- [ ] Data SQLite tetap aman setelah update
- [ ] Staged rollout via `stagingPercentage`

### Fase 2: Notifikasi In-App (P0)
- [ ] Ikon bel di topbar dengan badge
- [ ] Panel dropdown menampilkan daftar notifikasi
- [ ] Tandai sudah dibaca (single + all)
- [ ] `notificationService.js` fetch dari GitHub JSON
- [ ] Notifikasi tersimpan di SQLite
- [ ] Banner untuk notifikasi critical
- [ ] Toast untuk notifikasi ringan

### Fase 3: Update Offline Flashdisk (P1)
- [ ] Deteksi drive removable (D:, E:, dll)
- [ ] Cari file `SPJ-Update/SPJ-App-Setup-*.exe`
- [ ] Bandingkan versi
- [ ] Tawarkan update jika versi lebih baru
- [ ] Jalankan installer

### Fase 4: Settings & About (P1)
- [ ] Halaman "Tentang" dengan versi aplikasi
- [ ] Tombol "Cek Update" manual
- [ ] Pengaturan notifikasi (interval, jenis)
- [ ] History notifikasi (halaman penuh)

### General
- [ ] Semua teks dalam Bahasa Indonesia
- [ ] Tidak ada istilah teknis untuk user
- [ ] Error handling ramah user
- [ ] Tidak mengganggu workflow utama

---

## 💻 Tim & Resource

| Role | Kebutuhan |
|------|-----------|
| **Frontend Engineer** | 1 orang (React, komponen notifikasi) — sudah ada |
| **Electron Engineer** | 1 orang (Electron, IPC, autoUpdater) — perlu tambahan |
| **Desainer UI/UX** | 1 orang (wireframe notifikasi) — bisa AI |
| **Testing** | Manual di Windows 10/11 |

---

## ⏱️ Timeline

| Fase | Durasi | Mulai | Selesai |
|------|--------|-------|---------|
| **Fase 0: Riset & Desain** | ✅ Selesai | - | 19 Jul 2026 |
| **Fase 1: Auto-Update** | 3 hari | - | - |
| **Fase 2: Notifikasi In-App** | 4 hari | - | - |
| **Fase 3: Update Flashdisk** | 2 hari | - | - |
| **Fase 4: Settings & About** | 2 hari | - | - |
| **Buffer & Testing** | 2 hari | - | - |
| **TOTAL** | **~13 hari** | - | - |

---

## 📊 Estimasi Biaya

| Item | Biaya | Keterangan |
|------|-------|------------|
| electron-updater | ✅ **Gratis** | Open source, MIT |
| GitHub Releases | ✅ **Gratis** | Public repo, unlimited storage/bandwidth |
| GitHub RAW untuk JSON notifikasi | ✅ **Gratis** | Tidak perlu server backend |
| Code signing Windows | ~**Rp 500k-1jt** | Opsional — untuk menghilangkan warning "Unknown Publisher" |
| **TOTAL** | **~Rp 0-1jt** | |

---

## 🔄 Rollback Plan

### Update gagal
1. **Auto-Update gagal** → App tetap jalan di versi lama. User tidak tahu apa-apa.
2. **Notifikasi gagal fetch** → Tidak muncul. Tidak ada error.
3. **Update flashdisk gagal** → Banner error: "Maaf, update gagal. Coba lagi atau hubungi kami."

### Rollback versi
1. **Jika versi baru bermasalah** → Tinggal release versi lama sebagai versi lebih tinggi (v1.3.0 > v1.2.0)
2. **User dengan versi bermasalah** → Auto-update akan mendorong versi perbaikan

---

## 📝 Catatan Tambahan

### Keamanan
- Pastikan `notifications.json` hanya bisa diedit oleh maintainer repo (branch protection)
- Verifikasi signature installer di Windows (code signing opsional tapi direkomendasikan)
- Auto-update via HTTPS — tidak bisa di-intercept

### Performa
- Check update hanya saat startup + setiap 6 jam — tidak membebani CPU
- Fetch notifikasi lightweight — JSON file < 5KB, tidak termasuk dalam bundle
- Notifikasi disimpan di SQLite — loading panel notifikasi instant

### Aksesibilitas
- Semua komponen notifikasi bisa diakses keyboard (Tab + Enter)
- Warna severity: Info (biru), Warning (kuning), Critical (merah) — dengan ikon untuk color-blind
- Toast bisa ditutup dengan Escape

---

## 🔗 Dokumen Terkait

- [PRD: Migrasi ke Electron + SQLite](./PRD_ELEKTRON_SQLITE.md)
- [Roadmap: Electron + SQLite](./ROADMAP_ELEKTRON_SQLITE.md)
- [Skema Aplikasi SPJ](./Skema_Aplikasi_SPJ.md)
