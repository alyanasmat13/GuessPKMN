import { getGenerationRange } from "../frontend/Header"

// Base URL for the backend API. In development this is left empty so requests
// stay relative ("/api/...") and go through Vite's dev proxy. In production
// (split deploy) set VITE_API_URL to the backend's public URL, e.g.
// https://guesspkmn-api.onrender.com — no trailing slash.
const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export interface PokemonData {
  name: string
  height?: number
  weight?: number
  sprites: {
    front_default?: string | null
    other?: Record<string, { front_default?: string | null } | null> | null
  }
}

type Subscriber = (data: PokemonData) => void
const subscribers = new Set<Subscriber>()

let eventSource: EventSource | null = null;

function setupEventSource() {
  if (eventSource) return;
  eventSource = new EventSource(`${API_BASE}/api/pokemon/subscribe`);
  
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as PokemonData;
      notifySubscribers(data);
    } catch (err) {
      console.error('Failed to parse SSE message:', err);
    }
  };
  
  eventSource.onerror = (err) => {
    console.error('SSE connection error:', err);
    eventSource?.close();
    eventSource = null;
    // Attempt to reconnect after 3 seconds
    setTimeout(setupEventSource, 3000);
  };
}

export function subscribe(cb: Subscriber): () => void {
  setupEventSource();
  subscribers.add(cb)
  return () => subscribers.delete(cb)
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

export async function fetchPokemon(): Promise<PokemonData> {
  // Fetch current session Pokémon from the backend
  const res = await fetch(`${API_BASE}/api/pokemon`)
  if (!res.ok) {
    throw new Error(`Failed to fetch pokemon: ${res.status}`)
  }
  return (await res.json()) as PokemonData
}

export async function nextPokemon(): Promise<PokemonData> {
  const { min, max } = getGenerationRange()
  
  const res = await fetch(`${API_BASE}/api/pokemon/next`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ min, max })
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch next pokemon: ${res.status}`);
  }

  // The backend will broadcast the updated Pokemon via SSE, but we return the raw response here.
  return (await res.json()) as PokemonData;
}