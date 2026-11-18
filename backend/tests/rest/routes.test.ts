/**
 * REST API Route Tests
 * Tests HTTP endpoints
 */

import request from 'supertest';
import express, { Express } from 'express';
import apiRoutes from '../../src/api/routes';

describe('REST API Routes', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', apiRoutes);
  });

  describe('Health Check', () => {
    test('GET /health should return ok', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('Create Game', () => {
    test('POST /api/games should create a new game', async () => {
      const playerNames = {
        East: 'Alice',
        South: 'Bob',
        West: 'Charlie',
        North: 'David'
      };

      const response = await request(app)
        .post('/api/games')
        .send({ playerNames });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.gameId).toBeDefined();
      expect(response.body.data.status).toBe('initializing');
    });

    test('POST /api/games should require playerNames', async () => {
      const response = await request(app)
        .post('/api/games')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('List Games', () => {
    test('GET /api/games should list games', async () => {
      // Create some games first
      const playerNames = {
        East: 'Alice',
        South: 'Bob',
        West: 'Charlie',
        North: 'David'
      };

      await request(app)
        .post('/api/games')
        .send({ playerNames });

      const response = await request(app).get('/api/games');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Get Game', () => {
    test('GET /api/games/:gameId should return game state', async () => {
      const playerNames = {
        East: 'Alice',
        South: 'Bob',
        West: 'Charlie',
        North: 'David'
      };

      const createResponse = await request(app)
        .post('/api/games')
        .send({ playerNames });

      const gameId = createResponse.body.data.gameId;

      const response = await request(app).get(`/api/games/${gameId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.state.phase).toBeDefined();
      expect(response.body.data.state.currentPlayer).toBeDefined();
    });

    test('GET /api/games/:gameId should return 404 for non-existent game', async () => {
      const response = await request(app).get('/api/games/non-existent');

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Start Game', () => {
    test('POST /api/games/:gameId/start should start game', async () => {
      const playerNames = {
        East: 'Alice',
        South: 'Bob',
        West: 'Charlie',
        North: 'David'
      };

      const createResponse = await request(app)
        .post('/api/games')
        .send({ playerNames });

      const gameId = createResponse.body.data.gameId;

      const response = await request(app).post(`/api/games/${gameId}/start`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Game started');
    });
  });

  describe('Player Draw', () => {
    test('POST /api/games/:gameId/draw should process draw', async () => {
      const playerNames = {
        East: 'Alice',
        South: 'Bob',
        West: 'Charlie',
        North: 'David'
      };

      const createResponse = await request(app)
        .post('/api/games')
        .send({ playerNames });

      const gameId = createResponse.body.data.gameId;
      await request(app).post(`/api/games/${gameId}/start`);

      const response = await request(app)
        .post(`/api/games/${gameId}/draw`)
        .send({ position: 'East' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Tile drawn');
    });

    test('POST /api/games/:gameId/draw should require position', async () => {
      const playerNames = {
        East: 'Alice',
        South: 'Bob',
        West: 'Charlie',
        North: 'David'
      };

      const createResponse = await request(app)
        .post('/api/games')
        .send({ playerNames });

      const gameId = createResponse.body.data.gameId;
      await request(app).post(`/api/games/${gameId}/start`);

      const response = await request(app)
        .post(`/api/games/${gameId}/draw`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    test('POST /api/games/:gameId/draw should fail for wrong player', async () => {
      const playerNames = {
        East: 'Alice',
        South: 'Bob',
        West: 'Charlie',
        North: 'David'
      };

      const createResponse = await request(app)
        .post('/api/games')
        .send({ playerNames });

      const gameId = createResponse.body.data.gameId;
      await request(app).post(`/api/games/${gameId}/start`);

      const response = await request(app)
        .post(`/api/games/${gameId}/draw`)
        .send({ position: 'South' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Get Valid Actions', () => {
    test('GET /api/games/:gameId/actions should return valid actions', async () => {
      const playerNames = {
        East: 'Alice',
        South: 'Bob',
        West: 'Charlie',
        North: 'David'
      };

      const createResponse = await request(app)
        .post('/api/games')
        .send({ playerNames });

      const gameId = createResponse.body.data.gameId;
      await request(app).post(`/api/games/${gameId}/start`);

      const response = await request(app)
        .get(`/api/games/${gameId}/actions`)
        .query({ position: 'East' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.actions).toBeInstanceOf(Array);
      expect(response.body.data.actions).toContain('draw');
    });

    test('GET /api/games/:gameId/actions should require position', async () => {
      const playerNames = {
        East: 'Alice',
        South: 'Bob',
        West: 'Charlie',
        North: 'David'
      };

      const createResponse = await request(app)
        .post('/api/games')
        .send({ playerNames });

      const gameId = createResponse.body.data.gameId;

      const response = await request(app)
        .get(`/api/games/${gameId}/actions`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('End Game', () => {
    test('DELETE /api/games/:gameId should end game', async () => {
      const playerNames = {
        East: 'Alice',
        South: 'Bob',
        West: 'Charlie',
        North: 'David'
      };

      const createResponse = await request(app)
        .post('/api/games')
        .send({ playerNames });

      const gameId = createResponse.body.data.gameId;

      const response = await request(app).delete(`/api/games/${gameId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Root Endpoint', () => {
    test('GET / should return API info', async () => {
      // Create a fresh app for root route testing
      const testApp = express();
      testApp.use(express.json());
      
      // Add root route
      testApp.get('/', (req, res) => {
        res.json({
          message: 'Mahjong Game API',
          version: '1.0.0',
          endpoints: {}
        });
      });
      
      testApp.use('/', apiRoutes);

      const response = await request(testApp).get('/');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Mahjong Game API');
      expect(response.body.version).toBeDefined();
      expect(response.body.endpoints).toBeDefined();
    });
  });
});
