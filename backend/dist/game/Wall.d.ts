/**
 * Wall - Manages the tile wall (wall draw, shuffling, kong replacements)
 *
 * The wall holds all tiles not dealt to players. Players draw from the wall
 * one at a time. When a player declares a kong, they draw a replacement tile
 * from the end of the wall.
 *
 * Bonus tiles (flowers/seasons) in initial deal are replaced immediately.
 */
import { Tile } from '../models/Tile.js';
export declare class Wall {
    private tiles;
    private drawIndex;
    private replacementIndex;
    /**
     * Initialize wall with standard tile set and shuffle
     */
    constructor();
    /**
     * Reset wall to initial state
     */
    reset(): void;
    /**
     * Shuffle tiles using Fisher-Yates algorithm
     */
    private shuffle;
    /**
     * Deal initial hand to 4 players
     * East gets exactly 14 non-bonus tiles, others get exactly 13 each
     * Bonus tiles encountered during dealing are kept aside and NOT added to hands
     *
     * Algorithm:
     * 1. Deal 3 tiles per player, 4 times in standard Hong Kong sequence
     * 2. East gets 1 extra tile
     * 3. When a bonus tile is encountered, we skip it (don't add to hand)
     * 4. Continue drawing from wall until each player has their target count
     * 5. Bonus tiles are effectively "consumed" from the wall
     *
     * Note: In a full game, bonus tiles would be separated and tracked separately.
     * This simplified version just removes them during dealing.
     *
     * @returns Array of 4 hands: [East (14), South (13), West (13), North (13)] - all non-bonus
     */
    dealInitial(): Tile[][];
    /**
     * Draw one tile from the wall (for regular turns)
     */
    draw(): Tile | null;
    /**
     * Draw kong replacement tile from the end of the wall
     */
    drawKongReplacement(): Tile | null;
    /**
     * Check if wall has any tiles remaining for regular draw
     */
    hasRemaining(): boolean;
    /**
     * Get number of tiles remaining in regular draw area (excluding kong replacement area)
     */
    tilesRemaining(): number;
    /**
     * Get number of kong replacements remaining
     */
    kongReplacementsRemaining(): number;
    /**
     * Get wall statistics (for testing/debugging)
     */
    getStats(): {
        totalTiles: number;
        tilesUsedSoFar: number;
        tilesRemaining: number;
        kongReplacementsRemaining: number;
    };
}
//# sourceMappingURL=Wall.d.ts.map