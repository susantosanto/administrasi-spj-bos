/**
 * AskAIButton.jsx — Floating Action Button untuk "Ask to AI"
 * 
 * Tombol melayang di pojok kanan bawah yang membuka panel chat.
 * 
 * Cara Pakai:
 *   // Di App.jsx atau DashboardLayout.jsx
 *   import { AIProvider } from '../../contexts/AIContext'
 *   import AskAIButton from '../../components/ai/AskAIButton'
 *   import AskAIPanel from '../../components/ai/AskAIPanel'
 * 
 *   function Layout() {
 *     return (
 *       <AIProvider>
 *         {children}
 *         <AskAIButton />
 *       </AIProvider>
 *     )
 *   }
 */

import { useAI } from '../../contexts/AIContext'
import AskAIPanel from './AskAIPanel'

export default function AskAIButton() {
  const { isOpen, openPanel, closePanel } = useAI()

  return (
    <>
      {/* FAB — Tanya AI */}
      <button
        onClick={openPanel}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 
                   bg-gradient-to-r from-primary to-blue-600 
                   text-white rounded-2xl shadow-2xl shadow-primary/30
                   hover:scale-105 active:scale-95 
                   transition-all duration-300 group
                   animate-fade-in"
        title="Tanya AI — Asisten cerdas untuk membantu Anda"
        aria-label="Tanya AI"
      >
        {/* Ikon Sparkles */}
        <span className="material-symbols-outlined text-2xl">auto_awesome</span>

        {/* Tooltip */}
        <span className="absolute right-16 px-3 py-1.5 bg-slate-900 text-white 
                       rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 
                       transition-opacity whitespace-nowrap pointer-events-none shadow-lg
                       hidden sm:block">
          Tanya AI
        </span>

        {/* Pulse indicator */}
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full 
                       border-2 border-white animate-pulse" />
      </button>

      {/* Panel Chat (ketika terbuka) */}
      {isOpen && <AskAIPanel onClose={closePanel} />}
    </>
  )
}
