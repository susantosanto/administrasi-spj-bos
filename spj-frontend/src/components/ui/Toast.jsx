import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext()

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
    warning: (msg) => addToast(msg, 'warning'),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-margin-page right-margin-page z-[100] flex flex-col gap-sm">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`animate-toast-in bg-on-background text-on-primary-container px-lg py-md rounded-xl shadow-2xl flex items-center gap-md min-w-[300px] max-w-[400px] ${
              t.type === 'success' ? '' :
              t.type === 'error' ? '' :
              t.type === 'warning' ? '' : ''
            }`}
          >
            <span className={`material-symbols-outlined ${
              t.type === 'success' ? 'text-secondary' :
              t.type === 'error' ? 'text-danger' :
              t.type === 'warning' ? 'text-warning' : 'text-primary'
            }`}>
              {t.type === 'success' ? 'check_circle' :
               t.type === 'error' ? 'error' :
               t.type === 'warning' ? 'warning' : 'info'}
            </span>
            <div className="flex flex-col">
              <p className="font-bold text-label-md">
                {t.type === 'success' ? 'Berhasil' :
                 t.type === 'error' ? 'Gagal' :
                 t.type === 'warning' ? 'Peringatan' : 'Info'}
              </p>
              <p className="text-xs opacity-70">{t.message}</p>
            </div>
            <button
              className="ml-auto hover:bg-white/10 p-1 rounded-full transition-colors"
              onClick={() => setToasts(prev => prev.filter(toast => toast.id !== t.id))}
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
