# Hong Kong Mahjong Spec Review

## Overview

This document summarizes the specification created for the Four-Player Hong Kong Mahjong game and highlights key assumptions, decisions, and questions that require user review and confirmation before implementation begins.

---

## 1. Architecture Summary

### The Three-Layer Design

1. **Frontend (GitHub Pages)**: Browser-based SPA with vanilla TypeScript/JavaScript. No backend server; static hosting only.
2. **Backend (Cloudflare Workers)**: WebSocket endpoint that routes to Durable Objects.
3. **Game State (Cloudflare Durable Objects)**: One Durable Object per game room, maintaining authoritative game state and validating all moves.

**Why This Design?**
- No AWS or server hosting required.
- Leverages free-tier Cloudflare services.
- Frontend and backend are cleanly separated (security and scalability).
- Durable Objects provide built-in WebSocket support and persistent state per room.
- Suitable for casual multiplayer without complex infrastructure.

---

## 2. Key Decisions Made

### 2.1 Tile Set (Immutable)

**Decision**: Use standard Hong Kong Mahjong tile set (144 tiles).
- 36 character (万), 36 bamboo (筒), 36 circle (索).
- 16 wind (風: East, South, West, North).
- 12 dragon (龍: Red, Green, White).
- 8 flower/season (花季: Plum, Orchid, Bamboo, Chrysanthemum, Spring, Summer, Autumn, Winter).

**Rationale**: Standard tile set is universally recognized and simplifies game logic. No custom or variant tile sets.

---

### 2.2 Player Count (Fixed at 4)

**Decision**: Exactly 4 human players per game room. No AI, no 3-player or 2-player variants.

**Rationale**: Simplifies turn logic, meld rules (e.g., chow only available from specific player), and scoring calculations. Hong Kong Mahjong is designed for 4 players.

---

### 2.3 Room Model (Ephemeral)

**Decision**: Game rooms are **ephemeral** (temporary). When all players leave or a game ends, the room is discarded.

**Rationale**: No database or persistent storage required. Simplifies deployment and reduces complexity. Suitable for casual demo.

**Trade-off**: Players cannot resume a game later or view historical results. If persistent statistics are needed, this would require a database and a rethink.

---

### 2.4 Security Model (Lightweight)

**Decision**: No user accounts or real authentication. Each player is identified by:
- **Room code** (shared, public, 6-8 alphanumeric characters).
- **Player ID** (unique per session, assigned by server, not exposed to user).
- **Alias** (human-readable name, self-chosen, unverified).

**Rationale**: Minimizes server complexity and eliminates account management. Suitable for casual, trusted group play.

**Trade-off**: Not suitable for money wagering or competitive ranked play. No replay of disputes.

---

### 2.5 Frontend Framework (Vanilla JavaScript/TypeScript)

**Decision**: Build frontend with **vanilla TypeScript**, compiled to JavaScript. No React, Vue, or other framework.

**Rationale**: Keeps bundle size small (important for GitHub Pages performance). Simpler deployment (no build pipeline beyond TypeScript → JavaScript). Easier to demonstrate architecture (no framework magic).

**Trade-off**: Manual DOM manipulation is more verbose than React. May be harder to scale if features grow significantly.

---

### 2.6 State Synchronization (Frontend is a "Dumb Terminal")

**Decision**: The frontend is a **read-only mirror** of the server state. All game logic runs on the backend; the frontend only:
- Renders the state.
- Sends player commands (draw, discard, claim, win).
- Never modifies state locally.

**Rationale**: Eliminates cheating (player cannot modify their hand or see opponent's tiles). Ensures consistency across all clients.

**Consequence**: Network latency means the frontend briefly shows stale state; the server is the source of truth.

---

### 2.7 Flower/Season Tile Handling

**Decision**: Flower and season tiles are:
1. **Immediately replaced** when drawn or dealt (player draws again from wall).
2. **Automatically set aside** in a "flower pile" (not part of concealed hand).
3. **Scored automatically** (1 fan per flower, 1 fan per season, no player choice).

**Rationale**: Simplifies hand logic and aligns with standard Hong Kong Mahjong rules. Flowers are not playable tiles; they are bonus points.

---

### 2.8 Disconnection Timeout (5 minutes)

**Decision**: If a player disconnects, their seat is reserved for 5 minutes. If they reconnect within 5 minutes, they rejoin the game. After 5 minutes, the player is removed.

**Rationale**: Balances reliability (brief network hiccup doesn't end the game) with not letting a room "hang" waiting for a player who is permanently offline.

**Configurable?** Yes (could be parameterized), but hardcoded to 5 minutes for the initial demo.

---

## 3. Critical Assumptions About Hong Kong Mahjong Rules

The specification assumes the following rules. **These must be confirmed with the user.**

### 3.1 Winning Hand Structure

**Assumption**: A valid winning hand is:
- **4 melds + 1 pair**, where a meld is a Chow (3 consecutive tiles of same suit), Pong (triplet), or Kong (quadruplet).

**Question**: Are there other valid winning structures (e.g., 7 pairs, 13 terminals, etc.)? If so, they must be added to the `WinningPatterns.ts` module.

---

### 3.2 Minimum Fan to Win

**Assumption**: A player must have at least **1 fan** to declare a win. A 0-fan hand (4 melds + 1 pair with no bonuses) is invalid.

**Question**: Should the minimum be 1 fan, 0 fan (any valid structure), or 3 fan (more competitive)?

---

### 3.3 Fan Values (Default Configuration)

Assumed fan values:
- Pong (exposed triplet): **1 fan**.
- Kong (concealed, from draw): **2 fan**.
- Kong (exposed, from discard or declared): **1 fan**.
- Flower tile: **1 fan per tile**.
- Season tile: **1 fan per tile**.
- All Simples (2–8, no terminals/honors): **2 fan**.
- All Terminals and Honors (honors or terminals in every meld): **1 fan**.

**Questions**:
1. Are these values correct for your group's rules?
2. Are there other scoring patterns (e.g., all one suit, all triplets, mixed melds) that should be scored?
3. Should the "self-draw win" (Tsumo) receive a fan bonus? (Assumed NO in current spec, but varies by region.)

---

### 3.4 Dealer Multiplier

**Assumption**:
- If the **dealer wins**, all losers pay the winner **2× fan value**.
- If the **dealer loses**, the dealer pays the winner **2× fan value**; non-dealer losers pay 1× fan value.
- If a **non-dealer wins**, each loser pays 1× fan value.

**Question**: Is this the correct dealer multiplier for your group? Some regions use "dealer pays double on win, normal on loss" or "dealer receives double on win, pays double on loss."

---

### 3.5 Dealer Rotation

**Assumption**:
- After a round, if the dealer won, they remain dealer.
- If the dealer lost, the dealer rotates clockwise (next player).

**Question**: Is this correct? Some regions have the dealer rotate after every round, regardless of win/loss.

---

### 3.6 Competing Claims

**Assumption**: If multiple players can claim the same discarded tile, priority is:
1. **Win claim** (highest priority).
2. **Kong claim**.
3. **Pong claim**.
4. **Chow claim** (lowest priority).
5. If same priority type, the player **clockwise closest to the discarder** wins the claim.

**Question**: Is this the correct priority order?

---

### 3.7 Chow Eligibility

**Assumption**: A player can only Chow on the discard of the player **directly clockwise before them** (i.e., the player to their right).
- East can chow on South's discard.
- South can chow on West's discard.
- West can chow on North's discard.
- North can chow on East's discard.

**Question**: Is this the correct chow eligibility rule?

---

### 3.8 Payment Model

**Assumption**: Full settlement. If a player wins with 2 fan:
- Dealer wins by 2 fan: Each loser pays 2 (or 4 if dealer multiplier applies).
- Non-dealer wins by 2 fan: Each loser pays 2.

**Question**: Should it be full settlement, half settlement, or a different model?

---

### 3.9 Draw Game (All-Pass)

**Assumption**: If the wall is exhausted and no player has won, the game is a **draw** (平手). No payments are made; scores remain unchanged.

**Question**: Is this correct? Should players draw if no one has won and the wall is empty?

---

## 4. Open Design Questions

### 4.1 Minimum Fan to Win (User Decision)

The spec assumes **1 fan minimum**, but this can be configured:
- **0 fan**: Any valid hand structure wins (most permissive, quickest games).
- **1 fan**: Valid structure + at least 1 bonus point (default assumption).
- **3 fan**: Competitive level; forces more strategic play.

**User should decide**: What minimum fan is appropriate for your play group?

---

### 4.2 Multiple Rounds vs. Single Game

**Assumption**: One round per room. The game ends when a player wins or the wall is exhausted. Players can then start a new room.

**Question**: Should a room support multiple rounds (e.g., best-of-5 rounds, rotating dealer)? This adds complexity but allows longer sessions.

For this demo, assume **one round per room** (simpler).

---

### 4.3 Turn Time Limit

**Assumption**: No time limit per turn. A player can take as long as needed to decide their move.

**Question**: Should there be a time limit (e.g., 60 seconds) per turn? This adds urgency but may frustrate players on slow networks.

For this demo, assume **no time limit**.

---

### 4.4 Tile Graphics Style

**Assumption**: Simple, clean tile design inspired by traditional Hong Kong mahjong. Color-coded by suit. Clear rank/name labeling.

**Question**: Do you have preferred tile graphics, or should we use a simple custom design?

For this demo, assume **simple custom design** (no licensed graphics).

---

### 4.5 Score Persistence

**Assumption**: Scores are ephemeral (discarded when the room ends).

**Question**: Should scores be saved to a database? Should there be a leaderboard?

For this demo, assume **no persistence** (simplicity).

---

## 5. Validation and Security Concerns

### 5.1 Cheating Prevention

**Design ensures**:
- Player cannot see opponent's concealed tiles.
- Player cannot modify their own hand after discard.
- All moves are validated on the server.
- No move can be applied without server approval.

**Remaining risks** (acceptable for casual play):
- A player could spam invalid actions to disrupt gameplay (DoS). Mitigation: Rate-limiting on server.
- A malicious client could attempt to send a crafted WebSocket message. Mitigation: Server validates all messages.

---

### 5.2 Race Conditions

**Design ensures**:
- The Durable Object is single-threaded (WebSocket messages are processed sequentially).
- No concurrent state modifications.
- All actions are timestamped and sequenced.

---

### 5.3 State Consistency

**Design ensures**:
- Server is the source of truth.
- Frontend mirrors server state but never diverges.
- All players see the same state (within network latency).

---

## 6. Implementation Complexity Assessment

### 6.1 Rules Engine (Highest Complexity)

**Tasks**:
- Recognize valid tile combinations (Chows, Pongs, Kongs).
- Validate winning hand structures.
- Calculate fan for various hand patterns.
- Handle special cases (flowers, kongs, self-draw vs. discard).

**Estimate**: 2–3 days.

**Mitigation**: Start with simple patterns (4 melds + 1 pair); add special patterns incrementally.

---

### 6.2 WebSocket Multiplayer (High Complexity)

**Tasks**:
- WebSocket server and Durable Object lifecycle.
- Message routing and broadcasting.
- Handling disconnections and reconnections.
- Ensuring state consistency across all clients.

**Estimate**: 2–3 days.

**Mitigation**: Use Cloudflare Durable Objects' built-in WebSocket support (abstraction layer already exists).

---

### 6.3 Frontend UI (Medium Complexity)

**Tasks**:
- Responsive mobile UI.
- Tile rendering and selection.
- Game state rendering (opponents, discards, wall, melds).
- Action buttons and context-sensitivity.

**Estimate**: 2 days.

**Mitigation**: Keep UI simple (no animations, no polished graphics initially).

---

### 6.4 Error Handling and Reconnection (Medium Complexity)

**Tasks**:
- Detecting disconnections.
- Tracking disconnected players and timeouts.
- Restoring state on reconnection.
- Validating all WebSocket messages.

**Estimate**: 1–2 days.

**Mitigation**: Use standard patterns (heartbeat, session IDs, deduplication).

---

## 7. Deployment Checklist

### 7.1 Frontend Deployment (GitHub Pages)

- [ ] GitHub repository created (`major-demo`).
- [ ] Frontend code in `/frontend` directory.
- [ ] `npm run build` produces `/frontend/dist` (static files).
- [ ] GitHub Pages enabled, pointing to `/dist`.
- [ ] Domain is `https://<username>.github.io/major-demo/`.

### 7.2 Backend Deployment (Cloudflare Workers)

- [ ] Cloudflare account created.
- [ ] Wrangler CLI installed and configured.
- [ ] `backend/wrangler.toml` configured with Durable Object bindings.
- [ ] Backend code in `/backend/src`.
- [ ] `wrangler publish` deploys to Cloudflare.
- [ ] WebSocket endpoint is live at `wss://<worker>.workers.dev/ws`.

### 7.3 Integration

- [ ] Frontend `index.html` correctly constructs WebSocket URL.
- [ ] CORS or same-origin policy doesn't block WebSocket connection.
- [ ] Both frontend and backend are deployed and accessible from external networks.

---

## 8. Spec Review Checklist

Before implementation, please confirm:

### Game Rules
- [ ] **Winning hand structure**: 4 melds + 1 pair? Or other structures?
- [ ] **Minimum fan**: 1 fan, 0 fan, or 3+ fan?
- [ ] **Fan values**: Are the assumed values correct?
- [ ] **Dealer rules**: Rotation and multiplier correct?
- [ ] **Competing claims**: Priority order correct?
- [ ] **Chow eligibility**: Only from right neighbor?
- [ ] **Draw game**: Wall exhaustion results in 0 payment?
- [ ] **Any other special rules**: (e.g., eye-pair bonus, self-draw bonus, etc.)

### Scope and Deployment
- [ ] **Room model**: Ephemeral (no database) is acceptable?
- [ ] **Player count**: Always exactly 4 players?
- [ ] **Frontend hosting**: GitHub Pages is acceptable?
- [ ] **Backend hosting**: Cloudflare free tier is acceptable?
- [ ] **Security**: Lightweight room-code + session-ID authentication is acceptable?

### Configuration and Future Extensions
- [ ] **Rules engine**: Should it be extensible for future rule changes?
- [ ] **UI theme**: Any specific tile graphics or color scheme preferences?
- [ ] **Scoring persistence**: Is ephemeral (non-persistent) scoring acceptable for this demo?

---

## 9. Recommendations

### 9.1 Defer These to Post-MVP

- **Leaderboards and player statistics**: Add a database if needed later.
- **Tile themes and custom graphics**: Use simple design initially; upgrade later.
- **Game replay and history**: Requires persistent storage.
- **Time limits per turn**: Add if gameplay feels too slow.
- **Multiple rounds per room**: Implement after single-round version works.
- **3-player or 2-player variants**: Support 4-player first; add variants later.

### 9.2 Prioritize These for MVP

- **Clean, understandable game logic**: The rules engine must be correct and well-tested.
- **Reliable multiplayer**: WebSocket connections, reconnection, state sync.
- **Mobile-friendly UI**: Easy to tap on small screens; readable text.
- **Clear error messages**: When something goes wrong, tell the player why.
- **Documentation**: Comments in code, game rules in UI, deployment guide.

---

## 10. Next Steps

1. **Review and confirm this spec** with the user. Especially the rule assumptions (Section 3).
2. **Make final decisions** on open questions (Section 4).
3. **Create a GitHub repository** (`major-demo`) with the directory structure.
4. **Initialize project files**: `package.json`, `tsconfig.json`, `wrangler.toml`.
5. **Begin Stage 1 implementation**: Rules engine and tile model.

---

**Spec Version**: 1.0  
**Status**: Ready for User Review  
**Created**: [Timestamp]  
**Next Review**: After user confirms game rules and deployment model.
