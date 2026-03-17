import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env variables from the backend root folder
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const getConfig = () => {
  return {
    PORT: parseInt(process.env.PORT || '3001', 10),
    API_BASE_URL: process.env.API_BASE_URL || 'https://pokeapi.co/api/v2/pokemon',
    MAX_POKEMON_ID: parseInt(process.env.MAX_POKEMON_ID || '1025', 10),
  };
};

export const config = getConfig();
