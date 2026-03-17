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
  // Use server-sent events (SSE) from the backend
  const es = new EventSource('/api/pokemon/subscribe')
  es.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data) as PokemonData
      cb(data)
    } catch (err) {
      console.error('Failed to parse SSE data', err)
    }
  }
  es.onerror = () => {
    // noop; EventSource will attempt reconnects
  }
  // keep local subscriber set for compatibility with notifySubscribers
  subscribers.add(cb)
  return () => {
    es.close()
    subscribers.delete(cb)
  }
}

function notifySubscribers(data: PokemonData) {
  subscribers.forEach((cb) => {
    try {
      cb(data)
    } catch (err) {
      console.error('Subscriber callback error:', err)
    }
  })
}

export function getPokemonId(): number | null {
  return currentPokemonId
}

export function setPokemonId(id: number) {
  currentPokemonId = id
}
export async function fetchPokemon(id?: number): Promise<PokemonData> {
  const url = id ? `/api/pokemon/${id}` : `/api/pokemon`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch pokemon: ${res.status}`)
  }
  const json = await res.json()
  if (json && typeof json.id === 'number') currentPokemonId = json.id
  return json as PokemonData
}

export async function nextPokemon(): Promise<PokemonData> {
  const res = await fetch('/api/pokemon/next', { method: 'POST' })
  if (!res.ok) throw new Error(`Failed to advance pokemon: ${res.status}`)
  const json = await res.json()
  if (json && typeof json.id === 'number') currentPokemonId = json.id
  notifySubscribers(json as PokemonData)
  return json as PokemonData
}