import { config } from '../config/env';
import { Request, Response } from 'express';

// In-memory state for the current Pokemon
let currentPokemonId: number | null = null;
const subscribers = new Set<Response>();

// Track how many open SSE connections each IP currently holds so a single
// client cannot open thousands of connections and exhaust server memory.
const connectionsPerIp = new Map<string, number>();

// Periodically ping every subscriber. A failed write means the socket is
// dead (e.g. the client dropped off the network silently); we reap it so the
// Response object can be garbage collected instead of leaking forever.
const HEARTBEAT_INTERVAL_MS = 30_000;

setInterval(() => {
  subscribers.forEach((res) => {
    try {
      // SSE comment line; ignored by EventSource but keeps the socket alive
      // and surfaces broken pipes as a throw we can clean up.
      res.write(': ping\n\n');
    } catch {
      cleanupSubscriber(res);
    }
  });
}, HEARTBEAT_INTERVAL_MS).unref();

function getClientIp(req: Request): string {
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function cleanupSubscriber(res: Response) {
  if (!subscribers.has(res)) return;
  subscribers.delete(res);

  const ip = (res as Response & { locals: { sseIp?: string } }).locals?.sseIp;
  if (ip) {
    const count = (connectionsPerIp.get(ip) || 1) - 1;
    if (count <= 0) connectionsPerIp.delete(ip);
    else connectionsPerIp.set(ip, count);
  }

  try {
    res.end();
  } catch {
    /* already closed */
  }
}

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
   * Adds an Express Response object to the SSE subscribers list, enforcing a
   * global cap and a per-IP cap to protect against connection-flood DoS.
   */
  addSubscriber(req: Request, res: Response) {
    // Reject if the global subscriber cap is reached.
    if (subscribers.size >= config.MAX_SSE_CONNECTIONS_TOTAL) {
      res.status(503).json({ error: 'Server is at capacity, try again later.' });
      return;
    }

    const ip = getClientIp(req);
    const existing = connectionsPerIp.get(ip) || 0;
    if (existing >= config.MAX_SSE_CONNECTIONS_PER_IP) {
      res.status(429).json({ error: 'Too many open connections.' });
      return;
    }

    // Set headers for Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Stash the IP on the response so cleanup can decrement the right counter.
    res.locals.sseIp = ip;
    connectionsPerIp.set(ip, existing + 1);
    subscribers.add(res);

    // Remove client when they disconnect or error out.
    res.on('close', () => cleanupSubscriber(res));
    res.on('error', () => cleanupSubscriber(res));
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
        cleanupSubscriber(res);
      }
    });
  }
};
