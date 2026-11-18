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
import { gameService } from './GameService.js';
export class WebSocketGameManager {
    constructor(io) {
        this.gameRooms = new Map();
        this.playerSockets = new Map();
        this.reconnectTimeout = 30000; // 30 seconds
        this.io = io;
        this.setupConnectionHandlers();
    }
    /**
     * Setup global WebSocket connection handlers
     */
    setupConnectionHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`[WS] Client connected: ${socket.id}`);
            // Player joins game
            socket.on('join-game', (data) => {
                this.handlePlayerJoin(socket, data);
            });
            // Player leaves game
            socket.on('leave-game', (data) => {
                this.handlePlayerLeave(socket, data);
            });
            // Player takes action
            socket.on('player-action', (data) => {
                this.handlePlayerAction(socket, data);
            });
            // Heartbeat/ping
            socket.on('ping', (data) => {
                this.handlePing(socket, data);
            });
            // Disconnect
            socket.on('disconnect', () => {
                this.handleDisconnect(socket);
            });
            // Error handling
            socket.on('error', (error) => {
                console.error(`[WS] Socket error for ${socket.id}:`, error);
            });
        });
    }
    /**
     * Handle player joining a game
     */
    handlePlayerJoin(socket, data) {
        const { gameId, position, playerId } = data;
        try {
            const game = gameService.getGame(gameId);
            const session = gameService.getSession(gameId);
            if (!game || !session) {
                socket.emit('error', { message: 'Game not found' });
                return;
            }
            // Create or get room
            let room = this.gameRooms.get(gameId);
            if (!room) {
                room = {
                    gameId,
                    players: new Map(),
                    gameState: game,
                    session,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                };
                this.gameRooms.set(gameId, room);
            }
            // Add player to room
            const connection = {
                position,
                playerId,
                socket,
                connected: true,
                lastPing: Date.now()
            };
            room.players.set(position, connection);
            this.playerSockets.set(socket.id, connection);
            // Join Socket.IO room
            socket.join(`game-${gameId}`);
            socket.join(`game-${gameId}-${position}`);
            // Update player connected status
            game.players[position].isConnected = true;
            session.players[position].connected = true;
            // Notify others that player joined
            this.broadcast(gameId, {
                type: 'player-joined',
                position,
                playerId,
                players: this.getPlayersStatus(gameId)
            });
            // Send current state to joining player
            socket.emit('game-state', {
                gameId,
                state: game,
                session,
                yourPosition: position,
                players: this.getPlayersStatus(gameId)
            });
            console.log(`[WS] Player ${position} joined game ${gameId}`);
        }
        catch (error) {
            socket.emit('error', { message: 'Failed to join game' });
            console.error('[WS] Error joining game:', error);
        }
    }
    /**
     * Handle player leaving a game
     */
    handlePlayerLeave(socket, data) {
        const { gameId } = data;
        const connection = this.playerSockets.get(socket.id);
        if (!connection) {
            return;
        }
        const room = this.gameRooms.get(gameId);
        if (!room) {
            return;
        }
        const { position } = connection;
        const game = gameService.getGame(gameId);
        if (game) {
            game.players[position].isConnected = false;
        }
        room.players.delete(position);
        this.playerSockets.delete(socket.id);
        socket.leave(`game-${gameId}`);
        socket.leave(`game-${gameId}-${position}`);
        // Notify others that player left
        this.broadcast(gameId, {
            type: 'player-left',
            position,
            players: this.getPlayersStatus(gameId)
        });
        console.log(`[WS] Player ${position} left game ${gameId}`);
    }
    /**
     * Handle player action (draw, discard, claim, pass)
     */
    handlePlayerAction(socket, data) {
        const { gameId, action, payload } = data;
        const connection = this.playerSockets.get(socket.id);
        if (!connection) {
            socket.emit('error', { message: 'Not connected to a game' });
            return;
        }
        try {
            const { position } = connection;
            let result = null;
            // Process action based on type
            switch (action) {
                case 'draw':
                    result = gameService.playerDraw(gameId, position);
                    break;
                case 'discard':
                    result = gameService.playerDiscard(gameId, position, payload.tile);
                    break;
                case 'claim':
                    result = gameService.playerClaim(gameId, position, payload.claimType);
                    break;
                case 'pass':
                    result = gameService.playerPass(gameId, position);
                    break;
                default:
                    socket.emit('error', { message: 'Unknown action' });
                    return;
            }
            if (result.success) {
                // Broadcast action to all players in game
                this.broadcast(gameId, {
                    type: 'action-executed',
                    action,
                    position,
                    playerId: connection.playerId,
                    payload,
                    gameState: result.gameState
                });
                // Send confirmation to actor
                socket.emit('action-confirmed', {
                    action,
                    message: result.message
                });
                // If turn changed, notify new current player
                if (result.gameState?.currentPlayer !== position) {
                    this.notifyCurrentPlayer(gameId, result.gameState?.currentPlayer);
                }
                console.log(`[WS] Action executed: ${action} by ${position} in game ${gameId}`);
            }
            else {
                socket.emit('error', { message: result.error || 'Action failed' });
            }
        }
        catch (error) {
            socket.emit('error', { message: 'Action processing failed' });
            console.error('[WS] Error processing action:', error);
        }
    }
    /**
     * Handle player heartbeat
     */
    handlePing(socket, data) {
        const connection = this.playerSockets.get(socket.id);
        if (connection) {
            connection.lastPing = Date.now();
            socket.emit('pong', { timestamp: Date.now() });
        }
    }
    /**
     * Handle player disconnection
     */
    handleDisconnect(socket) {
        const connection = this.playerSockets.get(socket.id);
        if (connection) {
            const { position } = connection;
            const room = this.gameRooms.get(Array.from(this.gameRooms.entries())[0]?.[0] || '');
            const game = room?.gameState;
            // Mark as disconnected but keep in game (allow reconnect)
            if (game) {
                game.players[position].isConnected = false;
            }
            // Notify others
            const gameId = Array.from(this.gameRooms.entries()).find(([_, r]) => r.players.has(position))?.[0];
            if (gameId) {
                this.broadcast(gameId, {
                    type: 'player-disconnected',
                    position,
                    players: this.getPlayersStatus(gameId)
                });
                // Attempt reconnection after timeout
                this.scheduleReconnectCheck(gameId, position);
                console.log(`[WS] Player ${position} disconnected from game ${gameId}`);
            }
        }
        this.playerSockets.delete(socket.id);
    }
    /**
     * Schedule reconnection check for disconnected player
     */
    scheduleReconnectCheck(gameId, position) {
        setTimeout(() => {
            const room = this.gameRooms.get(gameId);
            if (!room)
                return;
            const player = room.players.get(position);
            if (player && !player.connected) {
                // Player didn't reconnect, remove from game
                room.players.delete(position);
                this.broadcast(gameId, {
                    type: 'player-removed',
                    position,
                    reason: 'timeout',
                    players: this.getPlayersStatus(gameId)
                });
            }
        }, this.reconnectTimeout);
    }
    /**
     * Broadcast message to all players in a game
     */
    broadcast(gameId, message) {
        const broadcastMsg = {
            ...message,
            gameId,
            timestamp: Date.now()
        };
        this.io.to(`game-${gameId}`).emit('game-update', broadcastMsg);
    }
    /**
     * Notify current player that it's their turn
     */
    notifyCurrentPlayer(gameId, position) {
        if (!position)
            return;
        this.io.to(`game-${gameId}-${position}`).emit('your-turn', {
            gameId,
            position,
            validActions: gameService.getValidActions(gameId, position)
        });
    }
    /**
     * Get status of all players in a game
     */
    getPlayersStatus(gameId) {
        const game = gameService.getGame(gameId);
        if (!game)
            return [];
        return Object.keys(game.players).map(pos => ({
            position: pos,
            connected: game.players[pos].isConnected,
            isCurrentPlayer: game.players[pos].isCurrentPlayer,
            handSize: game.players[pos].hand.length,
            meldsCount: game.players[pos].melds.length,
            discardsCount: game.players[pos].discards.length
        }));
    }
    /**
     * Send game state to all players in a room
     */
    syncGameState(gameId) {
        const game = gameService.getGame(gameId);
        const session = gameService.getSession(gameId);
        if (!game || !session)
            return;
        this.broadcast(gameId, {
            type: 'game-state-sync',
            state: game,
            session,
            players: this.getPlayersStatus(gameId)
        });
    }
    /**
     * Get room info
     */
    getRoom(gameId) {
        return this.gameRooms.get(gameId) || null;
    }
    /**
     * Get all active rooms
     */
    getAllRooms() {
        return Array.from(this.gameRooms.values());
    }
    /**
     * Clean up empty rooms
     */
    cleanupEmptyRooms() {
        const now = Date.now();
        const toDelete = [];
        for (const [gameId, room] of this.gameRooms.entries()) {
            // Remove rooms that are empty and inactive for 5 minutes
            if (room.players.size === 0 && now - room.updatedAt > 5 * 60 * 1000) {
                toDelete.push(gameId);
            }
        }
        toDelete.forEach(gameId => {
            this.gameRooms.delete(gameId);
            gameService.deleteGame(gameId);
            console.log(`[WS] Cleaned up empty room: ${gameId}`);
        });
    }
    /**
     * Get connection info for a player
     */
    getPlayerConnection(socketId) {
        return this.playerSockets.get(socketId) || null;
    }
}
// Export singleton manager (will be initialized with Socket.IO server)
export let wsGameManager;
export function initializeWebSocketManager(io) {
    wsGameManager = new WebSocketGameManager(io);
    // Periodic cleanup of empty rooms
    setInterval(() => {
        wsGameManager.cleanupEmptyRooms();
    }, 5 * 60 * 1000); // Every 5 minutes
    return wsGameManager;
}
