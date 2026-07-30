#!/usr/bin/env python3
"""
DOKUMEN PENGAJUAN FITUR: AI Generate Foto Dokumentasi LPJ
Format: Dokumen Resmi Formal untuk Stakeholder / Project Manager
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    HRFlowable, KeepTogether, Image
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

# ─── Color Palette (Formal) ───
C_PRIMARY   = HexColor("#1a237e")
C_SECONDARY = HexColor("#283593")
C_ACCENT    = HexColor("#3949ab")
C_GOLD      = HexColor("#f9a825")
C_GREEN     = HexColor("#2e7d32")
C_RED       = HexColor("#c62828")
C_PURPLE    = HexColor("#4a148c")
C_TEAL      = HexColor("#00695c")
C_ORANGE    = HexColor("#e65100")
C_DARK      = HexColor("#212121")
C_GRAY      = HexColor("#424242")
C_LIGHT_GRAY = HexColor("#f5f5f5")
C_LIGHT_BG  = HexColor("#e8eaf6")
C_LIGHT_GREEN = HexColor("#e8f5e9")
C_LIGHT_GOLD = HexColor("#fff8e1")
C_LIGHT_RED = HexColor("#ffebee")
C_WHITE     = white
C_BLACK     = black

OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "DOKUMEN_PENGAJUAN_GENERATE_FOTO.pdf")

# ─── Font Registration ───
def try_register_fonts():
    fonts = {"regular": "Helvetica", "bold": "Helvetica-Bold",
             "italic": "Helvetica-Oblique", "bolditalic": "Helvetica-BoldOblique"}
    arial_path = "C:\\Windows\\Fonts\\arial.ttf"
    arialbd_path = "C:\\Windows\\Fonts\\arialbd.ttf"
    ariali_path = "C:\\Windows\\Fonts\\ariali.ttf"
    arialbi_path = "C:\\Windows\\Fonts\\arialbi.ttf"
    if os.path.exists(arial_path):
        try:
            pdfmetrics.registerFont(TTFont("Arial", arial_path))
            pdfmetrics.registerFont(TTFont("Arial-Bold", arialbd_path))
            pdfmetrics.registerFont(TTFont("Arial-Italic", ariali_path))
            pdfmetrics.registerFont(TTFont("Arial-BoldItalic", arialbi_path))
            fonts = {"regular": "Arial", "bold": "Arial-Bold",
                     "italic": "Arial-Italic", "bolditalic": "Arial-BoldItalic"}
        except:
            pass
    return fonts

F = try_register_fonts()

# ─── Styles ───
styles = getSampleStyleSheet()

sTitle = ParagraphStyle("DocTitle", fontName=F["bold"], fontSize=16, leading=22,
                        textColor=C_PRIMARY, alignment=TA_CENTER, spaceAfter=2*mm)
sSubtitle = ParagraphStyle("DocSubtitle", fontName=F["regular"], fontSize=11, leading=15,
                           textColor=C_GRAY, alignment=TA_CENTER, spaceAfter=1*mm)
sSection = ParagraphStyle("Section", fontName=F["bold"], fontSize=13, leading=17,
                          textColor=C_PRIMARY, spaceBefore=8*mm, spaceAfter=4*mm)
sSubSection = ParagraphStyle("SubSection", fontName=F["bold"], fontSize=11, leading=15,
                             textColor=C_SECONDARY, spaceBefore=5*mm, spaceAfter=3*mm)
sSubSubSection = ParagraphStyle("SubSubSection", fontName=F["bold"], fontSize=10, leading=14,
                                textColor=C_ACCENT, spaceBefore=3*mm, spaceAfter=2*mm)
sBody = ParagraphStyle("Body", fontName=F["regular"], fontSize=10, leading=15,
                       textColor=C_DARK, alignment=TA_JUSTIFY, spaceAfter=3*mm)
sBodyIndent = ParagraphStyle("BodyIndent", fontName=F["regular"], fontSize=10, leading=15,
                             textColor=C_DARK, alignment=TA_JUSTIFY, leftIndent=8*mm, spaceAfter=2*mm)
sBullet = ParagraphStyle("Bullet", fontName=F["regular"], fontSize=10, leading=15,
                         textColor=C_DARK, leftIndent=10*mm, spaceAfter=2*mm)
sNumber = ParagraphStyle("Number", fontName=F["regular"], fontSize=10, leading=15,
                         textColor=C_DARK, leftIndent=10*mm, spaceAfter=2*mm)
sTableHeader = ParagraphStyle("TH", fontName=F["bold"], fontSize=9, leading=12,
                              textColor=white, alignment=TA_CENTER)
sTableCell = ParagraphStyle("TC", fontName=F["regular"], fontSize=9, leading=12,
                            textColor=C_DARK, alignment=TA_CENTER)
sTableCellLeft = ParagraphStyle("TCL", fontName=F["regular"], fontSize=9, leading=12,
                                textColor=C_DARK, alignment=TA_LEFT)
sTableCellBold = ParagraphStyle("TCB", fontName=F["bold"], fontSize=9, leading=12,
                                textColor=C_DARK, alignment=TA_CENTER)
sFooter = ParagraphStyle("Footer", fontName=F["italic"], fontSize=8, leading=10,
                         textColor=HexColor("#9e9e9e"), alignment=TA_CENTER)
sSmall = ParagraphStyle("Small", fontName=F["regular"], fontSize=8, leading=10,
                        textColor=HexColor("#757575"), spaceAfter=1*mm)
sSignature = ParagraphStyle("Signature", fontName=F["regular"], fontSize=10, leading=15,
                            textColor=C_DARK, alignment=TA_CENTER, spaceAfter=2*mm)

# ─── Helpers ───
def spacer(h=3):
    return Spacer(1, h*mm)

def hr():
    return HRFlowable(width="100%", thickness=0.5, color=HexColor("#e0e0e0"),
                       spaceBefore=3*mm, spaceAfter=3*mm)

def thick_hr(color=C_PRIMARY):
    return HRFlowable(width="100%", thickness=2, color=color,
                       spaceBefore=2*mm, spaceAfter=2*mm)

def make_table(headers, rows, col_widths=None, header_bg=C_PRIMARY):
    data = [[Paragraph(h, sTableHeader) for h in headers]]
    for row in rows:
        data.append([Paragraph(str(c), sTableCell) for c in row])
    if col_widths is None:
        col_widths = [170*mm / len(headers)] * len(headers)
    t = Table(data, colWidths=col_widths, repeatRows=1)
    style = [
        ('BACKGROUND', (0, 0), (-1, 0), header_bg),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor("#bdbdbd")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, C_LIGHT_GRAY]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]
    t.setStyle(TableStyle(style))
    return t

def info_box(title, content_lines, bg_color=C_LIGHT_BG, border_color=C_PRIMARY):
    data = [[Paragraph(f"<b>{title}</b>",
             ParagraphStyle("ibt", fontName=F["bold"], fontSize=10, leading=14, textColor=border_color))]]
    for line in content_lines:
        data.append([Paragraph(line, sBody)])
    t = Table(data, colWidths=[170*mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), bg_color),
        ('BACKGROUND', (0, 1), (-1, -1), bg_color),
        ('BOX', (0, 0), (-1, -1), 1, border_color),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    return t

def bullet(text, bold_prefix=None):
    if bold_prefix:
        return Paragraph(f"• <b>{bold_prefix}</b> {text}", sBullet)
    return Paragraph(f"• {text}", sBullet)

def number_item(num, text, bold_prefix=None):
    if bold_prefix:
        return Paragraph(f"<b>{num}.</b> <b>{bold_prefix}</b> {text}", sNumber)
    return Paragraph(f"<b>{num}.</b> {text}", sNumber)

def section_divider(title, color=C_PRIMARY):
    return Table(
        [[Paragraph(title, ParagraphStyle("sd", fontName=F["bold"], fontSize=12,
                    leading=16, textColor=white))]],
        colWidths=[170*mm],
        style=TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), color),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ])
    )

# ─── Page Template ───
def header_footer(canvas_obj, doc):
    canvas_obj.saveState()
    # Header line
    canvas_obj.setStrokeColor(C_PRIMARY)
    canvas_obj.setLineWidth(0.5)
    canvas_obj.line(20*mm, A4[1] - 15*mm, A4[0] - 20*mm, A4[1] - 15*mm)
    canvas_obj.setFont(F["italic"], 7)
    canvas_obj.setFillColor(HexColor("#9e9e9e"))
    canvas_obj.drawString(20*mm, A4[1] - 13*mm,
                          "Dokumen Pengajuan Fitur AI Generate Foto Dokumentasi LPJ")
    canvas_obj.drawRightString(A4[0] - 20*mm, A4[1] - 13*mm,
                               "SPJ App | SD Negeri Pasirhalang")
    # Footer
    canvas_obj.setStrokeColor(HexColor("#e0e0e0"))
    canvas_obj.line(20*mm, 15*mm, A4[0] - 20*mm, 15*mm)
    canvas_obj.setFont(F["italic"], 8)
    canvas_obj.setFillColor(HexColor("#9e9e9e"))
    canvas_obj.drawCentredString(A4[0]/2, 10*mm, f"Halaman {doc.page}")
    canvas_obj.restoreState()

# ─── Build PDF ───
def build_pdf():
    doc = SimpleDocTemplate(
        OUTPUT_PATH, pagesize=A4,
        leftMargin=25*mm, rightMargin=25*mm,
        topMargin=22*mm, bottomMargin=22*mm,
    )
    story = []
    W = A4[0] - 50*mm

    # ════════════════════════════════════════════════════════════
    # HALAMAN JUDUL (COVER)
    # ════════════════════════════════════════════════════════════
    story.append(Spacer(1, 30*mm))
    story.append(thick_hr(C_PRIMARY))
    story.append(spacer(8))

    story.append(Paragraph(
        "DOKUMEN PENGAJUAN FITUR",
        ParagraphStyle("cj1", fontName=F["bold"], fontSize=20, leading=26,
                      textColor=C_PRIMARY, alignment=TA_CENTER, spaceAfter=4*mm)
    ))
    story.append(Paragraph(
        "AI GENERATE FOTO DOKUMENTASI LPJ",
        ParagraphStyle("cj2", fontName=F["bold"], fontSize=16, leading=22,
                      textColor=C_SECONDARY, alignment=TA_CENTER, spaceAfter=6*mm)
    ))
    story.append(Paragraph(
        "Aplikasi SPJ (Surat Pertanggungjawaban) Sekolah",
        ParagraphStyle("cj3", fontName=F["regular"], fontSize=12, leading=16,
                      textColor=C_GRAY, alignment=TA_CENTER, spaceAfter=8*mm)
    ))

    story.append(HRFlowable(width="50%", thickness=1, color=C_GOLD,
                             spaceBefore=3*mm, spaceAfter=8*mm))

    # Info box on cover
    cover_info = [
        ["Jenis Dokumen", ": Pengajuan Fitur Baru / New Feature Proposal"],
        ["Fitur", ": AI Generate Foto Dokumentasi LPJ"],
        ["Aplikasi", ": SPJ App (Surat Pertanggungjawaban)"],
        ["Sasaran", ": 200+ Sekolah Dasar Negeri"],
        ["Periode", ": Tahun Anggaran 2026/2027"],
        ["Tanggal", ": 26 Juli 2026"],
        ["Diajukan Oleh", ": Tim Pengembang SPJ App"],
        ["Untuk", ": Stakeholder / Project Manager"],
    ]
    ci_data = []
    for label, value in cover_info:
        ci_data.append([
            Paragraph(label, ParagraphStyle("cil", fontName=F["bold"], fontSize=10,
                      leading=15, textColor=C_PRIMARY, alignment=TA_LEFT)),
            Paragraph(value, ParagraphStyle("civ", fontName=F["regular"], fontSize=10,
                      leading=15, textColor=C_DARK, alignment=TA_LEFT)),
        ])
    ci_table = Table(ci_data, colWidths=[50*mm, 120*mm])
    ci_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LINEBELOW', (0, 0), (-1, -1), 0.3, HexColor("#e0e0e0")),
    ]))
    story.append(ci_table)

    story.append(spacer(15))
    story.append(thick_hr(C_PRIMARY))
    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════
    # DAFTAR ISI
    # ════════════════════════════════════════════════════════════
    story.append(section_divider("DAFTAR ISI"))
    story.append(spacer(3))

    toc_items = [
        ("BAB I", "PENDAHULUAN", [
            "1.1 Latar Belakang",
            "1.2 Identifikasi Masalah",
            "1.3 Tujuan Pengajuan",
            "1.4 Manfaat",
        ]),
        ("BAB II", "GAMBARAN UMUM FITUR", [
            "2.1 Nama dan Definisi Fitur",
            "2.2 Konsep Kerja",
            "2.3 Spesifikasi Teknis Singkat",
        ]),
        ("BAB III", "WORKFLOW DETAIL", [
            "3.1 Fase 1: Setup Data Sekolah",
            "3.2 Fase 2: Generate Foto Dokumentasi",
            "3.3 Fase 3: Output dan Download",
            "3.4 Diagram Alur Lengkap",
        ]),
        ("BAB IV", "ESTIMASI ANGGARAN", [
            "4.1 Rincian Biaya",
            "4.2 Skema Biaya Berbagai Skala",
            "4.3 Perbandingan Biaya: Manual vs AI",
            "4.4 Analisis Efisiensi Biaya",
        ]),
        ("BAB V", "ANALISIS KEBUTUHAN SUMBER DAYA", [
            "5.1 Sumber Daya Perangkat Keras",
            "5.2 Sumber Daya Perangkat Lunak",
            "5.3 Sumber Daya Manusia",
        ]),
        ("BAB VI", "JADWAL IMPLEMENTASI", [
            "6.1 Tahapan Implementasi",
            "6.2 Timeline Pengerjaan",
        ]),
        ("BAB VII", "PENUTUP", [
            "7.1 Kesimpulan",
            "7.2 Rekomendasi",
        ]),
    ]

    for bab, title, items in toc_items:
        toc_data = [
            [Paragraph(f"<b>{bab}</b>", ParagraphStyle("tocbab", fontName=F["bold"],
                        fontSize=11, leading=16, textColor=C_PRIMARY)),
             Paragraph(f"<b>{title}</b>", ParagraphStyle("toctit", fontName=F["bold"],
                        fontSize=11, leading=16, textColor=C_DARK))]
        ]
        for item in items:
            toc_data.append([
                Paragraph("", ParagraphStyle("tocsp", fontSize=6, leading=8)),
                Paragraph(item, ParagraphStyle("tocitem", fontName=F["regular"],
                          fontSize=10, leading=14, textColor=C_GRAY, leftIndent=5*mm))
            ])
        toc_table = Table(toc_data, colWidths=[30*mm, 140*mm])
        toc_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 2),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
            ('LINEBELOW', (0, -1), (-1, -1), 0.3, HexColor("#e0e0e0")),
        ]))
        story.append(toc_table)
        story.append(spacer(1))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════
    # BAB I: PENDAHULUAN
    # ════════════════════════════════════════════════════════════
    story.append(section_divider("BAB I: PENDAHULUAN"))
    story.append(spacer(3))

    story.append(Paragraph("1.1 Latar Belakang", sSubSection))
    story.append(Paragraph(
        "Aplikasi SPJ (Surat Pertanggungjawaban) merupakan sistem yang digunakan oleh sekolah-sekolah "
        "di lingkungan Dinas Pendidikan untuk menyusun laporan pertanggungjawaban penggunaan dana BOS "
        "(Bantuan Operasional Sekolah). Salah satu komponen penting dalam penyusunan LPJ adalah "
        "dokumentasi foto kegiatan yang menjadi bukti fisik pelaksanaan kegiatan.", sBody))
    story.append(Paragraph(
        "Berdasarkan observasi dan pengalaman operasional di lapangan, ditemukan bahwa proses "
        "dokumentasi foto untuk LPJ masih menghadapi berbagai kendala signifikan, antara lain:", sBody))

    problems = [
        "Operator sekolah sering lupa atau tidak sempat mendokumentasikan kegiatan dengan foto",
        "Kualitas foto dari kamera ponsel seringkali kurang memadai untuk dokumen resmi LPJ",
        "Kondisi cuaca buruk menghambat dokumentasi kegiatan outdoor",
        "Ketidakhadiran personel tertentu menyulitkan pembuatan foto bersama",
        "Waktu yang dibutuhkan untuk satu kegiatan dokumentasi mencapai 30-60 menit",
    ]
    for p in problems:
        story.append(bullet(p))

    story.append(spacer(2))
    story.append(Paragraph(
        "Oleh karena itu, diperlukan sebuah solusi teknologi yang dapat mengatasi permasalahan tersebut "
        "secara efektif dan efisien. Pengajuan fitur AI Generate Foto Dokumentasi LPJ ini hadir sebagai "
        "jawaban atas kebutuhan tersebut.", sBody))

    story.append(spacer(2))
    story.append(Paragraph("1.2 Identifikasi Masalah", sSubSection))

    story.append(make_table(
        ["No", "Masalah", "Dampak", "Tingkat Urgensi"],
        [
            ["1", "Lupa/tidak sempat foto kegiatan", "LPJ tidak lengkap, kena teguran", "Tinggi"],
            ["2", "Kualitas foto HP kurang layak", "Dokumen tidak profesional", "Sedang"],
            ["3", "Cuaca buruk saat dokumentasi", "Kegiatan tidak terdokumentasi", "Tinggi"],
            ["4", "Personel tidak hadir", "Tidak ada foto bersama", "Sedang"],
            ["5", "Waktu pengerjaan lama", "Produktivitas operator rendah", "Sedang"],
        ],
        [10*mm, 60*mm, 55*mm, 45*mm]
    ))

    story.append(spacer(2))
    story.append(Paragraph("1.3 Tujuan Pengajuan", sSubSection))
    story.append(Paragraph(
        "Dokumen ini diajukan dengan tujuan sebagai berikut:", sBody))
    goals = [
        "Mengajukan persetujuan pengembangan fitur AI Generate Foto Dokumentasi pada aplikasi SPJ",
        "Memberikan gambaran lengkap mengenai workflow dan mekanisme kerja fitur",
        "Menyajikan estimasi anggaran yang transparan dan terperinci",
        "Menunjukkan analisis perbandingan biaya antara metode manual dengan solusi AI",
        "Mendapatkan persetujuan stakeholder untuk implementasi fitur",
    ]
    for g in goals:
        story.append(bullet(g))

    story.append(spacer(2))
    story.append(Paragraph("1.4 Manfaat", sSubSection))
    story.append(Paragraph(
        "Implementasi fitur ini diharapkan memberikan manfaat sebagai berikut:", sBody))

    story.append(make_table(
        ["No", "Manfaat", "Keterangan"],
        [
            ["1", "Efisiensi Waktu", "Dari 30-60 menit menjadi 2-5 menit per kegiatan (hemat ~90%)"],
            ["2", "Efisiensi Biaya", "Dari Rp 800.000 menjadi Rp 36.000 per sekolah per tahun (hemat ~95%)"],
            ["3", "Kualitas Dokumentasi", "Foto studio quality, konsisten, dan profesional"],
            ["4", "Mitigasi Risiko", "Mengatasi kendala cuaca, lupa foto, dan ketidakhadiran"],
            ["5", "Kemudahan Operasional", "Tidak perlu keahlian desain atau fotografi"],
            ["6", "Produktivitas", "1.400 jam kerja operator per bulan dapat dialihkan ke tugas lain"],
        ],
        [10*mm, 45*mm, 115*mm]
    ))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════
    # BAB II: GAMBARAN UMUM FITUR
    # ════════════════════════════════════════════════════════════
    story.append(section_divider("BAB II: GAMBARAN UMUM FITUR"))
    story.append(spacer(3))

    story.append(Paragraph("2.1 Nama dan Definisi Fitur", sSubSection))
    story.append(Paragraph(
        "<b>Nama Fitur:</b> AI Generate Foto Dokumentasi LPJ", sBody))
    story.append(Paragraph(
        "<b>Definisi:</b> Fitur yang memanfaatkan teknologi kecerdasan buatan (AI) untuk menghasilkan "
        "foto dokumentasi kegiatan sekolah secara otomatis. Cukup dengan mengunggah foto selfie personel "
        "sebanyak satu kali, sistem dapat menghasilkan foto dokumentasi realistis dengan wajah asli "
        "personel yang tertanam secara natural di berbagai scene kegiatan.", sBody))

    story.append(spacer(2))
    story.append(Paragraph("2.2 Konsep Kerja", sSubSection))
    story.append(Paragraph(
        "Fitur ini bekerja dengan konsep <b>Text-to-Image Generation</b> yang dikombinasikan dengan "
        "teknik <b>LoRA (Low-Rank Adaptation)</b> untuk personalisasi wajah. Secara sederhana, "
        "alur kerja fitur ini adalah:", sBody))

    concepts = [
        "<b>Upload 1x:</b> Operator mengunggah foto selfie personel sekolah (guru, kepala sekolah, pengawas) cukup satu kali",
        "<b>Training AI:</b> Sistem melatih model AI untuk mengenali wajah-wajah tersebut (proses background, gratis)",
        "<b>Pilih & Generate:</b> Setiap kali membutuhkan foto dokumentasi, operator cukup memilih jenis kegiatan, pakaian, suasana, dan personel yang hadir",
        "<b>Hasil Siap Pakai:</b> AI menghasilkan foto dokumentasi realistis dalam 5-15 detik, siap diunduh dan dicetak",
    ]
    for c in concepts:
        story.append(bullet(c))

    story.append(spacer(2))
    story.append(Paragraph("2.3 Spesifikasi Teknis Singkat", sSubSection))

    story.append(make_table(
        ["Komponen", "Spesifikasi", "Keterangan"],
        [
            ["Model AI", "Flux Pro (2026)", "Model text-to-image terbaik"],
            ["Teknik Personalisasi", "LoRA (Low-Rank Adaptation)", "Training wajah gratis, self-host"],
            ["Infrastruktur", "VPS GPU (RTX 3090)", "Sewa, bukan beli"],
            ["Waktu Generate", "5-15 detik per foto", "Termasuk rendering wajah"],
            ["Kualitas Output", "1024x1024 px (minimum)", "Studio quality"],
            ["Format Output", "JPG / PNG", "Siap cetak A4"],
            ["Platform", "Web App (Next.js)", "Hosting di Vercel (gratis)"],
            ["Database", "SQLite / IndexedDB", "Ringan, tidak perlu server DB"],
        ],
        [45*mm, 55*mm, 70*mm]
    ))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════
    # BAB III: WORKFLOW DETAIL
    # ════════════════════════════════════════════════════════════
    story.append(section_divider("BAB III: WORKFLOW DETAIL"))
    story.append(spacer(3))

    story.append(Paragraph(
        "Fitur AI Generate Foto Dokumentasi LPJ terdiri dari 3 (tiga) fase utama yang saling "
        "berkesinambungan. Berikut adalah penjelasan detail masing-masing fase:", sBody))

    # ─── FASE 1 ───
    story.append(spacer(2))
    story.append(Paragraph("3.1 Fase 1: Setup Data Sekolah", sSubSection))
    story.append(Paragraph(
        "Fase ini merupakan tahap persiapan awal yang hanya dilakukan <b>satu kali</b> untuk selamanya. "
        "Pada fase ini, operator menyiapkan data personel dan referensi visual yang akan digunakan "
        "oleh AI untuk menghasilkan foto dokumentasi.", sBody))

    story.append(spacer(1))
    story.append(Paragraph("3.1.1 Upload Foto Personel", sSubSubSection))
    story.append(Paragraph(
        "Operator mengunggah foto personel sekolah yang akan muncul di foto dokumentasi. "
        "Foto yang perlu diunggah meliputi:", sBody))

    story.append(make_table(
        ["No", "Jenis Personel", "Jumlah Foto", "Keterangan"],
        [
            ["1", "Guru dan Tenaga Kependidikan", "1-3 foto", "Foto formal atau selfie"],
            ["2", "Kepala Sekolah", "1-2 foto", "Foto resmi berjas/formal"],
            ["3", "Pengawas (opsional)", "1 foto", "Tidak wajib"],
        ],
        [10*mm, 55*mm, 35*mm, 70*mm]
    ))

    story.append(spacer(1))
    story.append(Paragraph("3.1.2 Upload Foto Referensi (Opsional)", sSubSubSection))
    story.append(Paragraph(
        "Operator juga dapat mengunggah foto referensi untuk membantu AI menghasilkan background "
        "yang lebih mirip dengan kondisi sekolah asli:", sBody))

    ref_items = [
        "Foto ruang rapat, ruang guru, aula sekolah — sebagai background kegiatan",
        "Foto ATK, nasi box, perlengkapan — sebagai referensi barang",
        "Foto halaman sekolah, taman — untuk kegiatan outdoor",
    ]
    for r in ref_items:
        story.append(bullet(r))
    story.append(Paragraph(
        "<i>Catatan: Foto referensi bersifat opsional. Jika tidak diunggah, AI tetap dapat "
        "menghasilkan background secara mandiri dengan kualitas yang baik.</i>", sSmall))

    story.append(spacer(1))
    story.append(Paragraph("3.1.3 Penyimpanan Data", sSubSubSection))
    story.append(Paragraph(
        "Semua foto yang telah diunggah akan disimpan dalam database lokal aplikasi. "
        "Data ini akan digunakan kembali setiap kali operator melakukan generate foto dokumentasi. "
        "Tidak perlu mengunggah ulang foto untuk setiap kegiatan.", sBody))

    story.append(spacer(1))
    story.append(Paragraph("3.1.4 Training AI (LoRA)", sSubSubSection))
    story.append(Paragraph(
        "Setelah foto personel diunggah, sistem secara otomatis akan melatih model AI menggunakan "
        "teknik LoRA (Low-Rank Adaptation) untuk mengenali wajah-wajah yang telah diunggah. "
        "Proses training ini berjalan di latar belakang (background process) dan tidak memerlukan "
        "intervensi operator. Biaya training ini <b>gratis</b> karena menggunakan infrastruktur VPS "
        "yang sudah disewa.", sBody))

    story.append(spacer(1))
    story.append(info_box("💰 Rincian Biaya Fase 1", [
        "Upload foto personel          : Rp 0 (gratis, penyimpanan sudah include)",
        "Upload foto referensi         : Rp 0 (gratis)",
        "Penyimpanan di database       : Rp 0 (gratis — SQLite/IndexedDB)",
        "Training AI (LoRA)            : Rp 0 (self-host, gratis)",
        "<b>TOTAL BIAYA FASE 1      : Rp 0 (GRATIS)</b>",
    ], C_LIGHT_BG, C_PRIMARY))

    story.append(PageBreak())

    # ─── FASE 2 ───
    story.append(Paragraph("3.2 Fase 2: Generate Foto Dokumentasi", sSubSection))
    story.append(Paragraph(
        "Fase ini merupakan inti dari fitur yang diajukan. Pada fase ini, operator melakukan "
        "generasi foto dokumentasi melalui serangkaian langkah interaktif. Fase ini adalah "
        "<b>satu-satunya fase yang membutuhkan biaya operasional</b> karena melibatkan pemrosesan "
        "AI pada GPU.", sBody))

    story.append(spacer(1))
    story.append(Paragraph("3.2.1 Langkah-langkah Generate", sSubSubSection))

    steps = [
        ("Buka Menu Generate", "Operator membuka menu 'Generate Foto Dokumentasi' pada aplikasi SPJ"),
        ("Pilih Jenis Kegiatan", "Terdapat 4 pilihan kegiatan: (a) Rapat — dokumentasi rapat guru, komite, koordinasi; (b) MAMIN — serah terima nasi box, snack box, konsumsi; (c) ATK — serah terima alat tulis kantor; (d) Pemeliharaan — dokumentasi perbaikan, servis"),
        ("Pilih Jenis Pakaian", "4 pilihan pakaian: (a) Formal — baju putih, cocok rapat resmi; (b) Batik — batik khas Indonesia; (c) Casual — santai; (d) Seragam — seragam guru"),
        ("Pilih Suasana/Tempat", "4 pilihan suasana: (a) Ruang Rapat — meja konferensi, whiteboard; (b) Outdoor — halaman sekolah, taman; (c) Aula — aula serbaguna; (d) Kantor — ruang guru atau TU"),
        ("Pilih Orang yang Hadir", "Operator mencentang nama-nama personel dari daftar yang sudah diupload pada Fase 1. AI akan memasukkan wajah asli mereka ke dalam foto"),
        ("Klik Generate", "Sistem memproses permintaan. AI akan: (1) Mengambil wajah personel yang dicentang; (2) Membuat scene sesuai kegiatan, pakaian, dan suasana; (3) Menempatkan wajah secara natural; (4) Menghasilkan foto dokumentasi realistis. Waktu proses: 5-15 detik"),
    ]
    for i, (title, desc) in enumerate(steps, 1):
        story.append(Paragraph(f"<b>Langkah {i}: {title}</b>", sSubSubSection))
        story.append(Paragraph(desc, sBody))

    story.append(spacer(1))
    story.append(Paragraph("3.2.2 Detail Teknis Proses Generate", sSubSubSection))
    story.append(Paragraph(
        "Proses generate foto melibatkan beberapa tahapan teknis sebagai berikut:", sBody))

    tech_steps = [
        "<b>Prompt Construction:</b> Sistem menyusun prompt (perintah) berdasarkan pilihan pengguna — jenis kegiatan, pakaian, suasana, dan jumlah orang",
        "<b>Face Extraction:</b> Sistem mengambil data wajah personel yang telah dilatih (LoRA) dari database",
        "<b>Image Generation:</b> Model AI Flux Pro memproses prompt dan menghasilkan gambar dengan komposisi yang sesuai",
        "<b>Face Injection:</b> Wajah-wajah personel yang telah dilatih ditempatkan secara natural pada figur-figur di dalam gambar",
        "<b>Post-Processing:</b> Gambar difinalisasi dengan pencahayaan, bayangan, dan detail agar terlihat realistis",
        "<b>Output:</b> Gambar siap ditampilkan dalam format preview A4",
    ]
    for ts in tech_steps:
        story.append(bullet(ts))

    story.append(spacer(1))
    story.append(info_box("💰 Rincian Biaya Fase 2", [
        "Biaya per foto                : ~Rp 300 per foto",
        "Biaya per sekolah per bulan   : ~Rp 3.000 (asumsi 10 foto/bulan)",
        "",
        "Biaya ini berasal dari sewa VPS GPU (Rp 600.000/bulan) yang bersifat FLAT —",
        "tidak peduli berapa banyak foto yang di-generate.",
        "",
        "Perbandingan biaya per foto:",
        "  Cetak foto manual           : Rp 2.000 - Rp 5.000 per foto",
        "  AI Generate via VPS         : ~Rp 300 per foto",
        "  <b>HEMAT ~85-94% per foto!</b>",
    ], C_LIGHT_GOLD, C_ORANGE))

    story.append(PageBreak())

    # ─── FASE 3 ───
    story.append(Paragraph("3.3 Fase 3: Output dan Download", sSubSection))
    story.append(Paragraph(
        "Fase ini merupakan tahap akhir setelah foto berhasil di-generate. Semua aktivitas "
        "pada fase ini <b>gratis</b> dan tidak memerlukan biaya tambahan.", sBody))

    story.append(spacer(1))
    story.append(Paragraph("3.3.1 Preview dan Validasi", sSubSubSection))
    story.append(Paragraph(
        "Setelah foto selesai di-generate, sistem akan menampilkan hasilnya dalam format preview. "
        "Pengguna dapat memeriksa apakah hasilnya sudah sesuai dengan yang diinginkan:", sBody))

    val_items = [
        "<b>Jika TIDAK sesuai:</b> Pengguna dapat kembali ke langkah pemilihan, mengubah parameter (pakaian, suasana, dll), dan melakukan generate ulang. Proses ini tidak dikenakan biaya tambahan karena biaya VPS sudah flat.",
        "<b>Jika SESUAI:</b> Pengguna melanjutkan ke tahap preview A4 siap cetak.",
    ]
    for v in val_items:
        story.append(bullet(v))

    story.append(spacer(1))
    story.append(Paragraph("3.3.2 Preview A4 Siap Cetak", sSubSubSection))
    story.append(Paragraph(
        "Foto hasil generate ditampilkan dalam format preview A4 yang sudah memiliki layout "
        "lengkap seperti dokumen LPJ asli:", sBody))

    preview_items = [
        "Kop Surat sekolah (otomatis terisi dari data sekolah)",
        "Judul Kegiatan (otomatis terisi berdasarkan pilihan)",
        "Foto Dokumentasi (hasil generate AI)",
        "Keterangan Kegiatan (dapat diedit manual oleh operator)",
        "Tanda Tangan (dari database personel)",
    ]
    for p in preview_items:
        story.append(bullet(p))

    story.append(spacer(1))
    story.append(Paragraph("3.3.3 Download dan Cetak", sSubSubSection))
    story.append(Paragraph(
        "Pengguna dapat mengunduh hasil generate dalam format JPG/PNG tanpa batasan jumlah. "
        "Foto juga dapat langsung dicetak atau disimpan sebagai PDF. Biaya cetak menggunakan "
        "kertas HVS biasa (tidak perlu kertas foto khusus).", sBody))

    story.append(spacer(1))
    story.append(Paragraph("3.3.4 Kebijakan Penyimpanan", sSubSubSection))
    story.append(Paragraph(
        "<b>Foto hasil generate tidak disimpan di database.</b> Hal ini untuk menjaga agar "
        "database tetap ringan dan aplikasi tetap cepat. Setelah pengguna mendownload foto, "
        "file hasil generate akan dihapus dari server. Jika membutuhkan foto yang sama di "
        "kemudian hari, pengguna cukup melakukan generate ulang (hanya membutuhkan 5-15 detik).", sBody))

    story.append(spacer(1))
    story.append(info_box("💰 Rincian Biaya Fase 3", [
        "Preview hasil generate        : Rp 0 (gratis)",
        "Download JPG/PNG              : Rp 0 (unlimited)",
        "Generate ulang                : Rp 0 (sudah include sewa VPS)",
        "Cetak / Save PDF              : Rp 0 (cetak sendiri pakai printer biasa)",
        "",
        "Perbandingan biaya cetak:",
        "  Cetak foto manual (kertas foto)  : Rp 2.000 - Rp 5.000/lembar",
        "  AI + cetak HVS biasa             : Rp 0/lembar (kertas biasa)",
        "  <b>Hemat 100% biaya cetak!</b>",
    ], C_LIGHT_GREEN, C_GREEN))

    story.append(spacer(2))
    story.append(Paragraph("3.4 Diagram Alur Lengkap", sSubSection))
    story.append(Paragraph(
        "Berikut adalah diagram alur lengkap fitur AI Generate Foto Dokumentasi LPJ dari awal "
        "hingga akhir:", sBody))

    # Flow diagram as table
    flow_data = [
        [Paragraph("<b>FASE 1: SETUP</b>", ParagraphStyle("f1", fontName=F["bold"],
                    fontSize=9, leading=12, textColor=white, alignment=TA_CENTER)),
         Paragraph("<b>FASE 2: GENERATE</b>", ParagraphStyle("f2", fontName=F["bold"],
                    fontSize=9, leading=12, textColor=white, alignment=TA_CENTER)),
         Paragraph("<b>FASE 3: OUTPUT</b>", ParagraphStyle("f3", fontName=F["bold"],
                    fontSize=9, leading=12, textColor=white, alignment=TA_CENTER))],
        [Paragraph("Buka Menu Data Sekolah<br/>↓<br/>Upload Foto Personel<br/>(Guru, KS, Pengawas)<br/>↓<br/>Upload Foto Referensi<br/>(Ruangan, Barang - Opsional)<br/>↓<br/>Training AI (LoRA)<br/>↓<br/><b>💰 GRATIS</b>",
                   ParagraphStyle("fc1", fontName=F["regular"], fontSize=8, leading=12,
                                 textColor=C_DARK, alignment=TA_CENTER)),
         Paragraph("Buka Menu Generate<br/>↓<br/>Pilih Jenis Kegiatan<br/>(Rapat/MAMIN/ATK/Pemeliharaan)<br/>↓<br/>Pilih Pakaian<br/>(Formal/Batik/Casual/Seragam)<br/>↓<br/>Pilih Suasana<br/>(Ruang Rapat/Outdoor/Aula/Kantor)<br/>↓<br/>Pilih Orang yang Hadir<br/>(Centang nama personel)<br/>↓<br/>Klik GENERATE (5-15 detik)<br/>↓<br/><b>💰 ~Rp 300/foto</b>",
                   ParagraphStyle("fc2", fontName=F["regular"], fontSize=8, leading=12,
                                 textColor=C_DARK, alignment=TA_CENTER)),
         Paragraph("Preview Hasil<br/>↓<br/>Sesuai?<br/>├── ❌ → Kembali Pilih<br/>└── ✅ → Preview A4<br/>↓<br/>Download JPG/PNG<br/>↓<br/>Cetak / Save PDF<br/>↓<br/><b>💰 GRATIS</b>",
                   ParagraphStyle("fc3", fontName=F["regular"], fontSize=8, leading=12,
                                 textColor=C_DARK, alignment=TA_CENTER))],
    ]
    ft = Table(flow_data, colWidths=[56*mm, 58*mm, 56*mm])
    ft.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), C_PRIMARY),
        ('BACKGROUND', (1, 0), (1, 0), C_PURPLE),
        ('BACKGROUND', (2, 0), (2, 0), C_GREEN),
        ('BACKGROUND', (0, 1), (0, 1), C_LIGHT_BG),
        ('BACKGROUND', (1, 1), (1, 1), HexColor("#f3e5f5")),
        ('BACKGROUND', (2, 1), (2, 1), C_LIGHT_GREEN),
        ('BOX', (0, 0), (-1, -1), 1, HexColor("#bdbdbd")),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 3),
        ('RIGHTPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(ft)

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════
    # BAB IV: ESTIMASI ANGGARAN
    # ════════════════════════════════════════════════════════════
    story.append(section_divider("BAB IV: ESTIMASI ANGGARAN"))
    story.append(spacer(3))

    story.append(Paragraph("4.1 Rincian Biaya", sSubSection))
    story.append(Paragraph(
        "Berikut adalah rincian biaya yang dibutuhkan untuk implementasi dan operasional "
        "fitur AI Generate Foto Dokumentasi LPJ:", sBody))

    story.append(make_table(
        ["No", "Pos Anggaran", "Satuan", "Biaya", "Keterangan"],
        [
            ["1", "Sewa VPS GPU (RTX 3090)", "Per bulan", "Rp 600.000", "3 jam/hari, unlimited generate"],
            ["2", "Sewa VPS GPU (RTX 3090)", "Per tahun", "Rp 7.200.000", "12 bulan"],
            ["3", "Setup awal VPS", "Sekali", "Rp 80.000", "Konfigurasi awal, sekali seumur pakai"],
            ["4", "Hosting aplikasi (Vercel)", "Per tahun", "GRATIS", "Sudah include paket existing"],
            ["5", "Training AI (LoRA)", "Per tahun", "GRATIS", "Self-host, tidak ada biaya lisensi"],
            ["6", "Domain & SSL", "Per tahun", "GRATIS", "Sudah include"],
            ["7", "Maintenance & Update", "Per tahun", "GRATIS", "Dilakukan internal tim"],
        ],
        [8*mm, 50*mm, 25*mm, 35*mm, 52*mm]
    ))

    story.append(spacer(2))
    story.append(Paragraph("4.1.1 Total Biaya", sSubSubSection))

    total_data = [
        [Paragraph("<b>Komponen Biaya</b>", sTableHeader),
         Paragraph("<b>Tahun Pertama</b>", sTableHeader),
         Paragraph("<b>Tahun Kedua</b>", sTableHeader)],
        [Paragraph("Sewa VPS GPU (1 unit)", sTableCell),
         Paragraph("Rp 7.200.000", sTableCell),
         Paragraph("Rp 7.200.000", sTableCell)],
        [Paragraph("Setup awal VPS", sTableCell),
         Paragraph("Rp 80.000", sTableCell),
         Paragraph("Rp 0", sTableCell)],
        [Paragraph("Hosting aplikasi", sTableCell),
         Paragraph("Rp 0 (gratis)", sTableCell),
         Paragraph("Rp 0 (gratis)", sTableCell)],
        [Paragraph("Training AI", sTableCell),
         Paragraph("Rp 0 (gratis)", sTableCell),
         Paragraph("Rp 0 (gratis)", sTableCell)],
        [Paragraph("<b>TOTAL</b>", ParagraphStyle("tct", fontName=F["bold"], fontSize=9,
                    leading=12, textColor=white, alignment=TA_CENTER)),
         Paragraph("<b>Rp 7.280.000</b>", ParagraphStyle("tct", fontName=F["bold"], fontSize=9,
                    leading=12, textColor=C_GOLD, alignment=TA_CENTER)),
         Paragraph("<b>Rp 7.200.000</b>", ParagraphStyle("tct", fontName=F["bold"], fontSize=9,
                    leading=12, textColor=C_GOLD, alignment=TA_CENTER))],
    ]
    tt = Table(total_data, colWidths=[55*mm, 57*mm, 58*mm])
    tt.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), C_PRIMARY),
        ('BACKGROUND', (0, -1), (-1, -1), C_PRIMARY),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor("#bdbdbd")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -2), [white, C_LIGHT_GRAY]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(tt)

    story.append(spacer(3))
    story.append(Paragraph("4.2 Skema Biaya Berbagai Skala", sSubSection))
    story.append(Paragraph(
        "Biaya operasional bersifat <b>flat</b> (tetap) karena menggunakan model sewa VPS, "
        "bukan bayar per foto. Berikut adalah simulasi biaya untuk berbagai skala sekolah:", sBody))

    story.append(make_table(
        ["Skala", "Unit VPS", "Biaya VPS/Tahun", "Per Sekolah/Tahun", "Per Sekolah/Bulan"],
        [
            ["50 sekolah (Pilot)", "1 VPS", "Rp 7.200.000", "Rp 144.000", "Rp 12.000"],
            ["100 sekolah", "1 VPS", "Rp 7.200.000", "Rp 72.000", "Rp 6.000"],
            ["200 sekolah", "1 VPS", "Rp 7.200.000", "Rp 36.000", "Rp 3.000"],
            ["400 sekolah", "2 VPS", "Rp 5.760.000", "Rp 36.000", "Rp 3.000"],
            ["600 sekolah", "3 VPS", "Rp 8.640.000", "Rp 36.000", "Rp 3.000"],
            ["800 sekolah", "4 VPS", "Rp 11.520.000", "Rp 36.000", "Rp 3.000"],
        ],
        [35*mm, 25*mm, 40*mm, 40*mm, 30*mm]
    ))

    story.append(spacer(1))
    story.append(Paragraph(
        "<i>Catatan: Biaya per sekolah bervariasi tergantung skala. "
        "Semakin banyak sekolah, biaya per sekolah semakin murah karena biaya VPS ditanggung bersama.</i>", sSmall))

    story.append(spacer(3))
    story.append(Paragraph("4.3 Perbandingan Biaya: Manual vs AI", sSubSection))

    story.append(make_table(
        ["Aspek", "Manual (Cetak/Foto Real)", "AI Generate", "Penghematan"],
        [
            ["Biaya langsung/tahun", "Rp 400.000 - Rp 1.200.000", "~Rp 36.000", "~91-97%"],
            ["Waktu per kegiatan", "30 - 60 menit", "2 - 5 menit", "~90%"],
            ["Biaya per foto", "Rp 2.000 - Rp 5.000", "~Rp 300", "~85-94%"],
            ["Biaya cetak/tahun", "Rp 200.000 - Rp 600.000", "Rp 0 (digital)", "100%"],
            ["Kualitas", "Tergantung HP & cuaca", "Studio quality", "+"],
            ["Risiko kegagalan", "Tinggi", "Sangat rendah", "+"],
        ],
        [40*mm, 50*mm, 45*mm, 35*mm]
    ))

    story.append(spacer(3))
    story.append(Paragraph("4.4 Analisis Efisiensi Biaya", sSubSection))

    story.append(Paragraph("4.4.1 Perhitungan Penghematan", sSubSubSection))
    story.append(Paragraph(
        "Dengan asumsi 200 sekolah, masing-masing memproduksi 10 foto dokumentasi per bulan:", sBody))

    calc_items = [
        "<b>Biaya cetak manual:</b> 200 sekolah x 10 foto x Rp 3.000 (rata-rata) x 12 bulan = Rp 72.000.000/tahun",
        "<b>Biaya AI Generate:</b> Rp 7.200.000/tahun (VPS) + Rp 80.000 (setup) = Rp 7.280.000/tahun",
        "<b>Total Penghematan:</b> Rp 72.000.000 - Rp 7.280.000 = Rp 69.040.000/tahun",
        "<b>Persentase Penghematan:</b> 89,9%",
        "<b>Return of Investment (ROI):</b> Balik modal sejak bulan pertama",
    ]
    for c in calc_items:
        story.append(bullet(c))

    story.append(spacer(2))
    story.append(Paragraph("4.4.2 Analisis Biaya per Foto", sSubSubSection))
    story.append(Paragraph(
        "Perhitungan biaya per foto dilakukan dengan membagi total biaya tahunan dengan "
        "total produksi foto:", sBody))

    per_foto = [
        "Total biaya VPS per tahun: Rp 7.200.000",
        "Kapasitas maksimum VPS: 7.920 foto/bulan x 12 = 95.040 foto/tahun",
        "Kebutuhan 200 sekolah: 2.000 foto/bulan x 12 = 24.000 foto/tahun",
        "Biaya per foto = Rp 7.200.000 / 24.000 = <b>Rp 300/foto</b>",
    ]
    for pf in per_foto:
        story.append(bullet(pf))

    story.append(spacer(2))
    story.append(Paragraph("4.4.3 Perbandingan Model Pembiayaan", sSubSubSection))

    story.append(make_table(
        ["Model Pembiayaan", "Biaya/Tahun (200 sekolah)", "Keterangan"],
        [
            ["🏆 VPS Sendiri (FLAT)", "~Rp 7.280.000", "Paling hemat untuk skala menengah-besar"],
            ["🥈 Bayar per Foto (Fal.ai)", "~Rp 11.500.000", "Cocok untuk skala kecil <50 sekolah"],
            ["🥉 Bayar per Foto + LoRA", "~Rp 23.000.000", "Tidak direkomendasikan"],
        ],
        [55*mm, 55*mm, 60*mm]
    ))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════
    # BAB V: ANALISIS KEBUTUHAN SUMBER DAYA
    # ════════════════════════════════════════════════════════════
    story.append(section_divider("BAB V: ANALISIS KEBUTUHAN SUMBER DAYA"))
    story.append(spacer(3))

    story.append(Paragraph("5.1 Sumber Daya Perangkat Keras", sSubSection))

    story.append(make_table(
        ["No", "Komponen", "Spesifikasi", "Jumlah", "Biaya"],
        [
            ["1", "VPS GPU", "RTX 3090, 24GB VRAM, 8 vCPU, 32GB RAM", "1 unit", "Rp 600.000/bln"],
            ["2", "Storage VPS", "100 GB SSD", "Include", "Rp 0"],
            ["3", "Bandwidth", "1 Gbps, 10 TB/bulan", "Include", "Rp 0"],
        ],
        [8*mm, 35*mm, 70*mm, 22*mm, 35*mm]
    ))

    story.append(spacer(2))
    story.append(Paragraph("5.2 Sumber Daya Perangkat Lunak", sSubSection))

    story.append(make_table(
        ["No", "Perangkat Lunak", "Fungsi", "Lisensi"],
        [
            ["1", "Next.js (Web App)", "Frontend & Backend aplikasi", "Open Source (gratis)"],
            ["2", "Flux Pro (Model AI)", "Text-to-image generation", "Open Source (gratis)"],
            ["3", "LoRA (Training)", "Personalisasi wajah", "Open Source (gratis)"],
            ["4", "SQLite / IndexedDB", "Database lokal", "Open Source (gratis)"],
            ["5", "Vercel", "Hosting aplikasi", "Gratis (existing)"],
            ["6", "RunPod / Vast.ai", "Platform VPS GPU", "Bayar sewa"],
        ],
        [8*mm, 45*mm, 65*mm, 52*mm]
    ))

    story.append(spacer(2))
    story.append(Paragraph("5.3 Sumber Daya Manusia", sSubSection))
    story.append(Paragraph(
        "Implementasi fitur ini dapat dilakukan oleh tim pengembang yang sudah ada, "
        "tanpa perlu merekrut tenaga tambahan:", sBody))

    sdm_items = [
        "<b>Backend Developer (1 orang):</b> Integrasi API AI, manajemen database, logika bisnis — 2 minggu",
        "<b>Frontend Developer (1 orang):</b> UI/UX menu generate, preview, download — 2 minggu",
        "<b>AI Engineer (1 orang):</b> Setup VPS GPU, training LoRA, optimasi prompt — 1 minggu",
        "<b>Testing & QA (1 orang):</b> Uji coba fitur, validasi hasil, debugging — 1 minggu",
    ]
    for s in sdm_items:
        story.append(bullet(s))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════
    # BAB VI: JADWAL IMPLEMENTASI
    # ════════════════════════════════════════════════════════════
    story.append(section_divider("BAB VI: JADWAL IMPLEMENTASI"))
    story.append(spacer(3))

    story.append(Paragraph("6.1 Tahapan Implementasi", sSubSection))
    story.append(Paragraph(
        "Implementasi fitur AI Generate Foto Dokumentasi LPJ direncanakan dalam 6 (enam) "
        "tahapan sebagai berikut:", sBody))

    story.append(make_table(
        ["Tahap", "Kegiatan", "Durasi", "Output"],
        [
            ["1", "Setup Infrastruktur VPS GPU", "3 hari", "VPS siap pakai, model AI terinstall"],
            ["2", "Training Model LoRA", "3 hari", "Model AI siap mengenali wajah"],
            ["3", "Pengembangan Backend", "10 hari", "API generate, database, logika bisnis"],
            ["4", "Pengembangan Frontend", "10 hari", "UI/UX menu generate, preview, download"],
            ["5", "Integrasi & Testing", "5 hari", "Fitur berfungsi end-to-end"],
            ["6", "Deploy & UAT", "2 hari", "Fitur live, user acceptance test"],
        ],
        [12*mm, 55*mm, 25*mm, 78*mm]
    ))

    story.append(spacer(2))
    story.append(Paragraph("6.2 Timeline Pengerjaan", sSubSection))
    story.append(Paragraph(
        "Total durasi implementasi diperkirakan selama <b>33 hari kerja</b> atau sekitar "
        "<b>6-7 minggu</b> kalender. Timeline detail sebagai berikut:", sBody))

    timeline_data = [
        [Paragraph("<b>Minggu 1</b>", sTableCellBold),
         Paragraph("Setup VPS + Training LoRA", sTableCellLeft),
         Paragraph("100%", sTableCell)],
        [Paragraph("<b>Minggu 2-3</b>", sTableCellBold),
         Paragraph("Pengembangan Backend + Frontend", sTableCellLeft),
         Paragraph("100%", sTableCell)],
        [Paragraph("<b>Minggu 4</b>", sTableCellBold),
         Paragraph("Integrasi Backend-Frontend", sTableCellLeft),
         Paragraph("100%", sTableCell)],
        [Paragraph("<b>Minggu 5</b>", sTableCellBold),
         Paragraph("Testing & Debugging", sTableCellLeft),
         Paragraph("100%", sTableCell)],
        [Paragraph("<b>Minggu 6</b>", sTableCellBold),
         Paragraph("Deploy, UAT, Dokumentasi", sTableCellLeft),
         Paragraph("100%", sTableCell)],
    ]
    tlt = Table(timeline_data, colWidths=[30*mm, 100*mm, 40*mm])
    tlt.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), C_PRIMARY),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor("#bdbdbd")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, C_LIGHT_GRAY]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(tlt)

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════
    # BAB VII: PENUTUP
    # ════════════════════════════════════════════════════════════
    story.append(section_divider("BAB VII: PENUTUP"))
    story.append(spacer(3))

    story.append(Paragraph("7.1 Kesimpulan", sSubSection))
    story.append(Paragraph(
        "Berdasarkan analisis yang telah dijabarkan dalam dokumen ini, dapat disimpulkan "
        "bahwa pengembangan fitur AI Generate Foto Dokumentasi LPJ merupakan solusi yang "
        "sangat tepat untuk mengatasi permasalahan dokumentasi kegiatan sekolah. Beberapa "
        "poin kesimpulan utama:", sBody))

    conclusions = [
        "Fitur ini mampu menghemat <b>~90% biaya dokumentasi</b> per sekolah per tahun — dari Rp 800.000 menjadi hanya Rp 36.000",
        "Fitur ini mampu menghemat <b>~90% waktu pengerjaan</b> — dari 45 menit menjadi 3 menit per kegiatan",
        "Investasi tahun pertama hanya <b>Rp 7.280.000</b> untuk 200 sekolah — atau Rp 36.000 per sekolah per tahun (Rp 3.000/bulan)",
        "Biaya operasional bersifat <b>flat</b> — tidak peduli berapa banyak foto yang di-generate",
        "Teknologi AI yang digunakan sudah matang dan teruji di tahun 2026",
        "Data dan privasi operator <b>100% aman</b> — VPS milik sendiri, tidak publik",
        "Tidak perlu merekrut tenaga tambahan atau membeli perangkat keras mahal",
    ]
    for c in conclusions:
        story.append(bullet(c))

    story.append(spacer(3))
    story.append(Paragraph("7.2 Rekomendasi", sSubSection))
    story.append(Paragraph(
        "Berdasarkan kesimpulan di atas, kami merekomendasikan:", sBody))

    recommendations = [
        "<b>Menyetujui pengembangan fitur</b> AI Generate Foto Dokumentasi LPJ untuk diimplementasikan pada aplikasi SPJ",
        "<b>Mengalokasikan anggaran</b> sebesar Rp 7.280.000 untuk tahun pertama implementasi",
        "<b>Memulai pilot project</b> pada 50 sekolah terlebih dahulu untuk validasi dan evaluasi sebelum diperluas ke 200+ sekolah",
        "<b>Melakukan evaluasi berkala</b> setiap 3 bulan untuk memastikan fitur berjalan sesuai dengan yang diharapkan",
    ]
    for r in recommendations:
        story.append(bullet(r))

    story.append(spacer(5))

    # Signature block
    story.append(thick_hr(C_PRIMARY))
    story.append(spacer(5))

    sign_data = [
        [Paragraph("Diajukan oleh,", sSignature)],
        [Paragraph("", sSignature)],
        [Paragraph("", sSignature)],
        [Paragraph("<b>Tim Pengembang SPJ App</b>", sSignature)],
        [Paragraph("SD Negeri Pasirhalang", sSignature)],
        [Paragraph("Desa Mandalamukti, Kec. Cikalongwetan", sSignature)],
        [Paragraph("Kab. Bandung Barat, Jawa Barat", sSignature)],
        [Paragraph("", sSignature)],
        [Paragraph("Mengetahui / Menyetujui,", sSignature)],
        [Paragraph("", sSignature)],
        [Paragraph("", sSignature)],
        [Paragraph("<b>Stakeholder / Project Manager</b>", sSignature)],
        [Paragraph("", sSignature)],
        [Paragraph("", sSignature)],
        [Paragraph("26 Juli 2026", sSignature)],
    ]
    st = Table(sign_data, colWidths=[170*mm])
    st.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    story.append(st)

    # ─── Build PDF ───
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print(f"✅ Dokumen berhasil dibuat: {OUTPUT_PATH}")
    print(f"   Buka file untuk melihat hasilnya.")

if __name__ == "__main__":
    build_pdf()