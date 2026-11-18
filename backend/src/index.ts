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

// Core types
export {
  PaymentMode,
  Position,
  WinnerInfo,
  DiscardInfo,
  PlayerPaymentInfo,
  SettlementResult,
  ValidationResult,
  PaymentConfig,
  PaymentModeConfig,
  DEFAULT_PAYMENT_CONFIG
} from './types';

// Configuration
export {
  validatePaymentConfig,
  getDefaultConfig,
  createPaymentConfig,
  mergePaymentConfigs,
  exportConfigAsJson,
  loadConfigFromJson
} from './config/PaymentConfig';

// Payment Calculators
export {
  DiscardPaymentCalculator,
  SelfDrawPaymentCalculator,
  FullPaymentCalculator,
  UniversalPaymentCalculator
} from './game/PaymentCalculator';

// Settlement Engine
export { SettlementEngine, createSettlementEngine } from './game/Settlement';

// Stage 1: Hand Validation & Scoring
export { HandValidator } from './game/HandValidator';
export type { ValidationResult as HandValidationResult } from './game/HandValidator';
export { FanCalculator, FanBreakdown } from './game/FanCalculator';
export { 
  Meld, 
  MeldType, 
  Pair, 
  HandPattern, 
  createChow, 
  createPong, 
  createKong, 
  createPair,
  getMeldFanValue,
  getBonusFanValue
} from './models/Meld';

// Stage 1: Wall & Dealing
export { Wall } from './game/Wall';
