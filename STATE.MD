# STATE.MD — Status Proyek

## Informasi Proyek
- Nama: spj-app (Aplikasi LPJ BOS/BOSP)
- Mulai (titik adopsi workflow): 2026-09-13

## Status Saat Ini
- Sprint Aktif: Sprint 000 — ONBOARDING (titik adopsi workflow)
- Status: Baseline keamanan SELESAI (ritel 6) — docs/SECURITY-AUDIT-001.md:
  FINDINGS (2 TINGGI terjadwal RISKS.MD, 0 KRITIS, verdict tidak memblok — baseline).
  Onboarding Jalur A tuntas; menunggu commit hasil audit.
- Terakhir Diperbarui: 2026-09-13

## Riwayat Sprint
| Sprint | Nama | Status | Tanggal |
|--------|------|--------|---------|
| 000 | ONBOARDING — titik adopsi workflow, commit hash 9cdcd10 | 🔄 Berjalan | 2026-09-13 |

## Langkah Selanjutnya (Jalur A 27.8.2)
- Commit & push hasil baseline audit (SECURITY-AUDIT-001 + RISKS + STATE)
- Verifikasi test cetak 13 template (lihat RISKS.MD)
- Setelah itu: /idea-clarifier → problem brief untuk fitur berikutnya
- REWORK keamanan bertahap → lihat docs/SECURITY-AUDIT-001.md §8 (sprint berikutnya)

## Blockers
- (tidak ada)

## Catatan Penting
- File agent lama `docs/AGENT.md` (2026-07-30) dipindah 2026-09-13: router → `AGENTS.MD`
  (root), domain → `DOMAIN.MD`, keputusan → `DECISIONS.MD`. Kini HANYA ADA SATU
  file agent: `AGENTS.MD`.
- Spesifikasi teknis monolit `docs/STANDAR-TEKNIS.md` (2026-09-13) diekstrak 2026-09-13
  ke 5 dokumen standar Bab 6.1: `docs/ARCHITECTURE.MD`, `docs/DATA-MODEL.MD`,
  `docs/API.MD`, `docs/PERMISSIONS.MD`, `docs/VALIDATION.MD` — file monolit dihapus.
- Status legacy per docs/AGENT.md (2026-07-30): ~95% fitur selesai — klaim tidak
  diverifikasi ulang; detail progres → `docs/PROGRESS.md` (single source of truth status)
- Titik adopsi: commit `9cdcd10` (2026-08-21, "fix ai response") — commit terakhir
  SEBELUM adopsi. Hasil adopsi ter-commit di `8544246` (scaffold + konstitusi) dan
  `6ed57d6` (pekerjaan fitur legacy yang tertunda), keduanya sudah di-push ke main.
- Kode existing TIDAK dipindah/diubah saat adopsi (aturan emas adopsi 27.8)
- Workflow berlaku MAJU: semua kerja baru ikuti pipeline penuh; TIDAK ADA sprint fitur
  sebelum baseline keamanan selesai (27.8.2)
