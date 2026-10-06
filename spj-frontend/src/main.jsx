import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { initPaperSize } from './utils/paperSize'

// Terapkan @page (A4/F4 pilihan user, spj_kertas) sebelum cetak pertama.
initPaperSize()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
