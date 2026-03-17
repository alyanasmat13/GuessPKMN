import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pokemonRoutes from './routes/pokemon.routes';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/pokemon', pokemonRoutes);

// Global Error Handler Middleware
// Must be registered *after* all routes
app.use(errorHandler);

export default app;
