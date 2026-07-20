/**
 * AIContext.jsx — State Management untuk Fitur "Ask to AI" v2
 * 
 * ✅ DUAL-PATH + STREAMING SUPPORT
 * ✅ SEMANTIC CACHE INTEGRATION
 * ✅ STREAMING TOKEN UPDATE
 * 
 * Cara Pakai:
 *   import { useAI } from '../../contexts/AIContext'
 *   const { isOpen, openPanel, sendMessage, messages } = useAI()
 */

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { askAI, askAIStream } from '../utils/aiHelper'
import storageHelper from '../utils/storageHelper'

const AIContext = createContext(null)

const CHAT_HISTORY_KEY = 'ai_chat_history'
const MAX_HISTORY = 50 // Max 50 pesan

export function AIProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false) // ← streaming state
  const abortRef = useRef(null) // ← untuk cancel streaming

  // Load riwayat chat dari localStorage saat mount
  useEffect(() => {
    const saved = storageHelper.get(CHAT_HISTORY_KEY, [])
    setMessages(saved)
  }, [])

  // Simpan riwayat chat ke localStorage
  const saveMessages = useCallback((newMessages) => {
    setMessages(newMessages)
    const trimmed = newMessages.slice(-MAX_HISTORY)
    storageHelper.set(CHAT_HISTORY_KEY, trimmed)
  }, [])

  // Buka panel
  const openPanel = useCallback(() => setIsOpen(true), [])

  // Tutup panel
  const closePanel = useCallback(() => setIsOpen(false), [])

  // Toggle panel
  const togglePanel = useCallback(() => setIsOpen((prev) => !prev), [])

  // ── SEND MESSAGE (streaming) ──
  const sendMessage = useCallback(
    async (text) => {
      if (!text.trim() || isLoading) return

      // 1. Tambah pesan user
      const userMessage = { role: 'user', content: text.trim(), timestamp: new Date().toISOString() }
      const newMessages = [...messages, userMessage]
      saveMessages(newMessages)

      // 2. Tambah placeholder AI message (akan diisi streaming)
      const aiMessage = { 
        role: 'ai', 
        content: '', 
        timestamp: new Date().toISOString(),
        isStreaming: true, // ← flag untuk UI
      }
      const messagesWithPlaceholder = [...newMessages, aiMessage]
      saveMessages(messagesWithPlaceholder)

      // 3. Set loading + streaming
      setIsLoading(true)
      setIsStreaming(true)

      try {          // 4. Buat AbortController untuk cancel
          const controller = new AbortController()
          abortRef.current = controller

          // 4. Coba streaming dulu
          await askAIStream(
            text,
            // onToken: update AI message content real-time
            (token) => {
              setMessages((prev) => {
                const updated = [...prev]
                const lastMsg = { ...updated[updated.length - 1] }
                lastMsg.content += token
                updated[updated.length - 1] = lastMsg
                return updated
              })
            },
            // onDone: streaming selesai
            (fullAnswer) => {
              setMessages((prev) => {
                const updated = [...prev]
                const lastMsg = { ...updated[updated.length - 1] }
                lastMsg.content = fullAnswer || lastMsg.content
                lastMsg.isStreaming = false
                lastMsg.timestamp = new Date().toISOString()
                updated[updated.length - 1] = lastMsg
                const trimmed = updated.slice(-MAX_HISTORY)
                storageHelper.set(CHAT_HISTORY_KEY, trimmed)
                return updated
              })
              setIsStreaming(false)
              setIsLoading(false)
            },
            { signal: controller.signal } // ← pass abort signal
          )
      } catch (error) {
        // 5. Error: fallback ke non-streaming
        if (error.name === 'AbortError') return // User cancelled, no fallback
        console.warn('Streaming gagal, fallback ke non-streaming:', error.message)
        try {
          const { answer } = await askAI(text)
          setMessages((prev) => {
            const updated = [...prev]
            const lastMsg = { ...updated[updated.length - 1] }
            lastMsg.content = answer
            lastMsg.isStreaming = false
            lastMsg.isError = false
            lastMsg.timestamp = new Date().toISOString()
            updated[updated.length - 1] = lastMsg
            const trimmed = updated.slice(-MAX_HISTORY)
            storageHelper.set(CHAT_HISTORY_KEY, trimmed)
            return updated
          })
        } catch (fallbackError) {
          // Error final
          const errorMessage = {
            role: 'ai',
            content: `❌ ${fallbackError.message || 'Terjadi kesalahan. Silakan coba lagi.'}`,
            timestamp: new Date().toISOString(),
            isError: true,
            isStreaming: false,
          }
          saveMessages([...newMessages, errorMessage])
        }
        setIsStreaming(false)
        setIsLoading(false)
      }
    },
    [messages, isLoading, saveMessages]
  )

  // ── CANCEL STREAMING ──
  const cancelStreaming = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    setIsStreaming(false)
    setIsLoading(false)
    
    // Update last message
    setMessages((prev) => {
      const updated = [...prev]
      const lastMsg = { ...updated[updated.length - 1] }
      if (lastMsg.isStreaming) {
        lastMsg.isStreaming = false
        if (!lastMsg.content) {
          lastMsg.content = '⏹️ Dibatalkan.'
        }
        updated[updated.length - 1] = lastMsg
      }
      return updated
    })
  }, [])

  // Reset chat
  const resetChat = useCallback(() => {
    saveMessages([])
  }, [saveMessages])

  // Hapus chat dari localStorage (untuk pengaturan)
  const clearChatHistory = useCallback(() => {
    storageHelper.remove(CHAT_HISTORY_KEY)
  }, [])

  return (
    <AIContext.Provider
      value={{
        isOpen,
        openPanel,
        closePanel,
        togglePanel,
        messages,
        sendMessage,
        resetChat,
        clearChatHistory,
        isLoading,
        isStreaming,
        cancelStreaming,
      }}
    >
      {children}
    </AIContext.Provider>
  )
}

export function useAI() {
  const ctx = useContext(AIContext)
  if (!ctx) {
    throw new Error('useAI must be used within AIProvider')
  }
  return ctx
}

export default AIContext
