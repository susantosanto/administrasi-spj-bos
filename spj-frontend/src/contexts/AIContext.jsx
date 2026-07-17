/**
 * AIContext.jsx — State Management untuk Fitur "Ask to AI"
 * 
 * Menyediakan:
 * - State panel (terbuka/tertutup)
 * - Riwayat chat (tersimpan di localStorage)
 * - Fungsi untuk kirim pesan ke AI
 * - Fungsi untuk reset chat
 * 
 * Cara Pakai:
 *   import { useAI } from '../../contexts/AIContext'
 *   const { isOpen, openPanel, sendMessage, messages } = useAI()
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { askAI } from '../utils/aiHelper'
import storageHelper from '../utils/storageHelper'

const AIContext = createContext(null)

const CHAT_HISTORY_KEY = 'ai_chat_history'
const MAX_HISTORY = 50 // Max 50 pesan

export function AIProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Load riwayat chat dari localStorage saat mount
  useEffect(() => {
    const saved = storageHelper.get(CHAT_HISTORY_KEY, [])
    setMessages(saved)
  }, [])

  // Simpan riwayat chat ke localStorage
  const saveMessages = useCallback((newMessages) => {
    setMessages(newMessages)

    // Simpan max 50 pesan terakhir
    const trimmed = newMessages.slice(-MAX_HISTORY)
    storageHelper.set(CHAT_HISTORY_KEY, trimmed)
  }, [])

  // Buka panel
  const openPanel = useCallback(() => setIsOpen(true), [])

  // Tutup panel
  const closePanel = useCallback(() => setIsOpen(false), [])

  // Toggle panel
  const togglePanel = useCallback(() => setIsOpen((prev) => !prev), [])

  // Kirim pesan ke AI
  const sendMessage = useCallback(
    async (text) => {
      if (!text.trim() || isLoading) return

      // 1. Tambah pesan user
      const userMessage = { role: 'user', content: text.trim(), timestamp: new Date().toISOString() }
      const newMessages = [...messages, userMessage]
      saveMessages(newMessages)

      // 2. Set loading
      setIsLoading(true)

      try {
        // 3. Panggil AI (local intent parse + 1 API call — hemat token)
        const { answer } = await askAI(text)

        // 4. Tambah jawaban AI
        const aiMessage = { role: 'ai', content: answer, timestamp: new Date().toISOString() }
        saveMessages([...newMessages, aiMessage])
      } catch (error) {
        // 5. Error handling
        const errorMessage = {
          role: 'ai',
          content: `❌ ${error.message || 'Terjadi kesalahan. Silakan coba lagi.'}`,
          timestamp: new Date().toISOString(),
          isError: true,
        }
        saveMessages([...newMessages, errorMessage])
      } finally {
        setIsLoading(false)
      }
    },
    [messages, isLoading, saveMessages]
  )

  // Reset chat
  const resetChat = useCallback(() => {
    saveMessages([]) // saveMessages sudah menulis ke localStorage
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
