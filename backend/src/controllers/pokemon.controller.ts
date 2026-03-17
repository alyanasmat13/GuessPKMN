import { Request, Response, NextFunction } from 'express';
import { pokemonService } from '../services/pokemon.service';
import { z } from 'zod';
import { config } from '../config/env';

// Input Validation Schema using Zod
const pokemonIdSchema = z.object({
  id: z.coerce.number().min(1).max(config.MAX_POKEMON_ID, {
    message: `Pokemon ID must be between 1 and ${config.MAX_POKEMON_ID}`
  })
});

export const pokemonController = {
  subscribe(req: Request, res: Response) {
    pokemonService.addSubscriber(res);
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
      const { min, max } = req.body;
      const data = await pokemonService.getNextPokemon(Number(min), Number(max));
      
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
