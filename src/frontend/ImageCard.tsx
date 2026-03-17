import { useState, useEffect, type FC } from 'react'
import { fetchPokemon, subscribe, type PokemonData } from '../api/pokemon'

const ImageCard: FC = () => {
  const [data, setData] = useState<PokemonData | null>(null)

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
    <div>
      {data ? (
        spriteUrl ? (
          <img className="h-80 w-auto" src={spriteUrl} alt={data.name} />
        ) : (
          <p>No sprite available</p>
        )
      ) : (
        <p>Loading...</p>
      )}
    </div>
  )
}

export default ImageCard
