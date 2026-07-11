import { useState, useEffect, useRef } from 'react';
import {
  getAllTemplates,
  getTemplate,
  generateDefaultValues,
  isAutoFillAvailable,
  generateIsiSurat,
  downloadSuratHTML,
  printSurat,
  saveDraftsurat,
  getDataSekolah,
  getDataPejabat
} from '../../utils/templateSuratHelper';
import { generateNomorSurat, saveNomorSurat } from '../../utils/nomorSuratHelper';
import { useToast } from '../../components/ui/Toast';
import { useSidebar } from '../../contexts/SidebarContext';

const TemplateSuratPage = () => {
  const { showToast } = useToast();
  const { isMobile } = useSidebar();
  const previewRef = useRef(null);
  
  // State
  const [templates] = useState(getAllTemplates());
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [values, setValues] = useState({});
  const [autoFillStatus, setAutoFillStatus] = useState(null);
  const [generatedNomor, setGeneratedNomor] = useState(null);
  const [previewHtml, setPreviewHtml] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Load auto-fill status
  useEffect(() => {
    setAutoFillStatus(isAutoFillAvailable());
  }, []);
  
  // Select template
  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    const defaultValues = generateDefaultValues(template.id);
    setValues(defaultValues);
    setGeneratedNomor(null);
    setPreviewHtml('');
    setShowPreview(false);
  };
  
  // Handle input change
  const handleInputChange = (fieldId, value) => {
    setValues(prev => ({ ...prev, [fieldId]: value }));
    setPreviewHtml('');
  };
  
  // Generate nomor surat
  const handleGenerateNomor = () => {
    if (!selectedTemplate) return;
    
    try {
      const { nomor, record } = generateNomorSurat(selectedTemplate.kode);
      setGeneratedNomor({ nomor, record });
      setValues(prev => ({ ...prev, nomorSurat: nomor }));
      showToast(`Nomor ${nomor} berhasil digenerate`, 'success');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };
  
  // Update preview
  const handleUpdatePreview = () => {
    if (!selectedTemplate) return;
    
    const html = generateIsiSurat(selectedTemplate.id, values);
    setPreviewHtml(html);
    setShowPreview(true);
  };
  
  // Download
  const handleDownload = () => {
    if (!selectedTemplate) return;
    
    // Save nomor if generated
    if (generatedNomor) {
      try {
        saveNomorSurat(generatedNomor.record);
      } catch (e) {
        // Ignore if already saved
      }
    }
    
    downloadSuratHTML(selectedTemplate.id, values);
    showToast('Surat berhasil didownload', 'success');
  };
  
  // Print
  const handlePrint = () => {
    if (!selectedTemplate) return;
    
    // Save nomor if generated
    if (generatedNomor) {
      try {
        saveNomorSurat(generatedNomor.record);
      } catch (e) {
        // Ignore if already saved
      }
    }
    
    printSurat(selectedTemplate.id, values);
  };
  
  // Save as draft
  const handleSaveDraft = () => {
    if (!selectedTemplate) return;
    
    const draft = {
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.nama,
      values,
      nomorSurat: generatedNomor?.nomor || null
    };
    
    saveDraftsurat(draft);
    showToast('Draft berhasil disimpan', 'success');
  };
  
  // Reset form
  const handleReset = () => {
    if (!selectedTemplate) return;
    
    const defaultValues = generateDefaultValues(selectedTemplate.id);
    setValues(defaultValues);
    setGeneratedNomor(null);
    setPreviewHtml('');
    setShowPreview(false);
    showToast('Form berhasil direset', 'success');
  };
  
  // Render field based on type
  const renderField = (field) => {
    const value = values[field.id] || '';
    
    if (field.type === 'textarea') {
      return (
        <textarea
          key={field.id}
          value={value}
          onChange={(e) => handleInputChange(field.id, e.target.value)}
          placeholder={field.placeholder}
          rows={4}
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
        />
      );
    }
    
    return (
      <input
        key={field.id}
        type="text"
        value={value}
        onChange={(e) => handleInputChange(field.id, e.target.value)}
        placeholder={field.placeholder}
        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
      />
    );
  };
  
  return (
    <div className="min-h-screen bg-slate-100/80 pb-8">
      {/* Hero Header */}
      <div className={`bg-gradient-to-r from-primary to-blue-600 text-white ${isMobile ? 'px-4 py-6' : 'px-8 py-10'} mb-6`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">📝</span>
            <h1 className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
              Template Surat Cerdas
            </h1>
          </div>
          <p className={`${isMobile ? 'text-sm' : 'text-base'} text-blue-100`}>
            Buat surat dengan data otomatis dari profil sekolah
          </p>
        </div>
      </div>
      
      <div className={`${isMobile ? 'px-4' : 'px-8'} max-w-7xl mx-auto`}>
        {/* Auto-Fill Status */}
        {autoFillStatus && !autoFillStatus.isComplete && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-medium text-amber-800">Data Belum Lengkap</p>
                <p className="text-sm text-amber-600 mt-1">
                  {!autoFillStatus.hasSekolah && '• Data sekolah belum diisi. '}
                  {!autoFillStatus.hasKepsek && '• Data Kepala Sekolah belum diisi. '}
                  {!autoFillStatus.hasBendahara && '• Data Bendahara belum diisi. '}
                  <a href="/dashboard/data-sekolah" className="underline font-medium">
                    Lengkapi data sekarang →
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Template Selection */}
        <div className="bg-white/60 backdrop-blur-2xl rounded-2xl p-6 border border-white/20 shadow-lg mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <span className="text-xl">📋</span>
            Pilih Template Surat
          </h2>
          
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'} gap-4`}>
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedTemplate?.id === template.id
                    ? 'border-primary bg-primary/5'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{template.icon}</span>
                  <div>
                    <h3 className="font-semibold text-slate-800">{template.nama}</h3>
                    <p className="text-sm text-slate-500 mt-1">{template.deskripsi}</p>
                    <span className="inline-block mt-2 px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                      {template.kode}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Editor Section */}
        {selectedTemplate && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left: Form */}
            <div className="bg-white/60 backdrop-blur-2xl rounded-2xl p-6 border border-white/20 shadow-lg">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span className="text-xl">✏️</span>
                Form {selectedTemplate.nama}
              </h2>
              
              {/* Auto-Fill Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <span>🤖</span> Data Otomatis (Auto-Fill)
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className={autoFillStatus?.hasSekolah ? 'text-green-500' : 'text-red-500'}>
                      {autoFillStatus?.hasSekolah ? '✅' : '❌'}
                    </span>
                    <span className="text-slate-600">Nama Sekolah</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={autoFillStatus?.hasKepsek ? 'text-green-500' : 'text-red-500'}>
                      {autoFillStatus?.hasKepsek ? '✅' : '❌'}
                    </span>
                    <span className="text-slate-600">Kepala Sekolah</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={autoFillStatus?.hasBendahara ? 'text-green-500' : 'text-red-500'}>
                      {autoFillStatus?.hasBendahara ? '✅' : '❌'}
                    </span>
                    <span className="text-slate-600">Bendahara</span>
                  </div>
                </div>
              </div>
              
              {/* Nomor Surat */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nomor Surat
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={values.nomorSurat || ''}
                    onChange={(e) => handleInputChange('nomorSurat', e.target.value)}
                    placeholder="Masukkan atau generate nomor"
                    className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono"
                  />
                  <button
                    onClick={handleGenerateNomor}
                    className="px-4 py-3 bg-primary hover:bg-blue-700 text-white rounded-xl transition-colors"
                    title="Generate nomor otomatis"
                  >
                    🔢
                  </button>
                </div>
              </div>
              
              {/* Template Fields */}
              <div className="space-y-4 mb-4">
                {selectedTemplate.fields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {renderField(field)}
                  </div>
                ))}
              </div>
              
              {/* Kota */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Kota/Kabupaten
                </label>
                <input
                  type="text"
                  value={values.kota || ''}
                  onChange={(e) => handleInputChange('kota', e.target.value)}
                  placeholder="Kota/Kabupaten"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              </div>
              
              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200">
                <button
                  onClick={handleUpdatePreview}
                  className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
                >
                  👁️ Preview
                </button>
                <button
                  onClick={handleSaveDraft}
                  className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
                >
                  💾 Simpan Draft
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
                >
                  ↩️ Reset
                </button>
              </div>
            </div>
            
            {/* Right: Preview */}
            <div className="bg-white/60 backdrop-blur-2xl rounded-2xl p-6 border border-white/20 shadow-lg">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span className="text-xl">📄</span>
                Preview Surat
              </h2>
              
              {showPreview && previewHtml ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div 
                    ref={previewRef}
                    className="bg-white p-4 max-h-[600px] overflow-y-auto"
                    style={{ minHeight: '400px' }}
                  >
                    <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-slate-800">
                      {previewHtml}
                    </pre>
                  </div>
                  
                  {/* Download Actions */}
                  <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2">
                    <button
                      onClick={handleDownload}
                      className="flex-1 px-4 py-3 bg-primary hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
                    >
                      📥 Download HTML
                    </button>
                    <button
                      onClick={handlePrint}
                      className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-colors"
                    >
                      🖨️ Print
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center" style={{ minHeight: '400px' }}>
                  <span className="text-5xl mb-4 block">📄</span>
                  <p className="text-slate-500 mb-2">Belum ada preview</p>
                  <p className="text-sm text-slate-400">
                    Isi form di sebelah kiri, lalu klik "Preview" untuk melihat surat
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Empty State */}
        {!selectedTemplate && (
          <div className="bg-white/60 backdrop-blur-2xl rounded-2xl p-12 border border-white/20 shadow-lg text-center">
            <span className="text-6xl mb-4 block">📝</span>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              Pilih Template Surat
            </h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Pilih salah satu template di atas untuk mulai membuat surat. 
              Data sekolah dan pejabat akan terisi otomatis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateSuratPage;
