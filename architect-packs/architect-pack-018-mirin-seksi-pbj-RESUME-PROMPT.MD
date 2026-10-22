# RESUME PROMPT — Lanjut Sprint 018 (untuk AI agent lain / sesi chat baru)

> Salin isi blok **"PROMPT"** di bawah ke sesi baru. File ini dibuat 2026-10-21 saat Sprint 018
> pack selesai disusun dan **menunggu approval user**.

---

## PROMPT (salin ke sesi baru)

```
LANJUT SPRINT 018 — repo "spj-app" di D:\project\spj-app (Windows, PowerShell 5.1, `rg` ada,
`bash` TIDAK ada).

KONTEKS STATUS (konteks baru → baca ulang, jangan percaya ringkasan chat lama):
1. Baca berurutan: `AGENTS.MD` → `STATE.MD` → `DECISIONS.MD` → `DOMAIN.MD` → `CONSTITUTION.md`
   → `RISKS.MD` → `QUESTIONS.MD` → pack `planning/sprints/sprint-018/`
   (`PRD.md` → `REQUIREMENTS.MD` → `BLUEPRINT.MD` → `ACCEPTANCE.MD` → `HANDOFF-PROMPT.MD`).
2. Yang SUDAH selesai: Idea Brief (12 keputusan user K-1…K-12) + PRD + 4 dokumen pack
   Sprint 018 + salinan `architect-packs/architect-pack-018-mirin-seksi-pbj-*`
   (PRD 328 · REQUIREMENTS 179 · BLUEPRINT 455 · ACCEPTANCE 237 · HANDOFF 132 baris;
   cross-artifact check 7/7 ✔: 20 task ↔ 20 gate, US-01…US-06 terpetakan, 0 dependency baru).
3. YANG BELUM: pack BELUM disetujui user. **Coding DILARANG** (AGENTS.MD) — belum ada
   architect approval, belum ada dry run builder.
4. PERTANYAAN YANG WAJIB DIJAWAB USER DULU (lihat PRD §10 & QUESTIONS.MD):
   - D-1: Surat Undangan & Surat Pesanan — SATU field `tanggalSurat` (asumsi A-9, disarankan)
     atau DUA field terpisah?
   - D-2: Label dokumen PBJ di panel preview — sufiks " PBJ" (disarankan) atau label apa adanya
     + aturan "LPJ menang"?
   - A-1…A-9 (9 asumsi, REQUIREMENTS §5) → WAJIB dikonfirmasi saat dry run builder (STOP-4).
5. URUTAN LANJUT:
   (a) jawab D-1 & D-2 + konfirmasi A-1…A-9 bersama user;
   (b) setelah user **menyetujui pack** → jalankan builder **DRY RUN** (isi
       `planning/sprints/sprint-018/HANDOFF-PROMPT.MD`: bootstrap command block + laporkan
       rencana per file + A-1…A-9 + jawaban D-1/D-2) → TUNGGU persetujuan → baru coding
       per BLUEPRINT T-01…T-20 (4 fase, 4 STOP, gate G-0…G-9);
   (c) setelah selesai → `/acceptance-runner` (WAJIB konteks segar) → `/state-keeper`.
6. ATURAN KERAS pack (ringkas): `utils/bkuParser.js` · `components/templates/SummaryCard.jsx` ·
   `pages/dashboard/DokumenSPJPage.jsx` · `pages/dashboard/DokumenKelengkapanPage.jsx` = 0 DIFF.
   Izin khusus: `data/templateConfig.js` HANYA blok `daftar_hadir` (kolom NIP) dan
   `utils/previewDocs.js` HANYA `buildPreviewDocs`/`maminDocs`. 0 dependency baru
   (`package.json`/`package-lock.json` 0 diff). Blue-only `#004ac6` + slate. A4/`mm`.
   DILARANG: `git stash` / `git reset --hard` / `git clean -fd` / `npm ci`.
7. STATE REPO SAAT INI: branch `main` @ `c149a28` (**ahead 1, BELUM di-push** ke origin/main —
   push = kuasa user). Working tree: 4 file dimodifikasi belum di-commit
   (`STATE.MD` +26 · `DECISIONS.MD` +24 · `QUESTIONS.MD` +41 · `RISKS.MD` +12) + untracked
   `planning/sprints/sprint-018/` (5 file) + `architect-packs/architect-pack-018-*` (4 file).
   JANGAN commit/push tanpa izin user. JANGAN `git checkout --` file yang sudah diedit manual
   (peristiwa 2026-10-21: `STATE.MD` sempat tertuang 0 byte lalu dipulihkan `git checkout --`).
8. EMPAT TEMUAN KODE (bukti 2026-10-21, jangan dipusulkan):
   (a) `tanggalDanaMasuk` TIDAK tercetak di template mana pun (grep src = 9 hit, 0 di
       templateConfig/blocks) → hanya gate → gate sidebar wajib fungsi baru (`readinessSidebar`);
   (b) sidebar sudah punya `allTransactions` + `onNavigate` (`BKUSidebar.jsx:60`) → "berpindah
       baris" tanpa state baru;
   (c) preview Mamin (`maminDocs()`) & area cetak Mamin (`MaminPreview.jsx:198-253`) = DUA
       builder terpisah → nilai otomatis wajib di lapisan `formData` (AD-4);
   (d) `readinessCheck` dipakai halaman LPJ → jangan diubah.
9. SISA PEKERJAAN SPRINT 017 (tertutup, tapi belum tuntas — jangan dianggap "lulus"):
   push `c149a28` · uji browser manual (`planning/sprints/sprint-017/ACCEPTANCE.MD` §7 butir 1–8,
   butuh data BKU nyata) · butir 9 (penilaian tampilan oleh user) · butir 10 (keputusan hapus tab
   "Detail" untuk semua baris) · D-5 (gate mamin) · D-6 (menu Dokumen LPJ) · flag basi
   `docs/ARCHITECTURE.MD:268` · antrean `/acceptance-runner` Sprint 005 (task 12), 007 (task 18),
   008 (task 28).
10. CATATAN SCOPE (AD-0): Sprint 018 berisi 3 permintaan (dropdown · 6 seksi · PBJ). Kalau user
    mau dipecah, urutan aman: dropdown+merge otomatis → PBJ per baris → revisi 6 seksi.

Mulai dari: membaca pack, lalu tanya D-1 & D-2 + A-1…A-9 ke user, lalu (setelah approval)
dry run builder sesuai HANDOFF-PROMPT.MD. Jangan menulis kode sebelum approval.
```

---

## RINGKASAN SATU PARAGRAF (kalau mau versi sangat singkat)

> Sprint 018 di `D:\project\spj-app`: pack (PRD + REQUIREMENTS + BLUEPRINT + ACCEPTANCE +
> HANDOFF-PROMPT) sudah lengkap di `planning/sprints/sprint-018/` dan menunggu **approval**.
> Decode user: **Lanjut Sprint 018 — pack menunggu approval.** Baca `AGENTS.MD` → `STATE.MD` →
> `QUESTIONS.MD` → pack. Tanyakan **D-1** (satu/tanggal `tanggalSurat`) dan **D-2** (suffix
> " PBJ" pada label) + konfirmasi **A-1…A-9**; setelah disetujui → dry run builder
> (`HANDOFF-PROMPT.MD`) → tunggu persetujuan → coding T-01…T-20 → `/acceptance-runner` fresh.
> Repo: `main` @ `c149a28` (ahead 1, belum push) + 4 file docs uncommitted + pack untracked.
> Larangan: `bkuParser.js`/`SummaryCard.jsx`/`DokumenSPJPage.jsx`/`DokumenKelengkapanPage.jsx`
> 0 diff; `templateConfig.js` hanya blok `daftar_hadir`; `previewDocs.js` hanya
> `buildPreviewDocs`/`maminDocs`; 0 dependency; jangan `git stash`/`reset --hard`/`clean -fd`.

---

## CHECKLIST "SIAP LANJUT?" (untuk sesi baru)

- [ ] `planning/sprints/sprint-018/` ada 5 file (PRD · REQUIREMENTS · BLUEPRINT · ACCEPTANCE · HANDOFF-PROMPT)
- [ ] `architect-packs/architect-pack-018-mirin-seksi-pbj-*` ada 4 file
- [ ] `STATE.MD` memuat entri "Sprint 018 … PACK DRAFT" + baris tabel `| 018 |`
- [ ] `QUESTIONS.MD` memuat blok "Sprint 018 … (D-1…D-2, BLOCKING approval)"
- [ ] `DECISIONS.MD` memuat 3 entri ADR Sprint 018 (scope · tanggal dana masuk · NIP Daftar Hadir)
- [ ] `git status` → 4 modified + `planning/sprints/sprint-018/` + `architect-packs/architect-pack-018-*` untracked
- [ ] `git log -1` → `c149a28` (main, ahead 1)
