/**
 * Hand Validator Tests - Stage 1.3
 *
 * Tests for:
 * - Hand validation (4 melds + 1 pair)
 * - Meld recognition (Chow, Pong, Kong)
 * - Pattern detection
 * - Edge cases
 */

import { HandValidator } from '../../src/game/HandValidator';
import { createNumberTile, createWindTile, createDragonTile, createFlowerTile, createSeasonTile, TileSuit } from '../../src/models/Tile';
import { createChow, createPong, createKong, createPair, MeldType } from '../../src/models/Meld';

describe('Hand Validator - Basic Validation', () => {
  test('should reject hand with wrong tile count (13)', () => {
    const tiles = Array.from({ length: 13 }, (_, i) => createNumberTile(TileSuit.CHARACTER, (i % 9) + 1, 1));
    const result = HandValidator.validateWinningHand(tiles);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('should reject hand with wrong tile count (15)', () => {
    const tiles = Array.from({ length: 15 }, (_, i) => createNumberTile(TileSuit.CHARACTER, (i % 9) + 1, 1));
    const result = HandValidator.validateWinningHand(tiles);
    expect(result.isValid).toBe(false);
  });

  test('should reject hand with bonus tiles in main hand', () => {
    const tiles = [
      ...Array.from({ length: 12 }, (_, i) => createNumberTile(TileSuit.CHARACTER, (i % 9) + 1, 1)),
      createFlowerTile('plum' as any, 1),
      createNumberTile(TileSuit.CHARACTER, 1, 2)
    ];
    const result = HandValidator.validateWinningHand(tiles);
    expect(result.isValid).toBe(false);
  });
});

describe('Hand Validator - Simple Winning Hands', () => {
  test('should recognize simple hand: 1m 2m 3m 4m 5m 6m 7m 8m 9m 1m 1m 1m 2m 2m', () => {
    const tiles = [
      createNumberTile(TileSuit.CHARACTER, 1, 1),
      createNumberTile(TileSuit.CHARACTER, 2, 1),
      createNumberTile(TileSuit.CHARACTER, 3, 1),
      createNumberTile(TileSuit.CHARACTER, 4, 1),
      createNumberTile(TileSuit.CHARACTER, 5, 1),
      createNumberTile(TileSuit.CHARACTER, 6, 1),
      createNumberTile(TileSuit.CHARACTER, 7, 1),
      createNumberTile(TileSuit.CHARACTER, 8, 1),
      createNumberTile(TileSuit.CHARACTER, 9, 1),
      createNumberTile(TileSuit.CHARACTER, 1, 2),
      createNumberTile(TileSuit.CHARACTER, 1, 3),
      createNumberTile(TileSuit.CHARACTER, 1, 4),
      createNumberTile(TileSuit.CHARACTER, 2, 2),
      createNumberTile(TileSuit.CHARACTER, 2, 3)
    ];

    const result = HandValidator.validateWinningHand(tiles);
    expect(result.isValid).toBe(true);
    expect(result.pattern).toBeDefined();
    expect(result.pattern?.melds.length).toBe(4);
    expect(result.pattern?.pair.tiles.length).toBe(2);
  });

  test('should recognize hand with pongs: 1m 1m 1m 2m 2m 2m 3m 3m 3m 4m 4m 4m 5m 5m', () => {
    const tiles = [
      createNumberTile(TileSuit.CHARACTER, 1, 1),
      createNumberTile(TileSuit.CHARACTER, 1, 2),
      createNumberTile(TileSuit.CHARACTER, 1, 3),
      createNumberTile(TileSuit.CHARACTER, 2, 1),
      createNumberTile(TileSuit.CHARACTER, 2, 2),
      createNumberTile(TileSuit.CHARACTER, 2, 3),
      createNumberTile(TileSuit.CHARACTER, 3, 1),
      createNumberTile(TileSuit.CHARACTER, 3, 2),
      createNumberTile(TileSuit.CHARACTER, 3, 3),
      createNumberTile(TileSuit.CHARACTER, 4, 1),
      createNumberTile(TileSuit.CHARACTER, 4, 2),
      createNumberTile(TileSuit.CHARACTER, 4, 3),
      createNumberTile(TileSuit.CHARACTER, 5, 1),
      createNumberTile(TileSuit.CHARACTER, 5, 2)
    ];

    const result = HandValidator.validateWinningHand(tiles);
    expect(result.isValid).toBe(true);
    expect(result.pattern?.melds.every(m => m.type === MeldType.PONG)).toBe(true);
  });

  test('should recognize mixed hand: chows and pongs', () => {
    const tiles = [
      // Chow: 1m 2m 3m
      createNumberTile(TileSuit.CHARACTER, 1, 1),
      createNumberTile(TileSuit.CHARACTER, 2, 1),
      createNumberTile(TileSuit.CHARACTER, 3, 1),
      // Chow: 4m 5m 6m
      createNumberTile(TileSuit.CHARACTER, 4, 1),
      createNumberTile(TileSuit.CHARACTER, 5, 1),
      createNumberTile(TileSuit.CHARACTER, 6, 1),
      // Pong: 7m 7m 7m
      createNumberTile(TileSuit.CHARACTER, 7, 1),
      createNumberTile(TileSuit.CHARACTER, 7, 2),
      createNumberTile(TileSuit.CHARACTER, 7, 3),
      // Pong: 8m 8m 8m
      createNumberTile(TileSuit.CHARACTER, 8, 1),
      createNumberTile(TileSuit.CHARACTER, 8, 2),
      createNumberTile(TileSuit.CHARACTER, 8, 3),
      // Pair: 9m 9m
      createNumberTile(TileSuit.CHARACTER, 9, 1),
      createNumberTile(TileSuit.CHARACTER, 9, 2)
    ];

    const result = HandValidator.validateWinningHand(tiles);
    expect(result.isValid).toBe(true);
    expect(result.pattern).toBeDefined();
  });
});

describe('Hand Validator - Bonus Tiles', () => {
  test('should accept bonus tiles separately', () => {
    const mainTiles = [
      createNumberTile(TileSuit.CHARACTER, 1, 1),
      createNumberTile(TileSuit.CHARACTER, 2, 1),
      createNumberTile(TileSuit.CHARACTER, 3, 1),
      createNumberTile(TileSuit.CHARACTER, 4, 1),
      createNumberTile(TileSuit.CHARACTER, 5, 1),
      createNumberTile(TileSuit.CHARACTER, 6, 1),
      createNumberTile(TileSuit.CHARACTER, 7, 1),
      createNumberTile(TileSuit.CHARACTER, 8, 1),
      createNumberTile(TileSuit.CHARACTER, 9, 1),
      createNumberTile(TileSuit.CHARACTER, 1, 2),
      createNumberTile(TileSuit.CHARACTER, 1, 3),
      createNumberTile(TileSuit.CHARACTER, 1, 4),
      createNumberTile(TileSuit.CHARACTER, 2, 2),
      createNumberTile(TileSuit.CHARACTER, 2, 3)
    ];

    const bonusTiles = [
      createFlowerTile('plum' as any, 1),
      createSeasonTile('spring' as any, 1)
    ];

    const result = HandValidator.validateWinningHand(mainTiles, bonusTiles);
    expect(result.isValid).toBe(true);
    expect(result.pattern?.flowers.length).toBe(1);
    expect(result.pattern?.seasons.length).toBe(1);
  });
});

describe('Hand Validator - Pattern Recognition', () => {
  test('should recognize All Simples pattern', () => {
    const tiles = [
      createNumberTile(TileSuit.CHARACTER, 2, 1),
      createNumberTile(TileSuit.CHARACTER, 3, 1),
      createNumberTile(TileSuit.CHARACTER, 4, 1),
      createNumberTile(TileSuit.CHARACTER, 5, 1),
      createNumberTile(TileSuit.CHARACTER, 6, 1),
      createNumberTile(TileSuit.CHARACTER, 7, 1),
      createNumberTile(TileSuit.CHARACTER, 8, 1),
      createNumberTile(TileSuit.CHARACTER, 8, 2),
      createNumberTile(TileSuit.CHARACTER, 8, 3),
      createNumberTile(TileSuit.CHARACTER, 8, 4),
      createNumberTile(TileSuit.CHARACTER, 2, 2),
      createNumberTile(TileSuit.CHARACTER, 2, 3),
      createNumberTile(TileSuit.CHARACTER, 2, 4),
      createNumberTile(TileSuit.CHARACTER, 3, 2)
    ];

    const result = HandValidator.validateWinningHand(tiles);
    expect(result.isValid).toBe(true);
    expect(result.pattern).toBeDefined();
    
    if (result.pattern) {
      expect(HandValidator.isAllSimples(result.pattern)).toBe(true);
    }
  });

  test('should recognize All Terminals and Honors pattern', () => {
    const tiles = [
      // Pong with terminal: 1m 1m 1m
      createNumberTile(TileSuit.CHARACTER, 1, 1),
      createNumberTile(TileSuit.CHARACTER, 1, 2),
      createNumberTile(TileSuit.CHARACTER, 1, 3),
      // Pong with terminal: 9m 9m 9m
      createNumberTile(TileSuit.CHARACTER, 9, 1),
      createNumberTile(TileSuit.CHARACTER, 9, 2),
      createNumberTile(TileSuit.CHARACTER, 9, 3),
      // Pong with honor: E E E
      createWindTile('east' as any, 1),
      createWindTile('east' as any, 2),
      createWindTile('east' as any, 3),
      // Pong with honor: S S S
      createWindTile('south' as any, 1),
      createWindTile('south' as any, 2),
      createWindTile('south' as any, 3),
      // Pair: W W
      createWindTile('west' as any, 1),
      createWindTile('west' as any, 2)
    ];

    const result = HandValidator.validateWinningHand(tiles);
    expect(result.isValid).toBe(true);
    
    if (result.pattern) {
      expect(HandValidator.isAllTerminalsAndHonors(result.pattern)).toBe(true);
    }
  });
});

describe('Hand Validator - Invalid Hands', () => {
  test('should reject hand with no valid pattern', () => {
    const tiles = [
      createNumberTile(TileSuit.CHARACTER, 1, 1),
      createNumberTile(TileSuit.CHARACTER, 2, 1),
      createNumberTile(TileSuit.CHARACTER, 3, 1),
      createNumberTile(TileSuit.CHARACTER, 4, 1),
      createNumberTile(TileSuit.CHARACTER, 5, 1),
      createNumberTile(TileSuit.CHARACTER, 6, 1),
      createNumberTile(TileSuit.CHARACTER, 7, 1),
      createNumberTile(TileSuit.CHARACTER, 8, 1),
      createNumberTile(TileSuit.CHARACTER, 9, 1),
      createNumberTile(TileSuit.BAMBOO, 1, 1),
      createNumberTile(TileSuit.BAMBOO, 2, 1),
      createNumberTile(TileSuit.BAMBOO, 3, 1),
      createNumberTile(TileSuit.BAMBOO, 4, 1),
      createNumberTile(TileSuit.BAMBOO, 5, 1)
    ];

    const result = HandValidator.validateWinningHand(tiles);
    expect(result.isValid).toBe(false);
  });

  test('should reject hand without pair', () => {
    const tiles = [
      createNumberTile(TileSuit.CHARACTER, 1, 1),
      createNumberTile(TileSuit.CHARACTER, 2, 1),
      createNumberTile(TileSuit.CHARACTER, 3, 1),
      createNumberTile(TileSuit.CHARACTER, 4, 1),
      createNumberTile(TileSuit.CHARACTER, 5, 1),
      createNumberTile(TileSuit.CHARACTER, 6, 1),
      createNumberTile(TileSuit.CHARACTER, 7, 1),
      createNumberTile(TileSuit.CHARACTER, 8, 1),
      createNumberTile(TileSuit.CHARACTER, 9, 1),
      createNumberTile(TileSuit.CHARACTER, 1, 2),
      createNumberTile(TileSuit.CHARACTER, 2, 2),
      createNumberTile(TileSuit.CHARACTER, 3, 2),
      createNumberTile(TileSuit.CHARACTER, 4, 2),
      createNumberTile(TileSuit.CHARACTER, 5, 2)
    ];

    const result = HandValidator.validateWinningHand(tiles);
    // This should fail because the last tile doesn't match any other to form a pair
    expect(result.isValid).toBe(false);
  });
});
