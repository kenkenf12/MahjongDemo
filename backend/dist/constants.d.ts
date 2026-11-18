/**
 * Game Constants - Core game values and tile definitions
 *
 * Defines:
 * - Total tile counts and distribution
 * - Standard game constants
 * - Default configuration values
 */
import { Tile, TileSuit } from './models/Tile';
/**
 * Standard Hong Kong Mahjong tile set
 * Total: 144 tiles
 */
export declare const STANDARD_TILE_SET: Tile[];
/**
 * Tile count constants
 */
export declare const TILE_COUNTS: {
    TOTAL: number;
    PER_SUIT: {
        CHARACTER: number;
        BAMBOO: number;
        DOT: number;
        WIND: number;
        DRAGON: number;
        FLOWER: number;
        SEASON: number;
    };
    STANDARD_PLAY: number;
    DEALING: {
        EAST_INITIAL: number;
        OTHER_INITIAL: number;
        TOTAL_DEALT: number;
    };
};
/**
 * Hand size constants
 */
export declare const HAND_SIZES: {
    INITIAL_EAST: number;
    INITIAL_OTHER: number;
    AFTER_DRAW: number;
    AFTER_DISCARD: number;
    WINNING_HAND: number;
};
/**
 * Game constants
 */
export declare const GAME_CONSTANTS: {
    PLAYERS: number;
    POSITIONS: readonly ["East", "South", "West", "North"];
    DEALER_POSITION: string;
    MINIMUM_FAN_TO_WIN: number;
    MAXIMUM_FAN_REALISTIC: number;
    WALL_SIZE: number;
    KONG_REPLACEMENT_TILES: number;
};
/**
 * Meld type constants
 */
export declare enum MeldType {
    CHOW = "chow",// 顺 (shun) - sequence
    PONG = "pong",// 碰 (peng) - triplet
    KONG = "kong",// 杠 (gang) - quad
    CONCEALED_KONG = "concealed_kong"
}
/**
 * Action types available during a turn
 */
export declare enum PlayerAction {
    DRAW = "draw",
    DISCARD = "discard",
    CLAIM_CHOW = "claim_chow",
    CLAIM_PONG = "claim_pong",
    CLAIM_KONG = "claim_kong",
    CLAIM_WIN = "claim_win",
    PASS = "pass",
    DECLARE_KONG = "declare_kong"
}
/**
 * Game phases
 */
export declare enum GamePhase {
    INITIALIZING = "initializing",
    WAITING_FOR_DRAW = "waiting_for_draw",
    WAITING_FOR_DISCARD = "waiting_for_discard",
    CLAIM_WINDOW = "claim_window",// Other players can claim discarded tile
    TURN_COMPLETE = "turn_complete",
    GAME_OVER = "game_over",
    ALL_PASS = "all_pass"
}
/**
 * Claim priority (for resolving conflicts when multiple players claim same tile)
 * Higher number = higher priority
 */
export declare const CLAIM_PRIORITY: {
    readonly claim_win: 4;
    readonly claim_kong: 3;
    readonly claim_pong: 2;
    readonly claim_chow: 1;
    readonly pass: 0;
};
/**
 * Default fan values for patterns
 */
export declare const DEFAULT_FAN_VALUES: {
    PONG_EXPOSED: number;
    PONG_CONCEALED: number;
    KONG_EXPOSED: number;
    KONG_CONCEALED: number;
    FLOWER: number;
    SEASON: number;
    ALL_SIMPLES: number;
    ALL_TERMINALS_AND_HONORS: number;
    SELF_DRAW_BONUS: number;
};
/**
 * Validation constants
 */
export declare const VALIDATION: {
    MIN_FAN: number;
    MAX_FAN_FOR_CAP: number;
    MIN_PLAYERS_ACTIVE: number;
};
/**
 * Tile distribution per suit (for 4 copies of each rank)
 */
export declare function getTileDistribution(): {
    suit: TileSuit;
    count: number;
}[];
//# sourceMappingURL=constants.d.ts.map