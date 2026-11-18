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
export enum PaymentMode {
  DISCARD = 'discard',
  SELF_DRAW = 'self_draw',
  FULL_PAYMENT = 'full_payment'
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
  reason: string; // e.g., "discard", "self-draw", "discarder"
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
    onlyDiscarderpays: boolean; // true = only discarder pays, false = all losers pay
  };
  selfDraw: {
    enabled: boolean;
    allMustPay: boolean; // true = all 3 must pay, false = only losers
  };
  fullPayment: {
    enabled: boolean;
    liabilityPlayer?: Position; // Player responsible for all payments
  };
}

/**
 * Payment configuration
 */
export interface PaymentConfig {
  // Base rate: points per fan (no dealer multiplier as per confirmed rules)
  baseRate: number;

  // Maximum fan cap: payments capped at this many fan
  maxFanForCalculation: number;

  // Maximum payment cap: payments capped at this amount (0 = no cap)
  maxPaymentPerLoser: number;

  // Payment mode settings
  paymentModes: PaymentModeConfig;
}

/**
 * Default payment configuration (uses confirmed business rules)
 */
export const DEFAULT_PAYMENT_CONFIG: PaymentConfig = {
  baseRate: 1,
  maxFanForCalculation: 0, // 0 means no limit (Q4 cap is configurable)
  maxPaymentPerLoser: 0, // 0 means no per-loser cap
  paymentModes: {
    discard: {
      enabled: true,
      onlyDiscarderpays: true // CONFIRMED: Q1 - Only discarder pays
    },
    selfDraw: {
      enabled: true,
      allMustPay: true // CONFIRMED: Q2 - All 3 players pay
    },
    fullPayment: {
      enabled: true
    }
  }
};
