/**
 * Game State Model - Complete game state structure
 *
 * Tracks:
 * - Room info (code, players)
 * - Game phase (waiting, playing, completed)
 * - Player hands, melds, discards
 * - Wall state
 * - Turn sequence
 * - Scores and settlement
 */
import { Tile } from './Tile.js';
import { Meld } from './Meld.js';
import { Position as PositionType } from '../types.js';
export type Position = PositionType;
/**
 * Game phases during a round
 */
export declare enum GamePhase {
    INITIALIZING = "initializing",// Setting up
    WAITING_FOR_DRAW = "waiting_for_draw",// Current player's turn to draw
    WAITING_FOR_DISCARD = "waiting_for_discard",// Current player's turn to discard
    CLAIM_WINDOW = "claim_window",// Other players can claim
    TURN_COMPLETE = "turn_complete",// Transition to next player
    GAME_OVER = "game_over",// Round completed (winner or draw)
    ALL_PASS = "all_pass"
}
/**
 * Player action types
 */
export declare enum PlayerAction {
    DRAW = "draw",
    DISCARD = "discard",
    CLAIM_CHOW = "claim_chow",
    CLAIM_PONG = "claim_pong",
    CLAIM_KONG = "claim_kong",
    CLAIM_WIN = "claim_win",
    DECLARE_KONG = "declare_kong",
    PASS = "pass"
}
/**
 * Player state (per player)
 */
export interface PlayerState {
    position: Position;
    isDealer: boolean;
    hand: Tile[];
    melds: Meld[];
    discards: Tile[];
    bonusTiles: Tile[];
    score: number;
    isConnected: boolean;
    isCurrentPlayer: boolean;
    hasDrawn: boolean;
    hasDiscarded: boolean;
}
/**
 * Discard state (the most recent discard)
 */
export interface DiscardState {
    tile: Tile;
    fromPosition: Position;
    timestamp: number;
    claimedBy?: Position;
    claimType?: PlayerAction;
}
/**
 * Game state (complete round state)
 */
export interface GameState {
    roomCode: string;
    isActive: boolean;
    players: {
        [position in Position]: PlayerState;
    };
    wallTilesRemaining: number;
    kongReplacementsRemaining: number;
    phase: GamePhase;
    currentPlayer: Position;
    discardRound: number;
    lastDiscard?: DiscardState;
    roundWinner?: Position;
    roundFan?: number;
    roundSettlement?: {
        [position in Position]: number;
    };
    roundStartTime: number;
    lastActionTime: number;
    dealerPosition: Position;
    roundNumber: number;
}
/**
 * Create initial player state
 */
export declare function createPlayerState(position: Position, isDealer: boolean): PlayerState;
/**
 * Create initial game state
 */
export declare function createGameState(roomCode: string, dealerPosition?: Position): GameState;
/**
 * Get next player in clockwise order
 */
export declare function getNextPlayer(current: Position): Position;
/**
 * Get all players except current
 */
export declare function getOtherPlayers(state: GameState, position: Position): PlayerState[];
/**
 * Check if hand has tiles (for validation)
 */
export declare function hasValidHandSize(player: PlayerState, isCurrentPlayer: boolean, hasDrawn: boolean): boolean;
/**
 * Count total tiles in player's holdings
 */
export declare function getTotalPlayerTiles(player: PlayerState): number;
/**
 * Get player by position
 */
export declare function getPlayer(state: GameState, position: Position): PlayerState;
/**
 * Check if all players are connected
 */
export declare function areAllPlayersConnected(state: GameState): boolean;
/**
 * Check if game is in active play phase
 */
export declare function isGameInPlay(state: GameState): boolean;
//# sourceMappingURL=GameState.d.ts.map