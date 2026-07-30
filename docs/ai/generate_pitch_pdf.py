#!/usr/bin/env python3
"""
Generate PDF Pitch Deck: Fitur AI Generate Foto Dokumentasi LPJ
Untuk Stakeholder / Project Manager Non-Teknis
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, white, black, Color
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    KeepTogether, HRFlowable, Image
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

# ─── Color Palette ───
C_PRIMARY   = HexColor("#1a237e")   # Deep Indigo
C_SECONDARY = HexColor("#283593")
C_ACCENT    = HexColor("#3949ab")
C_GOLD      = HexColor("#f9a825")
C_GREEN     = HexColor("#2e7d32")
C_RED       = HexColor("#c62828")
C_PURPLE    = HexColor("#6a1b9a")
C_TEAL      = HexColor("#00695c")
C_ORANGE    = HexColor("#ef6c00")
C_LIGHT_BG  = HexColor("#e8eaf6")
C_LIGHT_GREEN = HexColor("#e8f5e9")
C_LIGHT_GOLD = HexColor("#fff8e1")
C_LIGHT_PURPLE = HexColor("#f3e5f5")
C_GRAY      = HexColor("#424242")
C_LIGHT_GRAY = HexColor("#f5f5f5")
C_WHITE     = white
C_BLACK     = black

OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "PITCH_GENERATE_FOTO_DOKUMENTASI.pdf")

# ─── Try register fonts ───
def try_register_fonts():
    """Try to register Arial or fallback to Helvetica"""
    font_paths = [
        "C:\\Windows\\Fonts\\arial.ttf",
        "C:\\Windows\\Fonts\\Arial.ttf",
        "C:\\Windows\\Fonts\\arialbd.ttf",
        "C:\\Windows\\Fonts\\Arialbd.ttf",
        "C:\\Windows\\Fonts\\arialbi.ttf",
        "C:\\Windows\\Fonts\\Arialbi.ttf",
        "C:\\Windows\\Fonts\\ariali.ttf",
        "C:\\Windows\\Fonts\\Ariali.ttf",
    ]
    fonts = {}
    try:
        if os.path.exists(font_paths[0]):
            pdfmetrics.registerFont(TTFont("Arial", font_paths[0]))
            pdfmetrics.registerFont(TTFont("Arial-Bold", font_paths[2]))
            pdfmetrics.registerFont(TTFont("Arial-Italic", font_paths[6]))
            pdfmetrics.registerFont(TTFont("Arial-BoldItalic", font_paths[4]))
            fonts["regular"] = "Arial"
            fonts["bold"] = "Arial-Bold"
            fonts["italic"] = "Arial-Italic"
            fonts["bolditalic"] = "Arial-BoldItalic"
        else:
            fonts["regular"] = "Helvetica"
            fonts["bold"] = "Helvetica-Bold"
            fonts["italic"] = "Helvetica-Oblique"
            fonts["bolditalic"] = "Helvetica-BoldOblique"
    except:
        fonts["regular"] = "Helvetica"
        fonts["bold"] = "Helvetica-Bold"
        fonts["italic"] = "Helvetica-Oblique"
        fonts["bolditalic"] = "Helvetica-BoldOblique"
    return fonts

F = try_register_fonts()

# ─── Styles ───
styles = getSampleStyleSheet()

sTitle = ParagraphStyle("CoverTitle", fontName=F["bold"], fontSize=28, leading=34,
                        textColor=C_PRIMARY, alignment=TA_CENTER, spaceAfter=6*mm)
sSubtitle = ParagraphStyle("CoverSubtitle", fontName=F["regular"], fontSize=14, leading=18,
                           textColor=C_GRAY, alignment=TA_CENTER, spaceAfter=4*mm)
sCoverInfo = ParagraphStyle("CoverInfo", fontName=F["regular"], fontSize=11, leading=15,
                            textColor=C_GRAY, alignment=TA_CENTER, spaceAfter=2*mm)
sH1 = ParagraphStyle("H1", fontName=F["bold"], fontSize=20, leading=26,
                      textColor=C_PRIMARY, spaceBefore=10*mm, spaceAfter=5*mm)
sH2 = ParagraphStyle("H2", fontName=F["bold"], fontSize=15, leading=20,
                      textColor=C_SECONDARY, spaceBefore=7*mm, spaceAfter=3*mm)
sH3 = ParagraphStyle("H3", fontName=F["bold"], fontSize=12, leading=16,
                      textColor=C_ACCENT, spaceBefore=5*mm, spaceAfter=2*mm)
sBody = ParagraphStyle("Body", fontName=F["regular"], fontSize=10, leading=14,
                        textColor=C_GRAY, alignment=TA_JUSTIFY, spaceAfter=3*mm)
sBodyBold = ParagraphStyle("BodyBold", fontName=F["bold"], fontSize=10, leading=14,
                            textColor=C_GRAY, spaceAfter=3*mm)
sBullet = ParagraphStyle("Bullet", fontName=F["regular"], fontSize=10, leading=14,
                          textColor=C_GRAY, leftIndent=8*mm, spaceAfter=2*mm)
sQuote = ParagraphStyle("Quote", fontName=F["italic"], fontSize=11, leading=16,
                         textColor=C_PRIMARY, leftIndent=10*mm, rightIndent=10*mm,
                         spaceBefore=4*mm, spaceAfter=4*mm,
                         borderPadding=6, backColor=C_LIGHT_BG)
sSmall = ParagraphStyle("Small", fontName=F["regular"], fontSize=8, leading=10,
                         textColor=HexColor("#757575"), spaceAfter=2*mm)
sTableHeader = ParagraphStyle("TableHeader", fontName=F["bold"], fontSize=9, leading=12,
                               textColor=white, alignment=TA_CENTER)
sTableCell = ParagraphStyle("TableCell", fontName=F["regular"], fontSize=9, leading=12,
                             textColor=C_GRAY, alignment=TA_CENTER)
sTableCellLeft = ParagraphStyle("TableCellLeft", fontName=F["regular"], fontSize=9, leading=12,
                                 textColor=C_GRAY, alignment=TA_LEFT)
sTableCellBold = ParagraphStyle("TableCellBold", fontName=F["bold"], fontSize=9, leading=12,
                                 textColor=C_GRAY, alignment=TA_CENTER)
sFooter = ParagraphStyle("Footer", fontName=F["italic"], fontSize=8, leading=10,
                          textColor=HexColor("#9e9e9e"), alignment=TA_CENTER)

# ─── Helper Functions ───

def hr():
    return HRFlowable(width="100%", thickness=0.5, color=HexColor("#e0e0e0"),
                       spaceBefore=3*mm, spaceAfter=3*mm)

def colored_hr(color):
    return HRFlowable(width="100%", thickness=1.5, color=color,
                       spaceBefore=3*mm, spaceAfter=3*mm)

def spacer(h=3):
    return Spacer(1, h*mm)

def make_table(headers, rows, col_widths=None, header_bg=C_PRIMARY):
    """Create a styled table"""
    data = [[Paragraph(h, sTableHeader) for h in headers]]
    for row in rows:
        data.append([Paragraph(str(c), sTableCell) for c in row])
    
    if col_widths is None:
        col_widths = [170*mm / len(headers)] * len(headers)
    
    t = Table(data, colWidths=col_widths, repeatRows=1)
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), header_bg),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor("#e0e0e0")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, C_LIGHT_GRAY]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]
    t.setStyle(TableStyle(style_cmds))
    return t

def info_box(title, content_lines, bg_color=C_LIGHT_BG, border_color=C_PRIMARY):
    """Create an info/highlight box"""
    data = []
    data.append([Paragraph(f"<b>{title}</b>", ParagraphStyle("BoxTitle",
        fontName=F["bold"], fontSize=11, leading=15, textColor=border_color))])
    for line in content_lines:
        data.append([Paragraph(line, sBody)])
    
    t = Table(data, colWidths=[160*mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), bg_color),
        ('BACKGROUND', (0, 1), (-1, -1), bg_color),
        ('BOX', (0, 0), (-1, -1), 1.5, border_color),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    return t

def bullet_point(text, bold_prefix=None):
    """Create a bullet point"""
    if bold_prefix:
        return Paragraph(f"• <b>{bold_prefix}</b> {text}", sBullet)
    return Paragraph(f"• {text}", sBullet)

def number_point(num, text, bold_prefix=None):
    if bold_prefix:
        return Paragraph(f"<b>{num}.</b> <b>{bold_prefix}</b> {text}", sBullet)
    return Paragraph(f"<b>{num}.</b> {text}", sBullet)

def section_divider(title, color=C_PRIMARY):
    """Create a section divider with title"""
    return Table(
        [[Paragraph(title, ParagraphStyle("Divider", fontName=F["bold"], fontSize=13,
                    leading=17, textColor=white))]],
        colWidths=[170*mm],
        style=TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), color),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ])
    )

def phase_box(phase_num, phase_title, phase_color, items, cost):
    """Create a phase box for the 3 phases"""
    data = []
    data.append([Paragraph(
        f"<b>FASE {phase_num}: {phase_title}</b>",
        ParagraphStyle("PhaseTitle", fontName=F["bold"], fontSize=12, leading=16, textColor=white)
    )])
    for item in items:
        data.append([Paragraph(f"• {item}", ParagraphStyle("PhaseItem",
            fontName=F["regular"], fontSize=9, leading=13, textColor=C_GRAY))])
    data.append([Paragraph(
        f"<b>💰 {cost}</b>",
        ParagraphStyle("PhaseCost", fontName=F["bold"], fontSize=10, leading=14, textColor=phase_color)
    )])
    
    t = Table(data, colWidths=[160*mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), phase_color),
        ('BACKGROUND', (0, 1), (0, -2), C_LIGHT_GRAY),
        ('BACKGROUND', (0, -1), (0, -1), white),
        ('BOX', (0, 0), (-1, -1), 1.5, phase_color),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    return t

def comparison_box(items_left, items_right, left_title="MANUAL", right_title="AI GENERATE",
                   left_color=C_RED, right_color=C_GREEN):
    """Create a side-by-side comparison"""
    data = [[
        Paragraph(f"<b>{left_title}</b>", ParagraphStyle("CL",
                  fontName=F["bold"], fontSize=10, leading=14, textColor=left_color, alignment=TA_CENTER)),
        Paragraph(f"<b>{right_title}</b>", ParagraphStyle("CR",
                  fontName=F["bold"], fontSize=10, leading=14, textColor=right_color, alignment=TA_CENTER))
    ]]
    max_len = max(len(items_left), len(items_right))
    for i in range(max_len):
        left = items_left[i] if i < len(items_left) else ""
        right = items_right[i] if i < len(items_right) else ""
        data.append([
            Paragraph(left, ParagraphStyle("CLi", fontName=F["regular"], fontSize=9,
                      leading=13, textColor=C_GRAY)),
            Paragraph(right, ParagraphStyle("CRi", fontName=F["regular"], fontSize=9,
                      leading=13, textColor=C_GRAY))
        ])
    
    t = Table(data, colWidths=[85*mm, 85*mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), HexColor("#ffebee")),
        ('BACKGROUND', (1, 0), (1, 0), HexColor("#e8f5e9")),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor("#e0e0e0")),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, C_LIGHT_GRAY]),
    ]))
    return t

# ─── Page Template ───
def header_footer(canvas_obj, doc):
    canvas_obj.saveState()
    # Header line
    canvas_obj.setStrokeColor(C_PRIMARY)
    canvas_obj.setLineWidth(0.5)
    canvas_obj.line(20*mm, A4[1] - 15*mm, A4[0] - 20*mm, A4[1] - 15*mm)
    # Header text
    canvas_obj.setFont(F["italic"], 7)
    canvas_obj.setFillColor(HexColor("#9e9e9e"))
    canvas_obj.drawString(20*mm, A4[1] - 13*mm, "AI Generate Foto Dokumentasi LPJ — Pitch Stakeholder")
    canvas_obj.drawRightString(A4[0] - 20*mm, A4[1] - 13*mm, "SPJ App | SD Negeri Pasirhalang")
    # Footer
    canvas_obj.setStrokeColor(HexColor("#e0e0e0"))
    canvas_obj.line(20*mm, 15*mm, A4[0] - 20*mm, 15*mm)
    canvas_obj.setFont(F["italic"], 8)
    canvas_obj.setFillColor(HexColor("#9e9e9e"))
    canvas_obj.drawCentredString(A4[0]/2, 10*mm, f"Halaman {doc.page}")
    canvas_obj.restoreState()

# ─── Build Document ───
def build_pdf():
    doc = SimpleDocTemplate(
        OUTPUT_PATH,
        pagesize=A4,
        leftMargin=20*mm, rightMargin=20*mm,
        topMargin=22*mm, bottomMargin=22*mm,
    )
    
    story = []
    W = A4[0] - 40*mm  # usable width

    # ═══════════════════════════════════════════
    # COVER PAGE
    # ═══════════════════════════════════════════
    story.append(Spacer(1, 40*mm))
    
    # Top accent bar
    story.append(HRFlowable(width="100%", thickness=4, color=C_PRIMARY,
                             spaceBefore=0, spaceAfter=10*mm))
    
    story.append(Paragraph("PITCH PRESENTASI", sTitle))
    story.append(Paragraph("Fitur AI Generate Foto Dokumentasi LPJ", sSubtitle))
    story.append(spacer(5))
    story.append(Paragraph(
        "Solusi Cerdas untuk Dokumentasi Kegiatan Sekolah",
        ParagraphStyle("Tagline", fontName=F["italic"], fontSize=16, leading=20,
                       textColor=C_ACCENT, alignment=TA_CENTER, spaceAfter=10*mm)
    ))
    
    story.append(HRFlowable(width="60%", thickness=1, color=C_GOLD,
                             spaceBefore=5*mm, spaceAfter=8*mm))
    
    # Key numbers
    key_data = [
        [Paragraph("<b>Rp 1.233</b>", ParagraphStyle("k1", fontName=F["bold"], fontSize=18,
                    leading=22, textColor=C_GREEN, alignment=TA_CENTER)),
         Paragraph("<b>~96%</b>", ParagraphStyle("k2", fontName=F["bold"], fontSize=18,
                    leading=22, textColor=C_GREEN, alignment=TA_CENTER)),
         Paragraph("<b>5-15 dtk</b>", ParagraphStyle("k3", fontName=F["bold"], fontSize=18,
                    leading=22, textColor=C_GREEN, alignment=TA_CENTER)),
         Paragraph("<b>200+</b>", ParagraphStyle("k4", fontName=F["bold"], fontSize=18,
                    leading=22, textColor=C_GREEN, alignment=TA_CENTER))],
        [Paragraph("Per Sekolah/Bulan", ParagraphStyle("kl1", fontName=F["regular"], fontSize=9,
                    leading=12, textColor=C_GRAY, alignment=TA_CENTER)),
         Paragraph("Lebih Hemat", ParagraphStyle("kl2", fontName=F["regular"], fontSize=9,
                    leading=12, textColor=C_GRAY, alignment=TA_CENTER)),
         Paragraph("Per Generate", ParagraphStyle("kl3", fontName=F["regular"], fontSize=9,
                    leading=12, textColor=C_GRAY, alignment=TA_CENTER)),
         Paragraph("Sekolah Terbantu", ParagraphStyle("kl4", fontName=F["regular"], fontSize=9,
                    leading=12, textColor=C_GRAY, alignment=TA_CENTER))]
    ]
    kt = Table(key_data, colWidths=[W/4]*4)
    kt.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    story.append(kt)
    
    story.append(spacer(15))
    story.append(Paragraph("Ditujukan untuk: Stakeholder & Project Manager", sCoverInfo))
    story.append(Paragraph("Dibuat: 26 Juli 2026", sCoverInfo))
    story.append(Paragraph("Oleh: Tim SPJ App — SD Negeri Pasirhalang", sCoverInfo))
    
    story.append(spacer(10))
    story.append(HRFlowable(width="100%", thickness=4, color=C_PRIMARY,
                             spaceBefore=10*mm, spaceAfter=0))
    
    story.append(PageBreak())

    # ═══════════════════════════════════════════
    # TABLE OF CONTENTS
    # ═══════════════════════════════════════════
    story.append(section_divider("DAFTAR ISI"))
    story.append(spacer(3))
    
    toc_items = [
        ("1", "Masalah yang Mau Diselesaikan"),
        ("2", "Solusi Kami — Dalam 3 Kalimat"),
        ("3", "Anggaran yang Dibutuhkan"),
        ("4", "Cara Kerja Sederhana"),
        ("5", "Walkthrough: 3 Fase Utama"),
        ("6", "Perbandingan Manual vs AI"),
        ("7", "Mengapa VPS (Hosting Sendiri)?"),
        ("8", "Nilai yang Didapat vs Biaya"),
        ("9", "Q&A untuk Stakeholder"),
        ("10", "Closing Statement"),
    ]
    
    toc_data = []
    for num, title in toc_items:
        toc_data.append([
            Paragraph(f"<b>{num}.</b>", ParagraphStyle("tocn", fontName=F["bold"], fontSize=11,
                       leading=16, textColor=C_PRIMARY, alignment=TA_CENTER)),
            Paragraph(title, ParagraphStyle("toct", fontName=F["regular"], fontSize=11,
                       leading=16, textColor=C_GRAY))
        ])
    
    toc_table = Table(toc_data, colWidths=[15*mm, 155*mm])
    toc_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LINEBELOW', (0, 0), (-1, -1), 0.3, HexColor("#e0e0e0")),
    ]))
    story.append(toc_table)
    
    story.append(PageBreak())

    # ═══════════════════════════════════════════
    # 1. MASALAH
    # ═══════════════════════════════════════════
    story.append(section_divider("1. Masalah yang Mau Diselesaikan", C_RED))
    story.append(spacer(3))
    
    story.append(Paragraph("Kondisi Saat Ini", sH2))
    
    problem_items = [
        "📱 <b>Foto kegiatan pakai HP</b> — kadang lupa, kadang malu memotret",
        "🎨 <b>Edit foto di Canva/Photoshop</b> — butuh keahlian desain",
        "🖨️ <b>Cetak foto</b> — biaya Rp 2.000–5.000 per lembar",
        "📋 <b>Tempel di LPJ</b> — manual, ribet, makan waktu"
    ]
    for item in problem_items:
        story.append(Paragraph(item, sBullet))
    
    story.append(spacer(2))
    
    # Problem stats box
    story.append(info_box("⏱️ Dampak Masalah", [
        "<b>Waktu:</b> 30–60 MENIT per kegiatan dokumentasi",
        "<b>Biaya cetak:</b> Rp 400.000–1.200.000 per sekolah per tahun",
        "<b>Risiko:</b> Foto jelek, lupa foto, cuaca buruk, guru tidak hadir"
    ], HexColor("#ffebee"), C_RED))
    
    story.append(spacer(3))
    
    # Real examples table
    story.append(Paragraph("Contoh Nyata di Lapangan", sH3))
    story.append(make_table(
        ["Situasi", "Dampak"],
        [
            ["Rapat koordinasi guru, lupa foto bersama", "❌ Tidak ada bukti dokumentasi LPJ"],
            ["Beli nasi box, foto dari HP burem", "❌ Kena teguran verifikator"],
            ["Pemeliharaan AC, hujan, tidak bisa foto luar", "❌ Kegiatan tidak terdokumentasi"],
            ["Guru tidak hadir, tidak bisa foto dokumentasi", "❌ LPJ tidak lengkap"],
        ],
        [85*mm, 85*mm]
    ))
    
    story.append(PageBreak())

    # ═══════════════════════════════════════════
    # 2. SOLUSI 3 KALIMAT
    # ═══════════════════════════════════════════
    story.append(section_divider("2. Solusi Kami — Dalam 3 Kalimat", C_TEAL))
    story.append(spacer(5))
    
    # Quote box
    quote_data = [
        [Paragraph(
            "📱 <b>Operator tinggal upload foto selfie, pilih jenis kegiatan.</b>",
            ParagraphStyle("q1", fontName=F["regular"], fontSize=13, leading=18,
                          textColor=C_PRIMARY, alignment=TA_CENTER))],
        [Paragraph(
            "🤖 <b>AI akan generate foto dokumentasi yang realistis</b> — seolah-olah benar-benar ada foto kegiatan tersebut.",
            ParagraphStyle("q2", fontName=F["regular"], fontSize=13, leading=18,
                          textColor=C_PRIMARY, alignment=TA_CENTER))],
        [Paragraph(
            "💰 <b>Biaya total Rp 2,96 JUTA/TAHUN untuk 200 sekolah</b> — atau Rp 1.233 per sekolah per bulan.",
            ParagraphStyle("q3", fontName=F["regular"], fontSize=13, leading=18,
                          textColor=C_PRIMARY, alignment=TA_CENTER))],
    ]
    qt = Table(quote_data, colWidths=[170*mm])
    qt.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), C_LIGHT_BG),
        ('BOX', (0, 0), (-1, -1), 2, C_PRIMARY),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('LINEAFTER', (0, 0), (0, -1), 3, C_GOLD),
    ]))
    story.append(qt)
    
    story.append(PageBreak())

    # ═══════════════════════════════════════════
    # 3. ANGGARAN
    # ═══════════════════════════════════════════
    story.append(section_divider("3. Anggaran yang Dibutuhkan", C_GOLD))
    story.append(spacer(3))
    
    story.append(Paragraph("Angka Kunci", sH2))
    
    story.append(make_table(
        ["Jumlah Sekolah", "Biaya Per Tahun", "Per Sekolah/Bulan", "Setara dengan..."],
        [
            ["200 sekolah", "~Rp 2.960.000", "~Rp 1.233", "🍚 1 porsi nasi pecel + es teh"],
            ["400 sekolah", "~Rp 5.920.000", "~Rp 1.233", "🎉 Tetap sama per sekolah!"],
        ],
        [42*mm, 42*mm, 42*mm, 44*mm]
    ))
    
    story.append(spacer(4))
    story.append(Paragraph("Rincian Transparan", sH2))
    
    story.append(make_table(
        ["Pos Anggaran", "Per Bulan", "Per Tahun", "Penjelasan"],
        [
            ["Sewa GPU (VPS AI)", "~Rp 240.000", "~Rp 2.880.000", "GPU dipakai 3 jam/hari"],
            ["Biaya setting awal", "—", "~Rp 80.000", "Sekali seumur pakai"],
            ["Hosting aplikasi", "GRATIS 🆓", "GRATIS 🆓", "Vercel — tidak perlu bayar"],
            ["Training AI (LoRA)", "GRATIS 🆓", "GRATIS 🆓", "Training wajah operator gratis"],
        ],
        [40*mm, 35*mm, 35*mm, 60*mm]
    ))
    
    story.append(spacer(3))
    
    # Total box
    total_data = [
        [Paragraph("<b>TOTAL TAHUN PERTAMA</b>", ParagraphStyle("tb1", fontName=F["bold"],
                    fontSize=12, leading=16, textColor=white, alignment=TA_CENTER)),
         Paragraph("<b>~Rp 2.960.000</b>", ParagraphStyle("tb2", fontName=F["bold"],
                    fontSize=12, leading=16, textColor=C_GOLD, alignment=TA_CENTER))],
        [Paragraph("<b>TOTAL TAHUN KEDUA & SETERUSNYA</b>", ParagraphStyle("tb3",
                    fontName=F["bold"], fontSize=12, leading=16, textColor=white, alignment=TA_CENTER)),
         Paragraph("<b>~Rp 2.880.000</b>", ParagraphStyle("tb4", fontName=F["bold"],
                    fontSize=12, leading=16, textColor=C_GOLD, alignment=TA_CENTER))],
    ]
    tt = Table(total_data, colWidths=[100*mm, 70*mm])
    tt.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), C_PRIMARY),
        ('BACKGROUND', (1, 0), (1, -1), C_PRIMARY),
        ('BOX', (0, 0), (-1, -1), 2, C_GOLD),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(tt)
    
    story.append(spacer(5))
    
    # Why fixed cost
    story.append(Paragraph("Kenapa Biaya Tetap untuk 200 atau 400 Sekolah?", sH2))
    
    story.append(info_box("💡 Analogi: Sewa Mesin Fotocopy", [
        "Bayangkan Anda sewa mesin fotocopy Rp 1 juta/bulan:",
        "  • Cetak 100 lembar → Rp 1 juta",
        "  • Cetak 10.000 lembar → TETAP Rp 1 juta",
        "  • Cetak UNLIMITED → TETAP Rp 1 juta",
        "",
        "Sama dengan GPU VPS:",
        "  • Sewa GPU Rp 240.000/bulan → UNLIMITED generate foto",
        "  • 200 sekolah generate 1.900 foto/bulan → Rp 240.000",
        "  • 400 sekolah generate 3.800 foto/bulan → TETAP Rp 240.000",
        "",
        "✅ Inilah KEKUATAN 'sewa mesin, bukan bayar per lembar'!",
        "Biaya TETAP, tidak peduli berapa banyak foto yang dibuat."
    ], C_LIGHT_GOLD, C_ORANGE))
    
    story.append(PageBreak())
    
    # Per school breakdown
    story.append(Paragraph("Biaya Per Sekolah — Agar Tidak Terlihat Mahal", sH2))
    story.append(Paragraph(
        "Stakeholder mungkin kaget melihat 'Rp 2,96 Juta/tahun'. Tapi coba lihat per SEKOLAH-nya:",
        sBody
    ))
    
    story.append(spacer(2))
    story.append(make_table(
        ["Metrik", "200 Sekolah", "400 Sekolah", "600 Sekolah"],
        [
            ["Total Biaya VPS/tahun", "Rp 2.880.000", "Rp 5.760.000", "Rp 8.640.000"],
            ["Setup awal (sekali)", "Rp 80.000", "Rp 80.000", "Rp 80.000"],
            ["TOTAL TAHUN PERTAMA", "Rp 2.960.000", "Rp 5.840.000", "Rp 8.720.000"],
            ["TOTAL TAHUN KEDUA", "Rp 2.880.000", "Rp 5.760.000", "Rp 8.640.000"],
            ["Per SEKOLAH per TAHUN", "~Rp 14.800", "~Rp 14.800", "~Rp 14.800"],
            ["Per SEKOLAH per BULAN", "~Rp 1.233", "~Rp 1.233", "~Rp 1.233"],
            ["Per SEKOLAH per MINGGU", "~Rp 308", "~Rp 308", "~Rp 308"],
            ["Per SEKOLAH per HARI", "~Rp 44", "~Rp 44", "~Rp 44"],
            ["Per FOTO", "~Rp 120", "~Rp 120", "~Rp 120"],
        ],
        [45*mm, 42*mm, 42*mm, 42*mm]
    ))
    
    story.append(spacer(4))
    
    # Visual comparison
    story.append(Paragraph("Visual: Rp 1.233 Itu Setara dengan Apa?", sH3))
    
    visual_data = [
        [Paragraph("🍚", ParagraphStyle("ve", fontSize=20, leading=24, alignment=TA_CENTER)),
         Paragraph("<b>1 porsi nasi pecel</b> = Rp 10.000", sTableCellLeft),
         Paragraph("→ bisa bayar 8 BULAN! 😱", sTableCell)],
        [Paragraph("🥚", ParagraphStyle("ve", fontSize=20, leading=24, alignment=TA_CENTER)),
         Paragraph("<b>1 butir telur</b> = Rp 2.000", sTableCellLeft),
         Paragraph("→ bisa bayar 1,5 BULAN!", sTableCell)],
        [Paragraph("💧", ParagraphStyle("ve", fontSize=20, leading=24, alignment=TA_CENTER)),
         Paragraph("<b>1 botol air mineral</b> = Rp 5.000", sTableCellLeft),
         Paragraph("→ bisa bayar 4 BULAN!", sTableCell)],
        [Paragraph("🪙", ParagraphStyle("ve", fontSize=20, leading=24, alignment=TA_CENTER)),
         Paragraph("<b>1 koin Rp 1.000</b> = Rp 1.000", sTableCellLeft),
         Paragraph("→ Bayar SEKOLAH 1 HARI!", sTableCell)],
    ]
    vt = Table(visual_data, colWidths=[20*mm, 80*mm, 70*mm])
    vt.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.3, HexColor("#e0e0e0")),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(vt)
    
    story.append(spacer(4))
    
    # Bar chart visual
    story.append(Paragraph("Perbandingan Biaya: AI Generate vs Cetak Manual", sH3))
    
    bar_data = [
        [Paragraph("<b>AI Generate</b>", sTableCellLeft),
         Paragraph("Rp 14.400/thn", sTableCell),
         Paragraph("▓▓░░░░░░░░░░░░░░░░░░ 2%", sTableCellLeft)],
        [Paragraph("<b>Cetak Manual</b>", sTableCellLeft),
         Paragraph("Rp 800.000/thn", sTableCell),
         Paragraph("▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100%", sTableCellLeft)],
    ]
    bt = Table(bar_data, colWidths=[50*mm, 40*mm, 80*mm])
    bt.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HexColor("#e8f5e9")),
        ('BACKGROUND', (0, 1), (-1, 1), HexColor("#ffebee")),
        ('GRID', (0, 0), (-1, -1), 0.3, HexColor("#e0e0e0")),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(bt)
    
    story.append(spacer(2))
    story.append(Paragraph(
        "<b>HEMAT: Rp 785.600 per sekolah per tahun — 98% lebih murah! 🏆</b>",
        ParagraphStyle("highlight", fontName=F["bold"], fontSize=11, leading=15,
                      textColor=C_GREEN, alignment=TA_CENTER, spaceBefore=3*mm, spaceAfter=3*mm)
    ))
    
    story.append(spacer(3))
    story.append(info_box("💬 Kalimat untuk Stakeholder", [
        '"Jangan lihat total Rp 2,96 juta. <b>Lihat per sekolah.</b>"',
        '"Rp 1.233 per sekolah per bulan. Itu <b>setara harga 1 permen per hari.</b>"',
        '"Bandingkan dengan biaya cetak foto manual yang Rp 20.000–50.000 per sekolah per bulan — di sini kita <b>hemat 94%</b>."',
        '"Ini bukan biaya, ini <b>investasi efisiensi.</b> Dan investasinya <b>kembali dalam bulan pertama.</b>"'
    ], C_LIGHT_BG, C_PRIMARY))
    
    story.append(PageBreak())

    # ═══════════════════════════════════════════
    # 4. CARA KERJA SEDERHANA
    # ═══════════════════════════════════════════
    story.append(section_divider("4. Cara Kerja Sederhana", C_TEAL))
    story.append(spacer(3))
    
    story.append(Paragraph("Ilustrasi 3 Langkah", sH2))
    
    # 3 steps boxes
    step_data = [[
        Paragraph("<b>LANGKAH 1</b>", ParagraphStyle("st1", fontName=F["bold"], fontSize=11,
                   leading=15, textColor=white, alignment=TA_CENTER)),
        Paragraph("<b>LANGKAH 2</b>", ParagraphStyle("st2", fontName=F["bold"], fontSize=11,
                   leading=15, textColor=white, alignment=TA_CENTER)),
        Paragraph("<b>LANGKAH 3</b>", ParagraphStyle("st3", fontName=F["bold"], fontSize=11,
                   leading=15, textColor=white, alignment=TA_CENTER)),
    ], [
        Paragraph("👤 UPLOAD FOTO<br/>Operator upload foto selfie<br/>(cukup 1x saja)<br/><b>💰 GRATIS</b>",
                  ParagraphStyle("s1c", fontName=F["regular"], fontSize=9, leading=13,
                                textColor=C_GRAY, alignment=TA_CENTER)),
        Paragraph("🎯 PILIH KEGIATAN<br/>☑ Rapat Guru<br/>☑ Serah Terima ATK<br/>☑ Makan Minum<br/>☑ Pemeliharaan",
                  ParagraphStyle("s2c", fontName=F["regular"], fontSize=9, leading=13,
                                textColor=C_GRAY, alignment=TA_CENTER)),
        Paragraph("✨ HASIL FOTO<br/>AI generate foto dokumentasi<br/>realistis dengan wajah<br/>operator di scene kegiatan!<br/><b>💰 ~Rp 120/foto</b>",
                  ParagraphStyle("s3c", fontName=F["regular"], fontSize=9, leading=13,
                                textColor=C_GRAY, alignment=TA_CENTER)),
    ], [
        Paragraph("", ParagraphStyle("sp", fontSize=6, leading=8)),
        Paragraph("<b>⏱️ 2–5 MENIT!</b>", ParagraphStyle("stime", fontName=F["bold"], fontSize=10,
                   leading=14, textColor=C_GREEN, alignment=TA_CENTER)),
        Paragraph("", ParagraphStyle("sp", fontSize=6, leading=8)),
    ]]
    
    st = Table(step_data, colWidths=[56*mm, 56*mm, 56*mm])
    st.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), C_PRIMARY),
        ('BACKGROUND', (1, 0), (1, 0), C_PURPLE),
        ('BACKGROUND', (2, 0), (2, 0), C_TEAL),
        ('BACKGROUND', (0, 1), (0, 1), C_LIGHT_BG),
        ('BACKGROUND', (1, 1), (1, 1), C_LIGHT_PURPLE),
        ('BACKGROUND', (2, 1), (2, 1), C_LIGHT_GREEN),
        ('BACKGROUND', (0, 2), (-1, 2), white),
        ('BOX', (0, 0), (-1, -1), 1, HexColor("#e0e0e0")),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(st)
    
    story.append(PageBreak())

    # ═══════════════════════════════════════════
    # 5. WALKTHROUGH 3 FASE
    # ═══════════════════════════════════════════
    story.append(section_divider("5. Walkthrough: 3 Fase Utama", C_PURPLE))
    story.append(spacer(3))
    
    story.append(Paragraph(
        "Berikut adalah gambaran keseluruhan alur fitur generate foto dokumentasi — dari awal sampai akhir. Ada 3 fase besar.",
        sBody
    ))
    story.append(spacer(4))
    
    # FASE 1
    story.append(phase_box("1", "SETUP DATA SEKOLAH", C_PRIMARY, [
        "Upload foto personel: Guru, Kepala Sekolah, Pengawas (cukup 1x)",
        "Upload foto referensi ruangan: ruang rapat, ruang guru (opsional)",
        "Semua tersimpan di database — bisa dipakai berulang kali",
        "Training AI (LoRA) untuk wajah operator — GRATIS"
    ], "Rp 0 — GRATIS"))
    
    story.append(spacer(3))
    
    # FASE 2
    story.append(phase_box("2", "GENERATE FOTO", C_PURPLE, [
        "Pilih Kegiatan: Rapat, MAMIN, ATK, atau Pemeliharaan",
        "Pilih Pakaian: Formal, Batik, Casual, atau Seragam",
        "Pilih Suasana: Ruang Rapat, Outdoor, Aula, atau Kantor",
        "Pilih Orang yang Hadir: Centang nama guru dari daftar",
        "Klik GENERATE — tunggu 5-15 detik, hasil siap!"
    ], "~Rp 120 per foto"))
    
    story.append(spacer(3))
    
    # FASE 3
    story.append(phase_box("3", "OUTPUT & DOWNLOAD", C_GREEN, [
        "Preview hasil — kalau tidak sesuai, bisa generate ulang (gratis)",
        "Tampilan A4 siap cetak dengan kop surat & tanda tangan",
        "Download JPG/PNG — unlimited, gratis",
        "Cetak langsung atau Save PDF — pakai kertas HVS biasa"
    ], "Rp 0 — GRATIS"))
    
    story.append(spacer(5))
    
    # Total summary
    story.append(section_divider("TOTAL BIAYA KESELURUHAN", C_GOLD))
    story.append(spacer(3))
    
    total_summary = [
        [Paragraph("<b>Fase</b>", sTableHeader),
         Paragraph("<b>Biaya</b>", sTableHeader),
         Paragraph("<b>Keterangan</b>", sTableHeader)],
        [Paragraph("🔵 Fase 1: Setup", sTableCell),
         Paragraph("Rp 0 🆓", sTableCellBold),
         Paragraph("Upload foto, training AI", sTableCellLeft)],
        [Paragraph("🟣 Fase 2: Generate", sTableCell),
         Paragraph("Rp 2.880.000", sTableCellBold),
         Paragraph("Sewa VPS GPU 1 tahun", sTableCellLeft)],
        [Paragraph("🟢 Fase 3: Output", sTableCell),
         Paragraph("Rp 0 🆓", sTableCellBold),
         Paragraph("Download & cetak", sTableCellLeft)],
        [Paragraph("⚙️ Setup awal (sekali)", sTableCell),
         Paragraph("Rp 80.000", sTableCellBold),
         Paragraph("Konfigurasi awal VPS", sTableCellLeft)],
    ]
    ts = Table(total_summary, colWidths=[55*mm, 45*mm, 70*mm])
    ts.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), C_PRIMARY),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor("#e0e0e0")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, C_LIGHT_GRAY]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(ts)
    
    story.append(spacer(3))
    
    # Grand total
    grand_data = [
        [Paragraph("<b>TOTAL TAHUN PERTAMA</b>", ParagraphStyle("gt1", fontName=F["bold"],
                    fontSize=13, leading=18, textColor=white, alignment=TA_CENTER)),
         Paragraph("<b>Rp 2.960.000</b>", ParagraphStyle("gt2", fontName=F["bold"],
                    fontSize=13, leading=18, textColor=C_GOLD, alignment=TA_CENTER))],
        [Paragraph("<b>TAHUN KEDUA & SETERUSNYA</b>", ParagraphStyle("gt3",
                    fontName=F["bold"], fontSize=13, leading=18, textColor=white, alignment=TA_CENTER)),
         Paragraph("<b>Rp 2.880.000</b>", ParagraphStyle("gt4", fontName=F["bold"],
                    fontSize=13, leading=18, textColor=C_GOLD, alignment=TA_CENTER))],
        [Paragraph("<b>PER SEKOLAH/BULAN</b>", ParagraphStyle("gt5",
                    fontName=F["bold"], fontSize=13, leading=18, textColor=white, alignment=TA_CENTER)),
         Paragraph("<b>Rp 1.233</b>", ParagraphStyle("gt6", fontName=F["bold"],
                    fontSize=13, leading=18, textColor=C_GOLD, alignment=TA_CENTER))],
        [Paragraph("<b>PER FOTO</b>", ParagraphStyle("gt7",
                    fontName=F["bold"], fontSize=13, leading=18, textColor=white, alignment=TA_CENTER)),
         Paragraph("<b>~Rp 120</b>", ParagraphStyle("gt8", fontName=F["bold"],
                    fontSize=13, leading=18, textColor=C_GOLD, alignment=TA_CENTER))],
    ]
    gt = Table(grand_data, colWidths=[100*mm, 70*mm])
    gt.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), C_PRIMARY),
        ('BOX', (0, 0), (-1, -1), 2, C_GOLD),
        ('GRID', (0, 0), (-1, -1), 0.3, HexColor("#3949ab")),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(gt)
    
    story.append(PageBreak())

    # ═══════════════════════════════════════════
    # 6. PERBANDINGAN MANUAL VS AI
    # ═══════════════════════════════════════════
    story.append(section_divider("6. Perbandingan: Manual vs AI Generate", C_TEAL))
    story.append(spacer(3))
    
    story.append(make_table(
        ["Aspek", "Manual (Cetak/Foto Real)", "AI Generate"],
        [
            ["Biaya langsung", "Rp 400.000–1.200.000", "~Rp 14.000 ✅"],
            ["Waktu per kegiatan", "30–60 menit", "2–5 menit ✅"],
            ["Kualitas foto", "Tergantung HP & cuaca", "Studio quality ✅"],
            ["Risiko cuaca", "❌ Hujan → tidak bisa foto", "✅ Generate kapan saja"],
            ["Risiko lupa", "❌ Lupa foto → tidak ada bukti", "✅ Generate kapan saja"],
            ["Keahlian", "Butuh edit Canva/Photoshop", "✅ Tidak perlu keahlian"],
            ["Siap pakai", "Perlu crop, edit, tempel", "✅ Siap download langsung"],
            ["Revisi", "❌ Harus foto ulang", "✅ Generate ulang 2 menit"],
            ["Biaya per foto", "Rp 2.000–5.000", "~Rp 120 ✅"],
        ],
        [45*mm, 62*mm, 62*mm]
    ))
    
    story.append(spacer(4))
    
    # Winner box
    winner_data = [
        [Paragraph("🏆 <b>HEMAT BIAYA: ~96% LEBIH MURAH!</b>", ParagraphStyle("w1",
                    fontName=F["bold"], fontSize=14, leading=18, textColor=white, alignment=TA_CENTER)),
         Paragraph("🏆 <b>HEMAT WAKTU: ~90% LEBIH CEPAT!</b>", ParagraphStyle("w2",
                    fontName=F["bold"], fontSize=14, leading=18, textColor=white, alignment=TA_CENTER))],
    ]
    wt = Table(winner_data, colWidths=[85*mm, 85*mm])
    wt.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), C_GREEN),
        ('BACKGROUND', (1, 0), (1, 0), C_TEAL),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(wt)
    
    story.append(PageBreak())

    # ═══════════════════════════════════════════
    # 7. MENGAPA VPS
    # ═══════════════════════════════════════════
    story.append(section_divider("7. Mengapa Perlu Hosting Sendiri (VPS)?", C_ORANGE))
    story.append(spacer(3))
    
    story.append(info_box("💡 Analogi Sederhana", [
        '<b>Bayangkan VPS AI ini seperti menyewa MESIN FOTOCOPY untuk kantor,</b>',
        'bukan bayar per lembar ke rental.',
        '',
        'Sewa mesin fotocopy: Rp 1 juta/bulan → cetak UNLIMITED',
        'Bayar per lembar: Rp 100/lembar → makin banyak cetak, makin mahal'
    ], C_LIGHT_GOLD, C_ORANGE))
    
    story.append(spacer(4))
    
    story.append(Paragraph("Tiga Alternatif — Mana Paling Hemat?", sH2))
    
    story.append(make_table(
        ["Alternatif", "Cara Kerja", "Biaya/Tahun (200 sekolah)", "Cocok untuk?"],
        [
            ["🏆 VPS SENDIRI", "Sewa GPU flat rate", "~Rp 2,9 Juta ✅", "Skala menengah-besar"],
            ["🥈 Bayar per Foto", "Rp 240/gambar", "~Rp 11,5 Juta ⚠️", "Skala kecil <50 sekolah"],
            ["🥉 Bayar per Foto + LoRA", "Termasuk training AI", "~Rp 23 Juta ❌", "Tidak direkomendasikan"],
        ],
        [35*mm, 40*mm, 45*mm, 50*mm]
    ))
    
    story.append(spacer(4))
    
    story.append(Paragraph("Kenapa VPS Sendiri Paling Murah?", sH2))
    
    calc_data = [
        [Paragraph("<b>Bayar per Foto</b>", ParagraphStyle("c1", fontName=F["bold"], fontSize=10,
                    leading=14, textColor=C_RED, alignment=TA_CENTER)),
         Paragraph("<b>VPS Sendiri</b>", ParagraphStyle("c2", fontName=F["bold"], fontSize=10,
                    leading=14, textColor=C_GREEN, alignment=TA_CENTER))],
        [Paragraph("Rp 240 x 24.000 = Rp 5,7 Juta/tahun", sTableCell),
         Paragraph("Rp 240.000/bulan = Rp 2,9 Juta/tahun", sTableCell)],
        [Paragraph("+ Biaya training AI Rp 3,2 Juta", sTableCell),
         Paragraph("+ Training AI GRATIS", sTableCell)],
        [Paragraph("<b>TOTAL: ~Rp 9 Juta</b>", ParagraphStyle("c3", fontName=F["bold"], fontSize=10,
                    leading=14, textColor=C_RED, alignment=TA_CENTER)),
         Paragraph("<b>TOTAL: ~Rp 2,9 Juta — HEMAT ~68%! 🎉</b>", ParagraphStyle("c4",
                    fontName=F["bold"], fontSize=10, leading=14, textColor=C_GREEN, alignment=TA_CENTER))],
    ]
    ct = Table(calc_data, colWidths=[85*mm, 85*mm])
    ct.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), HexColor("#ffebee")),
        ('BACKGROUND', (1, 0), (1, 0), HexColor("#e8f5e9")),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor("#e0e0e0")),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(ct)
    
    story.append(spacer(4))
    
    story.append(info_box("✅ VPS Ini Bisa Dipakai untuk Generate Kapan Saja", [
        "Dengan VPS sendiri, Anda punya MESIN AI sendiri:",
        "  ✅ Generate foto UNLIMITED — tidak ada batasan",
        "  ✅ Tidak ada biaya tambahan — flat per bulan",
        "  ✅ Bisa generate foto SEBANYAK mungkin",
        "  ✅ Kapan saja — malam, weekend, libur",
        "",
        "Seperti punya fotografer pribadi yang siap 24 jam.",
        "Tapi Anda hanya bayar 3 jam/hari saat dibutuhkan. 😄"
    ], C_LIGHT_GREEN, C_GREEN))
    
    story.append(PageBreak())

    # ═══════════════════════════════════════════
    # 8. NILAI YANG DIDAPAT
    # ═══════════════════════════════════════════
    story.append(section_divider("8. Nilai yang Didapat vs Biaya", C_GREEN))
    story.append(spacer(3))
    
    story.append(Paragraph("1. Efisiensi Waktu — Nilai Paling Besar", sH2))
    
    story.append(make_table(
        ["Aktivitas", "Manual", "AI Generate", "Hemat Waktu"],
        [
            ["1 kegiatan foto dokumentasi", "45 menit", "3 menit", "42 menit"],
            ["10 kegiatan/bulan/sekolah", "450 menit", "30 menit", "420 menit (7 jam)"],
            ["200 sekolah x 10 kegiatan/bln", "90.000 menit", "6.000 menit", "84.000 menit (1.400 jam)!"],
        ],
        [55*mm, 35*mm, 35*mm, 45*mm]
    ))
    
    story.append(spacer(2))
    story.append(Paragraph(
        "<b>1.400 jam kerja operator per bulan yang bisa dialihkan ke tugas lain!</b>",
        ParagraphStyle("he", fontName=F["bold"], fontSize=11, leading=15,
                      textColor=C_GREEN, alignment=TA_CENTER, spaceBefore=3*mm, spaceAfter=3*mm)
    ))
    story.append(Paragraph(
        "Setara dengan 10 operator full-time yang tidak perlu direkrut.",
        sBody
    ))
    
    story.append(spacer(4))
    
    story.append(Paragraph("2. Kualitas Dokumen", sH2))
    
    story.append(comparison_box(
        ["❌ Foto HP kadang buram, tidak jelas",
         "❌ Pencahayaan tidak merata",
         "❌ Wajah tidak keliatan jelas",
         "❌ Background berantakan",
         "❌ Verifikator sering komplain"],
        ["✅ Foto studio quality, konsisten",
         "✅ Natural lighting, professional",
         "✅ Wajah jelas, ekspresi natural",
         "✅ Scene rapi, sesuai kegiatan",
         "✅ Dokumen rapi, lolos verifikasi"],
        "SEBELUM (Manual)", "SESUDAH (AI Generate)",
        C_RED, C_GREEN
    ))
    
    story.append(spacer(4))
    
    story.append(Paragraph("3. Risiko Minimal", sH2))
    
    story.append(make_table(
        ["Risiko", "Dampak", "AI Generate Solusinya"],
        [
            ["Lupa foto kegiatan", "❌ LPJ tidak lengkap", "✅ Generate kapan saja"],
            ["Cuaca buruk", "❌ Tidak bisa outdoor", "✅ Generate scene apapun"],
            ["Fotografer tidak hadir", "❌ Tidak ada dokumentasi", "✅ Cukup operator punya selfie"],
            ["Kamera rusak/HP lowbat", "❌ Dokumentasi gagal", "✅ Cukup upload dari gallery"],
            ["Waktu mepet", "❌ Dokumen asal-asalan", "✅ Generate 3 menit, berkualitas"],
        ],
        [50*mm, 55*mm, 65*mm]
    ))
    
    story.append(spacer(5))
    
    # Big value box
    value_data = [
        [Paragraph("🎯 <b>APA YANG ANDA DAPATKAN DENGAN Rp 2,96 JUTA/TAHUN</b>",
                   ParagraphStyle("vt", fontName=F["bold"], fontSize=13, leading=17,
                                 textColor=white, alignment=TA_CENTER))],
        [Paragraph(
            "✅ 200 sekolah terbantu penyusunan LPJ<br/>"
            "✅ 1.400 jam kerja operator per bulan dihemat<br/>"
            "✅ 24.000 foto dokumentasi berkualitas siap pakai<br/>"
            "✅ Kepatuhan LPJ meningkat drastis<br/>"
            "✅ Verifikator lebih jarang komplain<br/>"
            "✅ Tidak perlu rekrut fotografer/operator tambahan<br/>"
            "✅ Tidak perlu beli kamera/GPU mahal<br/>"
            "<br/>"
            "<b>💰 Rp 1.233/sekolah/bulan — setara 1 porsi nasi pecel 🍚</b>",
            ParagraphStyle("vc", fontName=F["regular"], fontSize=10, leading=15,
                          textColor=white, alignment=TA_CENTER)
        )],
    ]
    vt2 = Table(value_data, colWidths=[170*mm])
    vt2.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), C_PRIMARY),
        ('BOX', (0, 0), (-1, -1), 3, C_GOLD),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('LINEAFTER', (0, 0), (0, 0), 2, C_GOLD),
    ]))
    story.append(vt2)
    
    story.append(PageBreak())

    # ═══════════════════════════════════════════
    # 9. Q&A
    # ═══════════════════════════════════════════
    story.append(section_divider("9. Q&A untuk Stakeholder", C_ACCENT))
    story.append(spacer(3))
    
    qa_pairs = [
        ("Q1: Kenapa tidak pakai HP saja, gratis?",
         "Boleh saja. Tapi realitanya: banyak operator lupa/tidak sempat foto, hasil foto HP sering kurang layak untuk LPJ (burem, gelap), kalau hujan tidak bisa foto outdoor. AI Generate ini sebagai CADANGAN SUPER — ketika kondisi tidak memungkinkan foto manual, operator tetap bisa menghasilkan dokumentasi yang rapi. Biayanya? Cuma Rp 120 per foto — lebih murah dari cetak 1 lembar foto (Rp 2.000–5.000)."),
        
        ("Q2: Apakah ini tidak menambah beban kerja operator?",
         "Justru sebaliknya — MENGURANGI beban kerja secara drastis! Dari 30-60 menit per kegiatan → cukup 2-5 menit. Tidak perlu edit Canva, tidak perlu cetak, tidak perlu tempel. Operator cukup: upload selfie → pilih kegiatan → download → selesai!"),
        
        ("Q3: Hasil generate AI apakah terlihat palsu?",
         "Teknologi Flux Pro (model AI terbaik 2026) menghasilkan foto yang sangat realistis — sulit dibedakan dengan foto asli oleh mata telanjang. Dengan training LoRA (5-10 foto selfie), wajah operator tertanam secara natural di scene kegiatan. Kualitasnya lebih baik dari foto HP kebanyakan."),
        
        ("Q4: Mengapa tidak pakai aplikasi gratis (Canva) saja?",
         "Aplikasi gratis hanya bisa EDIT foto yang SUDAH ADA. Tidak bisa membuat foto kegiatan yang TIDAK PERNAH difoto. Canva = Edit foto yang sudah ada. AI Generate = Membuat foto BARU dari awal. Kalau operator lupa foto rapat, Canva TIDAK BISA membantu. AI Generate BISA."),
        
        ("Q5: Apakah data operator aman?",
         "100% aman. Foto wajah hanya diproses untuk generate dokumentasi. Hasil generate hanya 1x download — tidak disimpan di database. Tidak ada foto yang tersimpan permanen di server. Koneksi terenkripsi (HTTPS). VPS milik kita sendiri, bukan publik. Privasi operator tetap terjaga."),
        
        ("Q6: Kapan balik modal?",
         "SEJAK BULAN PERTAMA! 🚀 Investasi VPS 1 tahun: Rp 2.960.000. Dibandingkan cetak manual: Rp 800.000 x 200 sekolah = Rp 160.000.000. Penghematan per tahun: Rp 157.040.000. Karena biaya VPS per bulan (Rp 240.000) sudah jauh lebih murah dari biaya cetak manual per sekolah per bulan (Rp 8.000-25.000)."),
    ]
    
    for q, a in qa_pairs:
        qa_data = [
            [Paragraph(f"<b>{q}</b>", ParagraphStyle("qq", fontName=F["bold"], fontSize=10,
                        leading=14, textColor=C_PRIMARY))],
            [Paragraph(a, ParagraphStyle("qa", fontName=F["regular"], fontSize=9, leading=13,
                        textColor=C_GRAY))],
        ]
        qa_table = Table(qa_data, colWidths=[170*mm])
        qa_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, 0), C_LIGHT_BG),
            ('BOX', (0, 0), (-1, -1), 0.5, HexColor("#c5cae9")),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(qa_table)
        story.append(spacer(2))
    
    story.append(PageBreak())

    # ═══════════════════════════════════════════
    # 10. CLOSING
    # ═══════════════════════════════════════════
    story.append(section_divider("10. Closing Statement", C_PRIMARY))
    story.append(spacer(5))
    
    closing_data = [
        [Paragraph(
            "Jadi, dengan fitur ini:<br/><br/>"
            "✅ Operator cukup <b>upload selfie 1x</b>, lalu <b>tinggal pilih-pilih</b> setiap kali butuh foto dokumentasi.<br/>"
            "✅ <b>5-15 detik</b> — foto dokumentasi siap pakai, kualitas profesional.<br/>"
            "✅ <b>Tidak perlu cetak foto mahal</b>, tidak perlu edit Canva, tidak perlu khawatir cuaca atau lupa foto.<br/>"
            "✅ <b>Biaya Rp 1.233/sekolah/bulan</b> — setara 1 porsi nasi pecel.<br/><br/>"
            "Yang penting: <b>BUKAN menggantikan foto manual.</b> Ini CADANGAN SUPER ketika kondisi tidak memungkinkan foto manual. Operator tetap bisa foto pakai HP — dan kalau hasilnya kurang memadai, tinggal generate AI dalam 3 menit.<br/><br/>"
            "<b>Dengan investasi Rp 2,96 juta per tahun — atau setara biaya 4 porsi nasi pecel per sekolah per tahun — kita bisa membantu 200 sekolah menyusun LPJ lebih rapi, lebih cepat, dan lebih profesional.</b> 😊",
            ParagraphStyle("closing", fontName=F["regular"], fontSize=12, leading=18,
                          textColor=C_GRAY, alignment=TA_CENTER)
        )],
    ]
    ct2 = Table(closing_data, colWidths=[160*mm])
    ct2.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), C_LIGHT_BG),
        ('BOX', (0, 0), (-1, -1), 2, C_PRIMARY),
        ('LINEAFTER', (0, 0), (0, 0), 4, C_GOLD),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
    ]))
    story.append(ct2)
    
    story.append(spacer(10))
    
    # Thank you
    thanks_data = [
        [Paragraph("<b>Terima Kasih</b>", ParagraphStyle("ty", fontName=F["bold"], fontSize=18,
                    leading=24, textColor=C_PRIMARY, alignment=TA_CENTER))],
        [Paragraph("Siap untuk diskusi dan tanya jawab", ParagraphStyle("ty2",
                    fontName=F["italic"], fontSize=12, leading=16, textColor=C_GRAY, alignment=TA_CENTER))],
        [Paragraph("SPJ App | SD Negeri Pasirhalang | 26 Juli 2026", ParagraphStyle("ty3",
                    fontName=F["regular"], fontSize=10, leading=14, textColor=HexColor("#9e9e9e"),
                    alignment=TA_CENTER))],
    ]
    tht = Table(thanks_data, colWidths=[170*mm])
    tht.setStyle(TableStyle([
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(tht)
    
    # ─── Build PDF ───
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print(f"✅ PDF berhasil dibuat: {OUTPUT_PATH}")
    print(f"   Buka file untuk melihat hasilnya.")

if __name__ == "__main__":
    build_pdf()