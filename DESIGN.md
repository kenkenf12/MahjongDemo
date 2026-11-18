# Hong Kong Mahjong - Design Document

## 1. Architecture Overview

The application follows a three-layer architecture:

1. **Frontend (GitHub Pages)**: Single-page application (SPA) with HTML, CSS, and TypeScript/JavaScript.
2. **Backend (Cloudflare Workers + Durable Objects)**: WebSocket server with authoritative game state.
3. **Communication**: WebSocket protocol for real-time bidirectional messaging.

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Pages                         │
│  (Frontend SPA: HTML, CSS, TypeScript/JavaScript)       │
│                 4 Browser Clients                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ WebSocket
                     ↓
┌─────────────────────────────────────────────────────────┐
│              Cloudflare Workers                          │
│  (WebSocket Endpoint / Routing)                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│        Cloudflare Durable Objects                       │
│  (One per Game Room: State + Game Logic)               │
│                                                         │
│  - Room ID, Player Sessions, Tiles, Hands              │
│  - Turn Sequence, Game Rules Engine                    │
│  - State Validation and Broadcasting                  │
└─────────────────────────────────────────────────────────┘
```

## 2. Frontend Architecture

### 2.1 Module Structure

```
frontend/
├── index.html
├── styles/
│   ├── main.css              # Layout and responsive design
│   ├── tiles.css             # Tile styling
│   └── mobile.css            # Mobile-specific styles
├── src/
│   ├── main.ts               # Application entry point
│   ├── types.ts              # Shared TypeScript types
│   ├── api/
│   │   └── websocket.ts      # WebSocket client and message handlers
│   ├── models/
│   │   ├── Tile.ts           # Tile class and tile utilities
│   │   ├── Hand.ts           # Player hand management
│   │   └── GameState.ts      # Local game state mirror
│   ├── ui/
│   │   ├── GameView.ts       # Main game view component
│   │   ├── PlayerHand.ts     # Render player's concealed hand
│   │   ├── Board.ts          # Render opponents, discards, wall
│   │   ├── ActionButtons.ts  # Draw, discard, claim buttons
│   │   └── Notifications.ts  # Alerts and action notifications
│   ├── rules/
│   │   └── WinningHands.ts   # Client-side validation (for UX feedback only)
│   └── utils/
│       ├── constants.ts      # Game constants (tile counts, etc.)
│       └── helpers.ts        # Utility functions
├── tsconfig.json
└── package.json              # Dependencies (webpack, TypeScript, etc.)
```

### 2.2 Frontend Technologies

- **Language**: TypeScript (compiled to ES2020 JavaScript for browser compatibility).
- **Bundler**: Webpack (or Vite for faster dev builds).
- **Styling**: CSS Grid and Flexbox for responsive layout; no CSS framework (keep it minimal).
- **DOM Manipulation**: Vanilla JavaScript (no framework like React for this demo to keep bundled size small).
- **Deployment**: GitHub Pages (static hosting).

### 2.3 Frontend State Management

The frontend maintains a **local mirror** of the game state:

```typescript
interface LocalGameState {
  roomCode: string;
  playerId: string;
  playerPosition: Position;  // "East", "South", "West", "North"
  playerAlias: string;
  
  gamePhase: "lobby" | "playing" | "result";
  dealer: Position;
  currentPlayer: Position;
  roundNumber: number;
  
  myHand: Tile[];            // My concealed tiles (updated by server)
  myMelds: Meld[];           // My exposed melds
  myFlowers: Tile[];         // My flower/season tiles (counted in hand)
  myDiscards: Tile[];        // My recent discards
  myScore: number;
  
  opponents: {
    [position: string]: {
      alias: string;
      tileCount: number;      // Number of concealed tiles (not tiles themselves)
      melds: Meld[];
      flowers: Tile[];
      discards: Tile[];
      score: number;
      connected: boolean;
    }
  };
  
  wall: {
    remaining: number;        // Count only, not individual tiles
    kong_replacement_used: number;
  };
  
  lastDiscarded: Tile | null;
  discardHistory: {
    player: Position;
    tile: Tile;
    timestamp: number;
  }[];
  
  lastAction: {
    type: string;             // "draw", "discard", "claim", "win"
    player: Position;
    timestamp: number;
  };
}
```

**Key Principle**: The frontend never modifies the game state directly. All state updates come from the server via WebSocket messages.

### 2.4 WebSocket Message Protocol

#### Client → Server

```typescript
// Client sends commands to the server
type ClientMessage = 
  | { type: "join"; alias: string; roomCode: string }
  | { type: "create_room"; alias: string }
  | { type: "draw" }                           // Draw from wall
  | { type: "discard"; tile: string }          // Discard a specific tile
  | { type: "claim"; tileId: string; action: "chow" | "pong" | "kong" | "win" }
  | { type: "pass" }                           // Pass on a claim
  | { type: "reconnect"; playerId: string; roomCode: string }
  | { type: "pong"; clientId: string };        // Ping-pong (connectivity check)
```

#### Server → Client

```typescript
// Server broadcasts state updates and events
type ServerMessage = 
  | { type: "room_created"; roomCode: string; playerId: string }
  | { type: "room_joined"; roomCode: string; playerId: string; position: Position }
  | { type: "game_start"; dealer: Position; gameState: GameStateSnapshot }
  | { type: "draw_result"; tile: Tile; wall_remaining: number }
  | { type: "player_discarded"; player: Position; tile: Tile }
  | { type: "claim_opportunity"; tile: Tile; availableActions: ("chow" | "pong" | "kong" | "win")[] }
  | { type: "claim_resolved"; action: string; player: Position; tile: Tile }
  | { type: "hand_update"; hand: Tile[] }    // Your concealed hand
  | { type: "meld_update"; position: Position; meld: Meld }
  | { type: "state_sync"; gameState: GameStateSnapshot }
  | { type: "win"; winner: Position; winningTile: Tile; winningHand: HandPattern; fan: number; settlement: Settlement }
  | { type: "round_draw"; settlement: Settlement }  // No winner, wall exhausted
  | { type: "player_disconnected"; position: Position }
  | { type: "player_reconnected"; position: Position }
  | { type: "error"; message: string }
  | { type: "pong"; clientId: string };       // Ping-pong response
```

### 2.5 UI Rendering Strategy

The UI is re-rendered in response to server messages using a simple event-driven approach:

1. **WebSocket receives a message** (e.g., "hand_update", "player_discarded").
2. **Local state is updated** with the new data.
3. **UI is re-rendered** using a simple render function that walks the DOM and updates the necessary elements.

No virtual DOM or complex state management framework is required for this demo.

### 2.6 Mobile UI Layout

```
┌─────────────────────────────────────┐
│        Game Info Bar                │  Header (5% height)
│ Room Code | Scores | Dealer         │
├─────────────────────────────────────┤
│                                     │
│   Opponent (North) — Tile Count    │  Opponent Area (25% height)
│   Discards (West) | Wall | Discards (East)
│                                     │
│   ┌─────────────────────┐          │  Current Turn Indicator (5% height)
│   │   Active: North     │          │
│   └─────────────────────┘          │
│                                     │
│   Opponent (West) — Tile Count     │  (side-by-side)
│   Opponent (East) — Tile Count     │
│                                     │
├─────────────────────────────────────┤
│  [Meld 1] [Meld 2] [Meld 3]        │  My Melds (10% height)
├─────────────────────────────────────┤
│                                     │
│  [🀄] [🀄] [🀄] [🀄] ... [🀄] [🀄]  │  My Hand (30% height, scrollable)
│                                     │
├─────────────────────────────────────┤
│ [Draw] [Discard] [Chow] [Pong]     │  Action Buttons (10% height)
│ [Kong] [Win]   [Pass]              │
└─────────────────────────────────────┘
```

Responsive design:
- Portrait orientation prioritized.
- Landscape mode scales UI proportionally.
- Touch targets at least 44px × 44px (mobile best practice).

## 3. Backend Architecture

### 3.1 Cloudflare Workers Endpoint

The Workers script handles:
1. **WebSocket upgrade**: Listen for WebSocket connection requests.
2. **Room routing**: Forward messages to the appropriate Durable Object (one per room).
3. **Error handling**: Gracefully reject invalid connections or messages.

```typescript
// worker.ts (Cloudflare Worker)
export default {
  fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname === "/ws") {
      const roomCode = url.searchParams.get("room");
      if (!roomCode) return new Response("Missing room code", { status: 400 });
      
      const durableObject = env.GAME_ROOM.get(roomCode);
      return durableObject.fetch(request);
    }
    
    return new Response("Not Found", { status: 404 });
  }
};
```

### 3.2 Durable Object: GameRoom

One Durable Object instance per game room. It maintains:
- **Room state**: Room code, player sessions, game state.
- **Game logic**: Tile dealing, turn order, validation, fan calculation.
- **WebSocket clients**: Active player connections.
- **Broadcasts**: Sends state updates to all connected clients.

```typescript
interface GameRoomState {
  roomCode: string;
  playerSessions: Map<string, PlayerSession>;  // playerId → session
  players: [Player, Player, Player, Player];   // East, South, West, North
  
  wall: Tile[];                  // Remaining tiles in wall
  wallKongReplacements: Tile[];  // Kong replacement tiles
  
  gamePhase: "lobby" | "playing" | "result" | "finished";
  dealer: Position;
  currentPlayer: Position;
  roundNumber: number;
  
  discardHistory: DiscardEvent[];
  lastWinResult?: WinResult;
  
  disconnectedTimeout: Map<string, number>;  // playerId → timeout handle
}

interface PlayerSession {
  playerId: string;
  alias: string;
  position: Position;
  connectedAt: number;
  lastMessageTime: number;
  webSocket: WebSocket;
}

interface Player {
  position: Position;
  alias: string;
  hand: Tile[];
  melds: Meld[];
  flowers: Tile[];
  discards: Tile[];
  score: number;
  connected: boolean;
  sessionId: string;
}
```

### 3.3 Game Rules Engine

A separate module (`RulesEngine.ts`) on the backend handles:
- **Hand validation**: Is a given hand a valid win?
- **Fan calculation**: Calculate fan for a winning hand.
- **Move validation**: Is a move legal (can this player chow/pong/kong)?
- **Competing claims**: Resolve priority if multiple players claim the same discard.

```typescript
class RulesEngine {
  config: RulesConfig;  // Configurable rule set
  
  isValidWinningHand(hand: Tile[], melds: Meld[], flowers: Tile[]): boolean
  calculateFan(hand: Tile[], melds: Meld[], flowers: Tile[], winningTile: Tile, isWinFromDiscard: boolean): number
  canChow(hand: Tile[], discardedTile: Tile, playerPosition: Position, discardingPlayer: Position): boolean
  canPong(hand: Tile[], discardedTile: Tile): boolean
  canKong(hand: Tile[], tile?: Tile): boolean
  getWinningPatterns(hand: Tile[]): HandPattern[]
  settlement(winner: Position, fan: number, dealer: Position, playerCount: number): Settlement
}
```

### 3.4 Tile Representation

On both frontend and backend:

```typescript
interface Tile {
  id: string;         // Unique ID per tile in the game (e.g., "char_1_a", "char_1_b", ...)
  suit: "char" | "bamboo" | "circle" | "wind" | "dragon" | "flower";
  rank: number;       // 1-9 for suits; 1-4 for winds; 1-3 for dragons; 1-8 for flowers/seasons
  exposed?: boolean;  // Visible in a meld
}

// Meld representation
interface Meld {
  tiles: Tile[];
  type: "chow" | "pong" | "kong_concealed" | "kong_exposed";
  claimedFrom?: Position;  // If exposed, which player's discard
}
```

### 3.5 Backend Message Processing

When a client sends a message (e.g., "draw", "discard"), the Durable Object:

1. **Validates the message**: Correct format, required fields.
2. **Authenticates the player**: Is the playerId a registered player in this room?
3. **Validates the game state**: Is the game in "playing" phase?
4. **Validates the action**: Is the player the active player? Is the tile in their hand?
5. **Applies the action**: Update game state (remove tile from hand, add to discard pile, etc.).
6. **Broadcasts the state**: Send updated state to all connected clients.

```typescript
async handleDraw(playerId: string, gameState: GameRoomState): Promise<void> {
  const player = gameState.playerSessions.get(playerId);
  if (!player) throw new Error("Player not found");
  
  const playerObj = gameState.players[player.position];
  if (gameState.currentPlayer !== player.position) {
    throw new Error("Not your turn");
  }
  
  if (gameState.wall.length === 0) {
    throw new Error("Wall exhausted");
  }
  
  const drawnTile = gameState.wall.pop();
  playerObj.hand.push(drawnTile);
  
  // Check if flower/season; if so, replace and draw again
  if (this.isFlowerOrSeason(drawnTile)) {
    playerObj.flowers.push(drawnTile);
    playerObj.hand = playerObj.hand.filter(t => t.id !== drawnTile.id);
    // Recursive draw replacement
    await this.handleDraw(playerId, gameState);
  }
  
  this.broadcastToRoom(gameState.roomCode, {
    type: "draw_result",
    tile: drawnTile,
    wall_remaining: gameState.wall.length
  });
}
```

## 4. Data Flow: A Complete Turn

### Sequence: Player Draws and Discards

1. **Player A presses "Draw" button** (Frontend)
   - Frontend sends: `{ type: "draw" }`

2. **Durable Object receives "draw"** (Backend)
   - Validates: Is Player A the active player? Is wall non-empty?
   - Draws tile from wall.
   - Checks if flower/season; if so, replaces and draws again.
   - Updates game state.

3. **Durable Object broadcasts** (Backend)
   - Sends to all clients: `{ type: "draw_result", tile: drawnTile, wall_remaining: ... }`

4. **Frontends update local state** (Frontend)
   - If this is my player, my hand now includes the new tile.
   - Render UI: Show new tile, update wall count.
   - Enable "Discard" button for my player.

5. **Player A selects a tile to discard** (Frontend)
   - Frontend sends: `{ type: "discard", tile: tileId }`

6. **Durable Object processes discard** (Backend)
   - Validates: Is tile in Player A's hand?
   - Removes tile from hand, adds to discard pile.
   - Checks: Can other players claim this tile (Pong, Kong, Win)?
   - If yes, enters "claim opportunity" phase.
   - If no, passes turn to next player.
   - Updates game state.

7. **Durable Object broadcasts** (Backend)
   - To all: `{ type: "player_discarded", player: "A", tile: ... }`
   - To Players B, C, D: `{ type: "claim_opportunity", tile: ..., availableActions: [...] }`

8. **Other frontends update** (Frontend)
   - Show discarded tile in discard area.
   - For Players B, C, D: Show action buttons (Chow, Pong, Kong, Win, Pass).
   - Disable draw button during claim window.

9. **Claim Phase** (Frontend/Backend interaction, 5-10 second window)
   - If any player claims (e.g., "Pong"), frontend sends: `{ type: "claim", action: "pong" }`
   - Durable Object validates and applies claim.
   - All frontends update to show the pong meld.

10. **Claim Window Closes** (Backend timeout)
    - If no one claimed, pass turn to next player (South → West → North → East).
    - Broadcast: `{ type: "next_player", currentPlayer: "B" }`

This cycle repeats until a player wins or the wall is exhausted.

## 5. Tile and Hand Management

### 5.1 Initial Dealing

1. Shuffle all 144 tiles into a wall.
2. East (dealer) draws 14 tiles; South, West, North each draw 13.
3. Immediately replace any flower/season tiles with wall draws.
4. East discards one tile to start.

### 5.2 Concealed vs. Exposed Melds

- **Concealed tiles**: Player's hand (not visible to others).
- **Exposed melds**: Chow, Pong, Kong laid down (visible to all).
- **Flowers/seasons**: Automatically set aside and scored separately.

### 5.3 Kong Replacement Tiles

When a player declares or wins with a Kong:
- Remove the kong from their hand/melds.
- Draw a replacement from the **end of the wall** (not the normal draw position).
- If that tile is a flower/season, replace again.

## 6. Security Considerations

### 6.1 Server Authority

- **All game logic runs on the server** (Durable Object).
- Frontend is a "dumb terminal" that renders state and sends commands.
- Server validates every command before applying it.
- Clients cannot cheat by sending false game state.

### 6.2 Concealed Hand Privacy

- Each player's concealed hand is **never sent to other clients**.
- Server only sends the **tile count** of opponents' hands.
- After a player wins, the server broadcasts the winning hand (for transparency).

### 6.3 Player Session Management

- Each player is assigned a unique `playerId` on join.
- Commands are validated against the player's session.
- A player cannot impersonate another player without their session ID.

### 6.4 Message Validation

- WebSocket messages are parsed and validated for schema.
- Unexpected fields are ignored; missing required fields cause rejection.
- Malformed JSON is logged and the connection is closed.

## 7. Scalability and Limits

For this demo:
- **Max rooms**: Limited by Cloudflare Durable Objects quota (should easily support 100+ concurrent rooms on free tier).
- **Max players per room**: Fixed at 4.
- **Message throughput**: Each game produces ~10-20 messages per minute (very low load).
- **Durable Object storage**: Game state per room is < 100 KB; ample quota for free tier.

## 8. Error Handling and Recovery

### 8.1 Player Disconnection

1. WebSocket connection drops.
2. Durable Object detects disconnection.
3. Set `player.connected = false` and broadcast to other clients.
4. Start a 5-minute timeout timer for that player.
5. If player reconnects within 5 minutes, restore their session and resume game.
6. If timeout expires, remove the player from the room (game may end or continue with 3 players, depending on rules).

### 8.2 Invalid Moves

1. Client sends invalid move (e.g., discard a tile not in hand).
2. Server rejects the move and sends error message.
3. Frontend displays error message to user.
4. Game state remains unchanged.

### 8.3 Network Latency

- Commands are processed in the order received by the Durable Object.
- If two clients send conflicting commands simultaneously, the server processes them sequentially and one is rejected (e.g., two players claiming the same discard, winner's claim takes priority).

## 9. Deployment Topology

### 9.1 Frontend Deployment

- Source: GitHub repository `/frontend` directory.
- Build: `npm run build` → outputs to `/dist`.
- Hosting: GitHub Pages (via GitHub Actions or manual push).
- Domain: `https://yourusername.github.io/major-demo/`.

### 9.2 Backend Deployment

- Source: GitHub repository `/backend` directory (Cloudflare Workers + Durable Objects).
- Build: `npx wrangler publish`.
- Hosting: Cloudflare Workers free tier.
- Domain: `https://yourworker.yoursubdomain.workers.dev/ws`.

### 9.3 WebSocket Endpoint

- Frontend connects to: `wss://yourworker.yoursubdomain.workers.dev/ws?room=ROOMCODE`
- Durable Object ID: Based on room code (deterministic).

## 10. Configuration and Rules

### 10.1 Rules Config File

The backend includes a `rules.config.json` (or TypeScript object) specifying:

```json
{
  "minimumFanToWin": 1,
  "fanValues": {
    "pong": 1,
    "kongConcealed": 2,
    "kongExposed": 1,
    "allSimples": 2,
    "allTerminalHonors": 1,
    "flowerPerTile": 1,
    "seasonPerTile": 1
  },
  "dealerMultiplier": {
    "dealerWins": 2,
    "dealerLoses": 2
  },
  "payoutModel": "full",
  "dealerRotation": "afterLoss",
  "competeClaimsResolution": "winPriority"
}
```

### 10.2 Reconfiguration

To change rules, update the config file and redeploy. No database schema changes required.

---

## Appendix: Tech Stack Summary

| Layer | Technology |
|-------|------------|
| **Frontend Language** | TypeScript (ES2020) |
| **Frontend Build** | Webpack / Vite |
| **Frontend Hosting** | GitHub Pages (static) |
| **Frontend UI** | Vanilla DOM + CSS (no React/Vue) |
| **Backend Runtime** | Cloudflare Workers |
| **Backend State** | Cloudflare Durable Objects |
| **WebSocket Server** | Built into Durable Objects |
| **Real-time Protocol** | WebSocket (JSON messages) |
| **Database** | None (state is ephemeral) |
| **Authentication** | Room code + session ID (lightweight) |
| **Deployment Tool** | Wrangler CLI |

---

**Document Version**: 1.0  
**Status**: Draft – Ready for Architecture Review  
**Last Updated**: [Timestamp]
