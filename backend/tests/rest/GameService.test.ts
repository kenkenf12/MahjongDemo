/**
 * Game Service Tests
 * Tests game creation, management, and action processing
 */

import { GameService } from '../../src/api/GameService';
import { GamePhase } from '../../src/models/GameState';

describe('Game Service', () => {
  let service: GameService;

  beforeEach(() => {
    service = new GameService();
  });

  describe('Game Creation', () => {
    test('should create a new game', () => {
      const playerNames = {
        East: 'Alice',
        South: 'Bob',
        West: 'Charlie',
        North: 'David'
      };

      const session = service.createGame('TEST-ROOM-001', playerNames);

      expect(session.gameId).toBeDefined();
      expect(session.roomCode).toBe('TEST-ROOM-001');
      expect(session.status).toBe('initializing');
      expect(session.players.East.name).toBe('Alice');
      expect(session.players.East.connected).toBe(true);
      expect(session.createdAt).toBeDefined();
    });

    test('should initialize game with dealing tiles', () => {
      const playerNames = {
        East: 'Alice',
        South: 'Bob',
        West: 'Charlie',
        North: 'David'
      };

      const session = service.createGame('TEST-ROOM-002', playerNames);
      const game = service.getGame(session.gameId);

      expect(game).not.toBeNull();
      expect(game?.players.East.hand.length).toBeGreaterThan(0);
      expect(game?.players.South.hand.length).toBeGreaterThan(0);
    });

    test('should create unique game IDs', () => {
      const playerNames = {
        East: 'Alice',
        South: 'Bob',
        West: 'Charlie',
        North: 'David'
      };

      const session1 = service.createGame('ROOM-1', playerNames);
      const session2 = service.createGame('ROOM-2', playerNames);

      expect(session1.gameId).not.toBe(session2.gameId);
    });
  });

  describe('Game Retrieval', () => {
    test('should get game state by ID', () => {
      const playerNames = {
        East: 'Alice',
        South: 'Bob',
        West: 'Charlie',
        North: 'David'
      };

      const session = service.createGame('TEST-ROOM', playerNames);
      const game = service.getGame(session.gameId);

      expect(game).not.toBeNull();
      expect(game?.roomCode).toBe('TEST-ROOM');
    });

    test('should get session info by ID', () => {
      const playerNames = {
        East: 'Alice',
        South: 'Bob',
        West: 'Charlie',
        North: 'David'
      };

      const session = service.createGame('TEST-ROOM', playerNames);
      const retrieved = service.getSession(session.gameId);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.gameId).toBe(session.gameId);
      expect(retrieved?.status).toBe('initializing');
    });

    test('should return null for non-existent game', () => {
      const game = service.getGame('non-existent-id');
      expect(game).toBeNull();
    });
  });

  describe('Start Game', () => {
    test('should start a game successfully', () => {
      const playerNames = {
        East: 'Alice',
        South: 'Bob',
        West: 'Charlie',
        North: 'David'
      };

      const session = service.createGame('TEST-ROOM', playerNames);
      const result = service.startGame(session.gameId);

      expect(result.success).toBe(true);
      expect(result.gameState?.phase).toBe(GamePhase.WAITING_FOR_DRAW);
      expect(result.gameState?.currentPlayer).toBe('East');
    });

    test('should set player as current when starting', () => {
      const playerNames = {
        East: 'Alice',
        South: 'Bob',
        West: 'Charlie',
        North: 'David'
      };

      const session = service.createGame('TEST-ROOM', playerNames);
      const game = service.getGame(session.gameId);
      
      service.startGame(session.gameId);
      
      expect(game?.players.East.isCurrentPlayer).toBe(true);
      expect(game?.players.South.isCurrentPlayer).toBe(false);
    });

    test('should update session status', () => {
      const playerNames = {
        East: 'Alice',
        South: 'Bob',
        West: 'Charlie',
        North: 'David'
      };

      const session = service.createGame('TEST-ROOM', playerNames);
      service.startGame(session.gameId);
      
      const updated = service.getSession(session.gameId);
      expect(updated?.status).toBe('playing');
    });

    test('should fail if game not found', () => {
      const result = service.startGame('non-existent-id');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Player Actions', () => {
    let gameId: string;

    beforeEach(() => {
      const playerNames = {
        East: 'Alice',
        South: 'Bob',
        West: 'Charlie',
        North: 'David'
      };
      const session = service.createGame('TEST-ROOM', playerNames);
      gameId = session.gameId;
      service.startGame(gameId);
    });

    test('should player draw successfully', () => {
      const result = service.playerDraw(gameId, 'East');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Tile drawn');
      expect(result.gameState?.phase).toBe(GamePhase.WAITING_FOR_DISCARD);
    });

    test('should fail if player not current', () => {
      const result = service.playerDraw(gameId, 'South');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should fail if already drawn', () => {
      service.playerDraw(gameId, 'East');
      const result = service.playerDraw(gameId, 'East');
      
      expect(result.success).toBe(false);
    });
  });

  describe('List Games', () => {
    test('should list all active games', () => {
      const playerNames = {
        East: 'Alice',
        South: 'Bob',
        West: 'Charlie',
        North: 'David'
      };

      service.createGame('ROOM-1', playerNames);
      service.createGame('ROOM-2', playerNames);
      service.createGame('ROOM-3', playerNames);

      const games = service.listGames();
      expect(games.length).toBe(3);
    });

    test('should return empty list when no games', () => {
      const games = service.listGames();
      expect(games.length).toBe(0);
    });
  });

  describe('Game Cleanup', () => {
    test('should delete a game', () => {
      const playerNames = {
        East: 'Alice',
        South: 'Bob',
        West: 'Charlie',
        North: 'David'
      };

      const session = service.createGame('TEST-ROOM', playerNames);
      expect(service.getGame(session.gameId)).not.toBeNull();

      const deleted = service.deleteGame(session.gameId);
      expect(deleted).toBe(true);
      expect(service.getGame(session.gameId)).toBeNull();
    });

    test('should end game', () => {
      const playerNames = {
        East: 'Alice',
        South: 'Bob',
        West: 'Charlie',
        North: 'David'
      };

      const session = service.createGame('TEST-ROOM', playerNames);
      service.startGame(session.gameId);

      const result = service.endGame(session.gameId);
      expect(result.success).toBe(true);
      expect(result.gameState?.phase).toBe(GamePhase.GAME_OVER);
    });
  });

  describe('Valid Actions', () => {
    let gameId: string;

    beforeEach(() => {
      const playerNames = {
        East: 'Alice',
        South: 'Bob',
        West: 'Charlie',
        North: 'David'
      };
      const session = service.createGame('TEST-ROOM', playerNames);
      gameId = session.gameId;
      service.startGame(gameId);
    });

    test('should return valid actions for current player', () => {
      const actions = service.getValidActions(gameId, 'East');
      expect(actions).toContain('draw');
    });

    test('should return empty actions for non-current player in draw phase', () => {
      const actions = service.getValidActions(gameId, 'South');
      expect(actions.length).toBe(0);
    });

    test('should return empty list for non-existent game', () => {
      const actions = service.getValidActions('non-existent', 'East');
      expect(actions.length).toBe(0);
    });
  });
});
