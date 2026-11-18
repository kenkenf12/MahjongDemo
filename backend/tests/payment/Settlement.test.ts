/**
 * Settlement Engine Unit Tests
 *
 * Tests core settlement calculation logic without mode-specific behavior.
 * Validates: input validation, calculation, cap application, error handling.
 */

import { SettlementEngine } from '../../src/game/Settlement';
import { PaymentMode, DEFAULT_PAYMENT_CONFIG } from '../../src/types';

describe('SettlementEngine', () => {
  let engine: SettlementEngine;
  const allPositions: Array<'East' | 'South' | 'West' | 'North'> = [
    'East',
    'South',
    'West',
    'North'
  ];

  beforeEach(() => {
    engine = new SettlementEngine(DEFAULT_PAYMENT_CONFIG);
  });

  describe('Input Validation', () => {
    test('should reject missing winner position', () => {
      const result = engine.calculateSettlement(
        {
          position: '' as any,
          fanCount: 2,
          paymentMode: PaymentMode.DISCARD
        },
        { position: 'South' },
        null,
        allPositions
      );

      expect(result.validation.isValid).toBe(false);
      expect(result.validation.errors.length).toBeGreaterThan(0);
    });

    test('should reject fan count less than 1', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 0,
          paymentMode: PaymentMode.DISCARD
        },
        { position: 'South' },
        null,
        allPositions
      );

      expect(result.validation.isValid).toBe(false);
      expect(result.validation.errors.some(e => e.includes('fan count'))).toBe(true);
    });

    test('should reject negative fan count', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: -1,
          paymentMode: PaymentMode.DISCARD
        },
        { position: 'South' },
        null,
        allPositions
      );

      expect(result.validation.isValid).toBe(false);
    });

    test('should warn on unusually high fan count', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 101,
          paymentMode: PaymentMode.DISCARD
        },
        { position: 'South' },
        null,
        allPositions
      );

      expect(result.validation.warnings.some(w => w.includes('Unusually high'))).toBe(true);
    });

    test('should reject invalid payment mode', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 2,
          paymentMode: 'invalid' as any
        },
        { position: 'South' },
        null,
        allPositions
      );

      expect(result.validation.isValid).toBe(false);
      expect(result.validation.errors.some(e => e.includes('Invalid payment mode'))).toBe(true);
    });

    test('should reject discarder missing for DISCARD mode', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 2,
          paymentMode: PaymentMode.DISCARD
        },
        null,
        null,
        allPositions
      );

      expect(result.validation.isValid).toBe(false);
      expect(result.validation.errors.some(e => e.includes('Discarder'))).toBe(true);
    });

    test('should reject liability player missing for FULL_PAYMENT mode', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 2,
          paymentMode: PaymentMode.FULL_PAYMENT
        },
        null,
        null,
        allPositions
      );

      expect(result.validation.isValid).toBe(false);
      expect(result.validation.errors.some(e => e.includes('Liability player'))).toBe(true);
    });

    test('should reject when discarder is winner', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 2,
          paymentMode: PaymentMode.DISCARD
        },
        { position: 'East' },
        null,
        allPositions
      );

      expect(result.validation.isValid).toBe(false);
      expect(result.validation.errors.some(e => e.includes('cannot be the winner'))).toBe(true);
    });

    test('should reject when liability player is winner', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 2,
          paymentMode: PaymentMode.FULL_PAYMENT
        },
        null,
        'East',
        allPositions
      );

      expect(result.validation.isValid).toBe(false);
      expect(result.validation.errors.some(e => e.includes('Liability player'))).toBe(true);
    });

    test('should reject wrong number of positions', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 2,
          paymentMode: PaymentMode.DISCARD
        },
        { position: 'South' },
        null,
        ['East', 'South', 'West'] as any
      );

      expect(result.validation.isValid).toBe(false);
      expect(result.validation.errors.some(e => e.includes('Exactly 4 player'))).toBe(true);
    });

    test('should reject duplicate positions', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 2,
          paymentMode: PaymentMode.DISCARD
        },
        { position: 'South' },
        null,
        ['East', 'East', 'West', 'North'] as any
      );

      expect(result.validation.isValid).toBe(false);
      expect(result.validation.errors.some(e => e.includes('unique'))).toBe(true);
    });
  });

  describe('Configuration Management', () => {
    test('should use provided configuration', () => {
      const config = { ...DEFAULT_PAYMENT_CONFIG, baseRate: 2 };
      const customEngine = new SettlementEngine(config);
      expect(customEngine.getConfig().baseRate).toBe(2);
    });

    test('should update configuration', () => {
      const newConfig = { ...DEFAULT_PAYMENT_CONFIG, baseRate: 3 };
      engine.updateConfig(newConfig);
      expect(engine.getConfig().baseRate).toBe(3);
    });

    test('should return config copy not reference', () => {
      const config1 = engine.getConfig();
      config1.baseRate = 999;
      const config2 = engine.getConfig();
      expect(config2.baseRate).toBe(DEFAULT_PAYMENT_CONFIG.baseRate);
    });
  });

  describe('Settlement Result Structure', () => {
    test('should return valid settlement structure', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 2,
          paymentMode: PaymentMode.DISCARD
        },
        { position: 'South' },
        null,
        allPositions
      );

      expect(result).toHaveProperty('winner');
      expect(result).toHaveProperty('payments');
      expect(result).toHaveProperty('details');
      expect(result).toHaveProperty('validation');
    });

    test('should include correct details in result', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 2,
          paymentMode: PaymentMode.DISCARD
        },
        { position: 'South' },
        null,
        allPositions
      );

      expect(result.details.fanCount).toBe(2);
      expect(result.details.paymentMode).toBe(PaymentMode.DISCARD);
      expect(result.details.baseAmount).toBe(2); // 2 fan * 1 base rate
    });

    test('should include winner info in result', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 3,
          paymentMode: PaymentMode.SELF_DRAW
        },
        null,
        null,
        allPositions
      );

      expect(result.winner.position).toBe('East');
      expect(result.winner.totalReceived).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle unexpected errors gracefully', () => {
      // Create a scenario that would cause a runtime error
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 2,
          paymentMode: PaymentMode.DISCARD
        },
        { position: 'InvalidPosition' as any },
        null,
        allPositions
      );

      // Should not crash, should return error in validation
      expect(result).toBeDefined();
    });

    test('should populate error array when calculation fails', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 2,
          paymentMode: PaymentMode.DISCARD
        },
        { position: 'InvalidPosition' as any },
        null,
        allPositions
      );

      expect(result.validation.errors.length).toBeGreaterThan(0);
    });
  });
});
