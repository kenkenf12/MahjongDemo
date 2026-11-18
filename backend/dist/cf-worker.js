/**
 * Cloudflare Workers Entry Point
 *
 * This module adapts the Express app to run on Cloudflare Workers
 * using the nodejs_compat runtime flag.
 */
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './server.js';
// Export for Cloudflare Workers
export default {
    async fetch(request, env, ctx) {
        // Create HTTP server from Express app
        const httpServer = createServer(app);
        // Initialize Socket.IO for WebSocket support
        const io = new SocketIOServer(httpServer, {
            cors: {
                origin: process.env.FRONTEND_URL || '*',
                methods: ['GET', 'POST']
            }
        });
        // Handle requests
        try {
            // Parse request
            const url = new URL(request.url);
            const pathname = url.pathname;
            const method = request.method;
            // Log request
            console.log(`[${new Date().toISOString()}] ${method} ${pathname}`);
            // Route to appropriate handler
            if (pathname.startsWith('/api/')) {
                return handleAPIRequest(request, app);
            }
            else if (pathname === '/health') {
                return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            else if (pathname === '/') {
                return new Response(JSON.stringify({
                    message: 'Mahjong Game API with WebSocket',
                    version: '1.0.0',
                    features: ['REST API', 'WebSocket (Real-time Multiplayer)'],
                    docs: 'https://github.com/yourusername/MahjongDemo',
                    endpoints: {
                        health: 'GET /health',
                        games: 'POST /api/games, GET /api/games/:gameId',
                        websocket: 'ws://your-worker-url'
                    }
                }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            else {
                return new Response(JSON.stringify({ error: 'Not found' }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }
        catch (error) {
            console.error('[ERROR]', error);
            return new Response(JSON.stringify({
                error: error instanceof Error ? error.message : 'Internal server error'
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }
};
/**
 * Handle API requests through Express middleware
 */
async function handleAPIRequest(request, expressApp) {
    // Convert Fetch API request to Node.js compatible format
    const method = request.method;
    const headers = Object.fromEntries(request.headers);
    const body = method !== 'GET' && method !== 'HEAD' ? await request.text() : undefined;
    return new Promise((resolve) => {
        // Mock Node.js request/response objects for Express
        const req = {
            method,
            url: new URL(request.url).pathname + new URL(request.url).search,
            headers,
            body,
            get: (header) => headers[header.toLowerCase()]
        };
        const res = {
            statusCode: 200,
            _headers: {},
            _body: '',
            setHeader: function (key, value) {
                this._headers[key] = value;
            },
            end: function (data) {
                this._body = data;
                resolve(new Response(this._body, {
                    status: this.statusCode,
                    headers: this._headers
                }));
            },
            json: function (data) {
                this.setHeader('Content-Type', 'application/json');
                this.end(JSON.stringify(data));
            },
            write: function (data) {
                this._body += data;
            },
            status: function (code) {
                this.statusCode = code;
                return this;
            }
        };
        // Route through Express
        expressApp(req, res);
    });
}
/**
 * Durable Object for game room state management
 * This provides persistent state across Cloudflare edge locations
 */
export class GameRoom {
    constructor(state, env) {
        this.state = state;
        this.env = env;
    }
    async fetch(request) {
        const url = new URL(request.url);
        const pathname = url.pathname;
        const method = request.method;
        switch (method) {
            case 'GET':
                if (pathname === '/state') {
                    const gameState = await this.state.get('gameState');
                    return new Response(JSON.stringify({ gameState }), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
                break;
            case 'POST':
                if (pathname === '/action') {
                    const body = await request.json();
                    // Process game action
                    const result = await this.processAction(body);
                    return new Response(JSON.stringify(result), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
                break;
            case 'PUT':
                if (pathname === '/state') {
                    const body = await request.json();
                    await this.state.put('gameState', body);
                    return new Response(JSON.stringify({ success: true }), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
                break;
        }
        return new Response(JSON.stringify({ error: 'Not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    async processAction(action) {
        // Get current game state
        const gameState = await this.state.get('gameState') || {};
        // Process action based on type
        switch (action.type) {
            case 'draw':
                // Handle draw action
                break;
            case 'discard':
                // Handle discard action
                break;
            case 'claim':
                // Handle claim action
                break;
            default:
                return { success: false, error: 'Unknown action' };
        }
        // Save updated state
        await this.state.put('gameState', gameState);
        return { success: true, gameState };
    }
}
