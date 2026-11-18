/**
 * Turn Manager - Manages turn sequence and game flow
 *
 * Handles:
 * - Turn transitions (draw → discard → claim → resolution)
 * - Action validation (can this player do this action now?)
 * - Claim conflict resolution
 * - Game end detection
 */

import { GameState, GamePhase, PlayerAction, getNextPlayer, getPlayer, Position, PlayerState } from '../models/GameState';
import { Tile, areSameTileType } from '../models/Tile';
import { Meld } from '../models/Meld';

export interface Claim {
  claimedBy: Position;
  claimType: PlayerAction;
  priority: number;
}

export class TurnManager {
  /**
   * Start a new turn for the given player
   * Resets turn flags, changes phase to WAITING_FOR_DRAW
   */
  static startTurn(state: GameState, position: Position): void {
    // Reset all player turn flags
    Object.values(state.players).forEach(p => {
      p.isCurrentPlayer = false;
      p.hasDrawn = false;
      p.hasDiscarded = false;
    });

    // Set current player
    const player = getPlayer(state, position);
    player.isCurrentPlayer = true;
    state.currentPlayer = position;
    state.phase = GamePhase.WAITING_FOR_DRAW;
    state.lastActionTime = Date.now();
  }

  /**
   * Handle player drawing a tile
   * Validates it's the right player's turn and they haven't drawn yet
   */
  static handleDraw(state: GameState, position: Position, newTile: Tile): boolean {
    const player = getPlayer(state, position);

    // Validate it's this player's turn
    if (!player.isCurrentPlayer) {
      return false;
    }

    // Validate in correct phase
    if (state.phase !== GamePhase.WAITING_FOR_DRAW) {
      return false;
    }

    // Validate they haven't drawn yet
    if (player.hasDrawn) {
      return false;
    }

    // Add tile to hand
    player.hand.push(newTile);
    player.hasDrawn = true;

    // Move to discard phase
    state.phase = GamePhase.WAITING_FOR_DISCARD;
    state.lastActionTime = Date.now();

    return true;
  }

  /**
   * Handle player discarding a tile
   * Validates the tile is in their hand and they've drawn
   */
  static handleDiscard(state: GameState, position: Position, tile: Tile): boolean {
    const player = getPlayer(state, position);

    // Validate it's this player's turn
    if (!player.isCurrentPlayer) {
      return false;
    }

    // Validate in correct phase
    if (state.phase !== GamePhase.WAITING_FOR_DISCARD) {
      return false;
    }

    // Validate they've drawn
    if (!player.hasDrawn) {
      return false;
    }

    // Validate they haven't already discarded
    if (player.hasDiscarded) {
      return false;
    }

    // Validate tile is in hand
    const tileIndex = player.hand.findIndex(t => areSameTileType(t, tile));
    if (tileIndex === -1) {
      return false;
    }

    // Remove tile from hand
    player.hand.splice(tileIndex, 1);
    player.hasDiscarded = true;

    // Record discard
    player.discards.push(tile);

    // Store as last discard
    state.lastDiscard = {
      tile,
      fromPosition: position,
      timestamp: Date.now()
    };

    // Move to claim window (other players can claim)
    state.phase = GamePhase.CLAIM_WINDOW;
    state.lastActionTime = Date.now();

    return true;
  }

  /**
   * Get valid claims for other players (who can claim the discarded tile)
   */
  static getValidClaimsForDiscard(state: GameState, claimingPlayer: Position): PlayerAction[] {
    if (!state.lastDiscard) {
      return [];
    }

    const claims: PlayerAction[] = [];
    const tile = state.lastDiscard.tile;
    const player = getPlayer(state, claimingPlayer);

    // Can always pass
    claims.push(PlayerAction.PASS);

    // Can claim for chow (only from right neighbor)
    if (this.canClaimChow(state, claimingPlayer, tile)) {
      claims.push(PlayerAction.CLAIM_CHOW);
    }

    // Can claim for pong (any player)
    if (this.canClaimPong(player, tile)) {
      claims.push(PlayerAction.CLAIM_PONG);
    }

    // Can claim for kong (any player)
    if (this.canClaimKong(player, tile)) {
      claims.push(PlayerAction.CLAIM_KONG);
    }

    // Can claim for win (any player)
    if (this.canClaimWin(state, claimingPlayer, tile)) {
      claims.push(PlayerAction.CLAIM_WIN);
    }

    return claims;
  }

  /**
   * Check if player can chow (only right neighbor)
   */
  private static canClaimChow(state: GameState, claimingPlayer: Position, tile: Tile): boolean {
    const discardedBy = state.lastDiscard?.fromPosition;
    if (!discardedBy) return false;

    // Only right neighbor can chow
    // In Hong Kong Mahjong, right neighbor is the next player clockwise
    const rightNeighbor = getNextPlayer(discardedBy);

    return claimingPlayer === rightNeighbor;
    // TODO: Also check if player has 2 tiles that form a chow with this tile
  }

  /**
   * Check if player can pong (has 2 identical tiles)
   */
  private static canClaimPong(player: PlayerState, tile: Tile): boolean {
    const count = player.hand.filter((t: Tile) => areSameTileType(t, tile)).length;
    return count >= 2;
  }

  /**
   * Check if player can kong (has 3 identical tiles)
   */
  private static canClaimKong(player: PlayerState, tile: Tile): boolean {
    const count = player.hand.filter((t: Tile) => areSameTileType(t, tile)).length;
    return count >= 3;
  }

  /**
   * Check if player can win (would form 4 melds + 1 pair)
   */
  private static canClaimWin(state: GameState, claimingPlayer: Position, tile: Tile): boolean {
    // TODO: Use HandValidator to check if adding this tile to hand forms a winning pattern
    return false;
  }

  /**
   * Handle claim from another player
   */
  static handleClaim(state: GameState, position: Position, claimType: PlayerAction): Claim {
    const player = getPlayer(state, position);

    // Map priority based on claim type
    const priorityMap: { [key in PlayerAction]?: number } = {
      [PlayerAction.CLAIM_WIN]: 4,
      [PlayerAction.CLAIM_KONG]: 3,
      [PlayerAction.CLAIM_PONG]: 2,
      [PlayerAction.CLAIM_CHOW]: 1,
      [PlayerAction.PASS]: 0
    };

    return {
      claimedBy: position,
      claimType,
      priority: priorityMap[claimType] || 0
    };
  }

  /**
   * Resolve conflicting claims (multiple players claiming same discard)
   * Return the winning claim (highest priority)
   */
  static resolveClaimConflict(claims: Claim[]): Claim | null {
    if (claims.length === 0) return null;

    // Sort by priority (descending)
    const sorted = [...claims].sort((a, b) => b.priority - a.priority);

    // Return highest priority, or if tied, first one
    return sorted[0];
  }

  /**
   * End turn and move to next player
   * Called when no one claims the discard
   */
  static endTurn(state: GameState): void {
    state.discardRound += 1;

    const nextPlayer = getNextPlayer(state.currentPlayer);
    this.startTurn(state, nextPlayer);
  }

  /**
   * Check if wall is exhausted
   */
  static isWallExhausted(state: GameState): boolean {
    return state.wallTilesRemaining <= 0 && state.kongReplacementsRemaining <= 0;
  }

  /**
   * Check if game is over (wall exhausted with no winner)
   */
  static checkGameOver(state: GameState): boolean {
    if (this.isWallExhausted(state)) {
      state.phase = GamePhase.GAME_OVER;
      return true;
    }
    return false;
  }

  /**
   * Get all players who are waiting for their turn (in claim window)
   */
  static getPlayersAwaitingClaim(state: GameState): PlayerState[] {
    if (state.phase !== GamePhase.CLAIM_WINDOW) {
      return [];
    }

    return Object.values(state.players)
      .filter(p => p.position !== state.currentPlayer)
      .filter(p => p.isConnected);
  }
}
