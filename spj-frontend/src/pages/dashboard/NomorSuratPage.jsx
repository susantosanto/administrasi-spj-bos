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

// KODE KLASIFIKASI RESMI DINAS PENDIDIKAN
const KODE_KLASIFIKASI = [
  { kode: '421', nama: 'Surat Tugas' },
  { kode: '421.1', nama: 'Surat Tugas Pelaksana Tugas' },
  { kode: '421.2', nama: 'Surat Tugas Kepala Sekolah' },
  { kode: '421.3', nama: 'Surat Tugas Guru' },
  { kode: '421.4', nama: 'Surat Tugas Tenaga Kependidikan' },
  { kode: '422', nama: 'Surat Keterangan' },
  { kode: '422.1', nama: 'Surat Keterangan Pindah' },
  { kode: '422.2', nama: 'Surat Keterangan Lulus' },
  { kode: '422.3', nama: 'Surat Keterangan Aktif Mengajar' },
  { kode: '423', nama: 'Surat Undangan' },
  { kode: '423.1', nama: 'Surat Undangan Rapat' },
  { kode: '424', nama: 'Surat Pernyataan' },
  { kode: '425', nama: 'Surat Kuasa' },
  { kode: '426', nama: 'Surat Edaran' },
  { kode: '427', nama: 'Surat Tugas Perjalanan Dinas' }
];

// Default segments - LENGKAP: Nama SD + Kode Surat + Nomor + Bulan + Tahun
const DEFAULT_SEGMENTS = [
  { id: 'nama_sd', type: 'dynamic', label: 'Nama SD', value: 'SDN', enabled: true, order: 1, separator: '/' },
  { id: 'kode', type: 'dynamic', label: 'Kode Surat', value: '421.3', enabled: true, order: 2, separator: '-' },
  { id: 'nomor', type: 'dynamic', label: 'Nomor Urut', value: '3', enabled: true, order: 3, separator: '/' },
  { id: 'bulan', type: 'dynamic', label: 'Bulan', value: 'romawi', enabled: true, order: 4, separator: '/' },
  { id: 'tahun', type: 'dynamic', label: 'Tahun', value: '4', enabled: true, order: 5 }
];

const NomorSuratPage = () => {
  const { showToast } = useToast();
  const { isMobile } = useSidebar();
  
  // State
  const [namaSekolah, setNamaSekolah] = useState('SDN');
  const [kodeSurat, setKodeSurat] = useState('421.3');
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  
  const [generatedNomor, setGeneratedNomor] = useState('');
  const [records, setRecords] = useState([]);
  const [statistics, setStatistics] = useState({ bulanIni: 0, tahunIni: 0, hariIni: 0, terakhir: '-' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKode, setFilterKode] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFormatModal, setShowFormatModal] = useState(false);
  const [showKodeModal, setShowKodeModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [customFormats, setCustomFormats] = useState({});
  const [editingFormat, setEditingFormat] = useState(null);
  const [searchKode, setSearchKode] = useState('');
  const itemsPerPage = 10;
  
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
    if (saved) setCustomFormats(saved);
  };
  
  // Get current format
  const getCurrentFormat = () => {
    return {
      segments: DEFAULT_SEGMENTS.map(s => ({
        ...s,
        value: s.id === 'kode' ? kodeSurat : s.value
      }))
    };
  };
  
  const currentFormat = getCurrentFormat();
  
  // Get kode info
  const getKodeInfo = () => KODE_KLASIFIKASI.find(k => k.kode === kodeSurat) || KODE_KLASIFIKASI[0];
  
  // Build nomor - FORMAT: [NamaSD]/[Kode]-[Nomor]/[Bulan]/[Tahun]
  const buildNomor = (segments, values) => {
    const sorted = [...segments]
      .filter(s => s.enabled)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    
    let result = '';
    
    sorted.forEach((seg, i) => {
      let value = '';
      
      if (seg.type === 'custom') {
        value = seg.value;
      } else {
        switch (seg.id) {
          case 'nama_sd': value = values.nama_sd || seg.value; break;
          case 'kode': value = values.kode || seg.value; break;
          case 'nomor':
            const digits = parseInt(seg.value) || 3;
            value = String(values.nomor || 1).padStart(digits, '0');
            break;
          case 'bulan':
            if (seg.value === 'angka') value = String(values.bulan).padStart(2, '0');
            else if (seg.value === 'nama') value = getIndonesianMonth(values.bulan);
            else value = getRomanMonth(values.bulan);
            break;
          case 'tahun':
            value = seg.value === '2' ? String(values.tahun).slice(-2) : String(values.tahun);
            break;
          default: value = seg.value;
        }
      }
      
      // Add separator before this segment (except first)
      if (i > 0) {
        result += seg.separator || '/';
      }
      
      result += value;
    });
    
    return result;
  };
  
  // Generate nomor
  const handleGenerate = () => {
    const existingRecords = getAllNomorSurat();
    const sameTypeRecords = existingRecords.filter(r => 
      r.kode === kodeSurat && r.bulan === bulan && r.tahun === tahun
    );
    
    let lastNumber = 0;
    sameTypeRecords.forEach(r => { if (r.nomorUrut > lastNumber) lastNumber = r.nomorUrut; });
    
    const nextNumber = lastNumber + 1;
    const nomor = buildNomor(currentFormat.segments, {
      nama_sd: namaSekolah,
      kode: kodeSurat,
      nomor: nextNumber,
      bulan,
      tahun
    });
    
    setGeneratedNomor({ nomor, nomorUrut: nextNumber });
  };
  
  // Save
  const handleUseNomor = () => {
    if (!generatedNomor) { showToast('Generate nomor terlebih dahulu', 'error'); return; }
    
    try {
      const kodeInfo = getKodeInfo();
      const record = {
        id: `ns_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        nomor: generatedNomor.nomor,
        kode: kodeSurat,
        jenis: kodeInfo.nama,
        namaSekolah,
        nomorUrut: generatedNomor.nomorUrut,
        bulan, bulanRomawi: getRomanMonth(bulan), tahun,
        createdAt: new Date().toISOString(),
        usedAt: new Date().toISOString(),
        status: 'used'
      };
      
      saveNomorSurat(record);
      showToast(`Nomor ${generatedNomor.nomor} berhasil digunakan!`, 'success');
      setGeneratedNomor('');
      loadData();
    } catch (error) { showToast(error.message, 'error'); }
  };
  
  const handleCopy = (nomor) => {
    navigator.clipboard.writeText(nomor);
    showToast('Berhasil disalin!', 'success');
  };
  
  const handleDeleteClick = (record) => { setRecordToDelete(record); setShowDeleteConfirm(true); };
  
  const handleDeleteConfirm = () => {
    if (!recordToDelete) return;
    try {
      deleteNomorSurat(recordToDelete.id);
      showToast('Berhasil dihapus', 'success');
      setShowDeleteConfirm(false);
      setRecordToDelete(null);
      loadData();
    } catch (error) { showToast(error.message, 'error'); }
  };
  
  // Badge color
  const getBadgeColor = (kode) => {
    if (kode.startsWith('421')) return 'bg-blue-500';
    if (kode.startsWith('422')) return 'bg-emerald-500';
    if (kode.startsWith('423')) return 'bg-violet-500';
    if (kode.startsWith('424')) return 'bg-amber-500';
    if (kode.startsWith('425')) return 'bg-rose-500';
    if (kode.startsWith('426')) return 'bg-teal-500';
    if (kode.startsWith('427')) return 'bg-cyan-500';
    return 'bg-slate-500';
  };
  
  // Segment display value
  const getSegmentDisplayValue = (seg) => {
    if (seg.type === 'custom') return seg.value || 'custom';
    switch (seg.id) {
      case 'nama_sd': return seg.value;
      case 'kode': return seg.value;
      case 'nomor': return '0'.repeat(parseInt(seg.value) || 3);
      case 'bulan':
        if (seg.value === 'angka') return '07';
        if (seg.value === 'nama') return 'Juli';
        return 'VII';
      case 'tahun': return seg.value === '2' ? '26' : '2026';
      default: return seg.value;
    }
  };
  
  // Segment options
  const getSegmentOptions = (segId) => {
    switch (segId) {
      case 'bulan': return [{ value: 'romawi', label: 'Romawi (VII)' }, { value: 'angka', label: 'Angka (07)' }, { value: 'nama', label: 'Nama (Juli)' }];
      case 'tahun': return [{ value: '4', label: '4 digit (2026)' }, { value: '2', label: '2 digit (26)' }];
      case 'nomor': return [{ value: '3', label: '3 digit (001-999)' }, { value: '4', label: '4 digit (0001-9999)' }, { value: '5', label: '5 digit (00001-99999)' }];
      default: return [];
    }
  };
  
  // Move segment
  const moveSegment = (segments, index, direction) => {
    const newSegments = [...segments];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newSegments.length) return newSegments;
    [newSegments[index], newSegments[newIndex]] = [newSegments[newIndex], newSegments[index]];
    return newSegments.map((seg, i) => ({ ...seg, order: i + 1 }));
  };
  
  const toggleSegment = (segments, index) => {
    const newSegments = [...segments];
    newSegments[index] = { ...newSegments[index], enabled: !newSegments[index].enabled };
    return newSegments;
  };
  
  const updateSegmentValue = (segments, index, value) => {
    const newSegments = [...segments];
    newSegments[index] = { ...newSegments[index], value };
    return newSegments;
  };
  
  const updateSegmentSeparator = (segments, index, separator) => {
    const newSegments = [...segments];
    newSegments[index] = { ...newSegments[index], separator };
    return newSegments;
  };
  
  const addCustomSegment = (segments) => {
    const newSeg = { id: `custom_${Date.now()}`, type: 'custom', label: '', value: '', enabled: true, order: segments.length + 1, separator: '/' };
    return [...segments, newSeg];
  };
  
  const removeSegment = (segments, index) => {
    return segments.filter((_, i) => i !== index).map((seg, i) => ({ ...seg, order: i + 1 }));
  };
  
  const handleSaveFormat = () => {
    if (!editingFormat) return;
    
    const newFormats = {
      ...customFormats,
      custom: { segments: editingFormat.segments }
    };
    
    set(STORAGE_KEY_FORMATS, newFormats);
    setCustomFormats(newFormats);
    showToast('Format berhasil disimpan!', 'success');
    setShowFormatModal(false);
    setEditingFormat(null);
  };
  
  // Filtered records
  const filteredRecords = useMemo(() => {
    let filtered = searchNomorSurat(searchQuery);
    if (filterKode) filtered = filtered.filter(r => r.kode && r.kode.startsWith(filterKode));
    return filtered;
  }, [searchQuery, filterKode]);
  
  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  // Filtered kode options
  const filteredKodeOptions = useMemo(() => {
    if (!searchKode) return KODE_KLASIFIKASI;
    const query = searchKode.toLowerCase();
    return KODE_KLASIFIKASI.filter(k => 
      k.kode.toLowerCase().includes(query) || 
      k.nama.toLowerCase().includes(query)
    );
  }, [searchKode]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* HEADER - TANPA "0 bulan ini" */}
      <div className={`bg-white border-b border-slate-200 ${isMobile ? 'px-4 py-5' : 'px-8 py-6'}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white text-xl">pin</span>
            </div>
            <div>
              <h1 className={`font-bold text-slate-900 ${isMobile ? 'text-xl' : 'text-2xl'}`}>Nomor Surat</h1>
              <p className="text-sm text-slate-500">Format resmi dinas pendidikan</p>
            </div>
          </div>
          <button onClick={() => { setEditingFormat({ ...currentFormat, kode: 'custom' }); setShowFormatModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium text-slate-700 transition-colors">
            <span className="material-symbols-outlined text-lg">tune</span> Format
          </button>
        </div>
      </div>
      
      <div className={`${isMobile ? 'px-4 py-6' : 'px-8 py-8'} max-w-6xl mx-auto`}>
        {/* GENERATOR CARD */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
          <div className="p-6">
            {/* Format Info */}
            <div className="mb-6 p-4 bg-primary/5 border border-primary/10 rounded-2xl">
              <p className="text-sm text-primary font-medium">Format: [Nama SD] / [Kode Surat] - [Nomor] / [Bulan] / [Tahun]</p>
              <p className="text-xs text-slate-500 mt-1">Contoh: <span className="font-mono font-semibold text-primary">SDN / 421.3 - 001 / VII / 2026</span></p>
            </div>
            
            {/* Nama Sekolah */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Nama / Kode Sekolah</label>
              <input 
                type="text" 
                value={namaSekolah} 
                onChange={(e) => setNamaSekolah(e.target.value)}
                placeholder="SDN / SMPN / SMAN / SDN.001.02"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>
            
            {/* Kode Surat */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Kode Klasifikasi Surat</label>
              <div 
                onClick={() => setShowKodeModal(true)}
                className="p-4 bg-white border-2 border-slate-200 rounded-xl cursor-pointer hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${getBadgeColor(kodeSurat)}`}></span>
                    <div>
                      <p className="font-mono font-bold text-slate-900">{kodeSurat}</p>
                      <p className="text-sm text-slate-500">{getKodeInfo().nama}</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                </div>
              </div>
            </div>
            
            {/* Format Preview */}
            <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Preview Format</p>
              <div className="flex flex-wrap items-center gap-0.5 p-3 bg-white rounded-xl border border-slate-200">
                {currentFormat.segments
                  .filter(s => s.enabled)
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((seg, i) => (
                    <span key={seg.id} className="flex items-center">
                      {i > 0 && <span className="text-primary font-bold mx-1">{seg.separator || '/'}</span>}
                      <span className="px-2 py-1.5 bg-primary/10 rounded-lg text-sm font-mono font-semibold text-primary">
                        {seg.id === 'nama_sd' ? namaSekolah : getSegmentDisplayValue(seg)}
                      </span>
                    </span>
                  ))
                }
              </div>
            </div>
            
            {/* Bulan & Tahun */}
            <div className={`grid ${isMobile ? 'grid-cols-2 gap-4' : 'grid-cols-2 gap-6'} mb-6`}>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Bulan</label>
                <select value={bulan} onChange={(e) => setBulan(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(b => (
                    <option key={b} value={b}>{getRomanMonth(b)} — {getIndonesianMonth(b)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tahun</label>
                <select value={tahun} onChange={(e) => setTahun(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all">
                  {[2024, 2025, 2026, 2027, 2028].map(t => (<option key={t} value={t}>{t}</option>))}
                </select>
              </div>
            </div>
            
            {/* Generate Button */}
            <button onClick={handleGenerate}
              className="w-full py-4 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-white font-semibold rounded-2xl shadow-lg shadow-primary/25 transition-all hover:shadow-xl flex items-center justify-center gap-2 mb-6">
              <span className="material-symbols-outlined text-xl">autorenew</span> Generate Nomor
            </button>
            
            {/* Generated Preview */}
            {generatedNomor && (
              <div className="p-5 bg-gradient-to-r from-primary/5 to-blue-50 rounded-2xl border border-primary/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Nomor Surat</p>
                    <p className="text-xl font-mono font-bold text-primary break-all">{generatedNomor.nomor}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleCopy(generatedNomor.nomor)} className="p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-all">
                      <span className="material-symbols-outlined text-slate-600">content_copy</span>
                    </button>
                    <button onClick={handleUseNomor} className="px-5 py-3 bg-primary hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-primary/25 transition-all">
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined">check_circle</span> Simpan
                      </span>
                    </button>
                  </div>
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
                <p className="text-sm text-slate-500">{filteredRecords.length} surat terdaftar</p>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-xl">search</span>
                <input type="text" placeholder="Cari..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all w-48" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <button onClick={() => setFilterKode('')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterKode === '' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Semua</button>
              {['421', '422', '423', '424', '425', '426', '427'].map(kode => (
                <button key={kode} onClick={() => setFilterKode(kode)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterKode === kode ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{kode}</button>
              ))}
            </div>
          </div>
          
          <div className="p-4">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-slate-300 text-5xl mb-4 block">folder_off</span>
                <p className="text-slate-500 font-medium">Belum ada nomor surat</p>
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
      {showKodeModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Pilih Kode Surat</h3>
                  <p className="text-sm text-slate-500 mt-0.5">Kode klasifikasi dinas pendidikan</p>
                </div>
                <button onClick={() => { setShowKodeModal(false); setSearchKode(''); }} className="p-2 hover:bg-slate-100 rounded-xl">
                  <span className="material-symbols-outlined text-slate-400">close</span>
                </button>
              </div>
              <div className="mt-4 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-xl">search</span>
                <input type="text" placeholder="Cari kode..." value={searchKode} onChange={(e) => setSearchKode(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 max-h-[60vh]">
              <div className="space-y-2">
                {filteredKodeOptions.map(item => (
                  <button
                    key={item.kode}
                    onClick={() => { setKodeSurat(item.kode); setShowKodeModal(false); setSearchKode(''); }}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                      kodeSurat === item.kode
                        ? 'bg-primary/5 border-primary/20'
                        : 'bg-white border-slate-200 hover:border-primary/20'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${getBadgeColor(item.kode)}`}></span>
                    <div className="flex-1">
                      <p className="font-mono font-bold text-slate-900 text-sm">{item.kode}</p>
                      <p className="text-xs text-slate-500">{item.nama}</p>
                    </div>
                    {kodeSurat === item.kode && <span className="material-symbols-outlined text-primary text-xl">check_circle</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* FORMAT SETTINGS MODAL */}
      {showFormatModal && editingFormat && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Edit Format</h3>
                  <p className="text-sm text-slate-500 mt-0.5">Atur urutan & pemisah komponen</p>
                </div>
                <button onClick={() => { setShowFormatModal(false); setEditingFormat(null); }} className="p-2 hover:bg-slate-100 rounded-xl">
                  <span className="material-symbols-outlined text-slate-400">close</span>
                </button>
              </div>
            </div>
            
            {/* Preview */}
            <div className="px-6 py-4 bg-primary/5 border-b border-primary/10">
              <p className="text-xs font-medium text-primary mb-2 uppercase tracking-wider">Preview</p>
              <div className="flex flex-wrap items-center gap-0.5 p-3 bg-white rounded-xl border border-primary/20">
                {editingFormat.segments
                  .filter(s => s.enabled)
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((seg, i) => (
                    <span key={seg.id} className="flex items-center">
                      {i > 0 && <span className="text-primary font-bold mx-1">{seg.separator || '/'}</span>}
                      <span className="px-2 py-1.5 bg-primary/10 rounded-lg text-sm font-mono font-semibold text-primary">
                        {seg.id === 'nama_sd' ? namaSekolah : getSegmentDisplayValue(seg)}
                      </span>
                    </span>
                  ))
                }
              </div>
            </div>
            
            {/* Segments */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-2">
                {editingFormat.segments
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((seg, index) => (
                  <div key={seg.id} className={`p-3 rounded-xl border flex items-center gap-3 ${
                    seg.enabled ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-50'
                  }`}>
                    {/* Move */}
                    <div className="flex flex-col">
                      <button onClick={() => setEditingFormat(prev => ({ ...prev, segments: moveSegment(prev.segments, index, 'up') }))}
                        disabled={index === 0} className="p-0.5 hover:bg-slate-100 rounded disabled:opacity-20">
                        <span className="material-symbols-outlined text-slate-400 text-sm">expand_less</span>
                      </button>
                      <button onClick={() => setEditingFormat(prev => ({ ...prev, segments: moveSegment(prev.segments, index, 'down') }))}
                        disabled={index === editingFormat.segments.length - 1} className="p-0.5 hover:bg-slate-100 rounded disabled:opacity-20">
                        <span className="material-symbols-outlined text-slate-400 text-sm">expand_more</span>
                      </button>
                    </div>
                    
                    {/* Toggle */}
                    <button onClick={() => setEditingFormat(prev => ({ ...prev, segments: toggleSegment(prev.segments, index) }))} className="p-1">
                      <span className={`material-symbols-outlined text-lg ${seg.enabled ? 'text-primary' : 'text-slate-300'}`}>
                        {seg.enabled ? 'visibility' : 'visibility_off'}
                      </span>
                    </button>
                    
                    {/* Label */}
                    <div className="flex-1 min-w-0">
                      {seg.type === 'custom' ? (
                        <input type="text" value={seg.label} placeholder="Nama" onChange={(e) => {
                          const newSegments = [...editingFormat.segments];
                          newSegments[index] = { ...newSegments[index], label: e.target.value };
                          setEditingFormat(prev => ({ ...prev, segments: newSegments }));
                        }} className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" />
                      ) : (
                        <p className="font-medium text-slate-700 text-sm">{seg.label}</p>
                      )}
                    </div>
                    
                    {/* Value */}
                    <div className="w-28">
                      {seg.type === 'custom' ? (
                        <input type="text" value={seg.value} placeholder="Nilai" onChange={(e) => {
                          const newSegments = [...editingFormat.segments];
                          newSegments[index] = { ...newSegments[index], value: e.target.value };
                          setEditingFormat(prev => ({ ...prev, segments: newSegments }));
                        }} className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary outline-none" />
                      ) : seg.id === 'nama_sd' || seg.id === 'kode' ? (
                        <input type="text" value={seg.value} onChange={(e) => {
                          const newSegments = [...editingFormat.segments];
                          newSegments[index] = { ...newSegments[index], value: e.target.value };
                          setEditingFormat(prev => ({ ...prev, segments: newSegments }));
                        }} className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary outline-none" />
                      ) : getSegmentOptions(seg.id).length > 0 ? (
                        <select value={seg.value} onChange={(e) => {
                          const newSegments = [...editingFormat.segments];
                          newSegments[index] = { ...newSegments[index], value: e.target.value };
                          setEditingFormat(prev => ({ ...prev, segments: newSegments }));
                        }} className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none">
                          {getSegmentOptions(seg.id).map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                        </select>
                      ) : null}
                    </div>
                    
                    {/* Separator */}
                    <select value={seg.separator || '/'} onChange={(e) => {
                      const newSegments = [...editingFormat.segments];
                      newSegments[index] = { ...newSegments[index], separator: e.target.value };
                      setEditingFormat(prev => ({ ...prev, segments: newSegments }));
                    }} className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary outline-none">
                      <option value="/">/</option>
                      <option value="-">-</option>
                      <option value=".">.</option>
                      <option value="_">_</option>
                    </select>
                    
                    {/* Delete custom */}
                    {seg.type === 'custom' && (
                      <button onClick={() => setEditingFormat(prev => ({ ...prev, segments: removeSegment(prev.segments, index) }))}
                        className="p-1 hover:bg-red-50 rounded-lg">
                        <span className="material-symbols-outlined text-slate-400 hover:text-red-500 text-lg">close</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <button onClick={() => setEditingFormat(prev => ({ ...prev, segments: addCustomSegment(prev.segments) }))}
                className="mt-4 w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-medium text-slate-500 hover:border-primary/30 hover:text-primary transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-lg">add</span> Tambah Komponen Custom
              </button>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <button onClick={() => { setShowFormatModal(false); setEditingFormat(null); }}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-2xl transition-colors">
                Batal
              </button>
              <button onClick={handleSaveFormat}
                className="flex-1 py-3 bg-primary hover:bg-blue-600 text-white font-semibold rounded-2xl shadow-lg shadow-primary/25 transition-all">
                Simpan Format
              </button>
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
                <h3 className="text-lg font-semibold text-slate-900">Detail Nomor</h3>
                <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <p className="text-lg font-mono font-bold text-slate-900 break-all">{selectedRecord.nomor}</p>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Nama Sekolah', value: selectedRecord.namaSekolah || '-' },
                  { label: 'Kode', value: selectedRecord.kode },
                  { label: 'Jenis', value: selectedRecord.jenis },
                  { label: 'Bulan', value: getIndonesianMonth(selectedRecord.bulan) },
                  { label: 'Tahun', value: selectedRecord.tahun },
                  { label: 'Dibuat', value: new Date(selectedRecord.createdAt).toLocaleString('id-ID') }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-slate-50 last:border-0">
                    <span className="text-slate-400 text-sm">{item.label}</span>
                    <span className="font-medium text-slate-700 text-sm">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => { handleCopy(selectedRecord.nomor); setShowDetailModal(false); }} className="flex-1 py-3 bg-primary hover:bg-blue-600 text-white font-medium rounded-2xl transition-colors">Salin</button>
                <button onClick={() => setShowDetailModal(false)} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-2xl transition-colors">Tutup</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* DELETE CONFIRMATION */}
      {showDeleteConfirm && recordToDelete && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl">
            <div className="p-6 text-center">
              <span className="material-symbols-outlined text-red-500 text-5xl mb-4 block">delete</span>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Hapus?</h3>
              <p className="font-mono font-semibold text-slate-700 mb-4 text-sm break-all">{recordToDelete.nomor}</p>
              <div className="flex gap-3">
                <button onClick={() => { setShowDeleteConfirm(false); setRecordToDelete(null); }} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-2xl transition-colors">Batal</button>
                <button onClick={handleDeleteConfirm} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-2xl transition-colors">Hapus</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NomorSuratPage;
