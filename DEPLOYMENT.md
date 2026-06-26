# Deployment Guide — Split Deployment (Option B)

The app is deployed as two pieces:

| Piece                | Hosting            | Why                                                              |
| -------------------- | ------------------ | --------------------------------------------------------------- |
| **Frontend** (Vite)  | Vercel             | Static SPA, served from a CDN.                                   |
| **Backend** (Express)| Render / Railway   | Needs a long-lived process for **SSE** + **in-memory state**.   |

> The Express backend uses Server-Sent Events and in-memory state (`currentPokemonId`,
> `history`), which are incompatible with Vercel's stateless serverless functions.
> That is why the backend goes to a stateful host (Render/Railway/Fly.io).

User streaks are stored in **Firestore** and are independent of the backend — make sure
the Firestore security rules are deployed (see `firestore.rules` / `README` step below).

---

## 1. Deploy the Backend (Render)

1. Push this repo to GitHub.
2. On [Render](https://render.com) → **New → Web Service** → connect the repo.
3. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`  (runs `tsx backend/server.ts`)
   - **Instance type:** any (the free tier sleeps; a paid tier keeps SSE alive).
4. Set **Environment Variables** (see `backend/.env.example`):
   ```
   NODE_ENV=production
   PORT=10000                      # Render injects PORT; this is just a fallback
   FRONTEND_URL=https://<your-vercel-domain>.vercel.app
   API_BASE_URL=https://pokeapi.co/api/v2/pokemon
   MAX_POKEMON_ID=1025
   ```
   `FRONTEND_URL` is the CORS allowlist — it **must** match your Vercel URL exactly
   (comma-separate multiple origins, e.g. a custom domain + the `.vercel.app` URL).
5. Deploy. Note the public URL, e.g. `https://guesspkmn-api.onrender.com`.

`tsx` is a runtime dependency (not dev-only) so it is available when Render prunes
dev dependencies under `NODE_ENV=production`.

---

## 2. Deploy the Frontend (Vercel)

1. On [Vercel](https://vercel.com) → **Add New → Project** → import the repo.
2. Framework preset: **Vite** (auto-detected). Build command `npm run build`, output `dist`.
3. Set **Environment Variables** (see `.env.example`):
   ```
   VITE_API_URL=https://guesspkmn-api.onrender.com   # backend URL, NO trailing slash
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   VITE_FIREBASE_MEASUREMENT_ID=...
   ```
4. Deploy.

If you change `VITE_API_URL` you must **redeploy** — Vite env vars are baked into the
build at build time, not read at runtime.

---

## 3. Firebase / Firestore

The frontend writes user streaks directly to Firestore, so access is governed by
`firestore.rules`. Deploy them once (and after any change):

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

Also add your production domains to **Firebase Console → Authentication → Settings →
Authorized domains** (e.g. `your-app.vercel.app`) so Google sign-in works.

---

## 4. Wire-up checklist

- [ ] Backend `FRONTEND_URL` == exact Vercel URL (CORS).
- [ ] Frontend `VITE_API_URL` == exact Render URL (no trailing slash).
- [ ] Firestore rules deployed.
- [ ] Vercel domain added to Firebase Authorized domains.
- [ ] Open the site, sign in, play a few rounds, confirm new Pokémon load and the
      "Best" streak persists after refresh.

---

## Notes on the architecture

- **Rate limits** (`backend/src/config/env.ts`) are tuned to be invisible during normal
  play (global 300/min/IP, `/next` 120/min/IP) and only engage under abusive traffic.
  All limits are overridable via env vars.
- **SSE on Render free tier:** the free instance sleeps after inactivity and may drop
  long-lived SSE connections; the frontend auto-reconnects, but a paid instance gives a
  smoother experience.
- **Local development:** leave `VITE_API_URL` empty so the frontend uses relative `/api`
  paths through the Vite dev proxy (`vite.config.ts` → `http://localhost:3002`). Run both
  with `npm run dev`.
