# PROMPT v2: Fitur "Sinkronisasi Data" (Push/Pull) antara Aplikasi LPJ (User) dengan ASIK Control Plane

> **Revisi v2** (31 Okt 2026) — hasil review prompt v1 terhadap kode nyata `spj-frontend`.
> Perubahan utama:
>
> 1. Nama key whitelist diperbaiki → `data_sekolah`, `data_guru`, `data_tendik`, `auth_user`
>    (key aktual yang memang dipakai aplikasi; camelCase di v1 tidak ditemukan di kode).
> 2. Dikonfirmasi: aplikasi **belum** punya kode lisensi/heartbeat/fingerprint — ini kode & key baru.
> 3. Ada **draf kontrak respons + tabel kode error** yang perlu disetujui pemilik Control Plane.
> 4. PULL jadi all-or-nothing (rollback aman); PUSH diberi peringatan jika akan menimpa versi server yang lebih baru.
> 5. Tambahan catatan: wajib HTTPS di produksi, ukuran base64 logo, siklus hidup fingerprint.
>
> Copas blok berikut ke sesi/agent yang mengerjakan `spj-frontend`.

```text
Kamu adalah agent yang bertanggung jawab mengerjakan aplikasi ASIK (aplikasi LPJ/SPJ
BOS/BOSP) yang berada di repo `spj-frontend`.

Tugas utama: Tambahkan fitur "Sinkronisasi Data" dengan konsep SIMPAN (Push) dan
PENYELARASAN (Pull/Sync) antara aplikasi LPJ user dengan ASIK Control Plane.

## Konteks
- ASIK Control Plane sudah menyediakan endpoint untuk sinkronisasi:
  - POST /device/sync/push   (header: X-License-Code, X-Device-Fingerprint)
  - GET  /device/sync/pull   (header: X-License-Code, X-Device-Fingerprint)
  - GET  /device/sync/status (header: X-License-Code, X-Device-Fingerprint)
- Autentikasi/sinkronisasi menggunakan KODE LISENSI + DEVICE FINGERPRINT.
- PENTING: aplikasi saat ini BELUM punya kode lisensi/heartbeat/fingerprint apa pun.
  Ini kode & key BARU (jangan mencari pola existing):
  - `spj_license_code`       -> X-License-Code
  - `spj_device_fingerprint` -> X-Device-Fingerprint
- Control Plane TIDAK boleh menyimpan isi LPJ/BKU/nominal transaksi/dokumen hasil
  generate. Hanya konfigurasi sekolah. Data keuangan tetap 100% lokal.

## Aturan Whitelist (PENTING)

Nama key HARUS sesuai realita kode aplikasi. storageHelper memakai prefix `spj_`
otomatis — key di bawah adalah key TANPA prefix:

### Boleh dikirim via PUSH:
- data_sekolah   -> objek profil + pejabat sekolah (namaSekolah, npsn, tahunAnggaran,
                    kecamatan, daftar pejabat ada DI DALAM objek ini — profil/pejabat
                    tidak disimpan sebagai key terpisah)
- data_guru      -> daftar guru
- data_tendik    -> daftar tenaga kependidikan
- auth_user      -> HANYA { name, role } — jangan ikutkan field lain

### USULAN (TBC — tunggu konfirmasi backend sebelum diimplementasikan):
- logo_sekolah / logo_gugup / logo_dinas   (base64 — periksa limit ukuran payload server)
- notes                                    (catatan operator)
- spj_nomor_surat                          (konfigurasi format nomor surat)

### JANGAN PERNAH KIRIM:
- bku_data / transaksi / noBukti / nominal / realisasi_status / bku_lpj_checklist
- dokumen_lpj / dokumen_kelengkapan_status (file & status dokumen)
- Kredensial sensitif apa pun (password, token, key API AI)
- Key non-data konfigurasi: spj_theme, dsb.

## Kontrak API (DRAF — WAJIB disepakati dulu dengan pemilik Control Plane)

Semua request device memakai header:
- 'Content-Type': 'application/json'
- 'X-License-Code': <kode lisensi>
- 'X-Device-Fingerprint': <fingerprint>
- 'X-App-Version': versi aplikasi (import { version } dari package.json)

Base URL API: env VITE_API_BASE_URL (belum ada di .env sekarang — buatkan).
Dev default: http://localhost:4000. Produksi WAJIB HTTPS (SubtleCrypto juga butuh
secure context; tampilkan pesan bila crypto.subtle tidak tersedia).

### POST /device/sync/push
Request  : { snapshot: {<key>: <nilai>, ...}, checksum: "<sha256hex(JSON.stringify(snapshot))>", appVersion: "0.1.0" }
Respons  : { ok: true, version: <int>, updatedAt: "<ISO>" }
Arti: server menyimpan snapshot sebagai versi baru. Jika `version` server yang
diketahui device (dari respons push/pull/status terakhir, disimpan di
`spj_sync_last_version`) tidak sesuai situasi, tampilkan peringatan SEBELUM kirim:
"Data di server lebih baru (diubah dari perangkat lain). Simpan ke server akan
menimpanya. Lanjutkan?"

### GET /device/sync/pull
Respons tidak ada perubahan : { noChanges: true, version: <int>, updatedAt: "<ISO>" }
Respons ada perubahan       : { version: <int>, updatedAt: "<ISO>", updates: {<key>: <nilai>, ...} }
`updates` idealnya hanya berisi key whitelist (server memfilter); client memfilter
LAGI sebagai lapisan kedua sebelum menawarkan penerapan.

### GET /device/sync/status
Respons: { valid: true, school: "<nama sekolah>", devicesActive: <n>, devicesMax: <n>,
           expiresAt: <ISO|null>, version: <int>, updatedAt: <ISO> }
Untuk panel Status Koneksi & Riwayat.

### Kode error (UI wajib menampilkan pesan sesuai tabel)
| HTTP | Arti               | Pesan UI                                                       |
|------|--------------------|----------------------------------------------------------------|
| 401  | Lisensi invalid    | "Kode lisensi tidak valid. Periksa kembali kode Anda."         |
| 403  | Suspended          | "Lisensi Anda ditangguhkan. Hubungi administrator ASIK."       |
| 409  | Device limit penuh | "Batas perangkat tercapai. Cabut salah satu perangkat dulu."   |
| 429  | Rate limit         | "Terlalu sering. Coba lagi sebentar."                          |
| 5xx  | Error server       | "Server bermasalah. Coba lagi nanti."                          |
| net  | Offline/timeout    | "Tidak ada koneksi ke server. Cek internet Anda."              |

## Desain UI
Halaman Pengaturan (src/pages/dashboard/PengaturanPage.jsx) sudah berbentuk TAB.
Tambahkan SATU tab baru mengikuti pola tab existing — jangan membuat halaman baru:

Judul tab : "Sinkronisasi"
Deskripsi : "Sinkronisasi konfigurasi sekolah antara aplikasi ini dengan ASIK Control Plane"

Bagian-bagian (style konsisten: Tailwind + token Premium Blue aplikasi ini, bukan shadcn):
- Status Koneksi
  - Kode Lisensi: input bila belum tersimpan / tampil masked bila sudah (tombol hapus = disconnect)
  - Device Fingerprint: tampil (auto-generate crypto.randomUUID saat pertama, simpan `spj_device_fingerprint`)
  - Status chip: Terhubung / Belum Terhubung / Lisensi Tidak Valid / Ditangguhkan
- Aksi
  - [Simpan ke Server] (Push)
  - [Penyelarasan Data] (Pull)
- Riwayat
  - Terakhir disimpan (spj_sync_last_push) · Terakhir diselaraskan (spj_sync_last_pull)
  - Versi data server: <version> · <updatedAt>
Jangan tampilkan isi BKU di UI ini.

## Implementasi Teknis
Buat file baru:
- src/services/syncService.js
  Fungsi:
  - getFingerprint()      -> ambil `spj_device_fingerprint`; buat sekali (crypto.randomUUID)
                             jika belum ada; JANGAN regenerate tiap push
  - getLicenseCode() / setLicenseCode(code) / clearLicense()
  - collectSnapshot()     -> ambil HANYA key whitelist via storageHelper.get
                             (auth_user dipetakan ke { name, role } saja)
  - pushSnapshot()        -> collectSnapshot + checksum (SubtleCrypto.digest('SHA-256')) + POST push
  - pullUpdates()         -> GET pull
  - getStatus()           -> GET status
  - applyUpdates(updates) -> lihat Alur Pull (all-or-nothing)

## Alur Push
1. Cek navigator.onLine — jika offline, tampilkan pesan dan berhenti.
2. Pastikan lisensi + fingerprint ada; bila perlu panggil getStatus() (valid).
3. collectSnapshot() mengambil whitelist.
4. Pengecekan versi: jika `spj_sync_last_version` menunjukkan versi server lebih baru
   dari yang dimiliki device utk key ini, tampilkan peringatan penimpaan + konfirmasi.
5. Hitung checksum, POST push dengan { snapshot, checksum, appVersion }.
6. Toast sukses/gagal + simpan spj_sync_last_version & spj_sync_last_push dari respons.

## Alur Pull
1. Cek offline.
2. GET /device/sync/pull. Jika `noChanges` -> "Tidak ada pembaruan untuk diselaraskan".
3. Filter updates ke whitelist (lapisan kedua). Tampilkan konfirmasi:
   "Ada pembaruan konfigurasi dari ASIK Control Plane. Terapkan ke aplikasi ini?"
   (sebutkan key yang berubah).
4. Ya -> ALL-OR-NOTHING: simpan dulu nilai lama seluruh key yang akan ditimpa (buffer
   rollback); barulah tulis satu per satu via storageHelper.set. Jika ada yang gagal
   (quota/exception), ROLLBACK seluruhnya ke nilai lama. Tidak boleh setengah ter-apply.
5. Tidak -> batalkan; jangan ubah localStorage apa pun.
6. Sukses -> perbarui spj_sync_last_pull & spj_sync_last_version dari respons.

## Aturan Penting
- SELALU minta konfirmasi sebelum meng-overwrite data lokal saat PULL.
- HANYA overwrite key whitelist; JANGAN hapus key lain di localStorage.
- Error diterjemahkan lewat tabel kode error di atas.
- Fingerprint harus konsisten (jangan digenerate ulang tiap push).
- Jika user membersihkan data situs: fingerprint baru = device baru (risiko device limit).
  Tampilkan peringatan sederhana; pengelolaan device (unbind/rebind) di Control Plane
  dicatat sebagai kebutuhan roadmap lanjutan.
- Produksi: hanya HTTPS.

## Testing
- Hubungkan lisensi -> chip status berubah "Terhubung", nama sekolah tampil dari status
- Push: payload yang terkirim HANYA whitelist (cek di network tab); checksum cocok; BKU/LPJ tidak dikirim
- Push: server lebih baru -> peringatan penimpaan muncul sebelum data dikirim
- Pull: konfirmasi muncul SEBELUM apply; tidak ada perubahan tanpa persetujuan
- Pull: gagal di tengah (simulasikan quota penuh) -> data lokal tidak berubah sama sekali
- Pull: noChanges -> pesan "tidak ada pembaruan untuk diselaraskan"
- Lisensi invalid / suspended / device limit -> masing-masing menampilkan pesan sesuai tabel
- Offline: aksi ditolak dengan pesan yang jelas
- Refresh halaman: fingerprint & riwayat konsisten (tidak digenerate ulang)

Fokus hanya pada fitur ini. Jangan ubah alur login yang ada kecuali benar-benar
diperlukan. Jangan menyentuh alur BKU/LPJ yang sudah berjalan.
```

---

*Draft kontrak (bentuk respons, kode error, whitelist usulan logo/notes/nomor_surat) masih perlu
disetujui pemilik Control Plane sebelum implementasi final. Revisi terakhir: 31 Okt 2026.*
