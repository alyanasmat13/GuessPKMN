import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { pokemonController } from '../controllers/pokemon.controller';
import { config } from '../config/env';

const router = Router();

// Limiter for the expensive "draw a new Pokémon" action, which triggers an
// external PokéAPI call and broadcasts to every SSE client. The default
// (120/min/IP) is far above any human play rate but still blocks bot spam.
const nextLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_NEXT_WINDOW_MS,
  max: config.RATE_LIMIT_NEXT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many Pokémon draws, please slow down.' },
});

// Server-Sent Events (SSE) Route
router.get('/subscribe', pokemonController.subscribe);

// Fetch Next Random Pokemon and Broadcast via SSE
router.post('/next', nextLimiter, pokemonController.nextPokemon);

// Fetch Initial Random/Saved Pokemon
router.get('/', pokemonController.getPokemon);

// Fetch Specific Pokemon by ID
router.get('/:id', pokemonController.getPokemonById);

export default router;
