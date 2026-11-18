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
import { Position, WinnerInfo, DiscardInfo, SettlementResult, PaymentConfig } from '../types';
/**
 * Main Settlement Engine
 */
export declare class SettlementEngine {
    private config;
    constructor(config: PaymentConfig);
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
    calculateSettlement(winner: WinnerInfo, discarder: DiscardInfo | null, liabilityPlayer: Position | null, allPositions: Position[]): SettlementResult;
    /**
     * Validate input parameters
     */
    private validateInputs;
    /**
     * Validate the settlement result
     */
    private validateSettlement;
    /**
     * Apply payment cap to amount
     */
    private applyCap;
    /**
     * Update configuration
     */
    updateConfig(newConfig: PaymentConfig): void;
    /**
     * Get current configuration
     */
    getConfig(): PaymentConfig;
}
/**
 * Factory function to create a settlement engine with default config
 */
export declare function createSettlementEngine(config: PaymentConfig): SettlementEngine;
//# sourceMappingURL=Settlement.d.ts.map