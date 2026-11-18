/**
 * Wall Tests - Stage 1
 *
 * Tests for:
 * - Wall initialization and shuffling
 * - Dealing initial hands
 * - Drawing tiles
 * - Kong replacements
 * - Flower/season replacement
 */

import { Wall } from '../../src/game/Wall';
import { TILE_COUNTS, GAME_CONSTANTS } from '../../src/constants';
import { isBonus } from '../../src/models/Tile';

describe('Wall - Initialization and Shuffling', () => {
  let wall: Wall;

  beforeEach(() => {
    wall = new Wall();
  });

  test('should initialize with correct total tiles', () => {
    const stats = wall.getStats();
    expect(stats.totalTiles).toBe(TILE_COUNTS.TOTAL);
  });

  test('should initialize with all tiles remaining', () => {
    const stats = wall.getStats();
    expect(stats.tilesRemaining).toBe(TILE_COUNTS.TOTAL - GAME_CONSTANTS.KONG_REPLACEMENT_TILES);
  });

  test('should have correct kong replacement tiles remaining', () => {
    const stats = wall.getStats();
    expect(stats.kongReplacementsRemaining).toBe(GAME_CONSTANTS.KONG_REPLACEMENT_TILES);
  });

  test('should shuffle tiles (not always in same order)', () => {
    const wall1 = new Wall();
    const wall2 = new Wall();

    // Get first 10 tiles from each
    const tiles1 = [];
    const tiles2 = [];

    for (let i = 0; i < 10; i++) {
      const tile1 = wall1.draw();
      const tile2 = wall2.draw();
      if (tile1) tiles1.push(tile1.id);
      if (tile2) tiles2.push(tile2.id);
    }

    // Extremely unlikely to get exactly the same sequence
    expect(tiles1).not.toEqual(tiles2);
  });
});

describe('Wall - Initial Deal', () => {
  let wall: Wall;

  beforeEach(() => {
    wall = new Wall();
  });

  test('should deal initial hands to 4 players', () => {
    const hands = wall.dealInitial();
    expect(hands.length).toBe(4);
  });

  test('should give East player 14 tiles', () => {
    const hands = wall.dealInitial();
    expect(hands[0].length).toBe(14);
  });

  test('should give other players 13 tiles each', () => {
    const hands = wall.dealInitial();
    expect(hands[1].length).toBe(13);
    expect(hands[2].length).toBe(13);
    expect(hands[3].length).toBe(13);
  });

  test('should not include bonus tiles in dealt hands', () => {
    const hands = wall.dealInitial();
    // Check that no bonus tiles are left in any hand
    for (const hand of hands) {
      for (const tile of hand) {
        expect(isBonus(tile)).toBe(false);
      }
    }
  });

  test('should have reasonable tiles remaining after dealing (60-90 tiles)', () => {
    wall.dealInitial();
    const remaining = wall.tilesRemaining();
    // After dealing 54 tiles + 0-8 bonus tile replacements
    // Should have roughly 86 - N tiles where N is bonus replacements
    expect(remaining).toBeGreaterThanOrEqual(60);
    expect(remaining).toBeLessThanOrEqual(90);
  });

  test('should maintain total tile count after initial deal', () => {
    const hands = wall.dealInitial();

    const dealtCount = hands.reduce((sum, hand) => sum + hand.length, 0);
    const wallRemaining = wall.tilesRemaining();
    const kongRemaining = wall.kongReplacementsRemaining();

    const total = dealtCount + wallRemaining + kongRemaining;

    // May vary by 0-8 depending on bonus tiles, but should be close
    expect(total).toBe(TILE_COUNTS.TOTAL);
  });
});

describe('Wall - Draw Operations', () => {
  let wall: Wall;

  beforeEach(() => {
    wall = new Wall();
    wall.dealInitial(); // Setup the wall state
  });

  test('should draw tiles one at a time', () => {
    const tile1 = wall.draw();
    const tile2 = wall.draw();

    expect(tile1).not.toBeNull();
    expect(tile2).not.toBeNull();
    expect(tile1?.id).not.toBe(tile2?.id);
  });

  test('should return null when wall is exhausted', () => {
    // Draw all remaining tiles
    let tile;
    let count = 0;
    do {
      tile = wall.draw();
      if (tile) count++;
    } while (tile && count < 200); // Safety limit

    // Next draw should be null
    expect(wall.draw()).toBeNull();
  });

  test('should track tiles remaining correctly', () => {
    const initialRemaining = wall.tilesRemaining();

    wall.draw();
    expect(wall.tilesRemaining()).toBe(initialRemaining - 1);

    wall.draw();
    expect(wall.tilesRemaining()).toBe(initialRemaining - 2);
  });

  test('should indicate when wall has remaining tiles', () => {
    expect(wall.hasRemaining()).toBe(true);

    // Draw all tiles
    let tile;
    do {
      tile = wall.draw();
    } while (tile);

    expect(wall.hasRemaining()).toBe(false);
  });
});

describe('Wall - Kong Replacements', () => {
  let wall: Wall;

  beforeEach(() => {
    wall = new Wall();
    wall.dealInitial();
  });

  test('should draw kong replacement tiles from end of wall', () => {
    const tile1 = wall.drawKongReplacement();
    const tile2 = wall.drawKongReplacement();

    expect(tile1).not.toBeNull();
    expect(tile2).not.toBeNull();
    expect(tile1?.id).not.toBe(tile2?.id);
  });

  test('should have 4 kong replacement tiles available', () => {
    for (let i = 0; i < 4; i++) {
      const tile = wall.drawKongReplacement();
      expect(tile).not.toBeNull();
    }

    // 5th should be null
    expect(wall.drawKongReplacement()).toBeNull();
  });

  test('should track kong replacements remaining correctly', () => {
    const initialRemaining = wall.kongReplacementsRemaining();
    expect(initialRemaining).toBe(4);

    wall.drawKongReplacement();
    expect(wall.kongReplacementsRemaining()).toBe(3);

    wall.drawKongReplacement();
    expect(wall.kongReplacementsRemaining()).toBe(2);
  });

  test('kong replacements should not affect regular draws', () => {
    const regularRemaining1 = wall.tilesRemaining();

    wall.drawKongReplacement();

    const regularRemaining2 = wall.tilesRemaining();

    // Regular draw count should not change
    expect(regularRemaining2).toBe(regularRemaining1);
  });

  test('should handle independent draw and kong replacement sequences', () => {
    const tile1 = wall.draw();
    const kong1 = wall.drawKongReplacement();
    const tile2 = wall.draw();
    const kong2 = wall.drawKongReplacement();

    expect(tile1).not.toBeNull();
    expect(tile2).not.toBeNull();
    expect(kong1).not.toBeNull();
    expect(kong2).not.toBeNull();

    // All should be different tiles
    const ids = [tile1?.id, tile2?.id, kong1?.id, kong2?.id];
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(4);
  });
});

describe('Wall - Tile Accounting', () => {
  let wall: Wall;

  beforeEach(() => {
    wall = new Wall();
  });

  test('should account for all tiles (dealt + wall remaining + kong)', () => {
    const hands = wall.dealInitial();

    const dealtCount = hands.reduce((sum, hand) => sum + hand.length, 0);
    const wallRemaining = wall.tilesRemaining();
    const kongRemaining = wall.kongReplacementsRemaining();

    const total = dealtCount + wallRemaining + kongRemaining;

    expect(total).toBe(TILE_COUNTS.TOTAL);
  });

  test('should maintain 144 tiles throughout game cycle', () => {
    const hands = wall.dealInitial();

    let drawn = 0;
    let tile;
    while ((tile = wall.draw())) {
      drawn++;
    }

    let kongDrawn = 0;
    while ((tile = wall.drawKongReplacement())) {
      kongDrawn++;
    }

    const dealtCount = hands.reduce((sum, hand) => sum + hand.length, 0);
    const total = dealtCount + drawn + kongDrawn;

    expect(total).toBe(TILE_COUNTS.TOTAL);
  });
});

describe('Wall - Reset', () => {
  let wall: Wall;

  beforeEach(() => {
    wall = new Wall();
  });

  test('should reset wall after game', () => {
    wall.dealInitial();

    // Draw some tiles
    wall.draw();
    wall.draw();
    wall.drawKongReplacement();

    // Reset
    wall.reset();

    // Should have all tiles again
    expect(wall.tilesRemaining()).toBe(TILE_COUNTS.TOTAL - GAME_CONSTANTS.KONG_REPLACEMENT_TILES);
    expect(wall.kongReplacementsRemaining()).toBe(GAME_CONSTANTS.KONG_REPLACEMENT_TILES);
  });

  test('should deal correctly after reset', () => {
    wall.dealInitial();
    wall.reset();

    const hands = wall.dealInitial();
    expect(hands[0].length).toBe(14);
    expect(hands[1].length).toBe(13);
    expect(hands[2].length).toBe(13);
    expect(hands[3].length).toBe(13);
  });
});
