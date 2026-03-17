import { config } from '../config/env';
import { Response } from 'express';

// In-memory state for the current Pokemon
let currentPokemonId: number | null = null;
const subscribers = new Set<Response>();

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
  async getCurrentPokemon() {
    if (currentPokemonId === null) {
      currentPokemonId = Math.floor(Math.random() * config.MAX_POKEMON_ID) + 1;
    }
    return await this.fetchPokemonData(currentPokemonId);
  },

  /**
   * Generates a new random Pokemon and sets it as the active session Pokemon.
   */
  async getNextPokemon() {
    currentPokemonId = Math.floor(Math.random() * config.MAX_POKEMON_ID) + 1;
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
