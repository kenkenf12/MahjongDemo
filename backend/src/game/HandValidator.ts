/**
 * Hand Validator - Validates winning hands and recognizes patterns
 *
 * Core logic:
 * 1. A winning hand must have exactly 14 tiles
 * 2. Must consist of 4 melds + 1 pair (4×3 + 2 = 14)
 * 3. Each meld can be Chow, Pong, or Kong
 * 4. Bonus tiles (flowers/seasons) are separate and give bonus fan
 */

import { Tile, areSameTileType, areConsecutive, isTerminal, isHonor, isBonus } from '../models/Tile.js';
import { Meld, MeldType, Pair, HandPattern, createChow, createPong, createKong, createPair } from '../models/Meld.js';

export interface ValidationResult {
  isValid: boolean;
  pattern?: HandPattern;
  errors: string[];
}

export class HandValidator {
  /**
   * Validate if a hand is a winning hand
   *
   * @param handTiles Regular tiles in hand (14 tiles)
   * @param bonusTiles Bonus tiles (flowers/seasons, drawn separately)
   * @returns ValidationResult with pattern if valid
   */
  static validateWinningHand(handTiles: Tile[], bonusTiles: Tile[] = []): ValidationResult {
    const errors: string[] = [];

    // Check tile count
    if (handTiles.length !== 14) {
      errors.push(`Hand must have exactly 14 tiles, got ${handTiles.length}`);
      return { isValid: false, errors };
    }

    // Check no bonus tiles in hand
    for (const tile of handTiles) {
      if (isBonus(tile)) {
        errors.push(`Bonus tiles should not be in main hand: ${tile.displayName}`);
      }
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    // Try to find valid pattern
    const pattern = this.findWinningPattern(handTiles, bonusTiles);

    if (pattern) {
      return { isValid: true, pattern, errors: [] };
    } else {
      return { isValid: false, errors: ['No valid winning pattern found (4 melds + 1 pair required)'] };
    }
  }

  /**
   * Find a valid winning pattern (4 melds + 1 pair)
   * Uses recursive backtracking to find valid meld combinations
   */
  private static findWinningPattern(tiles: Tile[], bonusTiles: Tile[]): HandPattern | null {
    // Separate flowers and seasons
    const flowers = bonusTiles.filter(t => t.suit === 'flower');
    const seasons = bonusTiles.filter(t => t.suit === 'season');

    // Try to find 4 melds + 1 pair
    const melds: Meld[] = [];
    const remaining = [...tiles];

    // Try to extract 4 melds
    for (let i = 0; i < 4; i++) {
      const meld = this.extractMeld(remaining);
      if (meld === null) {
        return null;
      }
      melds.push(meld);
    }

    // Remaining 2 tiles should form a pair
    if (remaining.length !== 2) {
      return null;
    }

    if (!areSameTileType(remaining[0], remaining[1])) {
      return null;
    }

    const pair = createPair(remaining);

    return {
      melds,
      pair,
      flowers,
      seasons
    };
  }

  /**
   * Try to extract one meld from tiles
   * Returns the meld and removes tiles from array
   */
  private static extractMeld(tiles: Tile[]): Meld | null {
    if (tiles.length < 3) {
      return null;
    }

    // Sort tiles for consistent extraction
    const sorted = [...tiles].sort((a, b) => a.sortKey - b.sortKey);

    // Try pong first (more restrictive)
    const pongIndices = this.findPong(sorted);
    if (pongIndices !== null) {
      const pongTiles = pongIndices.map(i => tiles[tiles.indexOf(sorted[i])]);
      // Remove from tiles in reverse order to maintain indices
      pongIndices.sort((a, b) => b - a);
      for (const idx of pongIndices) {
        tiles.splice(tiles.indexOf(sorted[idx]), 1);
      }
      return createPong(pongTiles);
    }

    // Then try chow
    const chowIndices = this.findChow(sorted);
    if (chowIndices !== null) {
      const chowTiles = chowIndices.map(i => sorted[i]);
      for (const tile of chowTiles) {
        const idx = tiles.indexOf(tile);
        if (idx > -1) {
          tiles.splice(idx, 1);
        }
      }
      return createChow(chowTiles);
    }

    return null;
  }

  /**
   * Find a pong (3 identical tiles) in sorted tiles
   * @returns Indices of 3 identical tiles, or null
   */
  private static findPong(tiles: Tile[]): number[] | null {
    for (let i = 0; i < tiles.length - 2; i++) {
      if (areSameTileType(tiles[i], tiles[i + 1]) && areSameTileType(tiles[i + 1], tiles[i + 2])) {
        return [i, i + 1, i + 2];
      }
    }
    return null;
  }

  /**
   * Find a chow (3 consecutive tiles) in sorted tiles
   * @returns Indices of 3 consecutive tiles, or null
   */
  private static findChow(tiles: Tile[]): number[] | null {
    for (let i = 0; i < tiles.length - 2; i++) {
      for (let j = i + 1; j < tiles.length - 1; j++) {
        for (let k = j + 1; k < tiles.length; k++) {
          if (areConsecutive(tiles[i], tiles[j], tiles[k])) {
            return [i, j, k];
          }
        }
      }
    }
    return null;
  }

  /**
   * Check if a hand is all simples (2-8 only, no terminals or honors)
   */
  static isAllSimples(pattern: HandPattern): boolean {
    const allTiles = pattern.melds.flatMap(m => m.tiles);
    return allTiles.every(tile => {
      return tile.rank !== undefined && tile.rank >= 2 && tile.rank <= 8;
    });
  }

  /**
   * Check if a hand has all terminals or honors
   * (At least one terminal or honor in each meld)
   */
  static isAllTerminalsAndHonors(pattern: HandPattern): boolean {
    return pattern.melds.every(meld => {
      return meld.tiles.some(tile => isTerminal(tile) || isHonor(tile));
    });
  }

  /**
   * Check if hand is only one suit (not including honors)
   */
  static isOneSuit(pattern: HandPattern): boolean {
    const allTiles = pattern.melds.flatMap(m => m.tiles).concat(pattern.pair.tiles);
    const suits = new Set(allTiles.map(t => t.suit).filter(s => s !== 'wind' && s !== 'dragon'));
    return suits.size <= 1;
  }

  /**
   * Check if winning tile was self-drawn (always have at least one complete meld that includes the tile)
   * or claimed from discard (discard tile completes the hand)
   */
  static isWinByDiscard(winningTile: Tile, pattern: HandPattern): boolean {
    // If winning tile is in a pair, it's self-draw
    if (areSameTileType(winningTile, pattern.pair.tiles[0])) {
      return false;
    }

    // If winning tile is in a pong, could be either
    // In this implementation, we assume any winning tile that completes a meld could be from discard
    const winningInMeld = pattern.melds.some(meld => 
      meld.tiles.some(t => areSameTileType(t, winningTile))
    );

    // Default: assume discard if winning tile is in a meld (not pair)
    return winningInMeld;
  }
}
