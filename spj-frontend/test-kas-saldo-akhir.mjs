/**
 * Oracle model "Saldo Akhir = uang tunai" (pilihan user 2026-10-19).
 * Bukti: untuk data BKU riil 300 transaksi Jan–Jun 2026, saldo akhir tiap
 * bulan dipecah greedy → subKertas+subLogam ≈ saldoAkhir (sisa < Rp 100),
 * Sub 3 = 0, B = A, perbedaan = sisa (atau 0 bila saldoAkhir kelipatan 100).
 *
 * Run: npx esbuild test-kas-saldo-akhir.mjs --bundle --platform=node --format=esm
 */
import * as XLSX from 'xlsx'
import { readFileSync } from 'fs'

// ─── replicate bkuParser core (node-friendly) ───
const DATA_COLUMNS = { TANGGAL:0, KODE_KEGIATAN:3, KODE_REKENING:5, NO_BUKTI:8, URAIAN:10, PENERIMAAN:13, PENGELUARAN:16, SALDO:19 }
const DATA_START_ROW=15, MAX_DATA_ROW=1000
const getCell=(ws,r,c)=>{const a=XLSX.utils.encode_cell({r,c});const cell=ws[a];return cell?cell.v:null}
const parseNumber=(val)=>{if(val==null||val==='')return 0;if(typeof val==='number')return val;if(typeof val==='string'){const c=val.replace(/[Rp\s]/g,'').replace(/\./g,'').replace(',','.');const p=parseFloat(c);return isNaN(p)?0:p}return 0}
const parseTanggal=(val)=>{if(typeof val==='string'){const p=val.split('-');if(p.length===3){const d=+p[0],m=+p[1],y=+p[2];if(d>=1&&d<=31&&m>=1&&m<=12)return{day:d,month:m,year:y}}}if(typeof val==='number'){const di=XLSX.SSF.parse_date_code(val);if(di)return{day:di.d,month:di.m,year:di.y}}return null}
function detect(u,nb,pen,peng,kk,kr){u=(u||'').toLowerCase();nb=(nb||'').toUpperCase()
  if(u.includes('saldo bank')||u.includes('saldo tunai'))return 'SALDO_AWAL'
  if(pen>0&&(nb.startsWith('BBU')||u.includes('dana bosp')||u.includes('bosp tahap')))return 'PENERIMAAN_BOSP'
  if(peng>0&&(nb.startsWith('BNU')||nb.startsWith('BPU')))return 'PEMBAYARAN'
  if(peng>0&&!kk&&!kr&&(u.includes('tarik')||u.includes('tunai')||u.includes('ambil')||u.includes('penarikan')))return 'TARIK_TUNAI'
  if(peng>0&&kk)return 'PEMBAYARAN'
  if(peng>0&&!kk&&!kr&&!nb)return 'TARIK_TUNAI'
  return 'LAINNYA'}
function parseTx(ws){const last=Math.min(XLSX.utils.decode_range(ws['!ref']).e.r,MAX_DATA_ROW);const out=[]
  for(let row=DATA_START_ROW;row<=last;row++){const t=getCell(ws,row,DATA_COLUMNS.TANGGAL);if(t==null||t===undefined)continue
    if(typeof t==='string'&&t.includes('BKU-ALL'))continue
    if(t===1||t==='1'){const n=getCell(ws,row,DATA_COLUMNS.KODE_KEGIATAN);if(n===2||n==='2')continue}
    const p=parseTanggal(t);if(!p)continue
    const kk=getCell(ws,row,DATA_COLUMNS.KODE_KEGIATAN),kr=getCell(ws,row,DATA_COLUMNS.KODE_REKENING)
    const nb=getCell(ws,row,DATA_COLUMNS.NO_BUKTI),u=getCell(ws,row,DATA_COLUMNS.URAIAN)
    const pen=parseNumber(getCell(ws,row,DATA_COLUMNS.PENERIMAAN)),peng=parseNumber(getCell(ws,row,DATA_COLUMNS.PENGELUARAN))
    const saldo=parseNumber(getCell(ws,row,DATA_COLUMNS.SALDO))
    out.push({tanggalISO:`${p.year}-${String(p.month).padStart(2,'0')}-${String(p.day).padStart(2,'0')}`,bulan:p.month,
      kodeKegiatan:kk?String(kk).trim():'',kodeRekening:kr?String(kr).trim():'',noBukti:nb?String(nb).trim():'',
      uraian:u?String(u).trim():'',penerimaan:pen,pengeluaran:peng,saldo,tipe:detect(u,nb,pen,peng,kk,kr)})}
  return out}

// ─── dokKas helpers (replicated) ───
const num=v=>Number(v||0)||0
const transaksiBulan=(txs,m)=>[...txs.filter(t=>Number(t.bulan)===m)].sort((a,b)=>String(a.tanggalISO).localeCompare(String(b.tanggalISO)))
function ringkasanKasPerBulan(txs,m){const list=transaksiBulan(txs,m);if(!list.length)return{adaData:false,D:0,K:0,A:0,saldoAkhir:0}
  const sa=num(list[0].saldo)-num(list[0].penerimaan)+num(list[0].pengeluaran)
  const masuk=list.filter(t=>t.tipe==='PENERIMAAN_BOSP').reduce((s,t)=>s+num(t.penerimaan),0)
  const D=sa+masuk, A=num(list[list.length-1].saldo)
  return{adaData:true,D,K:D-A,A,saldoAkhir:A}}
const NOMINAL_KERTAS=[100000,50000,20000,10000,5000,2000,1000]
const NOMINAL_LOGAM=[1000,500,200,100]
const PECAHAN_DAFTAR=[
  ...NOMINAL_KERTAS.map(n=>({id:`k-${n}`,jenis:'Kertas',nominal:n,satuan:'Lembar'})),
  ...NOMINAL_LOGAM.map(n=>({id:`l-${n}`,jenis:'Logam',nominal:n,satuan:'Keping'}))]
function pecahanDariSaldo(nominal=0){let sisa=Math.max(0,Math.floor(Number(nominal)||0));const out={}
  for(const d of PECAHAN_DAFTAR){const jml=Math.floor(sisa/d.nominal);if(jml>0){out[d.id]=jml;sisa-=jml*d.nominal}}
  return out}
function lembarPecahan(tersimpan=[],saldoTunai=0){const auto=pecahanDariSaldo(saldoTunai)
  const byId=new Map((Array.isArray(tersimpan)?tersimpan:[]).filter(r=>r&&r.id!=null).map(r=>[String(r.id),r]))
  return PECAHAN_DAFTAR.map(d=>{const t=byId.get(d.id);const ketikan=t?String(t.lembar??'').trim():'';const lembar=ketikan!==''?t.lembar:(auto[d.id]??'');return{...d,lembar}})}
function subtotalPecahanJenis(pecahan=[],jenis){return(Array.isArray(pecahan)?pecahan:[]).filter(r=>r&&r.jenis===jenis).reduce((s,r)=>s+(num(r.nominal)||0)*(num(r.lembar)||0),0)}

// ─── test ───
const FILE='D:/project/spj-app/template-data/Realisasi Sekolah Buku Kas Umum (BKU) - Manajemen Aplikasi RKAS - 2026.xlsx'
const wb=XLSX.read(readFileSync(FILE),{type:'buffer'})
const txs=parseTx(wb.Sheets[wb.SheetNames[0]])
const NAMA=['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
let fail=0, pass=0

for(let m=1;m<=12;m++){
  const ring=ringkasanKasPerBulan(txs,m)
  if(!ring.adaData)continue
  const pecahan=lembarPecahan([],ring.saldoAkhir)
  const subK=subtotalPecahanJenis(pecahan,'Kertas')
  const subL=subtotalPecahanJenis(pecahan,'Logam')
  const sub3=0
  const B=subK+subL+sub3
  const sisa=ring.saldoAkhir-B
  const ok=(sisa>=0 && sisa<100)
  const label=`${NAMA[m]} | saldoAkhir=${ring.saldoAkhir} | subK+subL=${subK+subL} | sub3=${sub3} | B=${B} | sisa=${sisa} | ${ok?'PASS':'FAIL'}`
  if(ok){pass++;console.log('PASS:',label)}else{fail++;console.log('FAIL:',label)}
}

console.log(`\nHasil: ${pass} PASS / ${pass+fail} total`)
process.exit(fail>0?1:0)
