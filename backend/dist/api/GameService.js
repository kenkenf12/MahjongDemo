/**
 * Game Service - Manages game instances and state
 *
 * Responsibilities:
 * - Create and manage active games
 * - Handle player joins/leaves
 * - Manage game lifecycle (initialization, play, settlement)
 * - Persist game state in memory
 */
import { createGameState, GamePhase } from '../models/GameState';
import { TurnManager } from '../game/TurnManager';
import { ActionValidator } from '../game/ActionValidator';
import { Wall } from '../game/Wall';
// Simple UUID-like generator (no external dependency)
function generateGameId() {
    return `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
export class GameService {
    constructor() {
        this.games = new Map();
        this.walls = new Map();
        this.sessions = new Map();
    }
    /**
     * Create a new game
     */
    createGame(roomCode, playerNames) {
        const gameId = generateGameId();
        const state = createGameState(roomCode, 'East');
        const wall = new Wall();
        // Initialize with shuffled tiles
        const hands = wall.dealInitial();
        for (const position of ['East', 'South', 'West', 'North']) {
            const playerIndex = Object.keys(playerNames).indexOf(position);
            if (playerIndex >= 0) {
                state.players[position].hand = hands[playerIndex] || [];
            }
        }
        // Store state
        this.games.set(gameId, state);
        this.walls.set(gameId, wall);
        // Create session info
        const session = {
            gameId,
            roomCode,
            status: 'initializing',
            players: {
                East: { name: playerNames['East'] || 'East', connected: true, score: 0 },
                South: { name: playerNames['South'] || 'South', connected: true, score: 0 },
                West: { name: playerNames['West'] || 'West', connected: true, score: 0 },
                North: { name: playerNames['North'] || 'North', connected: true, score: 0 }
            },
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        this.sessions.set(gameId, session);
        return session;
    }
    /**
     * Get game state
     */
    getGame(gameId) {
        return this.games.get(gameId) || null;
    }
    /**
     * Get session info
     */
    getSession(gameId) {
        return this.sessions.get(gameId) || null;
    }
    /**
     * Start the game (move from initializing to playing)
     */
    startGame(gameId) {
        const state = this.getGame(gameId);
        if (!state) {
            return { success: false, error: 'Game not found' };
        }
        // Validate all players ready
        const validation = ActionValidator.validateGameStart(state);
        if (!validation.isValid) {
            return {
                success: false,
                error: 'Cannot start game: ' + validation.errors.join(', ')
            };
        }
        state.phase = GamePhase.WAITING_FOR_DRAW;
        state.currentPlayer = 'East';
        state.players['East'].isCurrentPlayer = true;
        const session = this.sessions.get(gameId);
        if (session) {
            session.status = 'playing';
            session.updatedAt = Date.now();
        }
        return { success: true, gameState: state, message: 'Game started' };
    }
    /**
     * Player draws a tile
     */
    playerDraw(gameId, position) {
        const state = this.getGame(gameId);
        const wall = this.walls.get(gameId);
        if (!state) {
            return { success: false, error: 'Game not found' };
        }
        if (!wall) {
            return { success: false, error: 'Wall not found' };
        }
        // Validate draw
        const validation = ActionValidator.validateDraw(state, position);
        if (!validation.isValid) {
            return { success: false, error: validation.errors.join(', ') };
        }
        // Draw tile
        const tile = wall.draw();
        if (!tile) {
            return { success: false, error: 'Cannot draw: wall exhausted' };
        }
        // Process draw
        const result = TurnManager.handleDraw(state, position, tile);
        if (!result) {
            return { success: false, error: 'Failed to process draw' };
        }
        this.updateSession(gameId);
        return { success: true, gameState: state, message: 'Tile drawn' };
    }
    /**
     * Player discards a tile
     */
    playerDiscard(gameId, position, tile) {
        const state = this.getGame(gameId);
        if (!state) {
            return { success: false, error: 'Game not found' };
        }
        // Validate discard
        const validation = ActionValidator.validateDiscard(state, position, tile);
        if (!validation.isValid) {
            return { success: false, error: validation.errors.join(', ') };
        }
        // Process discard
        const result = TurnManager.handleDiscard(state, position, tile);
        if (!result) {
            return { success: false, error: 'Failed to process discard' };
        }
        this.updateSession(gameId);
        return { success: true, gameState: state, message: 'Tile discarded' };
    }
    /**
     * Player claims discard
     */
    playerClaim(gameId, position, claimType) {
        const state = this.getGame(gameId);
        if (!state) {
            return { success: false, error: 'Game not found' };
        }
        // Map string to PlayerAction enum
        const actionMap = {
            'pass': 'pass',
            'pong': 'claim_pong',
            'kong': 'claim_kong',
            'chow': 'claim_chow',
            'win': 'claim_win'
        };
        const action = actionMap[claimType.toLowerCase()];
        if (!action) {
            return { success: false, error: 'Invalid claim type: ' + claimType };
        }
        // Validate claim
        const validation = ActionValidator.validateClaim(state, position, action);
        if (!validation.isValid) {
            return { success: false, error: validation.errors.join(', ') };
        }
        // Process claim - for now just record it
        const claim = TurnManager.handleClaim(state, position, action);
        this.updateSession(gameId);
        return { success: true, gameState: state, message: `Claim recorded: ${claimType}` };
    }
    /**
     * Pass turn (no claim)
     */
    playerPass(gameId, position) {
        const state = this.getGame(gameId);
        if (!state) {
            return { success: false, error: 'Game not found' };
        }
        // After all players pass, move to next turn
        if (state.phase === GamePhase.CLAIM_WINDOW) {
            TurnManager.endTurn(state);
        }
        this.updateSession(gameId);
        return { success: true, gameState: state, message: 'Passed' };
    }
    /**
     * Get valid actions for current player
     */
    getValidActions(gameId, position) {
        const state = this.getGame(gameId);
        if (!state) {
            return [];
        }
        const actions = ActionValidator.getValidActions(state, position);
        return actions.map(a => this.actionToString(a));
    }
    /**
     * Check if all players have passed on current discard
     */
    allPlayersPassed(gameId) {
        const state = this.getGame(gameId);
        if (!state) {
            return false;
        }
        // This would need tracking of who has claimed/passed
        // Placeholder for now
        return false;
    }
    /**
     * End game manually (for testing)
     */
    endGame(gameId) {
        const state = this.getGame(gameId);
        if (!state) {
            return { success: false, error: 'Game not found' };
        }
        state.phase = GamePhase.GAME_OVER;
        const session = this.sessions.get(gameId);
        if (session) {
            session.status = 'completed';
            session.updatedAt = Date.now();
        }
        return { success: true, gameState: state, message: 'Game ended' };
    }
    /**
     * Delete a game (cleanup)
     */
    deleteGame(gameId) {
        this.games.delete(gameId);
        this.walls.delete(gameId);
        this.sessions.delete(gameId);
        return true;
    }
    /**
     * List all active games
     */
    listGames() {
        return Array.from(this.sessions.values());
    }
    /**
     * Private helper to update session timestamp
     */
    updateSession(gameId) {
        const session = this.sessions.get(gameId);
        if (session) {
            session.updatedAt = Date.now();
        }
    }
    /**
     * Convert PlayerAction enum to string
     */
    actionToString(action) {
        return action.toLowerCase().replace('_', '-');
    }
}
// Singleton instance
export const gameService = new GameService();
