/**
 * Game State Model - Complete game state structure
 *
 * Tracks:
 * - Room info (code, players)
 * - Game phase (waiting, playing, completed)
 * - Player hands, melds, discards
 * - Wall state
 * - Turn sequence
 * - Scores and settlement
 */
/**
 * Game phases during a round
 */
export var GamePhase;
(function (GamePhase) {
    GamePhase["INITIALIZING"] = "initializing";
    GamePhase["WAITING_FOR_DRAW"] = "waiting_for_draw";
    GamePhase["WAITING_FOR_DISCARD"] = "waiting_for_discard";
    GamePhase["CLAIM_WINDOW"] = "claim_window";
    GamePhase["TURN_COMPLETE"] = "turn_complete";
    GamePhase["GAME_OVER"] = "game_over";
    GamePhase["ALL_PASS"] = "all_pass"; // All players passed on last discard
})(GamePhase || (GamePhase = {}));
/**
 * Player action types
 */
export var PlayerAction;
(function (PlayerAction) {
    PlayerAction["DRAW"] = "draw";
    PlayerAction["DISCARD"] = "discard";
    PlayerAction["CLAIM_CHOW"] = "claim_chow";
    PlayerAction["CLAIM_PONG"] = "claim_pong";
    PlayerAction["CLAIM_KONG"] = "claim_kong";
    PlayerAction["CLAIM_WIN"] = "claim_win";
    PlayerAction["DECLARE_KONG"] = "declare_kong";
    PlayerAction["PASS"] = "pass";
})(PlayerAction || (PlayerAction = {}));
/**
 * Create initial player state
 */
export function createPlayerState(position, isDealer) {
    return {
        position,
        isDealer,
        hand: [],
        melds: [],
        discards: [],
        bonusTiles: [],
        score: 0,
        isConnected: true,
        isCurrentPlayer: false,
        hasDrawn: false,
        hasDiscarded: false
    };
}
/**
 * Create initial game state
 */
export function createGameState(roomCode, dealerPosition = 'East') {
    return {
        roomCode,
        isActive: true,
        players: {
            'East': createPlayerState('East', dealerPosition === 'East'),
            'South': createPlayerState('South', dealerPosition === 'South'),
            'West': createPlayerState('West', dealerPosition === 'West'),
            'North': createPlayerState('North', dealerPosition === 'North')
        },
        wallTilesRemaining: 86, // 144 - 54 dealt - 4 kong
        kongReplacementsRemaining: 4,
        phase: GamePhase.INITIALIZING,
        currentPlayer: dealerPosition,
        discardRound: 0,
        roundStartTime: Date.now(),
        lastActionTime: Date.now(),
        dealerPosition,
        roundNumber: 1
    };
}
/**
 * Get next player in clockwise order
 */
export function getNextPlayer(current) {
    const order = ['East', 'South', 'West', 'North'];
    const currentIndex = order.indexOf(current);
    return order[(currentIndex + 1) % 4];
}
/**
 * Get all players except current
 */
export function getOtherPlayers(state, position) {
    return Object.values(state.players).filter(p => p.position !== position);
}
/**
 * Check if hand has tiles (for validation)
 */
export function hasValidHandSize(player, isCurrentPlayer, hasDrawn) {
    let expectedSize = 13; // Normal hand
    if (isCurrentPlayer && hasDrawn && !player.hasDiscarded) {
        expectedSize = 14; // After draw, before discard
    }
    return player.hand.length === expectedSize;
}
/**
 * Count total tiles in player's holdings
 */
export function getTotalPlayerTiles(player) {
    const handSize = player.hand.length;
    const meldSize = player.melds.reduce((sum, meld) => sum + meld.tiles.length, 0);
    const bonusSize = player.bonusTiles.length;
    return handSize + meldSize + bonusSize;
}
/**
 * Get player by position
 */
export function getPlayer(state, position) {
    return state.players[position];
}
/**
 * Check if all players are connected
 */
export function areAllPlayersConnected(state) {
    return Object.values(state.players).every(p => p.isConnected);
}
/**
 * Check if game is in active play phase
 */
export function isGameInPlay(state) {
    return state.phase === GamePhase.WAITING_FOR_DRAW ||
        state.phase === GamePhase.WAITING_FOR_DISCARD ||
        state.phase === GamePhase.CLAIM_WINDOW ||
        state.phase === GamePhase.TURN_COMPLETE;
}
