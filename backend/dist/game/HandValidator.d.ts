/**
 * Hand Validator - Validates winning hands and recognizes patterns
 *
 * Core logic:
 * 1. A winning hand must have exactly 14 tiles
 * 2. Must consist of 4 melds + 1 pair (4×3 + 2 = 14)
 * 3. Each meld can be Chow, Pong, or Kong
 * 4. Bonus tiles (flowers/seasons) are separate and give bonus fan
 */
import { Tile } from '../models/Tile.js';
import { HandPattern } from '../models/Meld.js';
export interface ValidationResult {
    isValid: boolean;
    pattern?: HandPattern;
    errors: string[];
}
export declare class HandValidator {
    /**
     * Validate if a hand is a winning hand
     *
     * @param handTiles Regular tiles in hand (14 tiles)
     * @param bonusTiles Bonus tiles (flowers/seasons, drawn separately)
     * @returns ValidationResult with pattern if valid
     */
    static validateWinningHand(handTiles: Tile[], bonusTiles?: Tile[]): ValidationResult;
    /**
     * Find a valid winning pattern (4 melds + 1 pair)
     * Uses recursive backtracking to find valid meld combinations
     */
    private static findWinningPattern;
    /**
     * Try to extract one meld from tiles
     * Returns the meld and removes tiles from array
     */
    private static extractMeld;
    /**
     * Find a pong (3 identical tiles) in sorted tiles
     * @returns Indices of 3 identical tiles, or null
     */
    private static findPong;
    /**
     * Find a chow (3 consecutive tiles) in sorted tiles
     * @returns Indices of 3 consecutive tiles, or null
     */
    private static findChow;
    /**
     * Check if a hand is all simples (2-8 only, no terminals or honors)
     */
    static isAllSimples(pattern: HandPattern): boolean;
    /**
     * Check if a hand has all terminals or honors
     * (At least one terminal or honor in each meld)
     */
    static isAllTerminalsAndHonors(pattern: HandPattern): boolean;
    /**
     * Check if hand is only one suit (not including honors)
     */
    static isOneSuit(pattern: HandPattern): boolean;
    /**
     * Check if winning tile was self-drawn (always have at least one complete meld that includes the tile)
     * or claimed from discard (discard tile completes the hand)
     */
    static isWinByDiscard(winningTile: Tile, pattern: HandPattern): boolean;
}
//# sourceMappingURL=HandValidator.d.ts.map