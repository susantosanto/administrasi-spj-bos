# 📋 PRD: Download Dokumen Referensi di Electron (extraResources + shell.openPath)

*Dibuat: 20 Juli 2026 | Versi: 1.0 | Status: PLAN*

---

## 📌 Executive Summary

**Fitur:** Download / buka dokumen referensi PDF (Permendagri, Juknis BOSP, dll) di aplikasi **Electron desktop** menggunakan `shell.openPath()`.

**Masalah yang Diselesaikan:**
- Di web (Vercel), file PDF di-host di Google Drive → butuh internet
- Di Electron, kita ingin **offline-first** — file tersimpan di lokal
- User klik "Ya, Unduh" → file terbuka di PDF reader default Windows (Adobe Reader / Edge)

---

## 🏗️ Arsitektur

```
┌─────────────────────────────────────────────────────────────┐
│                    ELECTRON APP                              │
│                                                             │
│  ┌───────────────────┐        ┌──────────────────────────┐  │
│  │  RENDERER (React)  │  IPC   │    MAIN PROCESS (Node)   │  │
│  │                    │───────►│                          │  │
│  │  docHelper.js      │  open  │  shell.openPath(path)    │  │
│  │  DownloadConfirm   │  doc   │  ┌──────────────────┐   │  │
│  │  Modal.jsx         │◄───────│  │ resources/docs/   │   │  │
│  │                    │  path  │  │ (PDF files)       │   │  │
│  │  DashboardHome.jsx │        │  └──────────────────┘   │  │
│  └───────────────────┘        └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Alur Lengkap:

```
User klik card "PERMENDAGRI"
  → Modal konfirmasi "Ya, Unduh?"
    → Klik "Ya, Unduh"
      → Renderer: window.electronAPI.openDoc('permendagri.pdf')
        → Preload: ipcRenderer.invoke('docs:open', 'permendagri.pdf')
          → Main: ipcMain.handle('docs:open')
            → const filePath = path.join(process.resourcesPath, 'docs', 'permendagri.pdf')
            → shell.openPath(filePath)
              → OS Windows: buka Adobe Reader / Edge dengan file PDF
```

---

## 📦 File yang Diperlukan

### 1. Source PDF (Development)

**Folder:** `build-resources/docs/`

| File Sumber | Ukuran |
|-------------|--------|
| `permendagri.pdf` | ~2.8 MB |
| `juknis-bosp.pdf` | ~349 KB |
| `perbup.pdf` | ~172 KB |
| `permendikbudristek-18.pdf` | ~6.6 MB |

> Folder ini di `.gitignore` — tidak ikut git.

### 2. Konfigurasi electron-builder.yml

```yaml
# electron-builder.yml
extraResources:
  - from: build-resources/docs/
    to: docs/
    filter:
      - "**/*.pdf"
```

### 3. Main Process (electron/main.js)

```javascript
const { app, ipcMain, shell } = require('electron')
const path = require('path')

let docsPath

function getDocsPath() {
  if (docsPath) return docsPath
  docsPath = app.isPackaged
    ? path.join(process.resourcesPath, 'docs')
    : path.join(__dirname, '..', '..', 'build-resources', 'docs')
  return docsPath
}

ipcMain.handle('docs:open', async (event, filename) => {
  const filePath = path.join(getDocsPath(), filename)
  const error = await shell.openPath(filePath)
  if (error) {
    console.error(`Gagal membuka ${filename}:`, error)
    return { success: false, error }
  }
  return { success: true, path: filePath }
})

ipcMain.handle('docs:list', async () => {
  const fs = require('fs')
  const dir = getDocsPath()
  try {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.pdf'))
    return { success: true, files }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

ipcMain.handle('docs:exists', async (event, filename) => {
  const fs = require('fs')
  const filePath = path.join(getDocsPath(), filename)
  return { exists: fs.existsSync(filePath) }
})
```

### 4. Preload Script (electron/preload.js)

```javascript
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Dokumen Referensi
  openDoc: (filename) => ipcRenderer.invoke('docs:open', filename),
  listDocs: () => ipcRenderer.invoke('docs:list'),
  docExists: (filename) => ipcRenderer.invoke('docs:exists', filename),
})
```

---

## 🔧 Perubahan di Kode yang Sudah Ada

### docHelper.js — SUDAH SIAP

Kode `docHelper.js` saat ini sudah punya:

```javascript
// Sudah ada — tinggal uncomment untuk Electron
if (window.electronAPI) {
  window.electronAPI.openDoc(filename)
  return
}
```

### DownloadConfirmModal.jsx — SUDAH SIAP

Modal sudah punya tombol "Ya, Unduh" yang panggil `downloadDoc()` → otomatis deteksi `window.electronAPI`.

### DashboardHome.jsx — SUDAH SIAP

Card Dokumen Referensi sudah pakai `downloadDoc()` dari `docHelper.js`.

---

## 📋 Test Scenarios

| # | Scenario | Expected | Test Method |
|---|----------|----------|-------------|
| 1 | Klik card PERMENDAGRI → modal muncul | ✅ Modal "Ya, Unduh?" tampil | Manual |
| 2 | Klik "Ya, Unduh" → file terbuka | ✅ PDF terbuka di reader default | Manual |
| 3 | Klik "Batal" → modal tutup | ✅ Modal hilang, file tidak terbuka | Manual |
| 4 | Tekan ESC → modal tutup | ✅ Modal hilang | Manual |
| 5 | File PDF tidak ada di resources | ✅ Muncul error toast "File tidak ditemukan" | Manual |
| 6 | Klik card TKA (file: null) | ✅ Modal tidak muncul (disabled) | Manual |
| 7 | Klik card SSH (file: null) | ✅ Modal tidak muncul (disabled) | Manual |
| 8 | VITE_DOCS_MODE=drive di Electron | ✅ Tetap pakai electronicAPI, bukan Drive | Integration |

---

## 📊 Perbandingan Mode

| Aspek | LOCAL (web) | DRIVE (web) | ELECTRON (desktop) |
|-------|-------------|-------------|-------------------|
| **Sumber file** | `public/docs/` | Google Drive | `resources/docs/` |
| **Internet?** | ✅ Tidak | ❌ Ya | ✅ Tidak |
| **Cara buka** | `window.open()` | `window.open()` | `shell.openPath()` |
| **File ID** | - | VITE_DOCS_* env | Bundled di installer |
| **Update file** | Copy manual | Upload ke Drive | Rebuild app |
| **Ukuran installer** | - | - | +10 MB |

---

## 🔄 Migration Path

```
FASE 1 (SEKARANG):  Web app → Google Drive ✅ SUDAH IMPLEMENT
FASE 2 (NANTI):     Electron → extraResources (PRD ini)
                    1. Buat electron/main.js
                    2. Buat electron/preload.js
                    3. Update electron-builder.yml
                    4. Update docHelper.js (uncomment electronAPI)
                    5. npm run build:electron
```

---

## ✅ Definition of Done

- [ ] `electron/main.js` — IPC handler `docs:open` + `docs:list` + `docs:exists`
- [ ] `electron/preload.js` — contextBridge expose `electronAPI.openDoc`
- [ ] `electron-builder.yml` — extraResources bundle PDF
- [ ] `docHelper.js` — uncomment block `if (window.electronAPI)`
- [ ] PDF terbuka di Adobe Reader / Edge saat klik "Ya, Unduh"
- [ ] Error handling: file tidak ditemukan → toast warning
- [ ] Build: `npm run build:electron` sukses
- [ ] Installer: file PDF ikut terbundle di `resources/docs/`
