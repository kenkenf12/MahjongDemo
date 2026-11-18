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
export declare enum TileSuit {
    CHARACTER = "character",// 萬 (man)
    BAMBOO = "bamboo",// 索 (suo)
    DOT = "dot",// 筒 (tong)
    WIND = "wind",// 風 (feng)
    DRAGON = "dragon",// 龍 (long)
    FLOWER = "flower",// 花 (hua)
    SEASON = "season"
}
/**
 * Wind directions
 */
export declare enum WindType {
    EAST = "east",// 東 (dong)
    SOUTH = "south",// 南 (nan)
    WEST = "west",// 西 (xi)
    NORTH = "north"
}
/**
 * Dragon types
 */
export declare enum DragonType {
    RED = "red",// 紅 (hong)
    GREEN = "green",// 綠 (lü)
    WHITE = "white"
}
/**
 * Flower and Season names
 */
export declare enum FlowerType {
    PLUM = "plum",// 梅 (mei)
    ORCHID = "orchid",// 蘭 (lan)
    BAMBOO_F = "bamboo_f",// 竹 (zhu) - note: different from bamboo suit
    CHRYSANTHEMUM = "chrysanthemum"
}
export declare enum SeasonType {
    SPRING = "spring",// 春 (chun)
    SUMMER = "summer",// 夏 (xia)
    AUTUMN = "autumn",// 秋 (qiu)
    WINTER = "winter"
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
export declare function createNumberTile(suit: TileSuit, rank: number, instance: number): Tile;
/**
 * Create a wind tile
 */
export declare function createWindTile(wind: WindType, instance: number): Tile;
/**
 * Create a dragon tile
 */
export declare function createDragonTile(dragon: DragonType, instance: number): Tile;
/**
 * Create a flower tile (bonus tile, not part of hand)
 */
export declare function createFlowerTile(flower: FlowerType, instance: number): Tile;
/**
 * Create a season tile (bonus tile, not part of hand)
 */
export declare function createSeasonTile(season: SeasonType, instance: number): Tile;
/**
 * Check if two tiles are the same type (ignoring instance)
 */
export declare function areSameTileType(tile1: Tile, tile2: Tile): boolean;
/**
 * Get human-readable tile name for debugging/display
 */
export declare function getTileName(tile: Tile): string;
/**
 * Check if tile is a terminal (1 or 9 in number suits)
 */
export declare function isTerminal(tile: Tile): boolean;
/**
 * Check if tile is an honor (wind or dragon)
 */
export declare function isHonor(tile: Tile): boolean;
/**
 * Check if tile is a terminal or honor
 */
export declare function isTerminalOrHonor(tile: Tile): boolean;
/**
 * Check if tile is a simple (2-8 in number suits)
 */
export declare function isSimple(tile: Tile): boolean;
/**
 * Check if tile is a bonus tile (flower or season)
 */
export declare function isBonus(tile: Tile): boolean;
/**
 * Check if tiles are consecutive in the same suit (for chow detection)
 */
export declare function areConsecutive(tile1: Tile, tile2: Tile, tile3: Tile): boolean;
//# sourceMappingURL=Tile.d.ts.map