import { useState, useEffect, useMemo } from 'react';
import {
  saveNomorSurat,
  deleteNomorSurat,
  getStatistics,
  searchNomorSurat,
  getRomanMonth,
  getIndonesianMonth,
  getAllNomorSurat
} from '../../utils/nomorSuratHelper';
import storageHelper from '../../utils/storageHelper';
import { useToast } from '../../components/ui/Toast';
import { useSidebar } from '../../contexts/SidebarContext';

const { get, set } = storageHelper;

const STORAGE_KEY_FORMATS = 'spj_surat_custom_formats';

// KODE KLASIFIKASI RESMI
const KODE_KLASIFIKASI = [
  { kode: '421', nama: 'Surat Tugas' },
  { kode: '421.1', nama: 'ST Pelaksana Tugas' },
  { kode: '421.2', nama: 'ST Kepala Sekolah' },
  { kode: '421.3', nama: 'ST Guru' },
  { kode: '421.4', nama: 'ST Tenaga Kependidikan' },
  { kode: '422', nama: 'Surat Keterangan' },
  { kode: '422.1', nama: 'SK Pindah' },
  { kode: '422.2', nama: 'SK Lulus' },
  { kode: '423', nama: 'Surat Undangan' },
  { kode: '423.1', nama: 'SU Rapat' },
  { kode: '424', nama: 'Surat Pernyataan' },
  { kode: '425', nama: 'Surat Kuasa' },
  { kode: '426', nama: 'Surat Edaran' },
  { kode: '427', nama: 'SPD' }
];

// KODE PENDEK SURAT
const KODE_PENDEK = [
  { kode: 'STS', nama: 'Surat Tugas' },
  { kode: 'SK', nama: 'Surat Keterangan' },
  { kode: 'SU', nama: 'Surat Undangan' },
  { kode: 'SP', nama: 'Surat Pernyataan' },
  { kode: 'SKU', nama: 'Surat Kuasa' },
  { kode: 'SE', nama: 'Surat Edaran' },
  { kode: 'SPD', nama: 'Perintah Dinas' }
];

// Mapping
const KLASIFIKASI_TO_KODE = {
  '421': 'STS', '421.1': 'STS', '421.2': 'STS', '421.3': 'STS', '421.4': 'STS',
  '422': 'SK', '422.1': 'SK', '422.2': 'SK',
  '423': 'SU', '423.1': 'SU',
  '424': 'SP', '425': 'SKU', '426': 'SE', '427': 'SPD'
};

const KODE_TO_KLASIFIKASI = {
  'STS': '421.3', 'SK': '422', 'SU': '423', 'SP': '424', 'SKU': '425', 'SE': '426', 'SPD': '427'
};

// FORMAT: [Kode Klasifikasi]/[Kode Surat]-[Nomor]/[Nama SD]/[Bulan]/[Tahun]
// Contoh: 422.1/SK-001/SDN-PSR/VII/2026

const NomorSuratPage = () => {
  const toast = useToast();
  const { isMobile } = useSidebar();

  // State
  const [kodeKlasifikasi, setKodeKlasifikasi] = useState('422.1');
  const [namaSekolah, setNamaSekolah] = useState('SDN-PSR');
  const [kodePendek, setKodePendek] = useState('SK');
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());

  const [generatedNomor, setGeneratedNomor] = useState('');
  const [records, setRecords] = useState([]);
  const [statistics, setStatistics] = useState({ bulanIni: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKode, setFilterKode] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFormatModal, setShowFormatModal] = useState(false);
  const [showKlasifikasiModal, setShowKlasifikasiModal] = useState(false);
  const [showKodePendekModal, setShowKodePendekModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKlasifikasi, setSearchKlasifikasi] = useState('');
  const [searchKodePendek, setSearchKodePendek] = useState('');
  const itemsPerPage = 10;

  // Format state
  const [formatSegments, setFormatSegments] = useState([
    { id: 'klasifikasi', label: 'Kode Klasifikasi', enabled: true, order: 1, separator: '/' },
    { id: 'kode_pendek', label: 'Kode Surat', enabled: true, order: 2, separator: '-' },
    { id: 'nomor', label: 'Nomor Urut', value: '3', startNumber: '001', enabled: true, order: 3, separator: '/' },
    { id: 'nama_sd', label: 'Nama Sekolah', enabled: true, order: 4, separator: '/' },
    { id: 'bulan', label: 'Bulan', value: 'romawi', enabled: true, order: 5, separator: '/' },
    { id: 'tahun', label: 'Tahun', value: '4', enabled: true, order: 6 }
  ]);

  useEffect(() => {
    loadData();
    loadFormats();
  }, []);

  const loadData = () => {
    setRecords(searchNomorSurat());
    setStatistics(getStatistics());
  };

  const loadFormats = () => {
    const saved = get(STORAGE_KEY_FORMATS);
    if (saved && saved.segments) setFormatSegments(saved.segments);
  };

  // Get info
  const getKlasifikasiInfo = () => KODE_KLASIFIKASI.find(k => k.kode === kodeKlasifikasi) || KODE_KLASIFIKASI[0];
  const getKodePendekInfo = () => KODE_PENDEK.find(k => k.kode === kodePendek) || KODE_PENDEK[0];

  // Build nomor: [Kode Klasifikasi]/[Kode Surat]-[Nomor]/[Nama SD]/[Bulan]/[Tahun]
  const buildNomor = () => {
    const sorted = [...formatSegments]
      .filter(s => s.enabled)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    let result = '';

    sorted.forEach((seg, i) => {
      let value = '';
      switch (seg.id) {
        case 'klasifikasi': value = kodeKlasifikasi; break;
        case 'kode_pendek': value = kodePendek; break;
        case 'nomor':
          const digits = parseInt(seg.value) || 3;
          const startNum = parseInt(seg.startNumber) || 1;
          const existingRecords = getAllNomorSurat();
          const sameType = existingRecords.filter(r => r.kode === kodeKlasifikasi && r.bulan === bulan && r.tahun === tahun);
          let lastNum = startNum - 1;
          sameType.forEach(r => { if (r.nomorUrut > lastNum) lastNum = r.nomorUrut; });
          value = String(lastNum + 1).padStart(digits, '0');
          break;
        case 'nama_sd': value = namaSekolah; break;
        case 'bulan':
          if (seg.value === 'angka') value = String(bulan).padStart(2, '0');
          else if (seg.value === 'nama') value = getIndonesianMonth(bulan);
          else value = getRomanMonth(bulan);
          break;
        case 'tahun':
          value = seg.value === '2' ? String(tahun).slice(-2) : String(tahun);
          break;
        default: value = seg.value || '';
      }

      if (i > 0) result += sorted[i-1].separator || '/';
      result += value;
    });

    return result;
  };

  // Generate
  const handleGenerate = () => {
    const existingRecords = getAllNomorSurat();
    const sameType = existingRecords.filter(r => r.kode === kodeKlasifikasi && r.bulan === bulan && r.tahun === tahun);
    let lastNum = 0;
    sameType.forEach(r => { if (r.nomorUrut > lastNum) lastNum = r.nomorUrut; });
    const nextNum = lastNum + 1;

    const nomor = buildNomor();
    setGeneratedNomor({ nomor, nomorUrut: nextNum });
  };

  // Save
  const handleUseNomor = () => {
    if (!generatedNomor) { toast.error('Generate dulu!'); return; }
    try {
      const record = {
        id: `ns_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        nomor: generatedNomor.nomor,
        kode: kodeKlasifikasi,
        kodePendek,
        jenis: getKlasifikasiInfo().nama,
        namaSekolah,
        nomorUrut: generatedNomor.nomorUrut,
        bulan, bulanRomawi: getRomanMonth(bulan), tahun,
        createdAt: new Date().toISOString(),
        status: 'used'
      };
      saveNomorSurat(record);
      toast.success('Nomor tersimpan!');
      setGeneratedNomor('');
      loadData();
    } catch (error) { toast.error(error.message); }
  };

  const handleCopy = (nomor) => {
    navigator.clipboard.writeText(nomor);
    toast.success('Tersalin!');
  };

  const handleDeleteClick = (record) => { setRecordToDelete(record); setShowDeleteConfirm(true); };

  const handleDeleteConfirm = () => {
    if (!recordToDelete) return;
    try {
      deleteNomorSurat(recordToDelete.id);
      toast.success('Dihapus');
      setShowDeleteConfirm(false);
      setRecordToDelete(null);
      loadData();
    } catch (error) { toast.error(error.message); }
  };

  // Badge color
  const getBadgeColor = (kode) => {
    if (kode.startsWith('421')) return 'bg-blue-500';
    if (kode.startsWith('422')) return 'bg-emerald-500';
    if (kode.startsWith('423')) return 'bg-violet-500';
    if (kode.startsWith('424')) return 'bg-amber-500';
    if (kode.startsWith('425')) return 'bg-rose-500';
    if (kode.startsWith('426')) return 'bg-teal-500';
    return 'bg-slate-500';
  };

  // Get display value
  const getDisplayValue = (seg) => {
    switch (seg.id) {
      case 'klasifikasi': return kodeKlasifikasi;
      case 'kode_pendek': return kodePendek;
      case 'nomor': return seg.startNumber || '001';
      case 'nama_sd': return namaSekolah;
      case 'bulan': return 'VII';
      case 'tahun': return '2026';
      default: return seg.value || '...';
    }
  };

  // Save format
  const handleSaveFormat = () => {
    try {
      localStorage.setItem('spj_surat_custom_formats', JSON.stringify({ segments: formatSegments }));
      toast.success('Format tersimpan!');
      setShowFormatModal(false);
    } catch (e) {
      toast.error('Gagal menyimpan format');
    }
  };

  // Filtered records
  const filteredRecords = useMemo(() => {
    let filtered = searchNomorSurat(searchQuery);
    if (filterKode) filtered = filtered.filter(r => r.kodePendek === filterKode);
    return filtered;
  }, [searchQuery, filterKode]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const filteredKlasifikasi = useMemo(() => {
    if (!searchKlasifikasi) return KODE_KLASIFIKASI;
    const q = searchKlasifikasi.toLowerCase();
    return KODE_KLASIFIKASI.filter(k => k.kode.includes(q) || k.nama.toLowerCase().includes(q));
  }, [searchKlasifikasi]);

  const filteredKodePendek = useMemo(() => {
    if (!searchKodePendek) return KODE_PENDEK;
    const q = searchKodePendek.toLowerCase();
    return KODE_PENDEK.filter(k => k.kode.toLowerCase().includes(q) || k.nama.toLowerCase().includes(q));
  }, [searchKodePendek]);

  // Format modal helpers
  const moveSegment = (index, direction) => {
    const newSegments = [...formatSegments];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newSegments.length) return;
    [newSegments[index], newSegments[newIndex]] = [newSegments[newIndex], newSegments[index]];
    setFormatSegments(newSegments.map((seg, i) => ({ ...seg, order: i + 1 })));
  };

  const toggleSegment = (index) => {
    const newSegments = [...formatSegments];
    newSegments[index] = { ...newSegments[index], enabled: !newSegments[index].enabled };
    setFormatSegments(newSegments);
  };

  const updateSeparator = (index, separator) => {
    const newSegments = [...formatSegments];
    newSegments[index] = { ...newSegments[index], separator };
    setFormatSegments(newSegments);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* HEADER */}
      <div className={`bg-white border-b border-slate-200 ${isMobile ? 'px-4 py-5' : 'px-8 py-6'}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white text-xl">pin</span>
            </div>
            <div>
              <h1 className={`font-bold text-slate-900 ${isMobile ? 'text-xl' : 'text-2xl'}`}>Nomor Surat</h1>
            </div>
          </div>
          <button onClick={() => setShowFormatModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium text-slate-700 transition-colors">
            <span className="material-symbols-outlined text-lg">tune</span> Format
          </button>
        </div>
      </div>

      <div className={`${isMobile ? 'px-4 py-6' : 'px-8 py-8'} max-w-6xl mx-auto`}>
        {/* GENERATOR */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
          <div className="p-6">

            {/* 1. Kode Klasifikasi */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">1. Kode Klasifikasi</label>
              <div onClick={() => setShowKlasifikasiModal(true)}
                className="p-4 bg-white border-2 border-slate-200 rounded-xl cursor-pointer hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${getBadgeColor(kodeKlasifikasi)}`}></span>
                    <div>
                      <p className="font-mono font-bold text-slate-900">{kodeKlasifikasi}</p>
                      <p className="text-sm text-slate-500">{getKlasifikasiInfo().nama}</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                </div>
              </div>
            </div>

            {/* 2. Kode Surat */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">2. Kode Surat</label>
              <div onClick={() => setShowKodePendekModal(true)}
                className="p-4 bg-white border-2 border-slate-200 rounded-xl cursor-pointer hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-bold font-mono">{kodePendek}</span>
                    <p className="text-sm text-slate-500">{getKodePendekInfo().nama}</p>
                  </div>
                  <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                </div>
              </div>
            </div>

            {/* 3. Nama Sekolah */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">3. Nama / Kode Sekolah</label>
              <input type="text" value={namaSekolah} onChange={(e) => setNamaSekolah(e.target.value)}
                placeholder="SDN / SMPN / SMAN / SDN-PSR"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" />
            </div>

            {/* Preview */}
            <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Preview</p>
              <div className="flex flex-wrap items-center gap-0.5 p-3 bg-white rounded-xl border border-slate-200">
                {(() => {
                  const enabledSegs = formatSegments
                    .filter(s => s.enabled)
                    .sort((a, b) => (a.order || 0) - (b.order || 0));
                  return enabledSegs.map((seg, i) => (
                    <span key={seg.id} className="flex items-center">
                      {i > 0 && <span className="text-primary font-bold mx-1">{enabledSegs[i-1].separator || '/'}</span>}
                      <span className="px-2 py-1.5 bg-primary/10 rounded-lg text-sm font-mono font-semibold text-primary">
                        {getDisplayValue(seg)}
                      </span>
                    </span>
                  ));
                })()}
              </div>
            </div>

            {/* Bulan & Tahun */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Bulan</label>
                <select value={bulan} onChange={(e) => setBulan(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(b => (
                    <option key={b} value={b}>{getRomanMonth(b)} — {getIndonesianMonth(b)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tahun</label>
                <select value={tahun} onChange={(e) => setTahun(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none">
                  {[2024, 2025, 2026, 2027, 2028].map(t => (<option key={t} value={t}>{t}</option>))}
                </select>
              </div>
            </div>

            {/* Generate */}
            <button onClick={handleGenerate}
              className="w-full py-4 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-white font-semibold rounded-2xl shadow-lg shadow-primary/25 transition-all hover:shadow-xl flex items-center justify-center gap-2 mb-6">
              <span className="material-symbols-outlined text-xl">autorenew</span> Generate Nomor
            </button>

            {/* Generated */}
            {generatedNomor && (
              <div className="p-5 bg-gradient-to-r from-primary/5 to-blue-50 rounded-2xl border border-primary/10">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Nomor Surat</p>
                <p className="text-xl font-mono font-bold text-primary break-all mb-4">{generatedNomor.nomor}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleCopy(generatedNomor.nomor)} className="flex-1 py-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-all text-sm font-medium text-slate-700 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-lg">content_copy</span> Salin
                  </button>
                  <button onClick={handleUseNomor} className="flex-1 py-3 bg-primary hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">check_circle</span> Simpan
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* DAFTAR NOMOR */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Daftar Nomor</h2>
                <p className="text-sm text-slate-500">{filteredRecords.length} surat</p>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-xl">search</span>
                <input type="text" placeholder="Cari..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none w-48" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <button onClick={() => setFilterKode('')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterKode === '' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Semua</button>
              {['STS', 'SK', 'SU', 'SP', 'SKU', 'SE'].map(kode => (
                <button key={kode} onClick={() => setFilterKode(kode)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterKode === kode ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{kode}</button>
              ))}
            </div>
          </div>

          <div className="p-4">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-slate-300 text-5xl mb-4 block">folder_off</span>
                <p className="text-slate-500 font-medium">Belum ada nomor</p>
              </div>
            ) : (
              <>
                {!isMobile && (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">No</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Nomor</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Jenis</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Tanggal</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRecords.map((record, index) => (
                        <tr key={record.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                          <td className="py-4 px-4 text-sm text-slate-400">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                          <td className="py-4 px-4"><span className="font-mono font-semibold text-slate-900 text-sm">{record.nomor}</span></td>
                          <td className="py-4 px-4"><span className={`inline-flex px-2 py-1 rounded text-xs font-semibold text-white ${getBadgeColor(record.kode)}`}>{record.kode}</span></td>
                          <td className="py-4 px-4 text-sm text-slate-500">{new Date(record.createdAt).toLocaleDateString('id-ID')}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => handleCopy(record.nomor)} className="p-2 hover:bg-slate-100 rounded-lg"><span className="material-symbols-outlined text-slate-400 text-lg">content_copy</span></button>
                              <button onClick={() => { setSelectedRecord(record); setShowDetailModal(true); }} className="p-2 hover:bg-slate-100 rounded-lg"><span className="material-symbols-outlined text-slate-400 text-lg">visibility</span></button>
                              <button onClick={() => handleDeleteClick(record)} className="p-2 hover:bg-red-50 rounded-lg"><span className="material-symbols-outlined text-red-500 text-lg">delete</span></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {isMobile && (
                  <div className="space-y-3">
                    {paginatedRecords.map((record) => (
                      <div key={record.id} className="p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-mono font-semibold text-slate-900 text-sm">{record.nomor}</span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${getBadgeColor(record.kode)}`}>{record.kode}</span>
                        </div>
                        <p className="text-xs text-slate-400 mb-3">{new Date(record.createdAt).toLocaleDateString('id-ID')}</p>
                        <div className="flex gap-2">
                          <button onClick={() => handleCopy(record.nomor)} className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600">Salin</button>
                          <button onClick={() => { setSelectedRecord(record); setShowDetailModal(true); }} className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600">Detail</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                    <p className="text-sm text-slate-400">{currentPage} dari {totalPages}</p>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30"><span className="material-symbols-outlined">chevron_left</span></button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let page = totalPages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
                        return <button key={page} onClick={() => setCurrentPage(page)} className={`w-10 h-10 rounded-lg text-sm font-medium ${currentPage === page ? 'bg-primary text-white' : 'hover:bg-slate-100'}`}>{page}</button>;
                      })}
                      <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30"><span className="material-symbols-outlined">chevron_right</span></button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* KODE KLASIFIKASI MODAL */}
      {showKlasifikasiModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900">Pilih Kode Klasifikasi</h3>
                <button onClick={() => { setShowKlasifikasiModal(false); setSearchKlasifikasi(''); }} className="p-2 hover:bg-slate-100 rounded-xl">
                  <span className="material-symbols-outlined text-slate-400">close</span>
                </button>
              </div>
              <div className="mt-4 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-xl">search</span>
                <input type="text" placeholder="Cari..." value={searchKlasifikasi} onChange={(e) => setSearchKlasifikasi(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
              </div>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <div className="space-y-2">
                {filteredKlasifikasi.map(item => (
                  <button key={item.kode} onClick={() => {
                    setKodeKlasifikasi(item.kode);
                    setKodePendek(KLASIFIKASI_TO_KODE[item.kode] || 'STS');
                    setShowKlasifikasiModal(false);
                    setSearchKlasifikasi('');
                  }}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                      kodeKlasifikasi === item.kode ? 'bg-primary/5 border-primary/20' : 'bg-white border-slate-200 hover:border-primary/20'
                    }`}>
                    <span className={`w-3 h-3 rounded-full ${getBadgeColor(item.kode)}`}></span>
                    <div className="flex-1">
                      <p className="font-mono font-bold text-slate-900 text-sm">{item.kode}</p>
                      <p className="text-xs text-slate-500">{item.nama}</p>
                    </div>
                    {kodeKlasifikasi === item.kode && <span className="material-symbols-outlined text-primary">check_circle</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KODE PENDEK MODAL */}
      {showKodePendekModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900">Pilih Kode Surat</h3>
                <button onClick={() => { setShowKodePendekModal(false); setSearchKodePendek(''); }} className="p-2 hover:bg-slate-100 rounded-xl">
                  <span className="material-symbols-outlined text-slate-400">close</span>
                </button>
              </div>
              <div className="mt-4 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-xl">search</span>
                <input type="text" placeholder="Cari..." value={searchKodePendek} onChange={(e) => setSearchKodePendek(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
              </div>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <div className="space-y-2">
                {filteredKodePendek.map(item => (
                  <button key={item.kode} onClick={() => {
                    setKodePendek(item.kode);
                    setKodeKlasifikasi(KODE_TO_KLASIFIKASI[item.kode] || '421.3');
                    setShowKodePendekModal(false);
                    setSearchKodePendek('');
                  }}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                      kodePendek === item.kode ? 'bg-primary/5 border-primary/20' : 'bg-white border-slate-200 hover:border-primary/20'
                    }`}>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-bold font-mono">{item.kode}</span>
                    <p className="text-sm text-slate-600">{item.nama}</p>
                    {kodePendek === item.kode && <span className="material-symbols-outlined text-primary ml-auto">check_circle</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FORMAT SETTINGS MODAL */}
      {showFormatModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowFormatModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Edit Format Nomor</h3>
              <button onClick={() => setShowFormatModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <span className="material-symbols-outlined text-slate-400">close</span>
              </button>
            </div>

            {/* Preview */}
            <div className="px-6 py-4 bg-primary/5">
              <p className="text-xs font-medium text-primary mb-2 uppercase">Preview</p>
              <div className="flex flex-wrap items-center gap-0.5 p-3 bg-white rounded-xl border border-primary/20">
                {formatSegments
                  .filter(s => s.enabled)
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((seg, i, arr) => (
                    <span key={seg.id} className="flex items-center">
                      {i > 0 && <span className="text-primary font-bold mx-1">{arr[i-1].separator || '/'}</span>}
                      <span className="px-2 py-1 bg-primary/10 rounded text-sm font-mono font-semibold text-primary">
                        {getDisplayValue(seg)}
                      </span>
                    </span>
                  ))
                }
              </div>
            </div>

            {/* Segments */}
            <div className="px-6 py-4 max-h-[40vh] overflow-y-auto">
              <div className="space-y-2">
                {formatSegments
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((seg, index) => (
                  <div key={seg.id} className={`p-3 rounded-xl border flex items-center gap-2 ${seg.enabled ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-50'}`}>
                    <div className="flex flex-col">
                      <button onClick={() => moveSegment(index, 'up')} disabled={index === 0} className="p-0.5 hover:bg-slate-100 rounded disabled:opacity-20">
                        <span className="material-symbols-outlined text-slate-400 text-sm">expand_less</span>
                      </button>
                      <button onClick={() => moveSegment(index, 'down')} disabled={index === formatSegments.length - 1} className="p-0.5 hover:bg-slate-100 rounded disabled:opacity-20">
                        <span className="material-symbols-outlined text-slate-400 text-sm">expand_more</span>
                      </button>
                    </div>

                    <button onClick={() => toggleSegment(index)} className="p-1">
                      <span className={`material-symbols-outlined text-lg ${seg.enabled ? 'text-primary' : 'text-slate-300'}`}>{seg.enabled ? 'visibility' : 'visibility_off'}</span>
                    </button>

                    <div className="flex-1">
                      <p className="font-medium text-slate-700 text-sm">{seg.label}</p>
                      {seg.id === 'nomor' && (
                        <div className="flex items-center gap-2 mt-1">
                          <input type="text" value={seg.startNumber || '001'} 
                            onChange={(e) => {
                              const newSegments = [...formatSegments];
                              newSegments[index] = { ...newSegments[index], startNumber: e.target.value };
                              setFormatSegments(newSegments);
                            }}
                            placeholder="Mulai dari"
                            className="w-16 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono text-center" />
                          <span className="text-xs text-slate-400">= awal</span>
                        </div>
                      )}
                    </div>

                    <select value={seg.separator || '/'} onChange={(e) => updateSeparator(index, e.target.value)} className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono">
                      <option value="/">/</option>
                      <option value="-">-</option>
                      <option value=".">.</option>
                      <option value="_">_</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <button onClick={() => setShowFormatModal(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-2xl">Batal</button>
              <button onClick={() => { handleSaveFormat(); }} className="flex-1 py-3 bg-primary hover:bg-blue-600 text-white font-semibold rounded-2xl shadow-lg">Simpan Format</button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {showDetailModal && selectedRecord && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Detail</h3>
                <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-lg font-mono font-bold text-slate-900 text-center mb-6 break-all">{selectedRecord.nomor}</p>
              <div className="space-y-2">
                {[
                  { label: 'Kode', value: selectedRecord.kode },
                  { label: 'Jenis', value: selectedRecord.jenis },
                  { label: 'Bulan', value: getIndonesianMonth(selectedRecord.bulan) },
                  { label: 'Tahun', value: selectedRecord.tahun }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-slate-50 last:border-0">
                    <span className="text-slate-400 text-sm">{item.label}</span>
                    <span className="font-medium text-slate-700 text-sm">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => { handleCopy(selectedRecord.nomor); setShowDetailModal(false); }} className="flex-1 py-3 bg-primary hover:bg-blue-600 text-white font-medium rounded-2xl">Salin</button>
                <button onClick={() => setShowDetailModal(false)} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-2xl">Tutup</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE */}
      {showDeleteConfirm && recordToDelete && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl">
            <div className="p-6 text-center">
              <span className="material-symbols-outlined text-red-500 text-5xl mb-4 block">delete</span>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Hapus?</h3>
              <p className="font-mono font-semibold text-slate-700 mb-4 text-sm break-all">{recordToDelete.nomor}</p>
              <div className="flex gap-3">
                <button onClick={() => { setShowDeleteConfirm(false); setRecordToDelete(null); }} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-2xl">Batal</button>
                <button onClick={handleDeleteConfirm} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-2xl">Hapus</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NomorSuratPage;
