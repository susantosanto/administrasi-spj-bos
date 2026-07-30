/**
 * AskAIButton.jsx — FAB untuk "Ask to AI" (Premium Redesign)
 * 
 * Tombol melayang minimalis, glass morphism effect.
 */

import { useAI } from '../../contexts/AIContext'
import AskAIPanel from './AskAIPanel'

export default function AskAIButton() {
  const { isOpen, openPanel, closePanel } = useAI()

  return (
    <>
      {/* FAB — Ultra-premium minimalis */}
      <button
        onClick={openPanel}
        className="fixed bottom-6 right-6 z-50 group
                   animate-fade-in"
        title="Tanya AI"
        aria-label="Tanya AI"
      >
        {/* Outer glow ring */}
        <span className="absolute inset-0 rounded-2xl bg-primary/20 animate-ping [animation-duration:3s]" />
        
        {/* Main button */}
        <div className="relative w-13 h-13 flex items-center justify-center
                        bg-gradient-to-br from-primary to-blue-600 
                        text-white rounded-2xl 
                        shadow-[0_4px_20px_rgba(0,74,198,0.35)]
                        group-hover:shadow-[0_6px_28px_rgba(0,74,198,0.45)]
                        group-hover:scale-105 
                        active:scale-95 
                        transition-all duration-300">
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          
          {/* Status dot */}
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full 
                           border-[2.5px] border-white" />
        </div>

        {/* Tooltip */}
        <span className="absolute right-14 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-800 text-white 
                       rounded-lg text-[11px] font-medium opacity-0 group-hover:opacity-100 
                       transition-opacity whitespace-nowrap pointer-events-none
                       hidden sm:block">
          Tanya AI
        </span>
      </button>

      {/* Panel */}
      {isOpen && <AskAIPanel onClose={closePanel} />}
    </>
  )
}
