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
import { Tile } from '../models/Tile';
import { HandPattern } from '../models/Meld';
import { DEFAULT_FAN_VALUES } from '../constants';
export interface FanBreakdown {
    meldsTotal: number;
    bonusTotal: number;
    patternBonus: number;
    total: number;
    details: string[];
}
export declare class FanCalculator {
    /**
     * Calculate fan for a winning hand
     *
     * @param pattern The winning hand pattern (4 melds + 1 pair)
     * @param fanValues Custom fan values (uses defaults if not provided)
     * @returns Total fan with breakdown
     */
    static calculateFan(pattern: HandPattern, fanValues?: typeof DEFAULT_FAN_VALUES): FanBreakdown;
    /**
     * Simple interface: calculate fan from tiles directly
     * (after hand validation confirms 4 melds + 1 pair)
     */
    static calculateFanFromTiles(allTiles: Tile[], bonusTiles?: Tile[], fanValues?: typeof DEFAULT_FAN_VALUES): FanBreakdown | null;
    /**
     * Get fan value for a specific pattern type
     */
    static getPatternFanValue(pattern: HandPattern, patternName: 'allSimples' | 'allTerminalsHonors' | 'oneSuit', fanValues?: typeof DEFAULT_FAN_VALUES): number;
}
//# sourceMappingURL=FanCalculator.d.ts.map