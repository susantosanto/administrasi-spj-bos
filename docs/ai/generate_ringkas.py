#!/usr/bin/env python3
"""DOKUMEN PENGAJUAN - AI Generate Foto LPJ (2 halaman)"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, HRFlowable, Image
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

OUTPUT = os.path.join(os.path.dirname(__file__), "DOKUMEN_PENGAJUAN_GENERATE_FOTO_RINGKAS.pdf")
IMG = os.path.join(os.path.dirname(__file__), "USER_FLOW_GENERATE_FOTO_V2.png")

C1 = HexColor("#1a237e")
CG = HexColor("#2e7d32")
CO = HexColor("#e65100")
CD = HexColor("#212121")
CGY = HexColor("#424242")
WH = HexColor("#ffffff")
GR = HexColor("#9e9e9e")
BD = HexColor("#bdbdbd")
CLG = HexColor("#f5f5f5")
CLB = HexColor("#e8eaf6")
CLG2 = HexColor("#e8f5e9")
CLO = HexColor("#fff8e1")

F = {"r": "Helvetica", "b": "Helvetica-Bold", "i": "Helvetica-Oblique"}
try:
    if os.path.exists("C:\\Windows\\Fonts\\arial.ttf"):
        pdfmetrics.registerFont(TTFont("Ar", "C:\\Windows\\Fonts\\arial.ttf"))
        pdfmetrics.registerFont(TTFont("ArB", "C:\\Windows\\Fonts\\arialbd.ttf"))
        F = {"r": "Ar", "b": "ArB", "i": "Helvetica-Oblique"}
except:
    pass

def sp(h=2):
    return Spacer(1, h*mm)

def sect(t):
    return Table([[Paragraph(t, ParagraphStyle("s", fontName=F["b"], fontSize=10, leading=14, textColor=WH))]],
                 colWidths=[160*mm], style=TableStyle([('BACKGROUND',(0,0),(-1,-1),C1),('TOPPADDING',(0,0),(-1,-1),3),
                 ('BOTTOMPADDING',(0,0),(-1,-1),3),('LEFTPADDING',(0,0),(-1,-1),8)]))

def tbl(hdrs, rows, cw):
    d = [[Paragraph(f"<b>{h}</b>", ParagraphStyle("th", fontName=F["b"], fontSize=7, leading=9, textColor=WH, alignment=TA_CENTER)) for h in hdrs]]
    for r in rows:
        d.append([Paragraph(str(c), ParagraphStyle("tc", fontName=F["r"], fontSize=7, leading=9, textColor=CD, alignment=TA_CENTER)) for c in r])
    t = Table(d, colWidths=cw, repeatRows=1)
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),C1),('GRID',(0,0),(-1,-1),0.3,BD),
                           ('ROWBACKGROUNDS',(0,1),(-1,-1),[WH,CLG]),('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                           ('TOPPADDING',(0,0),(-1,-1),1),('BOTTOMPADDING',(0,0),(-1,-1),1)]))
    return t

def hf(c, doc):
    c.saveState()
    c.setFont(F["i"], 6); c.setFillColor(GR)
    c.drawString(20*mm, A4[1]-12*mm, "Pengajuan AI Generate Foto - Aplikasi LPJ")
    c.drawRightString(A4[0]-20*mm, A4[1]-12*mm, f"Hal {doc.page}")
    c.setFont(F["i"], 6.5); c.setFillColor(GR)
    c.drawCentredString(A4[0]/2, 9*mm, "Tim Pengembang Aplikasi LPJ - 26 Juli 2026")
    c.restoreState()

def build():
    doc = SimpleDocTemplate(OUTPUT, pagesize=A4, leftMargin=25*mm, rightMargin=25*mm,
                            topMargin=15*mm, bottomMargin=15*mm)
    s = []

    # ═══════════════════════════════════════════════════════════
    # HALAMAN 1
    # ═══════════════════════════════════════════════════════════
    s.append(HRFlowable(width="100%", thickness=2.5, color=C1, spaceBefore=0, spaceAfter=2*mm))
    s.append(Paragraph("DOKUMEN PENGAJUAN FITUR: AI Generate Foto Dokumentasi LPJ", ParagraphStyle("h", fontName=F["b"], fontSize=13, leading=17, textColor=C1, alignment=TA_CENTER)))
    s.append(Paragraph("Aplikasi LPJ | 200+ SD Negeri | TA 2026/2027", ParagraphStyle("h2", fontName=F["r"], fontSize=8, leading=11, textColor=CGY, alignment=TA_CENTER, spaceAfter=2*mm)))
    s.append(HRFlowable(width="100%", thickness=2.5, color=C1, spaceBefore=0, spaceAfter=3*mm))

    # ═══ PEMBUKA ═══
    s.append(Paragraph(
        "Berdasarkan observasi dan pengalaman operasional di lapangan, ditemukan bahwa proses dokumentasi foto untuk LPJ masih menghadapi berbagai kendala signifikan, antara lain:",
        ParagraphStyle("pm", fontName=F["r"], fontSize=8, leading=11, textColor=CD)))
    for p in [
        "Operator sekolah sering lupa atau tidak sempat mendokumentasikan kegiatan dengan foto",
        "Kualitas foto dari kamera ponsel seringkali kurang memadai untuk dokumen resmi LPJ",
        "Kondisi cuaca buruk menghambat dokumentasi kegiatan outdoor",
        "Ketidakhadiran personel tertentu menyulitkan pembuatan foto bersama",
        "Waktu yang dibutuhkan untuk satu kegiatan dokumentasi mencapai 30-60 menit",
    ]:
        s.append(Paragraph(f"• {p}", ParagraphStyle("pb", fontName=F["r"], fontSize=8, leading=11, textColor=CD, leftIndent=5*mm)))
    s.append(sp(1))
    s.append(Paragraph(
        "Oleh karena itu, diperlukan sebuah solusi teknologi yang dapat mengatasi permasalahan tersebut secara efektif dan efisien. Pengajuan fitur AI Generate Foto Dokumentasi LPJ ini hadir sebagai jawaban atas kebutuhan tersebut.",
        ParagraphStyle("pp", fontName=F["r"], fontSize=8, leading=11, textColor=CD)))
    s.append(sp(2))

    # 1. MASALAH & SOLUSI
    s.append(sect("1. MASALAH & SOLUSI"))
    s.append(sp(1))
    s.append(Paragraph("<b>Masalah:</b> Dokumentasi foto LPJ sering terkendala (lupa foto, kualitas kurang, cuaca, personel tidak hadir). Waktu 30-60 menit/kegiatan.", ParagraphStyle("m", fontName=F["r"], fontSize=8, leading=11, textColor=CD)))
    s.append(sp(1))
    s.append(Paragraph("<b>Solusi:</b> Upload selfie personel 1x → Buka Data BKU → Klik transaksi → Tab Dokumentasi → Pilih pakaian/suasana/orang → AI Generate 5-15 detik → Download & cetak langsung ke LPJ.", ParagraphStyle("sol", fontName=F["r"], fontSize=8, leading=11, textColor=CD)))
    s.append(sp(1))
    sd = [[Paragraph("Waktu: 2-5 menit (dari 30-60) | <b>Biaya: Rp 300/foto</b> | Kualitas: Studio | Upload 1x, pakai selamanya", ParagraphStyle("si", fontName=F["b"], fontSize=7.5, leading=10, textColor=C1))]]
    st = Table(sd, colWidths=[160*mm])
    st.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),CLB),('BOX',(0,0),(-1,-1),0.6,C1),
                            ('TOPPADDING',(0,0),(-1,-1),2),('BOTTOMPADDING',(0,0),(-1,-1),2),
                            ('LEFTPADDING',(0,0),(-1,-1),5)]))
    s.append(st)
    s.append(sp(2))

    # 2. ANGGARAN
    s.append(sect("2. ANGGARAN"))
    s.append(sp(1))

    bd = [["Pos", "Biaya", "Keterangan"],
          ["Sewa VPS GPU (standar)", "Rp 600.000/bln", "RTX 3090, unlimited generate"],
          ["Setup awal (sekali)", "Rp 80.000", "Konfigurasi VPS"],
          ["Hosting app + Training AI", "GRATIS", "Vercel existing + self-host LoRA"]]
    s.append(tbl(bd[0], bd[1:], [50*mm, 35*mm, 75*mm]))
    s.append(sp(1))

    # Hero numbers
    s.append(Paragraph("<b>RINCIAN BIAYA PER SEKOLAH (200 sekolah)</b>", ParagraphStyle("rps", fontName=F["b"], fontSize=9, leading=12, textColor=C1, alignment=TA_CENTER)))
    s.append(sp(1))
    hero = [
        [Paragraph("<b>PER BULAN</b>", ParagraphStyle("hl", fontName=F["b"], fontSize=7, leading=9, textColor=WH, alignment=TA_CENTER)),
         Paragraph("<b>PER TAHUN</b>", ParagraphStyle("hl", fontName=F["b"], fontSize=7, leading=9, textColor=WH, alignment=TA_CENTER)),
         Paragraph("<b>PER FOTO</b>", ParagraphStyle("hl", fontName=F["b"], fontSize=7, leading=9, textColor=WH, alignment=TA_CENTER))],
        [Paragraph("<font size=16><b>Rp 3.000</b></font>", ParagraphStyle("hv", fontName=F["b"], fontSize=16, leading=20, textColor=CO, alignment=TA_CENTER)),
         Paragraph("<font size=16><b>Rp 36.000</b></font>", ParagraphStyle("hv", fontName=F["b"], fontSize=16, leading=20, textColor=CO, alignment=TA_CENTER)),
         Paragraph("<font size=16><b>Rp 300</b></font>", ParagraphStyle("hv", fontName=F["b"], fontSize=16, leading=20, textColor=CO, alignment=TA_CENTER))],
        [Paragraph("/sekolah", ParagraphStyle("hu", fontName=F["r"], fontSize=7, leading=9, textColor=CGY, alignment=TA_CENTER)),
         Paragraph("/sekolah", ParagraphStyle("hu", fontName=F["r"], fontSize=7, leading=9, textColor=CGY, alignment=TA_CENTER)),
         Paragraph("/foto", ParagraphStyle("hu", fontName=F["r"], fontSize=7, leading=9, textColor=CGY, alignment=TA_CENTER))],
    ]
    ht = Table(hero, colWidths=[53*mm, 53*mm, 53*mm])
    ht.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,0),C1), ('BACKGROUND',(0,1),(-1,-1),CLO),
        ('BOX',(0,0),(-1,-1),0.8,CO), ('INNERGRID',(0,0),(-1,-1),0.3,BD),
        ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
        ('TOPPADDING',(0,0),(-1,-1),2), ('BOTTOMPADDING',(0,0),(-1,-1),2),
    ]))
    s.append(ht)
    s.append(sp(1))

    td = [[Paragraph("<b>Total Biaya:</b> Tahun 1 = Rp 7.280.000 | Tahun 2+ = Rp 7.200.000/tahun", ParagraphStyle("tot", fontName=F["b"], fontSize=7.5, leading=10, textColor=CO))]]
    tt = Table(td, colWidths=[160*mm])
    tt.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),CLO),('BOX',(0,0),(-1,-1),0.6,CO),
                            ('TOPPADDING',(0,0),(-1,-1),2),('BOTTOMPADDING',(0,0),(-1,-1),2),
                            ('LEFTPADDING',(0,0),(-1,-1),5)]))
    s.append(tt)
    s.append(sp(2))

    # Perbandingan Biaya
    s.append(Paragraph("<b>Perbandingan Biaya: AI dengan Hosting vs AI Tanpa Hosting</b>", ParagraphStyle("cmp", fontName=F["b"], fontSize=8, leading=11, textColor=C1)))
    s.append(sp(1))
    cmd = [["Aspek", "AI dengan Hosting\n(VPS Sendiri)", "AI Tanpa Hosting\n(Pakai API Eksternal)"],
           ["Biaya Awal", "Rp 80.000 (sekali)", "Rp 0"],
           ["Biaya Sewa", "Rp 600.000/bln\n= Rp 7.200.000/thn", "Rp 2.000.000/bln*\n= Rp 24.000.000/thn*"],
           ["Per Foto", "Rp 300", "Rp 1.000*"],
           ["Kapasitas", "Unlimited", "Terbatas kuota"],
           ["Kontrol Data", "Penuh (server sendiri)", "Data ke pihak ke-3"]]
    s.append(tbl(cmd[0], cmd[1:], [35*mm, 62*mm, 63*mm]))
    s.append(sp(1))
    s.append(Paragraph("<i>* Estimasi Rp 1.000/foto, 24.000 foto/tahun (200 sekolah x 10 foto/bulan). Hosting sendiri 3x lebih murah, data aman, tanpa batasan.</i>", ParagraphStyle("nt", fontName=F["i"], fontSize=6.5, leading=9, textColor=GR)))
    s.append(sp(2))

    # 3. WORKFLOW
    s.append(sect("3. WORKFLOW"))
    s.append(sp(1))
    phd = [[Paragraph("<b>BUKA BKU</b>", ParagraphStyle("ph1", fontName=F["b"], fontSize=7.5, leading=10, textColor=WH, alignment=TA_CENTER)),
            Paragraph("<b>SIDEBAR DETAIL</b>", ParagraphStyle("ph2", fontName=F["b"], fontSize=7.5, leading=10, textColor=WH, alignment=TA_CENTER)),
            Paragraph("<b>TAB DOKUMENTASI</b>", ParagraphStyle("ph3", fontName=F["b"], fontSize=7.5, leading=10, textColor=WH, alignment=TA_CENTER))],
           [Paragraph("Buka halaman Data BKU<br/>dari sidebar navigasi<br/><b>GRATIS</b>",
                      ParagraphStyle("pc", fontName=F["r"], fontSize=6.5, leading=9, textColor=CD, alignment=TA_CENTER)),
            Paragraph("Klik baris transaksi<br/>(yg wajib foto)<br/>Sidebar terbuka dari kanan<br/><b>GRATIS</b>",
                      ParagraphStyle("pc", fontName=F["r"], fontSize=6.5, leading=9, textColor=CD, alignment=TA_CENTER)),
            Paragraph("Buka Tab Dokumentasi LPJ<br/>Pilih pakaian, suasana,<br/>orang hadir → GENERATE<br/><b>Rp 300/foto</b>",
                      ParagraphStyle("pc", fontName=F["r"], fontSize=6.5, leading=9, textColor=CD, alignment=TA_CENTER))]]
    pht = Table(phd, colWidths=[52*mm, 52*mm, 52*mm])
    pht.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(0,0),C1), ('BACKGROUND',(1,0),(1,0),HexColor("#4a148c")), ('BACKGROUND',(2,0),(2,0),CG),
        ('BACKGROUND',(0,1),(0,1),CLB), ('BACKGROUND',(1,1),(1,1),HexColor("#f3e5f5")), ('BACKGROUND',(2,1),(2,1),CLG2),
        ('BOX',(0,0),(-1,-1),0.6,BD), ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
        ('TOPPADDING',(0,0),(-1,-1),2), ('BOTTOMPADDING',(0,0),(-1,-1),2),
    ]))
    s.append(pht)
    s.append(sp(2))
    s.append(Paragraph("<b>Langkah:</b> Buka Data BKU → Klik baris transaksi → Sidebar Detail terbuka → Buka Tab Dokumentasi LPJ → Pilih pakaian & suasana → Centang orang hadir → Klik GENERATE → 5-15 detik siap.", ParagraphStyle("lk", fontName=F["r"], fontSize=7.5, leading=10, textColor=CD)))
    s.append(sp(2))

    # 4. KESIMPULAN
    s.append(sect("4. KESIMPULAN"))
    s.append(sp(1))
    s.append(Paragraph("✅ 200 sekolah terbantu LPJ | ✅ 1.400 jam kerja/bulan dihemat | ✅ 24.000 foto siap pakai | ✅ Kepatuhan LPJ meningkat", ParagraphStyle("ck", fontName=F["r"], fontSize=7.5, leading=10, textColor=CD)))
    s.append(sp(2))
    s.append(HRFlowable(width="100%", thickness=1.2, color=C1, spaceBefore=0, spaceAfter=2*mm))
    s.append(Paragraph("Diajukan: Tim Pengembang Aplikasi LPJ | Menyetujui: Stakeholder/PM", ParagraphStyle("sg", fontName=F["r"], fontSize=7.5, leading=10, textColor=CGY, alignment=TA_CENTER)))

    # ═══════════════════════════════════════════════════════════
    # HALAMAN 2 - USER FLOW
    # ═══════════════════════════════════════════════════════════
    s.append(PageBreak())
    s.append(sect("USER FLOW - AI Generate Foto Dokumentasi LPJ"))
    s.append(sp(2))

    if os.path.exists(IMG):
        img = Image(IMG, width=160*mm, height=110*mm)
        s.append(img)
    else:
        s.append(Paragraph(f"<i>Gambar tidak ditemukan: {IMG}</i>", ParagraphStyle("er", fontName=F["i"], fontSize=8, leading=11, textColor=GR)))

    doc.build(s, onFirstPage=hf, onLaterPages=hf)
    print(f"✅ OK: {OUTPUT}")

if __name__ == "__main__":
    build()