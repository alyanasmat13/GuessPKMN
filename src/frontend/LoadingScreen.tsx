import { useState, useEffect, useRef, useCallback } from 'react'

const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

interface LoadingScreenProps {
  onReady: () => void
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onReady }) => {
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('Waking up the server...')
  const [dismissing, setDismissing] = useState(false)

  const startTime = useRef(Date.now())
  const serverReadyRef = useRef(false)
  const serverReadyAtRef = useRef<number | null>(null)
  const progressAtReadyRef = useRef(0)
  const hasCalledReady = useRef(false)
  const rafRef = useRef<number>(0)

  const dismiss = useCallback(() => {
    if (hasCalledReady.current) return
    hasCalledReady.current = true
    setDismissing(true)
    setTimeout(() => onReady(), 600)
  }, [onReady])

  // Ping the backend to warm it up
  useEffect(() => {
    let cancelled = false

    async function pingBackend() {
      const maxAttempts = 30
      for (let i = 0; i < maxAttempts; i++) {
        if (cancelled) return
        try {
          const res = await fetch(`${API_BASE}/api/pokemon`, { signal: AbortSignal.timeout(5000) })
          if (res.ok && !cancelled) {
            serverReadyRef.current = true
            serverReadyAtRef.current = Date.now()
            setStatusText('Server is ready!')
            return
          }
        } catch {
          // Server still waking up
        }
        await new Promise(r => setTimeout(r, 2000))
      }
    }

    pingBackend()
    return () => { cancelled = true }
  }, [])

  // Single smooth animation loop
  useEffect(() => {
    const DURATION = 60_000

    function tick() {
      const now = Date.now()
      let pct: number

      if (serverReadyRef.current && serverReadyAtRef.current) {
        // Smoothly lerp from where we were when server became ready → 100%
        // over ~1.2 seconds
        const readyElapsed = now - serverReadyAtRef.current
        const lerpDuration = 1200
        const t = Math.min(readyElapsed / lerpDuration, 1)
        // Ease-out cubic for a smooth deceleration
        const eased = 1 - Math.pow(1 - t, 3)
        pct = progressAtReadyRef.current + (100 - progressAtReadyRef.current) * eased
      } else {
        // Normal: fill linearly over 60 seconds
        const elapsed = now - startTime.current
        pct = Math.min((elapsed / DURATION) * 100, 100)
      }

      pct = Math.min(pct, 100)
      setProgress(pct)

      // Update status text based on progress (only before server is ready)
      if (!serverReadyRef.current) {
        if (pct < 20) setStatusText('Waking up the server...')
        else if (pct < 45) setStatusText('Server is spinning up...')
        else if (pct < 70) setStatusText('Almost there...')
        else if (pct < 90) setStatusText('Just a moment longer...')
        else setStatusText('Any second now...')
      }

      if (pct >= 100) {
        dismiss()
        return
      }

      // Capture the progress at the moment server becomes ready
      if (serverReadyRef.current && serverReadyAtRef.current && progressAtReadyRef.current === 0) {
        progressAtReadyRef.current = pct
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [dismiss])

  return (
    <div className={`loading-overlay ${dismissing ? 'loading-dismiss' : ''}`}>
      <div className="loading-content">
        {/* Spinning Pokéball */}
        <div className="pokeball-spinner">
          <div className="pokeball-top" />
          <div className="pokeball-center-line" />
          <div className="pokeball-button-outer">
            <div className="pokeball-button-inner" />
          </div>
          <div className="pokeball-bottom" />
        </div>

        <h2 className="loading-title">Who's That Pokémon?</h2>
        <p className="loading-status">{statusText}</p>

        {/* Progress bar */}
        <div className="loading-progress-track">
          <div
            className="loading-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="loading-percent">{Math.round(progress)}%</p>
      </div>
    </div>
  )
}

export default LoadingScreen

