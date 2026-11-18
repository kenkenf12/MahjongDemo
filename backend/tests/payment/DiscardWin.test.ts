/**
 * Discard Win Payment Tests
 *
 * CONFIRMED RULE Q1: Only discarder pays, not all losers
 *
 * Tests the discard win payment mode where:
 * - Winner claims another player's discarded tile
 * - Only the discarder pays the winner
 * - Other 2 players do not pay
 */

import { SettlementEngine } from '../../src/game/Settlement';
import { PaymentMode, DEFAULT_PAYMENT_CONFIG } from '../../src/types';
import { createPaymentConfig } from '../../src/config/PaymentConfig';

describe('Discard Win Payment (Q1 Confirmed)', () => {
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

  describe('Q1 Rule: Only Discarder Pays', () => {
    test('should have only discarder in payments (not all 3 losers)', () => {
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

      expect(result.validation.isValid).toBe(true);
      expect(Object.keys(result.payments)).toHaveLength(1);
      expect(result.payments['South']).toBeDefined();
    });

    test('should only include discarder, not West or North', () => {
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

      expect(result.payments['West']).toBeUndefined();
      expect(result.payments['North']).toBeUndefined();
      expect(result.payments['East']).toBeUndefined(); // Winner doesn't pay
    });
  });

  describe('Payment Calculation', () => {
    test('should calculate payment as fan * base rate', () => {
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

      expect(result.payments['South'].amountToPay).toBe(2); // 2 fan * 1 base rate
      expect(result.winner.totalReceived).toBe(2);
    });

    test('should apply base rate correctly for 1 fan', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 1,
          paymentMode: PaymentMode.DISCARD
        },
        { position: 'South' },
        null,
        allPositions
      );

      expect(result.payments['South'].amountToPay).toBe(1); // 1 fan * 1 base rate
      expect(result.winner.totalReceived).toBe(1);
    });

    test('should apply base rate correctly for 3 fan', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 3,
          paymentMode: PaymentMode.DISCARD
        },
        { position: 'South' },
        null,
        allPositions
      );

      expect(result.payments['South'].amountToPay).toBe(3); // 3 fan * 1 base rate
      expect(result.winner.totalReceived).toBe(3);
    });

    test('should apply custom base rate', () => {
      const config = createPaymentConfig({ baseRate: 2 });
      const customEngine = new SettlementEngine(config);

      const result = customEngine.calculateSettlement(
        {
          position: 'East',
          fanCount: 2,
          paymentMode: PaymentMode.DISCARD
        },
        { position: 'South' },
        null,
        allPositions
      );

      expect(result.payments['South'].amountToPay).toBe(4); // 2 fan * 2 base rate
      expect(result.winner.totalReceived).toBe(4);
    });
  });

  describe('Fan Cap (Q4 Confirmed)', () => {
    test('should apply fan cap when fan exceeds maximum', () => {
      const config = createPaymentConfig({ maxFanForCalculation: 5 });
      const customEngine = new SettlementEngine(config);

      const result = customEngine.calculateSettlement(
        {
          position: 'East',
          fanCount: 8,
          paymentMode: PaymentMode.DISCARD
        },
        { position: 'South' },
        null,
        allPositions
      );

      expect(result.details.cappedAmount).toBe(5); // Capped at 5 fan
      expect(result.payments['South'].amountToPay).toBe(5);
      expect(result.winner.totalReceived).toBe(5);
    });

    test('should not apply cap when fan is below maximum', () => {
      const config = createPaymentConfig({ maxFanForCalculation: 5 });
      const customEngine = new SettlementEngine(config);

      const result = customEngine.calculateSettlement(
        {
          position: 'East',
          fanCount: 3,
          paymentMode: PaymentMode.DISCARD
        },
        { position: 'South' },
        null,
        allPositions
      );

      expect(result.details.cappedAmount).toBe(3);
      expect(result.payments['South'].amountToPay).toBe(3);
    });

    test('should not apply cap when maxFanForCalculation is 0', () => {
      const config = createPaymentConfig({ maxFanForCalculation: 0 }); // 0 = no cap
      const customEngine = new SettlementEngine(config);

      const result = customEngine.calculateSettlement(
        {
          position: 'East',
          fanCount: 100,
          paymentMode: PaymentMode.DISCARD
        },
        { position: 'South' },
        null,
        allPositions
      );

      expect(result.payments['South'].amountToPay).toBe(100);
      expect(result.winner.totalReceived).toBe(100);
    });
  });

  describe('Per-Loser Payment Cap', () => {
    test('should apply per-loser cap if configured', () => {
      const config = createPaymentConfig({ maxPaymentPerLoser: 10 });
      const customEngine = new SettlementEngine(config);

      const result = customEngine.calculateSettlement(
        {
          position: 'East',
          fanCount: 20,
          paymentMode: PaymentMode.DISCARD
        },
        { position: 'South' },
        null,
        allPositions
      );

      expect(result.payments['South'].amountToPay).toBe(10); // Capped at per-loser max
      expect(result.winner.totalReceived).toBe(10);
    });

    test('should not apply per-loser cap when 0', () => {
      const config = createPaymentConfig({ maxPaymentPerLoser: 0 }); // 0 = no cap
      const customEngine = new SettlementEngine(config);

      const result = customEngine.calculateSettlement(
        {
          position: 'East',
          fanCount: 100,
          paymentMode: PaymentMode.DISCARD
        },
        { position: 'South' },
        null,
        allPositions
      );

      expect(result.payments['South'].amountToPay).toBe(100);
    });
  });

  describe('All Position Combinations', () => {
    test('should work when East discards', () => {
      const result = engine.calculateSettlement(
        {
          position: 'South',
          fanCount: 2,
          paymentMode: PaymentMode.DISCARD
        },
        { position: 'East' },
        null,
        allPositions
      );

      expect(result.payments['East']).toBeDefined();
      expect(result.payments['East'].amountToPay).toBe(2);
    });

    test('should work when South discards', () => {
      const result = engine.calculateSettlement(
        {
          position: 'West',
          fanCount: 2,
          paymentMode: PaymentMode.DISCARD
        },
        { position: 'South' },
        null,
        allPositions
      );

      expect(result.payments['South']).toBeDefined();
      expect(result.payments['South'].amountToPay).toBe(2);
    });

    test('should work when West discards', () => {
      const result = engine.calculateSettlement(
        {
          position: 'North',
          fanCount: 2,
          paymentMode: PaymentMode.DISCARD
        },
        { position: 'West' },
        null,
        allPositions
      );

      expect(result.payments['West']).toBeDefined();
      expect(result.payments['West'].amountToPay).toBe(2);
    });

    test('should work when North discards', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 2,
          paymentMode: PaymentMode.DISCARD
        },
        { position: 'North' },
        null,
        allPositions
      );

      expect(result.payments['North']).toBeDefined();
      expect(result.payments['North'].amountToPay).toBe(2);
    });
  });

  describe('Edge Cases', () => {
    test('should handle 1 fan (minimum)', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 1,
          paymentMode: PaymentMode.DISCARD
        },
        { position: 'South' },
        null,
        allPositions
      );

      expect(result.validation.isValid).toBe(true);
      expect(result.payments['South'].amountToPay).toBe(1);
    });

    test('should handle high fan count', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 50,
          paymentMode: PaymentMode.DISCARD
        },
        { position: 'South' },
        null,
        allPositions
      );

      expect(result.validation.isValid).toBe(true);
      expect(result.payments['South'].amountToPay).toBe(50);
    });

    test('should include reason in payment', () => {
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

      expect(result.payments['South'].reason).toBe('discard');
    });
  });

  describe('Validation', () => {
    test('should mark settlement valid when calculation succeeds', () => {
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

      expect(result.validation.isValid).toBe(true);
      expect(result.validation.errors).toHaveLength(0);
    });

    test('should ensure total paid equals total received', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 3,
          paymentMode: PaymentMode.DISCARD
        },
        { position: 'South' },
        null,
        allPositions
      );

      const totalPaid = Object.values(result.payments).reduce(
        (sum, p) => sum + p.amountToPay,
        0
      );
      expect(totalPaid).toBe(result.winner.totalReceived);
    });
  });
});
