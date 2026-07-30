#!/usr/bin/env python3
"""
Generate Professional PDF for Stakeholder Pitch
Fitur AI Generate Foto Dokumentasi LPJ
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, KeepTogether, Image
)
from reportlab.pdfgen import canvas
from reportlab.lib import colors
import os

# Colors
PRIMARY_BLUE = HexColor('#1e40af')
SECONDARY_BLUE = HexColor('#3b82f6')
LIGHT_BLUE = HexColor('#dbeafe')
SUCCESS_GREEN = HexColor('#10b981')
LIGHT_GREEN = HexColor('#dcfce7')
WARNING_ORANGE = HexColor('#f59e0b')
LIGHT_ORANGE = HexColor('#fef3c7')
DANGER_RED = HexColor('#ef4444')
LIGHT_RED = HexColor('#fee2e2')
PURPLE = HexColor('#8b5cf6')
LIGHT_PURPLE = HexColor('#f3e8ff')
DARK_GRAY = HexColor('#1f2937')
MEDIUM_GRAY = HexColor('#6b7280')
LIGHT_GRAY = HexColor('#f3f4f6')

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        canvas.Canvas.__init__(self, *args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_count):
        self.setFont("Helvetica", 9)
        self.setFillColor(MEDIUM_GRAY)
        page_num = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(200*mm, 15*mm, page_num)
        self.drawString(20*mm, 15*mm, "SPJ App - Confidential")

def create_styles():
    styles = getSampleStyleSheet()
    
    # Custom styles
    styles.add(ParagraphStyle(
        name='CoverTitle',
        parent=styles['Title'],
        fontSize=28,
        leading=34,
        textColor=PRIMARY_BLUE,
        spaceAfter=6,
        alignment=TA_CENTER,
    ))
    
    styles.add(ParagraphStyle(
        name='CoverSubtitle',
        parent=styles['Normal'],
        fontSize=14,
        leading=18,
        textColor=MEDIUM_GRAY,
        spaceAfter=20,
        alignment=TA_CENTER,
    ))
    
    styles.add(ParagraphStyle(
        name='SectionHeader',
        parent=styles['Heading1'],
        fontSize=18,
        leading=22,
        textColor=PRIMARY_BLUE,
        spaceBefore=20,
        spaceAfter=12,
        borderPadding=8,
    ))
    
    styles.add(ParagraphStyle(
        name='SubSectionHeader',
        parent=styles['Heading2'],
        fontSize=14,
        leading=18,
        textColor=SECONDARY_BLUE,
        spaceBefore=14,
        spaceAfter=8,
    ))
    
    styles.add(ParagraphStyle(
        name='BodyText',
        parent=styles['Normal'],
        fontSize=11,
        leading=15,
        textColor=DARK_GRAY,
        spaceAfter=8,
        alignment=TA_JUSTIFY,
    ))
    
    styles.add(ParagraphStyle(
        name='HighlightBox',
        parent=styles['Normal'],
        fontSize=12,
        leading=16,
        textColor=PRIMARY_BLUE,
        backColor=LIGHT_BLUE,
        borderPadding=12,
        spaceAfter=12,
        spaceBefore=12,
    ))
    
    styles.add(ParagraphStyle(
        name='SuccessBox',
        parent=styles['Normal'],
        fontSize=12,
        leading=16,
        textColor=HexColor('#065f46'),
        backColor=LIGHT_GREEN,
        borderPadding=12,
        spaceAfter=12,
        spaceBefore=12,
    ))
    
    styles.add(ParagraphStyle(
        name='WarningBox',
        parent=styles['Normal'],
        fontSize=12,
        leading=16,
        textColor=HexColor('#92400e'),
        backColor=LIGHT_ORANGE,
        borderPadding=12,
        spaceAfter=12,
        spaceBefore=12,
    ))
    
    styles.add(ParagraphStyle(
        name='CostHighlight',
        parent=styles['Normal'],
        fontSize=16,
        leading=20,
        textColor=SUCCESS_GREEN,
        alignment=TA_CENTER,
        spaceBefore=12,
        spaceAfter=12,
    ))
    
    styles.add(ParagraphStyle(
        name='BulletText',
        parent=styles['Normal'],
        fontSize=11,
        leading=15,
        textColor=DARK_GRAY,
        leftIndent=20,
        spaceAfter=4,
    ))
    
    styles.add(ParagraphStyle(
        name='SmallNote',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        textColor=MEDIUM_GRAY,
        spaceAfter=6,
    ))
    
    return styles

def create_cover_page(story, styles):
    """Create professional cover page"""
    story.append(Spacer(1, 60))
    
    # Title
    story.append(Paragraph(
        "PITCH DOKUMENTASI",
        styles['CoverTitle']
    ))
    story.append(Paragraph(
        "Fitur AI Generate Foto Dokumentasi LPJ",
        ParagraphStyle('SubTitle', parent=styles['CoverTitle'], fontSize=20, textColor=SECONDARY_BLUE)
    ))
    
    story.append(Spacer(1, 30))
    
    # Horizontal line
    story.append(HRFlowable(
        width="80%",
        thickness=2,
        color=SECONDARY_BLUE,
        spaceAfter=30,
        spaceBefore=20,
    ))
    
    # Key Info Box
    info_data = [
        ['Untuk:', 'Stakeholder & Project Manager (Non-Teknis)'],
        ['Tujuan:', 'Persetujuan Anggaran'],
        ['Tanggal:', '26 Juli 2026'],
        ['Aplikasi:', 'SPJ App - Sistem Pengelolaan Dokumentasi'],
    ]
    
    info_table = Table(info_data, colWidths=[100, 350])
    info_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('TEXTCOLOR', (0, 0), (0, -1), PRIMARY_BLUE),
        ('TEXTCOLOR', (1, 0), (1, -1), DARK_GRAY),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(info_table)
    
    story.append(Spacer(1, 40))
    
    # Tagline
    story.append(Paragraph(
        "<b>Upload 1x, Generate Berkali-kali, Hemat 96%!</b>",
        ParagraphStyle('Tagline', parent=styles['CostHighlight'], fontSize=18, textColor=SUCCESS_GREEN)
    ))
    
    story.append(Spacer(1, 60))
    
    # Confidential notice
    story.append(Paragraph(
        "<i>Dokumen ini bersifat rahasia dan ditujukan untuk penggunaan internal saja.</i>",
        styles['SmallNote']
    ))
    
    story.append(PageBreak())

def create_table_of_contents(story, styles):
    """Create table of contents"""
    story.append(Paragraph("DAFTAR ISI", styles['SectionHeader']))
    story.append(Spacer(1, 10))
    
    toc_items = [
        ("1.", "Masalah yang Mau Diselesaikan", "3"),
        ("2.", "Solusi Kami (3 Kalimat)", "4"),
        ("3.", "Anggaran yang Dibutuhkan", "5"),
        ("4.", "Cara Kerja Sederhana", "7"),
        ("5.", "Perbandingan Manual vs AI", "8"),
        ("6.", "Mengapa VPS (Hosting Sendiri)?", "9"),
        ("7.", "Nilai yang Didapat vs Biaya", "10"),
        ("8.", "Pertanyaan Umum Stakeholder", "11"),
        ("9.", "Closing Statement", "12"),
    ]
    
    for num, title, page in toc_items:
        toc_data = [[
            Paragraph(f"<b>{num}</b>", styles['BodyText']),
            Paragraph(title, styles['BodyText']),
            Paragraph(page, ParagraphStyle('RightAlign', parent=styles['BodyText'], alignment=TA_RIGHT)),
        ]]
        toc_table = Table(toc_data, colWidths=[30, 380, 40])
        toc_table.setStyle(TableStyle([
            ('LINEBELOW', (0, 0), (-1, 0), 0.5, LIGHT_GRAY),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(toc_table)
    
    story.append(PageBreak())

def create_section_1(story, styles):
    """Section 1: Problems"""
    story.append(Paragraph("1. MASALAH YANG MAU DISELESAIKAN", styles['SectionHeader']))
    
    story.append(Paragraph(
        "<b>Kondisi Saat Ini:</b> Operator sekolah kesulitan menyusun LPJ",
        styles['SubSectionHeader']
    ))
    
    story.append(Paragraph(
        "Setiap kali ada kegiatan (rapat, beli ATK, konsumsi, pemeliharaan), operator harus:",
        styles['BodyText']
    ))
    
    problems = [
        "Foto kegiatan pakai HP - kadang lupa, kadang malu",
        "Edit foto di Canva/Photoshop - butuh keahlian khusus",
        "Cetak foto - biaya Rp 2.000-5.000/lembar",
        "Tempel di LPJ - manual, ribet, memakan waktu",
    ]
    
    for prob in problems:
        story.append(Paragraph(f"  {prob}", styles['BulletText']))
    
    story.append(Spacer(1, 12))
    
    # Impact box
    impact_data = [
        ['DAMPAK', 'ANGKA'],
        ['Waktu per kegiatan', '30-60 MENIT'],
        ['Biaya cetak per sekolah/tahun', 'Rp 400.000 - 1.200.000'],
        ['Risiko', 'Foto jelek, lupa foto, cuaca buruk'],
    ]
    
    impact_table = Table(impact_data, colWidths=[200, 250])
    impact_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), DANGER_RED),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BACKGROUND', (0, 1), (-1, -1), LIGHT_RED),
        ('TEXTCOLOR', (0, 1), (-1, -1), DARK_GRAY),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, white),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
    ]))
    story.append(impact_table)
    
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("<b>Contoh Nyata:</b>", styles['SubSectionHeader']))
    
    examples = [
        "Rapat koordinasi guru, <b>lupa foto bersama</b> -> Tidak ada bukti dokumentasi LPJ",
        "Beli nasi box, <b>foto dari HP burem</b> -> Kena teguran verifikator",
        "Pemeliharaan AC, <b>hujan, tidak bisa foto luar</b> -> Kegiatan tidak terdokumentasi",
    ]
    
    for ex in examples:
        story.append(Paragraph(f"  {ex}", styles['BulletText']))
    
    story.append(PageBreak())

def create_section_2(story, styles):
    """Section 2: Solution"""
    story.append(Paragraph("2. SOLUSI KAMI - DALAM 3 KALIMAT", styles['SectionHeader']))
    
    story.append(Spacer(1, 10))
    
    # Solution boxes
    solutions = [
        ("1", "Operator tinggal upload foto selfie, pilih jenis kegiatan.", LIGHT_BLUE, PRIMARY_BLUE),
        ("2", "AI akan generate foto dokumentasi yang realistis - seolah-olah benar-benar ada foto kegiatan tersebut.", LIGHT_GREEN, SUCCESS_GREEN),
        ("3", "Biaya total Rp 2,96 JUTA/TAHUN untuk 200 sekolah - atau Rp 1.233/SEKOLAH/BULAN.", LIGHT_ORANGE, WARNING_ORANGE),
    ]
    
    for num, text, bg_color, text_color in solutions:
        box_data = [[
            Paragraph(f"<b>{num}</b>", ParagraphStyle('Num', parent=styles['BodyText'], fontSize=24, textColor=text_color, alignment=TA_CENTER)),
            Paragraph(text, styles['BodyText']),
        ]]
        box_table = Table(box_data, colWidths=[50, 400])
        box_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), bg_color),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ('ROUNDEDCORNERS', [8, 8, 8, 8]),
        ]))
        story.append(box_table)
        story.append(Spacer(1, 10))
    
    story.append(PageBreak())

def create_section_3(story, styles):
    """Section 3: Budget"""
    story.append(Paragraph("3. ANGGARAN YANG DIBUTUHKAN", styles['SectionHeader']))
    
    story.append(Paragraph("<b>Angka Kunci:</b>", styles['SubSectionHeader']))
    
    # Key metrics table
    metrics_data = [
        ['JUMLAH SEKOLAH', 'BIAYA PER TAHUN', 'PER SEKOLAH/BULAN', 'SETARA DENGAN'],
        ['200 sekolah', '~Rp 2.960.000', '~Rp 1.233', '1 porsi nasi pecel'],
        ['400 sekolah', '~Rp 5.920.000', '~Rp 1.233', 'Tetap sama!'],
    ]
    
    metrics_table = Table(metrics_data, colWidths=[110, 120, 120, 100])
    metrics_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BACKGROUND', (0, 1), (-1, -1), LIGHT_BLUE),
        ('TEXTCOLOR', (0, 1), (-1, -1), DARK_GRAY),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, white),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(metrics_table)
    
    story.append(Spacer(1, 15))
    
    story.append(Paragraph("<b>Rincian Transparan:</b>", styles['SubSectionHeader']))
    
    budget_data = [
        ['POS ANGGARAN', 'PER BULAN', 'PER TAHUN', 'PENJELASAN'],
        ['Sewa GPU (VPS AI)', '~Rp 240.000', '~Rp 2.880.000', 'Untuk 200 sekolah, GPU dipakai 3 jam/hari'],
        ['Setup awal (sekali)', '-', '~Rp 80.000', 'Setup VPS, sekali seumur pakai'],
        ['Hosting aplikasi', 'GRATIS', 'GRATIS', 'Vercel free tier'],
        ['Training AI (LoRA)', 'GRATIS', 'GRATIS', 'Training wajah operator'],
        ['TOTAL TAHUN PERTAMA', '-', 'Rp 2.960.000', ''],
        ['TOTAL TAHUN KEDUA+', '-', 'Rp 2.880.000', 'Tanpa biaya setup'],
    ]
    
    budget_table = Table(budget_data, colWidths=[120, 90, 100, 140])
    budget_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), SUCCESS_GREEN),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BACKGROUND', (0, 1), (-1, 3), LIGHT_GREEN),
        ('BACKGROUND', (0, 4), (-1, 4), LIGHT_BLUE),
        ('BACKGROUND', (0, 5), (-1, 5), LIGHT_GREEN),
        ('BACKGROUND', (0, 6), (-1, 6), LIGHT_GREEN),
        ('FONTNAME', (0, 5), (-1, 6), 'Helvetica-Bold'),
        ('TEXTCOLOR', (0, 1), (-1, -1), DARK_GRAY),
        ('ALIGN', (1, 0), (2, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, white),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(budget_table)
    
    story.append(Spacer(1, 15))
    
    # Cost per school breakdown
    story.append(Paragraph("<b>Biaya Per Sekolah - Agar Tidak Terlihat Mahal:</b>", styles['SubSectionHeader']))
    
    cost_data = [
        ['METRIK', '200 SEKOLAH', '400 SEKOLAH', '600 SEKOLAH'],
        ['Per SEKOLAH per TAHUN', '~Rp 14.800', '~Rp 14.800', '~Rp 14.800'],
        ['Per SEKOLAH per BULAN', '~Rp 1.233', '~Rp 1.233', '~Rp 1.233'],
        ['Per SEKOLAH per HARI', '~Rp 44', '~Rp 44', '~Rp 44'],
        ['Per FOTO', '~Rp 120', '~Rp 120', '~Rp 120'],
    ]
    
    cost_table = Table(cost_data, colWidths=[140, 100, 100, 100])
    cost_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PURPLE),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BACKGROUND', (0, 1), (-1, -1), LIGHT_PURPLE),
        ('TEXTCOLOR', (0, 1), (-1, -1), DARK_GRAY),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, white),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(cost_table)
    
    story.append(Spacer(1, 12))
    
    # Visual comparison
    story.append(Paragraph(
        "<b>Rp 1.233/bulan/sekolah setara dengan:</b>",
        styles['BodyText']
    ))
    
    comparisons = [
        "1 porsi nasi pecel (Rp 10.000) -> bisa bayar 8 BULAN!",
        "1 butir telur (Rp 2.000) -> bisa bayar 1,5 BULAN!",
        "1 botol air mineral (Rp 5.000) -> bisa bayar 4 BULAN!",
    ]
    
    for comp in comparisons:
        story.append(Paragraph(f"  {comp}", styles['BulletText']))
    
    story.append(PageBreak())

def create_section_4(story, styles):
    """Section 4: How it works"""
    story.append(Paragraph("4. CARA KERJA SEDERHANA", styles['SectionHeader']))
    
    story.append(Paragraph(
        "Proses hanya 3 langkah mudah:",
        styles['BodyText']
    ))
    
    # 3 steps
    steps = [
        ("LANGKAH 1", "UPLOAD FOTO", "Operator upload foto selfie/face\n(cukup 1x saja)\nGRATIS!", LIGHT_BLUE, PRIMARY_BLUE),
        ("LANGKAH 2", "PILIH KEGIATAN", "Pilih jenis:\n- Rapat Guru\n- Serah Terima ATK\n- Makan Minum\n- Pemeliharaan", LIGHT_ORANGE, WARNING_ORANGE),
        ("LANGKAH 3", "HASIL FOTO", "AI generate foto dokumentasi\nrealistis dengan wajah\noperator di scene kegiatan!\n~Rp 120/foto", LIGHT_GREEN, SUCCESS_GREEN),
    ]
    
    steps_table_data = []
    for step_num, step_title, step_desc, bg_color, text_color in steps:
        cell_content = Paragraph(
            f"<b>{step_num}</b><br/><b>{step_title}</b><br/><br/>{step_desc.replace(chr(10), '<br/>')}",
            ParagraphStyle('StepCell', parent=styles['BodyText'], fontSize=10, alignment=TA_CENTER)
        )
        steps_table_data.append([cell_content])
    
    steps_table = Table(steps_table_data, colWidths=[150])
    steps_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), LIGHT_BLUE),
        ('BACKGROUND', (0, 1), (0, 1), LIGHT_ORANGE),
        ('BACKGROUND', (0, 2), (0, 2), LIGHT_GREEN),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 2, white),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
        ('TOPPADDING', (0, 0), (-1, -1), 15),
    ]))
    story.append(steps_table)
    
    story.append(Spacer(1, 15))
    
    story.append(Paragraph(
        "<b>Semua proses: 2-5 MENIT!</b>",
        ParagraphStyle('Highlight', parent=styles['CostHighlight'], fontSize=14)
    ))
    
    story.append(PageBreak())

def create_section_5(story, styles):
    """Section 5: Comparison"""
    story.append(Paragraph("5. PERBANDINGAN: MANUAL VS AI GENERATE", styles['SectionHeader']))
    
    # Comparison table
    comp_data = [
        ['ASPEK', 'MANUAL (CETAK/REAL)', 'AI GENERATE'],
        ['Biaya langsung', 'Rp 400.000-1.200.000', '~Rp 14.000'],
        ['Waktu per kegiatan', '30-60 menit', '2-5 menit'],
        ['Kualitas foto', 'Tergantung HP & cuaca', 'Studio quality, konsisten'],
        ['Risiko cuaca', 'Hujan -> tidak bisa foto', 'Generate kapan saja'],
        ['Risiko lupa', 'Lupa foto -> tidak ada bukti', 'Generate kapan saja'],
        ['Keahlian', 'Butuh edit Canva/Photoshop', 'Tidak perlu keahlian'],
        ['Siap pakai', 'Perlu crop, edit, tempel', 'Siap download langsung'],
        ['Revisi', 'Harus foto ulang', 'Generate ulang 2 menit'],
        ['Biaya per foto', 'Rp 2.000-5.000 (cetak)', '~Rp 120 (AI)'],
        ['HEMAT BIAYA', '-', '~96% LEBIH MURAH!'],
        ['HEMAT WAKTU', '-', '~90% LEBIH CEPAT!'],
    ]
    
    comp_table = Table(comp_data, colWidths=[120, 165, 165])
    comp_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BACKGROUND', (0, 1), (-1, 9), LIGHT_GRAY),
        ('BACKGROUND', (0, 10), (-1, 11), LIGHT_GREEN),
        ('FONTNAME', (0, 10), (-1, 11), 'Helvetica-Bold'),
        ('TEXTCOLOR', (0, 10), (-1, 11), SUCCESS_GREEN),
        ('TEXTCOLOR', (0, 1), (-1, 9), DARK_GRAY),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, white),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(comp_table)
    
    story.append(Spacer(1, 20))
    
    # Visual bar
    story.append(Paragraph("<b>Visual: Biaya per Sekolah per Tahun</b>", styles['SubSectionHeader']))
    story.append(Paragraph(
        "Biaya Manual: Rp 800.000 (batang merah panjang)",
        styles['BodyText']
    ))
    story.append(Paragraph(
        "Biaya AI: Rp 14.400 (batang hijau pendek) - HANYA 2% dari biaya manual!",
        styles['BodyText']
    ))
    story.append(Paragraph(
        "<b>HEMAT: Rp 785.600/SEKOLAH/TAHUN!</b>",
        ParagraphStyle('Highlight', parent=styles['CostHighlight'], textColor=SUCCESS_GREEN)
    ))
    
    story.append(PageBreak())

def create_section_6(story, styles):
    """Section 6: Why VPS"""
    story.append(Paragraph("6. MENGAPA PERLU HOSTING SENDIRI (VPS)?", styles['SectionHeader']))
    
    story.append(Paragraph(
        "<b>Analogi Sederhana:</b> VPS AI ini seperti menyewa MESIN FOTOCOPY untuk kantor, bukan bayar per lembar ke rental.",
        styles['HighlightBox']
    ))
    
    story.append(Spacer(1, 10))
    
    # Comparison table
    vps_data = [
        ['ALTERNATIF', 'CARA KERJA', 'BIAYA/TAHUN', 'COCOK UNTUK?'],
        ['VPS SENDIRI', 'Sewa GPU flat rate, unlimited', '~Rp 2,9 Juta', 'Skala menengah-besar'],
        ['Bayar per Foto', 'Bayar Rp 240/gambar', '~Rp 11,5 Juta', 'Skala kecil <50'],
        ['Bayar per Foto + LoRA', 'Termasuk training AI', '~Rp 23 Juta', 'Tidak direkomendasikan'],
    ]
    
    vps_table = Table(vps_data, colWidths=[110, 130, 100, 110])
    vps_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BACKGROUND', (0, 1), (-1, 1), LIGHT_GREEN),
        ('FONTNAME', (0, 1), (0, 1), 'Helvetica-Bold'),
        ('BACKGROUND', (0, 2), (-1, 3), LIGHT_GRAY),
        ('TEXTCOLOR', (0, 1), (-1, -1), DARK_GRAY),
        ('ALIGN', (2, 0), (2, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, white),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(vps_table)
    
    story.append(Spacer(1, 15))
    
    story.append(Paragraph(
        "<b>Kenapa VPS Sendiri Paling Murah?</b>",
        styles['SubSectionHeader']
    ))
    
    story.append(Paragraph(
        "200 sekolah x 10 foto/bulan = 2.000 foto/bulan = 24.000 foto/tahun",
        styles['BodyText']
    ))
    
    compare_data = [
        ['', 'BAYAR PER FOTO', 'VPS SENDIRI'],
        ['Perhitungan', 'Rp 240 x 24.000 = Rp 5,7 Juta', 'Rp 240.000/bulan = Rp 2,9 Juta'],
        ['Training AI', 'Rp 3,2 Juta tambahan', 'GRATIS'],
        ['TOTAL', '~Rp 9 Juta', '~Rp 2,9 Juta'],
        ['HEMAT', '-', '68% LEBIH MURAH!'],
    ]
    
    compare_table = Table(compare_data, colWidths=[100, 175, 175])
    compare_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), WARNING_ORANGE),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BACKGROUND', (1, 1), (1, 3), LIGHT_RED),
        ('BACKGROUND', (2, 1), (2, 4), LIGHT_GREEN),
        ('FONTNAME', (0, 4), (-1, 4), 'Helvetica-Bold'),
        ('TEXTCOLOR', (0, 4), (-1, 4), SUCCESS_GREEN),
        ('TEXTCOLOR', (0, 1), (-1, 3), DARK_GRAY),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, white),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(compare_table)
    
    story.append(Spacer(1, 15))
    
    story.append(Paragraph(
        "<b>Keunggulan VPS Sendiri:</b>",
        styles['SubSectionHeader']
    ))
    
    benefits = [
        "Generate foto UNLIMITED - tidak ada batasan",
        "Tidak ada biaya tambahan - flat per bulan",
        "Bisa generate foto SEBANYAK mungkin, kapan saja",
        "Seperti punya fotografer pribadi siap 24 jam",
    ]
    
    for ben in benefits:
        story.append(Paragraph(f"  {ben}", styles['BulletText']))
    
    story.append(PageBreak())

def create_section_7(story, styles):
    """Section 7: Value vs Cost"""
    story.append(Paragraph("7. NILAI YANG DIDAPAT VS BIAYA", styles['SectionHeader']))
    
    story.append(Paragraph("<b>1. Efisiensi Waktu - Nilai Paling Besar</b>", styles['SubSectionHeader']))
    
    time_data = [
        ['AKTIVITAS', 'MANUAL', 'AI GENERATE', 'HEMAT WAKTU'],
        ['1 kegiatan dokumentasi', '45 menit', '3 menit', '42 menit'],
        ['10 kegiatan/bulan/sekolah', '450 menit', '30 menit', '420 menit (7 jam)'],
        ['200 sekolah x 10 kegiatan', '90.000 menit', '6.000 menit', '84.000 menit (1.400 jam)!'],
    ]
    
    time_table = Table(time_data, colWidths=[140, 90, 90, 130])
    time_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BACKGROUND', (0, 1), (-1, -1), LIGHT_BLUE),
        ('BACKGROUND', (3, 1), (3, -1), LIGHT_GREEN),
        ('FONTNAME', (3, 1), (3, -1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (0, 1), (-1, -1), DARK_GRAY),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, white),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(time_table)
    
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "<b>1.400 jam kerja operator per bulan yang bisa dialihkan ke tugas lain!</b>",
        ParagraphStyle('Highlight', parent=styles['CostHighlight'], fontSize=13)
    ))
    
    story.append(Spacer(1, 15))
    
    story.append(Paragraph("<b>2. Kualitas Dokumen</b>", styles['SubSectionHeader']))
    
    quality_data = [
        ['SEBELUM (MANUAL)', 'SESUDAH (AI GENERATE)'],
        ['Foto HP kadang buram, tidak jelas', 'Foto studio quality, konsisten'],
        ['Pencahayaan tidak merata', 'Natural lighting, professional'],
        ['Wajah tidak keliatan jelas', 'Wajah jelas, ekspresi natural'],
        ['Background berantakan', 'Scene rapi, sesuai kegiatan'],
        ['Verifikator sering komplain', 'Dokumen rapi, lolos verifikasi'],
    ]
    
    quality_table = Table(quality_data, colWidths=[225, 225])
    quality_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), WARNING_ORANGE),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BACKGROUND', (0, 1), (0, -1), LIGHT_RED),
        ('BACKGROUND', (1, 1), (1, -1), LIGHT_GREEN),
        ('TEXTCOLOR', (0, 1), (-1, -1), DARK_GRAY),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, white),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(quality_table)
    
    story.append(Spacer(1, 15))
    
    story.append(Paragraph("<b>3. Risiko Minimal</b>", styles['SubSectionHeader']))
    
    risk_data = [
        ['RISIKO', 'DAMPAK', 'AI SOLUSINYA'],
        ['Lupa foto kegiatan', 'LPJ tidak lengkap', 'Generate kapan saja'],
        ['Cuaca buruk', 'Tidak bisa dokumentasi', 'Generate scene apapun'],
        ['Fotografer tidak hadir', 'Tidak ada dokumentasi', 'Cukup operator selfie'],
        ['Kamera rusak/HP lowbat', 'Dokumentasi gagal', 'Upload dari gallery'],
        ['Waktu mepet', 'Dokumen asal-asalan', 'Generate 3 menit'],
    ]
    
    risk_table = Table(risk_data, colWidths=[130, 150, 170])
    risk_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), DANGER_RED),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BACKGROUND', (1, 1), (1, -1), LIGHT_RED),
        ('BACKGROUND', (2, 1), (2, -1), LIGHT_GREEN),
        ('TEXTCOLOR', (0, 1), (-1, -1), DARK_GRAY),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, white),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(risk_table)
    
    story.append(Spacer(1, 15))
    
    # Big picture box
    story.append(Paragraph(
        "<b>APA YANG ANDA DAPATKAN DENGAN Rp 2,96 JUTA/TAHUN:</b><br/><br/>"
        "- 200 sekolah terbantu penyusunan LPJ<br/>"
        "- 1.400 jam kerja operator per bulan dihemat<br/>"
        "- 24.000 foto dokumentasi berkualitas siap pakai<br/>"
        "- Kepatuhan LPJ meningkat drastis<br/>"
        "- Verifikator lebih jarang komplain<br/>"
        "- Tidak perlu rekrut fotografer/operator tambahan<br/><br/>"
        "<b>Rp 1.233/sekolah/bulan - setara 1 porsi nasi pecel!</b>",
        styles['SuccessBox']
    ))
    
    story.append(PageBreak())

def create_section_8(story, styles):
    """Section 8: FAQ"""
    story.append(Paragraph("8. PERTANYAAN UMUM STAKEHOLDER", styles['SectionHeader']))
    
    faqs = [
        ("Q1: Kenapa tidak pakai HP saja, gratis?",
         "AI Generate ini sebagai CADANGAN SUPER - ketika kondisi tidak memungkinkan foto manual. Biayanya? Cuma Rp 120 per foto - lebih murah dari cetak 1 lembar foto (Rp 2.000-5.000)."),
        
        ("Q2: Apakah ini menambah beban kerja operator?",
         "Justru sebaliknya - MENGURANGI beban kerja secara drastis! Dari 30-60 menit per kegiatan menjadi 2-5 menit. Operator cukup: upload selfie, pilih kegiatan, download, selesai!"),
        
        ("Q3: Hasil generate AI apakah terlihat palsu?",
         "Teknologi Flux Pro (model AI terbaik 2026) menghasilkan foto yang sangat realistis - sulit dibedakan dengan foto asli. Kualitasnya LEBIH BAIK dari foto HP kebanyakan."),
        
        ("Q4: Mengapa tidak pakai Canva saja?",
         "Canva hanya bisa edit foto yang SUDAH ADA. Tidak bisa membuat foto kegiatan yang TIDAK PERNAH difoto. AI Generate bisa membuat foto BARU dari awal."),
        
        ("Q5: Mengapa perlu VPS? Kenapa tidak beli GPU?",
         "Membeli GPU RTX 4090: Rp 35 Juta + PC Rp 20 Juta + Listrik Rp 6 Juta/tahun = TOTAL Rp 62 Juta. Sewa VPS: Rp 2,9 Juta/tahun. Hemat 95%!"),
        
        ("Q6: Apakah data operator aman?",
         "100% aman. Foto hanya diproses untuk generate, hasil langsung didownload, tidak disimpan permanen. Koneksi terenkripsi (HTTPS)."),
        
        ("Q7: Bagaimana kalau server mati?",
         "VPS berjalan di platform profesional dengan SLA 99,9%. Ada auto-restart - kalau mati, hidup sendiri dalam <5 menit."),
        
        ("Q8: Kapan balik modal?",
         "SEJAK BULAN PERTAMA! Biaya VPS per bulan (Rp 240.000) sudah jauh lebih murah dari biaya cetak manual per sekolah per bulan (Rp 8.000-25.000)."),
    ]
    
    for q, a in faqs:
        story.append(Paragraph(f"<b>{q}</b>", styles['SubSectionHeader']))
        story.append(Paragraph(a, styles['BodyText']))
        story.append(Spacer(1, 8))
    
    story.append(PageBreak())

def create_section_9(story, styles):
    """Section 9: Closing"""
    story.append(Paragraph("9. CLOSING STATEMENT", styles['SectionHeader']))
    
    story.append(Spacer(1, 10))
    
    # Main closing box
    story.append(Paragraph(
        "<b>Dengan fitur ini:</b><br/><br/>"
        "Operator cukup upload selfie 1x, lalu tinggal pilih-pilih setiap kali butuh foto dokumentasi.<br/><br/>"
        "5-15 detik - foto dokumentasi siap pakai, kualitas profesional.<br/><br/>"
        "Tidak perlu cetak foto mahal, tidak perlu edit Canva, tidak perlu khawatir cuaca atau lupa foto.<br/><br/>"
        "<b>Biaya Rp 1.233/sekolah/bulan - setara 1 porsi nasi pecel.</b>",
        styles['HighlightBox']
    ))
    
    story.append(Spacer(1, 15))
    
    story.append(Paragraph(
        "<b>Yang penting: BUKAN menggantikan foto manual.</b><br/><br/>"
        "Ini CADANGAN SUPER ketika kondisi tidak memungkinkan foto manual. "
        "Operator tetap bisa foto pakai HP - dan kalau hasilnya kurang memadai, "
        "tinggal generate AI dalam 3 menit.",
        styles['BodyText']
    ))
    
    story.append(Spacer(1, 20))
    
    # Final highlight
    story.append(Paragraph(
        "<b>DENGAN INVESTASI Rp 2,96 JUTA PER TAHUN - ATAU SETARA BIAYA 4 PORSI NASI PECEL PER SEKOLAH PER TAHUN - KITA BISA MEMBANTU 200 SEKOLAH MENYUSUN LPJ LEBIH RAPI, LEBIH CEPAT, DAN LEBIH PROFESIONAL.</b>",
        styles['SuccessBox']
    ))
    
    story.append(Spacer(1, 30))
    
    # Cheat sheet
    story.append(Paragraph("<b>CHEAT SHEET: Poin Penting</b>", styles['SubSectionHeader']))
    
    cheat_data = [
        ['BAGIAN', '1 KALIMAT', 'BIAYA'],
        ['Fase 1 (Setup)', 'Sekali upload, selamanya bisa dipakai', 'Rp 0'],
        ['Upload foto personel', 'AI perlu tahu wajah siapa yang akan dimasukkan', 'Rp 0'],
        ['Fase 2 (Generate)', 'Tinggal pilih-pilih seperti menu restoran', '~Rp 120/foto'],
        ['Pilih kegiatan', 'Rapat, MAMIN, ATK, atau Pemeliharaan', 'Include'],
        ['Pilih pakaian', 'Formal, batik, casual, atau seragam', 'Include'],
        ['Pilih suasana', 'Di ruang rapat, outdoor, aula, atau kantor', 'Include'],
        ['Pilih orang', 'Centang nama guru - foto mereka akan muncul', 'Include'],
        ['Klik Generate', '5-15 detik - tunggu hasilnya', 'Ini yg bayar'],
        ['Fase 3 (Output)', 'Preview, download, cetak - selesai', 'Rp 0'],
        ['Download', 'Foto disimpan - tidak di database', 'Rp 0'],
        ['Cetak', 'Langsung cetak atau save PDF', 'Rp 0'],
    ]
    
    cheat_table = Table(cheat_data, colWidths=[120, 220, 110])
    cheat_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BACKGROUND', (0, 1), (-1, 3), LIGHT_BLUE),
        ('BACKGROUND', (0, 4), (-1, 8), LIGHT_ORANGE),
        ('BACKGROUND', (0, 9), (-1, -1), LIGHT_GREEN),
        ('TEXTCOLOR', (0, 1), (-1, -1), DARK_GRAY),
        ('ALIGN', (2, 0), (2, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, white),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(cheat_table)
    
    story.append(Spacer(1, 20))
    
    story.append(Paragraph(
        "<i>Dokumen ini adalah pitch dokumentasi untuk stakeholder dan project manager non-teknis.</i>",
        styles['SmallNote']
    ))
    story.append(Paragraph(
        "<i>Gunakan bersama diagram USER_FLOW_GENERATE_FOTO_V2.png saat presentasi.</i>",
        styles['SmallNote']
    ))
    story.append(Paragraph(
        "<i>Kurs: Rp 16.000/USD (per 26 Juli 2026)</i>",
        styles['SmallNote']
    ))

def generate_pdf():
    output_path = "D:/project/spj-app/docs/ai/PITCH_STAKEHOLDER_GENERATE_DOKUMENTASI.pdf"
    
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=20*mm,
        leftMargin=20*mm,
        topMargin=25*mm,
        bottomMargin=25*mm,
    )
    
    styles = create_styles()
    story = []
    
    # Build all sections
    create_cover_page(story, styles)
    create_table_of_contents(story, styles)
    create_section_1(story, styles)
    create_section_2(story, styles)
    create_section_3(story, styles)
    create_section_4(story, styles)
    create_section_5(story, styles)
    create_section_6(story, styles)
    create_section_7(story, styles)
    create_section_8(story, styles)
    create_section_9(story, styles)
    
    # Build PDF
    doc.build(story, canvasmaker=NumberedCanvas)
    
    print(f"PDF berhasil dibuat: {output_path}")
    return output_path

if __name__ == "__main__":
    generate_pdf()
