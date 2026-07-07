const PREFIX = 'spj_'

export const storageHelper = {
  get(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      return raw ? JSON.parse(raw) : defaultValue
    } catch {
      return defaultValue
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
      return true
    } catch (e) {
      console.error('Storage set error:', e)
      return false
    }
  },

  remove(key) {
    localStorage.removeItem(PREFIX + key)
  },

  clear() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(PREFIX))
    keys.forEach(k => localStorage.removeItem(k))
  },

  getAll() {
    const data = {}
    Object.keys(localStorage)
      .filter(k => k.startsWith(PREFIX))
      .forEach(k => {
        try {
          data[k.replace(PREFIX, '')] = JSON.parse(localStorage.getItem(k))
        } catch {
          data[k.replace(PREFIX, '')] = localStorage.getItem(k)
        }
      })
    return data
  },
}

export default storageHelper
