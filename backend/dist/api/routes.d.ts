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
declare const router: import("express-serve-static-core").Router;
export default router;
//# sourceMappingURL=routes.d.ts.map