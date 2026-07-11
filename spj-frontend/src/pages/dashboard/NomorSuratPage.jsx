import { useState, useEffect, useMemo } from 'react';
import {
  KODE_SURAT,
  generateNomorSurat,
  saveNomorSurat,
  deleteNomorSurat,
  getStatistics,
  searchNomorSurat,
  getRomanMonth,
  getIndonesianMonth,
  getFormatSettings,
  saveFormatSettings
} from '../../utils/nomorSuratHelper';
import { useToast } from '../../components/ui/Toast';
import { useSidebar } from '../../contexts/SidebarContext';

const NomorSuratPage = () => {
  const { showToast } = useToast();
  const { isMobile } = useSidebar();
  
  // State
  const [selectedKode, setSelectedKode] = useState('STS');
  const [nomorUrut, setNomorUrut] = useState(1);
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [namaSekolah, setNamaSekolah] = useState('SDN');
  
  const [generatedNomor, setGeneratedNomor] = useState('');
  const [records, setRecords] = useState([]);
  const [statistics, setStatistics] = useState({ bulanIni: 0, tahunIni: 0, hariIni: 0, terakhir: '-' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKode, setFilterKode] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Load data
  useEffect(() => {
    loadData();
    loadSettings();
  }, []);
  
  const loadData = () => {
    setRecords(searchNomorSurat());
    setStatistics(getStatistics());
  };
  
  const loadSettings = () => {
    const settings = getFormatSettings();
    if (settings?.namaSekolah) setNamaSekolah(settings.namaSekolah);
  };
  
  // Generate preview nomor
  const generatePreview = () => {
    const romanMonth = getRomanMonth(bulan);
    const nomor = `${selectedKode}/${String(nomorUrut).padStart(3, '0')}/${romanMonth}/${tahun}`;
    setGeneratedNomor(nomor);
    return nomor;
  };
  
  // Auto-generate on first load & when selecting kode
  useEffect(() => {
    // Get next number based on current month/year/kode
    const records = searchNomorSurat('', { kode: selectedKode, bulan, tahun });
    const lastNumber = records.length > 0 ? records[0].nomorUrut : 0;
    setNomorUrut(lastNumber + 1);
    generatePreview();
  }, [selectedKode, bulan, tahun]);
  
  // Update preview when nomorUrut changes
  useEffect(() => {
    generatePreview();
  }, [nomorUrut]);
  
  // Save as used
  const handleUseNomor = () => {
    if (!generatedNomor) return;
    
    try {
      const record = {
        id: `ns_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        nomor: generatedNomor,
        kode: selectedKode,
        jenis: KODE_SURAT[selectedKode].nama,
        nomorUrut: nomorUrut,
        bulan: bulan,
        bulanRomawi: getRomanMonth(bulan),
        tahun: tahun,
        namaSekolah: namaSekolah,
        createdAt: new Date().toISOString(),
        usedAt: new Date().toISOString(),
        status: 'used'
      };
      
      saveNomorSurat(record);
      showToast(`Nomor ${generatedNomor} berhasil digunakan!`, 'success');
      
      // Auto increment for next use
      setNomorUrut(prev => prev + 1);
      loadData();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };
  
  // Copy to clipboard
  const handleCopy = (nomor) => {
    navigator.clipboard.writeText(nomor);
    showToast('Berhasil disalin!', 'success');
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
      showToast('Berhasil dihapus', 'success');
      setShowDeleteConfirm(false);
      setRecordToDelete(null);
      loadData();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };
  
  // Filtered records
  const filteredRecords = useMemo(() => {
    let filtered = searchNomorSurat(searchQuery);
    if (filterKode) {
      filtered = filtered.filter(r => r.kode === filterKode);
    }
    return filtered;
  }, [searchQuery, filterKode]);
  
  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Get badge color class
  const getBadgeColor = (kode) => {
    const colors = {
      STS: 'bg-blue-500',
      SK: 'bg-emerald-500',
      SU: 'bg-violet-500',
      SP: 'bg-amber-500',
      SKU: 'bg-rose-500',
      STL: 'bg-teal-500',
      SL: 'bg-cyan-500',
      SN: 'bg-indigo-500'
    };
    return colors[kode] || 'bg-slate-500';
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* HEADER - Ultra Minimalist                                          */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className={`bg-white border-b border-slate-200 ${isMobile ? 'px-4 py-5' : 'px-8 py-6'}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white text-xl">pin</span>
            </div>
            <div>
              <h1 className={`font-bold text-slate-900 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                Nomor Surat
              </h1>
              <p className="text-sm text-slate-500">Penomoran otomatis & terstruktur</p>
            </div>
          </div>
          
          {/* Stats Inline */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-900">{statistics.bulanIni}</p>
              <p className="text-xs text-slate-500">bulan ini</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className={`${isMobile ? 'px-4 py-6' : 'px-8 py-8'} max-w-6xl mx-auto`}>
        
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* GENERATOR CARD - Ultra Clean                                       */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
          
          {/* Jenis Surat Selector - Pill Style */}
          <div className="p-6 pb-4 border-b border-slate-100">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Jenis Surat
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(KODE_SURAT).map(([kode, info]) => (
                <button
                  key={kode}
                  onClick={() => setSelectedKode(kode)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    selectedKode === kode
                      ? 'bg-primary text-white shadow-lg shadow-primary/25'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {info.nama.replace('Surat ', '')}
                </button>
              ))}
            </div>
          </div>
          
          {/* Form Fields - Clean Grid */}
          <div className="p-6">
            <div className={`grid ${isMobile ? 'grid-cols-2 gap-4' : 'grid-cols-4 gap-6'}`}>
              
              {/* Nama Sekolah */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Nama Sekolah
                </label>
                <input
                  type="text"
                  value={namaSekolah}
                  onChange={(e) => setNamaSekolah(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              </div>
              
              {/* Nomor Urut */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  No. Urut
                </label>
                <input
                  type="number"
                  value={nomorUrut}
                  onChange={(e) => setNomorUrut(parseInt(e.target.value) || 1)}
                  min="1"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              </div>
              
              {/* Bulan */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Bulan
                </label>
                <select
                  value={bulan}
                  onChange={(e) => setBulan(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(b => (
                    <option key={b} value={b}>{getRomanMonth(b)} — {getIndonesianMonth(b)}</option>
                  ))}
                </select>
              </div>
              
              {/* Tahun */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Tahun
                </label>
                <select
                  value={tahun}
                  onChange={(e) => setTahun(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                >
                  {[2024, 2025, 2026, 2027, 2028].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Generated Nomor Preview */}
            <div className="mt-6 p-6 bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Nomor Surat
                  </p>
                  <p className="text-3xl font-mono font-bold text-slate-900 tracking-wide">
                    {generatedNomor || '—'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(generatedNomor)}
                    className="p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-all"
                    title="Salin"
                  >
                    <span className="material-symbols-outlined text-slate-600">content_copy</span>
                  </button>
                  <button
                    onClick={handleUseNomor}
                    className="px-6 py-3 bg-primary hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
                  >
                    Gunakan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* DAFTAR NOMOR - Clean Table                                          */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          
          {/* Table Header */}
          <div className="p-6 pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Daftar Nomor</h2>
                <p className="text-sm text-slate-500">{filteredRecords.length} surat terdaftar</p>
              </div>
              
              {/* Search */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-xl">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Cari..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all w-64"
                />
              </div>
            </div>
            
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => setFilterKode('')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterKode === '' 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua
              </button>
              {Object.entries(KODE_SURAT).map(([kode, info]) => (
                <button
                  key={kode}
                  onClick={() => setFilterKode(kode)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filterKode === kode 
                      ? 'bg-slate-900 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {kode}
                </button>
              ))}
            </div>
          </div>
          
          {/* Table Content */}
          <div className="p-4">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-slate-400 text-3xl">folder_off</span>
                </div>
                <p className="text-slate-500 font-medium">Belum ada nomor surat</p>
                <p className="text-sm text-slate-400 mt-1">Generate nomor baru untuk memulai</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                {!isMobile && (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">No</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Nomor</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Jenis</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tanggal</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRecords.map((record, index) => (
                        <tr 
                          key={record.id}
                          className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="py-4 px-4 text-sm text-slate-400">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-mono font-semibold text-slate-900">
                              {record.nomor}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold text-white ${getBadgeColor(record.kode)}`}>
                              {record.kode}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-500">
                            {new Date(record.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleCopy(record.nomor)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Salin"
                              >
                                <span className="material-symbols-outlined text-slate-400 hover:text-slate-600 text-lg">content_copy</span>
                              </button>
                              <button
                                onClick={() => handleViewDetail(record)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Detail"
                              >
                                <span className="material-symbols-outlined text-slate-400 hover:text-slate-600 text-lg">visibility</span>
                              </button>
                              <button
                                onClick={() => handleDeleteClick(record)}
                                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                title="Hapus"
                              >
                                <span className="material-symbols-outlined text-slate-400 hover:text-red-500 text-lg">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                
                {/* Mobile Cards */}
                {isMobile && (
                  <div className="space-y-3">
                    {paginatedRecords.map((record) => (
                      <div key={record.id} className="p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-mono font-semibold text-slate-900">{record.nomor}</span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${getBadgeColor(record.kode)}`}>
                            {record.kode}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mb-3">
                          {new Date(record.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCopy(record.nomor)}
                            className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600"
                          >
                            Salin
                          </button>
                          <button
                            onClick={() => handleViewDetail(record)}
                            className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600"
                          >
                            Detail
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                    <p className="text-sm text-slate-400">
                      {currentPage} dari {totalPages} halaman
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined">chevron_left</span>
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
                            className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                              currentPage === page
                                ? 'bg-slate-900 text-white'
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
                        className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined">chevron_right</span>
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
      {/* DETAIL MODAL                                                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {showDetailModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Detail Nomor</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-6">
                <p className="text-3xl font-mono font-bold text-slate-900">
                  {selectedRecord.nomor}
                </p>
              </div>
              
              <div className="space-y-3">
                {[
                  { label: 'Jenis', value: selectedRecord.jenis },
                  { label: 'Nomor Urut', value: selectedRecord.nomorUrut },
                  { label: 'Bulan', value: `${getRomanMonth(selectedRecord.bulan)} (${getIndonesianMonth(selectedRecord.bulan)})` },
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
                <button
                  onClick={() => {
                    handleCopy(selectedRecord.nomor);
                    setShowDetailModal(false);
                  }}
                  className="flex-1 py-3 bg-primary hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
                >
                  Salin
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* DELETE CONFIRMATION                                                 */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {showDeleteConfirm && recordToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-red-500 text-3xl">delete</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Hapus Nomor?</h3>
              <p className="text-slate-500 mb-4">
                <span className="font-mono font-semibold text-slate-700">{recordToDelete.nomor}</span>
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setRecordToDelete(null);
                  }}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors"
                >
                  Hapus
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
