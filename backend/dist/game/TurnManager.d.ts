/**
 * Turn Manager - Manages turn sequence and game flow
 *
 * Handles:
 * - Turn transitions (draw → discard → claim → resolution)
 * - Action validation (can this player do this action now?)
 * - Claim conflict resolution
 * - Game end detection
 */
import { GameState, PlayerAction, Position, PlayerState } from '../models/GameState';
import { Tile } from '../models/Tile';
export interface Claim {
    claimedBy: Position;
    claimType: PlayerAction;
    priority: number;
}
export declare class TurnManager {
    /**
     * Start a new turn for the given player
     * Resets turn flags, changes phase to WAITING_FOR_DRAW
     */
    static startTurn(state: GameState, position: Position): void;
    /**
     * Handle player drawing a tile
     * Validates it's the right player's turn and they haven't drawn yet
     */
    static handleDraw(state: GameState, position: Position, newTile: Tile): boolean;
    /**
     * Handle player discarding a tile
     * Validates the tile is in their hand and they've drawn
     */
    static handleDiscard(state: GameState, position: Position, tile: Tile): boolean;
    /**
     * Get valid claims for other players (who can claim the discarded tile)
     */
    static getValidClaimsForDiscard(state: GameState, claimingPlayer: Position): PlayerAction[];
    /**
     * Check if player can chow (only right neighbor)
     */
    private static canClaimChow;
    /**
     * Check if player can pong (has 2 identical tiles)
     */
    private static canClaimPong;
    /**
     * Check if player can kong (has 3 identical tiles)
     */
    private static canClaimKong;
    /**
     * Check if player can win (would form 4 melds + 1 pair)
     */
    private static canClaimWin;
    /**
     * Handle claim from another player
     */
    static handleClaim(state: GameState, position: Position, claimType: PlayerAction): Claim;
    /**
     * Resolve conflicting claims (multiple players claiming same discard)
     * Return the winning claim (highest priority)
     */
    static resolveClaimConflict(claims: Claim[]): Claim | null;
    /**
     * End turn and move to next player
     * Called when no one claims the discard
     */
    static endTurn(state: GameState): void;
    /**
     * Check if wall is exhausted
     */
    static isWallExhausted(state: GameState): boolean;
    /**
     * Check if game is over (wall exhausted with no winner)
     */
    static checkGameOver(state: GameState): boolean;
    /**
     * Get all players who are waiting for their turn (in claim window)
     */
    static getPlayersAwaitingClaim(state: GameState): PlayerState[];
}
//# sourceMappingURL=TurnManager.d.ts.map