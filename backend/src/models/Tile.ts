/**
 * Tile Model - Core tile representation for Hong Kong Mahjong
 *
 * A standard set consists of 144 tiles:
 * - 36 Character tiles (1-9 of characters, 4 copies each)
 * - 36 Bamboo tiles (1-9 of bamboos, 4 copies each)
 * - 36 Dot tiles (1-9 of dots, 4 copies each)
 * - 16 Wind tiles (4 winds × 4 copies)
 * - 12 Dragon tiles (3 dragons × 4 copies)
 * - 8 Flower tiles (4 flowers × 2 copies) - optional play
 * - 8 Season tiles (4 seasons × 2 copies) - optional play
 */

/**
 * Tile suit enumeration
 */
export enum TileSuit {
  CHARACTER = 'character',  // 萬 (man)
  BAMBOO = 'bamboo',        // 索 (suo)
  DOT = 'dot',              // 筒 (tong)
  WIND = 'wind',            // 風 (feng)
  DRAGON = 'dragon',        // 龍 (long)
  FLOWER = 'flower',        // 花 (hua)
  SEASON = 'season'         // 季 (ji)
}

/**
 * Wind directions
 */
export enum WindType {
  EAST = 'east',    // 東 (dong)
  SOUTH = 'south',  // 南 (nan)
  WEST = 'west',    // 西 (xi)
  NORTH = 'north'   // 北 (bei)
}

/**
 * Dragon types
 */
export enum DragonType {
  RED = 'red',      // 紅 (hong)
  GREEN = 'green',  // 綠 (lü)
  WHITE = 'white'   // 白 (bai)
}

/**
 * Flower and Season names
 */
export enum FlowerType {
  PLUM = 'plum',       // 梅 (mei)
  ORCHID = 'orchid',   // 蘭 (lan)
  BAMBOO_F = 'bamboo_f', // 竹 (zhu) - note: different from bamboo suit
  CHRYSANTHEMUM = 'chrysanthemum' // 菊 (ju)
}

export enum SeasonType {
  SPRING = 'spring',     // 春 (chun)
  SUMMER = 'summer',     // 夏 (xia)
  AUTUMN = 'autumn',     // 秋 (qiu)
  WINTER = 'winter'      // 冬 (dong)
}

/**
 * Core tile interface
 */
export interface Tile {
  /** Unique identifier for this tile instance */
  id: string;

  /** Suit of the tile */
  suit: TileSuit;

  /** Rank for number suits (1-9), or specific type for honor tiles */
  rank?: number;
  wind?: WindType;
  dragon?: DragonType;
  flower?: FlowerType;
  season?: SeasonType;

  /** Display name for UI */
  displayName: string;

  /** Internal sorting key */
  sortKey: number;
}

/**
 * Create a numbered suit tile (character, bamboo, or dot)
 *
 * @param suit The suit (CHARACTER, BAMBOO, or DOT)
 * @param rank The rank (1-9)
 * @param instance Unique identifier for this tile instance (1-4)
 * @returns Tile interface
 */
export function createNumberTile(suit: TileSuit, rank: number, instance: number): Tile {
  if (rank < 1 || rank > 9) {
    throw new Error(`Invalid rank ${rank} for number tile. Must be 1-9.`);
  }
  if (instance < 1 || instance > 4) {
    throw new Error(`Invalid instance ${instance}. Must be 1-4.`);
  }

  const suitNames: Record<TileSuit, { name: string; abbr: string }> = {
    [TileSuit.CHARACTER]: { name: '萬', abbr: 'm' },
    [TileSuit.BAMBOO]: { name: '索', abbr: 's' },
    [TileSuit.DOT]: { name: '筒', abbr: 'p' },
    [TileSuit.WIND]: { name: '', abbr: '' },
    [TileSuit.DRAGON]: { name: '', abbr: '' },
    [TileSuit.FLOWER]: { name: '', abbr: '' },
    [TileSuit.SEASON]: { name: '', abbr: '' }
  };

  const suitInfo = suitNames[suit];
  const displayName = `${rank}${suitInfo.abbr}`;
  const sortKey = getSortKey(suit, rank);

  return {
    id: `${suit}-${rank}-${instance}`,
    suit,
    rank,
    displayName,
    sortKey
  };
}

/**
 * Create a wind tile
 */
export function createWindTile(wind: WindType, instance: number): Tile {
  if (instance < 1 || instance > 4) {
    throw new Error(`Invalid instance ${instance}. Must be 1-4.`);
  }

  const windNames = {
    [WindType.EAST]: '東',
    [WindType.SOUTH]: '南',
    [WindType.WEST]: '西',
    [WindType.NORTH]: '北'
  };

  return {
    id: `wind-${wind}-${instance}`,
    suit: TileSuit.WIND,
    wind,
    displayName: windNames[wind],
    sortKey: getSortKey(TileSuit.WIND, 0, wind)
  };
}

/**
 * Create a dragon tile
 */
export function createDragonTile(dragon: DragonType, instance: number): Tile {
  if (instance < 1 || instance > 4) {
    throw new Error(`Invalid instance ${instance}. Must be 1-4.`);
  }

  const dragonNames = {
    [DragonType.RED]: '紅',
    [DragonType.GREEN]: '綠',
    [DragonType.WHITE]: '白'
  };

  return {
    id: `dragon-${dragon}-${instance}`,
    suit: TileSuit.DRAGON,
    dragon,
    displayName: dragonNames[dragon],
    sortKey: getSortKey(TileSuit.DRAGON, 0, undefined, dragon)
  };
}

/**
 * Create a flower tile (bonus tile, not part of hand)
 */
export function createFlowerTile(flower: FlowerType, instance: number): Tile {
  if (instance < 1 || instance > 2) {
    throw new Error(`Invalid instance ${instance}. Flowers have 2 copies each.`);
  }

  const flowerNames = {
    [FlowerType.PLUM]: '梅',
    [FlowerType.ORCHID]: '蘭',
    [FlowerType.BAMBOO_F]: '竹',
    [FlowerType.CHRYSANTHEMUM]: '菊'
  };

  return {
    id: `flower-${flower}-${instance}`,
    suit: TileSuit.FLOWER,
    flower,
    displayName: flowerNames[flower],
    sortKey: 100 + Object.values(FlowerType).indexOf(flower) * 10 + instance
  };
}

/**
 * Create a season tile (bonus tile, not part of hand)
 */
export function createSeasonTile(season: SeasonType, instance: number): Tile {
  if (instance < 1 || instance > 2) {
    throw new Error(`Invalid instance ${instance}. Seasons have 2 copies each.`);
  }

  const seasonNames = {
    [SeasonType.SPRING]: '春',
    [SeasonType.SUMMER]: '夏',
    [SeasonType.AUTUMN]: '秋',
    [SeasonType.WINTER]: '冬'
  };

  return {
    id: `season-${season}-${instance}`,
    suit: TileSuit.SEASON,
    season,
    displayName: seasonNames[season],
    sortKey: 150 + Object.values(SeasonType).indexOf(season) * 10 + instance
  };
}

/**
 * Generate sort key for tile ordering
 * Used to maintain consistent tile order in display
 */
function getSortKey(
  suit: TileSuit,
  rank: number = 0,
  wind?: WindType,
  dragon?: DragonType
): number {
  const suitOrder: { [key in TileSuit]: number } = {
    [TileSuit.CHARACTER]: 0,
    [TileSuit.BAMBOO]: 10,
    [TileSuit.DOT]: 20,
    [TileSuit.WIND]: 30,
    [TileSuit.DRAGON]: 40,
    [TileSuit.FLOWER]: 100,
    [TileSuit.SEASON]: 150
  };

  let key = suitOrder[suit] + rank;

  if (wind !== undefined) {
    const windOrder = [WindType.EAST, WindType.SOUTH, WindType.WEST, WindType.NORTH];
    key = suitOrder[suit] + windOrder.indexOf(wind);
  }

  if (dragon !== undefined) {
    const dragonOrder = [DragonType.RED, DragonType.GREEN, DragonType.WHITE];
    key = suitOrder[suit] + dragonOrder.indexOf(dragon);
  }

  return key;
}

/**
 * Check if two tiles are the same type (ignoring instance)
 */
export function areSameTileType(tile1: Tile, tile2: Tile): boolean {
  if (tile1.suit !== tile2.suit) return false;

  switch (tile1.suit) {
    case TileSuit.CHARACTER:
    case TileSuit.BAMBOO:
    case TileSuit.DOT:
      return tile1.rank === tile2.rank;

    case TileSuit.WIND:
      return tile1.wind === tile2.wind;

    case TileSuit.DRAGON:
      return tile1.dragon === tile2.dragon;

    case TileSuit.FLOWER:
      return tile1.flower === tile2.flower;

    case TileSuit.SEASON:
      return tile1.season === tile2.season;

    default:
      return false;
  }
}

/**
 * Get human-readable tile name for debugging/display
 */
export function getTileName(tile: Tile): string {
  return tile.displayName;
}

/**
 * Check if tile is a terminal (1 or 9 in number suits)
 */
export function isTerminal(tile: Tile): boolean {
  if (tile.suit === TileSuit.CHARACTER || tile.suit === TileSuit.BAMBOO || tile.suit === TileSuit.DOT) {
    return tile.rank === 1 || tile.rank === 9;
  }
  return false;
}

/**
 * Check if tile is an honor (wind or dragon)
 */
export function isHonor(tile: Tile): boolean {
  return tile.suit === TileSuit.WIND || tile.suit === TileSuit.DRAGON;
}

/**
 * Check if tile is a terminal or honor
 */
export function isTerminalOrHonor(tile: Tile): boolean {
  return isTerminal(tile) || isHonor(tile);
}

/**
 * Check if tile is a simple (2-8 in number suits)
 */
export function isSimple(tile: Tile): boolean {
  if (tile.suit === TileSuit.CHARACTER || tile.suit === TileSuit.BAMBOO || tile.suit === TileSuit.DOT) {
    return tile.rank !== undefined && tile.rank >= 2 && tile.rank <= 8;
  }
  return false;
}

/**
 * Check if tile is a bonus tile (flower or season)
 */
export function isBonus(tile: Tile): boolean {
  return tile.suit === TileSuit.FLOWER || tile.suit === TileSuit.SEASON;
}

/**
 * Check if tiles are consecutive in the same suit (for chow detection)
 */
export function areConsecutive(tile1: Tile, tile2: Tile, tile3: Tile): boolean {
  if (
    tile1.suit !== tile2.suit ||
    tile2.suit !== tile3.suit ||
    !tile1.rank ||
    !tile2.rank ||
    !tile3.rank
  ) {
    return false;
  }

  const ranks = [tile1.rank, tile2.rank, tile3.rank].sort((a, b) => a - b);
  return ranks[1] === ranks[0] + 1 && ranks[2] === ranks[1] + 1;
}
