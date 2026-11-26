import { useEffect, useState } from 'react'

/**
 * A ticking clock for session states (join window, status badges).
 * One shared interval per component instead of calling `Date.now()` during
 * render, which is impure and does not update over time.
 */
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(new Date())
    }, intervalMs)

    return () => clearInterval(intervalId)
  }, [intervalMs])

  return now
}
