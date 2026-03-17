import express from 'express';
import cors from 'cors';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// In-memory state for the current Pokemon
let currentPokemonId: number | null = null;
const subscribers = new Set<express.Response>();

// Predefined max pokemon ID to guess from (e.g. up to generation 9)
const MAX_POKEMON_ID = 1025;

async function fetchPokemonFromAPI(id: number) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  if (!response.ok) {
    throw new Error(`PokéAPI returned status ${response.status}`);
  }
  return await response.json();
}

app.get('/api/pokemon/subscribe', (req, res) => {
  // Set headers for Server-Sent Events
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Add this client to our subscribers list
  subscribers.add(res);

  // Remove client when they disconnect
  req.on('close', () => {
    subscribers.delete(res);
  });
});

function broadcastPokemon(data: any) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  subscribers.forEach((res) => {
    try {
      res.write(message);
    } catch (err) {
      console.error('Error broadcasting to a subscriber', err);
    }
  });
}

app.get('/api/pokemon', async (req, res) => {
  try {
    if (currentPokemonId === null) {
      currentPokemonId = Math.floor(Math.random() * MAX_POKEMON_ID) + 1;
    }
    const data = await fetchPokemonFromAPI(currentPokemonId);
    res.json(data);
  } catch (err) {
    console.error('Error in GET /api/pokemon:', err);
    res.status(500).json({ error: 'Failed to fetch Pokemon data' });
  }
});

app.get('/api/pokemon/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id < 1 || id > MAX_POKEMON_ID) {
       res.status(400).json({ error: 'Invalid Pokemon ID' });
       return;
    }
    const data = await fetchPokemonFromAPI(id);
    res.json(data);
  } catch (err) {
    console.error(`Error in GET /api/pokemon/${req.params.id}:`, err);
    res.status(500).json({ error: 'Failed to fetch Pokemon data' });
  }
});

app.post('/api/pokemon/next', async (req, res) => {
  try {
    currentPokemonId = Math.floor(Math.random() * MAX_POKEMON_ID) + 1;
    const data = await fetchPokemonFromAPI(currentPokemonId);
    
    // Broadcast to SSE clients
    broadcastPokemon({
      id: data.id,
      name: data.name,
      height: data.height,
      weight: data.weight,
      sprites: data.sprites
    });

    res.json(data);
  } catch (err) {
    console.error('Error in POST /api/pokemon/next:', err);
    res.status(500).json({ error: 'Failed to fetch next Pokemon' });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
