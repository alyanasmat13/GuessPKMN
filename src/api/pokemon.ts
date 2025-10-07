import { getGenerationRange } from "../Header"

export interface PokemonData {
  name: string
  height?: number
  weight?: number
  sprites: {
    front_default?: string | null
    other?: Record<string, { front_default?: string | null } | null> | null
  }
}

let currentPokemonId: number | null = null

type Subscriber = (data: PokemonData) => void
const subscribers = new Set<Subscriber>()

export function subscribe(cb: Subscriber): () => void {
  subscribers.add(cb)
  return () => subscribers.delete(cb)
}

function notifySubscribers(data: PokemonData) {
  subscribers.forEach((cb) => {
    try {
      cb(data)
    } catch {
    }
  })
}

export function getPokemonId(): number | null {
  return currentPokemonId
}

export function setPokemonId(id: number) {
  currentPokemonId = id
}

function ensurePokemonId(): number {
  if (currentPokemonId == null) {
    currentPokemonId = getRandomPokemonId()
  }
  return currentPokemonId
}

function resetPokemonId(): number {
  currentPokemonId = getRandomPokemonId()
  return currentPokemonId
}

export async function fetchPokemon(id?: number): Promise<PokemonData> {
  const pokemonId = id ?? ensurePokemonId()
  currentPokemonId = pokemonId
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`)
  if (!res.ok) {
    throw new Error(`Failed to fetch pokemon ${pokemonId}: ${res.status}`)
  }
  const json = (await res.json()) as PokemonData
  return json
}

export async function nextPokemon(): Promise<PokemonData> {
  const id = resetPokemonId()
  const data = await fetchPokemon(id)
  notifySubscribers(data)
  return data
}

function getRandomPokemonId(): number {
  let min = getGenerationRange().min
  let max = getGenerationRange().max
  if (min < 1) min = 1
  if (max > 1025) max = 1025
  return Math.floor(Math.random() * (max - min + 1)) + min
}