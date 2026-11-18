/**
 * Meld Model - Represents groups of tiles (melds) in a hand
 *
 * A meld is a group of tiles that forms a valid pattern:
 * - Chow (顺): 3 consecutive numbered tiles of same suit (e.g., 1m 2m 3m)
 * - Pong (碰): 3 identical tiles (triplet)
 * - Kong (杠): 4 identical tiles (quad)
 * - Concealed Kong (暗杠): Kong formed from hand (not from discard claim)
 */
import { Tile } from './Tile';
/**
 * Types of melds
 */
export declare enum MeldType {
    CHOW = "chow",
    PONG = "pong",
    KONG = "kong",
    CONCEALED_KONG = "concealed_kong"
}
/**
 * Meld interface
 */
export interface Meld {
    type: MeldType;
    tiles: Tile[];
    isConcealed?: boolean;
    isKongFromDiscard?: boolean;
}
/**
 * Pair interface (winning hand must have exactly 1 pair)
 */
export interface Pair {
    tiles: [Tile, Tile];
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
export declare function createChow(tiles: Tile[]): Meld;
/**
 * Create a pong (triplet)
 * @param tiles Must be 3 identical tiles
 */
export declare function createPong(tiles: Tile[], isConcealed?: boolean): Meld;
/**
 * Create a kong (quad)
 * @param tiles Must be 4 identical tiles
 */
export declare function createKong(tiles: Tile[], isConcealed?: boolean): Meld;
/**
 * Create a pair (winning hand must have exactly 1)
 * @param tiles Must be 2 identical tiles
 */
export declare function createPair(tiles: Tile[]): Pair;
/**
 * Get fan value for a meld (before pattern bonuses)
 */
export declare function getMeldFanValue(meld: Meld, fanValues: {
    [key: string]: number;
}): number;
/**
 * Get total fan from bonus tiles (flowers and seasons)
 */
export declare function getBonusFanValue(flowers: Tile[], seasons: Tile[], fanValues: {
    [key: string]: number;
}): number;
//# sourceMappingURL=Meld.d.ts.map