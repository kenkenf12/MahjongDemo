/**
 * Payment Calculator - Mode-specific payment calculations
 *
 * Implements the three confirmed payment modes:
 * 1. DISCARD: Only discarder pays (Q1 confirmed)
 * 2. SELF_DRAW: All 3 players pay equally (Q2 confirmed)
 * 3. FULL_PAYMENT: Separate liability player (Pao)
 *
 * BUSINESS RULES:
 * - No dealer multipliers (Q5 confirmed)
 * - Payments capped at max fan (Q4 confirmed)
 * - Simple consistent calculation
 */
import { Position, WinnerInfo, DiscardInfo, PlayerPaymentInfo, PaymentConfig } from '../types.js';
/**
 * Discard Win Payment Calculator
 * CONFIRMED RULE Q1: Only discarder pays, not all losers
 */
export declare class DiscardPaymentCalculator {
    /**
     * Calculate payment for discard win
     * @param winner Winner information
     * @param discarder Discarder information
     * @param config Payment configuration
     * @returns Payment breakdown
     */
    static calculate(winner: WinnerInfo, discarder: DiscardInfo, config: PaymentConfig): {
        payments: PlayerPaymentInfo[];
        totalReceived: number;
    };
}
/**
 * Self-Draw Win Payment Calculator
 * CONFIRMED RULE Q2: Each of 3 players pays equally
 */
export declare class SelfDrawPaymentCalculator {
    /**
     * Calculate payment for self-draw win
     * @param winner Winner information
     * @param allPositions All player positions (for identifying losers)
     * @param config Payment configuration
     * @returns Payment breakdown
     */
    static calculate(winner: WinnerInfo, allPositions: Position[], config: PaymentConfig): {
        payments: PlayerPaymentInfo[];
        totalReceived: number;
    };
}
/**
 * Full Payment (Pao) Calculator
 * When a specific player is liable for all payments (e.g., Kong liability)
 */
export declare class FullPaymentCalculator {
    /**
     * Calculate payment where one player is liable for all
     * @param winner Winner information
     * @param liabilityPlayer Player responsible for all payments
     * @param allPositions All player positions
     * @param config Payment configuration
     * @returns Payment breakdown
     */
    static calculate(winner: WinnerInfo, liabilityPlayer: Position, allPositions: Position[], config: PaymentConfig): {
        payments: PlayerPaymentInfo[];
        totalReceived: number;
    };
}
/**
 * Universal Payment Calculator
 * Routes to the appropriate calculator based on payment mode
 */
export declare class UniversalPaymentCalculator {
    /**
     * Calculate payment based on mode
     */
    static calculate(winner: WinnerInfo, discarder: DiscardInfo | null, liabilityPlayer: Position | null, allPositions: Position[], config: PaymentConfig): {
        payments: PlayerPaymentInfo[];
        totalReceived: number;
    };
}
//# sourceMappingURL=PaymentCalculator.d.ts.map