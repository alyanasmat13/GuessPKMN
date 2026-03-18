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

const GuessCard: FC = () => {
  const [data, setData] = useState<PokemonData | null>(null)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong' | 'giveup'; name: string } | null>(null)
  const [showToast, setShowToast] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const feedbackTimer = useRef<number | null>(null)

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

  function showFeedback(type: 'correct' | 'wrong' | 'giveup', name: string) {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current)
    setFeedback({ type, name })
    setShowToast(true)
    feedbackTimer.current = window.setTimeout(() => setShowToast(false), 2200)
  }

  async function handleGuess() {
    if (!data) return
    if (checkName(input, data.name)) {
      showFeedback('correct', data.name)
      updateStreak()
      resetTimer()
      try {
        await nextPokemon()
        setInput('')
        inputRef.current?.focus()
      } catch (err) {
        console.error('Error fetching next pokemon:', err)
      }
    } else {
      showFeedback('wrong', '')
      inputRef.current?.focus()
    }
  }

  async function handleGiveUp() {
    if (!data) return
    showFeedback('giveup', data.name)
    resetStreak()
    resetTimer()
    try {
      await nextPokemon()
      setInput('')
      inputRef.current?.focus()
    } catch (err) {
      console.error('Error fetching next pokemon:', err)
    }
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
