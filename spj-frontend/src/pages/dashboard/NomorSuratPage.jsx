import { useState, useEffect, useMemo } from 'react';
import {
  KODE_SURAT,
  generateNomorSurat,
  saveNomorSurat,
  deleteNomorSurat,
  getStatistics,
  searchNomorSurat,
  getAvailableYears,
  getAvailableMonths,
  formatDateTime,
  getRomanMonth,
  getIndonesianMonth,
  getFormatSettings,
  saveFormatSettings,
  getAllNomorSurat
} from '../../utils/nomorSuratHelper';
import { useToast } from '../../components/ui/Toast';
import { useSidebar } from '../../contexts/SidebarContext';

const NomorSuratPage = () => {
  const { showToast } = useToast();
  const { isMobile } = useSidebar();
  
  // State
  const [selectedKode, setSelectedKode] = useState('STS');
  const [generatedNomor, setGeneratedNomor] = useState(null);
  const [records, setRecords] = useState([]);
  const [statistics, setStatistics] = useState({ bulanIni: 0, tahunIni: 0, hariIni: 0, terakhir: '-' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBulan, setFilterBulan] = useState('');
  const [filterTahun, setFilterTahun] = useState('');
  const [filterKode, setFilterKode] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  
  // Editable format settings
  const [formatSettings, setFormatSettings] = useState({
    namaSekolah: 'SDN',
    separator: '/',
    bulanFormat: 'romawi',
    tahunFormat: 4
  });
  
  const itemsPerPage = 8;
  
  // Load data
  useEffect(() => {
    loadData();
    loadFormatSettings();
  }, []);
  
  const loadData = () => {
    setRecords(searchNomorSurat());
    setStatistics(getStatistics());
  };
  
  const loadFormatSettings = () => {
    const saved = getFormatSettings();
    if (saved) {
      setFormatSettings(prev => ({
        ...prev,
        ...saved
      }));
    }
  };
  
  // Save format settings
  const handleSaveFormatSettings = () => {
    saveFormatSettings(formatSettings);
    showToast('Pengaturan format tersimpan', 'success');
    setShowSettings(false);
    // Regenerate preview
    if (selectedKode) {
      handleGenerate();
    }
  };
  
  // Filtered records
  const filteredRecords = useMemo(() => {
    return searchNomorSurat(searchQuery, {
      bulan: filterBulan ? parseInt(filterBulan) : null,
      tahun: filterTahun ? parseInt(filterTahun) : null,
      kode: filterKode || null
    });
  }, [searchQuery, filterBulan, filterTahun, filterKode]);
  
  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Generate nomor
  const handleGenerate = () => {
    if (!selectedKode) return;
    
    try {
      const { nomor, record } = generateNomorSurat(selectedKode, formatSettings);
      setGeneratedNomor({ nomor, record });
    } catch (error) {
      showToast(error.message, 'error');
    }
  };
  
  // Use nomor (save it)
  const handleUseNomor = () => {
    if (!generatedNomor) return;
    
    try {
      saveNomorSurat(generatedNomor.record);
      showToast(`Nomor ${generatedNomor.nomor} berhasil digunakan!`, 'success');
      setGeneratedNomor(null);
      loadData();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };
  
  // Copy to clipboard
  const handleCopy = (nomor) => {
    navigator.clipboard.writeText(nomor);
    showToast('Nomor berhasil disalin!', 'success');
  };
  
  // View detail
  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };
  
  // Delete
  const handleDeleteClick = (record) => {
    setRecordToDelete(record);
    setShowDeleteConfirm(true);
  };
  
  const handleDeleteConfirm = () => {
    if (!recordToDelete) return;
    
    try {
      deleteNomorSurat(recordToDelete.id);
      showToast('Nomor surat berhasil dihapus', 'success');
      setShowDeleteConfirm(false);
      setRecordToDelete(null);
      loadData();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };
  
  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterBulan('');
    setFilterTahun('');
    setFilterKode('');
    setCurrentPage(1);
  };
  
  // Get badge color
  const getKodeBadgeColor = (kode) => {
    const colors = {
      STS: 'bg-gradient-to-r from-blue-500 to-blue-600',
      SK: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
      SU: 'bg-gradient-to-r from-purple-500 to-purple-600',
      SP: 'bg-gradient-to-r from-amber-500 to-amber-600',
      SKU: 'bg-gradient-to-r from-rose-500 to-rose-600',
      STL: 'bg-gradient-to-r from-teal-500 to-teal-600',
      SL: 'bg-gradient-to-r from-cyan-500 to-cyan-600',
      SN: 'bg-gradient-to-r from-indigo-500 to-indigo-600'
    };
    return colors[kode] || 'bg-gradient-to-r from-slate-500 to-slate-600';
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 pb-8">
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ULTRA PREMIUM HEADER                                               */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className={`relative overflow-hidden bg-gradient-to-r from-primary via-blue-600 to-primary ${isMobile ? 'px-4 py-8' : 'px-8 py-12'}`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-10 left-20 w-48 h-48 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🔢</span>
                </div>
                <div>
                  <h1 className={`font-bold text-white ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
                    Nomor Surat Keluar
                  </h1>
                  <p className="text-blue-100 text-sm">Sistem Penomoran Otomatis</p>
                </div>
              </div>
            </div>
            
            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(true)}
              className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all"
              title="Pengaturan Format"
            >
              <span className="text-white text-xl">⚙️</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className={`${isMobile ? 'px-4 -mt-4' : 'px-8 -mt-6'} max-w-7xl mx-auto relative z-10`}>
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* STATISTICS CARDS (Premium Glass)                                   */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-4 gap-4'} mb-6`}>
          {/* Bulan Ini */}
          <div className="group bg-white/70 backdrop-blur-xl rounded-2xl p-5 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Bulan Ini</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  {statistics.bulanIni}
                </p>
                <p className="text-xs text-slate-400">surat</p>
              </div>
            </div>
          </div>
          
          {/* Tahun Ini */}
          <div className="group bg-white/70 backdrop-blur-xl rounded-2xl p-5 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                <span className="text-2xl">📆</span>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Tahun Ini</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  {statistics.tahunIni}
                </p>
                <p className="text-xs text-slate-400">surat</p>
              </div>
            </div>
          </div>
          
          {/* Hari Ini */}
          <div className="group bg-white/70 backdrop-blur-xl rounded-2xl p-5 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Hari Ini</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  {statistics.hariIni}
                </p>
                <p className="text-xs text-slate-400">surat</p>
              </div>
            </div>
          </div>
          
          {/* Terakhir */}
          <div className={`group bg-white/70 backdrop-blur-xl rounded-2xl p-5 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${isMobile ? 'col-span-2' : ''}`}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                <span className="text-2xl">📌</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm text-slate-500 font-medium">Terakhir</p>
                <p className="text-lg font-mono font-bold text-slate-800 truncate">
                  {statistics.terakhir}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* GENERATE SECTION (Ultra Premium)                                   */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl overflow-hidden mb-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <span className="text-xl">✨</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Generate Nomor Baru</h2>
                <p className="text-sm text-slate-300">Pilih jenis surat dan generate nomor otomatis</p>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-12 gap-6'}`}>
              {/* Jenis Surat Selection */}
              <div className={`${isMobile ? '' : 'col-span-4'}`}>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Jenis Surat
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(KODE_SURAT).slice(0, isMobile ? 4 : 8).map(([kode, info]) => (
                    <button
                      key={kode}
                      onClick={() => {
                        setSelectedKode(kode);
                        setGeneratedNomor(null);
                      }}
                      className={`p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                        selectedKode === kode
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-8 h-8 ${getKodeBadgeColor(kode)} text-white rounded-lg flex items-center justify-center text-xs font-bold`}>
                          {kode}
                        </span>
                        <span className="text-sm font-medium text-slate-700 truncate">
                          {info.nama.replace('Surat ', '')}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Preview Nomor */}
              <div className={`${isMobile ? '' : 'col-span-5'}`}>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Nomor Surat
                </label>
                <div className="relative">
                  <div className="w-full px-6 py-5 bg-gradient-to-r from-slate-50 to-slate-100 border-2 border-slate-200 rounded-2xl">
                    {generatedNomor ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-mono font-bold text-primary tracking-wide">
                            {generatedNomor.nomor}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">Nomor siap digunakan</p>
                        </div>
                        <button
                          onClick={() => handleCopy(generatedNomor.nomor)}
                          className="p-3 bg-white hover:bg-slate-100 rounded-xl shadow-md transition-all hover:scale-105"
                          title="Salin nomor"
                        >
                          📋
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-slate-400 font-mono text-lg">
                          {selectedKode || '???'}/___/___/____
                        </p>
                        <p className="text-xs text-slate-400 mt-1">Klik Generate untuk membuat nomor</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className={`${isMobile ? '' : 'col-span-3'} flex items-end`}>
                <div className={`w-full space-y-2 ${isMobile ? 'grid grid-cols-2 gap-2 space-y-0' : ''}`}>
                  <button
                    onClick={handleGenerate}
                    className={`w-full px-6 py-3 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-white font-semibold rounded-xl shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${isMobile ? '' : ''}`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span>🔄</span>
                      <span>Generate</span>
                    </span>
                  </button>
                  {generatedNomor && (
                    <button
                      onClick={handleUseNomor}
                      className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <span>✅</span>
                        <span>Gunakan</span>
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {generatedNomor && (
              <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl">
                <p className="text-sm text-emerald-700 flex items-center gap-2">
                  <span className="text-lg">💡</span>
                  <span>
                    <span className="font-semibold">Nomor siap digunakan!</span> 
                    {' '}Klik "Gunakan" untuk menyimpan nomor ini ke daftar.
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* DAFTAR NOMOR (Ultra Premium Table)                                  */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <span className="text-xl">📋</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Daftar Nomor Surat</h2>
                  <p className="text-sm text-slate-300">{filteredRecords.length} nomor terdaftar</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Search & Filter */}
          <div className="p-4 bg-slate-50/50 border-b border-slate-200">
            <div className={`${isMobile ? 'space-y-3' : 'flex items-center gap-3'}`}>
              {/* Search */}
              <div className={`${isMobile ? '' : 'flex-1'}`}>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <span className="material-symbols-outlined text-xl">search</span>
                  </span>
                  <input
                    type="text"
                    placeholder="Cari nomor surat..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
              
              {/* Filters */}
              <div className={`flex gap-2 ${isMobile ? 'flex-wrap' : ''}`}>
                <select
                  value={filterKode}
                  onChange={(e) => {
                    setFilterKode(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`${isMobile ? 'flex-1' : 'w-40'} px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm`}
                >
                  <option value="">Semua Jenis</option>
                  {Object.entries(KODE_SURAT).map(([kode, info]) => (
                    <option key={kode} value={kode}>{info.nama}</option>
                  ))}
                </select>
                
                <select
                  value={filterBulan}
                  onChange={(e) => {
                    setFilterBulan(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`${isMobile ? 'flex-1' : 'w-32'} px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm`}
                >
                  <option value="">Semua Bulan</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(bulan => (
                    <option key={bulan} value={bulan}>
                      {getRomanMonth(bulan)} - {getIndonesianMonth(bulan)}
                    </option>
                  ))}
                </select>
                
                <select
                  value={filterTahun}
                  onChange={(e) => {
                    setFilterTahun(e.target.value);
                    setFilterBulan('');
                    setCurrentPage(1);
                  }}
                  className={`${isMobile ? 'flex-1' : 'w-28'} px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm`}
                >
                  <option value="">Tahun</option>
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                </select>
                
                {(searchQuery || filterBulan || filterTahun || filterKode) && (
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors text-sm flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-lg">restart_alt</span>
                    <span className={isMobile ? 'hidden' : ''}>Reset</span>
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Table Content */}
          <div className="p-4">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">📭</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Tidak Ada Data</h3>
                <p className="text-slate-500 max-w-sm mx-auto">
                  {searchQuery || filterBulan || filterTahun || filterKode
                    ? 'Tidak ada nomor surat yang cocok dengan filter. Coba reset filter.'
                    : 'Belum ada nomor surat yang digunakan. Generate nomor baru untuk memulai.'}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                {!isMobile && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600 w-16">No</th>
                          <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">Nomor Surat</th>
                          <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">Jenis</th>
                          <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">Tanggal</th>
                          <th className="text-center py-4 px-4 text-sm font-semibold text-slate-600 w-32">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedRecords.map((record, index) => (
                          <tr 
                            key={record.id}
                            className="border-b border-slate-100 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50/30 transition-all duration-200"
                          >
                            <td className="py-4 px-4 text-sm text-slate-500 font-medium">
                              {(currentPage - 1) * itemsPerPage + index + 1}
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-mono font-bold text-slate-800 text-lg bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                                {record.nomor}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-md ${getKodeBadgeColor(record.kode)}`}>
                                {record.jenis}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-sm text-slate-500">
                              {formatDateTime(record.createdAt)}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => handleCopy(record.nomor)}
                                  className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                  title="Salin"
                                >
                                  <span className="material-symbols-outlined text-slate-500 hover:text-blue-600 text-lg">content_copy</span>
                                </button>
                                <button
                                  onClick={() => handleViewDetail(record)}
                                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                  title="Detail"
                                >
                                  <span className="material-symbols-outlined text-slate-500 hover:text-slate-700 text-lg">visibility</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(record)}
                                  className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                  title="Hapus"
                                >
                                  <span className="material-symbols-outlined text-slate-500 hover:text-red-600 text-lg">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {/* Mobile Cards */}
                {isMobile && (
                  <div className="space-y-3">
                    {paginatedRecords.map((record, index) => (
                      <div 
                        key={record.id}
                        className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <span className="font-mono font-bold text-slate-800 text-lg">
                              {record.nomor}
                            </span>
                            <p className="text-xs text-slate-500 mt-1">{formatDateTime(record.createdAt)}</p>
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold text-white ${getKodeBadgeColor(record.kode)}`}>
                            {record.kode}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                          <button
                            onClick={() => handleCopy(record.nomor)}
                            className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors text-sm font-medium"
                          >
                            📋 Salin
                          </button>
                          <button
                            onClick={() => handleViewDetail(record)}
                            className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors text-sm font-medium"
                          >
                            👁️ Detail
                          </button>
                          <button
                            onClick={() => handleDeleteClick(record)}
                            className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className={`${isMobile ? 'flex flex-col items-center gap-3' : 'flex items-center justify-between'} mt-6 pt-6 border-t border-slate-200`}>
                    <p className="text-sm text-slate-500">
                      Menampilkan {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredRecords.length)} dari {filteredRecords.length}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">chevron_left</span>
                      </button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let page;
                        if (totalPages <= 5) page = i + 1;
                        else if (currentPage <= 3) page = i + 1;
                        else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                        else page = currentPage - 2 + i;
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 rounded-lg font-medium transition-all ${
                              currentPage === page
                                ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/30'
                                : 'hover:bg-slate-100 text-slate-600'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">chevron_right</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SETTINGS MODAL                                                      */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                  <span>⚙️</span> Pengaturan Format
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-white">close</span>
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nama Sekolah (untuk format nomor)
                </label>
                <input
                  type="text"
                  value={formatSettings.namaSekolah}
                  onChange={(e) => setFormatSettings(prev => ({ ...prev, namaSekolah: e.target.value }))}
                  placeholder="Contoh: SDN, SMA"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Format Bulan
                </label>
                <select
                  value={formatSettings.bulanFormat}
                  onChange={(e) => setFormatSettings(prev => ({ ...prev, bulanFormat: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                >
                  <option value="romawi">Romawi (I, II, III, ...)</option>
                  <option value="angka">Angka (01, 02, 03, ...)</option>
                  <option value="nama">Nama (Januari, Februari, ...)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Format Tahun
                </label>
                <select
                  value={formatSettings.tahunFormat}
                  onChange={(e) => setFormatSettings(prev => ({ ...prev, tahunFormat: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                >
                  <option value={4}>4 digit (2026)</option>
                  <option value={2}>2 digit (26)</option>
                </select>
              </div>
              
              {/* Preview */}
              <div className="p-4 bg-gradient-to-r from-primary/5 to-blue-50 border border-primary/20 rounded-xl">
                <p className="text-sm text-slate-600 mb-2">Preview Format:</p>
                <p className="font-mono font-bold text-primary text-lg">
                  {selectedKode || 'STS'}/___/{formatSettings.bulanFormat === 'romawi' ? 'VII' : formatSettings.bulanFormat === 'angka' ? '07' : 'Juli'}/{formatSettings.tahunFormat === 4 ? '2026' : '26'}
                </p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveFormatSettings}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-white font-medium rounded-xl shadow-lg shadow-primary/30 transition-all"
              >
                💾 Simpan
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* DETAIL MODAL                                                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {showDetailModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-blue-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                  <span>📄</span> Detail Nomor Surat
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-white">close</span>
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <p className="text-sm text-slate-500 mb-2">Nomor Surat</p>
                <p className="text-3xl font-mono font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  {selectedRecord.nomor}
                </p>
              </div>
              
              <div className="space-y-3 mb-6">
                {[
                  { label: 'Jenis Surat', value: selectedRecord.jenis },
                  { label: 'Kode', value: selectedRecord.kode },
                  { label: 'Nomor Urut', value: selectedRecord.nomorUrut },
                  { label: 'Bulan', value: `${getRomanMonth(selectedRecord.bulan)} (${selectedRecord.bulan})` },
                  { label: 'Tahun', value: selectedRecord.tahun },
                  { label: 'Dibuat', value: formatDateTime(selectedRecord.createdAt) },
                  { label: 'Status', value: '✅ Digunakan', highlight: true }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between py-3 border-b border-slate-100 last:border-0">
                    <span className="text-slate-500">{item.label}</span>
                    <span className={`font-medium ${item.highlight ? 'text-emerald-600' : 'text-slate-800'}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    handleCopy(selectedRecord.nomor);
                    setShowDetailModal(false);
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-blue-600 text-white font-medium rounded-xl shadow-lg shadow-primary/30 transition-all"
                >
                  📋 Salin Nomor
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* DELETE CONFIRMATION MODAL                                           */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {showDeleteConfirm && recordToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-rose-500 to-red-600 px-6 py-4">
              <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                <span>⚠️</span> Konfirmasi Hapus
              </h3>
            </div>
            
            <div className="p-6">
              <p className="text-slate-600 text-center mb-4">
                Apakah Anda yakin ingin menghapus nomor surat?
              </p>
              <p className="text-2xl font-mono font-bold text-center text-slate-800 mb-2">
                {recordToDelete.nomor}
              </p>
              <p className="text-sm text-slate-500 text-center mb-6">
                Tindakan ini tidak dapat dibatalkan.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setRecordToDelete(null);
                  }}
                  className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-500 to-red-600 hover:from-red-600 hover:to-rose-500 text-white font-medium rounded-xl shadow-lg shadow-rose-500/30 transition-all"
                >
                  🗑️ Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NomorSuratPage;
