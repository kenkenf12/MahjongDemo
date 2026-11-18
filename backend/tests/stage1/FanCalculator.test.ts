/**
 * Fan Calculator Tests - Stage 1.4
 *
 * Tests for:
 * - Fan calculation for different hand patterns
 * - Bonus tile scoring
 * - Pattern bonuses
 * - Minimum fan to win
 */

import { FanCalculator } from '../../src/game/FanCalculator';
import { HandValidator } from '../../src/game/HandValidator';
import { createNumberTile, createWindTile, createDragonTile, createFlowerTile, createSeasonTile, TileSuit } from '../../src/models/Tile';
import { DEFAULT_FAN_VALUES } from '../../src/constants';

describe('Fan Calculator - Basic Scoring', () => {
  test('should calculate simple hand with no special patterns: 1 fan minimum', () => {
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

    const validation = HandValidator.validateWinningHand(tiles);
    expect(validation.isValid).toBe(true);

    if (validation.pattern) {
      const fan = FanCalculator.calculateFan(validation.pattern, DEFAULT_FAN_VALUES);
      expect(fan.total).toBeGreaterThanOrEqual(1);
    }
  });

  test('should score hand with pongs', () => {
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

    const validation = HandValidator.validateWinningHand(tiles);
    expect(validation.isValid).toBe(true);

    if (validation.pattern) {
      const fan = FanCalculator.calculateFan(validation.pattern, DEFAULT_FAN_VALUES);
      // 4 pongs = 4 fan minimum
      expect(fan.total).toBeGreaterThanOrEqual(4);
      expect(fan.meldsTotal).toBe(4);
    }
  });
});

describe('Fan Calculator - Bonus Tiles', () => {
  test('should add 1 fan per flower', () => {
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
      createFlowerTile('orchid' as any, 1)
    ];

    const validation = HandValidator.validateWinningHand(mainTiles, bonusTiles);
    expect(validation.isValid).toBe(true);

    if (validation.pattern) {
      const fan = FanCalculator.calculateFan(validation.pattern, DEFAULT_FAN_VALUES);
      expect(fan.bonusTotal).toBe(2); // 2 flowers = 2 fan
    }
  });

  test('should add 1 fan per season', () => {
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
      createSeasonTile('spring' as any, 1),
      createSeasonTile('summer' as any, 1),
      createSeasonTile('autumn' as any, 1)
    ];

    const validation = HandValidator.validateWinningHand(mainTiles, bonusTiles);
    expect(validation.isValid).toBe(true);

    if (validation.pattern) {
      const fan = FanCalculator.calculateFan(validation.pattern, DEFAULT_FAN_VALUES);
      expect(fan.bonusTotal).toBe(3); // 3 seasons = 3 fan
    }
  });

  test('should add fan for both flowers and seasons', () => {
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

    const validation = HandValidator.validateWinningHand(mainTiles, bonusTiles);
    expect(validation.isValid).toBe(true);

    if (validation.pattern) {
      const fan = FanCalculator.calculateFan(validation.pattern, DEFAULT_FAN_VALUES);
      expect(fan.bonusTotal).toBe(2); // 1 flower + 1 season = 2 fan
    }
  });
});

describe('Fan Calculator - Pattern Bonuses', () => {
  test('should add 2 fan for All Simples pattern', () => {
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

    const validation = HandValidator.validateWinningHand(tiles);
    expect(validation.isValid).toBe(true);

    if (validation.pattern) {
      const fan = FanCalculator.calculateFan(validation.pattern, DEFAULT_FAN_VALUES);
      expect(fan.patternBonus).toBeGreaterThanOrEqual(2);
      expect(fan.details.some(d => d.includes('All Simples'))).toBe(true);
    }
  });

  test('should add 1 fan for All Terminals and Honors', () => {
    const tiles = [
      createNumberTile(TileSuit.CHARACTER, 1, 1),
      createNumberTile(TileSuit.CHARACTER, 1, 2),
      createNumberTile(TileSuit.CHARACTER, 1, 3),
      createNumberTile(TileSuit.CHARACTER, 9, 1),
      createNumberTile(TileSuit.CHARACTER, 9, 2),
      createNumberTile(TileSuit.CHARACTER, 9, 3),
      createWindTile('east' as any, 1),
      createWindTile('east' as any, 2),
      createWindTile('east' as any, 3),
      createWindTile('south' as any, 1),
      createWindTile('south' as any, 2),
      createWindTile('south' as any, 3),
      createWindTile('west' as any, 1),
      createWindTile('west' as any, 2)
    ];

    const validation = HandValidator.validateWinningHand(tiles);
    expect(validation.isValid).toBe(true);

    if (validation.pattern) {
      const fan = FanCalculator.calculateFan(validation.pattern, DEFAULT_FAN_VALUES);
      expect(fan.patternBonus).toBeGreaterThanOrEqual(1);
      expect(fan.details.some(d => d.includes('Terminals'))).toBe(true);
    }
  });
});

describe('Fan Calculator - Minimum Fan', () => {
  test('should return minimum 1 fan for valid hand', () => {
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

    const validation = HandValidator.validateWinningHand(tiles);
    if (validation.pattern) {
      const fan = FanCalculator.calculateFan(validation.pattern, DEFAULT_FAN_VALUES);
      expect(fan.total).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('Fan Calculator - Invalid Hands', () => {
  test('should return null for invalid hand', () => {
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

    const fan = FanCalculator.calculateFanFromTiles(tiles);
    expect(fan).toBeNull();
  });
});

describe('Fan Calculator - Fan Breakdown', () => {
  test('should provide detailed fan breakdown', () => {
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

    const validation = HandValidator.validateWinningHand(tiles);
    if (validation.pattern) {
      const fan = FanCalculator.calculateFan(validation.pattern, DEFAULT_FAN_VALUES);
      expect(fan.details.length).toBeGreaterThan(0);
      expect(fan.details[0]).toContain('pong');
    }
  });
});
