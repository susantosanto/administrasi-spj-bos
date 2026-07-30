/**
 * AskAIButton.jsx — FAB untuk "Ask to AI" (Premium Hover Animation)
 */

import { useAI } from '../../contexts/AIContext'
import AskAIPanel from './AskAIPanel'

export default function AskAIButton() {
  const { isOpen, openPanel, closePanel } = useAI()

  return (
    <>
      {/* FAB — Premium hover animation */}
      <button
        onClick={openPanel}
        className="fixed bottom-6 right-6 z-50 
                   w-14 h-14 rounded-full 
                   bg-gradient-to-br from-primary to-blue-600 
                   text-white
                   shadow-lg shadow-primary/25
                   hover:shadow-[0_8px_32px_rgba(0,74,198,0.4)]
                   hover:scale-110 hover:rotate-[15deg]
                   active:scale-95 active:rotate-0
                   transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                   flex items-center justify-center
                   group overflow-hidden animate-fade-in"
        title="Tanya AI"
        aria-label="Tanya AI"
      >
        {/* Shimmer effect on hover */}
        <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500
                        bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.15)_50%,transparent_75%)]
                        bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
        
        <span className="relative material-symbols-outlined text-[24px] transition-transform duration-300 group-hover:scale-110" 
              style={{ fontVariationSettings: "'FILL' 1" }}>
          auto_awesome
        </span>

        {/* Tooltip */}
        <span className="absolute right-14 top-1/2 -translate-y-1/2 
                       px-3 py-1.5 bg-slate-800 text-white rounded-lg 
                       text-[11px] font-medium 
                       opacity-0 group-hover:opacity-100 
                       translate-x-2 group-hover:translate-x-0
                       transition-all duration-200
                       whitespace-nowrap pointer-events-none
                       hidden sm:block">
          Tanya AI
        </span>
      </button>

      {/* Panel */}
      {isOpen && <AskAIPanel onClose={closePanel} />}
    </>
  )
}
