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
const STORAGE_KEY_JENIS = 'spj_surat_custom_jenis';

// Default jenis surat
const DEFAULT_JENIS = [
  { kode: 'STS', nama: 'Surat Tugas', warna: 'blue' },
  { kode: 'SK', nama: 'Surat Keterangan', warna: 'emerald' },
  { kode: 'SU', nama: 'Surat Undangan', warna: 'violet' },
  { kode: 'SP', nama: 'Surat Pernyataan', warna: 'amber' },
  { kode: 'SKU', nama: 'Surat Kuasa', warna: 'rose' }
];

// Default segments
const DEFAULT_SEGMENTS = [
  { id: 'sekolah', type: 'dynamic', label: 'Nama Sekolah', value: 'SDN', enabled: true },
  { id: 'kode', type: 'dynamic', label: 'Kode Surat', value: 'STS', enabled: true },
  { id: 'nomor', type: 'dynamic', label: 'Nomor Urut', value: '3', enabled: true },
  { id: 'bulan', type: 'dynamic', label: 'Bulan', value: 'romawi', enabled: true },
  { id: 'tahun', type: 'dynamic', label: 'Tahun', value: '4', enabled: true }
];

// Warna options
const WARNA_OPTIONS = [
  { value: 'blue', label: 'Biru', class: 'bg-blue-500' },
  { value: 'emerald', label: 'Hijau', class: 'bg-emerald-500' },
  { value: 'violet', label: 'Ungu', class: 'bg-violet-500' },
  { value: 'amber', label: 'Kuning', class: 'bg-amber-500' },
  { value: 'rose', label: 'Merah', class: 'bg-rose-500' },
  { value: 'teal', label: 'Teal', class: 'bg-teal-500' },
  { value: 'cyan', label: 'Cyan', class: 'bg-cyan-500' },
  { value: 'indigo', label: 'Indigo', class: 'bg-indigo-500' },
  { value: 'slate', label: 'Abu', class: 'bg-slate-500' },
  { value: 'orange', label: 'Oranye', class: 'bg-orange-500' }
];

// Custom segment template
const CUSTOM_SEGMENT = { id: '', type: 'custom', label: '', value: '', enabled: true };

const NomorSuratPage = () => {
  const { showToast } = useToast();
  const { isMobile } = useSidebar();
  
  // State
  const [jenisSurat, setJenisSurat] = useState(DEFAULT_JENIS);
  const [selectedKode, setSelectedKode] = useState('STS');
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
  const [showJenisModal, setShowJenisModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [customFormats, setCustomFormats] = useState({});
  const [editingFormat, setEditingFormat] = useState(null);
  const [editingJenis, setEditingJenis] = useState(null);
  const [newJenis, setNewJenis] = useState({ kode: '', nama: '', warna: 'blue' });
  const itemsPerPage = 10;
  
  // Load data
  useEffect(() => {
    loadData();
    loadFormats();
    loadJenis();
  }, []);
  
  const loadData = () => {
    setRecords(searchNomorSurat());
    setStatistics(getStatistics());
  };
  
  const loadFormats = () => {
    const saved = get(STORAGE_KEY_FORMATS);
    if (saved) setCustomFormats(saved);
  };
  
  const loadJenis = () => {
    const saved = get(STORAGE_KEY_JENIS);
    if (saved && saved.length > 0) {
      setJenisSurat(saved);
      if (!saved.find(j => j.kode === selectedKode)) {
        setSelectedKode(saved[0].kode);
      }
    }
  };
  
  const saveJenis = (jenis) => {
    set(STORAGE_KEY_JENIS, jenis);
    setJenisSurat(jenis);
    showToast('Jenis surat tersimpan', 'success');
  };
  
  // Get current format
  const getCurrentFormat = (kode) => {
    if (customFormats[kode]) return customFormats[kode];
    return {
      segments: DEFAULT_SEGMENTS.map(s => ({
        ...s,
        value: s.id === 'kode' ? kode : s.value
      })),
      separator: '/'
    };
  };
  
  const currentFormat = getCurrentFormat(selectedKode);
  
  // Get current jenis
  const getCurrentJenis = () => jenisSurat.find(j => j.kode === selectedKode) || jenisSurat[0];
  
  // Build nomor from segments
  const buildNomorFromSegments = (segments, separator, values) => {
    const enabledSegments = segments.filter(s => s.enabled);
    
    return enabledSegments.map(seg => {
      // Custom segment - just return the value
      if (seg.type === 'custom') {
        return seg.value;
      }
      
      // Dynamic segments
      switch (seg.id) {
        case 'sekolah': return values.namaSekolah || seg.value;
        case 'kode': return values.kode || seg.value;
        case 'nomor':
          const digits = parseInt(seg.value) || 3;
          return String(values.nomor || 1).padStart(digits, '0');
        case 'bulan':
          if (seg.value === 'angka') return String(values.bulan).padStart(2, '0');
          if (seg.value === 'nama') return getIndonesianMonth(values.bulan);
          return getRomanMonth(values.bulan);
        case 'tahun':
          return seg.value === '2' ? String(values.tahun).slice(-2) : String(values.tahun);
        default: return seg.value;
      }
    }).join(separator);
  };
  
  // Generate nomor
  const handleGenerate = (namaSekolah = 'SDN') => {
    const existingRecords = getAllNomorSurat();
    const sameTypeRecords = existingRecords.filter(r => 
      r.kode === selectedKode && r.bulan === bulan && r.tahun === tahun
    );
    
    let lastNumber = 0;
    sameTypeRecords.forEach(r => { if (r.nomorUrut > lastNumber) lastNumber = r.nomorUrut; });
    
    const nextNumber = lastNumber + 1;
    const nomor = buildNomorFromSegments(currentFormat.segments, currentFormat.separator, {
      namaSekolah, kode: selectedKode, nomor: nextNumber, bulan, tahun
    });
    
    setGeneratedNomor({ nomor, nomorUrut: nextNumber });
  };
  
  // Save as used
  const handleUseNomor = () => {
    if (!generatedNomor) { showToast('Generate nomor terlebih dahulu', 'error'); return; }
    
    try {
      const record = {
        id: `ns_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        nomor: generatedNomor.nomor, kode: selectedKode, jenis: getCurrentJenis().nama,
        nomorUrut: generatedNomor.nomorUrut, bulan, bulanRomawi: getRomanMonth(bulan), tahun,
        createdAt: new Date().toISOString(), usedAt: new Date().toISOString(), status: 'used'
      };
      
      saveNomorSurat(record);
      showToast(`Nomor ${generatedNomor.nomor} berhasil digunakan!`, 'success');
      setGeneratedNomor('');
      loadData();
    } catch (error) { showToast(error.message, 'error'); }
  };
  
  // Copy
  const handleCopy = (nomor) => {
    navigator.clipboard.writeText(nomor);
    showToast('Berhasil disalin!', 'success');
  };
  
  // Delete record
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
  
  // ═══════════════════════════════════════════════════════════════
  // JENIS SURAT MANAGEMENT
  // ═══════════════════════════════════════════════════════════════
  
  const handleAddJenis = () => {
    if (!newJenis.kode || !newJenis.nama) { showToast('Kode dan Nama wajib diisi', 'error'); return; }
    if (jenisSurat.find(j => j.kode === newJenis.kode.toUpperCase())) { showToast('Kode sudah ada', 'error'); return; }
    
    const updated = [...jenisSurat, { ...newJenis, kode: newJenis.kode.toUpperCase() }];
    saveJenis(updated);
    setNewJenis({ kode: '', nama: '', warna: 'blue' });
    setShowJenisModal(false);
  };
  
  const handleUpdateJenis = () => {
    if (!editingJenis || !editingJenis.kode || !editingJenis.nama) { showToast('Kode dan Nama wajib diisi', 'error'); return; }
    const updated = jenisSurat.map(j => j.kode === editingJenis.kode ? editingJenis : j);
    saveJenis(updated);
    setEditingJenis(null);
    setShowJenisModal(false);
  };
  
  const handleDeleteJenis = (kode) => {
    if (jenisSurat.length <= 1) { showToast('Minimal harus ada 1 jenis surat', 'error'); return; }
    if (!confirm(`Hapus jenis surat ${kode}?`)) return;
    const updated = jenisSurat.filter(j => j.kode !== kode);
    saveJenis(updated);
    if (selectedKode === kode) setSelectedKode(updated[0].kode);
  };
  
  // ═══════════════════════════════════════════════════════════════
  // FORMAT MANAGEMENT
  // ═══════════════════════════════════════════════════════════════
  
  const getBadgeColor = (kode) => {
    const jenis = jenisSurat.find(j => j.kode === kode);
    if (!jenis) return 'bg-slate-500';
    const warna = WARNA_OPTIONS.find(w => w.value === jenis.warna);
    return warna ? warna.class : 'bg-slate-500';
  };
  
  const getSegmentDisplayValue = (seg) => {
    if (seg.type === 'custom') return `[${seg.value || 'custom'}]`;
    switch (seg.id) {
      case 'sekolah': return `[${seg.value}]`;
      case 'kode': return `[${seg.value}]`;
      case 'nomor': return `[${'0'.repeat(parseInt(seg.value) || 3)}]`;
      case 'bulan':
        if (seg.value === 'angka') return '[07]';
        if (seg.value === 'nama') return '[Juli]';
        return '[VII]';
      case 'tahun': return seg.value === '2' ? '[26]' : '[2026]';
      default: return `[${seg.value}]`;
    }
  };
  
  const getSegmentOptions = (segId) => {
    switch (segId) {
      case 'bulan': return [{ value: 'romawi', label: 'Romawi (VII)' }, { value: 'angka', label: 'Angka (07)' }, { value: 'nama', label: 'Nama (Juli)' }];
      case 'tahun': return [{ value: '4', label: '4 digit (2026)' }, { value: '2', label: '2 digit (26)' }];
      case 'nomor': return [{ value: '3', label: '3 digit (001-999)' }, { value: '4', label: '4 digit (0001-9999)' }, { value: '5', label: '5 digit (00001-99999)' }];
      default: return [];
    }
  };
  
  const moveSegment = (segments, index, direction) => {
    const newSegments = [...segments];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newSegments.length) return newSegments;
    [newSegments[index], newSegments[newIndex]] = [newSegments[newIndex], newSegments[index]];
    return newSegments;
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
  
  const addCustomSegment = (segments) => {
    const newSeg = { ...CUSTOM_SEGMENT, id: `custom_${Date.now()}`, value: 'custom' };
    return [...segments, newSeg];
  };
  
  const removeSegment = (segments, index) => {
    return segments.filter((_, i) => i !== index);
  };
  
  // Save format - FIXED
  const handleSaveFormat = () => {
    if (!editingFormat) return;
    
    const newFormats = {
      ...customFormats,
      [editingFormat.kode]: {
        segments: editingFormat.segments,
        separator: editingFormat.separator
      }
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
    if (filterKode) filtered = filtered.filter(r => r.kode === filterKode);
    return filtered;
  }, [searchQuery, filterKode]);
  
  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
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
              <p className="text-sm text-slate-500">Penomoran otomatis & terstruktur</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { setEditingJenis(null); setShowJenisModal(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium text-slate-700 transition-colors">
              <span className="material-symbols-outlined text-lg">add</span>
              {!isMobile && 'Jenis'}
            </button>
            <button onClick={() => { setEditingFormat({ ...currentFormat, kode: selectedKode }); setShowFormatModal(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium text-slate-700 transition-colors">
              <span className="material-symbols-outlined text-lg">tune</span>
              {!isMobile && 'Format'}
            </button>
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-900">{statistics.bulanIni}</p>
              <p className="text-xs text-slate-500">bulan ini</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className={`${isMobile ? 'px-4 py-6' : 'px-8 py-8'} max-w-6xl mx-auto`}>
        {/* GENERATOR CARD */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
          <div className="p-6 pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Jenis Surat</label>
              <button onClick={() => { setEditingJenis(null); setShowJenisModal(true); }} className="text-xs text-primary hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">add_circle</span> Tambah Jenis
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {jenisSurat.map((jenis) => (
                <div key={jenis.kode} className="relative group">
                  <button onClick={() => { setSelectedKode(jenis.kode); setGeneratedNomor(''); }}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      selectedKode === jenis.kode ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}>
                    <span className={`w-2 h-2 rounded-full ${getBadgeColor(jenis.kode)}`}></span>
                    {jenis.nama}
                  </button>
                  <div className="absolute top-full left-0 mt-1 hidden group-hover:block z-10">
                    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-1 flex gap-1">
                      <button onClick={(e) => { e.stopPropagation(); setEditingJenis(jenis); setShowJenisModal(true); }} className="p-2 hover:bg-slate-100 rounded-lg" title="Edit">
                        <span className="material-symbols-outlined text-slate-500 text-sm">edit</span>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteJenis(jenis.kode); }} className="p-2 hover:bg-red-50 rounded-lg" title="Hapus">
                        <span className="material-symbols-outlined text-red-500 text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-6">
            {/* Format Preview */}
            <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Format {selectedKode}</span>
                <button onClick={() => { setEditingFormat({ ...currentFormat, kode: selectedKode }); setShowFormatModal(true); }} className="text-xs text-primary hover:underline">Edit Format</button>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {currentFormat.segments.filter(s => s.enabled).map((seg, i, arr) => (
                  <span key={seg.id} className="flex items-center">
                    <span className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-sm font-mono font-medium text-slate-700">{getSegmentDisplayValue(seg)}</span>
                    {i < arr.length - 1 && <span className="mx-1 text-slate-400 font-medium">{currentFormat.separator}</span>}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Input Fields */}
            <div className={`grid ${isMobile ? 'grid-cols-2 gap-4' : 'grid-cols-4 gap-6'}`}>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Nama Sekolah</label>
                <input type="text" defaultValue="SDN" id="namaSekolahInput"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" />
              </div>
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
              <div className="flex items-end">
                <button onClick={() => handleGenerate(document.getElementById('namaSekolahInput').value)}
                  className="w-full py-3 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-slate-800 text-white font-semibold rounded-xl shadow-lg transition-all hover:shadow-xl flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-xl">autorenew</span> Generate
                </button>
              </div>
            </div>
            
            {generatedNomor && (
              <div className="mt-6 p-5 bg-gradient-to-r from-primary/5 to-blue-50 rounded-2xl border border-primary/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Nomor Surat Generated</p>
                    <p className="text-2xl font-mono font-bold text-primary">{generatedNomor.nomor}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleCopy(generatedNomor.nomor)} className="p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-all" title="Salin">
                      <span className="material-symbols-outlined text-slate-600">content_copy</span>
                    </button>
                    <button onClick={handleUseNomor} className="px-6 py-3 bg-primary hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-primary/25 transition-all hover:shadow-xl">
                      <span className="flex items-center gap-2"><span className="material-symbols-outlined">check_circle</span> Gunakan</span>
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
              <button onClick={() => setFilterKode('')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterKode === '' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Semua</button>
              {jenisSurat.map((jenis) => (
                <button key={jenis.kode} onClick={() => setFilterKode(jenis.kode)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterKode === jenis.kode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{jenis.kode}</button>
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
                          <td className="py-4 px-4"><span className="font-mono font-semibold text-slate-900">{record.nomor}</span></td>
                          <td className="py-4 px-4"><span className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold text-white ${getBadgeColor(record.kode)}`}>{record.kode}</span></td>
                          <td className="py-4 px-4 text-sm text-slate-500">{new Date(record.createdAt).toLocaleDateString('id-ID')}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => handleCopy(record.nomor)} className="p-2 hover:bg-slate-100 rounded-lg"><span className="material-symbols-outlined text-slate-400 text-lg">content_copy</span></button>
                              <button onClick={() => { setSelectedRecord(record); setShowDetailModal(true); }} className="p-2 hover:bg-slate-100 rounded-lg"><span className="material-symbols-outlined text-slate-400 text-lg">visibility</span></button>
                              <button onClick={() => handleDeleteClick(record)} className="p-2 hover:bg-red-50 rounded-lg"><span className="material-symbols-outlined text-slate-400 text-red-500 text-lg">delete</span></button>
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
                          <span className="font-mono font-semibold text-slate-900">{record.nomor}</span>
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
                        return <button key={page} onClick={() => setCurrentPage(page)} className={`w-10 h-10 rounded-lg text-sm font-medium ${currentPage === page ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`}>{page}</button>;
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
      
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* JENIS SURAT MODAL                                                   */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {showJenisModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">{editingJenis ? 'Edit Jenis Surat' : 'Tambah Jenis Surat'}</h3>
                <button onClick={() => { setShowJenisModal(false); setEditingJenis(null); setNewJenis({ kode: '', nama: '', warna: 'blue' }); }} className="p-2 hover:bg-slate-100 rounded-xl">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Kode Surat</label>
                <input type="text" value={editingJenis ? editingJenis.kode : newJenis.kode}
                  onChange={(e) => { const val = e.target.value.toUpperCase(); editingJenis ? setEditingJenis(prev => ({ ...prev, kode: val })) : setNewJenis(prev => ({ ...prev, kode: val })); }}
                  placeholder="Contoh: STS, SK, SU" maxLength={5}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono font-medium uppercase focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nama Jenis Surat</label>
                <input type="text" value={editingJenis ? editingJenis.nama : newJenis.nama}
                  onChange={(e) => editingJenis ? setEditingJenis(prev => ({ ...prev, nama: e.target.value })) : setNewJenis(prev => ({ ...prev, nama: e.target.value }))}
                  placeholder="Contoh: Surat Tugas"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Warna Label</label>
                <div className="flex flex-wrap gap-2">
                  {WARNA_OPTIONS.map(w => (
                    <button key={w.value} onClick={() => editingJenis ? setEditingJenis(prev => ({ ...prev, warna: w.value })) : setNewJenis(prev => ({ ...prev, warna: w.value }))}
                      className={`w-10 h-10 rounded-xl ${w.class} transition-all ${(editingJenis ? editingJenis.warna : newJenis.warna) === w.value ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'}`}
                      title={w.label} />
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex gap-3">
              <button onClick={() => { setShowJenisModal(false); setEditingJenis(null); setNewJenis({ kode: '', nama: '', warna: 'blue' }); }}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors">Batal</button>
              <button onClick={editingJenis ? handleUpdateJenis : handleAddJenis}
                className="flex-1 py-3 bg-primary hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-primary/25 transition-all">
                {editingJenis ? 'Simpan' : 'Tambah'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* FORMAT SETTINGS MODAL - PREMIUM DESIGN                              */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {showFormatModal && editingFormat && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-white">settings</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Atur Format Nomor</h3>
                    <p className="text-sm text-slate-300">Kustom format untuk {editingFormat.kode}</p>
                  </div>
                </div>
                <button onClick={() => { setShowFormatModal(false); setEditingFormat(null); }} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <span className="material-symbols-outlined text-white">close</span>
                </button>
              </div>
            </div>
            
            {/* Preview */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Preview Format</p>
              <div className="flex flex-wrap items-center gap-1.5 p-4 bg-white rounded-xl border border-slate-200">
                {editingFormat.segments.filter(s => s.enabled).length === 0 ? (
                  <span className="text-slate-400 text-sm italic">Belum ada komponen aktif</span>
                ) : (
                  editingFormat.segments.filter(s => s.enabled).map((seg, i, arr) => (
                    <span key={seg.id} className="flex items-center">
                      <span className="px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg text-sm font-mono font-semibold text-primary">
                        {getSegmentDisplayValue(seg)}
                      </span>
                      {i < arr.length - 1 && <span className="mx-1.5 text-slate-400 font-bold text-lg">{editingFormat.separator}</span>}
                    </span>
                  ))
                )}
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* Separator */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-3">Pemisah (Separator)</label>
                <div className="flex gap-2">
                  {['/', '-', '.', '_'].map(sep => (
                    <button key={sep} onClick={() => setEditingFormat(prev => ({ ...prev, separator: sep }))}
                      className={`w-14 h-14 rounded-xl text-xl font-mono font-bold transition-all ${
                        editingFormat.separator === sep ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}>{sep}</button>
                  ))}
                </div>
              </div>
              
              {/* Segments */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-slate-700">Komponen Format</label>
                  <button onClick={() => setEditingFormat(prev => ({ ...prev, segments: addCustomSegment(prev.segments) }))}
                    className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined text-lg">add</span> Tambah Komponen
                  </button>
                </div>
                
                <div className="space-y-2">
                  {editingFormat.segments.map((seg, index) => (
                    <div key={seg.id} className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                      seg.enabled ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-50'
                    }`}>
                      {/* Move Buttons */}
                      <div className="flex flex-col">
                        <button onClick={() => setEditingFormat(prev => ({ ...prev, segments: moveSegment(prev.segments, index, 'up') }))}
                          disabled={index === 0} className="p-0.5 hover:bg-slate-100 rounded disabled:opacity-20">
                          <span className="material-symbols-outlined text-slate-400 text-lg">expand_less</span>
                        </button>
                        <button onClick={() => setEditingFormat(prev => ({ ...prev, segments: moveSegment(prev.segments, index, 'down') }))}
                          disabled={index === editingFormat.segments.length - 1} className="p-0.5 hover:bg-slate-100 rounded disabled:opacity-20">
                          <span className="material-symbols-outlined text-slate-400 text-lg">expand_more</span>
                        </button>
                      </div>
                      
                      {/* Toggle */}
                      <button onClick={() => setEditingFormat(prev => ({ ...prev, segments: toggleSegment(prev.segments, index) }))} className="p-2">
                        <span className={`material-symbols-outlined text-xl ${seg.enabled ? 'text-primary' : 'text-slate-300'}`}>
                          {seg.enabled ? 'visibility' : 'visibility_off'}
                        </span>
                      </button>
                      
                      {/* Label */}
                      <div className="flex-1 min-w-0">
                        {seg.type === 'custom' ? (
                          <input type="text" value={seg.label} placeholder="Nama komponen"
                            onChange={(e) => {
                              const newSegments = [...editingFormat.segments];
                              newSegments[index] = { ...newSegments[index], label: e.target.value };
                              setEditingFormat(prev => ({ ...prev, segments: newSegments }));
                            }}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                        ) : (
                          <>
                            <p className="font-medium text-slate-800">{seg.label}</p>
                            <p className="text-xs text-slate-400 font-mono">{getSegmentDisplayValue(seg)}</p>
                          </>
                        )}
                      </div>
                      
                      {/* Value Input */}
                      {seg.type === 'custom' ? (
                        <input type="text" value={seg.value} placeholder="Nilai"
                          onChange={(e) => {
                            const newSegments = [...editingFormat.segments];
                            newSegments[index] = { ...newSegments[index], value: e.target.value };
                            setEditingFormat(prev => ({ ...prev, segments: newSegments }));
                          }}
                          className="w-32 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium font-mono focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                      ) : seg.id === 'sekolah' ? (
                        <input type="text" value={seg.value} onChange={(e) => setEditingFormat(prev => ({ ...prev, segments: updateSegmentValue(prev.segments, index, e.target.value) }))}
                          className="w-28 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                      ) : seg.id === 'kode' ? (
                        <input type="text" value={seg.value} onChange={(e) => setEditingFormat(prev => ({ ...prev, segments: updateSegmentValue(prev.segments, index, e.target.value.toUpperCase()) }))}
                          className="w-20 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium font-mono uppercase focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                      ) : getSegmentOptions(seg.id).length > 0 ? (
                        <select value={seg.value} onChange={(e) => setEditingFormat(prev => ({ ...prev, segments: updateSegmentValue(prev.segments, index, e.target.value) }))}
                          className="w-36 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none">
                          {getSegmentOptions(seg.id).map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                        </select>
                      ) : null}
                      
                      {/* Delete (only for custom) */}
                      {seg.type === 'custom' && (
                        <button onClick={() => setEditingFormat(prev => ({ ...prev, segments: removeSegment(prev.segments, index) }))}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                          <span className="material-symbols-outlined text-red-400 hover:text-red-600 text-lg">close</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Help Text */}
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-sm text-blue-700 flex items-start gap-2">
                  <span className="material-symbols-outlined text-lg mt-0.5">info</span>
                  <span>
                    <strong>Cara menggunakan:</strong><br/>
                    • Geser ⬆️⬇️ untuk ubah urutan komponen<br/>
                    • Klik 👁️ untuk sembunyikan/tampilkan komponen<br/>
                    • Klik "Tambah Komponen" untuk menambah teks custom<br/>
                    • Gunakan field "Nilai" pada komponen custom untuk isi teks bebas
                  </span>
                </p>
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-3">
              <button onClick={() => { setShowFormatModal(false); setEditingFormat(null); }}
                className="flex-1 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl transition-colors">
                Batal
              </button>
              <button onClick={handleSaveFormat}
                className="flex-1 py-3 bg-primary hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-primary/25 transition-all hover:shadow-xl">
                Simpan Format
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* DETAIL MODAL */}
      {showDetailModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Detail Nomor</h3>
                <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-slate-100 rounded-xl"><span className="material-symbols-outlined">close</span></button>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <p className="text-2xl font-mono font-bold text-slate-900">{selectedRecord.nomor}</p>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Jenis', value: selectedRecord.jenis },
                  { label: 'Nomor Urut', value: selectedRecord.nomorUrut },
                  { label: 'Bulan', value: getIndonesianMonth(selectedRecord.bulan) },
                  { label: 'Tahun', value: selectedRecord.tahun },
                  { label: 'Dibuat', value: new Date(selectedRecord.createdAt).toLocaleString('id-ID') }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between py-3 border-b border-slate-50 last:border-0">
                    <span className="text-slate-400">{item.label}</span>
                    <span className="font-medium text-slate-700">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => { handleCopy(selectedRecord.nomor); setShowDetailModal(false); }} className="flex-1 py-3 bg-primary hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">Salin</button>
                <button onClick={() => setShowDetailModal(false)} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl transition-colors">Tutup</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* DELETE CONFIRMATION */}
      {showDeleteConfirm && recordToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl">
            <div className="p-6 text-center">
              <span className="material-symbols-outlined text-red-500 text-5xl mb-4 block">delete</span>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Hapus Nomor?</h3>
              <p className="font-mono font-semibold text-slate-700 mb-4">{recordToDelete.nomor}</p>
              <div className="flex gap-3">
                <button onClick={() => { setShowDeleteConfirm(false); setRecordToDelete(null); }} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl transition-colors">Batal</button>
                <button onClick={handleDeleteConfirm} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors">Hapus</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NomorSuratPage;
