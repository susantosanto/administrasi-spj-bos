import { useEffect, useRef, useState } from 'react'

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function statusClass(s) {
  const v = String(s || '').toUpperCase()
  if (v === 'ACTIVE') return 'active'
  if (v === 'EXPIRED' || v === 'READ_ONLY' || v === 'SUSPENDED') return 'expired'
  return 'trial'
}
function licenseHtml(data) {
  const exp = fmtDate(data.endDate)
  const st = String(data.status || 'TRIAL').toUpperCase()
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `<!doctype html><html lang="id"><head><meta charset="utf-8"><base href="${esc(origin)}/">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Kartu Lisensi ${esc(data.licenseCode)}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet">
<style>
  :root{ --navy:#102d59; --blue:#1e5cc0; --text:#17243b; --muted:#6b7a94; }
  *{box-sizing:border-box}
  body{margin:0; padding:28px 16px; min-height:100vh; font-family:Inter,"Segoe UI",sans-serif; color:var(--text);
    background: #e6efff; position:relative; }
  body::before{content:""; position:fixed; inset:-360px 0; background-image:url('${esc(origin)}/floral-pattern.jpg'); background-size:320px 320px; background-repeat:repeat; opacity:0.28; pointer-events:none; }
  body::after{content:""; position:fixed; inset:0; background: radial-gradient(700px 400px at 12% 8%, rgba(255,255,255,.9), transparent 60%), radial-gradient(600px 300px at 88% 92%, rgba(255,255,255,.7), transparent 60%); pointer-events:none}
  .outer{max-width:1080px; margin:auto; position:relative; background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 55%, #fff 100%); border-radius:28px; padding:22px; box-shadow:0 20px 50px rgba(22,66,125,.14); border:1px solid rgba(255,255,255,.8)}
  .license-card{display:grid; grid-template-columns:340px 1fr; overflow:hidden; border-radius:22px; background:white; box-shadow:0 18px 50px rgba(22,66,125,.16); position:relative}
  .brand-panel{position:relative; overflow:hidden; padding:30px 24px 0; color:white; text-align:center; background:linear-gradient(180deg,#0a5bd7 0%,#0a4fb8 45%,#083a8a 78%,#082f6e 100%); display:flex; flex-direction:column; align-items:center;}
  .brand-panel::after{content:""; position:absolute; inset:0; background-image:url('${esc(origin)}/floral-pattern.jpg'); background-size:280px 280px; opacity:0.13; mix-blend-mode:soft-light; pointer-events:none; z-index:0}
  .brand-panel .wave{position:absolute; top:0; right:-1px; width:46px; height:100%; background:white; border-radius:100% 0 0 100% / 50% 0 0 50%; z-index:1; box-shadow:-4px 0 12px rgba(0,0,0,.08)}
  .brand-shield{width:110px; height:128px; background:white; border-radius:18px 18px 26px 26px; display:grid; place-items:center; padding:7px; box-shadow:0 10px 28px rgba(0,0,0,.20), 0 0 0 4px rgba(232,184,74,.18); position:relative; z-index:2; border:3px solid #e8b84a}
  .brand-shield img{width:100%; height:100%; object-fit:contain; border-radius:10px}
  .brand-name{font-size:50px; font-weight:900; letter-spacing:4px; margin:14px 0 0; z-index:2; text-shadow:0 2px 12px rgba(0,0,0,.22)}
  .brand-subtitle{font-size:11px; line-height:1.6; opacity:.92; margin-top:6px; max-width:230px; z-index:2; font-style:italic}
  .brand-building{margin-top:auto; width:calc(100% + 48px); margin-left:-24px; margin-right:-24px; height:108px; background: linear-gradient(to top, rgba(7,30,70,.60), transparent), url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 110"><g fill="%23ffffff" opacity="0.93"><rect x="110" y="46" width="120" height="54" rx="2"/><rect x="116" y="56" width="14" height="16" rx="1" fill="%23083a8a"/><rect x="136" y="56" width="14" height="16" rx="1" fill="%23083a8a"/><rect x="156" y="56" width="14" height="16" rx="1" fill="%23083a8a"/><rect x="176" y="56" width="14" height="16" rx="1" fill="%23083a8a"/><rect x="196" y="56" width="14" height="16" rx="1" fill="%23083a8a"/><polygon points="110,46 170,18 230,46" fill="%23e6efff"/><rect x="56" y="68" width="46" height="32" rx="1" opacity="0.72"/><rect x="262" y="64" width="34" height="36" rx="1" opacity="0.6"/></g></svg>'); background-size:cover; background-position:center bottom; position:relative; z-index:2; }
  .brand-building::after{content:""; position:absolute; left:0; right:0; bottom:0; height:16px; background: linear-gradient(90deg, #c8960a 0%, #f3d26a 35%, #e8b84a 65%, #c8960a 100%);}
  .brand-bottom{margin:10px 0 12px; font-size:8.5px; letter-spacing:2px; opacity:.72; z-index:2}
  .content-panel{padding:26px 30px 18px; position:relative; background:white}
  .content-panel::before{content:""; position:absolute; top:-30px; right:-50px; width:380px; height:180px; background: radial-gradient(ellipse at center, rgba(36,99,181,.08), transparent 70%); pointer-events:none}
  .content-panel::after{content:""; position:absolute; inset:0; background-image:url('${esc(origin)}/floral-pattern.jpg'); background-size:300px 300px; opacity:0.035; pointer-events:none; mask: radial-gradient(500px 280px at 85% 30%, black 30%, transparent 75%)}
  .header{display:flex; align-items:center; gap:12px; padding-bottom:16px; border-bottom:1px solid #e8eef7; position:relative}
  .header::after{content:""; position:absolute; left:0; right:0; bottom:-1px; height:1px; background: linear-gradient(90deg, #e8b84a 0%, #f3d26a 18%, transparent 45%); opacity:0.9}
  .header-icon{width:40px; height:40px; display:grid; place-items:center; border-radius:10px; background:#eaf2ff; color:var(--blue); font-size:20px}
  .header h1{font-size:20px; margin:0; color:var(--navy)} .header p{color:var(--muted); font-size:11px; margin:3px 0 0; font-style:italic}
  .info-row{display:grid; grid-template-columns:24px 140px 12px 1fr; align-items:center; min-height:42px; border-bottom:1px solid #edf1f7; font-size:12.5px}
  .info-icon{color:var(--blue); font-size:18px}
  .info-label{color:var(--muted); font-weight:500} .info-value{font-weight:600; color:var(--navy)}
  .license-code{display:inline-flex; align-items:center; gap:8px; background:linear-gradient(135deg,#e8f2ff 0%,#f0f7ff 100%); padding:6px 8px; border-radius:8px; color:#1454a1; font-weight:800; letter-spacing:0.6px; border:1px solid #c9deff; box-shadow: inset 0 1px 0 rgba(255,255,255,.9)}
  .license-code .copy{width:26px; height:26px; display:grid; place-items:center; background:white; border:1px solid #d6e7ff; border-radius:6px; color:var(--blue); cursor:pointer; font-size:14px}
  .status{display:inline-flex; align-items:center; gap:6px; border-radius:20px; padding:4px 10px; font-size:11px; font-weight:800}
  .status.trial{background:#fff2d5; color:#a56800} .status.active{background:#dcf8e7; color:#128344} .status.expired{background:#ffe4e4; color:#c52c2c}
  .password-box{display:inline-flex; align-items:center; gap:8px; padding:6px 10px; background:#eef4ff; border-radius:8px; border:1px solid #d6e7ff}
  .password-box button{border:none; background:transparent; color:var(--blue); cursor:pointer; display:grid; place-items:center}
  .notice{display:flex; align-items:center; gap:10px; margin-top:16px; padding:11px 13px; border-left:4px solid #f0b429; background: linear-gradient(135deg,#fff9eb 0%,#fffbf0 100%); border-radius:10px; color:#7a4a00; font-size:11px; line-height:1.5; position:relative; overflow:hidden}
  .notice::after{content:""; position:absolute; top:-20px; right:-20px; width:80px; height:80px; background-image:url('${esc(origin)}/floral-pattern.jpg'); background-size:180px 180px; opacity:0.06; pointer-events:none; transform:rotate(12deg)}
  .notice::before{content:"⚠"; width:22px; height:22px; display:grid; place-items:center; background:#f0b429; color:white; border-radius:50%; font-size:12px; flex-shrink:0}
  .print-date{color:#9aa9bd; font-size:10.5px; margin-top:12px; display:flex; align-items:center; gap:6px}
  .card-wave-bottom{position:absolute; bottom:0; right:0; width:220px; height:48px; background: linear-gradient(90deg, #f3d26a, #2b7de9); clip-path: ellipse(70% 100% at 70% 100%); opacity:0.98; pointer-events:none}
  @media print{ @page{size:A4 landscape; margin:8mm} body{padding:0; background:white} body::before{display:none} .outer{background:white; padding:0; box-shadow:none} .license-card{box-shadow:none; border:1px solid #dce5f1} .brand-panel{print-color-adjust:exact; -webkit-print-color-adjust:exact} }
  @media(max-width:760px){ .license-card{grid-template-columns:1fr} .brand-panel .wave{display:none} .content-panel{padding:20px 16px} .info-row{grid-template-columns:20px 92px 8px 1fr; font-size:11.5px} .header h1{font-size:18px} }
</style></head><body>
<div class="outer"><div class="license-card">
  <section class="brand-panel"><div class="wave" aria-hidden="true"></div>
    <div class="brand-shield"><img src="${esc(origin)}/logo-dinas.png" alt="Lambang" onerror="this.style.display='none'; this.nextElementSibling.style.display='grid'"><div style="display:none; place-items:center; width:100%; height:100%; font-size:10px; color:#0a4fb8; font-weight:800; text-align:center; line-height:1.1">TUT WURI<br>HANDAYANI</div></div>
    <h2 class="brand-name">ASIK</h2><div class="brand-subtitle">Aplikasi Dokumentasi LPJ<br>Pertanggungjawaban Dana BOS/BOSP</div>
    <div class="brand-building" aria-hidden="true"></div><div class="brand-bottom">SMART SCHOOL FINANCIAL SYSTEM</div></section>
  <section class="content-panel">
    <div class="header"><div class="header-icon"><span class="material-symbols-outlined" style="font-size:20px">badge</span></div><div><h1>Kartu Lisensi ASIK</h1><p>Aplikasi Dokumentasi LPJ — Pertanggungjawaban Dana BOS/BOSP</p></div></div>
    <div class="license-info">
      <div class="info-row"><span class="material-symbols-outlined info-icon">school</span><span class="info-label">Sekolah</span><span>:</span><span class="info-value">${esc(data.schoolName)}</span></div>
      <div class="info-row"><span class="material-symbols-outlined info-icon">tag</span><span class="info-label">NPSN</span><span>:</span><span class="info-value">${esc(data.npsn)}</span></div>
      <div class="info-row"><span class="material-symbols-outlined info-icon">vpn_key</span><span class="info-label">Kode Lisensi</span><span>:</span><span class="license-code"><span>${esc(data.licenseCode)}</span><span class="copy">⎘</span></span></div>
      <div class="info-row"><span class="material-symbols-outlined info-icon">bar_chart</span><span class="info-label">Status</span><span>:</span><span class="status ${statusClass(st)}">● ${esc(st)}</span></div>
      <div class="info-row"><span class="material-symbols-outlined info-icon">event</span><span class="info-label">Berlaku Sampai</span><span>:</span><span class="info-value">${esc(exp)}</span></div>
      <div class="info-row"><span class="material-symbols-outlined info-icon">person</span><span class="info-label">Username</span><span>:</span><span class="info-value">${esc(data.username)}</span></div>
      <div class="info-row"><span class="material-symbols-outlined info-icon">lock</span><span class="info-label">Password</span><span>:</span><span class="password-box"><span>${esc(data.password)}</span><span class="material-symbols-outlined" style="font-size:16px">visibility</span></span></div>
    </div>
    <div class="notice">Simpan kartu ini di tempat aman. Jangan bagikan password kepada orang lain.</div>
    <div class="print-date"><span class="material-symbols-outlined" style="font-size:13px">schedule</span> Dicetak: ${esc(new Date().toLocaleString('id-ID'))}</div>
    <div class="card-wave-bottom" aria-hidden="true"></div>
  </section>
</div></div>
</body></html>`
}

function drawCard(data) {
  const W = 1120, H = 640
  const canvas = document.createElement('canvas')
  canvas.width = W * 2; canvas.height = H * 2
  const ctx = canvas.getContext('2d'); ctx.scale(2,2)
  // page bg batik — lebih tegas + motif ganda
  ctx.fillStyle = '#e6efff'; ctx.fillRect(0,0,W,H)
  ctx.fillStyle = 'rgba(36,87,167,0.10)'; for (let x=0;x<W;x+=22) for (let y=0;y<H;y+=22){ ctx.beginPath(); ctx.arc(x,y,1.4,0,Math.PI*2); ctx.fill() }
  ctx.fillStyle = 'rgba(36,87,167,0.05)'; for (let x=12;x<W;x+=48) for (let y=12;y<H;y+=48){ ctx.beginPath(); ctx.arc(x,y,2.8,0,Math.PI*2); ctx.fill() }
  const g0 = ctx.createRadialGradient(140,90,0,140,90,560); g0.addColorStop(0,'rgba(220,234,255,.68)'); g0.addColorStop(1,'rgba(220,234,255,0)'); ctx.fillStyle=g0; ctx.fillRect(0,0,W,H)
  // card
  const R=22, LW=340
  ctx.fillStyle='#fff'; ctx.strokeStyle='#dce6f5'; ctx.lineWidth=1.5
  ctx.beginPath(); ctx.moveTo(R,0); ctx.lineTo(W-R,0); ctx.quadraticCurveTo(W,0,W,R); ctx.lineTo(W,H-R); ctx.quadraticCurveTo(W,H,W-R,H); ctx.lineTo(R,H); ctx.quadraticCurveTo(0,H,0,H-R); ctx.lineTo(0,R); ctx.quadraticCurveTo(0,0,R,0); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.save(); ctx.clip()
  // left panel gradient
  const lg = ctx.createLinearGradient(0,0,0,H)
  lg.addColorStop(0,'#0a5bd7'); lg.addColorStop(0.45,'#0a4fb8'); lg.addColorStop(0.78,'#083a8a'); lg.addColorStop(1,'#082f6e')
  ctx.fillStyle=lg; ctx.fillRect(0,0,LW,H)
  // wave white on right edge of left panel
  ctx.fillStyle='#fff'; ctx.beginPath(); ctx.moveTo(LW-36,0); ctx.bezierCurveTo(LW-8, H*0.35, LW-8, H*0.65, LW-36, H); ctx.lineTo(LW, H); ctx.lineTo(LW,0); ctx.closePath(); ctx.fill()
  // shield
  const sx = LW/2 -55, sy=28, sw=110, sh=128
  ctx.fillStyle='#fff'; ctx.strokeStyle='#e8b84a'; ctx.lineWidth=3
  ctx.beginPath(); ctx.moveTo(sx+12, sy); ctx.lineTo(sx+sw-12, sy); ctx.quadraticCurveTo(sx+sw, sy, sx+sw, sy+12); ctx.lineTo(sx+sw, sy+sh-28); ctx.quadraticCurveTo(sx+sw, sy+sh-6, sx+sw-18, sy+sh); ctx.lineTo(sx+18, sy+sh); ctx.quadraticCurveTo(sx, sy+sh-6, sx, sy+sh-28); ctx.lineTo(sx, sy+12); ctx.quadraticCurveTo(sx, sy, sx+12, sy); ctx.closePath(); ctx.fill(); ctx.stroke()
  ctx.fillStyle='#0a4fb8'; ctx.font='700 9px Inter, sans-serif'; ctx.textAlign='center'; ctx.fillText('TUT WURI', LW/2, sy+44); ctx.fillText('HANDAYANI', LW/2, sy+56)
  ctx.font='22px serif'; ctx.fillText('★', LW/2, sy+72)
  // ASIK
  ctx.fillStyle='#fff'; ctx.font='900 44px Inter, sans-serif'; ctx.textAlign='center'; ctx.fillText('ASIK', LW/2, 212)
  ctx.font='italic 10px Inter, sans-serif'; ctx.fillStyle='rgba(255,255,255,.92)'; ctx.fillText('Aplikasi Dokumentasi LPJ', LW/2, 232); ctx.fillText('Pertanggungjawaban Dana', LW/2, 244); ctx.fillText('BOS/BOSP', LW/2, 256)
  // building silhouette
  ctx.fillStyle='rgba(255,255,255,.93)'
  ctx.fillRect(88, H-110, 140, 54)
  ctx.fillStyle='#e6efff'; ctx.beginPath(); ctx.moveTo(88, H-110); ctx.lineTo(LW/2, H-138); ctx.lineTo(228, H-110); ctx.closePath(); ctx.fill()
  for(let i=0;i<5;i++){ ctx.fillStyle='#083a8a'; ctx.fillRect(98+i*24, H-98, 12,14) }
  ctx.fillStyle='rgba(7,30,70,.18)'; ctx.fillRect(0, H-18, LW, 18)
  ctx.fillStyle='rgba(232,184,74,1)'; ctx.fillRect(0, H-18, LW-36, 6)
  // gold wave across gap is white wave already
  ctx.fillStyle='rgba(255,255,255,.72)'; ctx.font='700 7px Inter, sans-serif'; ctx.fillText('SMART SCHOOL FINANCIAL SYSTEM', LW/2, H-26)
  ctx.restore()
  // right panel content
  const rx = LW + 32, rw = W - LW - 64
  // header icon
  ctx.fillStyle='#eaf2ff'; ctx.beginPath(); ctx.roundRect(rx, 22, 38, 38, 10); ctx.fill()
  ctx.fillStyle='#1e5cc0'; ctx.font='18px Material Symbols Outlined'; ctx.textAlign='center'; ctx.fillText('badge', rx+19, 47)
  ctx.fillStyle='#102d59'; ctx.font='700 19px Inter, sans-serif'; ctx.textAlign='left'; ctx.fillText('Kartu Lisensi ASIK', rx+52, 36)
  ctx.fillStyle='#6b7a94'; ctx.font='italic 10px Inter, sans-serif'; ctx.fillText('Aplikasi Dokumentasi LPJ — Pertanggungjawaban Dana BOS/BOSP', rx+52, 52)
  ctx.strokeStyle='#e8eef7'; ctx.beginPath(); ctx.moveTo(rx, 68); ctx.lineTo(W-32,68); ctx.stroke()
  const rows=[
    ['Sekolah', data.schoolName, 'school'],
    ['NPSN', data.npsn, 'tag'],
    ['Kode Lisensi', data.licenseCode, 'vpn_key'],
    ['Status', String(data.status||'TRIAL').toUpperCase(), 'bar_chart'],
    ['Berlaku Sampai', fmtDate(data.endDate), 'event'],
    ['Username', data.username, 'person'],
    ['Password', data.password, 'lock'],
  ]
  let y=98
  for(const [label, value] of rows){
    ctx.fillStyle='#6b7a94'; ctx.font='500 12px Inter, sans-serif'; ctx.fillText(label, rx+26, y)
    ctx.fillStyle='#102d59'
    const isCode = label==='Kode Lisensi'
    const isPass = label==='Password'
    if(isCode){
      ctx.fillStyle='#e8f2ff'; ctx.strokeStyle='#d6e7ff'; ctx.beginPath(); ctx.roundRect(rx+160, y-18, 220, 26, 8); ctx.fill(); ctx.stroke()
      ctx.fillStyle='#1454a1'; ctx.font='800 12px ui-monospace, monospace'; ctx.fillText(String(value||'—'), rx+168, y)
    } else if(isPass){
      ctx.fillStyle='#eef4ff'; ctx.strokeStyle='#d6e7ff'; ctx.beginPath(); ctx.roundRect(rx+160, y-18, 170, 26, 8); ctx.fill(); ctx.stroke()
      ctx.fillStyle='#102d59'; ctx.font='700 12px ui-monospace, monospace'; ctx.fillText(String(value||'—'), rx+168, y)
    } else if(label==='Status'){
      const isTrial = String(value).toUpperCase()==='TRIAL'
      ctx.fillStyle = isTrial ? '#fff2d5' : value==='ACTIVE' ? '#dcf8e7' : '#ffe4e4'
      ctx.beginPath(); ctx.roundRect(rx+160, y-16, 90, 20, 10); ctx.fill()
      ctx.fillStyle = isTrial ? '#a56800' : value==='ACTIVE' ? '#128344' : '#c52c2c'
      ctx.font='800 10px Inter, sans-serif'; ctx.fillText('● '+String(value), rx+168, y-2)
    } else {
      ctx.font='600 12px Inter, sans-serif'; ctx.fillText(String(value||'—'), rx+160, y)
    }
    ctx.fillStyle='#6b7a94'; ctx.font='12px Inter, sans-serif'; ctx.fillText(':', rx+140, y)
    // icon
    ctx.fillStyle='#1e5cc0'; ctx.font='14px Material Symbols Outlined'; ctx.fillText(label==='Sekolah'?'school':label==='NPSN'?'tag':label==='Kode Lisensi'?'vpn_key':label==='Status'?'bar_chart':label==='Berlaku Sampai'?'event':label==='Username'?'person':'lock', rx, y)
    ctx.strokeStyle='#edf1f7'; ctx.beginPath(); ctx.moveTo(rx, y+12); ctx.lineTo(W-32, y+12); ctx.stroke()
    y+=42
  }
  // notice
  ctx.fillStyle='#fff9eb'; ctx.strokeStyle='#f0d48a'; ctx.beginPath(); ctx.roundRect(rx, y+6, rw, 38, 10); ctx.fill(); ctx.stroke()
  ctx.fillStyle='#f0b429'; ctx.beginPath(); ctx.arc(rx+16, y+25, 10,0,Math.PI*2); ctx.fill()
  ctx.fillStyle='#fff'; ctx.font='700 12px Inter, sans-serif'; ctx.textAlign='center'; ctx.fillText('!', rx+16, y+29); ctx.textAlign='left'
  ctx.fillStyle='#7a4a00'; ctx.font='11px Inter, sans-serif'; ctx.fillText('Simpan kartu ini di tempat aman. Jangan bagikan password kepada orang lain.', rx+34, y+26)
  // print date
  ctx.fillStyle='#9aa9bd'; ctx.font='10px Inter, sans-serif'; ctx.fillText('Dicetak: '+ new Date().toLocaleString('id-ID'), rx, H-18)
  // bottom wave gold-blue
  ctx.fillStyle='#f3d26a'; ctx.beginPath(); ctx.ellipse(W-110, H, 110, 28, 0, Math.PI, 0); ctx.fill()
  ctx.fillStyle='#2b7de9'; ctx.beginPath(); ctx.ellipse(W-70, H, 80, 18, 0, Math.PI, 0); ctx.fill()
  return canvas
}

export default function LicenseCardModal({ open, data, onClose, onDashboard }) {
  const printFrame = useRef(null)
  const [downloaded, setDownloaded] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open || !data) return null

  function handlePrint() {
    const html = licenseHtml(data)
    const frame = document.createElement('iframe')
    frame.style.position = 'fixed'
    frame.style.right = '0'
    frame.style.bottom = '0'
    frame.style.width = '0'
    frame.style.height = '0'
    frame.style.border = '0'
    document.body.appendChild(frame)
    printFrame.current = frame
    const doc = frame.contentDocument || frame.contentWindow?.document
    if (!doc) return
    doc.open()
    doc.write(html)
    doc.close()
    window.setTimeout(() => {
      try {
        frame.contentWindow.focus()
        frame.contentWindow.print()
      } finally {
        window.setTimeout(() => frame.remove(), 60_000)
      }
    }, 250)
  }

  function handleDownload() {
    const canvas = drawCard(data)
    const filename = `kartu-lisensi-${String(data.licenseCode || 'asik').replace(/[^A-Za-z0-9-]/g, '')}.png`
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      setDownloaded(true)
    }, 'image/png')
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="license-card-title"
      style={{ backgroundColor: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(6px)' }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-[0.22]" style={{ backgroundImage: "url('/floral-pattern.jpg')", backgroundSize: '360px 360px', backgroundRepeat: 'repeat', mixBlendMode: 'multiply' }} aria-hidden="true" />
      <div className="relative w-full max-w-[520px] rounded-2xl bg-white shadow-2xl overflow-hidden animate-fade-up">
        <div className="bg-[#2457A7] px-6 py-5 text-white">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-4xl text-emerald-300">check_circle</span>
            <div>
              <h2 id="license-card-title" className="text-lg font-bold">Selamat, registrasi Anda berhasil!</h2>
              <p className="text-[13px] text-blue-100 mt-1">
                Silakan cetak atau download kartu lisensinya. Kartu memuat username dan password Anda.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-3 text-[13px] text-slate-700">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <Row label="Sekolah" value={data.schoolName} />
            <Row label="NPSN" value={data.npsn} />
            <Row label="Kode Lisensi" value={data.licenseCode} mono />
            <Row label="Status" value={data.status} />
            <Row label="Berlaku Sampai" value={fmtDate(data.endDate)} />
            <div className="border-t border-slate-200 pt-2 mt-2 space-y-2">
              <Row label="Username" value={data.username} mono />
              <Row label="Password" value={data.password} mono />
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] leading-relaxed text-amber-800">
            Simpan kartu ini di tempat aman. Password tidak dapat dilihat lagi setelah popup ini ditutup.
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handlePrint}
              className="h-11 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-slate-700 transition flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              Cetak Kartu
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="h-11 rounded-xl border border-[#2457A7] bg-[#2457A7] hover:bg-[#1D4688] font-semibold text-white transition flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              {downloaded ? 'Download Lagi' : 'Download PNG'}
            </button>
          </div>

          <button
            type="button"
            onClick={onDashboard}
            className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition"
          >
            Buka Dashboard
          </button>
          <button type="button" onClick={onClose} className="w-full text-[12px] text-slate-500 hover:underline pt-1">
            Tutup dan periksa nanti
          </button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, mono }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className={`text-right font-medium text-slate-900 ${mono ? 'font-mono' : ''}`}>{value || '—'}</span>
    </div>
  )
}
