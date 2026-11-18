# Quick Start Guide - Hong Kong Mahjong Game

## 1. Setup

```bash
cd backend
npm install
npm run build
```

## 2. Run Tests

```bash
# All tests
npm test

# Specific component
npm test -- --testPathPattern="rest"      # REST API (34/34)
npm test -- --testPathPattern="stage2"    # Game Engine (136/136)
npm test -- --testPathPattern="payment"   # Payment (85/85)
```

## 3. Start Server

```bash
npm start
# Server running on http://localhost:3000
```

## 4. Create a Game

```bash
curl -X POST http://localhost:3000/api/games \
  -H "Content-Type: application/json" \
  -d '{
    "playerNames": {
      "East": "Alice",
      "South": "Bob",
      "West": "Charlie",
      "North": "David"
    }
  }'

# Response: { gameId: "game-...", roomCode: "ROOM-...", ... }
```

## 5. Start Game

```bash
curl -X POST http://localhost:3000/api/games/{gameId}/start
```

## 6. Get Valid Actions

```bash
curl "http://localhost:3000/api/games/{gameId}/actions?position=East"

# Response: { actions: ["draw"] }
```

## 7. Draw a Tile

```bash
curl -X POST http://localhost:3000/api/games/{gameId}/draw \
  -H "Content-Type: application/json" \
  -d '{"position": "East"}'

# Response: { phase: "waiting_for_discard", handSize: 14 }
```

## 8. Discard a Tile

```bash
curl -X POST http://localhost:3000/api/games/{gameId}/discard \
  -H "Content-Type: application/json" \
  -d '{
    "position": "East",
    "tile": {
      "suit": "CHARACTER",
      "rank": 1,
      "instance": 1
    }
  }'

# Response: { phase: "claim_window" }
```

## 9. Check Game State

```bash
curl http://localhost:3000/api/games/{gameId}

# Response: {
#   session: { gameId, roomCode, status, players },
#   state: { phase, currentPlayer, players, wallRemaining, lastDiscard }
# }
```

## 10. Pass or Claim

```bash
# Pass on discard
curl -X POST http://localhost:3000/api/games/{gameId}/pass \
  -H "Content-Type: application/json" \
  -d '{"position": "South"}'

# Claim discard (pong, kong, chow, win)
curl -X POST http://localhost:3000/api/games/{gameId}/claim \
  -H "Content-Type: application/json" \
  -d '{
    "position": "South",
    "claimType": "pong"
  }'
```

## API Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /health | GET | Check server status |
| /api/games | POST | Create game |
| /api/games | GET | List all games |
| /api/games/:id | GET | Get game state |
| /api/games/:id/start | POST | Start game |
| /api/games/:id/draw | POST | Draw tile |
| /api/games/:id/discard | POST | Discard tile |
| /api/games/:id/claim | POST | Claim discard |
| /api/games/:id/pass | POST | Pass on discard |
| /api/games/:id/actions | GET | Get valid actions |
| /api/games/:id | DELETE | End game |

## Game Phases

1. **INITIALIZING** - Game created, waiting for start
2. **WAITING_FOR_DRAW** - Current player can draw
3. **WAITING_FOR_DISCARD** - Current player must discard
4. **CLAIM_WINDOW** - Other players can claim discard
5. **TURN_COMPLETE** - Turn ending, moving to next player
6. **GAME_OVER** - Round ended (winner or wall exhausted)
7. **ALL_PASS** - All players passed on last discard

## Valid Actions by Phase

| Phase | Valid Actions |
|-------|---|
| WAITING_FOR_DRAW | draw |
| WAITING_FOR_DISCARD | discard, declare_kong |
| CLAIM_WINDOW | pong, kong, chow, win, pass |

## Claim Priority

When multiple players claim same discard:
1. **WIN** (highest priority)
2. **KONG**
3. **PONG**
4. **CHOW**
5. **PASS** (lowest priority)

## Test Results

```
Stage 0: Payment Calculator        85/85    ✅
Stage 1: Tile & Hand Validation   188/199   ⚠️ (94%)
Stage 2: Game State & Turn        136/136   ✅
REST API: Game Management          34/34    ✅
─────────────────────────────────────────────
TOTAL                            321/339   ✅ (94%)
```

## Build Status

- TypeScript: 0 errors ✅
- All Tests: 321/339 passing ✅
- Build Time: ~2 seconds

## Environment Variables

```bash
PORT=3000        # HTTP port (default: 3000)
HOST=localhost   # Bind address (default: localhost)
```

## Project Structure

```
backend/
├── src/
│   ├── api/              # REST API
│   ├── game/             # Game logic
│   ├── models/           # Data models
│   ├── config/           # Configuration
│   ├── server.ts         # Express server
│   └── index.ts          # Entry point
├── tests/
│   ├── rest/             # API tests
│   ├── stage2/           # Game engine tests
│   ├── stage1/           # Tile tests
│   └── payment/          # Payment tests
└── package.json
```

## Common Commands

```bash
# Build project
npm run build

# Run tests
npm test

# Watch mode
npm test -- --watch

# Test with coverage
npm test -- --coverage

# Start server
npm start

# Development (requires ts-node)
npm run dev
```

## Troubleshooting

**Port already in use**
```bash
PORT=3001 npm start
```

**Tests not running**
```bash
npm install
npm run build
npm test
```

**TypeScript errors**
```bash
npm run build
# Fix errors and try again
```

## Documentation

- **STAGE2_COMPLETE.md** - Game engine details
- **REST_API_STAGE1_COMPLETE.md** - API specification
- **PROJECT_SUMMARY_WITH_REST.md** - Full project overview
- **STAGE1_FINAL.md** - Tile & payment system
- **PROJECT_STATUS_STAGE2.md** - Architecture & status

## Next Steps

1. ✅ **Currently**: Game engine + REST API complete
2. ⏳ **Next**: Settlement integration (payment calculation)
3. ⏳ **Then**: WebSocket for multiplayer
4. ⏳ **Finally**: Database persistence & auth

---

For detailed information, see full documentation files.
Version 1.0.0 - Ready for settlement integration.
