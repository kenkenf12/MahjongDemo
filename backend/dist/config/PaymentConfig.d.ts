/**
 * Payment Configuration Management
 *
 * CONFIRMED BUSINESS RULES (Q1-Q5):
 * Q1: Only discarder pays (not all losers)
 * Q2: Self-draw - all 3 players pay equally
 * Q3: No Kong-specific liability (Pao separate)
 * Q4: Payments capped at max fan amount
 * Q5: No dealer multipliers (simple consistent calculation)
 */
import { PaymentConfig } from '../types';
/**
 * Validates payment configuration
 * @throws Error if configuration is invalid
 */
export declare function validatePaymentConfig(config: PaymentConfig): boolean;
/**
 * Gets the default payment configuration
 */
export declare function getDefaultConfig(): PaymentConfig;
/**
 * Creates a custom payment configuration
 */
export declare function createPaymentConfig(overrides?: Partial<PaymentConfig>): PaymentConfig;
/**
 * Merges two payment configurations
 */
export declare function mergePaymentConfigs(base: PaymentConfig, override: Partial<PaymentConfig>): PaymentConfig;
/**
 * Exports configuration as JSON string
 */
export declare function exportConfigAsJson(config: PaymentConfig): string;
/**
 * Loads configuration from JSON string
 */
export declare function loadConfigFromJson(jsonString: string): PaymentConfig;
//# sourceMappingURL=PaymentConfig.d.ts.map