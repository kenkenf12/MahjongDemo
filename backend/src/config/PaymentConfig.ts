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

import { PaymentConfig, DEFAULT_PAYMENT_CONFIG } from '../types.js';

/**
 * Validates payment configuration
 * @throws Error if configuration is invalid
 */
export function validatePaymentConfig(config: PaymentConfig): boolean {
  const errors: string[] = [];

  // Validate base rate
  if (config.baseRate <= 0) {
    errors.push('baseRate must be greater than 0');
  }

  // Validate max fan
  if (config.maxFanForCalculation < 0) {
    errors.push('maxFanForCalculation must be >= 0 (0 = no limit)');
  }

  // Validate max payment
  if (config.maxPaymentPerLoser < 0) {
    errors.push('maxPaymentPerLoser must be >= 0 (0 = no limit)');
  }

  // Validate at least one mode is enabled
  const { discard, selfDraw, fullPayment } = config.paymentModes;
  if (!discard.enabled && !selfDraw.enabled && !fullPayment.enabled) {
    errors.push('At least one payment mode must be enabled');
  }

  if (errors.length > 0) {
    throw new Error(`Invalid payment configuration: ${errors.join('; ')}`);
  }

  return true;
}

/**
 * Gets the default payment configuration
 */
export function getDefaultConfig(): PaymentConfig {
  return JSON.parse(JSON.stringify(DEFAULT_PAYMENT_CONFIG));
}

/**
 * Creates a custom payment configuration
 */
export function createPaymentConfig(overrides: Partial<PaymentConfig> = {}): PaymentConfig {
  const config = {
    ...getDefaultConfig(),
    ...overrides,
    paymentModes: {
      ...getDefaultConfig().paymentModes,
      ...(overrides.paymentModes || {})
    }
  };

  validatePaymentConfig(config);
  return config;
}

/**
 * Merges two payment configurations
 */
export function mergePaymentConfigs(
  base: PaymentConfig,
  override: Partial<PaymentConfig>
): PaymentConfig {
  return createPaymentConfig({
    ...base,
    ...override
  });
}

/**
 * Exports configuration as JSON string
 */
export function exportConfigAsJson(config: PaymentConfig): string {
  return JSON.stringify(config, null, 2);
}

/**
 * Loads configuration from JSON string
 */
export function loadConfigFromJson(jsonString: string): PaymentConfig {
  try {
    const config = JSON.parse(jsonString) as PaymentConfig;
    validatePaymentConfig(config);
    return config;
  } catch (error) {
    throw new Error(`Failed to load payment configuration: ${error}`);
  }
}
