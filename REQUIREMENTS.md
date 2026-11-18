# Hong Kong Mahjong - Requirements Document

## 1. Project Vision

Build a browser-based, real-time multiplayer Hong Kong Mahjong game where four human players can join a shared game room from separate devices (mobile or desktop) over the internet, with no server hosting or app installation required.

## 2. Functional Requirements

### 2.1 Game Room Management

- **Room Creation**: A player can create a new game room with a unique room code (6-8 alphanumeric characters).
- **Room Joining**: Players can join a room by entering the room code.
- **Player Seats**: Exactly four player seats (East, South, West, North); each seat shows player alias and connection status.
- **Game Start**: Game starts automatically when all four seats are filled with connected players.
- **Room Code Display**: Room code is visible to all players during gameplay.
- **Disconnection Handling**: Temporary disconnections (< 5 minutes) do not end the game; player can reconnect.
- **Seat Persistence**: A reconnecting player returns to their original seat.
- **Fifth Player Prevention**: Fifth player attempting to join receives a "room full" error.

### 2.2 Player Identity

- **Alias Entry**: Each player enters a human-readable alias (no registration or password).
- **Unique Session ID**: Backend assigns a unique session ID per player per room (not visible to UI).
- **No Real-name Verification**: Aliases are self-chosen and unverified.

### 2.3 Tile Representation

Standard Hong Kong Mahjong set: 144 tiles total.
- **Character tiles (万)**: 1–9 of characters, 4 copies each = 36 tiles.
- **Bamboo tiles (筒)**: 1–9 of bamboo, 4 copies each = 36 tiles.
- **Circle tiles (索)**: 1–9 of circles, 4 copies each = 36 tiles.
- **Wind tiles (風)**: East, South, West, North, 4 copies each = 16 tiles.
- **Dragon tiles (龍)**: Red, Green, White, 4 copies each = 12 tiles.
- **Flower & Season tiles (花)**: Plum, Orchid, Bamboo, Chrysanthemum (flowers); Spring, Summer, Autumn, Winter (seasons), 1 copy each = 8 tiles.
- **Total**: 144 tiles.

Each tile must have a clear visual representation suitable for mobile touchscreens.

### 2.4 Core Game Flow

#### Initialization
- Shuffle the 144-tile wall.
- Dealer (East) draws 14 tiles; other players draw 13 tiles each.
- Flower and season tiles are immediately replaced with draws from the wall.
- Dealer plays first.

#### Turn Sequence
1. Active player draws a tile from the wall (or from a previous kong).
2. Other players can claim the drawn tile for Chow, Pong, Kong, or Win.
3. If no one claims, the active player's turn continues.
4. Active player discards a tile.
5. Other players can claim the discard for Pong, Kong, or Win.
6. If no one claims and the wall is not empty, turn passes to the next player (clockwise).
7. If the wall is empty and no one can play, the round is a draw (all-pass or wall exhausted).

#### Special Cases
- **Flower/Season Tile**: When drawn or dealt, immediately replaced with a draw from the wall. The player draws again.
- **Kong**: A player can declare Kong on their turn (drawn or held) or on another's discard. After Kong, they draw a replacement tile from the end of the wall.
- **Chow**: Can only be played on the discard of the player clockwise before the current player (only the player to the right of the discarder can chow).
- **Pong**: Can be played on any player's discard.

### 2.5 Winning Conditions

A player wins when they form a valid winning hand (Hu/胡):

- **Self-Draw Win (Tsumo/摸)**: After drawing a tile from the wall, the player's hand is complete.
- **Discard Win (Ron/榮)**: After another player discards, the player's hand is complete using that tile.
- **Draw Game**: If the wall is exhausted and no player has won, the game is a draw (平手/all-pass).

A valid winning hand consists of:
- 4 melds (Chow, Pong, or Kong) + 1 pair, OR
- Special winning patterns (see Rules Configuration).

### 2.6 Rules Configuration

The following must be configurable to accommodate regional rule variations:

- **Minimum Fan to Win**: Minimum fan (points/pattern value) required to declare a win (default: 1 fan).
- **Fan Values**: Assigned fan points for each winning pattern (e.g., Pung/Pong, Concealed Kong, etc.).
- **Special Hand Patterns**: Special winning hands (e.g., all Simples, all Terminals, etc.).
- **Flower/Season Scoring**: Fan added per flower/season tile held (default: 1 fan per flower, 1 fan per season).
- **Kong Scoring**: Fan added for each kong in the winning hand (default: 1 fan per concealed kong, different for open kong).
- **Dealer Multiplier**: Whether dealer wins pay double/treble; dealer losses pay normal (default: dealer pays double on loss, receives double on win).
- **Turn Order and Rounds**: Whether to rotate dealer after each round or after a dealer win.
- **Payment Rules**: Full settlement, half settlement, or two-player settlement (default: each loser pays the winner the full fan value).
- **Competing Claims**: Which player wins if multiple players claim the same discard (default: win > kong > pong > chow; or by turn order).

### 2.7 Mobile User Interface

- **Player's Hand**: Concealed tiles displayed in a scrollable row at the bottom of the screen, organized visually.
- **Melds Displayed**: Chows, Pongs, and Kongs the player has laid down, visible to all players.
- **Discard Area**: Recently discarded tiles from all players, labeled with player position.
- **Opponent Tiles**: Closed tile backs showing tile counts for each opponent.
- **Active Player Indicator**: Clear visual indication (highlight, color, icon) of whose turn it is.
- **Wall Tile Counter**: Number of remaining tiles in the wall.
- **Action Buttons**: Context-sensitive buttons for Chow, Pong, Kong, Win, Pass (appear only when applicable).
- **Game Info Panel**: Room code, current player positions, current round/dealer, fan/score totals.
- **Responsiveness**: Optimized for mobile portrait orientation; usable on phones 5"–6.5" and tablets.
- **Accessibility**: Buttons and tiles must be easy to tap; text must be readable without squinting.

### 2.8 Real-Time Multiplayer

- **WebSocket Communication**: All clients connect to a Cloudflare Durable Object via WebSocket.
- **State Synchronization**: All players see the same authoritative game state.
- **Server Validation**: Every player action (draw, discard, claim, win) is validated on the server.
- **Turn Enforcement**: Only the active player can draw/discard; only eligible players can claim.
- **Concealed Hand Privacy**: Player's concealed tiles are never sent to other clients.
- **Broadcast**: Valid state changes are broadcast to all connected players in the room.
- **Reconnection**: A player can reconnect within a timeout window (default 5 minutes); their hand and seat are preserved.
- **Consistency**: No race conditions or conflicting actions should occur.

### 2.9 Score Tracking

- **Settlement Calculation**: After a win or draw, fan points are converted to monetary settlement (or point settlement).
- **Cumulative Score**: Track running total scores for each player throughout the session.
- **Score Display**: Scores are visible to all players at all times.
- **Result Notification**: Clear notification of who won, the winning hand pattern, fan count, and payment amounts.

### 2.10 Error Handling

- **Invalid Moves**: Client attempts invalid moves (e.g., chow on wrong player's discard, illegal tile combination).
  - Server rejects the move and sends an error message to the client.
  - No state change occurs.
- **Disconnection**: Player's connection drops during gameplay.
  - Seat remains reserved; room timer keeps the seat for 5 minutes.
  - Other players see "disconnected" status for that player.
  - If the player reconnects, they re-join the game in progress.
- **All Players Disconnected**: If all players disconnect, the room is cleaned up after a timeout.
- **Network Latency**: Actions from a single player may be delayed; server processes all actions in sequence.

## 3. Non-Functional Requirements

### 3.1 Performance

- **Tile Dealing**: Wall shuffle and initial dealing completes in < 1 second.
- **State Broadcast**: Player action → server processing → broadcast to all clients < 500 ms.
- **Responsiveness**: UI remains responsive during tile animations and state updates.

### 3.2 Reliability

- **Uptime**: Game rooms remain available for the duration of play (no sudden room termination).
- **Data Consistency**: No lost or corrupted game state; all moves are recorded in sequence.
- **Recovery**: Player reconnects to the same game state in progress.

### 3.3 Security

- **Player Isolation**: No player can modify another player's concealed hand or scores.
- **Server Authority**: All game logic and validation resides on the backend; frontend cannot alter game state.
- **Message Validation**: Invalid or malformed WebSocket messages are rejected.
- **No Authentication Overhead**: Minimal security layer (room code + session ID) suitable for casual play; not suitable for money wagering.

### 3.4 Deployment

- **GitHub Pages**: Frontend hosted on GitHub Pages.
- **Cloudflare Workers**: Backend and Durable Objects hosted on Cloudflare (free tier).
- **No Database**: Game state is transient; when a room ends, state is discarded (unless explicitly saved).

### 3.5 Accessibility

- **WCAG 2.1 Level AA**: Aim for AA compliance (full validation requires manual testing with assistive technologies).
- **Color Contrast**: Tiles and text meet WCAG contrast ratios.
- **Keyboard Navigation**: All controls accessible via keyboard (not just touch).
- **Screen Reader Support**: Game state readable by screen readers (may be limited for tile-based game).

## 4. Out of Scope

- **User Accounts**: No persistent player accounts, registration, or login.
- **Ranking Systems**: No leaderboards or player ratings.
- **Replay**: No game replay or move history download.
- **Chat**: No in-game messaging between players.
- **Avatars**: No player avatars; only alias names.
- **Money Wagering**: No real-money payments or integration with payment processors.
- **Mobile Apps**: No native iOS or Android apps; web-only.
- **Single-Player Mode**: No AI opponents or single-player practice mode.
- **Custom Tile Graphics**: Standard tile designs only; no custom themes or skins.

## 5. Assumptions and Clarifications

### 5.1 Hong Kong Mahjong Rule Set

Hong Kong Mahjong has regional variations and house rules. For this project:

1. **Winning Requirement**: A valid winning hand is 4 melds (Chow, Pong, Kong) + 1 pair (default minimum 1 fan).
2. **Flower/Season Scoring**: Each flower tile in hand = 1 fan; each season tile = 1 fan (additive).
3. **Pong Value**: A Pong (exposed triplet) = 1 fan.
4. **Kong Value**: 
   - Concealed Kong (drawn, not claimed) = 2 fan.
   - Exposed Kong (claimed from discard or declared on hand) = 1 fan.
5. **Chow Value**: No fan (worth 0 fan, but required for winning hand structure).
6. **All Simples (清): All tiles in hand are 2–8 (no terminals, no honors) = 2 fan.
7. **All Terminals and Honors (雜牌)**: At least one terminal or honor in each meld = 1 fan.
8. **Dealer Multiplier**: If the dealer wins, all losers pay double. If the dealer loses, dealer pays double to the winner.
9. **Turn Order**: Dealer stays dealer if they win; rotates clockwise (next player) if they lose.
10. **Competing Claims**: If multiple players can claim a discard:
    - Win claim takes priority.
    - Kong claim takes priority over Pong or Chow.
    - Pong takes priority over Chow.
    - If same priority, the first player clockwise from the discarder wins.
11. **Draw Game**: If wall is empty and no player has won, all players draw (平手, no payments).
12. **Minimum Fan**: Default 1 fan required to win (can be relaxed to 0 for open play, or raised to 3+ for competitive).

**These assumptions are provisional and should be confirmed with the user before implementation.**

### 5.2 Frontend Hosting

- GitHub Pages will host the static HTML, CSS, and JavaScript frontend.
- The frontend is a single-page application (SPA) that communicates with Cloudflare Workers via WebSocket.
- GitHub Pages does not host backend code or WebSocket servers.

### 5.3 Backend Hosting

- Cloudflare Workers will host a WebSocket endpoint.
- Cloudflare Durable Objects will maintain game room state (one Durable Object per game room).
- Durable Objects are automatically persistent within Cloudflare's data centers (no external database needed).
- The free tier of Cloudflare provides sufficient quota for small playtest sessions.

### 5.4 Real-Time Multiplayer

- All four players must connect to the same WebSocket server and Durable Object.
- The Durable Object is the source of truth for game state.
- Players send commands (draw, discard, claim, etc.) to the Durable Object.
- The Durable Object validates the command and broadcasts valid state changes to all players.

### 5.5 Client-Side Rendering

- The frontend is a single-page app (SPA) built with vanilla JavaScript, React, or a lightweight framework (decision to be made during design).
- No backend rendering (SSR) is required.

## 6. Success Criteria

1. **Four players can join a room**: Players enter alias, receive room code, see all four seats filled.
2. **Game plays to completion**: Tiles are dealt, players draw and discard, a winner is determined (or all-pass).
3. **Winning is validated correctly**: Winning hand pattern is checked; fan count and settlement are calculated.
4. **Real-time state sync**: All players see the same hand state, discard history, and scores.
5. **Reconnection works**: A disconnected player can rejoin within 5 minutes and resume gameplay.
6. **Mobile UI is usable**: Tiles and buttons are easily tappable on a 5" phone screen.
7. **No server setup required**: Player runs frontend on phone/desktop browser; Cloudflare backend is live.
8. **Security is enforced**: A player cannot see another's concealed hand or modify another's tiles.

## 7. Open Questions and Decisions Needed

1. **Which specific Hong Kong Mahjong rules should we implement?**
   - Dealer rotation (rotate after loss vs. after round)?
   - Payout model (full vs. half settlement)?
   - Are there additional special hand patterns required?

2. **Should the game support multiple concurrent rounds in a room, or one round at a time?**
   - For this demo, assume one round per room; room ends when players decide.

3. **How long should disconnected players be reserved (default 5 minutes)?**
   - Should it be configurable or hardcoded?

4. **Should game history or statistics be displayed after a round ends?**
   - For this demo, assume yes (simple summary: winner, fan, payments).

5. **Should there be a time limit per player's turn?**
   - For this demo, assume no time limit (casual play).

6. **What visual style and color scheme for the tiles?**
   - For this demo, use a simple, clean design inspired by traditional Hong Kong mahjong.

7. **Should the frontend be built with React, Vue, vanilla JavaScript, or another framework?**
   - Decision to be made during design phase based on complexity and developer preference.

---

**Document Version**: 1.0  
**Status**: Draft – Awaiting User Review and Rule Clarification  
**Last Updated**: [Timestamp]
