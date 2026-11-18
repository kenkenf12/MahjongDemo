# Project Structure

## Repository Layout

```
major-demo/
├── README.md                          # User-facing documentation
├── REQUIREMENTS.md                    # Functional and non-functional requirements
├── DESIGN.md                          # Architecture and design decisions
├── TASKS.md                           # Implementation task breakdown by stage
├── SPEC_REVIEW.md                     # Spec review checklist and open questions
├── PROJECT_STRUCTURE.md               # This file
│
├── frontend/                          # GitHub Pages static hosting
│   ├── package.json                   # npm dependencies and build scripts
│   ├── tsconfig.json                  # TypeScript configuration
│   ├── webpack.config.js              # or vite.config.ts (bundler config)
│   ├── index.html                     # Main HTML entry point
│   │
│   ├── src/
│   │   ├── main.ts                    # Application entry point
│   │   ├── types.ts                   # Shared TypeScript interfaces and types
│   │   │
│   │   ├── api/
│   │   │   └── websocket.ts           # WebSocket client, connection, message handlers
│   │   │
│   │   ├── models/
│   │   │   ├── Tile.ts                # Tile class, tile constants, tile utilities
│   │   │   ├── Hand.ts                # Player hand management
│   │   │   ├── GameState.ts           # Local game state mirror (sync'd from server)
│   │   │   └── LocalRoomState.ts      # Room state (players, seats, connection status)
│   │   │
│   │   ├── ui/
│   │   │   ├── GameView.ts            # Main game view component (orchestrator)
│   │   │   ├── Lobby.ts               # Room lobby / player seats UI
│   │   │   ├── PlayerHand.ts          # Render player's concealed tiles
│   │   │   ├── Board.ts               # Render opponents, wall, discard area, melds
│   │   │   ├── ActionButtons.ts       # Draw, Discard, Chow, Pong, Kong, Win, Pass buttons
│   │   │   ├── DiscardSelector.ts     # Modal to select which tile to discard
│   │   │   ├── ResultScreen.ts        # Win/draw result and settlement display
│   │   │   └── Notifications.ts       # Toast/alert notifications
│   │   │
│   │   ├── rules/
│   │   │   └── WinningHands.ts        # Client-side validation for UX feedback only
│   │   │
│   │   └── utils/
│   │       ├── constants.ts           # Tile counts, suits, ranks, positions
│   │       ├── helpers.ts             # Utility functions (UUID, random, etc.)
│   │       └── logger.ts              # Client-side logging
│   │
│   ├── styles/
│   │   ├── main.css                   # Layout, responsive design, common styles
│   │   ├── tiles.css                  # Tile styling, hover, selection effects
│   │   ├── buttons.css                # Button styles
│   │   ├── mobile.css                 # Mobile-specific overrides
│   │   └── responsive.css             # Media queries for different screen sizes
│   │
│   └── assets/
│       └── tiles/                     # Tile SVG or PNG graphics
│           ├── char_1.svg             # Character tiles
│           ├── bamboo_1.svg           # Bamboo tiles
│           ├── circle_1.svg           # Circle tiles
│           ├── wind_east.svg          # Wind tiles
│           ├── dragon_red.svg         # Dragon tiles
│           └── flower_plum.svg        # Flower/season tiles
│
├── backend/                           # Cloudflare Workers + Durable Objects
│   ├── package.json                   # npm dependencies for backend
│   ├── tsconfig.json                  # TypeScript configuration
│   ├── wrangler.toml                  # Cloudflare Workers configuration
│   │
│   ├── src/
│   │   ├── index.ts                   # Worker entry point, WebSocket upgrade handler
│   │   ├── types.ts                   # Shared TypeScript interfaces
│   │   │
│   │   ├── worker/
│   │   │   └── handler.ts             # WebSocket routing to Durable Objects
│   │   │
│   │   ├── durable_objects/
│   │   │   └── GameRoom.ts            # Main Durable Object (state + game logic)
│   │   │
│   │   ├── models/
│   │   │   ├── Tile.ts                # Tile class and tile factory
│   │   │   ├── Player.ts              # Player state object
│   │   │   ├── GameState.ts           # Complete game state interface
│   │   │   └── Meld.ts                # Meld (Chow, Pong, Kong) interface
│   │   │
│   │   ├── game/
│   │   │   ├── Wall.ts                # Wall initialization, shuffle, drawing
│   │   │   ├── Hand.ts                # Hand validation helpers
│   │   │   ├── TurnManager.ts         # Turn sequencing and state transitions
│   │   │   ├── ActionValidator.ts     # Validates draw, discard, claim, win actions
│   │   │   ├── WinningPatterns.ts     # Recognition of winning hand patterns
│   │   │   ├── FanCalculator.ts       # Fan calculation for winning hands
│   │   │   ├── Settlement.ts          # Settlement and payout calculation
│   │   │   ├── ReconnectionManager.ts # Disconnection timeout and reconnection
│   │   │   └── ActionDeduplication.ts # Prevents duplicate actions on reconnect
│   │   │
│   │   ├── config/
│   │   │   ├── RulesConfig.ts         # Configurable rule set (fan values, payouts, etc.)
│   │   │   └── rules.config.json      # Rule configuration (can be versioned)
│   │   │
│   │   ├── validation/
│   │   │   └── Validator.ts           # Input and message validation
│   │   │
│   │   ├── logging/
│   │   │   └── Logger.ts              # Server-side logging (to Cloudflare KV or stdout)
│   │   │
│   │   └── utils/
│   │       ├── constants.ts           # Tile constants, game constants
│   │       ├── helpers.ts             # Utility functions
│   │       └── random.ts              # Seeded random for shuffling (if needed)
│   │
│   └── tests/
│       ├── unit/
│       │   ├── Tile.test.ts           # Tile model tests
│       │   ├── Hand.test.ts           # Hand validation tests
│       │   ├── WinningPatterns.test.ts # Winning hand recognition tests
│       │   ├── FanCalculator.test.ts  # Fan calculation tests
│       │   ├── Settlement.test.ts     # Payout calculation tests
│       │   └── TurnManager.test.ts    # Turn logic tests
│       │
│       └── e2e/
│           ├── GameFlow.test.ts       # Full game play-through test
│           ├── Multiplayer.test.ts    # Four players, turn passing, claim resolution
│           ├── Reconnection.test.ts   # Disconnection and reconnection scenarios
│           └── Settlement.test.ts     # Win detection and settlement calculation
│
├── .github/
│   └── workflows/
│       ├── deploy-frontend.yml        # GitHub Actions: Build and deploy frontend to Pages
│       └── tests.yml                  # GitHub Actions: Run backend tests on push
│
├── .gitignore                         # Ignore node_modules, dist, .env, etc.
├── package.json                       # Monorepo root (optional, for shared dependencies)
└── DEPLOYMENT.md                      # Instructions for deploying to Cloudflare + GitHub Pages
```

---

## Directory Descriptions

### `/frontend`
The client-side application. Builds to static HTML/CSS/JavaScript for GitHub Pages.

**Key files**:
- `src/main.ts`: Initializes the UI, establishes WebSocket connection, sets up event handlers.
- `src/api/websocket.ts`: Manages WebSocket connection and message serialization/deserialization.
- `src/models/GameState.ts`: Local mirror of server state; updated by WebSocket messages.
- `src/ui/GameView.ts`: Main view component; orchestrates rendering of all sub-components.
- `styles/main.css`: Responsive layout using CSS Grid and Flexbox.

**Build output**: `/frontend/dist/` (committed to GitHub or via CI/CD).

---

### `/backend`
The server-side application. Deployed to Cloudflare Workers and Durable Objects.

**Key files**:
- `src/index.ts`: Worker entry point; handles WebSocket upgrade and routing.
- `src/durable_objects/GameRoom.ts`: Core game logic; maintains state and broadcasts to clients.
- `src/game/WinningPatterns.ts`: Recognizes valid winning hand structures.
- `src/game/FanCalculator.ts`: Calculates fan for a winning hand.
- `src/game/Settlement.ts`: Calculates payouts after a win.

**Deployment**: Via `wrangler publish` command.

---

### `/tests`
Backend tests (primarily). Frontend tested via browser.

**Test types**:
- **Unit tests**: Tile model, hand validation, fan calculation, turn logic.
- **E2E tests**: Full game scenarios with mocked or local Durable Objects.

---

### `/.github/workflows`
Continuous integration and deployment.

**Workflows**:
- `deploy-frontend.yml`: On push to `main`, build frontend and deploy to GitHub Pages.
- `tests.yml`: On push to any branch, run backend tests.

---

## Key Data Flows

### 1. Tile Model

**Backend** (`backend/src/models/Tile.ts`):
```typescript
interface Tile {
  id: string;           // Unique per tile in game (e.g., "char_1_a")
  suit: "char" | "bamboo" | "circle" | "wind" | "dragon" | "flower";
  rank: number;         // 1-9 for suits; 1-4 for winds; 1-3 for dragons; 1-8 for flowers/seasons
  exposed?: boolean;    // Visible in a meld (public)
}
```

**Frontend** (`frontend/src/models/Tile.ts`): Same interface.

### 2. Game State

**Backend** (`backend/src/models/GameState.ts`): Authoritative state (not exposed directly to clients).

**Frontend** (`frontend/src/models/GameState.ts`): Local mirror, updated via WebSocket messages.

**Sync mechanism**: Server broadcasts state snapshots or diffs; client updates its mirror.

### 3. WebSocket Messages

**Client → Server**: Commands (draw, discard, claim, win, reconnect).

**Server → Client**: Events (draw_result, player_discarded, claim_opportunity, win, etc.).

See `DESIGN.md` Section 2.4 for complete message protocol.

---

## Development Workflow

### Phase 1: Rules Engine (No networking)

1. Work in `backend/src/game/` directory.
2. Implement tile model, hand validation, fan calculation.
3. Write unit tests in `backend/tests/unit/`.
4. No WebSocket or frontend needed yet.

### Phase 2: Frontend UI (Offline)

1. Work in `frontend/src/` directory.
2. Build UI components with hardcoded or locally-managed state.
3. Test UI on mobile browser (Firefox DevTools mobile mode).
4. No WebSocket connection yet.

### Phase 3: WebSocket Multiplayer

1. Implement `backend/src/durable_objects/GameRoom.ts`.
2. Implement `frontend/src/api/websocket.ts`.
3. Test with four browser instances connecting to live Durable Object.

---

## Configuration Files

### `frontend/package.json`
```json
{
  "name": "mahjong-frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "webpack serve --mode development",
    "build": "webpack --mode production",
    "test": "jest"
  },
  "dependencies": {
    "typescript": "^5.0.0"
  },
  "devDependencies": {
    "webpack": "^5.0.0",
    "webpack-cli": "^5.0.0",
    "@types/node": "^20.0.0"
  }
}
```

### `backend/wrangler.toml`
```toml
name = "mahjong-game"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[durable_objects.bindings]]
name = "GAME_ROOM"
class_name = "GameRoom"

[env.production]
vars = { ENVIRONMENT = "production" }

[env.development]
vars = { ENVIRONMENT = "development" }
```

### `backend/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Deployment Overview

### Frontend Deployment (GitHub Pages)

1. Code is in `frontend/` directory.
2. Run `npm run build` in `frontend/` to produce `frontend/dist/`.
3. Push `frontend/dist/` to GitHub Pages branch (or set up GitHub Actions to do this automatically).
4. Site is live at `https://yourusername.github.io/major-demo/`.

### Backend Deployment (Cloudflare Workers)

1. Code is in `backend/` directory.
2. Install Wrangler: `npm install -g wrangler`.
3. Configure `wrangler.toml` with your Cloudflare account ID and API token.
4. Run `wrangler publish` to deploy.
5. WebSocket endpoint is live at `wss://<worker-name>.<account>.workers.dev/ws`.

See `DEPLOYMENT.md` for detailed instructions.

---

## Testing Strategy

### Unit Tests (Backend)

- **Tile model**: Creation, comparison, sorting.
- **Hand validation**: Recognizing melds, valid winning hands, special patterns.
- **Fan calculation**: Scoring various hand patterns, bonuses.
- **Settlement**: Payout calculations, dealer multipliers.
- **Turn manager**: Turn transitions, action validation.

**Run**: `npm test` in `backend/` directory.

### Integration Tests (E2E)

- **Full game play-through**: Four players, complete round, winner declared.
- **Disconnection/reconnection**: Player disconnects mid-game, rejoins.
- **Error scenarios**: Invalid moves, malformed messages, timeout.

**Run**: Via GitHub Actions or locally using mocked Durable Objects.

### Browser Testing (Manual)

- **Mobile responsiveness**: Tiles tappable on small screens.
- **WebSocket connectivity**: Four browser instances connect to same room.
- **Real-time state sync**: All players see same state.

---

## Code Style and Conventions

- **Language**: TypeScript (strict mode).
- **Formatting**: 2-space indentation, trailing commas, single quotes.
- **Naming**: camelCase for variables/functions, PascalCase for classes/interfaces.
- **Comments**: Explain *why*, not *what*. Keep comments concise.
- **Error handling**: Use try-catch and explicit error messages.
- **Logging**: Use centralized Logger utility; avoid console.log in production code.

---

## Performance and Security Considerations

### Performance

- **Frontend bundle size**: Keep < 200 KB (gzipped) for fast GitHub Pages load.
- **WebSocket message frequency**: ~10-20 messages per minute during active play (low load).
- **Durable Object latency**: < 500 ms round-trip (typical).

### Security

- **No secrets in code**: Use environment variables (Cloudflare KV or GitHub Secrets).
- **Input validation**: All user inputs validated on server.
- **HTTPS/WSS**: Always use secure connections.
- **CORS**: Not applicable (WebSocket doesn't use CORS), but ensure proper origin checks on Worker.

---

**Document Version**: 1.0  
**Last Updated**: [Timestamp]
