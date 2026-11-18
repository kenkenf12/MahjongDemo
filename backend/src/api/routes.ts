/**
 * REST API Routes - Express route handlers
 * 
 * Endpoints:
 * POST   /api/games                 - Create new game
 * GET    /api/games                 - List active games
 * GET    /api/games/:gameId         - Get game state
 * POST   /api/games/:gameId/start   - Start game
 * POST   /api/games/:gameId/draw    - Player draw
 * POST   /api/games/:gameId/discard - Player discard
 * POST   /api/games/:gameId/claim   - Player claim
 * POST   /api/games/:gameId/pass    - Player pass
 * GET    /api/games/:gameId/actions - Get valid actions
 * DELETE /api/games/:gameId         - End/delete game
 * GET    /health                    - Health check
 */

import { Router, Request, Response } from 'express';
import { gameService } from './GameService';
import { Tile, TileSuit, createNumberTile, createWindTile, createDragonTile } from '../models/Tile';

const router = Router();

/**
 * Health check
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Create a new game
 * POST /api/games
 * Body: { playerNames: { East: string, South: string, West: string, North: string } }
 */
router.post('/api/games', (req: Request, res: Response) => {
  try {
    const { playerNames } = req.body;

    if (!playerNames || typeof playerNames !== 'object') {
      return res.status(400).json({ error: 'playerNames object required' });
    }

    // Generate room code
    const roomCode = `ROOM-${Date.now()}`;

    // Create game
    const session = gameService.createGame(roomCode, playerNames);

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * List all active games
 * GET /api/games
 */
router.get('/api/games', (req: Request, res: Response) => {
  try {
    const games = gameService.listGames();
    res.json({
      success: true,
      data: games,
      count: games.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get game state
 * GET /api/games/:gameId
 */
router.get('/api/games/:gameId', (req: Request, res: Response) => {
  try {
    const { gameId } = req.params as { gameId: string };
    const game = gameService.getGame(gameId);
    const session = gameService.getSession(gameId);

    if (!game || !session) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json({
      success: true,
      data: {
        session,
        state: {
          phase: game.phase,
          currentPlayer: game.currentPlayer,
          players: Object.keys(game.players).map(pos => ({
            position: pos,
            handSize: game.players[pos as 'East' | 'South' | 'West' | 'North'].hand.length,
            meldsCount: game.players[pos as 'East' | 'South' | 'West' | 'North'].melds.length,
            discardsCount: game.players[pos as 'East' | 'South' | 'West' | 'North'].discards.length,
            score: game.players[pos as 'East' | 'South' | 'West' | 'North'].score
          })),
          wallRemaining: game.wallTilesRemaining,
          kongRemaining: game.kongReplacementsRemaining,
          lastDiscard: game.lastDiscard ? {
            tile: tileToString(game.lastDiscard.tile),
            from: game.lastDiscard.fromPosition
          } : null
        }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Start a game
 * POST /api/games/:gameId/start
 */
router.post('/api/games/:gameId/start', (req: Request, res: Response) => {
  try {
    const { gameId } = req.params as { gameId: string };
    const result = gameService.startGame(gameId);

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({
      success: true,
      message: result.message,
      data: { phase: result.gameState?.phase }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Player draws a tile
 * POST /api/games/:gameId/draw
 * Body: { position: 'East' | 'South' | 'West' | 'North' }
 */
router.post('/api/games/:gameId/draw', (req: Request, res: Response) => {
  try {
    const { gameId } = req.params as { gameId: string };
    const { position } = req.body;

    if (!position) {
      return res.status(400).json({ error: 'position required' });
    }

    const result = gameService.playerDraw(gameId, position);

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    const handSize = result.gameState?.players[position as 'East' | 'South' | 'West' | 'North']?.hand.length;
    res.json({
      success: true,
      message: result.message,
      data: { phase: result.gameState?.phase, handSize }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Player discards a tile
 * POST /api/games/:gameId/discard
 * Body: { position: string, tile: { suit: string, rank: number, instance: number } }
 */
router.post('/api/games/:gameId/discard', (req: Request, res: Response) => {
  try {
    const { gameId } = req.params as { gameId: string };
    const { position, tile } = req.body;

    if (!position || !tile) {
      return res.status(400).json({ error: 'position and tile required' });
    }

    // Parse tile (this is simplified - full implementation would handle all tile types)
    const parsedTile = stringToTile(tile);
    if (!parsedTile) {
      return res.status(400).json({ error: 'Invalid tile format' });
    }

    const result = gameService.playerDiscard(gameId, position, parsedTile);

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({
      success: true,
      message: result.message,
      data: { phase: result.gameState?.phase }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Player claims discard
 * POST /api/games/:gameId/claim
 * Body: { position: string, claimType: 'pong' | 'kong' | 'chow' | 'win' | 'pass' }
 */
router.post('/api/games/:gameId/claim', (req: Request, res: Response) => {
  try {
    const { gameId } = req.params as { gameId: string };
    const { position, claimType } = req.body;

    if (!position || !claimType) {
      return res.status(400).json({ error: 'position and claimType required' });
    }

    const result = gameService.playerClaim(gameId, position, claimType);

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({
      success: true,
      message: result.message,
      data: { phase: result.gameState?.phase }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Player passes (no claim)
 * POST /api/games/:gameId/pass
 * Body: { position: string }
 */
router.post('/api/games/:gameId/pass', (req: Request, res: Response) => {
  try {
    const { gameId } = req.params as { gameId: string };
    const { position } = req.body;

    if (!position) {
      return res.status(400).json({ error: 'position required' });
    }

    const result = gameService.playerPass(gameId, position);

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({
      success: true,
      message: result.message,
      data: { phase: result.gameState?.phase }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get valid actions for a player
 * GET /api/games/:gameId/actions?position=East
 */
router.get('/api/games/:gameId/actions', (req: Request, res: Response) => {
  try {
    const { gameId } = req.params as { gameId: string };
    const { position } = req.query;

    if (!position) {
      return res.status(400).json({ error: 'position query param required' });
    }

    const actions = gameService.getValidActions(gameId, position as 'East' | 'South' | 'West' | 'North');

    res.json({
      success: true,
      data: { actions }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * End/Delete a game
 * DELETE /api/games/:gameId
 */
router.delete('/api/games/:gameId', (req: Request, res: Response) => {
  try {
    const { gameId } = req.params as { gameId: string };
    const result = gameService.endGame(gameId);
    gameService.deleteGame(gameId);

    res.json({
      success: true,
      message: 'Game ended and deleted'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Helper: Convert tile object to string representation
 */
function tileToString(tile: Tile): string {
  // Simplified - would need full implementation for all tile types
  return JSON.stringify(tile);
}

/**
 * Helper: Convert string to tile object
 */
function stringToTile(tileStr: any): Tile | null {
  // Simplified parsing - would need full implementation
  if (typeof tileStr === 'object' && tileStr.suit && tileStr.rank !== undefined && tileStr.instance) {
    try {
      if (tileStr.suit.toUpperCase() === 'CHARACTER' || tileStr.suit.toUpperCase() === 'BAMBOO' || tileStr.suit.toUpperCase() === 'DOT') {
        return createNumberTile(
          tileStr.suit as TileSuit,
          tileStr.rank,
          tileStr.instance
        );
      }
    } catch (e) {
      return null;
    }
  }
  return null;
}

export default router;
