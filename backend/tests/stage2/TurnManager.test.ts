/**
 * Turn Manager Tests
 * Tests turn flow logic, draw/discard, and claim resolution
 */

import { TurnManager, Claim } from '../../src/game/TurnManager';
import { GameState, GamePhase, PlayerAction, createGameState } from '../../src/models/GameState';
import { createNumberTile } from '../../src/models/Tile';
import { TileSuit } from '../../src/models/Tile';

describe('Turn Manager - Turn Flow', () => {
  let state: GameState;

  beforeEach(() => {
    state = createGameState('room1', 'East');
    // Give all players some tiles
    for (const position of ['East', 'South', 'West', 'North'] as const) {
      state.players[position].hand = Array.from({ length: 13 }, (_, i) =>
        createNumberTile(TileSuit.CHARACTER, (i % 9) + 1, (i % 4) + 1)
      );
    }
    state.phase = GamePhase.WAITING_FOR_DRAW;
    state.currentPlayer = 'East';
  });

  describe('startTurn', () => {
    test('should set phase to WAITING_FOR_DRAW', () => {
      TurnManager.startTurn(state, 'South');
      expect(state.phase).toBe(GamePhase.WAITING_FOR_DRAW);
    });

    test('should set current player', () => {
      TurnManager.startTurn(state, 'South');
      expect(state.currentPlayer).toBe('South');
    });

    test('should mark player as current', () => {
      TurnManager.startTurn(state, 'South');
      expect(state.players['South'].isCurrentPlayer).toBe(true);
    });

    test('should reset previous player turn flags', () => {
      state.players['East'].isCurrentPlayer = true;
      state.players['East'].hasDrawn = true;
      state.players['East'].hasDiscarded = true;

      TurnManager.startTurn(state, 'South');

      expect(state.players['East'].isCurrentPlayer).toBe(false);
      expect(state.players['East'].hasDrawn).toBe(false);
      expect(state.players['East'].hasDiscarded).toBe(false);
    });

    test('should clear hasDrawn and hasDiscarded for new turn', () => {
      state.players['South'].hasDrawn = true;
      state.players['South'].hasDiscarded = true;

      TurnManager.startTurn(state, 'South');

      expect(state.players['South'].hasDrawn).toBe(false);
      expect(state.players['South'].hasDiscarded).toBe(false);
    });
  });

  describe('handleDraw', () => {
    beforeEach(() => {
      TurnManager.startTurn(state, 'East');
    });

    test('should add tile to player hand', () => {
      const tile = createNumberTile(TileSuit.CHARACTER, 1, 1);
      const initialCount = state.players['East'].hand.length;

      TurnManager.handleDraw(state, 'East', tile);

      expect(state.players['East'].hand.length).toBe(initialCount + 1);
      expect(state.players['East'].hand[initialCount]).toEqual(tile);
    });

    test('should set hasDrawn flag', () => {
      const tile = createNumberTile(TileSuit.CHARACTER, 1, 1);
      TurnManager.handleDraw(state, 'East', tile);
      expect(state.players['East'].hasDrawn).toBe(true);
    });

    test('should move to WAITING_FOR_DISCARD phase', () => {
      const tile = createNumberTile(TileSuit.CHARACTER, 1, 1);
      TurnManager.handleDraw(state, 'East', tile);
      expect(state.phase).toBe(GamePhase.WAITING_FOR_DISCARD);
    });

    test('should fail if not current player', () => {
      const tile = createNumberTile(TileSuit.CHARACTER, 1, 1);
      const result = TurnManager.handleDraw(state, 'South', tile);
      expect(result).toBe(false);
    });

    test('should fail if already drawn', () => {
      const tile = createNumberTile(TileSuit.CHARACTER, 1, 1);
      TurnManager.handleDraw(state, 'East', tile);
      
      const tile2 = createNumberTile(TileSuit.CHARACTER, 2, 1);
      const result = TurnManager.handleDraw(state, 'East', tile2);
      
      expect(result).toBe(false);
    });

    test('should fail if phase is not WAITING_FOR_DRAW', () => {
      state.phase = GamePhase.WAITING_FOR_DISCARD;
      const tile = createNumberTile(TileSuit.CHARACTER, 1, 1);
      const result = TurnManager.handleDraw(state, 'East', tile);
      expect(result).toBe(false);
    });
  });

  describe('handleDiscard', () => {
    beforeEach(() => {
      TurnManager.startTurn(state, 'East');
      const tile = createNumberTile(TileSuit.CHARACTER, 1, 1);
      TurnManager.handleDraw(state, 'East', tile);
    });

    test('should remove tile from hand', () => {
      const tile = state.players['East'].hand[0];
      const initialCount = state.players['East'].hand.length;

      TurnManager.handleDiscard(state, 'East', tile);

      expect(state.players['East'].hand.length).toBe(initialCount - 1);
    });

    test('should add tile to discards', () => {
      const tile = state.players['East'].hand[0];
      TurnManager.handleDiscard(state, 'East', tile);
      expect(state.players['East'].discards.length).toBe(1);
      expect(state.players['East'].discards[0]).toEqual(tile);
    });

    test('should set hasDiscarded flag', () => {
      const tile = state.players['East'].hand[0];
      TurnManager.handleDiscard(state, 'East', tile);
      expect(state.players['East'].hasDiscarded).toBe(true);
    });

    test('should move to CLAIM_WINDOW phase', () => {
      const tile = state.players['East'].hand[0];
      TurnManager.handleDiscard(state, 'East', tile);
      expect(state.phase).toBe(GamePhase.CLAIM_WINDOW);
    });

    test('should record as lastDiscard', () => {
      const tile = state.players['East'].hand[0];
      TurnManager.handleDiscard(state, 'East', tile);
      expect(state.lastDiscard).toBeDefined();
      expect(state.lastDiscard?.tile).toEqual(tile);
      expect(state.lastDiscard?.fromPosition).toBe('East');
    });

    test('should fail if not current player', () => {
      const tile = state.players['East'].hand[0];
      const result = TurnManager.handleDiscard(state, 'South', tile);
      expect(result).toBe(false);
    });

    test('should fail if not drawn yet', () => {
      TurnManager.startTurn(state, 'East');
      const tile = state.players['East'].hand[0];
      const result = TurnManager.handleDiscard(state, 'East', tile);
      expect(result).toBe(false);
    });

    test('should fail if already discarded', () => {
      const tile1 = state.players['East'].hand[0];
      TurnManager.handleDiscard(state, 'East', tile1);

      // Reset state to re-draw for another discard attempt
      state.phase = GamePhase.WAITING_FOR_DISCARD;
      const tile2 = state.players['East'].hand[0];
      const result = TurnManager.handleDiscard(state, 'East', tile2);
      expect(result).toBe(false);
    });

    test('should fail if tile not in hand', () => {
      const tilNotInHand = createNumberTile(TileSuit.BAMBOO, 1, 1);
      const result = TurnManager.handleDiscard(state, 'East', tilNotInHand);
      expect(result).toBe(false);
    });
  });

  describe('endTurn', () => {
    test('should increment discardRound', () => {
      const initial = state.discardRound;
      TurnManager.endTurn(state);
      expect(state.discardRound).toBe(initial + 1);
    });

    test('should move to next player', () => {
      state.currentPlayer = 'East';
      TurnManager.endTurn(state);
      expect(state.currentPlayer).toBe('South');
    });

    test('should set phase to WAITING_FOR_DRAW for next player', () => {
      TurnManager.endTurn(state);
      expect(state.phase).toBe(GamePhase.WAITING_FOR_DRAW);
    });

    test('should cycle through all 4 players', () => {
      TurnManager.endTurn(state); // South
      expect(state.currentPlayer).toBe('South');
      
      TurnManager.endTurn(state); // West
      expect(state.currentPlayer).toBe('West');
      
      TurnManager.endTurn(state); // North
      expect(state.currentPlayer).toBe('North');
      
      TurnManager.endTurn(state); // Back to East
      expect(state.currentPlayer).toBe('East');
    });
  });
});

describe('Turn Manager - Claim Resolution', () => {
  let state: GameState;

  beforeEach(() => {
    state = createGameState('room1', 'East');
    for (const position of ['East', 'South', 'West', 'North'] as const) {
      state.players[position].hand = Array.from({ length: 13 }, (_, i) =>
        createNumberTile(TileSuit.CHARACTER, (i % 9) + 1, (i % 4) + 1)
      );
    }
    state.phase = GamePhase.CLAIM_WINDOW;
    state.currentPlayer = 'East';
    const tile = createNumberTile(TileSuit.CHARACTER, 5, 1);
    state.lastDiscard = {
      tile,
      fromPosition: 'East',
      timestamp: Date.now()
    };
  });

  describe('handleClaim', () => {
    test('should record claim with correct priority for CLAIM_WIN', () => {
      const claim = TurnManager.handleClaim(state, 'South', PlayerAction.CLAIM_WIN);
      expect(claim.claimedBy).toBe('South');
      expect(claim.claimType).toBe(PlayerAction.CLAIM_WIN);
      expect(claim.priority).toBe(4);
    });

    test('should record claim with correct priority for CLAIM_KONG', () => {
      const claim = TurnManager.handleClaim(state, 'South', PlayerAction.CLAIM_KONG);
      expect(claim.priority).toBe(3);
    });

    test('should record claim with correct priority for CLAIM_PONG', () => {
      const claim = TurnManager.handleClaim(state, 'South', PlayerAction.CLAIM_PONG);
      expect(claim.priority).toBe(2);
    });

    test('should record claim with correct priority for CLAIM_CHOW', () => {
      const claim = TurnManager.handleClaim(state, 'South', PlayerAction.CLAIM_CHOW);
      expect(claim.priority).toBe(1);
    });

    test('should record claim with priority 0 for PASS', () => {
      const claim = TurnManager.handleClaim(state, 'South', PlayerAction.PASS);
      expect(claim.priority).toBe(0);
    });
  });

  describe('resolveClaimConflict', () => {
    test('should select highest priority claim', () => {
      const claims: Claim[] = [
        { claimedBy: 'South', claimType: PlayerAction.CLAIM_CHOW, priority: 1 },
        { claimedBy: 'West', claimType: PlayerAction.CLAIM_PONG, priority: 2 },
        { claimedBy: 'North', claimType: PlayerAction.CLAIM_WIN, priority: 4 }
      ];

      const winner = TurnManager.resolveClaimConflict(claims);
      expect(winner?.claimedBy).toBe('North');
      expect(winner?.priority).toBe(4);
    });

    test('should return null for empty claims', () => {
      const winner = TurnManager.resolveClaimConflict([]);
      expect(winner).toBeNull();
    });

    test('should select first claim if priorities tied', () => {
      const claims: Claim[] = [
        { claimedBy: 'South', claimType: PlayerAction.CLAIM_PONG, priority: 2 },
        { claimedBy: 'West', claimType: PlayerAction.CLAIM_PONG, priority: 2 }
      ];

      const winner = TurnManager.resolveClaimConflict(claims);
      expect(winner?.claimedBy).toBe('South');
    });

    test('should work with single claim', () => {
      const claims: Claim[] = [
        { claimedBy: 'South', claimType: PlayerAction.CLAIM_PONG, priority: 2 }
      ];

      const winner = TurnManager.resolveClaimConflict(claims);
      expect(winner?.claimedBy).toBe('South');
      expect(winner?.priority).toBe(2);
    });
  });
});

describe('Turn Manager - Game End Detection', () => {
  let state: GameState;

  beforeEach(() => {
    state = createGameState('room1', 'East');
    for (const position of ['East', 'South', 'West', 'North'] as const) {
      state.players[position].hand = Array.from({ length: 13 }, (_, i) =>
        createNumberTile(TileSuit.CHARACTER, (i % 9) + 1, (i % 4) + 1)
      );
    }
  });

  describe('isWallExhausted', () => {
    test('should return false when wall has tiles', () => {
      state.wallTilesRemaining = 50;
      state.kongReplacementsRemaining = 4;
      expect(TurnManager.isWallExhausted(state)).toBe(false);
    });

    test('should return true when no tiles and no kong replacements', () => {
      state.wallTilesRemaining = 0;
      state.kongReplacementsRemaining = 0;
      expect(TurnManager.isWallExhausted(state)).toBe(true);
    });

    test('should return false when kong replacements available', () => {
      state.wallTilesRemaining = 0;
      state.kongReplacementsRemaining = 2;
      expect(TurnManager.isWallExhausted(state)).toBe(false);
    });
  });

  describe('checkGameOver', () => {
    test('should set phase to GAME_OVER when wall exhausted', () => {
      state.wallTilesRemaining = 0;
      state.kongReplacementsRemaining = 0;
      const result = TurnManager.checkGameOver(state);
      expect(result).toBe(true);
      expect(state.phase).toBe(GamePhase.GAME_OVER);
    });

    test('should return false when wall has tiles', () => {
      state.wallTilesRemaining = 50;
      state.kongReplacementsRemaining = 4;
      const result = TurnManager.checkGameOver(state);
      expect(result).toBe(false);
      expect(state.phase).not.toBe(GamePhase.GAME_OVER);
    });
  });
});

describe('Turn Manager - Claim Window', () => {
  let state: GameState;

  beforeEach(() => {
    state = createGameState('room1', 'East');
    for (const position of ['East', 'South', 'West', 'North'] as const) {
      state.players[position].hand = Array.from({ length: 13 }, (_, i) =>
        createNumberTile(TileSuit.CHARACTER, (i % 9) + 1, (i % 4) + 1)
      );
      state.players[position].isConnected = true;
    }
    state.phase = GamePhase.CLAIM_WINDOW;
    state.currentPlayer = 'East';
  });

  describe('getPlayersAwaitingClaim', () => {
    test('should return other players in claim window', () => {
      const players = TurnManager.getPlayersAwaitingClaim(state);
      expect(players.length).toBe(3);
      expect(players.map(p => p.position)).not.toContain('East');
    });

    test('should exclude disconnected players', () => {
      state.players['South'].isConnected = false;
      const players = TurnManager.getPlayersAwaitingClaim(state);
      expect(players.length).toBe(2);
      expect(players.map(p => p.position)).toContain('West');
      expect(players.map(p => p.position)).toContain('North');
    });

    test('should return empty array when not in claim window', () => {
      state.phase = GamePhase.WAITING_FOR_DRAW;
      const players = TurnManager.getPlayersAwaitingClaim(state);
      expect(players.length).toBe(0);
    });

    test('should exclude current player', () => {
      const players = TurnManager.getPlayersAwaitingClaim(state);
      expect(players.every(p => p.position !== state.currentPlayer)).toBe(true);
    });
  });

  describe('getValidClaimsForDiscard', () => {
    beforeEach(() => {
      state.lastDiscard = {
        tile: createNumberTile(TileSuit.CHARACTER, 5, 1),
        fromPosition: 'East',
        timestamp: Date.now()
      };
    });

    test('should always include PASS', () => {
      const claims = TurnManager.getValidClaimsForDiscard(state, 'South');
      expect(claims).toContain(PlayerAction.PASS);
    });

    test('should include CLAIM_PONG if player has 2 matching tiles', () => {
      // Give South two 5-character tiles
      state.players['South'].hand = [
        createNumberTile(TileSuit.CHARACTER, 5, 1),
        createNumberTile(TileSuit.CHARACTER, 5, 2),
        createNumberTile(TileSuit.CHARACTER, 1, 1)
      ];

      const claims = TurnManager.getValidClaimsForDiscard(state, 'South');
      expect(claims).toContain(PlayerAction.CLAIM_PONG);
    });

    test('should include CLAIM_KONG if player has 3 matching tiles', () => {
      // Give South three 5-character tiles
      state.players['South'].hand = [
        createNumberTile(TileSuit.CHARACTER, 5, 1),
        createNumberTile(TileSuit.CHARACTER, 5, 2),
        createNumberTile(TileSuit.CHARACTER, 5, 3)
      ];

      const claims = TurnManager.getValidClaimsForDiscard(state, 'South');
      expect(claims).toContain(PlayerAction.CLAIM_KONG);
    });

    test('should not include CLAIM_PONG if player lacks matching tiles', () => {
      state.players['South'].hand = [
        createNumberTile(TileSuit.CHARACTER, 1, 1),
        createNumberTile(TileSuit.CHARACTER, 2, 1),
        createNumberTile(TileSuit.CHARACTER, 3, 1)
      ];

      const claims = TurnManager.getValidClaimsForDiscard(state, 'South');
      expect(claims).not.toContain(PlayerAction.CLAIM_PONG);
    });
  });
});
