/**
 * Game Constants - Core game values and tile definitions
 *
 * Defines:
 * - Total tile counts and distribution
 * - Standard game constants
 * - Default configuration values
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
  createSeasonTile
} from './models/Tile.js';

/**
 * Standard Hong Kong Mahjong tile set
 * Total: 144 tiles
 */
export const STANDARD_TILE_SET: Tile[] = [
  // Character tiles (1-9, 4 copies each = 36 tiles)
  ...Array.from({ length: 4 }, (_, i) =>
    Array.from({ length: 9 }, (_, rank) => createNumberTile(TileSuit.CHARACTER, rank + 1, i + 1))
  ).flat(),

  // Bamboo tiles (1-9, 4 copies each = 36 tiles)
  ...Array.from({ length: 4 }, (_, i) =>
    Array.from({ length: 9 }, (_, rank) => createNumberTile(TileSuit.BAMBOO, rank + 1, i + 1))
  ).flat(),

  // Dot tiles (1-9, 4 copies each = 36 tiles)
  ...Array.from({ length: 4 }, (_, i) =>
    Array.from({ length: 9 }, (_, rank) => createNumberTile(TileSuit.DOT, rank + 1, i + 1))
  ).flat(),

  // Wind tiles (East, South, West, North, 4 copies each = 16 tiles)
  ...Array.from({ length: 4 }, (_, i) =>
    Object.values(WindType).map(wind => createWindTile(wind, i + 1))
  ).flat(),

  // Dragon tiles (Red, Green, White, 4 copies each = 12 tiles)
  ...Array.from({ length: 4 }, (_, i) =>
    Object.values(DragonType).map(dragon => createDragonTile(dragon, i + 1))
  ).flat(),

  // Bonus tiles: Flower + Season (4 flowers + 4 seasons = 8 tiles total)
  // In traditional Hong Kong Mahjong, flowers are tied to players (1 per player typically)
  // and seasons are also player-specific, totaling 8 bonus tiles
  ...Array.from({ length: 1 }, (_, i) =>
    Object.values(FlowerType).map(flower => createFlowerTile(flower, i + 1))
  ).flat(),

  ...Array.from({ length: 1 }, (_, i) =>
    Object.values(SeasonType).map(season => createSeasonTile(season, i + 1))
  ).flat()
];

/**
 * Tile count constants
 */
export const TILE_COUNTS = {
  TOTAL: 144,
  PER_SUIT: {
    CHARACTER: 36,
    BAMBOO: 36,
    DOT: 36,
    WIND: 16,
    DRAGON: 12,
    FLOWER: 8,
    SEASON: 8
  },
  STANDARD_PLAY: 108, // Without flowers and seasons (36 + 36 + 36)
  DEALING: {
    EAST_INITIAL: 14,     // East player gets 1 extra tile
    OTHER_INITIAL: 13,    // South, West, North each get 13
    TOTAL_DEALT: 54       // 14 + 13 + 13 + 13 = 53 (but we count 54 for wall checking)
  }
};

/**
 * Hand size constants
 */
export const HAND_SIZES = {
  INITIAL_EAST: 14,
  INITIAL_OTHER: 13,
  AFTER_DRAW: 14,
  AFTER_DISCARD: 13,
  WINNING_HAND: 14    // 4 melds (12 tiles) + 1 pair (2 tiles) = 14
};

/**
 * Game constants
 */
export const GAME_CONSTANTS = {
  PLAYERS: 4,
  POSITIONS: ['East', 'South', 'West', 'North'] as const,
  DEALER_POSITION: 'East',
  MINIMUM_FAN_TO_WIN: 1,
  MAXIMUM_FAN_REALISTIC: 100,  // Warning threshold for unusual fan counts
  WALL_SIZE: 144,
  KONG_REPLACEMENT_TILES: 4    // 4 tiles at the end of wall for kong replacements
};

/**
 * Meld type constants
 */
export enum MeldType {
  CHOW = 'chow',         // 顺 (shun) - sequence
  PONG = 'pong',         // 碰 (peng) - triplet
  KONG = 'kong',         // 杠 (gang) - quad
  CONCEALED_KONG = 'concealed_kong'  // 暗杠 (an gang)
}

/**
 * Action types available during a turn
 */
export enum PlayerAction {
  DRAW = 'draw',
  DISCARD = 'discard',
  CLAIM_CHOW = 'claim_chow',
  CLAIM_PONG = 'claim_pong',
  CLAIM_KONG = 'claim_kong',
  CLAIM_WIN = 'claim_win',
  PASS = 'pass',
  DECLARE_KONG = 'declare_kong'  // Concealed kong from hand
}

/**
 * Game phases
 */
export enum GamePhase {
  INITIALIZING = 'initializing',
  WAITING_FOR_DRAW = 'waiting_for_draw',
  WAITING_FOR_DISCARD = 'waiting_for_discard',
  CLAIM_WINDOW = 'claim_window',       // Other players can claim discarded tile
  TURN_COMPLETE = 'turn_complete',
  GAME_OVER = 'game_over',
  ALL_PASS = 'all_pass'                // No one claimed last discard
}

/**
 * Claim priority (for resolving conflicts when multiple players claim same tile)
 * Higher number = higher priority
 */
export const CLAIM_PRIORITY = {
  [PlayerAction.CLAIM_WIN]: 4,
  [PlayerAction.CLAIM_KONG]: 3,
  [PlayerAction.CLAIM_PONG]: 2,
  [PlayerAction.CLAIM_CHOW]: 1,
  [PlayerAction.PASS]: 0
} as const;

/**
 * Default fan values for patterns
 */
export const DEFAULT_FAN_VALUES = {
  PONG_EXPOSED: 1,
  PONG_CONCEALED: 1,           // Same as exposed in Hong Kong rules
  KONG_EXPOSED: 1,
  KONG_CONCEALED: 2,
  FLOWER: 1,                    // Per flower
  SEASON: 1,                    // Per season
  ALL_SIMPLES: 2,               // 2-8 only
  ALL_TERMINALS_AND_HONORS: 1,  // At least one terminal/honor in each meld
  SELF_DRAW_BONUS: 0             // No bonus in this game version (handled by payment mode)
};

/**
 * Validation constants
 */
export const VALIDATION = {
  MIN_FAN: 1,
  MAX_FAN_FOR_CAP: 8,
  MIN_PLAYERS_ACTIVE: 1  // Minimum to continue game (after disconnects)
};

/**
 * Tile distribution per suit (for 4 copies of each rank)
 */
export function getTileDistribution(): { suit: TileSuit; count: number }[] {
  return [
    { suit: TileSuit.CHARACTER, count: 36 },
    { suit: TileSuit.BAMBOO, count: 36 },
    { suit: TileSuit.DOT, count: 36 },
    { suit: TileSuit.WIND, count: 16 },
    { suit: TileSuit.DRAGON, count: 12 },
    { suit: TileSuit.FLOWER, count: 8 },
    { suit: TileSuit.SEASON, count: 8 }
  ];
}
