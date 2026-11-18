/**
 * Action Validator Tests
 * Tests validation of player actions across all game phases
 */

import { ActionValidator, ActionValidationResult } from '../../src/game/ActionValidator';
import { GameState, GamePhase, PlayerAction, createGameState } from '../../src/models/GameState';
import { createNumberTile, TileSuit } from '../../src/models/Tile';

describe('Action Validator - Draw Action', () => {
  let state: GameState;

  beforeEach(() => {
    state = createGameState('room1', 'East');
    for (const position of ['East', 'South', 'West', 'North'] as const) {
      state.players[position].hand = Array.from({ length: 13 }, (_, i) =>
        createNumberTile(TileSuit.CHARACTER, (i % 9) + 1, (i % 4) + 1)
      );
    }
    state.phase = GamePhase.WAITING_FOR_DRAW;
    state.currentPlayer = 'East';
    state.players['East'].isCurrentPlayer = true;
  });

  describe('validateDraw', () => {
    test('should allow draw for current player in WAITING_FOR_DRAW phase', () => {
      const result = ActionValidator.validateDraw(state, 'East');
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    test('should reject draw if not current player', () => {
      const result = ActionValidator.validateDraw(state, 'South');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('It is not your turn');
    });

    test('should reject draw if wrong phase', () => {
      state.phase = GamePhase.WAITING_FOR_DISCARD;
      const result = ActionValidator.validateDraw(state, 'East');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('It is not the draw phase');
    });

    test('should reject draw if already drawn', () => {
      state.players['East'].hasDrawn = true;
      const result = ActionValidator.validateDraw(state, 'East');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('You have already drawn this turn');
    });

    test('should accumulate multiple errors', () => {
      state.phase = GamePhase.CLAIM_WINDOW;
      state.players['East'].hasDrawn = true;
      const result = ActionValidator.validateDraw(state, 'South');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
});

describe('Action Validator - Discard Action', () => {
  let state: GameState;

  beforeEach(() => {
    state = createGameState('room1', 'East');
    for (const position of ['East', 'South', 'West', 'North'] as const) {
      state.players[position].hand = Array.from({ length: 14 }, (_, i) =>
        createNumberTile(TileSuit.CHARACTER, (i % 9) + 1, (i % 4) + 1)
      );
    }
    state.phase = GamePhase.WAITING_FOR_DISCARD;
    state.currentPlayer = 'East';
    state.players['East'].isCurrentPlayer = true;
    state.players['East'].hasDrawn = true;
  });

  describe('validateDiscard', () => {
    test('should allow discard of tile in hand', () => {
      const tile = state.players['East'].hand[0];
      const result = ActionValidator.validateDiscard(state, 'East', tile);
      expect(result.isValid).toBe(true);
    });

    test('should reject discard if not current player', () => {
      const tile = state.players['East'].hand[0];
      const result = ActionValidator.validateDiscard(state, 'South', tile);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('It is not your turn');
    });

    test('should reject discard if wrong phase', () => {
      state.phase = GamePhase.WAITING_FOR_DRAW;
      const tile = state.players['East'].hand[0];
      const result = ActionValidator.validateDiscard(state, 'East', tile);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('It is not the discard phase');
    });

    test('should reject discard if not drawn yet', () => {
      state.players['East'].hasDrawn = false;
      const tile = state.players['East'].hand[0];
      const result = ActionValidator.validateDiscard(state, 'East', tile);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('You must draw before discarding');
    });

    test('should reject discard if already discarded', () => {
      state.players['East'].hasDiscarded = true;
      const tile = state.players['East'].hand[0];
      const result = ActionValidator.validateDiscard(state, 'East', tile);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('You have already discarded this turn');
    });

    test('should reject discard of tile not in hand', () => {
      const tile = createNumberTile(TileSuit.BAMBOO, 1, 1);
      const result = ActionValidator.validateDiscard(state, 'East', tile);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('You do not have that tile');
    });

    test('should allow discard of exact tile match', () => {
      const tile = state.players['East'].hand[5];
      const result = ActionValidator.validateDiscard(state, 'East', tile);
      expect(result.isValid).toBe(true);
    });
  });
});

describe('Action Validator - Claim Actions', () => {
  let state: GameState;

  beforeEach(() => {
    state = createGameState('room1', 'East');
    for (const position of ['East', 'South', 'West', 'North'] as const) {
      state.players[position].hand = Array.from({ length: 13 }, (_, i) =>
        createNumberTile(TileSuit.CHARACTER, (i % 9) + 1, (i % 4) + 1)
      );
      state.players[position].isConnected = true;
    }
    state.phase = GamePhase.CLAIM_WINDOW;
    state.currentPlayer = 'East';
    state.lastDiscard = {
      tile: createNumberTile(TileSuit.CHARACTER, 5, 1),
      fromPosition: 'East',
      timestamp: Date.now()
    };
  });

  describe('validateClaim', () => {
    test('should reject claim if wrong phase', () => {
      state.phase = GamePhase.WAITING_FOR_DRAW;
      const result = ActionValidator.validateClaim(state, 'South', PlayerAction.CLAIM_PONG);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('This is not the claim window');
    });

    test('should reject claim from discarder', () => {
      const result = ActionValidator.validateClaim(state, 'East', PlayerAction.CLAIM_PONG);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('You cannot claim your own discard');
    });

    test('should reject claim if disconnected', () => {
      state.players['South'].isConnected = false;
      const result = ActionValidator.validateClaim(state, 'South', PlayerAction.CLAIM_PONG);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('You are not connected');
    });

    test('should reject claim if no discard to claim', () => {
      state.lastDiscard = undefined;
      const result = ActionValidator.validateClaim(state, 'South', PlayerAction.CLAIM_PONG);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('No tile to claim');
    });

    test('should allow PASS claim', () => {
      const result = ActionValidator.validateClaim(state, 'South', PlayerAction.PASS);
      expect(result.isValid).toBe(true);
    });

    test('should reject CLAIM_PONG without matching tiles', () => {
      state.players['South'].hand = [
        createNumberTile(TileSuit.CHARACTER, 1, 1),
        createNumberTile(TileSuit.CHARACTER, 2, 1)
      ];
      const result = ActionValidator.validateClaim(state, 'South', PlayerAction.CLAIM_PONG);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('You need 2 matching tiles to pong');
    });

    test('should reject CLAIM_KONG without 3 matching tiles', () => {
      state.players['South'].hand = [
        createNumberTile(TileSuit.CHARACTER, 5, 1),
        createNumberTile(TileSuit.CHARACTER, 5, 2)
      ];
      const result = ActionValidator.validateClaim(state, 'South', PlayerAction.CLAIM_KONG);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('You need 3 matching tiles to kong');
    });
  });

  describe('validateDeclareKong', () => {
    beforeEach(() => {
      state.phase = GamePhase.WAITING_FOR_DISCARD;
      state.currentPlayer = 'East';
      state.players['East'].hasDrawn = true;
    });

    test('should allow declare kong with 4 matching tiles', () => {
      state.players['East'].hand = [
        createNumberTile(TileSuit.CHARACTER, 5, 1),
        createNumberTile(TileSuit.CHARACTER, 5, 2),
        createNumberTile(TileSuit.CHARACTER, 5, 3),
        createNumberTile(TileSuit.CHARACTER, 5, 4)
      ];
      const tile = createNumberTile(TileSuit.CHARACTER, 5, 1);
      const result = ActionValidator.validateDeclareKong(state, 'East', tile);
      expect(result.isValid).toBe(true);
    });

    test('should reject if not current player', () => {
      const tile = createNumberTile(TileSuit.CHARACTER, 5, 1);
      const result = ActionValidator.validateDeclareKong(state, 'South', tile);
      expect(result.isValid).toBe(false);
    });

    test('should reject if wrong phase', () => {
      state.phase = GamePhase.WAITING_FOR_DRAW;
      const tile = createNumberTile(TileSuit.CHARACTER, 5, 1);
      const result = ActionValidator.validateDeclareKong(state, 'East', tile);
      expect(result.isValid).toBe(false);
    });

    test('should reject if fewer than 4 matching tiles', () => {
      state.players['East'].hand = [
        createNumberTile(TileSuit.CHARACTER, 5, 1),
        createNumberTile(TileSuit.CHARACTER, 5, 2),
        createNumberTile(TileSuit.CHARACTER, 5, 3)
      ];
      const tile = createNumberTile(TileSuit.CHARACTER, 5, 1);
      const result = ActionValidator.validateDeclareKong(state, 'East', tile);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('You do not have 4 matching tiles');
    });
  });
});

describe('Action Validator - Game Start', () => {
  let state: GameState;

  beforeEach(() => {
    state = createGameState('room1', 'East');
    for (const position of ['East', 'South', 'West', 'North'] as const) {
      state.players[position].hand = Array.from({ length: 13 }, (_, i) =>
        createNumberTile(TileSuit.CHARACTER, (i % 9) + 1, (i % 4) + 1)
      );
      state.players[position].isConnected = true;
    }
  });

  describe('validateGameStart', () => {
    test('should allow game start when all players connected with tiles', () => {
      const result = ActionValidator.validateGameStart(state);
      expect(result.isValid).toBe(true);
    });

    test('should reject if player disconnected', () => {
      state.players['South'].isConnected = false;
      const result = ActionValidator.validateGameStart(state);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Not all players are connected');
    });

    test('should reject if player has no tiles', () => {
      state.players['West'].hand = [];
      const result = ActionValidator.validateGameStart(state);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Not all players have been dealt tiles');
    });

    test('should reject if multiple conditions fail', () => {
      state.players['South'].isConnected = false;
      state.players['West'].hand = [];
      const result = ActionValidator.validateGameStart(state);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
});

describe('Action Validator - Valid Actions', () => {
  let state: GameState;

  beforeEach(() => {
    state = createGameState('room1', 'East');
    for (const position of ['East', 'South', 'West', 'North'] as const) {
      state.players[position].hand = Array.from({ length: 13 }, (_, i) =>
        createNumberTile(TileSuit.CHARACTER, (i % 9) + 1, (i % 4) + 1)
      );
      state.players[position].isConnected = true;
    }
  });

  describe('getValidActions', () => {
    test('should allow DRAW for current player in WAITING_FOR_DRAW phase', () => {
      state.phase = GamePhase.WAITING_FOR_DRAW;
      state.currentPlayer = 'East';
      state.players['East'].isCurrentPlayer = true;

      const actions = ActionValidator.getValidActions(state, 'East');
      expect(actions).toContain(PlayerAction.DRAW);
    });

    test('should not allow DRAW for non-current player', () => {
      state.phase = GamePhase.WAITING_FOR_DRAW;
      state.currentPlayer = 'East';

      const actions = ActionValidator.getValidActions(state, 'South');
      expect(actions).not.toContain(PlayerAction.DRAW);
    });

    test('should allow DISCARD for current player after drawing', () => {
      state.phase = GamePhase.WAITING_FOR_DISCARD;
      state.currentPlayer = 'East';
      state.players['East'].isCurrentPlayer = true;
      state.players['East'].hasDrawn = true;

      const actions = ActionValidator.getValidActions(state, 'East');
      expect(actions).toContain(PlayerAction.DISCARD);
    });

    test('should allow DECLARE_KONG in discard phase', () => {
      state.phase = GamePhase.WAITING_FOR_DISCARD;
      state.currentPlayer = 'East';
      state.players['East'].isCurrentPlayer = true;
      state.players['East'].hasDrawn = true;

      const actions = ActionValidator.getValidActions(state, 'East');
      expect(actions).toContain(PlayerAction.DECLARE_KONG);
    });

    test('should not allow DISCARD if not drawn', () => {
      state.phase = GamePhase.WAITING_FOR_DISCARD;
      state.currentPlayer = 'East';
      state.players['East'].isCurrentPlayer = true;
      state.players['East'].hasDrawn = false;

      const actions = ActionValidator.getValidActions(state, 'East');
      expect(actions).not.toContain(PlayerAction.DISCARD);
    });

    test('should allow PASS in claim window', () => {
      state.phase = GamePhase.CLAIM_WINDOW;
      state.currentPlayer = 'East';
      state.lastDiscard = {
        tile: createNumberTile(TileSuit.CHARACTER, 5, 1),
        fromPosition: 'East',
        timestamp: Date.now()
      };

      const actions = ActionValidator.getValidActions(state, 'South');
      expect(actions).toContain(PlayerAction.PASS);
    });

    test('should allow CLAIM_PONG in claim window if player has tiles', () => {
      state.phase = GamePhase.CLAIM_WINDOW;
      state.currentPlayer = 'East';
      state.players['South'].hand = [
        createNumberTile(TileSuit.CHARACTER, 5, 1),
        createNumberTile(TileSuit.CHARACTER, 5, 2)
      ];
      state.lastDiscard = {
        tile: createNumberTile(TileSuit.CHARACTER, 5, 3),
        fromPosition: 'East',
        timestamp: Date.now()
      };

      const actions = ActionValidator.getValidActions(state, 'South');
      expect(actions).toContain(PlayerAction.CLAIM_PONG);
    });

    test('should not allow current player to claim in claim window', () => {
      state.phase = GamePhase.CLAIM_WINDOW;
      state.currentPlayer = 'East';
      state.lastDiscard = {
        tile: createNumberTile(TileSuit.CHARACTER, 5, 1),
        fromPosition: 'East',
        timestamp: Date.now()
      };

      const actions = ActionValidator.getValidActions(state, 'East');
      expect(actions.length).toBe(0);
    });

    test('should not allow disconnected player to claim', () => {
      state.phase = GamePhase.CLAIM_WINDOW;
      state.currentPlayer = 'East';
      state.players['South'].isConnected = false;
      state.lastDiscard = {
        tile: createNumberTile(TileSuit.CHARACTER, 5, 1),
        fromPosition: 'East',
        timestamp: Date.now()
      };

      const actions = ActionValidator.getValidActions(state, 'South');
      expect(actions.length).toBe(0);
    });

    test('should return empty array for unknown phase', () => {
      state.phase = GamePhase.GAME_OVER;
      const actions = ActionValidator.getValidActions(state, 'East');
      expect(actions.length).toBe(0);
    });
  });
});


describe('Action Validator - Draw Action', () => {
  let state: GameState;

  beforeEach(() => {
    state = createGameState('room1', 'East');
    for (const position of ['East', 'South', 'West', 'North'] as const) {
      state.players[position].hand = Array.from({ length: 13 }, (_, i) =>
        createNumberTile(TileSuit.CHARACTER, (i % 9) + 1, (i % 4) + 1)
      );
    }
    state.phase = GamePhase.WAITING_FOR_DRAW;
    state.currentPlayer = 'East';
    state.players['East'].isCurrentPlayer = true;
  });

  describe('validateDraw', () => {
    test('should allow draw for current player in WAITING_FOR_DRAW phase', () => {
      const result = ActionValidator.validateDraw(state, 'East');
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    test('should reject draw if not current player', () => {
      const result = ActionValidator.validateDraw(state, 'South');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('It is not your turn');
    });

    test('should reject draw if wrong phase', () => {
      state.phase = GamePhase.WAITING_FOR_DISCARD;
      const result = ActionValidator.validateDraw(state, 'East');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('It is not the draw phase');
    });

    test('should reject draw if already drawn', () => {
      state.players['East'].hasDrawn = true;
      const result = ActionValidator.validateDraw(state, 'East');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('You have already drawn this turn');
    });

    test('should accumulate multiple errors', () => {
      state.phase = GamePhase.CLAIM_WINDOW;
      state.players['East'].hasDrawn = true;
      const result = ActionValidator.validateDraw(state, 'South');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
});

describe('Action Validator - Discard Action', () => {
  let state: GameState;

  beforeEach(() => {
    state = createGameState('room1', 'East');
    for (const position of ['East', 'South', 'West', 'North'] as const) {
      state.players[position].hand = Array.from({ length: 14 }, (_, i) =>
        createNumberTile(TileSuit.CHARACTER, (i % 9) + 1, (i % 4) + 1)
      );
    }
    state.phase = GamePhase.WAITING_FOR_DISCARD;
    state.currentPlayer = 'East';
    state.players['East'].isCurrentPlayer = true;
    state.players['East'].hasDrawn = true;
  });

  describe('validateDiscard', () => {
    test('should allow discard of tile in hand', () => {
      const tile = state.players['East'].hand[0];
      const result = ActionValidator.validateDiscard(state, 'East', tile);
      expect(result.isValid).toBe(true);
    });

    test('should reject discard if not current player', () => {
      const tile = state.players['East'].hand[0];
      const result = ActionValidator.validateDiscard(state, 'South', tile);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('It is not your turn');
    });

    test('should reject discard if wrong phase', () => {
      state.phase = GamePhase.WAITING_FOR_DRAW;
      const tile = state.players['East'].hand[0];
      const result = ActionValidator.validateDiscard(state, 'East', tile);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('It is not the discard phase');
    });

    test('should reject discard if not drawn yet', () => {
      state.players['East'].hasDrawn = false;
      const tile = state.players['East'].hand[0];
      const result = ActionValidator.validateDiscard(state, 'East', tile);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('You must draw before discarding');
    });

    test('should reject discard if already discarded', () => {
      state.players['East'].hasDiscarded = true;
      const tile = state.players['East'].hand[0];
      const result = ActionValidator.validateDiscard(state, 'East', tile);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('You have already discarded this turn');
    });

    test('should reject discard of tile not in hand', () => {
      const tile = createNumberTile(TileSuit.BAMBOO, 1, 1);
      const result = ActionValidator.validateDiscard(state, 'East', tile);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('You do not have that tile');
    });

    test('should allow discard of exact tile match', () => {
      const tile = state.players['East'].hand[5];
      const result = ActionValidator.validateDiscard(state, 'East', tile);
      expect(result.isValid).toBe(true);
    });
  });
});

describe('Action Validator - Claim Actions', () => {
  let state: GameState;

  beforeEach(() => {
    state = createGameState('room1', 'East');
    for (const position of ['East', 'South', 'West', 'North'] as const) {
      state.players[position].hand = Array.from({ length: 13 }, (_, i) =>
        createNumberTile(TileSuit.CHARACTER, (i % 9) + 1, (i % 4) + 1)
      );
      state.players[position].isConnected = true;
    }
    state.phase = GamePhase.CLAIM_WINDOW;
    state.currentPlayer = 'East';
    state.lastDiscard = {
      tile: createNumberTile(TileSuit.CHARACTER, 5, 1),
      fromPosition: 'East',
      timestamp: Date.now()
    };
  });

  describe('validateClaim', () => {
    test('should reject claim if wrong phase', () => {
      state.phase = GamePhase.WAITING_FOR_DRAW;
      const result = ActionValidator.validateClaim(state, 'South', PlayerAction.CLAIM_PONG);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('This is not the claim window');
    });

    test('should reject claim from discarder', () => {
      const result = ActionValidator.validateClaim(state, 'East', PlayerAction.CLAIM_PONG);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('You cannot claim your own discard');
    });

    test('should reject claim if disconnected', () => {
      state.players['South'].isConnected = false;
      const result = ActionValidator.validateClaim(state, 'South', PlayerAction.CLAIM_PONG);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('You are not connected');
    });

    test('should reject claim if no discard to claim', () => {
      state.lastDiscard = undefined;
      const result = ActionValidator.validateClaim(state, 'South', PlayerAction.CLAIM_PONG);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('No tile to claim');
    });

    test('should allow PASS claim', () => {
      const result = ActionValidator.validateClaim(state, 'South', PlayerAction.PASS);
      expect(result.isValid).toBe(true);
    });

    test('should reject CLAIM_PONG without matching tiles', () => {
      state.players['South'].hand = [
        createNumberTile(TileSuit.CHARACTER, 1, 1),
        createNumberTile(TileSuit.CHARACTER, 2, 1)
      ];
      const result = ActionValidator.validateClaim(state, 'South', PlayerAction.CLAIM_PONG);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('You need 2 matching tiles to pong');
    });

    test('should reject CLAIM_KONG without 3 matching tiles', () => {
      state.players['South'].hand = [
        createNumberTile(TileSuit.CHARACTER, 5, 1),
        createNumberTile(TileSuit.CHARACTER, 5, 2)
      ];
      const result = ActionValidator.validateClaim(state, 'South', PlayerAction.CLAIM_KONG);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('You need 3 matching tiles to kong');
    });
  });

  describe('validateDeclareKong', () => {
    beforeEach(() => {
      state.phase = GamePhase.WAITING_FOR_DISCARD;
      state.currentPlayer = 'East';
      state.players['East'].hasDrawn = true;
    });

    test('should allow declare kong with 4 matching tiles', () => {
      state.players['East'].hand = [
        createNumberTile(TileSuit.CHARACTER, 5, 1),
        createNumberTile(TileSuit.CHARACTER, 5, 2),
        createNumberTile(TileSuit.CHARACTER, 5, 3),
        createNumberTile(TileSuit.CHARACTER, 5, 4)
      ];
      const tile = createNumberTile(TileSuit.CHARACTER, 5, 1);
      const result = ActionValidator.validateDeclareKong(state, 'East', tile);
      expect(result.isValid).toBe(true);
    });

    test('should reject if not current player', () => {
      const tile = createNumberTile(TileSuit.CHARACTER, 5, 1);
      const result = ActionValidator.validateDeclareKong(state, 'South', tile);
      expect(result.isValid).toBe(false);
    });

    test('should reject if wrong phase', () => {
      state.phase = GamePhase.WAITING_FOR_DRAW;
      const tile = createNumberTile(TileSuit.CHARACTER, 5, 1);
      const result = ActionValidator.validateDeclareKong(state, 'East', tile);
      expect(result.isValid).toBe(false);
    });

    test('should reject if fewer than 4 matching tiles', () => {
      state.players['East'].hand = [
        createNumberTile(TileSuit.CHARACTER, 5, 1),
        createNumberTile(TileSuit.CHARACTER, 5, 2),
        createNumberTile(TileSuit.CHARACTER, 5, 3)
      ];
      const tile = createNumberTile(TileSuit.CHARACTER, 5, 1);
      const result = ActionValidator.validateDeclareKong(state, 'East', tile);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('You do not have 4 matching tiles');
    });
  });
});

describe('Action Validator - Game Start', () => {
  let state: GameState;

  beforeEach(() => {
    state = createGameState('room1', 'East');
    for (const position of ['East', 'South', 'West', 'North'] as const) {
      state.players[position].hand = Array.from({ length: 13 }, (_, i) =>
        createNumberTile(TileSuit.CHARACTER, (i % 9) + 1, (i % 4) + 1)
      );
      state.players[position].isConnected = true;
    }
  });

  describe('validateGameStart', () => {
    test('should allow game start when all players connected with tiles', () => {
      const result = ActionValidator.validateGameStart(state);
      expect(result.isValid).toBe(true);
    });

    test('should reject if player disconnected', () => {
      state.players['South'].isConnected = false;
      const result = ActionValidator.validateGameStart(state);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Not all players are connected');
    });

    test('should reject if player has no tiles', () => {
      state.players['West'].hand = [];
      const result = ActionValidator.validateGameStart(state);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Not all players have been dealt tiles');
    });

    test('should reject if multiple conditions fail', () => {
      state.players['South'].isConnected = false;
      state.players['West'].hand = [];
      const result = ActionValidator.validateGameStart(state);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
});

describe('Action Validator - Valid Actions', () => {
  let state: GameState;

  beforeEach(() => {
    state = createGameState('room1', 'East');
    for (const position of ['East', 'South', 'West', 'North'] as const) {
      state.players[position].hand = Array.from({ length: 13 }, (_, i) =>
        createNumberTile(TileSuit.CHARACTER, (i % 9) + 1, (i % 4) + 1)
      );
      state.players[position].isConnected = true;
    }
  });

  describe('getValidActions', () => {
    test('should allow DRAW for current player in WAITING_FOR_DRAW phase', () => {
      state.phase = GamePhase.WAITING_FOR_DRAW;
      state.currentPlayer = 'East';
      state.players['East'].isCurrentPlayer = true;

      const actions = ActionValidator.getValidActions(state, 'East');
      expect(actions).toContain(PlayerAction.DRAW);
    });

    test('should not allow DRAW for non-current player', () => {
      state.phase = GamePhase.WAITING_FOR_DRAW;
      state.currentPlayer = 'East';

      const actions = ActionValidator.getValidActions(state, 'South');
      expect(actions).not.toContain(PlayerAction.DRAW);
    });

    test('should allow DISCARD for current player after drawing', () => {
      state.phase = GamePhase.WAITING_FOR_DISCARD;
      state.currentPlayer = 'East';
      state.players['East'].isCurrentPlayer = true;
      state.players['East'].hasDrawn = true;

      const actions = ActionValidator.getValidActions(state, 'East');
      expect(actions).toContain(PlayerAction.DISCARD);
    });

    test('should allow DECLARE_KONG in discard phase', () => {
      state.phase = GamePhase.WAITING_FOR_DISCARD;
      state.currentPlayer = 'East';
      state.players['East'].isCurrentPlayer = true;
      state.players['East'].hasDrawn = true;

      const actions = ActionValidator.getValidActions(state, 'East');
      expect(actions).toContain(PlayerAction.DECLARE_KONG);
    });

    test('should not allow DISCARD if not drawn', () => {
      state.phase = GamePhase.WAITING_FOR_DISCARD;
      state.currentPlayer = 'East';
      state.players['East'].isCurrentPlayer = true;
      state.players['East'].hasDrawn = false;

      const actions = ActionValidator.getValidActions(state, 'East');
      expect(actions).not.toContain(PlayerAction.DISCARD);
    });

    test('should allow PASS in claim window', () => {
      state.phase = GamePhase.CLAIM_WINDOW;
      state.currentPlayer = 'East';
      state.lastDiscard = {
        tile: createNumberTile(TileSuit.CHARACTER, 5, 1),
        fromPosition: 'East',
        timestamp: Date.now()
      };

      const actions = ActionValidator.getValidActions(state, 'South');
      expect(actions).toContain(PlayerAction.PASS);
    });

    test('should allow CLAIM_PONG in claim window if player has tiles', () => {
      state.phase = GamePhase.CLAIM_WINDOW;
      state.currentPlayer = 'East';
      state.players['South'].hand = [
        createNumberTile(TileSuit.CHARACTER, 5, 1),
        createNumberTile(TileSuit.CHARACTER, 5, 2)
      ];
      state.lastDiscard = {
        tile: createNumberTile(TileSuit.CHARACTER, 5, 3),
        fromPosition: 'East',
        timestamp: Date.now()
      };

      const actions = ActionValidator.getValidActions(state, 'South');
      expect(actions).toContain(PlayerAction.CLAIM_PONG);
    });

    test('should not allow current player to claim in claim window', () => {
      state.phase = GamePhase.CLAIM_WINDOW;
      state.currentPlayer = 'East';
      state.lastDiscard = {
        tile: createNumberTile(TileSuit.CHARACTER, 5, 1),
        fromPosition: 'East',
        timestamp: Date.now()
      };

      const actions = ActionValidator.getValidActions(state, 'East');
      expect(actions.length).toBe(0);
    });

    test('should not allow disconnected player to claim', () => {
      state.phase = GamePhase.CLAIM_WINDOW;
      state.currentPlayer = 'East';
      state.players['South'].isConnected = false;
      state.lastDiscard = {
        tile: createNumberTile(TileSuit.CHARACTER, 5, 1),
        fromPosition: 'East',
        timestamp: Date.now()
      };

      const actions = ActionValidator.getValidActions(state, 'South');
      expect(actions.length).toBe(0);
    });

    test('should return empty array for unknown phase', () => {
      state.phase = GamePhase.GAME_OVER;
      const actions = ActionValidator.getValidActions(state, 'East');
      expect(actions.length).toBe(0);
    });
  });
});
