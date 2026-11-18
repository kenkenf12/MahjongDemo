/**
 * Wall - Manages the tile wall (wall draw, shuffling, kong replacements)
 *
 * The wall holds all tiles not dealt to players. Players draw from the wall
 * one at a time. When a player declares a kong, they draw a replacement tile
 * from the end of the wall.
 *
 * Bonus tiles (flowers/seasons) in initial deal are replaced immediately.
 */

import { Tile, isBonus } from '../models/Tile.js';
import { STANDARD_TILE_SET, GAME_CONSTANTS } from '../constants.js';

export class Wall {
  private tiles: Tile[] = [];
  private drawIndex: number = 0;        // Next tile to be drawn from regular wall
  private replacementIndex: number = 0; // Kong replacement position (from end)

  /**
   * Initialize wall with standard tile set and shuffle
   */
  constructor() {
    this.reset();
  }

  /**
   * Reset wall to initial state
   */
  reset(): void {
    // Deep copy to avoid modifying the constant
    this.tiles = JSON.parse(JSON.stringify(STANDARD_TILE_SET));
    this.shuffle();
    this.drawIndex = 0;
    this.replacementIndex = 0;
  }

  /**
   * Shuffle tiles using Fisher-Yates algorithm
   */
  private shuffle(): void {
    for (let i = this.tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.tiles[i], this.tiles[j]] = [this.tiles[j], this.tiles[i]];
    }
  }

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
  dealInitial(): Tile[][] {
    const hands: Tile[][] = [[], [], [], []];
    const targets = [14, 13, 13, 13];  // East, South, West, North
    
    let playerIndex = 0;
    let tilesDealtInRound = 0;
    let round = 0;
    
    while (hands[0].length < targets[0] || hands[1].length < targets[1] || 
           hands[2].length < targets[2] || hands[3].length < targets[3]) {
      
      // Determine if current draw is within valid range
      if (this.drawIndex >= this.tiles.length - GAME_CONSTANTS.KONG_REPLACEMENT_TILES) {
        // Wall exhausted - shouldn't happen in normal dealing
        break;
      }
      
      // Check if current player already has enough tiles
      if (hands[playerIndex].length >= targets[playerIndex]) {
        // Move to next player
        playerIndex = (playerIndex + 1) % 4;
        tilesDealtInRound = 0;
        if (playerIndex === 0) {
          round++;
        }
        continue;
      }
      
      // Draw a tile
      const tile = this.tiles[this.drawIndex];
      this.drawIndex++;
      
      // Skip bonus tiles (don't add to hand, just consume from wall)
      if (!isBonus(tile)) {
        hands[playerIndex].push(tile);
        tilesDealtInRound++;
        
        // Move to next player after 3 tiles (or 1 tile if it's East's extra)
        const shouldMoveToNext = (playerIndex !== 0 && tilesDealtInRound >= 3) ||
                                 (playerIndex === 0 && round < 4 && tilesDealtInRound >= 3) ||
                                 (playerIndex === 0 && round === 4 && tilesDealtInRound >= 1);
        if (shouldMoveToNext && hands[playerIndex].length < targets[playerIndex]) {
          playerIndex = (playerIndex + 1) % 4;
          tilesDealtInRound = 0;
          if (playerIndex === 0) {
            round++;
          }
        }
      }
    }
    
    return hands;
  }

  /**
   * Draw one tile from the wall (for regular turns)
   */
  draw(): Tile | null {
    if (this.drawIndex >= this.tiles.length - GAME_CONSTANTS.KONG_REPLACEMENT_TILES) {
      return null; // Wall exhausted
    }
    const tile = this.tiles[this.drawIndex];
    this.drawIndex++;
    return tile;
  }

  /**
   * Draw kong replacement tile from the end of the wall
   */
  drawKongReplacement(): Tile | null {
    const replacementStartIndex = this.tiles.length - GAME_CONSTANTS.KONG_REPLACEMENT_TILES;

    if (this.replacementIndex >= GAME_CONSTANTS.KONG_REPLACEMENT_TILES) {
      return null; // No more kong replacements available
    }

    const tile = this.tiles[replacementStartIndex + this.replacementIndex];
    this.replacementIndex++;

    return tile;
  }

  /**
   * Check if wall has any tiles remaining for regular draw
   */
  hasRemaining(): boolean {
    const remainingDraw = this.tiles.length - GAME_CONSTANTS.KONG_REPLACEMENT_TILES - this.drawIndex;
    return remainingDraw > 0;
  }

  /**
   * Get number of tiles remaining in regular draw area (excluding kong replacement area)
   */
  tilesRemaining(): number {
    const remainingDraw = this.tiles.length - GAME_CONSTANTS.KONG_REPLACEMENT_TILES - this.drawIndex;
    return Math.max(0, remainingDraw);
  }

  /**
   * Get number of kong replacements remaining
   */
  kongReplacementsRemaining(): number {
    return GAME_CONSTANTS.KONG_REPLACEMENT_TILES - this.replacementIndex;
  }

  /**
   * Get wall statistics (for testing/debugging)
   */
  getStats(): {
    totalTiles: number;
    tilesUsedSoFar: number;
    tilesRemaining: number;
    kongReplacementsRemaining: number;
  } {
    return {
      totalTiles: this.tiles.length,
      tilesUsedSoFar: this.drawIndex,
      tilesRemaining: this.tilesRemaining(),
      kongReplacementsRemaining: this.kongReplacementsRemaining()
    };
  }
}
