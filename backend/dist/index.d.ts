/**
 * Mahjong Payment Calculator - Main Export
 *
 * This module exports all public APIs for calculating payments in Hong Kong Mahjong.
 *
 * CONFIRMED BUSINESS RULES:
 * Q1: Only discarder pays in DISCARD mode
 * Q2: All 3 players pay equally in SELF_DRAW mode
 * Q3: Separate FULL_PAYMENT mode for Pao liability
 * Q4: Payments capped at max fan amount
 * Q5: No dealer multipliers (simple consistent calculation)
 */
export { PaymentMode, Position, WinnerInfo, DiscardInfo, PlayerPaymentInfo, SettlementResult, ValidationResult, PaymentConfig, PaymentModeConfig, DEFAULT_PAYMENT_CONFIG } from './types.js';
export { validatePaymentConfig, getDefaultConfig, createPaymentConfig, mergePaymentConfigs, exportConfigAsJson, loadConfigFromJson } from './config/PaymentConfig.js';
export { DiscardPaymentCalculator, SelfDrawPaymentCalculator, FullPaymentCalculator, UniversalPaymentCalculator } from './game/PaymentCalculator.js';
export { SettlementEngine, createSettlementEngine } from './game/Settlement.js';
export { HandValidator } from './game/HandValidator.js';
export type { ValidationResult as HandValidationResult } from './game/HandValidator.js';
export { FanCalculator, FanBreakdown } from './game/FanCalculator.js';
export { Meld, MeldType, Pair, HandPattern, createChow, createPong, createKong, createPair, getMeldFanValue, getBonusFanValue } from './models/Meld.js';
export { Wall } from './game/Wall.js';
//# sourceMappingURL=index.d.ts.map