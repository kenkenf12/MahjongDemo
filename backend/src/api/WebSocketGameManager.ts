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
import { GameState, GamePhase, Position } from '../models/GameState.js';
import { gameService, GameSessionInfo } from './GameService.js';
import { Tile } from '../models/Tile.js';

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

export class WebSocketGameManager {
  private io: SocketIOServer;
  private gameRooms: Map<string, GameRoom> = new Map();
  private playerSockets: Map<string, PlayerConnection> = new Map();
  private reconnectTimeout: number = 30000; // 30 seconds

  constructor(io: SocketIOServer) {
    this.io = io;
    this.setupConnectionHandlers();
  }

  /**
   * Setup global WebSocket connection handlers
   */
  private setupConnectionHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`[WS] Client connected: ${socket.id}`);

      // Player joins game
      socket.on('join-game', (data: { gameId: string; position: Position; playerId: string }) => {
        this.handlePlayerJoin(socket, data);
      });

      // Player leaves game
      socket.on('leave-game', (data: { gameId: string }) => {
        this.handlePlayerLeave(socket, data);
      });

      // Player takes action
      socket.on('player-action', (data: { gameId: string; action: string; payload: any }) => {
        this.handlePlayerAction(socket, data);
      });

      // Heartbeat/ping
      socket.on('ping', (data: { gameId: string }) => {
        this.handlePing(socket, data);
      });

      // Disconnect
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });

      // Error handling
      socket.on('error', (error: any) => {
        console.error(`[WS] Socket error for ${socket.id}:`, error);
      });
    });
  }

  /**
   * Handle player joining a game
   */
  private handlePlayerJoin(socket: Socket, data: { gameId: string; position: Position; playerId: string }): void {
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
      const connection: PlayerConnection = {
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
    } catch (error) {
      socket.emit('error', { message: 'Failed to join game' });
      console.error('[WS] Error joining game:', error);
    }
  }

  /**
   * Handle player leaving a game
   */
  private handlePlayerLeave(socket: Socket, data: { gameId: string }): void {
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
  private handlePlayerAction(socket: Socket, data: { gameId: string; action: string; payload: any }): void {
    const { gameId, action, payload } = data;
    const connection = this.playerSockets.get(socket.id);

    if (!connection) {
      socket.emit('error', { message: 'Not connected to a game' });
      return;
    }

    try {
      const { position } = connection;
      let result: any = null;

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
      } else {
        socket.emit('error', { message: result.error || 'Action failed' });
      }
    } catch (error) {
      socket.emit('error', { message: 'Action processing failed' });
      console.error('[WS] Error processing action:', error);
    }
  }

  /**
   * Handle player heartbeat
   */
  private handlePing(socket: Socket, data: { gameId: string }): void {
    const connection = this.playerSockets.get(socket.id);
    if (connection) {
      connection.lastPing = Date.now();
      socket.emit('pong', { timestamp: Date.now() });
    }
  }

  /**
   * Handle player disconnection
   */
  private handleDisconnect(socket: Socket): void {
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
      const gameId = Array.from(this.gameRooms.entries()).find(([_, r]) => 
        r.players.has(position)
      )?.[0];

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
  private scheduleReconnectCheck(gameId: string, position: Position): void {
    setTimeout(() => {
      const room = this.gameRooms.get(gameId);
      if (!room) return;

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
  private broadcast(gameId: string, message: any): void {
    const broadcastMsg: BroadcastMessage = {
      ...message,
      gameId,
      timestamp: Date.now()
    };
    this.io.to(`game-${gameId}`).emit('game-update', broadcastMsg);
  }

  /**
   * Notify current player that it's their turn
   */
  private notifyCurrentPlayer(gameId: string, position: Position | undefined): void {
    if (!position) return;

    this.io.to(`game-${gameId}-${position}`).emit('your-turn', {
      gameId,
      position,
      validActions: gameService.getValidActions(gameId, position)
    });
  }

  /**
   * Get status of all players in a game
   */
  private getPlayersStatus(gameId: string): any[] {
    const game = gameService.getGame(gameId);
    if (!game) return [];

    return Object.keys(game.players).map(pos => ({
      position: pos,
      connected: game.players[pos as Position].isConnected,
      isCurrentPlayer: game.players[pos as Position].isCurrentPlayer,
      handSize: game.players[pos as Position].hand.length,
      meldsCount: game.players[pos as Position].melds.length,
      discardsCount: game.players[pos as Position].discards.length
    }));
  }

  /**
   * Send game state to all players in a room
   */
  public syncGameState(gameId: string): void {
    const game = gameService.getGame(gameId);
    const session = gameService.getSession(gameId);

    if (!game || !session) return;

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
  public getRoom(gameId: string): GameRoom | null {
    return this.gameRooms.get(gameId) || null;
  }

  /**
   * Get all active rooms
   */
  public getAllRooms(): GameRoom[] {
    return Array.from(this.gameRooms.values());
  }

  /**
   * Clean up empty rooms
   */
  public cleanupEmptyRooms(): void {
    const now = Date.now();
    const toDelete: string[] = [];

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
  public getPlayerConnection(socketId: string): PlayerConnection | null {
    return this.playerSockets.get(socketId) || null;
  }
}

// Export singleton manager (will be initialized with Socket.IO server)
export let wsGameManager: WebSocketGameManager;

export function initializeWebSocketManager(io: SocketIOServer): WebSocketGameManager {
  wsGameManager = new WebSocketGameManager(io);
  
  // Periodic cleanup of empty rooms
  setInterval(() => {
    wsGameManager.cleanupEmptyRooms();
  }, 5 * 60 * 1000); // Every 5 minutes

  return wsGameManager;
}
