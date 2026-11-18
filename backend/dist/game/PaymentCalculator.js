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
import { PaymentMode } from '../types.js';
/**
 * Discard Win Payment Calculator
 * CONFIRMED RULE Q1: Only discarder pays, not all losers
 */
export class DiscardPaymentCalculator {
    /**
     * Calculate payment for discard win
     * @param winner Winner information
     * @param discarder Discarder information
     * @param config Payment configuration
     * @returns Payment breakdown
     */
    static calculate(winner, discarder, config) {
        if (!config.paymentModes.discard.enabled) {
            throw new Error('Discard payment mode is not enabled in configuration');
        }
        // Calculate base payment (fan count * base rate)
        let basePayment = winner.fanCount * config.baseRate;
        // Apply max fan cap if configured
        if (config.maxFanForCalculation > 0 && winner.fanCount > config.maxFanForCalculation) {
            basePayment = config.maxFanForCalculation * config.baseRate;
        }
        // Apply per-loser payment cap if configured
        if (config.maxPaymentPerLoser > 0 && basePayment > config.maxPaymentPerLoser) {
            basePayment = config.maxPaymentPerLoser;
        }
        // CONFIRMED Q1: Only discarder pays (not all 3 losers)
        const payments = [
            {
                position: discarder.position,
                amountToPay: basePayment,
                reason: 'discard'
            }
        ];
        const totalReceived = basePayment;
        return { payments, totalReceived };
    }
}
/**
 * Self-Draw Win Payment Calculator
 * CONFIRMED RULE Q2: Each of 3 players pays equally
 */
export class SelfDrawPaymentCalculator {
    /**
     * Calculate payment for self-draw win
     * @param winner Winner information
     * @param allPositions All player positions (for identifying losers)
     * @param config Payment configuration
     * @returns Payment breakdown
     */
    static calculate(winner, allPositions, config) {
        if (!config.paymentModes.selfDraw.enabled) {
            throw new Error('Self-draw payment mode is not enabled in configuration');
        }
        // Calculate base payment (fan count * base rate)
        let basePayment = winner.fanCount * config.baseRate;
        // Apply max fan cap if configured
        if (config.maxFanForCalculation > 0 && winner.fanCount > config.maxFanForCalculation) {
            basePayment = config.maxFanForCalculation * config.baseRate;
        }
        // Apply per-loser payment cap if configured
        if (config.maxPaymentPerLoser > 0 && basePayment > config.maxPaymentPerLoser) {
            basePayment = config.maxPaymentPerLoser;
        }
        // CONFIRMED Q2: All 3 other players must pay
        const payments = [];
        if (config.paymentModes.selfDraw.allMustPay) {
            for (const position of allPositions) {
                if (position !== winner.position) {
                    payments.push({
                        position,
                        amountToPay: basePayment,
                        reason: 'self-draw'
                    });
                }
            }
        }
        const totalReceived = basePayment * 3; // 3 losers, each pays basePayment
        return { payments, totalReceived };
    }
}
/**
 * Full Payment (Pao) Calculator
 * When a specific player is liable for all payments (e.g., Kong liability)
 */
export class FullPaymentCalculator {
    /**
     * Calculate payment where one player is liable for all
     * @param winner Winner information
     * @param liabilityPlayer Player responsible for all payments
     * @param allPositions All player positions
     * @param config Payment configuration
     * @returns Payment breakdown
     */
    static calculate(winner, liabilityPlayer, allPositions, config) {
        if (!config.paymentModes.fullPayment.enabled) {
            throw new Error('Full payment mode is not enabled in configuration');
        }
        if (liabilityPlayer === winner.position) {
            throw new Error('Liability player cannot be the winner');
        }
        // Calculate payment per losing player
        let basePayment = winner.fanCount * config.baseRate;
        // Apply max fan cap if configured
        if (config.maxFanForCalculation > 0 && winner.fanCount > config.maxFanForCalculation) {
            basePayment = config.maxFanForCalculation * config.baseRate;
        }
        // For full payment, liability player pays for all 3 losers
        const totalLiability = basePayment * 3;
        // Apply per-loser payment cap if configured (cap applied per loser portion)
        let cappedTotalLiability = totalLiability;
        if (config.maxPaymentPerLoser > 0) {
            cappedTotalLiability = Math.min(totalLiability, config.maxPaymentPerLoser * 3);
        }
        // Only the liability player pays
        const payments = [
            {
                position: liabilityPlayer,
                amountToPay: cappedTotalLiability,
                reason: 'full_payment_liability'
            }
        ];
        const totalReceived = cappedTotalLiability;
        return { payments, totalReceived };
    }
}
/**
 * Universal Payment Calculator
 * Routes to the appropriate calculator based on payment mode
 */
export class UniversalPaymentCalculator {
    /**
     * Calculate payment based on mode
     */
    static calculate(winner, discarder, liabilityPlayer, allPositions, config) {
        switch (winner.paymentMode) {
            case PaymentMode.DISCARD:
                if (!discarder) {
                    throw new Error('Discarder information required for DISCARD payment mode');
                }
                return DiscardPaymentCalculator.calculate(winner, discarder, config);
            case PaymentMode.SELF_DRAW:
                return SelfDrawPaymentCalculator.calculate(winner, allPositions, config);
            case PaymentMode.FULL_PAYMENT:
                if (!liabilityPlayer) {
                    throw new Error('Liability player required for FULL_PAYMENT mode');
                }
                return FullPaymentCalculator.calculate(winner, liabilityPlayer, allPositions, config);
            default:
                throw new Error(`Unknown payment mode: ${winner.paymentMode}`);
        }
    }
}
