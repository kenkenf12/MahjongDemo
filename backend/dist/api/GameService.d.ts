/**
 * Game Service - Manages game instances and state
 *
 * Responsibilities:
 * - Create and manage active games
 * - Handle player joins/leaves
 * - Manage game lifecycle (initialization, play, settlement)
 * - Persist game state in memory
 */
import { GameState } from '../models/GameState.js';
import { Tile } from '../models/Tile.js';
export interface GameSessionInfo {
    gameId: string;
    roomCode: string;
    status: 'initializing' | 'playing' | 'completed';
    players: {
        [position in 'East' | 'South' | 'West' | 'North']: {
            name: string;
            connected: boolean;
            score: number;
        };
    };
    createdAt: number;
    updatedAt: number;
}
export interface GameActionResult {
    success: boolean;
    gameState?: GameState;
    error?: string;
    message?: string;
}
export declare class GameService {
    private games;
    private walls;
    private sessions;
    /**
     * Create a new game
     */
    createGame(roomCode: string, playerNames: Record<string, string>): GameSessionInfo;
    /**
     * Get game state
     */
    getGame(gameId: string): GameState | null;
    /**
     * Get session info
     */
    getSession(gameId: string): GameSessionInfo | null;
    /**
     * Start the game (move from initializing to playing)
     */
    startGame(gameId: string): GameActionResult;
    /**
     * Player draws a tile
     */
    playerDraw(gameId: string, position: 'East' | 'South' | 'West' | 'North'): GameActionResult;
    /**
     * Player discards a tile
     */
    playerDiscard(gameId: string, position: 'East' | 'South' | 'West' | 'North', tile: Tile): GameActionResult;
    /**
     * Player claims discard
     */
    playerClaim(gameId: string, position: 'East' | 'South' | 'West' | 'North', claimType: string): GameActionResult;
    /**
     * Pass turn (no claim)
     */
    playerPass(gameId: string, position: 'East' | 'South' | 'West' | 'North'): GameActionResult;
    /**
     * Get valid actions for current player
     */
    getValidActions(gameId: string, position: 'East' | 'South' | 'West' | 'North'): string[];
    /**
     * Check if all players have passed on current discard
     */
    allPlayersPassed(gameId: string): boolean;
    /**
     * End game manually (for testing)
     */
    endGame(gameId: string): GameActionResult;
    /**
     * Delete a game (cleanup)
     */
    deleteGame(gameId: string): boolean;
    /**
     * List all active games
     */
    listGames(): GameSessionInfo[];
    /**
     * Private helper to update session timestamp
     */
    private updateSession;
    /**
     * Convert PlayerAction enum to string
     */
    private actionToString;
}
export declare const gameService: GameService;
//# sourceMappingURL=GameService.d.ts.map