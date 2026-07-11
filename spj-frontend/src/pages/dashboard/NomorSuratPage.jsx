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
  getRomanMonth
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
  const itemsPerPage = 10;
  
  // Load data
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = () => {
    setRecords(searchNomorSurat());
    setStatistics(getStatistics());
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
  
  // Available filter options
  const availableYears = getAvailableYears();
  const availableMonths = filterTahun ? getAvailableMonths(parseInt(filterTahun)) : [];
  
  // Generate nomor
  const handleGenerate = () => {
    try {
      const { nomor, record } = generateNomorSurat(selectedKode);
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
  
  // Delete confirmation
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
  
  // Get kode info
  const getKodeInfo = (kode) => {
    return KODE_SURAT[kode] || { nama: 'Unknown', warna: 'gray' };
  };
  
  // Badge color for kode
  const getKodeBadgeColor = (kode) => {
    const colors = {
      STS: 'bg-blue-100 text-blue-700',
      SK: 'bg-green-100 text-green-700',
      SU: 'bg-purple-100 text-purple-700',
      SP: 'bg-orange-100 text-orange-700',
      SKU: 'bg-red-100 text-red-700',
      STL: 'bg-teal-100 text-teal-700',
      SL: 'bg-cyan-100 text-cyan-700',
      SN: 'bg-indigo-100 text-indigo-700'
    };
    return colors[kode] || 'bg-gray-100 text-gray-700';
  };
  
  return (
    <div className="min-h-screen bg-slate-100/80 pb-8">
      {/* Hero Header */}
      <div className={`bg-gradient-to-r from-primary to-blue-600 text-white ${isMobile ? 'px-4 py-6' : 'px-8 py-10'} mb-6`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🔢</span>
            <h1 className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
              Nomor Surat Keluar
            </h1>
          </div>
          <p className={`${isMobile ? 'text-sm' : 'text-base'} text-blue-100`}>
            Generate nomor surat otomatis tanpa duplikasi
          </p>
        </div>
      </div>
      
      <div className={`${isMobile ? 'px-4' : 'px-8'} max-w-7xl mx-auto`}>
        {/* Statistics Cards */}
        <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4 mb-6`}>
          <div className="bg-white/60 backdrop-blur-2xl rounded-2xl p-4 border border-white/20 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <p className="text-sm text-slate-500">Bulan Ini</p>
                <p className="text-2xl font-bold text-slate-800">{statistics.bulanIni}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/60 backdrop-blur-2xl rounded-2xl p-4 border border-white/20 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📆</span>
              </div>
              <div>
                <p className="text-sm text-slate-500">Tahun Ini</p>
                <p className="text-2xl font-bold text-slate-800">{statistics.tahunIni}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/60 backdrop-blur-2xl rounded-2xl p-4 border border-white/20 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">⏰</span>
              </div>
              <div>
                <p className="text-sm text-slate-500">Hari Ini</p>
                <p className="text-2xl font-bold text-slate-800">{statistics.hariIni}</p>
              </div>
            </div>
          </div>
          
          <div className={`bg-white/60 backdrop-blur-2xl rounded-2xl p-4 border border-white/20 shadow-lg ${isMobile ? 'col-span-2' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📌</span>
              </div>
              <div>
                <p className="text-sm text-slate-500">Terakhir</p>
                <p className="text-sm font-mono font-bold text-slate-800 truncate">{statistics.terakhir}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Generate Section */}
        <div className="bg-white/60 backdrop-blur-2xl rounded-2xl p-6 border border-white/20 shadow-lg mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <span className="text-xl">✨</span>
            Generate Nomor Baru
          </h2>
          
          <div className={`${isMobile ? '' : 'flex items-end gap-6'}`}>
            <div className={`${isMobile ? 'mb-4' : 'flex-1'}`}>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Jenis Surat
              </label>
              <select
                value={selectedKode}
                onChange={(e) => {
                  setSelectedKode(e.target.value);
                  setGeneratedNomor(null);
                }}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              >
                {Object.entries(KODE_SURAT).map(([kode, info]) => (
                  <option key={kode} value={kode}>
                    {info.nama} ({kode})
                  </option>
                ))}
              </select>
            </div>
            
            <div className={`${isMobile ? 'mb-4' : 'flex-1'}`}>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nomor Otomatis
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-lg font-bold text-slate-800">
                  {generatedNomor ? (
                    <span className="text-primary">{generatedNomor.nomor}</span>
                  ) : (
                    <span className="text-slate-400">Klik Generate</span>
                  )}
                </div>
                {generatedNomor && (
                  <button
                    onClick={() => handleCopy(generatedNomor.nomor)}
                    className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    title="Salin nomor"
                  >
                    📋
                  </button>
                )}
              </div>
            </div>
            
            <div className={`flex gap-2 ${isMobile ? '' : ''}`}>
              <button
                onClick={handleGenerate}
                className={`px-6 py-3 bg-primary hover:bg-blue-700 text-white font-medium rounded-xl transition-colors ${isMobile ? 'w-full' : ''}`}
              >
                🔄 Generate
              </button>
              {generatedNomor && (
                <button
                  onClick={handleUseNomor}
                  className={`px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-colors ${isMobile ? 'w-full' : ''}`}
                >
                  ✅ Gunakan
                </button>
              )}
            </div>
          </div>
          
          {generatedNomor && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-sm text-green-700">
                <span className="font-semibold">💡 Nomor siap digunakan!</span> Klik "Gunakan" untuk menyimpan nomor ini ke daftar.
              </p>
            </div>
          )}
        </div>
        
        {/* List Section */}
        <div className="bg-white/60 backdrop-blur-2xl rounded-2xl p-6 border border-white/20 shadow-lg">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <span className="text-xl">📋</span>
            Daftar Nomor Yang Sudah Digunakan
          </h2>
          
          {/* Search & Filter */}
          <div className={`${isMobile ? 'space-y-3' : 'flex items-center gap-3'} mb-4`}>
            <div className={`${isMobile ? '' : 'flex-1'}`}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                <input
                  type="text"
                  placeholder="Cari nomor surat..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
            
            <div className={`flex gap-2 ${isMobile ? 'flex-wrap' : ''}`}>
              <select
                value={filterKode}
                onChange={(e) => {
                  setFilterKode(e.target.value);
                  setCurrentPage(1);
                }}
                className={`${isMobile ? 'flex-1' : 'w-40'} px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm`}
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
                className={`${isMobile ? 'flex-1' : 'w-32'} px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm`}
              >
                <option value="">Semua Bulan</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(bulan => (
                  <option key={bulan} value={bulan}>
                    {getRomanMonth(bulan)} ({bulan})
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
                className={`${isMobile ? 'flex-1' : 'w-28'} px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm`}
              >
                <option value="">Semua Tahun</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
              
              {(searchQuery || filterBulan || filterTahun || filterKode) && (
                <button
                  onClick={handleResetFilters}
                  className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors text-sm"
                >
                  ↩️ Reset
                </button>
              )}
            </div>
          </div>
          
          {/* Table */}
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-5xl mb-4 block">📭</span>
              <p className="text-slate-500">
                {searchQuery || filterBulan || filterTahun || filterKode
                  ? 'Tidak ada nomor surat yang cocok dengan filter'
                  : 'Belum ada nomor surat yang digunakan'}
              </p>
              <p className="text-sm text-slate-400 mt-2">
                {searchQuery || filterBulan || filterTahun || filterKode
                  ? 'Coba reset filter untuk melihat semua data'
                  : 'Generate nomor surat baru untuk memulai'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">No</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Nomor Surat</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Jenis</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Tanggal</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRecords.map((record, index) => (
                      <tr 
                        key={record.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm text-slate-500">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-slate-800">
                            {record.nomor}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${getKodeBadgeColor(record.kode)}`}>
                            {record.jenis}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-500">
                          {formatDateTime(record.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleCopy(record.nomor)}
                              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Salin"
                            >
                              📋
                            </button>
                            <button
                              onClick={() => handleViewDetail(record)}
                              className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Detail"
                            >
                              👁️
                            </button>
                            <button
                              onClick={() => handleDeleteClick(record)}
                              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                              title="Hapus"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className={`${isMobile ? 'flex flex-col items-center gap-3' : 'flex items-center justify-between'} mt-4 pt-4 border-t border-slate-200`}>
                  <p className="text-sm text-slate-500">
                    Menampilkan {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredRecords.length)} dari {filteredRecords.length} nomor
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-sm rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      ← Prev
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let page;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                            currentPage === page
                              ? 'bg-primary text-white'
                              : 'hover:bg-slate-100'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 text-sm rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Detail Modal */}
      {showDetailModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-blue-600 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-semibold text-lg">📄 Detail Nomor Surat</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-6">
                <p className="text-sm text-slate-500 mb-2">Nomor Surat</p>
                <p className="text-2xl font-mono font-bold text-primary">
                  {selectedRecord.nomor}
                </p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Jenis Surat</span>
                  <span className="font-medium text-slate-800">{selectedRecord.jenis}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Kode</span>
                  <span className="font-medium text-slate-800">{selectedRecord.kode}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Nomor Urut</span>
                  <span className="font-medium text-slate-800">{selectedRecord.nomorUrut}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Bulan</span>
                  <span className="font-medium text-slate-800">
                    {getRomanMonth(selectedRecord.bulan)} ({selectedRecord.bulan})
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Tahun</span>
                  <span className="font-medium text-slate-800">{selectedRecord.tahun}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Dibuat</span>
                  <span className="font-medium text-slate-800">
                    {formatDateTime(selectedRecord.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Status</span>
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                    ✅ Digunakan
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleCopy(selectedRecord.nomor);
                    setShowDetailModal(false);
                  }}
                  className="flex-1 px-4 py-3 bg-primary hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
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
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && recordToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            <div className="bg-red-500 text-white px-6 py-4">
              <h3 className="font-semibold text-lg">⚠️ Konfirmasi Hapus</h3>
            </div>
            
            <div className="p-6">
              <p className="text-slate-600 mb-4">
                Apakah Anda yakin ingin menghapus nomor surat:
              </p>
              <p className="text-xl font-mono font-bold text-center text-slate-800 mb-6">
                {recordToDelete.nomor}
              </p>
              <p className="text-sm text-slate-500 text-center mb-6">
                Nomor ini tidak dapat dikembalikan setelah dihapus.
              </p>
              
              <div className="flex gap-2">
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
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors"
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
