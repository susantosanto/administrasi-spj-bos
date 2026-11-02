# VERIFICATION-REPORT — Sprint 001: Fondasi Data Sekolah & Pejabat

> Dijalankan `/acceptance-runner` **2026-09-30, konteks segar** (sesi ini BUKAN sesi
> pembuat kode — sesi planning terpisah). Semua perintah kanonik disalin verbatim dari
> `ACCEPTANCE.MD` (pelajaran grep ad-hoc). Metode: Bab 12 Writer/Reviewer +
> `verification-before-completion` — bukti segar, bukan klaim builder.
> **Keputusan user 2026-09-30: sprint DITUTUP dengan risiko "UI runtime belum terbukti"
> DITERIMA eksplisit** (memilih lanjut sprint-planner Sprint 003).

| # | Kriteria | Perintah (ringkas) | Hasil | Bukti segar (output asli sesi ini) |
|---|----------|--------------------|-------|-------------------------------------|
| 1 | T-01 Build sukses | `cd spj-frontend && npm run build` | **PASS** | `v24.19.0` · `✓ built in 8.09s` · `BUILD_EXIT=0` · warning chunk >500 kB pre-existing, bukan regresi |
| 2 | T-02 Nol hardcode 15 pola (`-i`) | grep verbatim ACCEPTANCE.MD | **PASS** | output kosong · `T02_EXIT=1` (grep tak menemukan apa pun) |
| 3 | T-02 aset tak terjaring | `… \| grep -i sourceFile \| wc -l` | **PASS** | `0` |
| 4 | T-13 `package.json` pin eksak | grep caret + node compare lockfile | **PASS** | `T13_EXIT=1` (0 caret) · `MATCH=14/14` · `git status package-lock.json` kosong |
| 5 | T-12 Auto-fill TTD spt/sppd/undangan | grep jalur `sig[...]` | **PASS (statik)** | 14 jalur: `sig['kepala-sekolah']` (1658-59, 1678-79), `sig['ketua-gugus']` (1660-61, 1680-81, 1737-38), `sig['pimpinan']`/`sig['notulen']` (1716-19) — prioritas `formData \|\| sig \|\| ''` |
| 6 | T-15 Guard notulen/pimpinan | grep fallback `defaultName` | **PASS (statik)** | 0 hit (`S15_FALLBACK_EXIT=1`); `SignatureFooter` 8 titik `\|\| roleConfig.nama/nip` |
| 7 | T-05/T-06 Banner 2 varian + tautan + print:hidden | grep `PeringatanData.jsx` | **PASS (statik)** | teks varian-1 persis, tautan Data Sekolah + Pejabat Sekolah, `print:hidden` (baris 22), `role="alert"`, baca `getPejabatStatus()` saat render |
| 8 | Pemasangan banner 5.2/5.3 | grep `PeringatanData` | **PASS (statik)** | `TemplateEngine.jsx:82` (edit-mode) + `DokumenFormPreview.jsx:1790` (transport) |
| 9 | T-10 Blue-only 2 halaman | grep 5 warna | **PASS** | 2 hit = substring kata "Memproses" (bukan kelas warna); 0 kelas terlarang |
| 10 | T-09 KopGugus tanpa storage | grep storageHelper/localStorage | **PASS (statik)** | 1 hit baris 7 = komentar JSDoc keputusan F-4, bukan pemanggilan |
| 11 | T-08 Kop sekolah + logo | baca `KopSurat.jsx` | **PASS (statik)** | `storageHelper.get('logo_sekolah'/'logo_dinas')` (prefix `spj_` di helper), `<img>` kiri/kanan atas, baca saat render; baris pemerintah/dinas dari Data Sekolah |
| 12 | T-14 SKHonorer prop-driven | grep `namaPihakKesatu` | **PASS (statik)** | `data.namaPihakKesatu \|\| ks.nama` (baris 144, 232); T-02 menjamin 0 literal Pasirhalang |
| 13 | T-03 Email via allFields | grep `findFieldByLabel` | **PASS (statik)** | resolver ada di `sekolahData.js:28` |
| 14 | T-04/T-07/T-11 Data layer & regresi runtime | render UI 2 kondisi | **UNTESTED** | butuh browser interaktif; tool screenshot tidak connect di sesi ini |
| 15 | T-03/T-05/T-06/T-08/T-11/T-14/T-15 UI runtime (screenshot/print) | screenshot print preview | **UNTESTED** | idem — tool browser tidak tersedia (`failed to connect to running Pencil app`) |

## GAPS (correctness only)

- **UI runtime belum pernah terbukti** (render browser, screenshot print preview,
  uji localStorage interaktif) — kriteria #14–15. **Statik + build + gate grep
  seluruhnya PASS segar 2026-09-30.** Keputusan user: risiko DITERIMA, sprint ditutup.
  Mitigasi berjalan: feedback `fix-template-document.md` (uji manual user) TIDAK
  menemukan cacat pada lingkup Sprint 001 (temuannya di lapisan preview — jadi
  lingkup Sprint 003).

## Verdict: **APPROVED** (dengan 1 risiko diterima eksplisit oleh user)

Statik: 13/13 PASS segar · runtime UI: UNTESTED (diterima user 2026-09-30).
Bukti sebagian di `planning/sprints/sprint-002/verify/` (pra-ada, 2026-09-19 —
bukan bukti sesi ini).
