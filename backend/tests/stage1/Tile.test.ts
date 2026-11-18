/**
 * Tile Model Tests - Stage 1
 *
 * Tests for:
 * - Tile creation (all types)
 * - Tile identification (suit, rank, type)
 * - Tile utilities (terminal, honor, simple, bonus)
 * - Tile comparison and utilities
 */

import {
  Tile,
  TileSuit,
  WindType,
  DragonType,
  FlowerType,
  SeasonType,
  createNumberTile,
  createWindTile,
  createDragonTile,
  createFlowerTile,
  createSeasonTile,
  areSameTileType,
  getTileName,
  isTerminal,
  isHonor,
  isTerminalOrHonor,
  isSimple,
  isBonus,
  areConsecutive
} from '../../src/models/Tile';

describe('Tile Model - Creation and Identity', () => {
  describe('Number Tiles', () => {
    test('should create character tiles (1-9)', () => {
      for (let rank = 1; rank <= 9; rank++) {
        const tile = createNumberTile(TileSuit.CHARACTER, rank, 1);
        expect(tile.suit).toBe(TileSuit.CHARACTER);
        expect(tile.rank).toBe(rank);
        expect(tile.displayName).toBe(`${rank}m`);
      }
    });

    test('should create bamboo tiles (1-9)', () => {
      for (let rank = 1; rank <= 9; rank++) {
        const tile = createNumberTile(TileSuit.BAMBOO, rank, 1);
        expect(tile.suit).toBe(TileSuit.BAMBOO);
        expect(tile.rank).toBe(rank);
        expect(tile.displayName).toBe(`${rank}s`);
      }
    });

    test('should create dot tiles (1-9)', () => {
      for (let rank = 1; rank <= 9; rank++) {
        const tile = createNumberTile(TileSuit.DOT, rank, 1);
        expect(tile.suit).toBe(TileSuit.DOT);
        expect(tile.rank).toBe(rank);
        expect(tile.displayName).toBe(`${rank}p`);
      }
    });

    test('should reject invalid rank (< 1)', () => {
      expect(() => createNumberTile(TileSuit.CHARACTER, 0, 1)).toThrow();
    });

    test('should reject invalid rank (> 9)', () => {
      expect(() => createNumberTile(TileSuit.CHARACTER, 10, 1)).toThrow();
    });

    test('should reject invalid instance (< 1)', () => {
      expect(() => createNumberTile(TileSuit.CHARACTER, 5, 0)).toThrow();
    });

    test('should reject invalid instance (> 4)', () => {
      expect(() => createNumberTile(TileSuit.CHARACTER, 5, 5)).toThrow();
    });

    test('should create unique tile IDs for each instance', () => {
      const tile1 = createNumberTile(TileSuit.CHARACTER, 1, 1);
      const tile2 = createNumberTile(TileSuit.CHARACTER, 1, 2);
      expect(tile1.id).not.toBe(tile2.id);
      expect(tile1.id).toBe('character-1-1');
      expect(tile2.id).toBe('character-1-2');
    });
  });

  describe('Wind Tiles', () => {
    test('should create all wind tiles', () => {
      const winds = [WindType.EAST, WindType.SOUTH, WindType.WEST, WindType.NORTH];
      const names = ['東', '南', '西', '北'];

      winds.forEach((wind, index) => {
        const tile = createWindTile(wind, 1);
        expect(tile.suit).toBe(TileSuit.WIND);
        expect(tile.wind).toBe(wind);
        expect(tile.displayName).toBe(names[index]);
      });
    });

    test('should create wind tiles with 4 instances each', () => {
      for (let instance = 1; instance <= 4; instance++) {
        const tile = createWindTile(WindType.EAST, instance);
        expect(tile.id).toBe(`wind-east-${instance}`);
      }
    });

    test('should reject invalid instance for wind tile', () => {
      expect(() => createWindTile(WindType.EAST, 5)).toThrow();
    });
  });

  describe('Dragon Tiles', () => {
    test('should create all dragon tiles', () => {
      const dragons = [DragonType.RED, DragonType.GREEN, DragonType.WHITE];
      const names = ['紅', '綠', '白'];

      dragons.forEach((dragon, index) => {
        const tile = createDragonTile(dragon, 1);
        expect(tile.suit).toBe(TileSuit.DRAGON);
        expect(tile.dragon).toBe(dragon);
        expect(tile.displayName).toBe(names[index]);
      });
    });

    test('should create dragon tiles with 4 instances each', () => {
      for (let instance = 1; instance <= 4; instance++) {
        const tile = createDragonTile(DragonType.RED, instance);
        expect(tile.id).toBe(`dragon-red-${instance}`);
      }
    });
  });

  describe('Flower Tiles', () => {
    test('should create all flower tiles', () => {
      const flowers = [FlowerType.PLUM, FlowerType.ORCHID, FlowerType.BAMBOO_F, FlowerType.CHRYSANTHEMUM];
      const names = ['梅', '蘭', '竹', '菊'];

      flowers.forEach((flower, index) => {
        const tile = createFlowerTile(flower, 1);
        expect(tile.suit).toBe(TileSuit.FLOWER);
        expect(tile.flower).toBe(flower);
        expect(tile.displayName).toBe(names[index]);
      });
    });

    test('should create flower tiles with 2 instances each', () => {
      for (let instance = 1; instance <= 2; instance++) {
        const tile = createFlowerTile(FlowerType.PLUM, instance);
        expect(tile.id).toBe(`flower-plum-${instance}`);
      }
    });

    test('should reject invalid instance for flower tile (> 2)', () => {
      expect(() => createFlowerTile(FlowerType.PLUM, 3)).toThrow();
    });
  });

  describe('Season Tiles', () => {
    test('should create all season tiles', () => {
      const seasons = [SeasonType.SPRING, SeasonType.SUMMER, SeasonType.AUTUMN, SeasonType.WINTER];
      const names = ['春', '夏', '秋', '冬'];

      seasons.forEach((season, index) => {
        const tile = createSeasonTile(season, 1);
        expect(tile.suit).toBe(TileSuit.SEASON);
        expect(tile.season).toBe(season);
        expect(tile.displayName).toBe(names[index]);
      });
    });

    test('should create season tiles with 2 instances each', () => {
      for (let instance = 1; instance <= 2; instance++) {
        const tile = createSeasonTile(SeasonType.SPRING, instance);
        expect(tile.id).toBe(`season-spring-${instance}`);
      }
    });

    test('should reject invalid instance for season tile (> 2)', () => {
      expect(() => createSeasonTile(SeasonType.SPRING, 3)).toThrow();
    });
  });
});

describe('Tile Utilities', () => {
  describe('areSameTileType', () => {
    test('should recognize same number tile type', () => {
      const tile1 = createNumberTile(TileSuit.CHARACTER, 1, 1);
      const tile2 = createNumberTile(TileSuit.CHARACTER, 1, 2);
      expect(areSameTileType(tile1, tile2)).toBe(true);
    });

    test('should distinguish different number tiles', () => {
      const tile1 = createNumberTile(TileSuit.CHARACTER, 1, 1);
      const tile2 = createNumberTile(TileSuit.CHARACTER, 2, 1);
      expect(areSameTileType(tile1, tile2)).toBe(false);
    });

    test('should recognize same wind tile', () => {
      const tile1 = createWindTile(WindType.EAST, 1);
      const tile2 = createWindTile(WindType.EAST, 2);
      expect(areSameTileType(tile1, tile2)).toBe(true);
    });

    test('should distinguish different wind tiles', () => {
      const tile1 = createWindTile(WindType.EAST, 1);
      const tile2 = createWindTile(WindType.SOUTH, 1);
      expect(areSameTileType(tile1, tile2)).toBe(false);
    });

    test('should distinguish different suits', () => {
      const tile1 = createNumberTile(TileSuit.CHARACTER, 1, 1);
      const tile2 = createNumberTile(TileSuit.BAMBOO, 1, 1);
      expect(areSameTileType(tile1, tile2)).toBe(false);
    });
  });

  describe('getTileName', () => {
    test('should get display names correctly', () => {
      expect(getTileName(createNumberTile(TileSuit.CHARACTER, 1, 1))).toBe('1m');
      expect(getTileName(createNumberTile(TileSuit.BAMBOO, 5, 1))).toBe('5s');
      expect(getTileName(createNumberTile(TileSuit.DOT, 9, 1))).toBe('9p');
    });
  });

  describe('Terminal detection', () => {
    test('should identify terminal tiles (1 and 9)', () => {
      expect(isTerminal(createNumberTile(TileSuit.CHARACTER, 1, 1))).toBe(true);
      expect(isTerminal(createNumberTile(TileSuit.CHARACTER, 9, 1))).toBe(true);
      expect(isTerminal(createNumberTile(TileSuit.BAMBOO, 1, 1))).toBe(true);
      expect(isTerminal(createNumberTile(TileSuit.DOT, 9, 1))).toBe(true);
    });

    test('should not identify non-terminals', () => {
      expect(isTerminal(createNumberTile(TileSuit.CHARACTER, 5, 1))).toBe(false);
      expect(isTerminal(createWindTile(WindType.EAST, 1))).toBe(false);
    });
  });

  describe('Honor detection', () => {
    test('should identify honor tiles (winds and dragons)', () => {
      expect(isHonor(createWindTile(WindType.EAST, 1))).toBe(true);
      expect(isHonor(createDragonTile(DragonType.RED, 1))).toBe(true);
    });

    test('should not identify non-honors', () => {
      expect(isHonor(createNumberTile(TileSuit.CHARACTER, 1, 1))).toBe(false);
    });
  });

  describe('Terminal or Honor detection', () => {
    test('should identify terminals or honors', () => {
      expect(isTerminalOrHonor(createNumberTile(TileSuit.CHARACTER, 1, 1))).toBe(true);
      expect(isTerminalOrHonor(createNumberTile(TileSuit.CHARACTER, 9, 1))).toBe(true);
      expect(isTerminalOrHonor(createWindTile(WindType.EAST, 1))).toBe(true);
      expect(isTerminalOrHonor(createDragonTile(DragonType.RED, 1))).toBe(true);
    });

    test('should not identify simples as terminals/honors', () => {
      expect(isTerminalOrHonor(createNumberTile(TileSuit.CHARACTER, 5, 1))).toBe(false);
    });
  });

  describe('Simple detection', () => {
    test('should identify simple tiles (2-8)', () => {
      for (let rank = 2; rank <= 8; rank++) {
        expect(isSimple(createNumberTile(TileSuit.CHARACTER, rank, 1))).toBe(true);
      }
    });

    test('should not identify terminals as simples', () => {
      expect(isSimple(createNumberTile(TileSuit.CHARACTER, 1, 1))).toBe(false);
      expect(isSimple(createNumberTile(TileSuit.CHARACTER, 9, 1))).toBe(false);
    });

    test('should not identify honors as simples', () => {
      expect(isSimple(createWindTile(WindType.EAST, 1))).toBe(false);
    });
  });

  describe('Bonus detection', () => {
    test('should identify bonus tiles (flowers and seasons)', () => {
      expect(isBonus(createFlowerTile(FlowerType.PLUM, 1))).toBe(true);
      expect(isBonus(createSeasonTile(SeasonType.SPRING, 1))).toBe(true);
    });

    test('should not identify regular tiles as bonus', () => {
      expect(isBonus(createNumberTile(TileSuit.CHARACTER, 1, 1))).toBe(false);
      expect(isBonus(createWindTile(WindType.EAST, 1))).toBe(false);
    });
  });

  describe('Consecutive tiles detection', () => {
    test('should recognize consecutive tiles', () => {
      const tile1 = createNumberTile(TileSuit.CHARACTER, 1, 1);
      const tile2 = createNumberTile(TileSuit.CHARACTER, 2, 1);
      const tile3 = createNumberTile(TileSuit.CHARACTER, 3, 1);
      expect(areConsecutive(tile1, tile2, tile3)).toBe(true);
    });

    test('should recognize consecutive tiles in any order', () => {
      const tile1 = createNumberTile(TileSuit.CHARACTER, 1, 1);
      const tile2 = createNumberTile(TileSuit.CHARACTER, 2, 1);
      const tile3 = createNumberTile(TileSuit.CHARACTER, 3, 1);
      expect(areConsecutive(tile3, tile1, tile2)).toBe(true);
    });

    test('should not recognize non-consecutive tiles', () => {
      const tile1 = createNumberTile(TileSuit.CHARACTER, 1, 1);
      const tile2 = createNumberTile(TileSuit.CHARACTER, 2, 1);
      const tile4 = createNumberTile(TileSuit.CHARACTER, 4, 1);
      expect(areConsecutive(tile1, tile2, tile4)).toBe(false);
    });

    test('should not recognize consecutive tiles from different suits', () => {
      const tile1 = createNumberTile(TileSuit.CHARACTER, 1, 1);
      const tile2 = createNumberTile(TileSuit.BAMBOO, 2, 1);
      const tile3 = createNumberTile(TileSuit.DOT, 3, 1);
      expect(areConsecutive(tile1, tile2, tile3)).toBe(false);
    });
  });
});
