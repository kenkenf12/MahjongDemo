/**
 * WebSocket Game Manager - Real-time multiplayer game synchronization
 *
 * Responsibilities:
 * - Manage WebSocket connections per game
 * - Broadcast game state changes to all players
 * - Handle player presence and disconnections
 * - Sync turn notifications
 * - Manage game rooms
 */
import { Server as SocketIOServer, Socket } from 'socket.io';
import { GameState, Position } from '../models/GameState.js';
import { GameSessionInfo } from './GameService.js';
export interface PlayerConnection {
    position: Position;
    playerId: string;
    socket: Socket;
    connected: boolean;
    lastPing: number;
}
export interface GameRoom {
    gameId: string;
    players: Map<Position, PlayerConnection>;
    gameState: GameState;
    session: GameSessionInfo;
    createdAt: number;
    updatedAt: number;
}
export interface BroadcastMessage {
    type: string;
    gameId: string;
    data: any;
    timestamp: number;
}
export declare class WebSocketGameManager {
    private io;
    private gameRooms;
    private playerSockets;
    private reconnectTimeout;
    constructor(io: SocketIOServer);
    /**
     * Setup global WebSocket connection handlers
     */
    private setupConnectionHandlers;
    /**
     * Handle player joining a game
     */
    private handlePlayerJoin;
    /**
     * Handle player leaving a game
     */
    private handlePlayerLeave;
    /**
     * Handle player action (draw, discard, claim, pass)
     */
    private handlePlayerAction;
    /**
     * Handle player heartbeat
     */
    private handlePing;
    /**
     * Handle player disconnection
     */
    private handleDisconnect;
    /**
     * Schedule reconnection check for disconnected player
     */
    private scheduleReconnectCheck;
    /**
     * Broadcast message to all players in a game
     */
    private broadcast;
    /**
     * Notify current player that it's their turn
     */
    private notifyCurrentPlayer;
    /**
     * Get status of all players in a game
     */
    private getPlayersStatus;
    /**
     * Send game state to all players in a room
     */
    syncGameState(gameId: string): void;
    /**
     * Get room info
     */
    getRoom(gameId: string): GameRoom | null;
    /**
     * Get all active rooms
     */
    getAllRooms(): GameRoom[];
    /**
     * Clean up empty rooms
     */
    cleanupEmptyRooms(): void;
    /**
     * Get connection info for a player
     */
    getPlayerConnection(socketId: string): PlayerConnection | null;
}
export declare let wsGameManager: WebSocketGameManager;
export declare function initializeWebSocketManager(io: SocketIOServer): WebSocketGameManager;
//# sourceMappingURL=WebSocketGameManager.d.ts.map