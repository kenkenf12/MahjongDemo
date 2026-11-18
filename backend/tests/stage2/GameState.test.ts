/**
 * Game State Tests - Stage 2.1
 *
 * Tests for:
 * - Game state initialization
 * - Player state management
 * - Game phase transitions
 * - Turn sequence
 */

import {
  GameState,
  GamePhase,
  PlayerState,
  Position,
  createPlayerState,
  createGameState,
  getNextPlayer,
  getOtherPlayers,
  getPlayer,
  hasValidHandSize,
  getTotalPlayerTiles,
  areAllPlayersConnected,
  isGameInPlay
} from '../../src/models/GameState';
import { createNumberTile, TileSuit } from '../../src/models/Tile';

describe('Game State - Initialization', () => {
  test('should create initial player state', () => {
    const player = createPlayerState('East', true);

    expect(player.position).toBe('East');
    expect(player.isDealer).toBe(true);
    expect(player.hand).toEqual([]);
    expect(player.melds).toEqual([]);
    expect(player.discards).toEqual([]);
    expect(player.bonusTiles).toEqual([]);
    expect(player.score).toBe(0);
    expect(player.isConnected).toBe(true);
    expect(player.isCurrentPlayer).toBe(false);
    expect(player.hasDrawn).toBe(false);
    expect(player.hasDiscarded).toBe(false);
  });

  test('should create initial game state', () => {
    const state = createGameState('ROOM123', 'East');

    expect(state.roomCode).toBe('ROOM123');
    expect(state.isActive).toBe(true);
    expect(state.phase).toBe(GamePhase.INITIALIZING);
    expect(state.currentPlayer).toBe('East');
    expect(state.dealerPosition).toBe('East');
    expect(state.roundNumber).toBe(1);

    // Check all 4 players exist
    expect(Object.keys(state.players).length).toBe(4);
    expect(state.players['East']).toBeDefined();
    expect(state.players['South']).toBeDefined();
    expect(state.players['West']).toBeDefined();
    expect(state.players['North']).toBeDefined();

    // Check dealer flag
    expect(state.players['East'].isDealer).toBe(true);
    expect(state.players['South'].isDealer).toBe(false);
  });

  test('should have correct initial tile counts', () => {
    const state = createGameState('ROOM123');

    expect(state.wallTilesRemaining).toBe(86);      // 144 - 54 dealt - 4 kong
    expect(state.kongReplacementsRemaining).toBe(4);
  });
});

describe('Game State - Turn Sequence', () => {
  test('should get next player in order', () => {
    expect(getNextPlayer('East')).toBe('South');
    expect(getNextPlayer('South')).toBe('West');
    expect(getNextPlayer('West')).toBe('North');
    expect(getNextPlayer('North')).toBe('East');
  });

  test('should get other players', () => {
    const state = createGameState('ROOM123');
    const others = getOtherPlayers(state, 'East');

    expect(others.length).toBe(3);
    expect(others.map(p => p.position)).toEqual(['South', 'West', 'North']);
  });

  test('should get player by position', () => {
    const state = createGameState('ROOM123');
    const player = getPlayer(state, 'South');

    expect(player.position).toBe('South');
    expect(player).toBe(state.players['South']);
  });
});

describe('Game State - Hand Validation', () => {
  test('should validate normal hand size (13 tiles)', () => {
    const player = createPlayerState('East', false);
    player.hand = Array.from({ length: 13 }, (_, i) =>
      createNumberTile(TileSuit.CHARACTER, (i % 9) + 1, 1)
    );

    expect(hasValidHandSize(player, false, false)).toBe(true);
  });

  test('should validate dealer hand size (14 tiles)', () => {
    const player = createPlayerState('East', true);
    player.hand = Array.from({ length: 14 }, (_, i) =>
      createNumberTile(TileSuit.CHARACTER, (i % 9) + 1, 1)
    );

    expect(hasValidHandSize(player, true, true)).toBe(true);
  });

  test('should validate hand after draw (14 tiles, before discard)', () => {
    const player = createPlayerState('East', false);
    player.hand = Array.from({ length: 14 }, (_, i) =>
      createNumberTile(TileSuit.CHARACTER, (i % 9) + 1, 1)
    );

    expect(hasValidHandSize(player, true, true)).toBe(true);
  });

  test('should reject invalid hand size', () => {
    const player = createPlayerState('East', false);
    player.hand = Array.from({ length: 12 }, (_, i) =>
      createNumberTile(TileSuit.CHARACTER, (i % 9) + 1, 1)
    );

    expect(hasValidHandSize(player, false, false)).toBe(false);
  });
});

describe('Game State - Tile Accounting', () => {
  test('should count total player tiles', () => {
    const player = createPlayerState('East', false);
    player.hand = Array.from({ length: 13 }, (_, i) =>
      createNumberTile(TileSuit.CHARACTER, (i % 9) + 1, 1)
    );

    let total = getTotalPlayerTiles(player);
    expect(total).toBe(13);

    // Add some melds
    player.melds = [
      { type: 'pong', tiles: [createNumberTile(TileSuit.CHARACTER, 1, 1), createNumberTile(TileSuit.CHARACTER, 1, 2), createNumberTile(TileSuit.CHARACTER, 1, 3)] }
    ] as any;

    total = getTotalPlayerTiles(player);
    expect(total).toBe(16); // 13 + 3 from meld
  });
});

describe('Game State - Connection Status', () => {
  test('should check if all players connected', () => {
    const state = createGameState('ROOM123');

    expect(areAllPlayersConnected(state)).toBe(true);

    // Disconnect one player
    state.players['South'].isConnected = false;

    expect(areAllPlayersConnected(state)).toBe(false);
  });
});

describe('Game State - Game Phase Checks', () => {
  test('should recognize game in play phases', () => {
    const state = createGameState('ROOM123');

    state.phase = GamePhase.INITIALIZING;
    expect(isGameInPlay(state)).toBe(false);

    state.phase = GamePhase.WAITING_FOR_DRAW;
    expect(isGameInPlay(state)).toBe(true);

    state.phase = GamePhase.WAITING_FOR_DISCARD;
    expect(isGameInPlay(state)).toBe(true);

    state.phase = GamePhase.CLAIM_WINDOW;
    expect(isGameInPlay(state)).toBe(true);

    state.phase = GamePhase.TURN_COMPLETE;
    expect(isGameInPlay(state)).toBe(true);

    state.phase = GamePhase.GAME_OVER;
    expect(isGameInPlay(state)).toBe(false);
  });
});

describe('Game State - Discard Tracking', () => {
  test('should track last discard', () => {
    const state = createGameState('ROOM123');
    const tile = createNumberTile(TileSuit.CHARACTER, 5, 1);

    expect(state.lastDiscard).toBeUndefined();

    state.lastDiscard = {
      tile,
      fromPosition: 'East',
      timestamp: Date.now()
    };

    expect(state.lastDiscard).toBeDefined();
    expect(state.lastDiscard?.tile).toBe(tile);
    expect(state.lastDiscard?.fromPosition).toBe('East');
  });
});

describe('Game State - Round Info', () => {
  test('should track round number and dealer', () => {
    const state1 = createGameState('ROOM123', 'East');
    expect(state1.roundNumber).toBe(1);
    expect(state1.dealerPosition).toBe('East');

    const state2 = createGameState('ROOM124', 'South');
    expect(state2.dealerPosition).toBe('South');
  });

  test('should track timestamps', () => {
    const state = createGameState('ROOM123');
    const startTime = state.roundStartTime;
    const lastAction = state.lastActionTime;

    expect(startTime).toBeGreaterThan(0);
    expect(lastAction).toBeGreaterThanOrEqual(startTime);
  });
});
