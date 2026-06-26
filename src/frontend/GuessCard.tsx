import { useState, useEffect, useRef, type FC } from 'react'
import { createPortal } from 'react-dom'
import { fetchPokemon, nextPokemon, subscribe, type PokemonData } from '../api/pokemon'
import { updateStreak, resetStreak } from './Header'
import { resetTimer } from './Timer'

function checkName(guess: string, actual: string): boolean {
  const g = guess.trim().toLowerCase()
  const a = actual.toLowerCase()
  return g === a || a.startsWith(g + '-')
}

function formatPokemonName(name: string): string {
  return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Fetch the next Pokémon, retrying a few times so a transient hiccup (network
// blip or rate-limit burst) doesn't leave the game stuck on the current one.
async function advanceWithRetry(attempts = 3): Promise<boolean> {
  for (let i = 0; i < attempts; i++) {
    try {
      await nextPokemon()
      return true
    } catch (err) {
      console.error(`Error fetching next pokemon (attempt ${i + 1}):`, err)
      // Small backoff before retrying.
      await new Promise((r) => setTimeout(r, 600 * (i + 1)))
    }
  }
  return false
}

const GuessCard: FC = () => {
  const [data, setData] = useState<PokemonData | null>(null)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong' | 'giveup'; name: string } | null>(null)
  const [showToast, setShowToast] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const feedbackTimer = useRef<number | null>(null)
  // Guards against awarding points more than once for the same Pokémon: once a
  // round is resolved (guessed or given up) it stays locked until a NEW Pokémon
  // arrives, even if advancing to the next one is briefly delayed.
  const resolvedRef = useRef(false)

  useEffect(() => {
    let mounted = true

    fetchPokemon()
      .then((d) => {
        if (mounted) setData(d)
      })
      .catch((err) => console.error('Error fetching data:', err))

    const unsubscribe = subscribe((d) => {
      if (mounted) setData(d)
    })

    inputRef.current?.focus()

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  // A new Pokémon has arrived: unlock the round and clear the input.
  useEffect(() => {
    resolvedRef.current = false
    setInput('')
  }, [data])

  function showFeedback(type: 'correct' | 'wrong' | 'giveup', name: string) {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current)
    setFeedback({ type, name })
    setShowToast(true)
    feedbackTimer.current = window.setTimeout(() => setShowToast(false), 2200)
  }

  async function handleGuess() {
    // Ignore guesses once this round is already resolved (prevents racking up
    // points on the same Pokémon while the next one is loading).
    if (!data || resolvedRef.current) return
    if (checkName(input, data.name)) {
      resolvedRef.current = true
      showFeedback('correct', data.name)
      updateStreak()
      resetTimer()
      await advanceWithRetry()
      inputRef.current?.focus()
    } else {
      showFeedback('wrong', '')
      inputRef.current?.focus()
    }
  }

  async function handleGiveUp() {
    if (!data || resolvedRef.current) return
    resolvedRef.current = true
    showFeedback('giveup', data.name)
    resetStreak()
    resetTimer()
    await advanceWithRetry()
    inputRef.current?.focus()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    void handleGuess()
  }

  return (
    <>
      {/* Toast notification rendered into body via Portal to ignore parent paddings */}
      {createPortal(
        <div className={`feedback-toast ${showToast ? 'show' : ''} ${feedback?.type === 'correct' ? 'correct' : 'wrong'}`}>
          {feedback?.type === 'correct' && `Correct! It's ${formatPokemonName(feedback.name)}!`}
          {feedback?.type === 'wrong' && 'Wrong! Try again.'}
          {feedback?.type === 'giveup' && `The answer was ${formatPokemonName(feedback.name)}`}
        </div>,
        document.body
      )}

      <div className="flex flex-col items-center gap-6 w-full max-w-sm px-4">
        <form onSubmit={handleSubmit} className="flex flex-col items-stretch gap-4 w-full">
          <input
            ref={inputRef}
            className="glow-input w-full text-center placeholder:text-white/20"
            type="text"
            id="guessInput"
            placeholder="Type Pokémon name..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoComplete="off"
          />
          <div className="flex flex-col items-center gap-2">
            <button type="submit" className="btn-primary w-full">
              Guess!
            </button>
            <button
              type="button"
              onClick={() => void handleGiveUp()}
              className="btn-secondary mt-2">
              Give up
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default GuessCard
