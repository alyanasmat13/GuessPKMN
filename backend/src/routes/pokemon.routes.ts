import { Router } from 'express';
import { pokemonController } from '../controllers/pokemon.controller';

const router = Router();

// Server-Sent Events (SSE) Route
router.get('/subscribe', pokemonController.subscribe);

// Fetch Next Random Pokemon and Broadcast via SSE
router.post('/next', pokemonController.nextPokemon);

// Fetch Initial Random/Saved Pokemon
router.get('/', pokemonController.getPokemon);

// Fetch Specific Pokemon by ID
router.get('/:id', pokemonController.getPokemonById);

export default router;
