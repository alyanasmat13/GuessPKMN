import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pokemonRoutes from './routes/pokemon.routes';
import { errorHandler } from './middlewares/error.middleware';
import { config } from './config/env';

const app = express();

// Trust the first proxy hop (e.g. Vercel/Netlify/Render/Nginx) so that
// req.ip reflects the real client address for rate limiting and SSE caps.
app.set('trust proxy', 1);

// Security Headers
// Helmet sets sensible defaults; we additionally force HSTS in production
// to prevent protocol downgrade attacks and MIME-type sniffing.
app.use(
  helmet({
    hsts: config.IS_PRODUCTION
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,
  })
);

// CORS: only allow explicitly trusted origins instead of the default "*".
app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser clients (curl, server-to-server) that send no Origin.
      if (!origin) return callback(null, true);
      if (config.ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST'],
  })
);

// Limit JSON body size to mitigate large-payload memory-exhaustion attacks.
app.use(express.json({ limit: '10kb' }));

// Global rate limiter acts as a backstop against floods. Tuned generously
// (default 300/min/IP) so it never engages during normal gameplay.
const globalLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_GLOBAL_WINDOW_MS,
  max: config.RATE_LIMIT_GLOBAL_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

// Routes
app.use('/api/pokemon', pokemonRoutes);

// Global Error Handler Middleware
// Must be registered *after* all routes
app.use(errorHandler);

export default app;
