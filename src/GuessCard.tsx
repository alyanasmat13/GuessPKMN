import { useState, useEffect, useRef, type FC } from 'react'
import { fetchPokemon, nextPokemon, subscribe, type PokemonData } from './api/pokemon'
import { updateStreak, resetStreak } from './Header'
import { resetTimer } from './Timer'

function checkName(guess: string, actual: string): boolean {
  return guess.trim().toLowerCase() === actual.toLowerCase()
}

const GuessCard: FC = () => {
  const [data, setData] = useState<PokemonData | null>(null)
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)

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

  async function handleGuess() {
    if (!data) return
    if (checkName(input, data.name)) {
      alert('Correct! It is ' + data.name)
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
      alert('Wrong! Try again.')
      inputRef.current?.focus()
    }
  }

  async function handleGiveUp() {
    if (!data) return
    alert('The correct answer was ' + data.name)
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
    <div className="flex flex-col items-center gap-4 text-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
        <h1>Who's That Pokémon?</h1>
        <input
          ref={inputRef}
          className="border border-amber-50 p-2 rounded-lg"
          type="text"
          id="guessInput"
          placeholder="Enter Pokémon name"
          value={input}
          onChange={(e) => setInput(e.target.value)}/>
        <div className="flex flex-row items-center gap-4">
          <button
            type="submit"
            className="bg-gray-700 hover:bg-gray-900 hover:cursor-pointer inset-shadow-lg inset-shadow-black p-3 rounded-lg text-center pt-2.25 transition-colors duration-200">
            Guess!
          </button>
          <button
            type="button"
            onClick={() => void handleGiveUp()}
            className="bg-gray-700 hover:bg-gray-900 hover:cursor-pointer inset-shadow-lg inset-shadow-black p-3 rounded-lg text-center pt-2.25 transition-colors duration-200">
            Give up
          </button>
        </div>
      </form>
    </div>
  )
}

export default GuessCard
