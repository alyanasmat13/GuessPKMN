import { Request, Response, NextFunction } from 'express';
import { pokemonService } from '../services/pokemon.service';
import { z } from 'zod';
import { config } from '../config/env';

// Input Validation Schema using Zod
const pokemonIdSchema = z.object({
  id: z.coerce.number().int().min(1).max(config.MAX_POKEMON_ID, {
    message: `Pokemon ID must be between 1 and ${config.MAX_POKEMON_ID}`
  })
});

// Validates the min/max range used to draw the next random Pokémon.
// Rejects NaN, non-integers, out-of-range values, and inverted ranges
// before they reach the service (prevents bogus PokéAPI requests).
const nextPokemonSchema = z
  .object({
    min: z.coerce.number().int().min(1).max(config.MAX_POKEMON_ID),
    max: z.coerce.number().int().min(1).max(config.MAX_POKEMON_ID),
  })
  .refine((data) => data.min <= data.max, {
    message: 'min must be less than or equal to max',
  });

export const pokemonController = {
  subscribe(req: Request, res: Response) {
    pokemonService.addSubscriber(req, res);
  },

  async getPokemon(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await pokemonService.getCurrentPokemon();
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async getPokemonById(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate incoming ID parameter
      const { id } = pokemonIdSchema.parse(req.params);
      
      const data = await pokemonService.fetchPokemonData(id);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async nextPokemon(req: Request, res: Response, next: NextFunction) {
    try {
      const { min, max } = nextPokemonSchema.parse(req.body);
      const data = await pokemonService.getNextPokemon(min, max);
      
      // Broadcast to SSE clients
      pokemonService.broadcastPokemon({
        id: data.id,
        name: data.name,
        height: data.height,
        weight: data.weight,
        sprites: data.sprites
      });

      res.json(data);
    } catch (err) {
      next(err);
    }
  }
};
