/**
 * Express Server with WebSocket Support - Main application entry point
 * 
 * Starts HTTP server on configurable port
 * Mounts API routes
 * Initializes WebSocket (Socket.IO) for real-time multiplayer
 * Handles CORS and middleware
 */

import express, { Express } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import apiRoutes from './api/routes';
import { initializeWebSocketManager } from './api/WebSocketGameManager';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

const app: Express = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Initialize WebSocket manager
const wsGameManager = initializeWebSocketManager(io);

// API Routes
app.use('/', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Mahjong Game API with WebSocket',
    version: '1.0.0',
    features: ['REST API', 'WebSocket (Real-time Multiplayer)'],
    endpoints: {
      health: 'GET /health',
      games: {
        create: 'POST /api/games',
        list: 'GET /api/games',
        get: 'GET /api/games/:gameId',
        start: 'POST /api/games/:gameId/start',
        draw: 'POST /api/games/:gameId/draw',
        discard: 'POST /api/games/:gameId/discard',
        claim: 'POST /api/games/:gameId/claim',
        pass: 'POST /api/games/:gameId/pass',
        actions: 'GET /api/games/:gameId/actions',
        delete: 'DELETE /api/games/:gameId'
      },
      websocket: {
        description: 'Connect to ws://host:port for real-time multiplayer',
        events: {
          'join-game': 'Join a game as a player',
          'player-action': 'Execute action (draw, discard, claim, pass)',
          'leave-game': 'Leave the game',
          'ping': 'Send heartbeat'
        }
      }
    }
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[ERROR]', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
const server = httpServer.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   Mahjong Game API + WebSocket         ║
╠════════════════════════════════════════╣
║ Host: ${HOST}${' '.repeat(30 - HOST.length)} ║
║ Port: ${PORT}${' '.repeat(34 - String(PORT).length)} ║
║ HTTP: http://${HOST}:${PORT}${' '.repeat(21 - String(PORT).length)} ║
║ WS:   ws://${HOST}:${PORT}${' '.repeat(23 - String(PORT).length)} ║
╚════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
