import { useCallback, useEffect, useMemo, useState } from 'react'
import { ThemeContext } from './themeContext'

const STORAGE_KEY = 'theme'

function readInitialTheme() {
  const current = document.documentElement.dataset.theme

  if (current === 'light' || current === 'dark') {
    return current
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)

    if (stored === 'light' || stored === 'dark') {
      return stored
    }
  } catch {
    // localStorage can be unavailable; fall back to the system preference.
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme

    try {
      window.localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Ignore storage failures (private mode).
    }

    const meta = document.querySelector('meta[name="theme-color"]')

    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? '#0a1220' : '#12355b')
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, toggleTheme]
  )

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  )
}
