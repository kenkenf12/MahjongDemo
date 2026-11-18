/**
 * Action Validator - Validates player actions
 *
 * Ensures:
 * - Player has valid action for current game phase
 * - Player has required tiles/melds for action
 * - Game rules are followed
 */
import { GameState, PlayerAction, Position } from '../models/GameState';
import { Tile } from '../models/Tile';
export interface ActionValidationResult {
    isValid: boolean;
    errors: string[];
}
export declare class ActionValidator {
    /**
     * Validate a draw action
     */
    static validateDraw(state: GameState, position: Position): ActionValidationResult;
    /**
     * Validate a discard action
     */
    static validateDiscard(state: GameState, position: Position, tile: Tile): ActionValidationResult;
    /**
     * Validate a claim action (chow, pong, kong, win)
     */
    static validateClaim(state: GameState, position: Position, claimType: PlayerAction): ActionValidationResult;
    /**
     * Validate declaring a kong from concealed hand
     */
    static validateDeclareKong(state: GameState, position: Position, tile: Tile): ActionValidationResult;
    /**
     * Check if player can chow (only right neighbor, has 2 consecutive tiles)
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
     * Check if claiming tile results in a win
     */
    private static canClaimWin;
    /**
     * Validate all preconditions for game to start
     */
    static validateGameStart(state: GameState): ActionValidationResult;
    /**
     * Get all valid actions for a player in current game state
     */
    static getValidActions(state: GameState, position: Position): PlayerAction[];
}
//# sourceMappingURL=ActionValidator.d.ts.map