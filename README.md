# GuessPKMN

A modern, high-performance Pokémon guessing game built with a **Controller-Service-Route** architecture. GuessPKMN challenges players to identify Pokémon from across all 9 generations, featuring real-time synchronization.

## Key Features

- **Anti-Repeat Logic**: A backend history tracker ensures you won't see the same Pokémon twice in a session (tracks the last 50 draws).
- **Real-Time Sync**: Uses **Server-Sent Events (SSE)** to keep game state synchronized across clients.
- **Multi-Generation Support**: Filter your challenge by specific generations (1-9) or test your knowledge across the entire Pokédex.
- **Premium UI/UX**: Built with a custom design system, featuring:
  - Smooth CSS animations and micro-interactions.
  - Non-intrusive React Portal-based toast notifications.
  - Responsive layout for mobile and desktop.
- **Smart Guessing**: Intelligent name matching.
- **Authentication**: Integrated Google Login via Firebase to track your highest streaks.

## Technology Stack

### Frontend

- **React 18** + **TypeScript**
- **Tailwind CSS** + Custom Vanilla CSS Design System
- **Vite** (Build Tool)
- **Firebase Auth** (Google Login)

### Backend

- **Node.js** + **Express**
- **PokeAPI** (Data Source)
