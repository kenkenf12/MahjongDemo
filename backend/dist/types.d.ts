/**
 * Core type definitions for the Mahjong payment calculator
 */
/**
 * Player positions at the table
 */
export type Position = 'East' | 'South' | 'West' | 'North';
/**
 * Payment mode enumeration
 * - DISCARD: Winner claims another player's discarded tile
 * - SELF_DRAW: Winner draws from wall to complete hand
 * - FULL_PAYMENT: Special payment mode for Pao liability (separate liability player)
 */
export declare enum PaymentMode {
    DISCARD = "discard",
    SELF_DRAW = "self_draw",
    FULL_PAYMENT = "full_payment"
}
/**
 * Information about the winning player
 */
export interface WinnerInfo {
    position: Position;
    fanCount: number;
    paymentMode: PaymentMode;
}
/**
 * Information about the discarder (only relevant for DISCARD mode)
 */
export interface DiscardInfo {
    position: Position;
}
/**
 * Information about a player losing/paying
 */
export interface PlayerPaymentInfo {
    position: Position;
    amountToPay: number;
    reason: string;
}
/**
 * Complete settlement breakdown for a winning round
 */
export interface SettlementResult {
    winner: {
        position: Position;
        totalReceived: number;
    };
    payments: {
        [position: string]: PlayerPaymentInfo;
    };
    details: {
        fanCount: number;
        paymentMode: PaymentMode;
        baseAmount: number;
        cappedAmount: number;
        maxFanCap: number;
    };
    validation: {
        isValid: boolean;
        errors: string[];
        warnings: string[];
    };
}
/**
 * Validation result for payment amounts
 */
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}
/**
 * Configuration for payment calculation modes
 */
export interface PaymentModeConfig {
    discard: {
        enabled: boolean;
        onlyDiscarderpays: boolean;
    };
    selfDraw: {
        enabled: boolean;
        allMustPay: boolean;
    };
    fullPayment: {
        enabled: boolean;
        liabilityPlayer?: Position;
    };
}
/**
 * Payment configuration
 */
export interface PaymentConfig {
    baseRate: number;
    maxFanForCalculation: number;
    maxPaymentPerLoser: number;
    paymentModes: PaymentModeConfig;
}
/**
 * Default payment configuration (uses confirmed business rules)
 */
export declare const DEFAULT_PAYMENT_CONFIG: PaymentConfig;
//# sourceMappingURL=types.d.ts.map