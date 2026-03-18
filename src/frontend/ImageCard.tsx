import { useState, useEffect, type FC } from 'react'
import { fetchPokemon, subscribe, type PokemonData } from '../api/pokemon'

const ImageCard: FC = () => {
  const [data, setData] = useState<PokemonData | null>(null)
  const [imageKey, setImageKey] = useState(0)

  useEffect(() => {
    let mounted = true

    fetchPokemon()
      .then((d) => {
        if (mounted) { setData(d); setImageKey(k => k + 1) }
      })
      .catch((err) => console.error('Error fetching data:', err))

    const unsubscribe = subscribe((d) => {
      if (mounted) { setData(d); setImageKey(k => k + 1) }
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  const spriteUrl =
    data?.sprites?.other?.['official-artwork']?.front_default ??
    data?.sprites?.front_default ??
    null

  return (
    <div className="pokemon-image-wrapper animate-float">
      {data ? (
        spriteUrl ? (
          <img
            key={imageKey}
            className="h-64 w-auto animate-pop-in"
            src={spriteUrl}
            alt={data.name}
          />
        ) : (
          <div className="flex items-center justify-center w-64 h-64">
            <span className="text-white/20 text-sm tracking-widest uppercase">No sprite</span>
          </div>
        )
      ) : (
        <div className="w-64 h-64" />
      )}
    </div>
  )
}

export default ImageCard
