/**
 * Action Validator - Validates player actions
 *
 * Ensures:
 * - Player has valid action for current game phase
 * - Player has required tiles/melds for action
 * - Game rules are followed
 */
import { GamePhase, PlayerAction } from '../models/GameState';
import { areSameTileType } from '../models/Tile';
export class ActionValidator {
    /**
     * Validate a draw action
     */
    static validateDraw(state, position) {
        const errors = [];
        // Check it's this player's turn
        if (state.currentPlayer !== position) {
            errors.push('It is not your turn');
        }
        // Check phase
        if (state.phase !== GamePhase.WAITING_FOR_DRAW) {
            errors.push('It is not the draw phase');
        }
        // Check player hasn't drawn yet
        const player = state.players[position];
        if (player.hasDrawn) {
            errors.push('You have already drawn this turn');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * Validate a discard action
     */
    static validateDiscard(state, position, tile) {
        const errors = [];
        const player = state.players[position];
        // Check it's this player's turn
        if (state.currentPlayer !== position) {
            errors.push('It is not your turn');
        }
        // Check phase
        if (state.phase !== GamePhase.WAITING_FOR_DISCARD) {
            errors.push('It is not the discard phase');
        }
        // Check player has drawn
        if (!player.hasDrawn) {
            errors.push('You must draw before discarding');
        }
        // Check player already discarded
        if (player.hasDiscarded) {
            errors.push('You have already discarded this turn');
        }
        // Check tile is in hand
        const hasTile = player.hand.some(t => areSameTileType(t, tile));
        if (!hasTile) {
            errors.push('You do not have that tile');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * Validate a claim action (chow, pong, kong, win)
     */
    static validateClaim(state, position, claimType) {
        const errors = [];
        const player = state.players[position];
        // Check phase
        if (state.phase !== GamePhase.CLAIM_WINDOW) {
            errors.push('This is not the claim window');
        }
        // Check it's not the discarder
        if (state.lastDiscard?.fromPosition === position) {
            errors.push('You cannot claim your own discard');
        }
        // Check player is connected
        if (!player.isConnected) {
            errors.push('You are not connected');
        }
        if (!state.lastDiscard) {
            errors.push('No tile to claim');
        }
        else {
            const tile = state.lastDiscard.tile;
            // Validate specific claim type
            switch (claimType) {
                case PlayerAction.CLAIM_CHOW:
                    if (!this.canClaimChow(state, position, tile)) {
                        errors.push('You cannot chow that tile');
                    }
                    break;
                case PlayerAction.CLAIM_PONG:
                    if (!this.canClaimPong(player, tile)) {
                        errors.push('You need 2 matching tiles to pong');
                    }
                    break;
                case PlayerAction.CLAIM_KONG:
                    if (!this.canClaimKong(player, tile)) {
                        errors.push('You need 3 matching tiles to kong');
                    }
                    break;
                case PlayerAction.CLAIM_WIN:
                    if (!this.canClaimWin(player, tile)) {
                        errors.push('Claiming this tile does not win');
                    }
                    break;
                case PlayerAction.PASS:
                    // Pass is always valid in claim window
                    break;
                default:
                    errors.push(`Invalid claim type: ${claimType}`);
            }
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * Validate declaring a kong from concealed hand
     */
    static validateDeclareKong(state, position, tile) {
        const errors = [];
        const player = state.players[position];
        // Check it's this player's turn
        if (state.currentPlayer !== position) {
            errors.push('It is not your turn');
        }
        // Check phase (can declare after drawing, before discarding)
        if (state.phase !== GamePhase.WAITING_FOR_DISCARD) {
            errors.push('You can only declare kong after drawing');
        }
        // Check player has 4 matching tiles
        const count = player.hand.filter(t => areSameTileType(t, tile)).length;
        if (count < 4) {
            errors.push('You do not have 4 matching tiles');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * Check if player can chow (only right neighbor, has 2 consecutive tiles)
     */
    static canClaimChow(state, position, tile) {
        // TODO: Implement chow validation
        // For now, return false as it requires more complex tile sequence checking
        return false;
    }
    /**
     * Check if player can pong (has 2 identical tiles)
     */
    static canClaimPong(player, tile) {
        const count = player.hand.filter((t) => areSameTileType(t, tile)).length;
        return count >= 2;
    }
    /**
     * Check if player can kong (has 3 identical tiles)
     */
    static canClaimKong(player, tile) {
        const count = player.hand.filter((t) => areSameTileType(t, tile)).length;
        return count >= 3;
    }
    /**
     * Check if claiming tile results in a win
     */
    static canClaimWin(player, tile) {
        // TODO: Use HandValidator to check winning pattern
        return false;
    }
    /**
     * Validate all preconditions for game to start
     */
    static validateGameStart(state) {
        const errors = [];
        // Check all 4 players are present
        const players = Object.values(state.players);
        if (players.length !== 4) {
            errors.push('Not all 4 players are present');
        }
        // Check all players are connected
        if (!players.every(p => p.isConnected)) {
            errors.push('Not all players are connected');
        }
        // Check all players have been dealt tiles
        if (!players.every(p => p.hand.length > 0)) {
            errors.push('Not all players have been dealt tiles');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * Get all valid actions for a player in current game state
     */
    static getValidActions(state, position) {
        const actions = [];
        const player = state.players[position];
        switch (state.phase) {
            case GamePhase.WAITING_FOR_DRAW:
                if (state.currentPlayer === position) {
                    actions.push(PlayerAction.DRAW);
                }
                break;
            case GamePhase.WAITING_FOR_DISCARD:
                if (state.currentPlayer === position && player.hasDrawn) {
                    actions.push(PlayerAction.DISCARD);
                    // Can also declare kong before discarding
                    actions.push(PlayerAction.DECLARE_KONG);
                }
                break;
            case GamePhase.CLAIM_WINDOW:
                if (state.currentPlayer !== position && player.isConnected) {
                    // This player can claim
                    if (state.lastDiscard) {
                        actions.push(PlayerAction.PASS);
                        if (this.canClaimPong(player, state.lastDiscard.tile)) {
                            actions.push(PlayerAction.CLAIM_PONG);
                        }
                        if (this.canClaimKong(player, state.lastDiscard.tile)) {
                            actions.push(PlayerAction.CLAIM_KONG);
                        }
                        if (this.canClaimWin(player, state.lastDiscard.tile)) {
                            actions.push(PlayerAction.CLAIM_WIN);
                        }
                    }
                }
                break;
            default:
            // No valid actions in other phases
        }
        return actions;
    }
}
