/**
 * Self-Draw Win Payment Tests
 *
 * CONFIRMED RULE Q2: Each of 3 other players pays equally
 *
 * Tests the self-draw win payment mode where:
 * - Winner draws from wall to complete hand
 * - All 3 other players must pay equally
 * - No dealer multiplier (Q5 confirmed)
 */

import { SettlementEngine } from '../../src/game/Settlement';
import { PaymentMode, DEFAULT_PAYMENT_CONFIG } from '../../src/types';
import { createPaymentConfig } from '../../src/config/PaymentConfig';

describe('Self-Draw Win Payment (Q2 Confirmed)', () => {
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

  describe('Q2 Rule: All 3 Players Pay Equally', () => {
    test('should have all 3 other players in payments', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 2,
          paymentMode: PaymentMode.SELF_DRAW
        },
        null,
        null,
        allPositions
      );

      expect(result.validation.isValid).toBe(true);
      expect(Object.keys(result.payments)).toHaveLength(3);
      expect(result.payments['South']).toBeDefined();
      expect(result.payments['West']).toBeDefined();
      expect(result.payments['North']).toBeDefined();
    });

    test('should not include winner in payments', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 2,
          paymentMode: PaymentMode.SELF_DRAW
        },
        null,
        null,
        allPositions
      );

      expect(result.payments['East']).toBeUndefined();
    });

    test('should have equal payment amounts for all 3 players', () => {
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

      const payments = Object.values(result.payments);
      expect(payments[0].amountToPay).toBe(3);
      expect(payments[1].amountToPay).toBe(3);
      expect(payments[2].amountToPay).toBe(3);
    });
  });

  describe('Payment Calculation', () => {
    test('should calculate total as fan * base rate * 3', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 2,
          paymentMode: PaymentMode.SELF_DRAW
        },
        null,
        null,
        allPositions
      );

      // Each of 3 pays 2, total = 6
      expect(result.winner.totalReceived).toBe(6); // 2 fan * 1 base rate * 3 players
    });

    test('should calculate correctly for 1 fan', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 1,
          paymentMode: PaymentMode.SELF_DRAW
        },
        null,
        null,
        allPositions
      );

      expect(result.winner.totalReceived).toBe(3); // 1 fan * 1 base rate * 3 players
      Object.values(result.payments).forEach(payment => {
        expect(payment.amountToPay).toBe(1);
      });
    });

    test('should calculate correctly for 5 fan', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 5,
          paymentMode: PaymentMode.SELF_DRAW
        },
        null,
        null,
        allPositions
      );

      expect(result.winner.totalReceived).toBe(15); // 5 fan * 1 base rate * 3 players
      Object.values(result.payments).forEach(payment => {
        expect(payment.amountToPay).toBe(5);
      });
    });

    test('should apply custom base rate', () => {
      const config = createPaymentConfig({ baseRate: 2 });
      const customEngine = new SettlementEngine(config);

      const result = customEngine.calculateSettlement(
        {
          position: 'East',
          fanCount: 3,
          paymentMode: PaymentMode.SELF_DRAW
        },
        null,
        null,
        allPositions
      );

      // Each of 3 pays 6 (3 fan * 2 base rate), total = 18
      expect(result.winner.totalReceived).toBe(18);
      Object.values(result.payments).forEach(payment => {
        expect(payment.amountToPay).toBe(6);
      });
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
          paymentMode: PaymentMode.SELF_DRAW
        },
        null,
        null,
        allPositions
      );

      // Each pays 5 (capped), total = 15
      expect(result.details.cappedAmount).toBe(5);
      expect(result.winner.totalReceived).toBe(15); // 5 * 3 players
      Object.values(result.payments).forEach(payment => {
        expect(payment.amountToPay).toBe(5);
      });
    });

    test('should not apply cap when fan is below maximum', () => {
      const config = createPaymentConfig({ maxFanForCalculation: 5 });
      const customEngine = new SettlementEngine(config);

      const result = customEngine.calculateSettlement(
        {
          position: 'East',
          fanCount: 3,
          paymentMode: PaymentMode.SELF_DRAW
        },
        null,
        null,
        allPositions
      );

      expect(result.details.cappedAmount).toBe(3);
      expect(result.winner.totalReceived).toBe(9); // 3 * 3 players
    });

    test('should not apply cap when maxFanForCalculation is 0', () => {
      const config = createPaymentConfig({ maxFanForCalculation: 0 }); // 0 = no cap
      const customEngine = new SettlementEngine(config);

      const result = customEngine.calculateSettlement(
        {
          position: 'East',
          fanCount: 100,
          paymentMode: PaymentMode.SELF_DRAW
        },
        null,
        null,
        allPositions
      );

      expect(result.winner.totalReceived).toBe(300); // 100 * 3 players
      Object.values(result.payments).forEach(payment => {
        expect(payment.amountToPay).toBe(100);
      });
    });
  });

  describe('Per-Loser Payment Cap', () => {
    test('should apply per-loser cap to each payment', () => {
      const config = createPaymentConfig({ maxPaymentPerLoser: 10 });
      const customEngine = new SettlementEngine(config);

      const result = customEngine.calculateSettlement(
        {
          position: 'East',
          fanCount: 20,
          paymentMode: PaymentMode.SELF_DRAW
        },
        null,
        null,
        allPositions
      );

      // Each player capped at 10, total = 30
      expect(result.winner.totalReceived).toBe(30); // 10 * 3 players
      Object.values(result.payments).forEach(payment => {
        expect(payment.amountToPay).toBe(10);
      });
    });
  });

  describe('No Dealer Multiplier (Q5 Confirmed)', () => {
    test('should not apply dealer multiplier when East wins', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East', // Traditional dealer position
          fanCount: 2,
          paymentMode: PaymentMode.SELF_DRAW
        },
        null,
        null,
        allPositions
      );

      // Should be same as non-dealer: 2 * 3 = 6
      expect(result.winner.totalReceived).toBe(6);
    });

    test('should not apply different rates for different positions', () => {
      const resultEast = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 2,
          paymentMode: PaymentMode.SELF_DRAW
        },
        null,
        null,
        allPositions
      );

      const resultSouth = engine.calculateSettlement(
        {
          position: 'South',
          fanCount: 2,
          paymentMode: PaymentMode.SELF_DRAW
        },
        null,
        null,
        allPositions
      );

      expect(resultEast.winner.totalReceived).toBe(resultSouth.winner.totalReceived);
    });
  });

  describe('All Position Combinations', () => {
    test('should work when East wins', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 2,
          paymentMode: PaymentMode.SELF_DRAW
        },
        null,
        null,
        allPositions
      );

      expect(result.payments['South']).toBeDefined();
      expect(result.payments['West']).toBeDefined();
      expect(result.payments['North']).toBeDefined();
      expect(result.winner.totalReceived).toBe(6);
    });

    test('should work when South wins', () => {
      const result = engine.calculateSettlement(
        {
          position: 'South',
          fanCount: 2,
          paymentMode: PaymentMode.SELF_DRAW
        },
        null,
        null,
        allPositions
      );

      expect(result.payments['East']).toBeDefined();
      expect(result.payments['West']).toBeDefined();
      expect(result.payments['North']).toBeDefined();
    });

    test('should work when West wins', () => {
      const result = engine.calculateSettlement(
        {
          position: 'West',
          fanCount: 2,
          paymentMode: PaymentMode.SELF_DRAW
        },
        null,
        null,
        allPositions
      );

      expect(result.payments['East']).toBeDefined();
      expect(result.payments['South']).toBeDefined();
      expect(result.payments['North']).toBeDefined();
    });

    test('should work when North wins', () => {
      const result = engine.calculateSettlement(
        {
          position: 'North',
          fanCount: 2,
          paymentMode: PaymentMode.SELF_DRAW
        },
        null,
        null,
        allPositions
      );

      expect(result.payments['East']).toBeDefined();
      expect(result.payments['South']).toBeDefined();
      expect(result.payments['West']).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    test('should handle 1 fan (minimum)', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 1,
          paymentMode: PaymentMode.SELF_DRAW
        },
        null,
        null,
        allPositions
      );

      expect(result.validation.isValid).toBe(true);
      expect(result.winner.totalReceived).toBe(3); // 1 * 3
    });

    test('should handle high fan count', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 50,
          paymentMode: PaymentMode.SELF_DRAW
        },
        null,
        null,
        allPositions
      );

      expect(result.validation.isValid).toBe(true);
      expect(result.winner.totalReceived).toBe(150); // 50 * 3
    });

    test('should include reason in payments', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 2,
          paymentMode: PaymentMode.SELF_DRAW
        },
        null,
        null,
        allPositions
      );

      Object.values(result.payments).forEach(payment => {
        expect(payment.reason).toBe('self-draw');
      });
    });
  });

  describe('Validation', () => {
    test('should mark settlement valid', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 2,
          paymentMode: PaymentMode.SELF_DRAW
        },
        null,
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
          paymentMode: PaymentMode.SELF_DRAW
        },
        null,
        null,
        allPositions
      );

      const totalPaid = Object.values(result.payments).reduce(
        (sum, p) => sum + p.amountToPay,
        0
      );
      expect(totalPaid).toBe(result.winner.totalReceived);
    });

    test('should have exactly 3 payments', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 2,
          paymentMode: PaymentMode.SELF_DRAW
        },
        null,
        null,
        allPositions
      );

      expect(Object.keys(result.payments)).toHaveLength(3);
    });
  });
});
