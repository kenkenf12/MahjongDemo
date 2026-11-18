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
export { PaymentMode, DEFAULT_PAYMENT_CONFIG } from './types.js';
// Configuration
export { validatePaymentConfig, getDefaultConfig, createPaymentConfig, mergePaymentConfigs, exportConfigAsJson, loadConfigFromJson } from './config/PaymentConfig.js';
// Payment Calculators
export { DiscardPaymentCalculator, SelfDrawPaymentCalculator, FullPaymentCalculator, UniversalPaymentCalculator } from './game/PaymentCalculator.js';
// Settlement Engine
export { SettlementEngine, createSettlementEngine } from './game/Settlement.js';
// Stage 1: Hand Validation & Scoring
export { HandValidator } from './game/HandValidator.js';
export { FanCalculator } from './game/FanCalculator.js';
export { MeldType, createChow, createPong, createKong, createPair, getMeldFanValue, getBonusFanValue } from './models/Meld.js';
// Stage 1: Wall & Dealing
export { Wall } from './game/Wall.js';
