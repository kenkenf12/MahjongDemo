/**
 * Wall - Manages the tile wall (wall draw, shuffling, kong replacements)
 *
 * The wall holds all tiles not dealt to players. Players draw from the wall
 * one at a time. When a player declares a kong, they draw a replacement tile
 * from the end of the wall.
 *
 * Bonus tiles (flowers/seasons) in initial deal are replaced immediately.
 */

import { Tile, isBonus } from '../models/Tile';
import { STANDARD_TILE_SET, GAME_CONSTANTS } from '../constants';

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
   * East gets 14 tiles, others get 13 each (after bonus replacement)
   * Bonus tiles are automatically replaced with wall tiles
   *
   * @returns Array of 4 hands: [East (14), South (13), West (13), North (13)]
   */
  dealInitial(): Tile[][] {
    const hands: Tile[][] = [[], [], [], []];

    // Each player draws 3 tiles, 4 times (13 total per player initially)
    for (let round = 0; round < 4; round++) {
      for (let player = 0; player < 4; player++) {
        const tile = this.tiles[this.drawIndex];
        this.drawIndex++;
        hands[player].push(tile);
      }
    }

    // East gets one more tile
    hands[0].push(this.tiles[this.drawIndex]);
    this.drawIndex++;

    // Replace bonus tiles in each hand
    // This automatically removes bonus tiles and draws replacements from wall
    for (let player = 0; player < 4; player++) {
      let replaced = true;
      while (replaced) {
        replaced = false;
        const bonusIndex = hands[player].findIndex(tile => isBonus(tile));
        if (bonusIndex >= 0) {
          // Remove bonus tile from hand
          hands[player].splice(bonusIndex, 1);
          replaced = true;

          // Draw replacement from wall
          if (this.drawIndex < this.tiles.length - GAME_CONSTANTS.KONG_REPLACEMENT_TILES) {
            const replacement = this.tiles[this.drawIndex];
            this.drawIndex++;
            hands[player].push(replacement);
            
            // If replacement is also bonus, loop will continue
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
