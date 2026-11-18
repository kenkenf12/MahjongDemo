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

import { Tile } from './Tile';
import { Meld } from './Meld';
import { Position as PositionType } from '../types';

// Re-export Position for convenience in GameState-related imports
export type Position = PositionType;

/**
 * Game phases during a round
 */
export enum GamePhase {
  INITIALIZING = 'initializing',           // Setting up
  WAITING_FOR_DRAW = 'waiting_for_draw',   // Current player's turn to draw
  WAITING_FOR_DISCARD = 'waiting_for_discard', // Current player's turn to discard
  CLAIM_WINDOW = 'claim_window',           // Other players can claim
  TURN_COMPLETE = 'turn_complete',         // Transition to next player
  GAME_OVER = 'game_over',                 // Round completed (winner or draw)
  ALL_PASS = 'all_pass'                    // All players passed on last discard
}

/**
 * Player action types
 */
export enum PlayerAction {
  DRAW = 'draw',
  DISCARD = 'discard',
  CLAIM_CHOW = 'claim_chow',
  CLAIM_PONG = 'claim_pong',
  CLAIM_KONG = 'claim_kong',
  CLAIM_WIN = 'claim_win',
  DECLARE_KONG = 'declare_kong',
  PASS = 'pass'
}

/**
 * Player state (per player)
 */
export interface PlayerState {
  position: Position;        // East, South, West, North
  isDealer: boolean;         // Is this the dealer
  hand: Tile[];              // Tiles in player's hand
  melds: Meld[];             // Melds on the table
  discards: Tile[];          // Tiles discarded (in order)
  bonusTiles: Tile[];        // Flowers/seasons drawn
  score: number;             // Cumulative score for the session
  isConnected: boolean;      // Is player connected (for multiplayer)
  isCurrentPlayer: boolean;  // Is it this player's turn
  hasDrawn: boolean;         // Has drawn this turn
  hasDiscarded: boolean;     // Has discarded this turn
}

/**
 * Discard state (the most recent discard)
 */
export interface DiscardState {
  tile: Tile;
  fromPosition: Position;
  timestamp: number;
  claimedBy?: Position;      // If claimed (Pong, Kong, Win)
  claimType?: PlayerAction;  // Type of claim
}

/**
 * Game state (complete round state)
 */
export interface GameState {
  // Room info
  roomCode: string;
  isActive: boolean;

  // Players (always 4)
  players: { [position in Position]: PlayerState };

  // Wall state
  wallTilesRemaining: number;
  kongReplacementsRemaining: number;

  // Turn sequence
  phase: GamePhase;
  currentPlayer: Position;
  discardRound: number;      // Which player has discarded this turn (1-4)

  // Recent discard
  lastDiscard?: DiscardState;

  // Game end info
  roundWinner?: Position;    // If game ended with winner
  roundFan?: number;         // Winner's fan count
  roundSettlement?: { [position in Position]: number }; // Payments/receipts

  // Timing
  roundStartTime: number;
  lastActionTime: number;

  // Configuration
  dealerPosition: Position;  // Who was dealer at start of round
  roundNumber: number;       // Which round (starts at 1)
}

/**
 * Create initial player state
 */
export function createPlayerState(position: Position, isDealer: boolean): PlayerState {
  return {
    position,
    isDealer,
    hand: [],
    melds: [],
    discards: [],
    bonusTiles: [],
    score: 0,
    isConnected: true,
    isCurrentPlayer: false,
    hasDrawn: false,
    hasDiscarded: false
  };
}

/**
 * Create initial game state
 */
export function createGameState(roomCode: string, dealerPosition: Position = 'East'): GameState {
  return {
    roomCode,
    isActive: true,
    players: {
      'East': createPlayerState('East', dealerPosition === 'East'),
      'South': createPlayerState('South', dealerPosition === 'South'),
      'West': createPlayerState('West', dealerPosition === 'West'),
      'North': createPlayerState('North', dealerPosition === 'North')
    },
    wallTilesRemaining: 86,  // 144 - 54 dealt - 4 kong
    kongReplacementsRemaining: 4,
    phase: GamePhase.INITIALIZING,
    currentPlayer: dealerPosition,
    discardRound: 0,
    roundStartTime: Date.now(),
    lastActionTime: Date.now(),
    dealerPosition,
    roundNumber: 1
  };
}

/**
 * Get next player in clockwise order
 */
export function getNextPlayer(current: Position): Position {
  const order: Position[] = ['East', 'South', 'West', 'North'];
  const currentIndex = order.indexOf(current);
  return order[(currentIndex + 1) % 4];
}

/**
 * Get all players except current
 */
export function getOtherPlayers(state: GameState, position: Position): PlayerState[] {
  return Object.values(state.players).filter(p => p.position !== position);
}

/**
 * Check if hand has tiles (for validation)
 */
export function hasValidHandSize(player: PlayerState, isCurrentPlayer: boolean, hasDrawn: boolean): boolean {
  let expectedSize = 13;  // Normal hand
  if (isCurrentPlayer && hasDrawn && !player.hasDiscarded) {
    expectedSize = 14;    // After draw, before discard
  }
  return player.hand.length === expectedSize;
}

/**
 * Count total tiles in player's holdings
 */
export function getTotalPlayerTiles(player: PlayerState): number {
  const handSize = player.hand.length;
  const meldSize = player.melds.reduce((sum, meld) => sum + meld.tiles.length, 0);
  const bonusSize = player.bonusTiles.length;
  return handSize + meldSize + bonusSize;
}

/**
 * Get player by position
 */
export function getPlayer(state: GameState, position: Position): PlayerState {
  return state.players[position];
}

/**
 * Check if all players are connected
 */
export function areAllPlayersConnected(state: GameState): boolean {
  return Object.values(state.players).every(p => p.isConnected);
}

/**
 * Check if game is in active play phase
 */
export function isGameInPlay(state: GameState): boolean {
  return state.phase === GamePhase.WAITING_FOR_DRAW ||
         state.phase === GamePhase.WAITING_FOR_DISCARD ||
         state.phase === GamePhase.CLAIM_WINDOW ||
         state.phase === GamePhase.TURN_COMPLETE;
}
