/**
 * Meld Model - Represents groups of tiles (melds) in a hand
 *
 * A meld is a group of tiles that forms a valid pattern:
 * - Chow (顺): 3 consecutive numbered tiles of same suit (e.g., 1m 2m 3m)
 * - Pong (碰): 3 identical tiles (triplet)
 * - Kong (杠): 4 identical tiles (quad)
 * - Concealed Kong (暗杠): Kong formed from hand (not from discard claim)
 */

import { Tile } from './Tile.js';

/**
 * Types of melds
 */
export enum MeldType {
  CHOW = 'chow',
  PONG = 'pong',
  KONG = 'kong',
  CONCEALED_KONG = 'concealed_kong'
}

/**
 * Meld interface
 */
export interface Meld {
  type: MeldType;
  tiles: Tile[];
  isConcealed?: boolean;  // For kong - true if concealed, false if exposed
  isKongFromDiscard?: boolean;  // True if kong added after initial hand
}

/**
 * Pair interface (winning hand must have exactly 1 pair)
 */
export interface Pair {
  tiles: [Tile, Tile];  // Exactly 2 identical tiles
}

/**
 * Hand pattern - the complete winning hand structure
 */
export interface HandPattern {
  melds: Meld[];
  pair: Pair;
  flowers: Tile[];
  seasons: Tile[];
}

/**
 * Create a chow (sequence of 3)
 * @param tiles Must be 3 consecutive numbered tiles of same suit
 */
export function createChow(tiles: Tile[]): Meld {
  if (tiles.length !== 3) {
    throw new Error('Chow must have exactly 3 tiles');
  }
  return {
    type: MeldType.CHOW,
    tiles: [...tiles],
    isConcealed: false
  };
}

/**
 * Create a pong (triplet)
 * @param tiles Must be 3 identical tiles
 */
export function createPong(tiles: Tile[], isConcealed: boolean = false): Meld {
  if (tiles.length !== 3) {
    throw new Error('Pong must have exactly 3 tiles');
  }
  return {
    type: MeldType.PONG,
    tiles: [...tiles],
    isConcealed
  };
}

/**
 * Create a kong (quad)
 * @param tiles Must be 4 identical tiles
 */
export function createKong(tiles: Tile[], isConcealed: boolean = false): Meld {
  if (tiles.length !== 4) {
    throw new Error('Kong must have exactly 4 tiles');
  }
  return {
    type: MeldType.KONG,
    tiles: [...tiles],
    isConcealed
  };
}

/**
 * Create a pair (winning hand must have exactly 1)
 * @param tiles Must be 2 identical tiles
 */
export function createPair(tiles: Tile[]): Pair {
  if (tiles.length !== 2) {
    throw new Error('Pair must have exactly 2 tiles');
  }
  return {
    tiles: [tiles[0], tiles[1]]
  };
}

/**
 * Get fan value for a meld (before pattern bonuses)
 */
export function getMeldFanValue(meld: Meld, fanValues: { [key: string]: number }): number {
  switch (meld.type) {
    case MeldType.PONG:
      // Pongs are worth 1 fan (same whether concealed or exposed in Hong Kong)
      return fanValues.PONG_EXPOSED || 1;

    case MeldType.KONG:
      // Kong worth 1 if exposed, 2 if concealed
      return meld.isConcealed ? (fanValues.KONG_CONCEALED || 2) : (fanValues.KONG_EXPOSED || 1);

    case MeldType.CHOW:
      // Chows are worth 0 fan (but required for hand structure)
      return 0;

    default:
      return 0;
  }
}

/**
 * Get total fan from bonus tiles (flowers and seasons)
 */
export function getBonusFanValue(
  flowers: Tile[],
  seasons: Tile[],
  fanValues: { [key: string]: number }
): number {
  const flowerFan = flowers.length * (fanValues.FLOWER || 1);
  const seasonFan = seasons.length * (fanValues.SEASON || 1);
  return flowerFan + seasonFan;
}
