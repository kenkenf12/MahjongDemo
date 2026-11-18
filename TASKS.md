# Hong Kong Mahjong - Implementation Tasks

## Overview

This document outlines the implementation roadmap in stages. Each stage builds upon the previous one and should be testable in isolation before proceeding.

---

## Stage 1: Core Tile and Rules Engine

**Objective**: Build and test the foundational game logic (tile models, dealing, winning hand validation, fan calculation).

**Rationale**: The rules engine is the heart of the game. Getting it right early prevents major rework later.

### 1.1 Tile Model and Constants

**Task**: Define tile types, suits, ranks, and game constants.

**Deliverables**:
- `backend/src/models/Tile.ts`: Tile interface, tile suite constants.
- `backend/src/constants.ts`: All tile counts, ranks, suits, positions.
- `backend/src/utils/tileHelpers.ts`: Utility functions (tile equality, sorting, filtering).

**Tests**:
- Tile creation and identity.
- Tile suite classification (is this a wind tile? Is it terminal?).
- Constants validation (144 total tiles, correct suit counts).

**Acceptance Criteria**:
- [ ] Can create and identify all tile types.
- [ ] Tile helpers work correctly (suit detection, ranking).
- [ ] All tests pass.

---

### 1.2 Tile Dealing and Shuffling

**Task**: Implement wall initialization, shuffling, and dealing logic.

**Deliverables**:
- `backend/src/game/Wall.ts`: Wall class with shuffle, deal, draw, kong replacement methods.

**Functions**:
- `shuffle()`: Randomize tile order.
- `dealInitial(positions: Position[])`: Deal 14 to East, 13 to others.
- `draw()`: Draw one tile from wall.
- `drawKongReplacement()`: Draw from the end of wall (kong replacement position).
- `replaceFowerSeason(player: Player)`: Recursively replace any flower/season tiles with wall draws.

**Tests**:
- Wall size after shuffle is 144.
- Dealing distributes correct tile counts (14, 13, 13, 13).
- Flower/season replacement draws correct tiles.
- Wall is depleted correctly by draws.

**Acceptance Criteria**:
- [ ] Wall shuffles and deals correctly.
- [ ] Flower/season replacement works (recursive).
- [ ] All tests pass (100% tile accounting).

---

### 1.3 Hand Validation and Winning Detection

**Task**: Implement the core logic for checking if a hand is a valid win.

**Deliverables**:
- `backend/src/game/Hand.ts`: Hand class with validation methods.
- `backend/src/game/WinningPatterns.ts`: Recognition of standard winning patterns (4 melds + 1 pair).

**Functions**:
- `isValidWinningHand(hand: Tile[], melds: Meld[], flowers: Tile[])`: Boolean.
- `findAllWinningPatterns(hand: Tile[], melds: Meld[])`: Returns list of valid patterns.
- `canFormMeld(tiles: Tile[]): Meld | null`: Recognize chow, pong, kong.

**Tests**:
- Valid hand patterns (4 melds + pair).
- Invalid hand patterns (not enough melds, wrong tile counts).
- Edge cases (all same suit, all terminals, etc.).
- Winning by self-draw vs. discard.

**Acceptance Criteria**:
- [ ] Correctly validates standard winning hands.
- [ ] Rejects invalid patterns.
- [ ] All tests pass.

---

### 1.4 Fan Calculation

**Task**: Implement fan scoring for winning hands.

**Deliverables**:
- `backend/src/game/FanCalculator.ts`: Fan calculation engine.
- `backend/src/config/RulesConfig.ts`: Configurable fan values and rules.

**Functions**:
- `calculateFan(hand: Tile[], melds: Meld[], flowers: Tile[], winningTile: Tile, isWinFromDiscard: boolean): number`
- `identifyPattern(hand: Tile[], melds: Meld[]): HandPattern`
- `getFanValue(pattern: HandPattern): number`

**Fan Scoring (Default Config)**:
- Pong (exposed triplet): 1 fan.
- Kong (concealed): 2 fan.
- Kong (exposed): 1 fan.
- Flower tile: 1 fan each.
- Season tile: 1 fan each.
- All Simples (2–8, no terminals/honors): 2 fan.
- All Terminals and Honors: 1 fan.
- Winning tile bonus: 0 fan (bonus for self-draw vs. discard handled in settlement).

**Tests**:
- Simple hand (4 melds + 1 pair, no bonuses): 0 fan (invalid, minimum 1 fan required).
- Hand with 1 pong + 3 simple melds + 1 pair: 1 fan.
- Hand with 1 concealed kong + 3 melds: 2 fan.
- Hand with 2 flowers + 2 seasons + standard melds: 4 fan.
- All Simples: 2 fan.
- Config changes fan values correctly.

**Acceptance Criteria**:
- [ ] Fan calculation matches expected values for standard hands.
- [ ] Configurable fan values work.
- [ ] All tests pass.

---

## Stage 2: Four-Player Game State and Turn Sequence

**Objective**: Build the game state model and turn/action flow for four players.

**Rationale**: Before implementing UI and WebSocket, we need a clear game state model and turn logic.

### 2.1 Game State Model

**Task**: Define the complete game state structure.

**Deliverables**:
- `backend/src/models/GameState.ts`: GameState interface and methods.
- `backend/src/models/Player.ts`: Player interface and methods.

**State Structure**:
- Room code, dealer, current player.
- Four players (each with hand, melds, flowers, discards, score).
- Wall status.
- Discard history.
- Turn phase (waiting for draw, waiting for discard, claim window).

**Methods**:
- `getCurrentPlayer(): Player`
- `getNextPlayer(current: Position): Position`
- `isGameOver(): boolean`
- `getWallRemaining(): number`

**Acceptance Criteria**:
- [ ] Game state structure is clear and complete.
- [ ] All methods work correctly.

---

### 2.2 Turn and Action Flow

**Task**: Implement the game turn sequence: draw, discard, claim, resolution.

**Deliverables**:
- `backend/src/game/TurnManager.ts`: Manages turn state and transitions.
- `backend/src/game/ActionValidator.ts`: Validates each action (draw, discard, claim).

**Functions**:
- `startTurn(player: Player)`: Prepare player for draw.
- `handleDraw(player: Player, gameState: GameState)`: Draw tile, replace flowers.
- `handleDiscard(player: Player, tileId: string, gameState: GameState)`: Remove tile from hand, add to discard pile.
- `getClaimableActions(otherPlayers: Player[], discardedTile: Tile): ("pong" | "kong" | "chow" | "win")[]`
- `handleClaim(player: Player, action: string, discardedTile: Tile, gameState: GameState)`: Apply claim (meld).
- `resolveClaimConflicts(claims: Claim[]): Claim`: Determine which claim takes priority.
- `endTurn(gameState: GameState)`: Pass to next player or end game.

**Tests**:
- Draw phase: Player draws correct tile.
- Discard phase: Player removes tile correctly.
- Claim phase: Correct players can claim (not all players can chow, for example).
- Claim priority: Win > Kong > Pong > Chow.
- Turn passes clockwise.
- Game ends when wall exhausted and no win.

**Acceptance Criteria**:
- [ ] Turn sequence works for a complete round (4 players, multiple turns).
- [ ] Actions are validated and rejected if invalid.
- [ ] Claim priority is resolved correctly.
- [ ] All tests pass.

---

### 2.3 Settlement and Scoring

**Task**: Calculate payouts after a win or draw.

**Deliverables**:
- `backend/src/game/Settlement.ts`: Settlement calculation.

**Functions**:
- `calculateSettlement(winner: Position, fan: number, dealer: Position, gameConfig: RulesConfig): Settlement`
- `applySettlement(gameState: GameState, settlement: Settlement)`

**Settlement Rules (Default)**:
- Dealer wins: Each loser pays winner 2× fan value.
- Dealer loses: Dealer pays winner 2× fan value; non-dealers pay 1× fan value.
- Non-dealer wins: Each loser pays 1× fan value.
- No winner (draw): All payments are 0 (or configurable).

**Tests**:
- Dealer wins by 1 fan: All losers pay 2 each.
- Non-dealer wins by 2 fan: All losers pay 2 each.
- Draw game: No payments.

**Acceptance Criteria**:
- [ ] Settlement calculations are correct.
- [ ] Scores are updated correctly.
- [ ] All tests pass.

---

## Stage 3: Basic Mobile Game Interface

**Objective**: Build a functional (non-pretty) frontend for a single player to interact with the game.

**Rationale**: Before adding multiplayer, validate that the UI can display game state and receive player input correctly.

### 3.1 Frontend Project Setup

**Task**: Set up TypeScript, build tools, and project structure.

**Deliverables**:
- `frontend/tsconfig.json`
- `frontend/webpack.config.js` or `frontend/vite.config.ts`
- `frontend/package.json` with dependencies (TypeScript, Webpack, Vite, etc.)
- `frontend/src/main.ts`: Entry point.
- `frontend/index.html`: Basic HTML structure.

**Acceptance Criteria**:
- [ ] Build process runs without errors.
- [ ] TypeScript compiles to JavaScript.
- [ ] Frontend can be served locally.

---

### 3.2 Game View Component

**Task**: Render the main game board showing player's hand, opponents, wall, discard area.

**Deliverables**:
- `frontend/src/ui/GameView.ts`: Main game view component.
- `frontend/src/ui/PlayerHand.ts`: Render player's concealed tiles.
- `frontend/src/ui/Board.ts`: Render opponents, wall, discard area.
- `frontend/styles/main.css`: Layout and styling.

**Features**:
- Display player's 13 tiles (or 14 if dealer).
- Show opponent positions (North, South, West, East) with tile counts (not actual tiles).
- Show wall tile count.
- Show discard pile (recent discards from all players).
- Show melds (Chows, Pongs, Kongs) that players have laid down.
- Highlight current player.
- Mobile-responsive layout.

**Acceptance Criteria**:
- [ ] Game view renders without errors.
- [ ] All UI elements are visible and readable on a mobile screen.
- [ ] Tiles can be selected (basic click/tap handling).

---

### 3.3 Action Buttons and User Input

**Task**: Build context-sensitive action buttons for Draw, Discard, Chow, Pong, Kong, Win, Pass.

**Deliverables**:
- `frontend/src/ui/ActionButtons.ts`: Button component.
- `frontend/src/ui/DiscardSelector.ts`: Modal or panel for selecting which tile to discard.

**Features**:
- "Draw" button appears when it's the player's turn (draw phase).
- "Discard" button appears after draw (with selector for which tile).
- "Chow", "Pong", "Kong", "Win", "Pass" buttons appear during claim window (context-dependent).
- Buttons are disabled/enabled based on game phase and player's valid actions.
- Clicking a button sends a message to the backend (for now, a dummy backend).

**Acceptance Criteria**:
- [ ] Buttons appear/disappear based on game phase.
- [ ] User can select a tile to discard.
- [ ] Button clicks trigger appropriate messages.

---

### 3.4 Notifications and Alerts

**Task**: Display game events and error messages.

**Deliverables**:
- `frontend/src/ui/Notifications.ts`: Toast or alert component.

**Features**:
- "Player X drew a tile."
- "Player X discarded Y."
- "Player X claimed Pong."
- "You won! Fan: 2. Settlement: +200."
- Error messages ("Invalid move", "Not your turn", etc.).

**Acceptance Criteria**:
- [ ] Notifications appear and disappear correctly.
- [ ] Messages are clear and informative.

---

### 3.5 Tile Graphics

**Task**: Create or source simple tile representations.

**Deliverables**:
- `frontend/assets/tiles/`: SVG or PNG files for all tile types.
- `frontend/styles/tiles.css`: Tile styling and hover effects.

**Design**:
- Simple, clean aesthetic suitable for mobile screens.
- Color-coded by suit (red for characters, green for bamboo, etc.).
- Rank clearly visible (number or symbol).
- Wind, dragon tiles distinguished by name or symbol.
- Flower/season tiles with distinct visuals.

**Acceptance Criteria**:
- [ ] All tile types are represented visually.
- [ ] Tiles are easily distinguishable.
- [ ] Tiles scale well on mobile screens.

---

## Stage 4: Room Creation and Joining (Offline)

**Objective**: Implement the room lobby interface without WebSocket (using local state).

**Rationale**: Test the room creation and joining flow before adding real-time multiplayer.

### 4.1 Lobby Screen

**Task**: Build the room lobby UI.

**Deliverables**:
- `frontend/src/ui/Lobby.ts`: Lobby component.
- `frontend/src/ui/CreateRoomModal.ts`: Modal for creating a room.
- `frontend/src/ui/JoinRoomModal.ts`: Modal for joining by room code.

**Features**:
- Option to "Create Room" or "Join Room".
- Create room: Input player alias → Generate room code → Show lobby.
- Join room: Input player alias + room code → Show lobby.
- Lobby shows 4 seats (East, South, West, North) with player names and status (empty/occupied/connected).
- Player can see their own seat and alias.
- "Start Game" button appears when all 4 seats are filled (for testing; in real app, this requires all WebSocket connections).

**Acceptance Criteria**:
- [ ] User can create a room and see a room code.
- [ ] User can join a room with a code.
- [ ] Lobby displays 4 seats correctly.
- [ ] UI transitions smoothly from lobby to game.

---

### 4.2 Room State Management (Local)

**Task**: Manage room state on the frontend without WebSocket.

**Deliverables**:
- `frontend/src/models/LocalRoomState.ts`: Room state model.
- `frontend/src/models/LocalGameState.ts`: Game state model (mirror of server state).

**Features**:
- Track room code, player position, other players' info.
- Track game phase (lobby → playing → result).
- Simulate game state (for testing UI without real backend).

**Acceptance Criteria**:
- [ ] Room state persists as players join.
- [ ] Game phase transitions work.
- [ ] State updates trigger UI re-renders.

---

## Stage 5: Cloudflare WebSocket Multiplayer

**Objective**: Connect the frontend to a real Cloudflare backend with WebSocket.

**Rationale**: This is the critical stage where all four players can actually play together.

### 5.1 Cloudflare Workers Setup

**Task**: Initialize Cloudflare Workers project and WebSocket endpoint.

**Deliverables**:
- `backend/wrangler.toml`: Cloudflare Workers configuration.
- `backend/src/index.ts`: Worker entry point with WebSocket upgrade handler.
- `backend/src/worker/Handler.ts`: Message routing to Durable Objects.

**Features**:
- Listen for WebSocket connections at `/ws?room=ROOMCODE`.
- Route connection to appropriate Durable Object based on room code.
- Handle WebSocket errors gracefully.

**Acceptance Criteria**:
- [ ] Worker can be deployed to Cloudflare free tier.
- [ ] WebSocket connections are established.
- [ ] Connections can be terminated without errors.

---

### 5.2 Durable Object: GameRoom

**Task**: Implement the Durable Object that manages game state and broadcasts to all clients.

**Deliverables**:
- `backend/src/durable_objects/GameRoom.ts`: GameRoom Durable Object class.

**Features**:
- Accept WebSocket connections from clients.
- Maintain game state (four players, tiles, turn, etc.).
- Process incoming messages (draw, discard, claim, win).
- Validate all actions on the server.
- Broadcast state updates to all connected clients.
- Handle client disconnections (set player status to disconnected).

**Methods**:
- `fetch(request)`: Handle WebSocket upgrade.
- `webSocketMessage(client, message)`: Process incoming message.
- `webSocketClose(client)`: Handle disconnection.
- `broadcast(message)`: Send message to all connected clients.

**Acceptance Criteria**:
- [ ] Multiple clients can connect to the same Durable Object.
- [ ] Messages are received and processed.
- [ ] Broadcasts reach all connected clients.
- [ ] Disconnections are handled gracefully.

---

### 5.3 Multiplayer Game Flow

**Task**: Implement the complete game flow with four real players.

**Deliverables**:
- Complete integration of frontend UI with backend WebSocket and Durable Object.

**Flow**:
1. Four players each open the app in their browser.
2. Each player creates or joins a room (via Lobby UI).
3. All four players see each other in the Lobby.
4. When all four are connected, the "Start" button becomes available.
5. One player clicks "Start".
6. Durable Object initializes the game (shuffles wall, deals tiles, replaces flowers).
7. All clients receive initial game state.
8. Dealer is prompted to discard.
9. Game proceeds with turns, claims, scoring.

**Acceptance Criteria**:
- [ ] Four players can join the same room.
- [ ] Game initializes correctly.
- [ ] All players see the same game state.
- [ ] Turns pass correctly between players.
- [ ] A winner is determined and settlement is calculated.

---

### 5.4 Reconnection Handling

**Task**: Implement reconnection logic so a temporarily disconnected player can rejoin.

**Deliverables**:
- `backend/src/game/ReconnectionManager.ts`: Handles disconnection timeouts and reconnection.
- `frontend/src/api/ReconnectionHandler.ts`: Frontend reconnection logic.

**Features**:
- When a player disconnects, reserve their seat for 5 minutes.
- If they reconnect within 5 minutes, restore their hand and game state.
- If timeout expires, remove the player and potentially end the game.
- Display reconnection attempts and status to other players.

**Acceptance Criteria**:
- [ ] Temporary disconnection doesn't end the game.
- [ ] Player can reconnect and resume from their previous state.
- [ ] Timeout is enforced (player removed after 5 minutes).

---

## Stage 6: Fan Calculation and Settlement UI

**Objective**: Implement the result screen showing win details, fan count, and settlement.

**Rationale**: Players need clear, transparent information about how they won and who pays what.

### 6.1 Result Screen

**Task**: Display win details after a winning hand.

**Deliverables**:
- `frontend/src/ui/ResultScreen.ts`: Result display component.

**Features**:
- Winner's name and winning hand pattern.
- Fan count breakdown (e.g., "Pong (+1) + Kong (+2) + Flower (+1) = 4 fan").
- Settlement details: Who pays whom how much.
- Option to start a new round or leave the game.

**Acceptance Criteria**:
- [ ] Result screen displays all required information.
- [ ] Settlement calculations are visible and understandable.
- [ ] UI is clear and non-ambiguous.

---

### 6.2 Draw Game Result

**Task**: Display result when no player wins (wall exhausted).

**Deliverables**:
- Draw game result in ResultScreen component.

**Features**:
- Display "No winner – all pass" message.
- Show that no payments are made.
- Option to continue or leave.

**Acceptance Criteria**:
- [ ] Draw game is handled correctly.
- [ ] No payments are mistakenly calculated.

---

## Stage 7: Error Handling, Validation, and Edge Cases

**Objective**: Harden the game against errors and edge cases.

**Rationale**: Production-like reliability and error messages.

### 7.1 Input Validation

**Task**: Validate all user inputs and WebSocket messages.

**Deliverables**:
- `backend/src/validation/Validator.ts`: Input validation functions.

**Validations**:
- Alias: 1-20 alphanumeric characters.
- Room code: Exists, correct format.
- Tile ID: Exists in player's hand.
- Action: Valid for current game phase.

**Acceptance Criteria**:
- [ ] Invalid inputs are rejected with clear error messages.
- [ ] No crashes or undefined behavior.

---

### 7.2 Duplicate Action Prevention

**Task**: Prevent duplicate actions if a client message is received twice.

**Deliverables**:
- `backend/src/game/ActionDeduplication.ts`: Deduplication logic.

**Features**:
- Each action is assigned a unique ID (client-side generated, e.g., UUID).
- Server tracks seen action IDs.
- If a duplicate arrives, server ignores it and returns the cached result.

**Acceptance Criteria**:
- [ ] Network packet duplication doesn't cause double-actions.
- [ ] Player can safely retry an action without side effects.

---

### 7.3 Error Messages and Logging

**Task**: Provide helpful error messages and logging.

**Deliverables**:
- `backend/src/logging/Logger.ts`: Server-side logging.
- `frontend/src/logging/ErrorHandler.ts`: Frontend error handling and display.

**Features**:
- Server logs all game events and errors (for debugging).
- Frontend displays user-friendly error messages ("This tile is not in your hand.", "Not your turn.").
- Frontend logs errors for developer console debugging.

**Acceptance Criteria**:
- [ ] Errors are logged and visible in console.
- [ ] User-facing error messages are clear.

---

## Stage 8: End-to-End Testing and Refinement

**Objective**: Test the entire game flow and refine for production readiness.

**Rationale**: Catch integration issues and ensure a smooth user experience.

### 8.1 Integration Tests

**Task**: Test complete game scenarios.

**Deliverables**:
- `tests/e2e/`: E2E test scripts (Playwright, Cypress, or custom).

**Scenarios**:
- Four players join a room, game plays to completion (winner determined).
- A player disconnects and reconnects mid-game.
- Invalid moves are rejected.
- Settlement is calculated correctly.
- Draw game is detected.

**Acceptance Criteria**:
- [ ] All scenarios pass.
- [ ] No data corruption or inconsistent states.

---

### 8.2 Performance Testing

**Task**: Test performance under realistic conditions.

**Deliverables**:
- Performance benchmarks and profiling.

**Metrics**:
- Time to deal tiles: < 1 second.
- Message latency (action → broadcast → UI update): < 500 ms.
- Memory usage per game room: < 5 MB.

**Acceptance Criteria**:
- [ ] Performance meets targets.
- [ ] No memory leaks.

---

### 8.3 UI/UX Refinement

**Task**: Polish UI and improve user experience.

**Deliverables**:
- Improved styling, animations, typography.
- Mobile-optimized layouts.
- Accessibility improvements (keyboard nav, screen reader support).

**Acceptance Criteria**:
- [ ] UI is visually polished and professional.
- [ ] Mobile experience is smooth and responsive.
- [ ] All interactive elements are keyboard-accessible.

---

### 8.4 Documentation and Deployment

**Task**: Write user and deployment documentation.

**Deliverables**:
- `README.md`: User guide and game rules.
- `DEPLOYMENT.md`: Instructions for deploying to Cloudflare and GitHub Pages.
- `CONTRIBUTING.md`: Developer guide for future contributors.

**Acceptance Criteria**:
- [ ] Documentation is clear and complete.
- [ ] Deployment instructions are tested and verified.

---

## Summary Timeline

| Stage | Estimated Effort | Duration |
|-------|------------------|----------|
| 1: Rules Engine | High | 2–3 days |
| 2: Game State & Turn Logic | High | 2–3 days |
| 3: Basic UI | Medium | 2 days |
| 4: Room Management (Offline) | Medium | 1 day |
| 5: WebSocket Multiplayer | High | 2–3 days |
| 6: Results & Settlement UI | Low | 1 day |
| 7: Error Handling | Medium | 1–2 days |
| 8: Testing & Polish | Medium | 2–3 days |
| **Total** | | **13–18 days** |

---

## Critical Path

The critical path (longest dependency chain):
1. **Rules Engine** (Tile models, dealing, winning validation, fan calculation).
2. **Game State & Turn Logic** (State model, turn flow).
3. **WebSocket Multiplayer** (Depends on 1 & 2 to have working game logic).

Stages 3 and 4 can partially run in parallel with 1 & 2, but Stage 5 is a hard dependency on the completion of Stages 1 & 2.

---

**Document Version**: 1.0  
**Status**: Draft – Ready for Kickoff  
**Last Updated**: [Timestamp]
