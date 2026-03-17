import { config } from '../config/env';
import { Response } from 'express';

// In-memory state for the current Pokemon
let currentPokemonId: number | null = null;
const subscribers = new Set<Response>();

// Track the last 50 randomly drawn Pokemon to prevent immediate repeats
const history: number[] = [];

function getRandomId(min: number, max: number): number {
  if (min < 1) min = 1;
  if (max > config.MAX_POKEMON_ID) max = config.MAX_POKEMON_ID;
  
  // If the range is extremely small (e.g. 1 Pokemon), don't infinite loop
  if (max - min <= 1) return min;

  let id = Math.floor(Math.random() * (max - min + 1)) + min;
  
  // Anti-repeat logic
  let attempts = 0;
  while (history.includes(id) && attempts < 50) {
    id = Math.floor(Math.random() * (max - min + 1)) + min;
    attempts++;
  }
  
  // Save to history and cap length at 50
  history.push(id);
  if (history.length > 50) {
    history.shift();
  }
  
  return id;
}

export const pokemonService = {
  /**
   * Fetches JSON data for a specific Pokemon ID from the external PokeAPI.
   */
  async fetchPokemonData(id: number) {
    const response = await fetch(`${config.API_BASE_URL}/${id}`);
    if (!response.ok) {
      throw new Error(`PokéAPI returned status ${response.status}`);
    }
    return await response.json();
  },

  /**
   * Gets the currently active Pokemon, or generates a new random one if none exists.
   */
  async getCurrentPokemon(min: number = 1, max: number = config.MAX_POKEMON_ID) {
    if (currentPokemonId === null) {
      currentPokemonId = getRandomId(min, max);
    }
    return await this.fetchPokemonData(currentPokemonId);
  },

  /**
   * Generates a new random Pokemon and sets it as the active session Pokemon.
   */
  async getNextPokemon(min: number = 1, max: number = config.MAX_POKEMON_ID) {
    currentPokemonId = getRandomId(min, max);
    return await this.fetchPokemonData(currentPokemonId);
  },

  /**
   * Adds an Express Response object to the SSE subscribers list.
   */
  addSubscriber(res: Response) {
    // Set headers for Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    subscribers.add(res);

    // Remove client when they disconnect
    res.on('close', () => {
      subscribers.delete(res);
    });
  },

  /**
   * Broadcasts Pokemon data to all subscribed SSE clients.
   */
  broadcastPokemon(data: any) {
    const message = `data: ${JSON.stringify(data)}\n\n`;
    subscribers.forEach((res) => {
      try {
        res.write(message);
      } catch (err) {
        console.error('Error broadcasting to a subscriber', err);
      }
    });
  }
};
