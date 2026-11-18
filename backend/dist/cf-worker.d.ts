/**
 * Cloudflare Workers Entry Point
 *
 * This module adapts the Express app to run on Cloudflare Workers
 * using the nodejs_compat runtime flag.
 */
declare const _default: {
    fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response>;
};
export default _default;
/**
 * Durable Object for game room state management
 * This provides persistent state across Cloudflare edge locations
 */
export declare class GameRoom {
    private state;
    private env;
    constructor(state: any, env: any);
    fetch(request: Request): Promise<Response>;
    private processAction;
}
export interface GameEnvironment {
    GAME_KV: KVNamespace;
    GAME_ROOM: DurableObjectNamespace;
    FRONTEND_URL?: string;
}
//# sourceMappingURL=cf-worker.d.ts.map