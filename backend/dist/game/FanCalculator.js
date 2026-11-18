/**
 * Fan Calculator - Calculates fan (points) for winning hands
 *
 * Fan scoring system:
 * - Base: Melds contribute fan (pong=1, kong concealed=2)
 * - Bonus: Flowers/seasons add fan (1 each)
 * - Patterns: Special patterns add fan
 *   - All Simples: +2 fan
 *   - All Terminals/Honors: +1 fan
 *   - One Suit (no honors): +1 fan
 *
 * Minimum fan to win: 1 fan
 */
import { getMeldFanValue, getBonusFanValue } from '../models/Meld.js';
import { HandValidator } from './HandValidator.js';
import { DEFAULT_FAN_VALUES } from '../constants.js';
export class FanCalculator {
    /**
     * Calculate fan for a winning hand
     *
     * @param pattern The winning hand pattern (4 melds + 1 pair)
     * @param fanValues Custom fan values (uses defaults if not provided)
     * @returns Total fan with breakdown
     */
    static calculateFan(pattern, fanValues = DEFAULT_FAN_VALUES) {
        const details = [];
        let total = 0;
        // 1. Calculate fan from melds
        const meldsTotal = pattern.melds.reduce((sum, meld) => {
            const meldFan = getMeldFanValue(meld, fanValues);
            sum += meldFan;
            if (meldFan > 0) {
                details.push(`${meld.type}: ${meldFan} fan`);
            }
            return sum;
        }, 0);
        total += meldsTotal;
        // 2. Calculate fan from bonus tiles
        const bonusTotal = getBonusFanValue(pattern.flowers, pattern.seasons, fanValues);
        if (bonusTotal > 0) {
            if (pattern.flowers.length > 0) {
                details.push(`Flowers (${pattern.flowers.length}): ${pattern.flowers.length * (fanValues.FLOWER || 1)} fan`);
            }
            if (pattern.seasons.length > 0) {
                details.push(`Seasons (${pattern.seasons.length}): ${pattern.seasons.length * (fanValues.SEASON || 1)} fan`);
            }
        }
        total += bonusTotal;
        // 3. Calculate pattern bonuses
        let patternBonus = 0;
        // All Simples (2-8 only)
        if (HandValidator.isAllSimples(pattern)) {
            patternBonus += fanValues.ALL_SIMPLES || 2;
            details.push(`All Simples: ${fanValues.ALL_SIMPLES || 2} fan`);
        }
        // All Terminals and Honors (at least one in each meld)
        if (HandValidator.isAllTerminalsAndHonors(pattern)) {
            patternBonus += fanValues.ALL_TERMINALS_AND_HONORS || 1;
            details.push(`All Terminals & Honors: ${fanValues.ALL_TERMINALS_AND_HONORS || 1} fan`);
        }
        total += patternBonus;
        // Ensure minimum 1 fan to win
        if (total < 1) {
            total = 1;
            if (details.length === 0) {
                details.push('Minimum fan to win: 1 fan');
            }
        }
        return {
            meldsTotal,
            bonusTotal,
            patternBonus,
            total,
            details
        };
    }
    /**
     * Simple interface: calculate fan from tiles directly
     * (after hand validation confirms 4 melds + 1 pair)
     */
    static calculateFanFromTiles(allTiles, bonusTiles = [], fanValues = DEFAULT_FAN_VALUES) {
        // Validate hand first
        const validation = HandValidator.validateWinningHand(allTiles, bonusTiles);
        if (!validation.isValid || !validation.pattern) {
            return null;
        }
        return this.calculateFan(validation.pattern, fanValues);
    }
    /**
     * Get fan value for a specific pattern type
     */
    static getPatternFanValue(pattern, patternName, fanValues = DEFAULT_FAN_VALUES) {
        switch (patternName) {
            case 'allSimples':
                return HandValidator.isAllSimples(pattern) ? (fanValues.ALL_SIMPLES || 2) : 0;
            case 'allTerminalsHonors':
                return HandValidator.isAllTerminalsAndHonors(pattern) ? (fanValues.ALL_TERMINALS_AND_HONORS || 1) : 0;
            case 'oneSuit':
                return HandValidator.isOneSuit(pattern) ? 1 : 0;
            default:
                return 0;
        }
    }
}
