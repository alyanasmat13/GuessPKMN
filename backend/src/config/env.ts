import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env variables from the backend root folder
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const getConfig = () => {
  const NODE_ENV = process.env.NODE_ENV || 'development';

  // Comma-separated list of origins allowed to call the API.
  // Falls back to the local Vite dev server when nothing is configured.
  const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return {
    NODE_ENV,
    IS_PRODUCTION: NODE_ENV === 'production',
    PORT: parseInt(process.env.PORT || '3001', 10),
    API_BASE_URL: process.env.API_BASE_URL || 'https://pokeapi.co/api/v2/pokemon',
    MAX_POKEMON_ID: parseInt(process.env.MAX_POKEMON_ID || '1025', 10),
    ALLOWED_ORIGINS: allowedOrigins,
    // SSE limits
    MAX_SSE_CONNECTIONS_PER_IP: parseInt(process.env.MAX_SSE_CONNECTIONS_PER_IP || '5', 10),
    MAX_SSE_CONNECTIONS_TOTAL: parseInt(process.env.MAX_SSE_CONNECTIONS_TOTAL || '500', 10),
    // Rate limiting (per IP). Defaults are tuned to be invisible during normal
    // gameplay and only engage under abusive/automated traffic.
    // Global backstop across all endpoints.
    RATE_LIMIT_GLOBAL_WINDOW_MS: parseInt(process.env.RATE_LIMIT_GLOBAL_WINDOW_MS || '60000', 10),
    RATE_LIMIT_GLOBAL_MAX: parseInt(process.env.RATE_LIMIT_GLOBAL_MAX || '300', 10),
    // Stricter cap for the expensive "draw next pokemon" action.
    RATE_LIMIT_NEXT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_NEXT_WINDOW_MS || '60000', 10),
    RATE_LIMIT_NEXT_MAX: parseInt(process.env.RATE_LIMIT_NEXT_MAX || '120', 10),
  };
};

export const config = getConfig();
