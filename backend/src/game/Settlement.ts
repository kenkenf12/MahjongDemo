/**
 * Settlement Orchestrator - Main payment calculation engine
 *
 * Coordinates the entire settlement process:
 * 1. Validates input data
 * 2. Determines payment mode
 * 3. Calculates payments
 * 4. Validates results
 * 5. Returns complete settlement
 *
 * Implements confirmed business rules (Q1-Q5):
 * Q1: Only discarder pays
 * Q2: All 3 players pay in self-draw
 * Q3: No Kong liability by default
 * Q4: Payments capped at max fan
 * Q5: No dealer multipliers
 */

import {
  PaymentMode,
  Position,
  WinnerInfo,
  DiscardInfo,
  SettlementResult,
  ValidationResult,
  PaymentConfig,
  PlayerPaymentInfo
} from '../types.js';
import { UniversalPaymentCalculator } from './PaymentCalculator.js';

/**
 * Main Settlement Engine
 */
export class SettlementEngine {
  private config: PaymentConfig;

  constructor(config: PaymentConfig) {
    this.config = config;
  }

  /**
   * Calculate complete settlement for a winning round
   *
   * @param winner Winner information (position, fan count, payment mode)
   * @param discarder Discarder information (required for DISCARD mode)
   * @param liabilityPlayer Liability player (optional, for FULL_PAYMENT mode)
   * @param allPositions All player positions (for self-draw calculation)
   * @returns Complete settlement with validation
   * @throws Error if parameters are invalid
   */
  calculateSettlement(
    winner: WinnerInfo,
    discarder: DiscardInfo | null,
    liabilityPlayer: Position | null,
    allPositions: Position[]
  ): SettlementResult {
    // Step 1: Validate inputs
    const inputValidation = this.validateInputs(
      winner,
      discarder,
      liabilityPlayer,
      allPositions
    );

    if (!inputValidation.isValid) {
      return {
        winner: {
          position: winner.position,
          totalReceived: 0
        },
        payments: {},
        details: {
          fanCount: winner.fanCount,
          paymentMode: winner.paymentMode,
          baseAmount: 0,
          cappedAmount: 0,
          maxFanCap: this.config.maxFanForCalculation
        },
        validation: inputValidation
      };
    }

    // Step 2: Calculate base payment
    const baseAmount = winner.fanCount * this.config.baseRate;

    // Step 3: Apply fan cap
    const cappedFan = this.applyCap(winner.fanCount, this.config.maxFanForCalculation);
    const cappedAmount = cappedFan * this.config.baseRate;

    try {
      // Step 4: Calculate mode-specific payments
      const { payments, totalReceived } = UniversalPaymentCalculator.calculate(
        winner,
        discarder,
        liabilityPlayer,
        allPositions,
        this.config
      );

      // Step 5: Convert payment array to map for result
      const paymentMap: { [position: string]: PlayerPaymentInfo } = {};
      for (const payment of payments) {
        paymentMap[payment.position] = payment;
      }

      // Step 6: Validate settlement
      const settlementValidation = this.validateSettlement(paymentMap, totalReceived);

      // Merge input warnings with settlement warnings
      const mergedValidation: ValidationResult = {
        isValid: settlementValidation.isValid,
        errors: settlementValidation.errors,
        warnings: [...inputValidation.warnings, ...settlementValidation.warnings]
      };

      return {
        winner: {
          position: winner.position,
          totalReceived
        },
        payments: paymentMap,
        details: {
          fanCount: winner.fanCount,
          paymentMode: winner.paymentMode,
          baseAmount,
          cappedAmount,
          maxFanCap: this.config.maxFanForCalculation
        },
        validation: mergedValidation
      };
    } catch (error) {
      return {
        winner: {
          position: winner.position,
          totalReceived: 0
        },
        payments: {},
        details: {
          fanCount: winner.fanCount,
          paymentMode: winner.paymentMode,
          baseAmount,
          cappedAmount,
          maxFanCap: this.config.maxFanForCalculation
        },
        validation: {
          isValid: false,
          errors: [`Settlement calculation failed: ${error}`],
          warnings: []
        }
      };
    }
  }

  /**
   * Validate input parameters
   */
  private validateInputs(
    winner: WinnerInfo,
    discarder: DiscardInfo | null,
    liabilityPlayer: Position | null,
    allPositions: Position[]
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate winner
    if (!winner || !winner.position) {
      errors.push('Winner position is required');
    }

    if (winner.fanCount < 1) {
      errors.push(`Winner fan count must be >= 1, got ${winner.fanCount}`);
    }

    if (winner.fanCount > 100) {
      warnings.push(`Unusually high fan count: ${winner.fanCount}`);
    }

    // Validate payment mode
    if (!Object.values(PaymentMode).includes(winner.paymentMode)) {
      errors.push(`Invalid payment mode: ${winner.paymentMode}`);
    }

    // Validate mode-specific requirements
    if (winner.paymentMode === PaymentMode.DISCARD && !discarder) {
      errors.push('Discarder information required for DISCARD payment mode');
    }

    if (winner.paymentMode === PaymentMode.FULL_PAYMENT && !liabilityPlayer) {
      errors.push('Liability player required for FULL_PAYMENT mode');
    }

    // Validate all positions
    if (!allPositions || allPositions.length !== 4) {
      errors.push('Exactly 4 player positions required');
    }

    if (allPositions.includes(winner.position)) {
      // Winner must be in all positions
    } else {
      errors.push(`Winner position ${winner.position} not in all positions`);
    }

    // Validate positions are unique
    if (new Set(allPositions).size !== 4) {
      errors.push('All positions must be unique');
    }

    // Validate discarder is in positions and not winner
    if (discarder) {
      if (!allPositions.includes(discarder.position)) {
        errors.push(`Discarder position ${discarder.position} not in all positions`);
      }
      if (discarder.position === winner.position) {
        errors.push('Discarder cannot be the winner');
      }
    }

    // Validate liability player is in positions and not winner
    if (liabilityPlayer) {
      if (!allPositions.includes(liabilityPlayer)) {
        errors.push(`Liability player ${liabilityPlayer} not in all positions`);
      }
      if (liabilityPlayer === winner.position) {
        errors.push('Liability player cannot be the winner');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate the settlement result
   */
  private validateSettlement(
    payments: { [position: string]: PlayerPaymentInfo },
    totalReceived: number
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check that winner received amount is positive
    if (totalReceived <= 0) {
      errors.push(`Winner must receive positive amount, got ${totalReceived}`);
    }

    // Check that all payments are non-negative
    for (const [position, payment] of Object.entries(payments)) {
      if (payment.amountToPay < 0) {
        errors.push(`Player ${position} has negative payment: ${payment.amountToPay}`);
      }
    }

    // Check total payments matches total received
    const totalPaid = Object.values(payments).reduce((sum, p) => sum + p.amountToPay, 0);
    if (totalPaid !== totalReceived) {
      errors.push(
        `Total paid (${totalPaid}) does not match total received (${totalReceived})`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Apply payment cap to amount
   */
  private applyCap(amount: number, cap: number): number {
    if (cap <= 0) return amount; // No cap
    return Math.min(amount, cap);
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: PaymentConfig): void {
    this.config = newConfig;
  }

  /**
   * Get current configuration
   */
  getConfig(): PaymentConfig {
    return { ...this.config };
  }
}

/**
 * Factory function to create a settlement engine with default config
 */
export function createSettlementEngine(config: PaymentConfig): SettlementEngine {
  return new SettlementEngine(config);
}
