/**
 * AskAIButton.jsx — FAB untuk "Ask to AI" (Clean Minimalis)
 */

import { useAI } from '../../contexts/AIContext'
import AskAIPanel from './AskAIPanel'

export default function AskAIButton() {
  const { isOpen, openPanel, closePanel } = useAI()

  return (
    <>
      {/* FAB — Clean & Simple */}
      <button
        onClick={openPanel}
        className="fixed bottom-6 right-6 z-50 
                   w-14 h-14 rounded-full 
                   bg-gradient-to-br from-primary to-blue-600 
                   text-white
                   shadow-lg shadow-primary/25
                   hover:shadow-xl hover:shadow-primary/30 hover:scale-105
                   active:scale-95
                   transition-all duration-200 ease-out
                   flex items-center justify-center
                   group animate-fade-in"
        title="Tanya AI"
        aria-label="Tanya AI"
      >
        <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          auto_awesome
        </span>

        {/* Tooltip */}
        <span className="absolute right-14 top-1/2 -translate-y-1/2 
                       px-3 py-1.5 bg-slate-800 text-white rounded-lg 
                       text-[11px] font-medium 
                       opacity-0 group-hover:opacity-100 
                       transition-opacity duration-200
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
