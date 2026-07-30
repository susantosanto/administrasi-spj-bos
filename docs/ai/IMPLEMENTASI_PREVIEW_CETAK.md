# 🖨️ Implementasi Preview & Cetak Dokumentasi A4
*Dibuat: 26 Juli 2026 | Status: IMPLEMENTATION GUIDE*

---

## 📋 Daftar Isi

1. [Alur User Flow](#1-alur-user-flow)
2. [Komponen Print Preview](#2-komponen-print-preview)
3. [Template A4 dengan Kop Surat](#3-template-a4-dengan-kop-surat)
4. [Fitur Cetak](#4-fitur-cetak)
5. [Integrasi ke App](#5-integrasi-ke-app)

---

## 1. Alur User Flow

```
┌─────────────────────────────────────────────────────────────┐
│  ALUR FITUR GENERATE & CETAK DOKUMENTASI                    │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  HALAMAN 1   │      │  HALAMAN 2   │      │  HALAMAN 3   │
│  Upload &    │ ───► │  Hasil       │ ───► │  Preview     │
│  Generate    │      │  Generate    │      │  A4 Cetak    │
└──────────────┘      └──────────────┘      └──────────────┘
       │                     │                     │
       │                     │                     │
       ▼                     ▼                     ▼
  ┌─────────┐          ┌─────────┐          ┌─────────┐
  │ Upload  │          │ Lihat   │          │ Kop     │
  │ Foto    │          │ Hasil   │          │ Surat   │
  │ Pilih   │          │         │          │ Foto    │
  │ Aktiv.  │          │         │          │ Keterangan│
  │ Generate│          │         │          │         │
  └─────────┘          └─────────┘          └─────────┘
                            │                     │
                            │                     │
                       ┌────┴────┐           ┌────┴────┐
                       │         │           │         │
                       ▼         ▼           ▼         ▼
                    ┌──────┐ ┌──────┐    ┌──────┐ ┌──────┐
                    │Preview│ │Ulang │    │Cetak │ │Tambah│
                    │ A4   │ │      │    │      │ │ Foto │
                    └──────┘ └──────┘    └──────┘ └──────┘
```

---

## 2. Komponen Print Preview

### 2.1 Struktur File

```
spj-frontend/
├── src/
│   ├── components/
│   │   └── dokumentasi/
│   │       ├── FaceUploader.jsx
│   │       ├── ActivitySelector.jsx
│   │       ├── PromptEditor.jsx
│   │       ├── ResultPreview.jsx
│   │       ├── PrintPreview.jsx        ← NEW
│   │       └── A4Document.jsx          ← NEW
│   ├── pages/
│   │   └── DokumentasiAIPage.jsx       ← UPDATED
│   ├── services/
│   │   └── imageGenerator.js
│   └── styles/
│       └── print.css                   ← NEW
```

### 2.2 State Management

```jsx
// DokumentasiAIPage.jsx (Updated State)

const [view, setView] = useState('upload') 
// 'upload' | 'result' | 'preview'

const [generatedImage, setGeneratedImage] = useState(null)
const [selectedActivity, setSelectedActivity] = useState(null)
const [schoolInfo, setSchoolInfo] = useState({
  name: 'SD NEGERI 1 JAKARTA',
  address: 'Jl. Pendidikan No. 123, Jakarta Selatan',
  phone: '(021) 12345678',
  email: 'sdn1jkt@smp.belajar.id',
})

const [documentInfo, setDocumentInfo] = useState({
  date: new Date().toISOString().split('T')[0],
  description: '',
  activity: '',
})
```

---

## 3. Template A4 dengan Kop Surat

### 3.1 A4 Document Component

```jsx
// src/components/dokumentasi/A4Document.jsx

import { forwardRef } from 'react'

const A4Document = forwardRef(({ 
  image, 
  activity, 
  schoolInfo, 
  documentInfo 
}, ref) => {
  
  const activityNames = {
    rapat: 'Kegiatan Rapat Guru',
    mamin: 'Serah Terima Makanan Minuman',
    atk: 'Serah Terima Alat Tulis Kantor',
    pemeliharaan: 'Kegiatan Pemeliharaan Sekolah',
  }

  const formatDate = (dateStr) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]
    const date = new Date(dateStr)
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
  }

  return (
    <div 
      ref={ref}
      className="a4-document bg-white"
      style={{
        width: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
        padding: '20mm 25mm',
        fontFamily: '"Times New Roman", Times, serif',
        fontSize: '12pt',
        lineHeight: '1.5',
        color: '#000',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      }}
    >
      {/* === KOP SURAT === */}
      <header 
        className="kop-surat"
        style={{
          borderBottom: '3px double #000',
          paddingBottom: '15px',
          marginBottom: '20px',
          textAlign: 'center',
        }}
      >
        {/* Logo Sekolah (placeholder) */}
        <div style={{
          position: 'absolute',
          left: '25mm',
          top: '20mm',
          width: '60px',
          height: '60px',
          border: '2px solid #333',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10pt',
          color: '#666',
        }}>
          LOGO
        </div>

        {/* Nama Instansi */}
        <div style={{ fontWeight: 'bold', fontSize: '14pt' }}>
          DINAS PENDIDIKAN
        </div>
        <div style={{ fontWeight: 'bold', fontSize: '16pt', margin: '5px 0' }}>
          {schoolInfo.name}
        </div>
        <div style={{ fontSize: '10pt', color: '#333' }}>
          {schoolInfo.address}
        </div>
        <div style={{ fontSize: '9pt', color: '#333', marginTop: '3px' }}>
          Telp: {schoolInfo.phone} | Email: {schoolInfo.email}
        </div>
      </header>

      {/* === KONTEN DOKUMENTASI === */}
      <main>
        {/* Judul */}
        <h2 style={{
          textAlign: 'center',
          fontSize: '14pt',
          fontWeight: 'bold',
          textDecoration: 'underline',
          marginBottom: '20px',
        }}>
          DOKUMENTASI {activityNames[activity]?.toUpperCase() || 'KEGIATAN'}
        </h2>

        {/* Tanggal */}
        <p style={{ marginBottom: '15px' }}>
          <strong>Tanggal:</strong> {formatDate(documentInfo.date)}
        </p>

        {/* Deskripsi */}
        {documentInfo.description && (
          <p style={{ marginBottom: '15px', textAlign: 'justify' }}>
            {documentInfo.description}
          </p>
        )}

        {/* Foto Dokumentasi */}
        <div style={{
          textAlign: 'center',
          margin: '30px 0',
          padding: '10px',
          border: '1px solid #ccc',
        }}>
          <img 
            src={image} 
            alt="Dokumentasi" 
            style={{
              maxWidth: '100%',
              maxHeight: '350px',
              objectFit: 'contain',
              display: 'block',
              margin: '0 auto',
            }}
          />
          <p style={{
            fontSize: '10pt',
            fontStyle: 'italic',
            marginTop: '10px',
            color: '#555',
          }}>
            Foto Dokumentasi {activityNames[activity] || 'Kegiatan'}
          </p>
        </div>

        {/* Keterangan Tambahan */}
        {documentInfo.activity && (
          <p style={{ marginBottom: '15px', textAlign: 'justify' }}>
            <strong>Keterangan:</strong> {documentInfo.activity}
          </p>
        )}
      </main>

      {/* === TANDA TANGAN === */}
      <footer style={{
        marginTop: '50px',
        display: 'flex',
        justifyContent: 'flex-end',
      }}>
        <div style={{ textAlign: 'center', width: '200px' }}>
          <p style={{ marginBottom: '5px' }}>
            {schoolInfo.address.split(',')[1]?.trim() || 'Jakarta'},
            {' '}{formatDate(documentInfo.date)}
          </p>
          <p style={{ marginBottom: '60px', fontWeight: 'bold' }}>
            Kepala Sekolah
          </p>
          {/* Garis tanda tangan */}
          <div style={{
            width: '150px',
            borderTop: '1px solid #000',
            margin: '0 auto',
          }} />
          <p style={{ fontWeight: 'bold', marginTop: '5px' }}>
            Nama Kepala Sekolah
          </p>
          <p style={{ fontSize: '10pt' }}>
            NIP. 196501011990031004
          </p>
        </div>
      </footer>
    </div>
  )
})

A4Document.displayName = 'A4Document'

export default A4Document
```

### 3.3 Print Stylesheet

```css
/* src/styles/print.css */

/* Hide everything except A4 document when printing */
@media print {
  body * {
    visibility: hidden !important;
  }

  .a4-document,
  .a4-document * {
    visibility: visible !important;
  }

  .a4-document {
    position: absolute;
    left: 0;
    top: 0;
    width: 210mm;
    min-height: 297mm;
    margin: 0;
    padding: 20mm 25mm;
    box-shadow: none !important;
    border: none !important;
  }

  /* Reset page settings */
  @page {
    size: A4 portrait;
    margin: 0;
  }

  /* Remove background colors for better printing */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}

/* Screen preview styles */
.a4-document {
  background: white;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  border-radius: 4px;
}
```

---

## 4. Fitur Cetak

### 4.1 PrintPreview Component

```jsx
// src/components/dokumentasi/PrintPreview.jsx

import { useRef, useState } from 'react'
import A4Document from './A4Document'

export default function PrintPreview({ 
  image, 
  activity, 
  schoolInfo,
  onBack,
  onAddNew 
}) {
  const documentRef = useRef(null)
  const [documentInfo, setDocumentInfo] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    activity: '',
  })
  const [isEditing, setIsEditing] = useState(false)

  const handlePrint = () => {
    // Import print CSS
    import('../../styles/print.css')
    
    // Trigger print
    window.print()
  }

  const handleSaveAsPDF = () => {
    // Alternative: Use html2canvas + jsPDF for PDF export
    alert('Fitur save as PDF akan diimplementasikan')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Toolbar (tidak dicetak) */}
      <div className="no-print bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Back button */}
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Kembali
            </button>

            {/* Title */}
            <h1 className="text-lg font-semibold text-gray-900">
              🖨️ Preview Cetak
            </h1>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onAddNew}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 
                           px-4 py-2 rounded-lg hover:bg-gray-200"
              >
                <span className="material-symbols-outlined">add_photo_alternate</span>
                Tambah Foto
              </button>
              
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-primary text-white 
                           px-6 py-2 rounded-lg hover:bg-primary/90 font-medium"
              >
                <span className="material-symbols-outlined">print</span>
                Cetak
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Settings Panel */}
          <div className="no-print space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <span className="material-symbols-outlined">settings</span>
                Pengaturan Dokumen
              </h3>

              {/* Tanggal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Dokumen
                </label>
                <input
                  type="date"
                  value={documentInfo.date}
                  onChange={(e) => setDocumentInfo(prev => ({
                    ...prev,
                    date: e.target.value
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2
                             focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={documentInfo.description}
                  onChange={(e) => setDocumentInfo(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  rows={3}
                  placeholder="Deskripsi kegiatan (opsional)"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2
                             focus:ring-2 focus:ring-primary/20 focus:border-primary
                             resize-none"
                />
              </div>

              {/* Keterangan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keterangan Tambahan
                </label>
                <textarea
                  value={documentInfo.activity}
                  onChange={(e) => setDocumentInfo(prev => ({
                    ...prev,
                    activity: e.target.value
                  }))}
                  rows={2}
                  placeholder="Keterangan tambahan (opsional)"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2
                             focus:ring-2 focus:ring-primary/20 focus:border-primary
                             resize-none"
                />
              </div>

              {/* Edit Info Sekolah */}
              <div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">
                    {isEditing ? 'expand_less' : 'expand_more'}
                  </span>
                  {isEditing ? 'Sembunyikan' : 'Edit Info Sekolah'}
                </button>
                
                {isEditing && (
                  <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Nama Sekolah
                      </label>
                      <input
                        type="text"
                        value={schoolInfo.name}
                        onChange={(e) => setSchoolInfo(prev => ({
                          ...prev,
                          name: e.target.value
                        }))}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Alamat
                      </label>
                      <input
                        type="text"
                        value={schoolInfo.address}
                        onChange={(e) => setSchoolInfo(prev => ({
                          ...prev,
                          address: e.target.value
                        }))}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Telepon
                        </label>
                        <input
                          type="text"
                          value={schoolInfo.phone}
                          onChange={(e) => setSchoolInfo(prev => ({
                            ...prev,
                            phone: e.target.value
                          }))}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={schoolInfo.email}
                          onChange={(e) => setSchoolInfo(prev => ({
                            ...prev,
                            email: e.target.value
                          }))}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 rounded-2xl p-6">
              <h4 className="font-medium text-blue-900 flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined">lightbulb</span>
                Tips Cetak
              </h4>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Gunakan kertas A4 (210 × 297 mm)</li>
                <li>• Set margin: None / 0mm</li>
                <li>• Aktifkan "Background graphics" untuk kop surat</li>
                <li>• Gunakan landscape untuk foto landscape</li>
              </ul>
            </div>
          </div>

          {/* Right: A4 Preview */}
          <div className="lg:col-span-2">
            <div className="bg-gray-200 rounded-2xl p-8 overflow-auto">
              <A4Document 
                ref={documentRef}
                image={image}
                activity={activity}
                schoolInfo={schoolInfo}
                documentInfo={documentInfo}
              />
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
```

---

## 5. Integrasi ke App

### 5.1 Updated DokumentasiAIPage

```jsx
// src/pages/DokumentasiAIPage.jsx (Updated)

import { useState } from 'react'
import FaceUploader from '../components/dokumentasi/FaceUploader'
import ActivitySelector from '../components/dokumentasi/ActivitySelector'
import PromptEditor from '../components/dokumentasi/PromptEditor'
import ResultPreview from '../components/dokumentasi/ResultPreview'
import PrintPreview from '../components/dokumentasi/PrintPreview'
import { generateDocumentationImage } from '../services/imageGenerator'

export default function DokumentasiAIPage() {
  // State
  const [view, setView] = useState('upload') // 'upload' | 'result' | 'preview'
  const [faceImage, setFaceImage] = useState(null)
  const [activity, setActivity] = useState(null)
  const [prompt, setPrompt] = useState('')
  const [generatedImage, setGeneratedImage] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)
  
  const [schoolInfo, setSchoolInfo] = useState({
    name: 'SD NEGERI 1 JAKARTA',
    address: 'Jl. Pendidikan No. 123, Jakarta Selatan',
    phone: '(021) 12345678',
    email: 'sdn1jkt@smp.belajar.id',
  })

  // Generate image
  const handleGenerate = async () => {
    if (!activity) {
      alert('Pilih jenis kegiatan terlebih dahulu!')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const image = await generateDocumentationImage({
        prompt: prompt || undefined,
        activity,
        faceImage,
        provider: 'gemini',
      })
      
      setGeneratedImage(image)
      setView('result')
    } catch (err) {
      console.error('Generate error:', err)
      setError(err.message || 'Gagal generate gambar')
    } finally {
      setIsGenerating(false)
    }
  }

  // Navigate to preview
  const handlePreview = () => {
    setView('preview')
  }

  // Back to upload
  const handleBackToUpload = () => {
    setView('upload')
    setGeneratedImage(null)
    setPrompt('')
  }

  // Add new photo (same as back to upload)
  const handleAddNew = () => {
    handleBackToUpload()
  }

  // Regenerate
  const handleRegenerate = () => {
    setGeneratedImage(null)
    handleGenerate()
  }

  // === RENDER: Upload View ===
  if (view === 'upload') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">auto_awesome</span>
              Generate Foto Dokumentasi
            </h1>
            <p className="text-gray-600 mt-1">
              Buat foto dokumentasi kegiatan sekolah dengan AI
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Input */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                <FaceUploader onImageUpload={setFaceImage} />
                
                <ActivitySelector 
                  selected={activity} 
                  onSelect={setActivity} 
                />
                
                {activity && (
                  <PromptEditor 
                    value={prompt}
                    onChange={setPrompt}
                    activity={activity}
                  />
                )}
                
                <button
                  onClick={handleGenerate}
                  disabled={!activity || isGenerating}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white 
                             py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 
                             transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                             shadow-lg shadow-primary/25"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">auto_awesome</span>
                      Generate Foto
                    </>
                  )}
                </button>
                
                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">
                    ❌ {error}
                  </div>
                )}
              </div>
            </div>
            
            {/* Right: Result (empty state) */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex flex-col items-center justify-center py-16 space-y-4 text-gray-400">
                <span className="material-symbols-outlined text-6xl">image</span>
                <p>Belum ada gambar</p>
                <p className="text-xs">Upload foto wajah dan pilih aktivitas untuk generate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // === RENDER: Result View ===
  if (view === 'result') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-green-500">check_circle</span>
              Hasil Generate
            </h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Image Preview */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <ResultPreview 
                imageUrl={generatedImage}
                isGenerating={isGenerating}
                onDownload={() => console.log('Downloaded')}
                onRegenerate={handleRegenerate}
              />
            </div>
            
            {/* Right: Actions */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                <h3 className="font-semibold text-gray-900">Aksi</h3>
                
                {/* Preview & Cetak Button */}
                <button
                  onClick={handlePreview}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white 
                             py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 
                             shadow-lg shadow-primary/25"
                >
                  <span className="material-symbols-outlined">print</span>
                  Preview & Cetak A4
                </button>
                
                {/* Tambah Foto Button */}
                <button
                  onClick={handleAddNew}
                  className="w-full flex items-center justify-center gap-2 bg-gray-100 
                             text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200"
                >
                  <span className="material-symbols-outlined">add_photo_alternate</span>
                  Tambah Foto Dokumentasi
                </button>
                
                {/* Back Button */}
                <button
                  onClick={handleBackToUpload}
                  className="w-full flex items-center justify-center gap-2 text-gray-500 
                             py-2 hover:text-gray-700"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                  Kembali ke Upload
                </button>
              </div>
              
              {/* Info */}
              <div className="bg-blue-50 rounded-2xl p-6">
                <h4 className="font-medium text-blue-900 mb-2">💡 Tips</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Klik "Preview & Cetak" untuk lihat di kertas A4</li>
                  <li>• Bisa langsung cetak atau save as PDF</li>
                  <li>• Klik "Tambah Foto" untuk buat dokumentasi baru</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // === RENDER: Preview View ===
  if (view === 'preview') {
    return (
      <PrintPreview
        image={generatedImage}
        activity={activity}
        schoolInfo={schoolInfo}
        onBack={() => setView('result')}
        onAddNew={handleAddNew}
      />
    )
  }

  return null
}
```

### 5.2 Import Print CSS

```jsx
// src/App.jsx atau src/main.jsx

import './styles/print.css'
```

---

## 📋 Checklist Implementasi

### Phase 1: Komponen A4 (Hari 1)
- [ ] Buat `A4Document.jsx` dengan kop surat
- [ ] Buat `print.css` untuk print styles
- [ ] Test preview di browser

### Phase 2: Print Preview (Hari 2)
- [ ] Buat `PrintPreview.jsx`
- [ ] Implementasi window.print()
- [ ] Tambah form editing (tanggal, deskripsi)

### Phase 3: Integration (Hari 3)
- [ ] Update `DokumentasiAIPage.jsx` dengan 3 views
- [ ] Tambah navigasi antar views
- [ ] Test end-to-end flow

### Phase 4: Polish (Hari 4)
- [ ] Responsive design
- [ ] Error handling
- [ ] Print testing di berbagai browser

---

## 🎯 Fitur yang Dihasilkan

```
╔═════════════════════════════════════════════════════════════╗
║  ✅ FITUR PRINT PREVIEW                                     ║
╠═════════════════════════════════════════════════════════════╣
║                                                             ║
║  📄 A4 Document (210 × 297mm)                              ║
║     ├── ✅ Kop surat sekolah                               ║
║     ├── ✅ Logo placeholder                                ║
║     ├── ✅ Nama & alamat sekolah                           ║
║     ├── ✅ Tanggal & keterangan                            ║
║     ├── ✅ Foto dokumentasi (max 350px)                    ║
║     └── ✅ Tanda tangan kepala sekolah                     ║
║                                                             ║
║  🖨️ Print Features                                          ║
║     ├── ✅ window.print() integration                      ║
║     ├── ✅ Print-optimized CSS                             ║
║     ├── ✅ Hide toolbar saat cetak                         ║
║     └── ✅ A4 page settings                                ║
║                                                             ║
║  ⚙️ Settings Panel                                          ║
║     ├── ✅ Edit tanggal                                    ║
║     ├── ✅ Edit deskripsi                                  ║
║     ├── ✅ Edit info sekolah                               ║
║     └── ✅ Tips cetak                                      ║
║                                                             ║
║  🔘 Navigation                                              ║
║     ├── ✅ Kembali (ke result)                             ║
║     ├── ✅ Tambah Foto (ke upload)                         ║
║     └── ✅ Cetak (trigger print)                           ║
║                                                             ║
╚═════════════════════════════════════════════════════════════╝
```

---

## 💰 Estimasi Waktu

| Komponen | Waktu |
|:---|---:|
| A4Document.jsx | 2-3 jam |
| PrintPreview.jsx | 2-3 jam |
| print.css | 1 jam |
| Integration | 2-3 jam |
| **Total** | **1-2 hari** |

---

## 🎯 Kesimpulan

> **Implementasi Preview & Cetak:**
> 
> 1. **A4Document** — Template kop surat + foto + tanda tangan
> 2. **PrintPreview** — Settings panel + preview + print button
> 3. **Print CSS** — Optimasi untuk cetak
> 4. **Navigation** — 3 views (upload → result → preview)
>
> **Waktu: 1-2 hari | Biaya: $0** 🎉

---

*Kurs: Rp 16.000/USD (per 26 Juli 2026)*
